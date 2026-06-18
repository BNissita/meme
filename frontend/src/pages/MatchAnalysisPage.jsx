import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, FileText, CheckCircle, XCircle, ChevronRight, 
  ArrowRight, Loader2, Sparkles, BarChart2, ShieldAlert 
} from 'lucide-react';

const MatchAnalysisPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' or 'ats'
  const navigate = useNavigate();

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/match/analyze');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to execute profile compatibility analysis.');
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    try {
      setLoading(true);
      const res = await api.post('/interview/start', { demoMode: true });
      if (res.data.success) {
        navigate('/interview-call');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to start interview.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-transparent border-b-violet-500 border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold animate-pulse">Running Match Engine & ATS Scanners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-2xl text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Analysis Required</h3>
        <p className="text-slate-400 text-xs">{error}</p>
        <div className="flex gap-4 justify-center pt-2">
          <button onClick={() => navigate('/resume')} className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 border border-slate-700 text-white">Upload Resume</button>
          <button onClick={() => navigate('/jd')} className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 text-black">Set Job Spec</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10 relative">
      <div className="absolute top-1/4 right-1/4 glow-dot-violet w-[250px] h-[250px]"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white">AI Compatibility Engine</h1>
          <p className="text-slate-400 text-sm mt-1">Analyzing match scores and ATS filters for: <span className="text-cyan-400 font-semibold">{data?.jobTitle}</span></p>
        </div>
        
        <button
  onClick={startInterview}
  disabled={(data?.matching?.matchScore || 0) < 60}
  className={`px-6 py-3.5 rounded-xl text-sm font-bold transition duration-200 flex items-center gap-1.5 shadow-glow-cyan
    ${
      (data?.matching?.matchScore || 0) >= 60
        ? "text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-95 cursor-pointer"
        : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
    }`}
>
  {(data?.matching?.matchScore || 0) >= 60
    ? "Proceed to Interview Room"
    : "Minimum 60% Match Required"}

  <ChevronRight className="h-5 w-5" />
</button>
{(data?.matching?.matchScore || 0) < 60 && (
  <div className="mt-3 text-xs text-amber-400 font-medium">
    Interview access is locked. Achieve at least 60% compatibility with the Job Description.
  </div>
)}
      </div>

      {/* Scores Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Match score card */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 glow-dot-cyan w-[150px] h-[150px]"></div>
          
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="h-4.5 w-4.5 text-yellow-400" />
            Job Match Compatibility
          </h3>

          {/* Circular progress container */}
          <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-slate-950/40 border border-slate-800">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                stroke="rgba(255,255,255,0.02)" 
                strokeWidth="10" 
                fill="transparent" 
              />
              <motion.circle 
                cx="80" 
                cy="80" 
                r="70" 
                stroke="#06b6d4" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="440"
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * (data?.matching?.matchScore || 0)) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-4xl font-extrabold text-white">{data?.matching?.matchScore}%</span>
          </div>

          <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
            Your skills compatibility score is based on matching direct technology keywords and background credentials in your resume against job specifications.
          </p>
        </div>

        {/* ATS score card */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 glow-dot-violet w-[150px] h-[150px]"></div>
          
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-cyan-400" />
              ATS Scanner Optimization
            </h3>
            <span className="text-2xl font-extrabold text-cyan-400">{data?.ats?.atsScore}%</span>
          </div>

          {/* ATS Breakdowns */}
          <div className="space-y-4">
            {/* keyword match */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Keyword Match Frequency</span>
                <span>{data?.ats?.keywordMatchScore}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <motion.div className="bg-cyan-500 h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${data?.ats?.keywordMatchScore || 0}%` }} transition={{ duration: 1 }} />
              </div>
            </div>

            {/* formatting */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Layout & Formatting Index</span>
                <span>{data?.ats?.formattingScore}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <motion.div className="bg-indigo-500 h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${data?.ats?.formattingScore || 0}%` }} transition={{ duration: 1 }} />
              </div>
            </div>

            {/* action verbs */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Action Verbs Ratio</span>
                <span>{data?.ats?.actionVerbsScore}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <motion.div className="bg-violet-500 h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${data?.ats?.actionVerbsScore || 0}%` }} transition={{ duration: 1 }} />
              </div>
            </div>

            {/* readability */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Readability Index</span>
                <span>{data?.ats?.readabilityScore}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <motion.div className="bg-emerald-500 h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${data?.ats?.readabilityScore || 0}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Tabs Grid */}
      <div className="glass-panel rounded-3xl relative z-10 overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-slate-800 bg-slate-950/20">
          <button 
            onClick={() => setActiveTab('skills')}
            className={`px-8 py-5 text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === 'skills' ? 'border-b-2 border-cyan-400 text-cyan-400 bg-slate-900/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sparkles className="h-4.5 w-4.5" />
            Skills Analysis & Gap Suggestions
          </button>
          <button 
            onClick={() => setActiveTab('ats')}
            className={`px-8 py-5 text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === 'ats' ? 'border-b-2 border-cyan-400 text-cyan-400 bg-slate-900/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BarChart2 className="h-4.5 w-4.5" />
            ATS Filter Recommendations
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'skills' ? (
              <motion.div 
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Matched / Missing grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Matched skills */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Matched Skills ({data?.matching?.matchedSkills?.length || 0})</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {data?.matching?.matchedSkills?.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-xs font-semibold">
                          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                      {data?.matching?.matchedSkills?.length === 0 && (
                        <p className="text-slate-500 text-xs">No matching skills identified.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing skills */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Missing Required Skills ({data?.matching?.missingSkills?.length || 0})</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {data?.matching?.missingSkills?.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs font-semibold animate-pulse">
                          <XCircle className="h-4.5 w-4.5 shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                      {data?.matching?.missingSkills?.length === 0 && (
                        <p className="text-slate-500 text-xs">Wow, you cover all required job skills!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions card */}
                {data?.matching?.improvementSuggestions && data?.matching?.improvementSuggestions?.length > 0 && (
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/20 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Actionable Recommendations</h4>
                    <ul className="space-y-3 text-xs text-slate-300">
                      {data.matching.improvementSuggestions.map((sug, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start leading-relaxed">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold shrink-0 mt-0.5">{idx + 1}</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="ats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl border border-slate-850 bg-slate-950/10 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">ATS Optimization Roadmap</h4>
                  <p className="text-slate-400 text-xs">
                    Implement these changes in your resume source document before export to ensure search compatibility and avoid ATS rejection filters.
                  </p>
                </div>

                <div className="space-y-3">
                  {data?.ats?.recommendations?.map((rec, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-4 rounded-xl border border-slate-800 bg-slate-950/30 text-xs text-slate-300 leading-relaxed">
                      <span className="text-cyan-400 font-extrabold shrink-0 mt-0.5">➔</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                  {data?.ats?.recommendations?.length === 0 && (
                    <p className="text-slate-500 text-xs">No formatting corrections required.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MatchAnalysisPage;
