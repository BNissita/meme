console.log("InterviewRoomPage mounted");
import React, { useState, useEffect, useRef } from 'react';
import RecruiterAvatar from "../components/RecruiterAvatar";
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Volume2,
  VolumeX,
  RefreshCw,
  Star,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

const InterviewRoomPage = () => {
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [questionSpeaking, setQuestionSpeaking] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Question evaluation feedback
  const [evaluation, setEvaluation] = useState(null);
  
  // Timer states
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // Audio state
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [listening, setListening] = useState(false);

const recognitionRef = useRef(null);
const [micEnabled, setMicEnabled] = useState(false);

const videoRef = useRef(null);
const streamRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const navigate = useNavigate();

  useEffect(() => {
  loadInterview();
  enableMedia();
  setupSpeechRecognition();
  return () => {
    stopTimer();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };
}, []);

  useEffect(() => {
  console.log("Interview State:", interview);
  console.log("Current Question:", currentQuestion);
  console.log("Loading:", loading);
}, [interview, currentQuestion, loading]);

  // Sync active question and speak it
  useEffect(() => {
    if (interview && interview.questions) {
      const idx = interview.currentQuestionIndex;
      if (idx < interview.questions.length) {
        const q = interview.questions[idx];
        setCurrentQuestion(q);
        setAnswer('');
        setEvaluation(null);
        setSeconds(0);
        startTimer();
        speakQuestion(q.question);
      } else {
        // All questions answered, auto-finalize
        finalizeInterview();
      }
    }
  }, [interview]);
const enableMedia = async () => {
  console.log("enableMedia called");

  if (!navigator.mediaDevices) {
    console.log("mediaDevices not supported");
    return;
  }

  try {
    console.log("Requesting camera permission");

    const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false,
});

    console.log("Permission granted");

    streamRef.current = stream;
    

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      console.log("Video attached");
    }

    setCameraEnabled(true);
    setMicEnabled(true);
    const audioTracks = stream.getAudioTracks();
console.log("Audio Tracks:", audioTracks);

if (audioTracks.length > 0) {
  console.log("Mic Name:", audioTracks[0].label);
}
  } catch (err) {
    console.error("MEDIA ERROR:", err);
  }
};
const setupSpeechRecognition = () => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.log("Speech Recognition not supported");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 1;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
  let finalTranscript = "";

  for (
    let i = event.resultIndex;
    i < event.results.length;
    i++
  ) {
    const result = event.results[i];

    if (result.isFinal) {
      finalTranscript += result[0].transcript + " ";
    }
  }

  if (finalTranscript) {
    setAnswer((prev) => prev + finalTranscript);
  }
};

recognition.onerror = (event) => {
  console.log("ERROR EVENT:", event.error);
};

recognition.onspeechstart = () => {
  console.log("SPEECH STARTED");
};

recognition.onspeechend = () => {
  console.log("SPEECH ENDED");
};

recognition.onaudiostart = () => {
  console.log("AUDIO STARTED");
};

recognition.onaudioend = () => {
  console.log("AUDIO ENDED");
};

  recognition.onstart = () => {
  console.log("Recognition Started");
  setListening(true);
};

  recognition.onerror = (event) => {
  console.log("Speech Error:", event.error);
};

recognition.onnomatch = () => {
  console.log("No speech detected");
};

