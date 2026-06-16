import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Loader2, 
  ArrowRight, Phone, Mail, User, Briefcase, Award 
} from 'lucide-react';

const ResumeUploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const navigate = useNavigate();

  const loadingSteps = [
    "Uploading PDF to server...",
    "Extracting text headers and details...",
    "Submitting to Gemini AI Engine...",
    "Synthesizing skills, strengths & weak areas...",
    "Finalizing MongoDB records..."
  ];

  useEffect(() => {
    // Check if user already has a resume on file
    api.get('/resume/latest')
      .then(res => {
        if (res.data.success) {
          setResumeData(res.data.resume);
        }
      })
      .catch(err => {
        // Safe to ignore 404
      });
  }, []);
  useEffect(() => {
  console.log("resumeData changed:", resumeData);
}, [resumeData]);

  // Simulate loader steps
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Only PDF documents are allowed.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Only PDF documents are allowed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      return setError('Please select a PDF file first.');
    }

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("FULL RESPONSE:", response.data);

if (response.data.success) {
  console.log("RESUME:", response.data.resume);
  setResumeData(response.data.resume);
}
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while parsing resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 relative">
      <div className="absolute top-1/4 left-1/4 glow-dot-cyan w-[250px] h-[250px]"></div>

      <div className="space-y-2 relative z-10">
        <h1 className="text-3xl font-extrabold text-white">Resume Upload & Parsing</h1>
        <p className="text-slate-400 text-sm">Upload your PDF resume. Our AI parser will structure your profile details automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Upload Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-white">Select Resume File</h3>
            
            {error && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700/60 rounded-xl p-8 text-center bg-slate-950/20 hover:border-cyan-500/50 transition cursor-pointer flex flex-col items-center justify-center space-y-3"
                onClick={() => document.getElementById('resume-file').click()}
              >
                <input 
                  type="file" 
                  id="resume-file" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleFileChange}
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
                    <p className="text-slate-500 text-[10px]">Only standard PDF file types allowed (Max 10MB)</p>
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
                    Parsing...
                  </>
                ) : (
                  'Upload & AI Parse'
                )}
              </button>
            </form>
          </div>

          {/* Loader Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-500 space-y-4"
              >
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Loader2 className="h-4.5 w-4.5 text-cyan-400 animate-spin" />
                  Analyzing Profile Details
                </h4>
                <p className="text-xs text-cyan-400 italic font-semibold">
                  {loadingSteps[loadingStep]}
                </p>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    className="bg-cyan-400 h-full rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Display Parsed Data Column */}
        <div className="lg:col-span-7">
          {resumeData ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-emerald-500"><CheckCircle className="h-8 w-8" /></div>
              
              {/* Header profile info */}
              <div className="space-y-3 pb-6 border-b border-slate-800">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <User className="h-6 w-6 text-cyan-400" />
                  {resumeData.name || 'Not Detected'}
                </h2>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  {resumeData.email && (
                    <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {resumeData.email}</span>
                  )}
                  {resumeData.phone && (
                    <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {resumeData.phone}</span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {resumeData.summary && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Summary</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">{resumeData.summary}</p>
                </div>
              )}

              {/* Skills */}
              {resumeData.skills && resumeData.skills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extracted Tech Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-xs bg-slate-900 border border-slate-800 text-cyan-400 font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resumeData.projects && resumeData.projects.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-violet-400" />
                    Key Projects
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.projects.map((proj, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 space-y-2">
                        <h5 className="text-xs font-extrabold text-white">{proj.name}</h5>
                        <p className="text-slate-400 text-[10px] leading-relaxed">{proj.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proj.technologies && proj.technologies.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {resumeData.experience && resumeData.experience.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-indigo-400" />
                    Work Experience
                  </h4>
                  <div className="space-y-4">
                    {resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-slate-800 pl-4 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <h5 className="text-xs font-bold text-white">{exp.role}</h5>
                          <span className="text-[10px] text-slate-500">{exp.duration}</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400">{exp.company}</p>
                        <p className="text-slate-400 text-[10px] leading-relaxed mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-850">
                {resumeData.strengths && resumeData.strengths.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Top Strengths</h4>
                    <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-300">
                      {resumeData.strengths.map((str, i) => <li key={i}>{str}</li>)}
                    </ul>
                  </div>
                )}
                {resumeData.weaknesses && resumeData.weaknesses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Improvement Areas</h4>
                    <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-300">
                      {resumeData.weaknesses.map((weak, i) => <li key={i}>{weak}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Proceed Button */}
              <div className="pt-6 flex justify-end">
                <button
                  onClick={() => navigate('/jd')}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 border border-slate-700 hover:bg-slate-850 hover:text-white transition duration-200 flex items-center gap-1.5 cursor-pointer"
                >
                  Configure Job Spec <ArrowRight className="h-4.5 w-4.5 text-cyan-400" />
                </button>
              </div>

            </motion.div>
          ) : (
            <div className="glass-panel p-10 rounded-3xl text-center space-y-4 py-24 bg-slate-950/10">
              <FileText className="h-16 w-16 text-slate-700 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Resume Uploaded</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  Drag and drop your PDF resume in the left panel to trigger parsing. Once parsed, your visual profile stats will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResumeUploadPage;
