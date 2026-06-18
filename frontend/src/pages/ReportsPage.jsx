import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import {
  Trophy, CheckCircle, AlertTriangle, ShieldCheck,
  ArrowLeft, FileText, Calendar, Sparkles, BookOpen
} from 'lucide-react';

const ReportsPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const downloadPDF = async () => {

    const reportElement =
      document.getElementById(
        "report-content"
      );

    const canvas =
      await html2canvas(reportElement, {
        scale: 2
      });

    const imgData =
      canvas.toDataURL("image/png");

    const pdf =
      new jsPDF("p", "mm", "a4");

    const width =
      pdf.internal.pageSize.getWidth();

    const height =
      (canvas.height * width) /
      canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      width,
      height
    );

    pdf.save(
      "HireMe-AI-Report.pdf"
    );
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/tavus/report/${id}`);
      if (res.data.success) {
        setReport(res.data.report);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch the assessment report. Please check if it exists.');
    } finally {
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

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-2xl text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Report Not Found</h3>
        <p className="text-slate-400 text-xs">{error || 'No report matches this identifier.'}</p>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Formatting data for the Radar Chart
  const radarData = [
    { subject: 'Technical Depth', value: report.technicalScore, fullMark: 100 },
    { subject: 'Communication', value: report.communicationScore, fullMark: 100 },
    { subject: 'Problem Solving', value: report.problemSolvingScore, fullMark: 100 },
    { subject: 'Relevance', value: Math.min(100, report.overallScore + 5), fullMark: 100 },
    { subject: 'Completeness', value: Math.max(0, report.overallScore - 5), fullMark: 100 }
  ];

  return (
    <div
      id="report-content"
      className="max-w-6xl mx-auto px-4 py-10 space-y-8 relative"
    >
      <div className="absolute top-1/4 right-1/4 glow-dot-cyan w-[250px] h-[250px]"></div>

      {/* Back button and title */}
      <div className="space-y-4 relative z-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Interview Assessment Report</h1>
            <p className="text-slate-400 text-xs mt-1">
              Generated on {new Date(report.createdAt).toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short'
              })}
            </p>

          </div>

          <div className="flex items-center gap-3">

            <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-glow-cyan">
              {report.overallScore}% Overall Score
            </span>

            <button
              onClick={downloadPDF}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold transition"
            >
              Download PDF
            </button>

          </div>

        </div>
        {/* Back button and title */}
        <div className="space-y-4 relative z-10">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="glass-panel p-6 rounded-3xl relative z-10">
              <h3 className="text-lg font-bold text-white mb-3">
                Interview Summary
              </h3>

              <p className="text-slate-300 leading-relaxed">
                {report.executiveSummary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics scorecard row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch relative z-10">

        {/* Radar chart visual */}
        <div className="md:col-span-5 glass-panel p-6 rounded-3xl flex flex-col items-center justify-center space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Trophy className="h-4.5 w-4.5 text-yellow-400" />
            Capabilities Scorecard
          </h3>

          <div className="w-full h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1e293b" opacity={0.5} />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="Score" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score blocks */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Technical Capability</p>
              <p className="text-4xl font-extrabold text-white mt-2">{report.technicalScore}%</p>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${report.technicalScore}%` }}></div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Communication Quality</p>
              <p className="text-4xl font-extrabold text-white mt-2">{report.communicationScore}%</p>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${report.communicationScore}%` }}></div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Problem Solving</p>
              <p className="text-4xl font-extrabold text-white mt-2">{report.problemSolvingScore}%</p>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
              <div className="bg-violet-500 h-full rounded-full" style={{ width: `${report.problemSolvingScore}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Observations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

        {/* Strengths & Weaknesses */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          {/* Strengths */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Observed Strengths
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              {(report.strengths || []).map((str, idx) => (
                <li key={idx} className="flex gap-2.5 items-start leading-relaxed">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Identified Gaps
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              {(report.weaknesses || []).map((weak, idx) => (
                <li key={idx} className="flex gap-2.5 items-start leading-relaxed">
                  <span className="text-amber-500 shrink-0 mt-0.5">➔</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Missed Concepts & Recommendations */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          {/* Missed Concepts */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-500" />
              Missed Key Concepts
            </h3>
            <div className="flex flex-wrap gap-2">
              {(report.missedConcepts || []).map((con, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full text-xs bg-rose-500/5 border border-rose-500/15 text-rose-400 font-semibold">
                  {con}
                </span>
              ))}
              {report.missedConcepts.length === 0 && (
                <span className="text-slate-500 text-xs">Fantastic! No major technical concepts missed.</span>
              )}
            </div>
          </div>

          {/* Recommended study topics */}
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-400" />
              Recommended Study Topics
            </h3>
            <ul className="space-y-2 text-xs text-slate-350">
              {(report.recommendedTopics || []).map((top, idx) => (
                <li key={idx} className="flex gap-2.5 items-start leading-relaxed">
                  <span className="text-cyan-400 shrink-0 font-bold">•</span>
                  <span>{top}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Study Plan Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="glass-panel p-8 rounded-3xl">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">
            Strongest Moment
          </h3>

          <p className="text-slate-300 leading-relaxed">
            {report.topPositiveMoment}
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">
            Biggest Improvement Opportunity
          </h3>

          <p className="text-slate-300 leading-relaxed">
            {report.topImprovementMoment}
          </p>
        </div>

      </div>
      {report.improvementPlan && (
        <div className="glass-panel p-8 md:p-12 rounded-3xl relative z-10 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-slate-800">
            <Calendar className="h-5 w-5 text-cyan-400" />
            AI-Synthesized 4-Week Action Plan
          </h3>
          <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300 space-y-4 whitespace-pre-line">
            {report.improvementPlan}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