recognition.onend = () => {
  console.log("Recognition ended");
  setListening(false);
};
  recognitionRef.current = recognition;
};
  const loadInterview = async () => {
  console.log("loadInterview called");

  try {
    setLoading(true);

    const res = await api.get('/interview/active');

    console.log("API RESPONSE:", res.data);

    if (res.data.success) {
      setInterview(res.data.interview);
    }
  } catch (err) {
    console.log("API ERROR:", err.response);

    if (err.response?.status === 404) {
      return startNewDemoInterview();
    }
  } finally {
    setLoading(false);
  }
};

  const startNewDemoInterview = async () => {
  try {
    setLoading(true);

    console.log("Starting demo interview...");

    const res = await api.post('/interview/start', {
      demoMode: true
    });

    console.log("Demo interview response:", res.data);

    if (res.data.success) {
      setInterview(res.data.interview);
    }
  } catch (err) {
    console.error("Start interview error:", err);
    alert(err.response?.data?.message || 'Error starting interview.');
  } finally {
    setLoading(false);
  }
};

  // Timer functions
  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Speak question via Web Speech API
  const speakQuestion = (text) => {
  if (!ttsEnabled || !synthRef.current) return;

  synthRef.current.cancel();

  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = synthRef.current.getVoices();
    const EnglishVoice = voices.find(
      v => v.lang.startsWith("en") && v.name.includes("Google")
    );

    if (EnglishVoice) utterance.voice = EnglishVoice;

    utterance.rate = 1.0;

    utterance.onstart = () => {
      setQuestionSpeaking(true);
    };

    utterance.onend = () => {
      setQuestionSpeaking(false);
    };

    synthRef.current.speak(utterance);
  }, 200);
};

  const toggleTts = () => {
    if (ttsEnabled) {
      synthRef.current.cancel();
      setTtsEnabled(false);
    } else {
      setTtsEnabled(true);
      if (currentQuestion) {
        speakQuestion(currentQuestion.question);
      }
    }
  };
  const startListening = () => {
    console.log("Mic Enabled:", micEnabled);
console.log("Recognition Object:", recognitionRef.current);
  if (!micEnabled) {
    alert("Microphone not enabled");
    return;
  }

  try {
  console.log("Starting recognition...");
  synthRef.current.cancel();
  recognitionRef.current.start();
} catch (err) {
  console.log("START ERROR:", err);
}
};

