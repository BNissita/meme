import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Briefcase, Plus, AlertCircle, CheckCircle, Loader2, 
  ArrowRight, Upload, Sparkles, CheckSquare 
} from 'lucide-react';

const JDUploadPage = () => {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' or 'upload'
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jdText, setJdText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jdData, setJdData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user already has a JD on file
    api.get('/jd/latest')
      .then(res => {
        if (res.data.success) {
          setJdData(res.data.jd);
        }
      })
      .catch(err => {
        // Safe to ignore 404
      });
  }, []);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!jdText.trim()) {
      return setError('Please paste the job description text.');
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/jd/text', {
        title,
        company,
        jdText
      });
      if (response.data.success) {
        setJdData(response.data.jd);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving JD.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return setError('Please select a PDF file first.');
    }

    const formData = new FormData();
    formData.append('jdFile', file);

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/jd/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setJdData(response.data.jd);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while parsing JD file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 relative">
      <div className="absolute top-1/4 left-1/4 glow-dot-cyan w-[250px] h-[250px]"></div>

      <div className="space-y-2 relative z-10">
        <h1 className="text-3xl font-extrabold text-white">Job Description (JD) Input</h1>
        <p className="text-slate-400 text-sm">Provide details of the job you want to target. Paste text or upload a PDF job spec.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Input Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            {/* Tabs selector */}
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => { setActiveTab('paste'); setError(''); }}
                className={`pb-3 text-xs font-semibold uppercase tracking-wider flex-1 text-center transition-all ${activeTab === 'paste' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Option A: Paste Text
              </button>
              <button 
                onClick={() => { setActiveTab('upload'); setError(''); }}
                className={`pb-3 text-xs font-semibold uppercase tracking-wider flex-1 text-center transition-all ${activeTab === 'upload' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Option B: Upload PDF
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'paste' ? (
              <form onSubmit={handleTextSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Node Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ByteCraft"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paste Job Description</label>
                  <textarea 
                    rows={8}
                    placeholder="Paste full responsibilities, requirements, and required stack here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition duration-200"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-95 disabled:opacity-40 transition duration-200 cursor-pointer shadow-glow-cyan flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing JD...
                    </>
                  ) : (
                    'Analyze Job Description'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div 
                  onClick={() => document.getElementById('jd-file-input').click()}
                  className="border-2 border-dashed border-slate-700/60 rounded-xl p-8 text-center bg-slate-950/20 hover:border-cyan-500/50 transition cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <input 
                    type="file" 
                    id="jd-file-input" 
                    className="hidden" 
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  {file ? (
                    <>
                      <FileText className="h-10 w-10 text-cyan-400" />
                      <p className="text-sm font-semibold text-white truncate max-w-[200px]">{file.name}</p>
                      <p className="text-slate-500 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-slate-500" />
                      <p className="text-xs font-semibold text-slate-300">Drag & Drop or Click to browse</p>
                      <p className="text-slate-500 text-[10px]">Upload job spec details as a PDF (Max 10MB)</p>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-95 disabled:opacity-40 transition duration-200 cursor-pointer shadow-glow-cyan flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading & Analyzing...
                    </>
                  ) : (
                    'Upload & Parse Spec'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-6">
          {jdData ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-emerald-500"><CheckCircle className="h-8 w-8" /></div>
              
              <div className="space-y-1 pb-6 border-b border-slate-800">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Target Job Position</p>
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
                  <Briefcase className="h-6 w-6 text-cyan-400" />
                  {jdData.title}
                </h2>
                {jdData.company && (
                  <p className="text-slate-400 text-xs">{jdData.company}</p>
                )}
              </div>

              {/* Experience required */}
              {jdData.experienceRequirements && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience Level</h4>
                  <p className="text-slate-300 text-xs font-semibold">{jdData.experienceRequirements}</p>
                </div>
              )}

              {/* Skills */}
              {jdData.requiredSkills && jdData.requiredSkills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jdData.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-xs bg-slate-900 border border-slate-800 text-cyan-400 font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {jdData.responsibilities && jdData.responsibilities.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-violet-400" />
                    Key Responsibilities
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {jdData.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex gap-2 items-start leading-relaxed">
                        <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Soft Skills */}
              {jdData.softSkills && jdData.softSkills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Soft Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {jdData.softSkills.map((ss, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-850 text-indigo-400 font-medium">{ss}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Proceed to Match */}
              <div className="pt-6 flex justify-end">
                <button
                  onClick={() => navigate('/match')}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-95 transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-glow-cyan"
                >
                  Run Compatibility Engine <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>

            </motion.div>
          ) : (
            <div className="glass-panel p-10 rounded-3xl text-center space-y-4 py-24 bg-slate-950/10">
              <FileText className="h-16 w-16 text-slate-700 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Job Spec Configured</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  Submit the target Job Description in the left panel to trigger AI analysis. Extracted specifications will display here.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JDUploadPage;
