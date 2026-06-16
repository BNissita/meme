import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, FileText, Briefcase, LogOut, CheckCircle, ShieldAlert } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch latest resume and jd metadata
    Promise.all([
      api.get('/resume/latest').catch(() => null),
      api.get('/jd/latest').catch(() => null)
    ]).then(([resumeRes, jdRes]) => {
      if (resumeRes?.data?.success) setResume(resumeRes.data.resume);
      if (jdRes?.data?.success) setJd(jdRes.data.jd);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex justify-center items-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-transparent border-b-violet-500 border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 relative">
      <div className="absolute top-1/4 left-1/4 glow-dot-cyan w-[200px] h-[200px]"></div>

      <div className="space-y-2 relative z-10">
        <h1 className="text-3xl font-extrabold text-white">Your Profile</h1>
        <p className="text-slate-400 text-sm">Manage your MERN credentials, resume profile, and target job specs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* User Card */}
        <div className="md:col-span-5 glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-black font-extrabold text-3xl shadow-glow-cyan">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-lg">{user?.name}</h3>
            <p className="text-slate-400 text-xs flex items-center justify-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user?.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-800 text-left text-xs space-y-3">
            <div className="flex justify-between text-slate-400">
              <span>Account Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Security Tier</span>
              <span>Candidate MERN</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl text-xs font-semibold text-rose-400 border border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/15 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Assets status Column */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Resume state */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              Resume Attachment
            </h3>
            {resume ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 flex justify-between items-center gap-4 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-white truncate max-w-[200px]">{resume.fileName}</p>
                  <p className="text-slate-500 text-[10px]">Parsed on {new Date(resume.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => navigate('/resume')}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-[10px] font-bold text-slate-300 hover:text-white"
                >
                  Replace PDF
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 flex justify-between items-center gap-4 text-xs">
                <p className="text-rose-400 flex items-center gap-1.5"><ShieldAlert className="h-4.5 w-4.5 shrink-0" /> No resume on file.</p>
                <button 
                  onClick={() => navigate('/resume')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-[10px] font-bold text-black"
                >
                  Upload PDF
                </button>
              </div>
            )}
          </div>

          {/* Job description state */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-violet-400" />
              Target Job Specification
            </h3>
            {jd ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 flex justify-between items-center gap-4 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-white truncate max-w-[200px]">{jd.title}</p>
                  <p className="text-slate-500 text-[10px]">Configured on {new Date(jd.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => navigate('/jd')}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-[10px] font-bold text-slate-300 hover:text-white"
                >
                  Modify Spec
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 flex justify-between items-center gap-4 text-xs">
                <p className="text-rose-400 flex items-center gap-1.5"><ShieldAlert className="h-4.5 w-4.5 shrink-0" /> No Job Spec configured.</p>
                <button 
                  onClick={() => navigate('/jd')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-[10px] font-bold text-black"
                >
                  Set Job Description
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
