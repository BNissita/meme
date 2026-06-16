import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Upload, Sparkles, CheckCircle2, ChevronRight, Trophy, BarChart3, Users } from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-1/4 glow-dot-cyan w-[300px] h-[300px] -translate-x-1/2"></div>
      <div className="absolute top-80 right-1/4 glow-dot-violet w-[350px] h-[350px] translate-x-1/2"></div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 px-4 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Supercharge Your <br/>
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Job Readiness with AI
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-400 font-medium">
            "Upload Your Resume. Match Your Dream Job. Ace The Interview."
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/register" className="px-8 py-4 rounded-full text-base font-bold text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 transition duration-200 shadow-glow-cyan flex items-center gap-1.5 cursor-pointer">
              Get Started Free <ChevronRight className="h-5 w-5" />
            </Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-full text-base font-semibold text-slate-300 border border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 hover:text-white transition duration-200">
              See How It Works
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">Equipped with Core AI Modules</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Get comprehensive analytical insights and feedback in a matter of seconds.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="glass-panel glass-hover p-8 rounded-2xl relative overflow-hidden group">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg w-fit mb-6">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Resume Parsing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload your PDF resume. Our AI instantly extracts contact details, skills, project technology stacks, experience, and details key strengths and weaknesses.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="glass-panel glass-hover p-8 rounded-2xl relative overflow-hidden group">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-lg w-fit mb-6">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Resume-JD Matcher</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Scan your profile directly against a target job description. Generate a visual match compatibility score, identify critical missing skills, and get suggestions.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="glass-panel glass-hover p-8 rounded-2xl relative overflow-hidden group">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit mb-6">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mock Interview Room</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Practice in a simulated environment with AI questions custom-tailored to your resume gaps. Receive question-by-question scoring and a full analytics report.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-900 bg-slate-950/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">How It Works</h2>
            <p className="text-slate-400">Your three-minute path to technical job readiness validation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative text-center space-y-4">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 font-bold">1</div>
              <h3 className="text-lg font-bold text-white">Sign Up</h3>
              <p className="text-slate-400 text-xs px-4">Create your secure developer profile in seconds.</p>
            </div>
            <div className="relative text-center space-y-4">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-400 font-bold">2</div>
              <h3 className="text-lg font-bold text-white">Upload Assets</h3>
              <p className="text-slate-400 text-xs px-4">Provide your PDF resume and paste your target JD.</p>
            </div>
            <div className="relative text-center space-y-4">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 font-bold">3</div>
              <h3 className="text-lg font-bold text-white">Ace Mock Interview</h3>
              <p className="text-slate-400 text-xs px-4">Answer dynamically generated questions tailored to the JD.</p>
            </div>
            <div className="relative text-center space-y-4">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-bold">4</div>
              <h3 className="text-lg font-bold text-white">Review Report</h3>
              <p className="text-slate-400 text-xs px-4">Get a professional scorecard, studied concepts, and a study plan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 text-center px-4 max-w-5xl mx-auto mb-16">
        <div className="glass-panel p-8 md:p-16 rounded-3xl relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 glow-dot-cyan w-[200px] h-[200px]"></div>
          <div className="absolute -top-20 -right-20 glow-dot-violet w-[200px] h-[200px]"></div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Ready to Crack Your Next Tech Loop?</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
            Gain immediate insight into your preparation gaps. Generate your personalized mock roadmap inside HireMe AI.
          </p>
          <Link to="/register" className="px-8 py-4 rounded-full text-base font-bold text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 transition duration-200 shadow-glow-cyan inline-flex items-center gap-1.5 cursor-pointer">
            Create Free Account <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
