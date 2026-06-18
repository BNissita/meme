import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Camera,
  Wifi,
  Clock,
  FileText,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

const InterviewGuidelinesPage = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleStartInterview = () => {
    navigate("/interview-call");
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            AI Mock Interview Guidelines
          </h1>

          <p className="text-slate-400 max-w-2xl mx-auto">
            Please read the instructions carefully before starting your
            interview. The interview session uses an AI recruiter avatar and
            will evaluate your communication, technical knowledge, and overall
            interview performance.
          </p>
        </div>

        {/* Guidelines Grid */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Mic className="text-cyan-400" />
              <h3 className="font-semibold text-lg">
                Microphone Check
              </h3>
            </div>

            <p className="text-slate-400">
              Ensure your microphone is connected and working properly.
              Speak clearly and avoid background noise for accurate
              transcript generation.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Camera className="text-cyan-400" />
              <h3 className="font-semibold text-lg">
                Camera Access
              </h3>
            </div>

            <p className="text-slate-400">
              Allow camera permissions when prompted. Maintain eye
              contact and professional posture throughout the interview.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Wifi className="text-cyan-400" />
              <h3 className="font-semibold text-lg">
                Stable Internet
              </h3>
            </div>

            <p className="text-slate-400">
              Use a stable internet connection to avoid interruptions
              during the interview session.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-cyan-400" />
              <h3 className="font-semibold text-lg">
                Interview Duration
              </h3>
            </div>

            <p className="text-slate-400">
              The interview may last up to 30 minutes depending on your
              responses and follow-up questions.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="text-cyan-400" />
              <h3 className="font-semibold text-lg">
                Resume & JD Based Questions
              </h3>
            </div>

            <p className="text-slate-400">
              Questions are dynamically generated using your uploaded
              Resume and Job Description to simulate a real interview.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="text-cyan-400" />
              <h3 className="font-semibold text-lg">
                Auto Evaluation
              </h3>
            </div>

            <p className="text-slate-400">
              Your interview transcript will be analyzed to generate a
              detailed performance report including strengths,
              weaknesses, and improvement suggestions.
            </p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-10 bg-cyan-950/20 border border-cyan-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">
            Important Notes
          </h2>

          <ul className="space-y-3 text-slate-300">
            <li className="flex gap-2">
              <CheckCircle size={18} className="text-green-400 mt-1" />
              Speak naturally and answer confidently.
            </li>

            <li className="flex gap-2">
              <CheckCircle size={18} className="text-green-400 mt-1" />
              Avoid switching tabs frequently during the interview.
            </li>

            <li className="flex gap-2">
              <CheckCircle size={18} className="text-green-400 mt-1" />
              If no response is detected for approximately 1 minute,
              the interview session may automatically end.
            </li>

            <li className="flex gap-2">
              <CheckCircle size={18} className="text-green-400 mt-1" />
              Starting the interview will consume Tavus conversation
              credits.
            </li>

            <li className="flex gap-2">
              <CheckCircle size={18} className="text-green-400 mt-1" />
              Make sure you are ready before clicking Start Interview.
            </li>
          </ul>
        </div>

        {/* Checkbox */}
        <div className="mt-8 flex items-center gap-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-5 h-5"
          />

          <label className="text-slate-300">
            I have read and understood the interview guidelines.
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Back
          </button>

          <button
            disabled={!accepted}
            onClick={handleStartInterview}
            className={`px-8 py-3 rounded-xl font-semibold transition ${
              accepted
                ? "bg-cyan-500 hover:bg-cyan-600 text-black"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            Start Interview
          </button>
        </div>

      </div>
    </div>
  );
};

export default InterviewGuidelinesPage;