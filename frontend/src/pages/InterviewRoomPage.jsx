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
  Loader2,
  User,
  Mic,
  MicOff,
  MessageSquare
} from 'lucide-react';
console.log("InterviewRoomPage mounted");

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

  const speechTimeoutRef = useRef(null);
  const lastSpokenQuestionIdRef = useRef(null);

  const recognitionRef = useRef(null);
  const [micEnabled, setMicEnabled] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const listeningRef = useRef(false);
  const finalTranscriptRef = useRef("");
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

      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setAnswer('');
  }, [currentQuestion?._id]);

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  useEffect(() => {
    console.log("Interview State:", interview);
    console.log("Current Question:", currentQuestion);
    console.log("Loading:", loading);
  }, [interview, currentQuestion, loading]);

  const lastQuestionRef = useRef("");
  // Sync active question and speak it
  useEffect(() => {
    if (interview && interview.questions) {
      const idx = interview.currentQuestionIndex;
      if (idx < interview.questions.length) {
        const q = interview.questions[idx];

        // Prevent re-triggering speech for the same question ID if it was already spoken
        // This handles React StrictMode and unrelated state updates
        setCurrentQuestion(q);

        if (lastSpokenQuestionIdRef.current !== q._id) {
          setAnswer('');
          setEvaluation(null);
          setSeconds(0);
          startTimer();

          lastQuestionRef.current = q.question;
          speakQuestion(q.question, q._id);
        }
      } else {
        // All questions answered, auto-finalize
        finalizeInterview();
      }
    }
  }, [interview?.currentQuestionIndex, interview?.questions]);
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
        audio: true,
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

      if (listeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.log("Restart skipped");
        }
      }
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
        setAnswer('');

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
  const speakQuestion = (text, questionId) => {
    if (!ttsEnabled || !synthRef.current) return;

    // Clear any pending speech timeout to prevent race conditions
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }

    synthRef.current.cancel();

    // Mark as spoken immediately to prevent duplicate triggers while waiting for timeout
    lastSpokenQuestionIdRef.current = questionId;

    speechTimeoutRef.current = setTimeout(() => {
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
        speechTimeoutRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error("Speech Error:", event);
        setQuestionSpeaking(false);
        speechTimeoutRef.current = null;
      };

      synthRef.current.speak(utterance);
    }, 200);
  };

  const toggleTts = () => {
    if (ttsEnabled) {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      synthRef.current.cancel();
      setTtsEnabled(false);
    } else {
      setTtsEnabled(true);
      if (currentQuestion) {
        speakQuestion(currentQuestion.question, currentQuestion._id);
      }
    }
  };
  const startListening = () => {
    setAnswer("");
    // finalTranscriptRef.current = "";

    if (!micEnabled) {
      alert("Microphone not enabled");
      return;
    }

    try {
      synthRef.current.cancel();
      setListening(true);
      recognitionRef.current.start();
    } catch (err) {
      console.log("START ERROR:", err);
    }
  };

  const stopListening = () => {
    setListening(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
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
    console.log(
      "Before refresh:",
      interview.currentQuestionIndex,
      interview.questions[interview.currentQuestionIndex]?.question
    );
    // console.log(res.data.interview.questions);
    if (synthRef.current) synthRef.current.cancel();
    // Re-fetch active interview from backend (it has incremented currentQuestionIndex)
    api.get('/interview/active')
      .then(res => {
        if (res.data.success) {

          setAnswer('');
          setEvaluation(null);

          setInterview(res.data.interview);

          console.log(
            "After refresh:",
            res.data.interview.currentQuestionIndex,
            res.data.interview.questions[res.data.interview.currentQuestionIndex]?.question
          );
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
      <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin"></div>
          <Brain className="absolute inset-0 m-auto h-8 w-8 text-cyan-400 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-bold tracking-widest uppercase text-xs">Initializing Neural Link</p>
          <p className="text-slate-500 text-[10px] font-medium">Assembling mock room and synchronizing AI recruiter...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="glass-panel p-8 rounded-3xl border-red-500/20 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Interview Found</h2>
          <p className="text-slate-400 text-sm">We couldn't retrieve your active session.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const progressPercent = interview?.questions?.length > 0
    ? (interview.currentQuestionIndex / interview.questions.length) * 100
    : 0;

  return (
    <div className="flex fixed inset-0 top-16 bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 glow-dot-cyan w-[300px] h-[300px] opacity-20 pointer-events-none"></div>

      {/* LEFT: Recruiter Panel */}
      <div className="w-[400px] flex flex-col border-r border-slate-800/50 bg-[#070b13]/50 backdrop-blur-xl z-20">
        <div className="p-6 h-full flex flex-col gap-6">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Brain className="w-6 h-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                AI Executive Recruiter
              </h1>

              <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">
                Live Neural Session
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 min-h-0">

            {/* Interviewer */}
            <div className="flex-1 rounded-[32px] border border-slate-800 overflow-hidden bg-black relative">

              <div className="absolute top-3 left-3 z-10 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Interviewer
              </div>

              <div className="w-full h-full flex items-center justify-center">
                <RecruiterAvatar speaking={questionSpeaking} />
              </div>

              {questionSpeaking && (
                <div className="absolute top-3 right-3 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [6, 16, 6] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.1
                      }}
                      className="w-1 bg-cyan-400 rounded-full"
                    />
                  ))}
                </div>
              )}

            </div>

            {/* Candidate */}
            <div className="flex-1 rounded-[32px] border border-slate-800 overflow-hidden bg-black relative">

              <div className="absolute top-3 left-3 z-10 text-[10px] text-green-400 font-bold uppercase tracking-wider">
                Candidate
              </div>

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />

            </div>

          </div>

          {/* Audio Viz Panel */}
          <div className="h-28 glass-panel rounded-3xl flex flex-col items-center justify-center px-8 relative overflow-hidden border-slate-800/50 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />

            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 z-10">
              Audio Frequency
            </p>

            <div className="flex items-end gap-1.5 h-10 z-10">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: listening
                      ? [4, Math.random() * 32 + 8, 4]
                      : questionSpeaking
                        ? [4, Math.random() * 16 + 4, 4]
                        : [4, 6, 4],
                    opacity: listening || questionSpeaking ? 1 : 0.2
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.4,
                    delay: i * 0.02
                  }}
                  className={`w-1 rounded-full ${listening ? "bg-green-400" : "bg-cyan-400"
                    }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* CENTER: Conversation Transcript */}
      <div className="flex-1 flex flex-col bg-[#020617] relative z-10 overflow-hidden">
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-10 bg-[#070b13]/30 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px] ${listening ? 'bg-green-500 shadow-green-500/50 animate-pulse' : 'bg-slate-700 shadow-transparent'}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {listening ? 'Neural Input Active' : 'Neural Input Standby'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
              <button
                onClick={toggleTts}
                className={`p-2 rounded-lg transition-all ${ttsEnabled ? 'text-cyan-400 bg-cyan-400/10 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                title={ttsEnabled ? "Mute Recruiter" : "Unmute Recruiter"}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex items-center gap-3 text-slate-400 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-mono font-black tracking-wider text-white">{formatTime(seconds)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
          <AnimatePresence>
            {/* History */}
            {interview.answers?.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className="space-y-10"
              >
                <div className="flex gap-5 max-w-3xl">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800/50 flex-shrink-0 flex items-center justify-center border border-slate-700/50 shadow-xl">
                    <Brain className="w-5 h-5 text-slate-500" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                      AI Recruiter
                    </p>

                    <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-[24px] rounded-tl-none text-sm leading-relaxed text-slate-300 shadow-lg">
                      {item.question}
                    </div>
                  </div>
                </div>

                <div className="flex gap-5 max-w-3xl ml-auto flex-row-reverse">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex-shrink-0 flex items-center justify-center border border-cyan-500/20 shadow-xl">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>

                  <div className="space-y-2 text-right">
                    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mr-1">
                      Candidate
                    </p>

                    <div className="bg-cyan-500/[0.03] border border-cyan-500/20 p-5 rounded-[24px] rounded-tr-none text-sm leading-relaxed text-white shadow-lg">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Current Turn */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              <div className="flex gap-5 max-w-3xl">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex-shrink-0 flex items-center justify-center border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Current Question</p>
                  <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-[24px] rounded-tl-none text-[15px] leading-relaxed text-white shadow-2xl">
                    {currentQuestion?.question}
                  </div>
                </div>
              </div>

              {(answer || listening) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-5 max-w-3xl ml-auto flex-row-reverse"
                >
                  <div className={`w-10 h-10 rounded-2xl ${listening ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'} flex-shrink-0 flex items-center justify-center transition-all duration-500`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-2 text-right flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest mr-1 ${listening ? 'text-green-500' : 'text-cyan-500'}`}>
                      {listening ? 'Real-time Transcription' : 'Your Response'}
                    </p>
                    <div className={`${listening ? 'bg-green-500/[0.03] border-green-500/30' : 'bg-cyan-500/[0.03] border-cyan-500/30'} border p-6 rounded-[24px] rounded-tr-none text-[15px] leading-relaxed text-white shadow-2xl min-h-[100px]`}>
                      {answer || <span className="text-slate-600 italic animate-pulse">Processing audio input...</span>}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {submitLoading && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-4 bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-full shadow-xl">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">AI analysis in progress</span>
              </div>
            </div>
          )}
        </main>

        <footer className="p-8 bg-[#070b13]/80 backdrop-blur-2xl border-t border-slate-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] shrink-0">
          <form onSubmit={handleAnswerSubmit} className="max-w-4xl mx-auto flex gap-6">
            <button
              type="button"
              disabled={questionSpeaking || submitLoading}
              onClick={() => listening ? stopListening() : startListening()}
              className={`flex-1 h-16 rounded-[20px] flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest transition-all duration-300 ${listening
                ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:bg-red-600'
                : 'bg-white text-black hover:bg-slate-200 shadow-xl'
                } disabled:opacity-30 disabled:grayscale`}
            >
              {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              {listening ? 'Terminate Input' : 'Initiate Response'}
            </button>

            <button
              type="submit"
              disabled={!answer || submitLoading || listening}
              className="w-16 h-16 rounded-[20px] bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-all duration-300 disabled:opacity-20 disabled:grayscale shadow-[0_0_30px_rgba(99,102,241,0.3)] group"
            >
              {submitLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Send className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
            </button>
          </form>
        </footer>
      </div>

      {/* RIGHT: Status & Intelligence */}
      <div className="w-[350px] border-l border-slate-800/50 bg-[#070b13]/50 backdrop-blur-xl flex flex-col z-20 overflow-hidden">
        <div className="p-8 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
          {/* Session Status */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Session Intelligence</h3>
            <div className="glass-panel p-5 rounded-[24px] border-slate-800/50 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${questionSpeaking ? 'bg-yellow-400 shadow-yellow-400/50 animate-pulse' :
                    listening ? 'bg-green-400 shadow-green-400/50 animate-pulse' :
                      submitLoading ? 'bg-indigo-400 shadow-indigo-400/50 animate-spin' :
                        'bg-slate-600'
                    }`} />
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">
                    {questionSpeaking ? 'Speaking' : listening ? 'Listening' : submitLoading ? 'Analyzing' : 'Ready'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[2px]">
                <div
                  className={`h-full rounded-full transition-all duration-700 shadow-[0_0_10px] ${questionSpeaking ? 'bg-yellow-400 shadow-yellow-400/30' :
                    listening ? 'bg-green-400 shadow-green-400/30' :
                      submitLoading ? 'bg-indigo-400 shadow-indigo-400/30' :
                        'bg-slate-600'
                    }`}
                  style={{ width: questionSpeaking || listening || submitLoading ? '100%' : '20%' }}
                />
              </div>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Interview Timeline</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold px-1">
                <span className="text-slate-500 uppercase tracking-tighter">Total Questions</span>
                <span className="text-white">{interview.currentQuestionIndex + 1} <span className="text-slate-600">/</span> {interview.questions.length}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Analysis Metrics */}
          {evaluation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 pt-4 border-t border-slate-800/50"
            >
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Neural Evaluation</h3>
                <div className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1 rounded-lg border border-indigo-500/20">
                  <Star className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                  <span className="text-sm font-black text-white">{evaluation.score}<span className="text-[10px] text-indigo-400 ml-0.5">/10</span></span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Relevance', val: evaluation.relevance, color: 'bg-cyan-500' },
                  { label: 'Accuracy', val: evaluation.accuracy, color: 'bg-indigo-500' },
                  { label: 'Communication', val: evaluation.communication, color: 'bg-violet-500' }
                ].map(item => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase px-1">
                      <span>{item.label}</span>
                      <span className="text-white">{item.val * 10}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val * 10}%` }}
                        className={`h-full ${item.color} shadow-[0_0_10px] shadow-inherit`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Feedback</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">"{evaluation.feedback}"</p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-cyan-400 hover:text-black transition-all duration-300 shadow-xl"
              >
                {interview.currentQuestionIndex + 1 >= interview.questions.length ? 'Finalize Report' : 'Next Question'}
              </button>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-30">
              <MessageSquare className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Awaiting Answer</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-800/50 shrink-0">
          <div className="flex items-center gap-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Health</p>
              <p className="text-[10px] text-green-500 font-bold">Neural Link Optimal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InterviewRoomPage;