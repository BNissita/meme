import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, AuthContext } from '../context/AuthContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { 
  Trophy, Brain, FileText, AlertTriangle, CheckCircle, 
  ArrowRight, Sparkles, Zap, BarChart3, Plus 
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
  totalInterviews: 0,
  bestScore: 0,
  readinessScore: 0,
  improvementPercentage: 0,
  topStrengths: [],
  topWeaknesses: [],
  recommendedTopics: [],
  skillChart: [],
  recommendation: "",
  hasResume: false,
  hasJD: false
});
  const [recentReports, setRecentReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentReports(res.data.recentReports);
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Could not load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startDemoInterview = async () => {
    try {
      setLoading(true);
      const res = await api.post('/interview/start', { demoMode: true });
      if (res.data.success) {
        navigate('/interview');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start interview. Ensure resume and JD are uploaded.');
      setLoading(false);
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative">
      {/* Background radial glows */}
      <div className="absolute top-20 right-10 glow-dot-cyan w-[250px] h-[250px]"></div>
      <div className="absolute bottom-20 left-10 glow-dot-violet w-[250px] h-[250px]"></div>

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Welcome, {user?.name || 'Developer'}</h1>
          <p className="text-slate-400 text-sm mt-1">Here is your HireMe AI assessment summary.</p>
        </div>
        
        {stats.hasResume && stats.hasJD && (
          <div className="flex gap-4">
            <button 
              onClick={startDemoInterview}
              className="px-5 py-3 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 transition duration-200 shadow-glow-cyan flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 animate-spin" />
              Quick Demo Interview (3 Qs)
            </button>
            <Link 
              to="/match"
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white border border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 transition duration-200 flex items-center gap-1.5"
            >
              <Zap className="h-4 w-4 text-yellow-400" />
              Analyze Fit
            </Link>
          </div>
        )}
      </div>

      {/* Upload Checklists alerts if missing */}
      {(!stats.hasResume || !stats.hasJD) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {!stats.hasResume ? (
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-rose-500 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Upload Your Resume</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  To begin matching against job descriptions and generating personalized mock interview sessions, upload your PDF resume first.
                </p>
                <Link to="/resume" className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline">
                  Go to Upload <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Resume Configured</h3>
                <p className="text-slate-400 text-xs">Your resume has been parsed and is actively stored in MongoDB.</p>
              </div>
            </div>
          )}

          {!stats.hasJD ? (
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-rose-500 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Set Job Description</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Provide the target job description (JD) you want to match against. Paste the text or upload a PDF job spec document.
                </p>
                <Link to="/jd" className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline">
                  Configure Job Spec <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Job Spec Linked</h3>
                <p className="text-slate-400 text-xs">A target Job Description has been analyzed for required skills.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
        {/* KPI 1 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-cyan-400"><Brain className="h-10 w-10" /></div>
          <p className="text-xs font-medium text-slate-400">Total Mock Loops</p>
          <p className="text-3xl font-extrabold text-white mt-2">{stats.totalInterviews}</p>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-violet-400"><Trophy className="h-10 w-10" /></div>
          <p className="text-xs font-medium text-slate-400">Personal Best Score</p>
          <p className="text-3xl font-extrabold text-white mt-2">
            {stats.bestScore > 0 ? `${stats.bestScore}%` : 'N/A'}
          </p>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-cyan-400"><Zap className="h-10 w-10" /></div>
          <p className="text-xs font-medium text-slate-400">
  Interview Readiness
</p>

<p className="text-3xl font-extrabold text-white mt-2">
  {stats.readinessScore || 0}%
</p>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-400"><FileText className="h-10 w-10" /></div>
          <p className="text-xs font-medium text-slate-400">
  Improvement
</p>

<p className="text-3xl font-extrabold text-white mt-2">
  +{stats.improvementPercentage || 0}%
</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* History Score Line Chart */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              Match Performance Timeline
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1426', borderColor: '#1e293b', borderRadius: '12px', fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core Categories Comparison Bar Chart */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-400" />
              Latest Skills Breakdown
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.skillChart || []} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="skill" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1426', borderColor: '#1e293b', borderRadius: '12px', fontSize: 12 }} />
                  <Bar
  dataKey="score"
  fill="#06b6d4"
  radius={[4,4,0,0]}
/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

  <div className="glass-panel p-6 rounded-2xl">
    <h3 className="text-lg font-bold text-white mb-4">
      Top Strengths
    </h3>

    <div className="space-y-2">
      {(stats.topStrengths || []).map((item,index)=>(
        <div
          key={index}
          className="text-green-400 text-sm"
        >
          ✅ {item}
        </div>
      ))}
    </div>
  </div>

  <div className="glass-panel p-6 rounded-2xl">
  <h3 className="text-lg font-bold text-white mb-4">
    Recommended Topics
  </h3>

  <div className="flex flex-wrap gap-2">
    {(stats.recommendedTopics || []).map((topic,index)=>(
      <span
        key={index}
        className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs"
      >
        {topic}
      </span>
    ))}
  </div>
</div>

<div className="glass-panel p-6 rounded-2xl">
  <h3 className="text-lg font-bold text-white mb-4">
    AI Career Coach
  </h3>

  <p className="text-slate-300 leading-relaxed">
    {stats.recommendation}
  </p>
</div>

  <div className="glass-panel p-6 rounded-2xl">
    <h3 className="text-lg font-bold text-white mb-4">
      Areas To Improve
    </h3>

    <div className="space-y-2">
      {(stats.topWeaknesses || []).map((item,index)=>(
        <div
          key={index}
          className="text-yellow-400 text-sm"
        >
          ⚠️ {item}
        </div>
      ))}
    </div>
  </div>

</div>

      {/* Recent Assessment Reports */}
      <div className="glass-panel p-6 rounded-2xl relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Recent Assessment Reports</h3>
          {stats.hasResume && stats.hasJD && (
            <Link to="/match" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
              Start Assessment <Plus className="h-4.5 w-4.5" />
            </Link>
          )}
        </div>

        {recentReports.length === 0 ? (
          <div className="py-10 text-center space-y-4">
            <p className="text-slate-400 text-sm">No interviews completed yet.</p>
            {stats.hasResume && stats.hasJD && (
              <button 
                onClick={startDemoInterview}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 transition duration-200 cursor-pointer shadow-glow-cyan"
              >
                Run First Simulation
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentReports.map((report) => (
              <div key={report._id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">{report.jdTitle || "Interview Assessment"}</h4>
                  <p className="text-slate-500 text-xs">
                    Completed on {new Date(report.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  {/* Score badge */}
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {report.overallScore}% Score
                    </span>
                  </div>
                  {/* Action Link */}
                  <Link 
                    to={`/reports/${report._id}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition duration-150"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
