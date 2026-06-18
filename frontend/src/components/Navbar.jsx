import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Menu,
  X,
  Brain,
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  Briefcase,
  Zap,
  Sun,
  Moon,
  Users
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
    ${isActive(path) 
      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'}
  `;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-wide">
            <Brain className="h-6 w-6 text-cyan-400 animate-pulse" />
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">HireMe AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link to="/resume" className={linkClass('/resume')}>
                  <FileText className="h-4 w-4" />
                  Resume
                </Link>
                <Link to="/jd" className={linkClass('/jd')}>
                  <Briefcase className="h-4 w-4" />
                  Job Description
                </Link>
                <Link to="/match" className={linkClass('/match')}>
                  <Zap className="h-4 w-4" />
                  Match Engine
                </Link>
                <Link to="/interview-guidelines" className={linkClass('/interview-guidelines')}>
                  <Brain className="h-4 w-4" />
                  Mock Interview
                </Link>
                <Link to="/community" className={linkClass('/community')}>
                  <Users className="h-4 w-4" />
                  Community
                </Link>
                
                {/* Profile and Logout */}
                <div className="flex items-center gap-2 pl-4 border-l border-slate-700 ml-2">
                  
                  <Link to="/profile" className={`p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/40 ${isActive('/profile') ? 'text-cyan-400' : ''}`} title="Profile">
                    <User className="h-4 w-4" />
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/25 hover:text-rose-300 transition duration-200 cursor-pointer">
                    <LogOut className="h-3 w-3" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="#features" className="text-slate-300 hover:text-white text-sm font-medium transition duration-200 px-3 py-2">Features</a>
                <a href="#how-it-works" className="text-slate-300 hover:text-white text-sm font-medium transition duration-200 px-3 py-2">How It Works</a>
                <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition duration-200 px-3 py-2">Login</Link>
                <Link to="/register" className="ml-2 px-4 py-2 rounded-full text-sm font-semibold text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 transition duration-200 shadow-glow-cyan">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800/80 px-2 pt-2 pb-3 space-y-1">
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Dashboard</Link>
              <Link to="/resume" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Resume</Link>
              <Link to="/jd" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Job Description</Link>
              <Link to="/match" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Match Engine</Link>
              <Link to="/interview-guidelines" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Mock Interview</Link>
              <Link to="/community" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Community</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Profile</Link>
              <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-rose-500/10">Logout</button>
            </>
          ) : (
            <>
              <a href="#features" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Features</a>
              <a href="#how-it-works" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">How It Works</a>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="block text-center mx-3 my-2 px-4 py-2 rounded-full text-sm font-semibold text-black bg-gradient-to-r from-cyan-400 to-indigo-400">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;