const stopListening = () => {
  if (recognitionRef.current) {
    recognitionRef.current.stop();
  }
};

  // Submit single answer
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitLoading(true);
    stopTimer();

    try {
      const res = await api.post('/interview/answer', { answer });
      if (res.data.success) {
        setEvaluation(res.data.evaluation);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit answer.');
      startTimer();
    } finally {
      setSubmitLoading(false);
    }
  };

  // Move to next question
  const handleNext = () => {
    if (synthRef.current) synthRef.current.cancel();
    // Re-fetch active interview from backend (it has incremented currentQuestionIndex)
    api.get('/interview/active')
      .then(res => {
        if (res.data.success) {
          setInterview(res.data.interview);
        }
      })
      .catch(err => {
        // If 404, we have completed the interview
        finalizeInterview();
      });
  };

  // Compile scorecard and report
  const finalizeInterview = async () => {
    setLoading(true);
    stopTimer();
    if (synthRef.current) synthRef.current.cancel();
    
    try {
      const res = await api.post('/interview/finalize');
      if (res.data.success) {
        navigate(`/reports/${res.data.report._id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to compile report. Redirecting to dashboard.');
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-transparent border-b-violet-500 border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold animate-pulse">Assembling mock room and compiling questions...</p>
      </div>
    );
  }

  const progressPercent =
  interview?.questions?.length > 0
    ? (interview.currentQuestionIndex / interview.questions.length) * 100
    : 0;
    if (!interview) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      No interview data found.
    </div>
  );
}
  return (
    
    <div className="h-screen overflow-hidden max-w-[1800px] mx-auto px-4 py-4 relative">
      <div className="absolute top-1/4 left-1/4 glow-dot-cyan w-[200px] h-[200px]"></div>

      {/* Progress tracker */}
      <div className="space-y-2 relative z-10 mb-6">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span className="uppercase tracking-widest text-cyan-400">Mock Interview Room</span>
          <span>Question {interview.currentQuestionIndex + 1} of {interview.questions.length}</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
          <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
      <div
  className="grid grid-cols-10 gap-4 relative z-10"
  style={{ height: "calc(100vh - 120px)" }}
>
  {/* Avatar */}
<div className="col-span-3 h-full rounded-3xl overflow-hidden border border-cyan-500/20 bg-black relative">

  <RecruiterAvatar />

  <div className="absolute top-4 left-4 bg-black/60 px-3 py-2 rounded-xl">
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-cyan-400" />
      <span className="text-white">
        {formatTime(seconds)}
      </span>
    </div>
  </div>

</div>
{/* Camera */}
<div className="col-span-4 h-full rounded-3xl overflow-hidden border border-cyan-500/20 bg-black relative">

  <video
    ref={videoRef}
    autoPlay
    muted
    playsInline
    className="w-full h-full object-cover"
  />

</div>
  {/* RIGHT CONTENT */}
  <div className="col-span-3 h-full">
          {/* Form / Inline Feedback */}
          <AnimatePresence mode="wait">
            {!evaluation ? (
              <motion.form 
                key="answer-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleAnswerSubmit}
                className="glass-panel p-6 rounded-2xl space-y-4"
              >
                <div className="glass-panel p-4 rounded-2xl mb-4">

  <h3 className="text-cyan-400 font-bold mb-2">
    Question
  </h3>

  <p className="text-white">
    {currentQuestion?.question}
  </p>

</div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Answer</label>
                  <div className="w-full h-[250px] px-3.5 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white text-sm overflow-y-auto">
  {answer ? (
    answer
  ) : (
    <span className="text-slate-500">
      Your speech transcript will appear here...
    </span>
  )}
</div>
                </div>

                <div className="flex justify-between items-center">
  <div className="flex gap-4">

  <button
    type="button"
    disabled={questionSpeaking}
    onClick={() =>
      listening ? stopListening() : startListening()
    }
    className={`px-6 py-3 rounded-xl text-white font-semibold ${
      listening
        ? "bg-red-500"
        : "bg-green-500"
    }`}
  >
    {questionSpeaking
      ? "🤖 Asking..."
      : listening
      ? "⏹ Stop Speaking"
      : "🎤 Start Speaking"}
  </button>

  <button
    type="submit"
    disabled={submitLoading}
    className="px-6 py-3 rounded-xl bg-cyan-400 text-black font-bold"
  >
    Submit Answer
  </button>

</div>
  </div>
              </motion.form>
            ) : (
              <motion.div
                key="evaluation-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-6 rounded-2xl space-y-6 border border-cyan-500/20"
              >
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                      Answer Evaluated
                    </h3>
                    <p className="text-[10px] text-slate-500">Live AI recruiting feedback metrics.</p>
                  </div>
                  {/* Score circle */}
                  <div className="flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-cyan-400" />
                    <span>{evaluation.score} / 10</span>
                  </div>
                </div>

                {/* Score breakdown parameters */}
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-950/20 border border-slate-800">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Relevance</p>
                    <p className="text-xs font-extrabold text-white mt-1">{evaluation.relevance}/10</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/20 border border-slate-800">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Accuracy</p>
                    <p className="text-xs font-extrabold text-white mt-1">{evaluation.accuracy}/10</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/20 border border-slate-800">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Comm.</p>
                    <p className="text-xs font-extrabold text-white mt-1">{evaluation.communication}/10</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/20 border border-slate-800">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Complete</p>
                    <p className="text-xs font-extrabold text-white mt-1">{evaluation.completeness}/10</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/20 border border-slate-800">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Confidence</p>
                    <p className="text-xs font-extrabold text-white mt-1">{evaluation.confidence}/10</p>
                  </div>
                </div>

                {/* Comments text */}
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-slate-400">Recruiter Feedback</h5>
                    <p className="text-slate-300 leading-relaxed">{evaluation.feedback}</p>
                  </div>
                  <div className="space-y-1.5 p-4 rounded-xl border border-slate-800 bg-slate-950/30">
                    <h5 className="font-bold text-cyan-400 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Suggestions</h5>
                    <p className="text-slate-400 leading-relaxed">{evaluation.suggestions}</p>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer shadow-glow-cyan"
                  >
                    {interview.currentQuestionIndex + 1 >= interview.questions.length ? (
                      <>
                        Compile Final Report <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Next Question <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
export default InterviewRoomPage;