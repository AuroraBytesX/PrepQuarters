import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Award,
  TrendingUp,
  Building,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  Code,
  List,
  Activity,
  Bot,
  Radio,
  Loader2,
  HelpCircle,
  FileText,
  Terminal,
  Play,
  Check,
  Download,
  X,
} from "lucide-react";
import "./AIInterviewSession.css";

function AIInterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestionsPlanned, setTotalQuestionsPlanned] = useState(5);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState(null);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [finalScorecard, setFinalScorecard] = useState(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState(0);

  // New Interview-focused features: Hint / Clarification, Reference Solution, and Architecture Scratchpad
  const [showHint, setShowHint] = useState(false);
  const [hintRequested, setHintRequested] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [showScaleEstimator, setShowScaleEstimator] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadText, setScratchpadText] = useState("");

  // AI Coding Interactive Interviewer Chat & Pair-Programming Assistant
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your AI Technical Interviewer for this AI Coding session. You can ask clarification questions on requirements, explain your planned approach, or discuss time and space complexity before or during implementation.",
    },
  ]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // System Design Dedicated Tabs
  const [systemDesignTab, setSystemDesignTab] = useState("overview");

  // Coding Workspace States
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeResults, setCodeResults] = useState(null);
  const [codeExecutionOutput, setCodeExecutionOutput] = useState("");

  // Voice Pipeline States
  const [isListening, setIsListening] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoTTS, setAutoTTS] = useState(
    location.state?.session?.autoTTS !== undefined
      ? Boolean(location.state.session.autoTTS)
      : location.state?.session?.modalityConfig?.autoTTS !== undefined
      ? Boolean(location.state.session.modalityConfig.autoTTS)
      : true
  );
  const [micStatusMessage, setMicStatusMessage] = useState("");
  const [micAudioVolume, setMicAudioVolume] = useState(0);
  const [lastTranscribedText, setLastTranscribedText] = useState("");
  const [error, setError] = useState("");

  const timerRef = useRef(null);
  const isListeningRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
  };

  // Text-To-Speech function for AI Interviewer
  const speakText = (text) => {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")) &&
        v.lang.startsWith("en")
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Primary Voice Dictation Toggle via MediaRecorder & Groq Whisper
  const toggleSpeechRecognition = async () => {
    setMicStatusMessage("");
    setError("");

    if (isListening) {
      stopVoiceRecording();
    } else {
      await startVoiceRecording();
    }
  };

  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("[STT_ERROR] navigator.mediaDevices.getUserMedia is not supported");
        setMicStatusMessage("Audio recording is not supported in this browser environment. Please use typed input.");
        return;
      }

      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.info("[MIC_GRANTED] Microphone permission successfully acquired.");
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // 2. Real-time audio volume visualizer using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkVolume = () => {
          if (!isListeningRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicAudioVolume(Math.min(100, Math.round((avg / 128) * 100)));
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (audioErr) {
        console.warn("[Voice Pipeline] AudioContext visualizer notice:", audioErr.message);
      }

      // 3. Initialize MediaRecorder for server-side Whisper STT
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/ogg")
        ? "audio/ogg"
        : "audio/wav";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250); // Collect chunk every 250ms
      mediaRecorderRef.current = mediaRecorder;
      console.info(`[RECORDING_STARTED] MediaRecorder recording audio (${mimeType})...`);

      isListeningRef.current = true;
      setIsListening(true);
      setMicStatusMessage("Listening... Speak your architectural reasoning clearly.");
    } catch (err) {
      console.error("[STT_ERROR] Microphone access error:", err);
      setMicStatusMessage("Could not access microphone. Please check browser microphone permissions.");
      setIsListening(false);
    }
  };

  const stopVoiceRecording = async () => {
    isListeningRef.current = false;
    setIsListening(false);
    setMicAudioVolume(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Process recorded audio through server STT
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      setIsTranscribingAudio(true);
      setMicStatusMessage("Finalizing audio stream for neural transcription...");

      const recorder = mediaRecorderRef.current;
      recorder.onstop = async () => {
        try {
          if (audioChunksRef.current.length > 0) {
            const mimeType = recorder.mimeType || "audio/webm";
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            console.info(`[AUDIO_BLOB_CREATED] Audio Blob created (${audioBlob.size} bytes, ${mimeType}).`);

            if (audioBlob.size > 400) {
              const token = localStorage.getItem("prepquartersToken");
              const formData = new FormData();
              formData.append("audio", audioBlob, "answer_recording.webm");

              console.info("[AUDIO_UPLOADED] Uploading audio blob to backend STT endpoint...");
              console.info("[STT_REQUEST_SENT] Dispatching transcription request to Groq Whisper...");
              setMicStatusMessage("Transcribing audio via neural Whisper pipeline...");

              const res = await fetch("http://localhost:5000/api/interview/transcribe-audio", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              });

              const data = await res.json();
              console.info("[STT_RESPONSE_RECEIVED] Backend response received:", data.success ? "SUCCESS" : "FAILED", data.provider);

              if (res.ok && data.success && data.transcript && data.transcript.trim()) {
                const serverText = data.transcript.trim();
                console.info("[TRANSCRIPT_RECEIVED] Speech transcript received successfully.");

                setCandidateAnswer((prev) => {
                  if (prev.includes(serverText)) return prev;
                  const sep = prev && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "";
                  return prev + sep + serverText;
                });

                setLastTranscribedText(serverText);
                console.info("[TRANSCRIPT_RENDERED] Transcript successfully rendered into response terminal.");
                setMicStatusMessage(`Transcribed via ${data.provider}: "${serverText.slice(0, 60)}${serverText.length > 60 ? "..." : ""}"`);
              } else {
                const msg = data.message || "Voice captured. To enable cloud Whisper, add GROQ_API_KEY (free at console.groq.com) in server/.env. Keyboard input is always active.";
                console.warn("[STT_ERROR] Server transcription response message:", msg);
                setMicStatusMessage(msg);
              }
            } else {
              console.warn("[STT_ERROR] Audio blob too small or empty (<400 bytes).");
              setMicStatusMessage("Audio recording was too brief. Please speak for at least 1-2 seconds.");
            }
          }
        } catch (sttErr) {
          console.error("[STT_ERROR] Network or server error during transcription:", sttErr);
          setMicStatusMessage("Could not connect to transcription service. You can type your response directly.");
        } finally {
          setIsTranscribingAudio(false);
          cleanupAudioStream();
        }
      };

      recorder.stop();
    } else {
      cleanupAudioStream();
    }
  };

  const cleanupAudioStream = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
  };

  // Initialize session from navigation state or fetch from backend
  useEffect(() => {
    const token = localStorage.getItem("prepquartersToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const state = location.state;
    if (state?.sessionId) {
      fetchSessionState(state.sessionId, token);
    } else {
      navigate("/practice/ai-interview/setup", { replace: true });
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [location.state, navigate]);

  // Session question timer
  useEffect(() => {
    if (!isSessionCompleted && currentQuestion) {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
        setTotalSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionCompleted, currentQuestionIndex, currentQuestion]);

  // Speak question automatically when question changes
  useEffect(() => {
    if (currentQuestion && autoTTS && !evaluationFeedback && !isSessionCompleted) {
      const timer = setTimeout(() => {
        speakText(currentQuestion.questionText);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, autoTTS, evaluationFeedback, isSessionCompleted]);

  const fetchSessionState = async (sessionId, token) => {
    try {
      const res = await fetch(`http://localhost:5000/api/interview/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load interview session.");

      const data = await res.json();
      if (data.success && data.session) {
        const s = data.session;
        setSession(s);
        setCurrentQuestionIndex(s.currentQuestionIndex);
        setTotalQuestionsPlanned(s.totalQuestionsPlanned || 5);

        if (s.status === "completed" && s.overallEvaluation) {
          setIsSessionCompleted(true);
          setFinalScorecard(s.overallEvaluation);
        } else if (s.questions && s.questions[s.currentQuestionIndex]) {
          const q = s.questions[s.currentQuestionIndex];
          setCurrentQuestion(q);
          if (q.evaluation && q.candidateAnswer) {
            setCandidateAnswer(q.candidateAnswer);
            setEvaluationFeedback(q.evaluation);
          } else if (q.questionType === "Coding" && q.starterCode) {
            setCandidateAnswer(q.starterCode);
          }
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load session.");
    }
  };

  const runCode = async () => {
    if (!currentQuestion || isRunningCode) return;
    setIsRunningCode(true);
    setCodeResults(null);
    setCodeExecutionOutput("");

    try {
      const token = localStorage.getItem("prepquartersToken");
      const res = await fetch(`http://localhost:5000/api/interview/${session._id}/run-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: candidateAnswer || currentQuestion.starterCode || "",
          language: currentQuestion.programmingLanguage || "javascript",
          testCases: currentQuestion.testCases || [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCodeResults(data.results);
        setCodeExecutionOutput(data.executionOutput);
      } else {
        setCodeExecutionOutput(data.message || "Code execution failed.");
      }
    } catch (err) {
      setCodeExecutionOutput("Execution error: " + err.message);
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!candidateAnswer.trim() || isSubmitting) return;

    if (isListening) {
      stopVoiceRecording();
    }
    stopSpeaking();

    setError("");
    setIsSubmitting(true);

    const token = localStorage.getItem("prepquartersToken");

    try {
      const res = await fetch(`http://localhost:5000/api/interview/${session._id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateAnswer: candidateAnswer.trim(),
          timeSpentSeconds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to evaluate candidate answer.");
      }

      if (data.retryRequired) {
        setError(`${data.message} ${data.retryPrompt || ""}`);
        if (autoTTS) {
          speakText(data.message || "Please provide a more detailed technical response.");
        }
        return;
      }

      setEvaluationFeedback(data.evaluation);

      // Conversational AI spoken feedback
      if (autoTTS && data.evaluation) {
        const feedbackSpeech = `Score: ${data.evaluation.score} out of 10. ${data.evaluation.technicalAccuracy}`;
        speakText(feedbackSpeech);
      }

      if (data.isCompleted) {
        setIsSessionCompleted(true);
        setFinalScorecard(data.overallEvaluation);
      } else if (data.nextQuestion) {
        setSession((prev) => ({
          ...prev,
          _nextQuestionStaged: data.nextQuestion,
          _nextIndexStaged: data.currentQuestionIndex,
        }));
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Evaluation request failed. Please verify backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishSessionEarly = async () => {
    if (!session || isSubmitting) return;
    setIsSubmitting(true);
    stopSpeaking();

    try {
      const token = localStorage.getItem("prepquartersToken");
      const res = await fetch(`http://localhost:5000/api/interview/${session._id}/finish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success && data.overallEvaluation) {
        setIsSessionCompleted(true);
        setFinalScorecard(data.overallEvaluation);
      }
    } catch (err) {
      console.error("Error finalizing session:", err);
      setError("Failed to finalize session scorecard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToNext = () => {
    stopSpeaking();
    setShowHint(false);
    setHintRequested(false);
    setShowSolutionModal(false);
    setActiveHintIndex(0);
    if (session?._nextQuestionStaged) {
      const nextQ = session._nextQuestionStaged;
      setCurrentQuestion(nextQ);
      setCurrentQuestionIndex(session._nextIndexStaged);
      setCandidateAnswer(nextQ.questionType === "Coding" && nextQ.starterCode ? nextQ.starterCode : "");
      setEvaluationFeedback(null);
      setTimeSpentSeconds(0);
      setMicStatusMessage("");
      setLastTranscribedText("");
      setCodeResults(null);
      setCodeExecutionOutput("");
      setSession((prev) => ({
        ...prev,
        _nextQuestionStaged: null,
        _nextIndexStaged: null,
      }));
    }
  };

  const handleSendAIChat = (customText) => {
    const textToSend = customText || aiChatInput;
    if (!textToSend || !textToSend.trim()) return;

    const userMessage = { sender: "user", text: textToSend.trim() };
    setAiChatMessages((prev) => [...prev, userMessage]);
    setAiChatInput("");
    setIsAiThinking(true);

    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let aiResponseText = "";

      if (lower.includes("negative") || lower.includes("constraint") || lower.includes("edge case") || lower.includes("null") || lower.includes("empty")) {
        aiResponseText = "Great clarifying question. Assume the input numbers can be negative, zero, or positive, and numbers may be duplicated. You should return the correct zero-indexed indices or handle edge cases cleanly.";
      } else if (lower.includes("approach") || lower.includes("hash map") || lower.includes("map") || lower.includes("two pointer") || lower.includes("o(n)") || lower.includes("sliding window")) {
        aiResponseText = "Your proposed approach sounds solid. A Hash Map allows O(1) average lookup for the complement, achieving an overall O(n) runtime. Make sure you check if the complement exists before inserting the current number to avoid using the same element twice.";
      } else if (lower.includes("space") || lower.includes("memory") || lower.includes("time complexity") || lower.includes("big-o")) {
        aiResponseText = "Regarding complexity: A Hash Map requires O(n) auxiliary space to store elements. An in-place two-pointer approach would require O(1) extra space, but sorting first would increase time complexity to O(n log n).";
      } else if (lower.includes("debug") || lower.includes("fail") || lower.includes("test") || lower.includes("error")) {
        aiResponseText = "Check your loop boundaries and return structure. Verify that you return an array of 2 indices `[complementIndex, currentIndex]` and that you handle cases where no matching pair exists by returning `[]`.";
      } else {
        aiResponseText = `Understood. In this scenario on ${currentQuestion?.subtopic || currentQuestion?.topic || "Algorithms"}, articulate your assumptions, implement the logic, and click "Run Test Cases" to verify correctness before submitting.`;
      }

      setAiChatMessages((prev) => [...prev, { sender: "ai", text: aiResponseText }]);
      setIsAiThinking(false);
    }, 500);
  };

  const insertSnippet = (snippet) => {
    setCandidateAnswer((prev) => prev + snippet);
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const wordCount = candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0;

  // 1. FINAL NEURAL SCORECARD VIEW
  if (isSessionCompleted && finalScorecard) {
    const hireRec = finalScorecard.hireRecommendation || "Hire";
    const isHire = hireRec.includes("Hire") && !hireRec.includes("No Hire");

    return (
      <main className="ai-session-page results-page bg-grid-cyber">
        <section className="results-container">
          <div className="results-header-banner">
            <p className="results-eyebrow">
              <span className="pulse-dot cyan" />
              <span>NEURAL EVALUATION COMPLETE // SCORECARD GENERATED</span>
            </p>
            <h1>Candidate Performance Scorecard</h1>
            <p className="results-subtitle">
              Session evaluated for <strong>{session?.role}</strong> ({session?.domain}) under the{" "}
              <strong>{session?.companyStyle}</strong> evaluation benchmark.
            </p>

            <div className="scorecard-top-summary">
              <div className="overall-score-box">
                <span className="score-number">{finalScorecard.overallScore}%</span>
                <span className="score-label">Overall Readiness Score</span>
              </div>

              <div className="hire-decision-box">
                <span className={`hire-pill ${isHire ? "positive" : "negative"}`}>
                  {finalScorecard.hireRecommendation}
                </span>
                <span className="hire-label">Hiring Decision Benchmark</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="results-card">
            <h3>Executive Evaluation Summary</h3>
            <p className="summary-body-text">{finalScorecard.summaryText}</p>

            <div className="evaluation-columns">
              <div className="eval-col strengths-col">
                <h4>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Key Strengths Demonstrated
                </h4>
                <ul>
                  {finalScorecard.keyStrengths?.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>

              <div className="eval-col growth-col">
                <h4>
                  <TrendingUp size={16} aria-hidden="true" />
                  Priority Growth Areas
                </h4>
                <ul>
                  {finalScorecard.priorityImprovementAreas?.map((im, i) => (
                    <li key={i}>{im}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Domain Skill Gap Matrix */}
          <div className="results-card">
            <h3>Domain Competency Gap Matrix</h3>
            <p className="summary-body-text">
              Detailed assessment of technical competencies tested during your mock session.
            </p>

            <div className="skill-gap-list">
              {finalScorecard.skillGapAnalysis?.map((item, idx) => (
                <div className="skill-gap-card" key={idx}>
                  <div className="skill-gap-card-header">
                    <div>
                      <strong>{item.skillName}</strong>
                      <span className="skill-cat-label">{item.category}</span>
                    </div>
                    <div className="skill-score-group">
                      <span className="skill-score-num">{item.score}%</span>
                      <span
                        className={`status-pill ${item.status?.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-progress"
                      style={{ width: `${Math.min(100, Math.max(10, item.score))}%` }}
                    />
                  </div>

                  <p className="gap-desc">{item.gapDescription}</p>
                  {item.recommendedAction && (
                    <div className="recommended-action-box">
                      <strong>Recommended Practice:</strong> {item.recommendedAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Preparation Roadmap */}
          {finalScorecard.personalizedPreparationPlan && (
            <div className="results-card">
              <h3>Personalized Preparation Roadmap</h3>
              <div className="roadmap-steps-list">
                {finalScorecard.personalizedPreparationPlan.map((step) => (
                  <div className="roadmap-step-item" key={step.step}>
                    <span className="step-badge">{step.step}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="results-actions-row">
            <button
              type="button"
              className="results-primary-btn"
              onClick={() => {
                const lines = [
                  `# PrepQuarters Candidate Evaluation Report`,
                  `**Role:** ${session?.role || "Candidate"} | **Domain:** ${session?.domain || "Software Engineering"} | **Difficulty:** ${session?.difficulty || "Hard"}`,
                  `**Company Benchmark:** ${session?.companyStyle || "General Tech"}`,
                  `**Date:** ${new Date().toLocaleDateString()}`,
                  `**Overall Score:** ${finalScorecard.overallScore}% (${finalScorecard.hireRecommendation || "Evaluation Complete"})`,
                  `\n## Executive Summary`,
                  finalScorecard.summaryText || "Mock session completed successfully.",
                ];

                if (finalScorecard.keyStrengths?.length) {
                  lines.push(`\n## Key Strengths`);
                  finalScorecard.keyStrengths.forEach((s) => lines.push(`- ${s}`));
                }

                if (finalScorecard.priorityImprovementAreas?.length) {
                  lines.push(`\n## Priority Improvement Areas`);
                  finalScorecard.priorityImprovementAreas.forEach((im) => lines.push(`- ${im}`));
                }

                if (finalScorecard.skillGapAnalysis?.length) {
                  lines.push(`\n## Competency Gap Analysis`);
                  finalScorecard.skillGapAnalysis.forEach((g) => {
                    lines.push(`### ${g.skillName} (${g.score}% // ${g.status})`);
                    lines.push(`${g.gapDescription}`);
                    if (g.recommendedAction) lines.push(`**Action:** ${g.recommendedAction}`);
                  });
                }

                if (finalScorecard.personalizedPreparationPlan?.length) {
                  lines.push(`\n## Personalized Preparation Plan`);
                  finalScorecard.personalizedPreparationPlan.forEach((p) => {
                    lines.push(`${p.step}. **${p.title}:** ${p.action}`);
                  });
                }

                const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `PrepQuarters_Evaluation_${(session?.domain || "General").replace(/\s+/g, "_")}_${Date.now()}.md`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={16} aria-hidden="true" />
              <span>Download Evaluation Report (.md)</span>
            </button>

            <button
              type="button"
              className="results-secondary-btn"
              onClick={() => navigate("/dashboard")}
            >
              <span>Return to Command Center</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="results-secondary-btn"
              onClick={() => navigate(`/practice/progress`)}
            >
              <TrendingUp size={15} aria-hidden="true" />
              <span>View Updated Skill Analytics</span>
            </button>

            <button
              type="button"
              className="results-secondary-btn"
              onClick={() => navigate(`/practice/replay/${session._id}`)}
            >
              <RotateCcw size={15} aria-hidden="true" />
              <span>Review Transcript Replay</span>
            </button>

            <button
              type="button"
              className="results-tertiary-btn"
              onClick={() => navigate("/practice/ai-interview/setup")}
            >
              <Sparkles size={15} aria-hidden="true" />
              <span>Launch Next Mock Session</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  // 2. ACTIVE AI INTERVIEW COCKPIT ROOM
  return (
    <main className="ai-session-page bg-grid-cyber">
      <section className="ai-session-container">
        {/* Cockpit Telemetry Bar */}
        <header className="session-top-bar">
          <div className="session-info-left">
            <div className="session-breadcrumbs">
              <span>{session?.domain || "Software Engineering"}</span>
              <ChevronRight size={14} aria-hidden="true" />
              <strong>{session?.role || "Candidate"}</strong>
            </div>

            <div className="session-badge-row">
              <span className={`badge-diff ${session?.difficulty?.toLowerCase()}`}>
                {session?.difficulty} Mode
              </span>
              <span className="badge-company">
                <Building size={12} aria-hidden="true" />
                {session?.companyStyle} Benchmark
              </span>
              {currentQuestion?.isFollowUp && (
                <span className="badge-followup">
                  <Zap size={12} aria-hidden="true" />
                  Adaptive Follow-up Probe
                </span>
              )}
            </div>
          </div>

          <div className="session-progress-right">
            {/* TTS Audio Controls */}
            <button
              type="button"
              className="tts-toggle-btn"
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else if (currentQuestion) {
                  speakText(currentQuestion.questionText);
                }
              }}
              title={isSpeaking ? "Stop Speaking" : "Listen to Question"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: isSpeaking ? "rgba(6, 182, 212, 0.2)" : "var(--bg-surface-2)",
                border: isSpeaking ? "1px solid var(--cyan-bright)" : "1px solid var(--border-subtle)",
                color: isSpeaking ? "var(--cyan-bright)" : "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isSpeaking ? "Speaking..." : "Read Aloud"}</span>
            </button>

            {/* Time-Based Live Countdown Timer */}
            {(() => {
              const sessionDurationMinutes = session?.sessionDurationMinutes || (parseInt(session?.selectedDuration, 10) || 10);
              const sessionTotalSecsLimit = sessionDurationMinutes * 60;
              const remainingSessionSeconds = Math.max(0, sessionTotalSecsLimit - totalSessionSeconds);
              const isTimeCritical = remainingSessionSeconds <= 60 && remainingSessionSeconds > 0;

              return (
                <div
                  className="session-timer"
                  style={{
                    borderColor: isTimeCritical ? "rgba(239, 68, 68, 0.6)" : undefined,
                    color: isTimeCritical ? "#f87171" : undefined,
                    background: isTimeCritical ? "rgba(239, 68, 68, 0.1)" : undefined,
                  }}
                >
                  <Clock size={15} aria-hidden="true" />
                  <span>Time Left: {formatTimer(remainingSessionSeconds)}</span>
                </div>
              );
            })()}

            <button
              type="button"
              className="dashboard-secondary-btn"
              style={{ padding: "6px 12px", fontSize: "11px", fontWeight: "700" }}
              onClick={handleFinishSessionEarly}
              title="Finish interview session and generate final scorecard"
            >
              <span>Finish Interview</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="session-error-banner" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Neural Question Module */}
        <div className="session-question-card">
          <div className="question-card-meta">
            <span className="question-index-pill">
              SCENARIO #{String(currentQuestionIndex + 1).padStart(2, "0")}
            </span>
            <span className="question-topic-pill">{currentQuestion?.topic || "Core Architecture"}</span>
            {isSpeaking && (
              <span className="luminous-badge cyan" style={{ marginLeft: "auto" }}>
                <span className="pulse-dot cyan" />
                <span>Interviewer Voice Active</span>
              </span>
            )}
          </div>

          <h2 className="interview-question-text">
            {currentQuestion?.questionText || "Calibrating next scenario..."}
          </h2>

          {currentQuestion?.followUpReason && (
            <p className="followup-context-note">
              <strong>Interviewer Follow-up:</strong> {currentQuestion.followUpReason}
            </p>
          )}

          {/* Scenario Helper Actions: Hint, Solution, Scale, Scratchpad */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
            {/* 1. Progressive Hint Action */}
            <button
              type="button"
              onClick={() => {
                setShowHint(!showHint);
                setHintRequested(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "8px",
                background: showHint ? "rgba(245, 158, 11, 0.15)" : "var(--bg-surface-2)",
                border: showHint ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--border-subtle)",
                color: showHint ? "#fbbf24" : "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <HelpCircle size={13} />
              <span>{showHint ? "Hide Hint" : "Request Hint"}</span>
            </button>

            {/* 2. View Reference Solution (Only unlocked after requesting a hint - never pre-revealed) */}
            {hintRequested && (currentQuestion?.questionType === "Coding" || currentQuestion?.referenceSolution) && (
              <button
                type="button"
                onClick={() => setShowSolutionModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  background: "rgba(168, 85, 247, 0.12)",
                  border: "1px solid rgba(168, 85, 247, 0.35)",
                  color: "#c084fc",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Code size={13} />
                <span>View Reference Solution Benchmark</span>
              </button>
            )}

            {/* 3. System Design Scale Estimator */}
            {(session?.interviewType === "System Design Interview" || currentQuestion?.questionType === "System Design") && (
              <button
                type="button"
                onClick={() => setShowScaleEstimator(!showScaleEstimator)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  background: showScaleEstimator ? "rgba(16, 185, 129, 0.15)" : "var(--bg-surface-2)",
                  border: showScaleEstimator ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border-subtle)",
                  color: showScaleEstimator ? "#34d399" : "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Activity size={13} />
                <span>{showScaleEstimator ? "Close Scale Estimator" : "Scale Estimator"}</span>
              </button>
            )}

            {/* 4. Architecture Scratchpad */}
            <button
              type="button"
              onClick={() => setShowScratchpad(!showScratchpad)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "8px",
                background: showScratchpad ? "rgba(6, 182, 212, 0.15)" : "var(--bg-surface-2)",
                border: showScratchpad ? "1px solid rgba(6, 182, 212, 0.4)" : "1px solid var(--border-subtle)",
                color: showScratchpad ? "var(--cyan-bright)" : "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <Terminal size={13} />
              <span>{showScratchpad ? "Close Scratchpad" : "Technical Scratchpad"}</span>
            </button>
          </div>

          {/* Progressive Hint Box */}
          {showHint && (
            <div
              style={{
                marginTop: "14px",
                padding: "14px 18px",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                fontSize: "13px",
                color: "#fde68a",
                lineHeight: "1.5",
              }}
            >
              {Array.isArray(currentQuestion?.hints) && currentQuestion.hints.length > 0 ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <strong>Hint {activeHintIndex + 1} of {currentQuestion.hints.length}:</strong>
                    {currentQuestion.hints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveHintIndex((prev) => (prev + 1) % currentQuestion.hints.length)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fbbf24",
                          fontSize: "11px",
                          fontWeight: "700",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        Next Hint ({((activeHintIndex + 1) % currentQuestion.hints.length) + 1})
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0 }}>{currentQuestion.hints[activeHintIndex]}</p>
                </div>
              ) : (
                <div>
                  <strong>Interviewer Clarifying Prompt:</strong> For this scenario on {currentQuestion?.topic || "Technical Depth"}, articulate your system assumptions, consider data flow latency and failure modes, and compare at least two distinct design trade-offs.
                </div>
              )}
            </div>
          )}

          {/* System Design Scale & Throughput Estimator */}
          {showScaleEstimator && (
            <div
              style={{
                marginTop: "14px",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.06)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <h4 style={{ color: "#34d399", fontSize: "14px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={16} />
                <span>Distributed Scale & Throughput Calculator</span>
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", fontSize: "12px" }}>
                <div style={{ padding: "10px", borderRadius: "8px", background: "var(--bg-surface-2)" }}>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Daily Active Users (DAU)</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>50,000,000 Users</strong>
                </div>
                <div style={{ padding: "10px", borderRadius: "8px", background: "var(--bg-surface-2)" }}>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Peak Query Load (QPS)</span>
                  <strong style={{ color: "#34d399", fontSize: "14px" }}>100,000 - 250,000 RPS</strong>
                </div>
                <div style={{ padding: "10px", borderRadius: "8px", background: "var(--bg-surface-2)" }}>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Read:Write Traffic Ratio</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>10:1 (Read-Heavy Cache)</strong>
                </div>
                <div style={{ padding: "10px", borderRadius: "8px", background: "var(--bg-surface-2)" }}>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Annual Data Ingestion</span>
                  <strong style={{ color: "#fbbf24", fontSize: "14px" }}>~630 Terabytes/Year</strong>
                </div>
              </div>
            </div>
          )}

          {/* Architecture Scratchpad Panel */}
          {showScratchpad && (
            <div
              style={{
                marginTop: "14px",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(3, 7, 18, 0.9)",
                border: "1px solid rgba(6, 182, 212, 0.35)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: "700", color: "var(--cyan-bright)" }}>
                  TECHNICAL SCRATCHPAD // PSEUDO-CODE & SCHEMAS
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (scratchpadText.trim()) {
                      insertSnippet(`\n\`\`\`\n${scratchpadText.trim()}\n\`\`\`\n`);
                      setShowScratchpad(false);
                    }
                  }}
                  disabled={!scratchpadText.trim()}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "var(--cyan-core)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Insert Into Answer
                </button>
              </div>
              <textarea
                style={{
                  width: "100%",
                  height: "100px",
                  background: "var(--bg-void)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "#38bdf8",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  resize: "vertical",
                }}
                placeholder="// Type pseudo-code, SQL queries, or architectural block diagrams here..."
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Candidate Response Workspace */}
        {!evaluationFeedback && (
          <form className="session-answer-form" onSubmit={handleAnswerSubmit}>
            {/* 1. APTITUDE MCQ ROUND WORKSPACE */}
            {currentQuestion?.questionType === "Aptitude" && Array.isArray(currentQuestion.aptitudeOptions) && currentQuestion.aptitudeOptions.length > 0 ? (
              <div className="aptitude-workspace-deck">
                <div className="answer-header">
                  <label>Select the Correct Option</label>
                  <span style={{ fontSize: "12px", color: "var(--cyan-bright)", fontWeight: "600" }}>
                    Quantitative & Logical Deductions
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginTop: "12px" }}>
                  {currentQuestion.aptitudeOptions.map((opt, idx) => {
                    const optLetter = String.fromCharCode(65 + idx);
                    const isSelected = candidateAnswer.startsWith(optLetter) || candidateAnswer === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCandidateAnswer(opt)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "14px 18px",
                          borderRadius: "10px",
                          background: isSelected ? "rgba(6, 182, 212, 0.14)" : "var(--bg-surface-2)",
                          border: isSelected ? "1px solid var(--cyan-bright)" : "1px solid var(--border-subtle)",
                          color: isSelected ? "var(--cyan-bright)" : "var(--text-primary)",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "800",
                            fontSize: "13px",
                            background: isSelected ? "var(--cyan-core)" : "var(--bg-surface-1)",
                            color: isSelected ? "#ffffff" : "var(--text-secondary)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          {optLetter}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: isSelected ? "600" : "400" }}>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="answer-submit-row" style={{ marginTop: "20px" }}>
                  <div className="answer-guidance-hint">
                    <ShieldCheck size={14} aria-hidden="true" />
                    <span>
                      Select the mathematically verified option to submit for instant derivation review.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="ai-session-submit"
                    disabled={isSubmitting || !candidateAnswer.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Verifying Option...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <Send size={14} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : currentQuestion?.questionType === "Coding" || session?.interviewType === "Coding Interview" || session?.interviewType === "AI Coding Interview" ? (
              /* 2. CODING & AI CODING INTERVIEW WORKSPACE */
              <div className="coding-workspace-deck">
                {/* Special Dual-Pane Header for AI Coding Interview */}
                {session?.interviewType === "AI Coding Interview" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                    {/* Left Sub-Card: AI Interviewer Chat & Pair-Programming Assistance */}
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(129, 140, 248, 0.3)",
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "360px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Bot size={16} style={{ color: "#818cf8" }} />
                          <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>
                            AI Technical Interviewer (Interactive Assistant)
                          </strong>
                        </div>
                        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#818cf8", background: "rgba(129, 140, 248, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                          ACTIVE PROBING
                        </span>
                      </div>

                      {/* Chat Messages Log */}
                      <div
                        style={{
                          flex: 1,
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          marginBottom: "10px",
                          paddingRight: "4px",
                        }}
                      >
                        {aiChatMessages.map((msg, i) => (
                          <div
                            key={i}
                            style={{
                              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                              maxWidth: "90%",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              lineHeight: "1.5",
                              background: msg.sender === "user" ? "rgba(6, 182, 212, 0.2)" : "rgba(30, 41, 59, 0.9)",
                              border: msg.sender === "user" ? "1px solid rgba(6, 182, 212, 0.4)" : "1px solid var(--border-subtle)",
                              color: msg.sender === "user" ? "#e0f2fe" : "var(--text-secondary)",
                            }}
                          >
                            <strong style={{ display: "block", fontSize: "10px", color: msg.sender === "user" ? "var(--cyan-bright)" : "#818cf8", marginBottom: "2px" }}>
                              {msg.sender === "user" ? "Candidate" : "AI Interviewer"}
                            </strong>
                            <span>{msg.text}</span>
                          </div>
                        ))}
                        {isAiThinking && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)", padding: "4px 8px" }}>
                            <Loader2 size={12} className="animate-spin" />
                            <span>AI Interviewer is evaluating...</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Prompt Chips */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                        {[
                          "Clarify Constraints & Edge Cases",
                          "Validate O(n) Hash Map Approach",
                          "Discuss Space Complexity",
                          "Debug Assertion Logic",
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleSendAIChat(chip)}
                            disabled={isAiThinking}
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: "rgba(129, 140, 248, 0.1)",
                              border: "1px solid rgba(129, 140, 248, 0.25)",
                              color: "#c7d2fe",
                              fontSize: "10px",
                              cursor: "pointer",
                            }}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      {/* Chat Input */}
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          value={aiChatInput}
                          onChange={(e) => setAiChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSendAIChat())}
                          placeholder="Ask a question or explain your approach..."
                          style={{
                            flex: 1,
                            padding: "6px 10px",
                            borderRadius: "6px",
                            background: "var(--bg-void)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            fontSize: "12px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSendAIChat()}
                          disabled={!aiChatInput.trim() || isAiThinking}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: "var(--cyan-core)",
                            border: "none",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Send
                        </button>
                      </div>
                    </div>

                    {/* Right Sub-Card: Evaluation Guidance */}
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background: "var(--bg-surface-2)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--cyan-bright)", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                          AI Coding Evaluation Rubric
                        </strong>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
                          In this AI-assisted session, you are evaluated not only on final algorithmic correctness,
                          but also on how effectively you articulate requirements, explore trade-offs with AI assistance,
                          and validate generated assumptions before submitting.
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "4px", background: "rgba(16, 185, 129, 0.1)", color: "#34d399", fontSize: "11px", fontWeight: "700" }}>
                          Algorithmic Correctness
                        </span>
                        <span style={{ padding: "3px 8px", borderRadius: "4px", background: "rgba(6, 182, 212, 0.1)", color: "var(--cyan-bright)", fontSize: "11px", fontWeight: "700" }}>
                          Problem Reasoning
                        </span>
                        <span style={{ padding: "3px 8px", borderRadius: "4px", background: "rgba(245, 158, 11, 0.1)", color: "#fbbf24", fontSize: "11px", fontWeight: "700" }}>
                          AI Verification
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="answer-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label htmlFor="candidate-code-input">Code Editor Workspace</label>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "rgba(6, 182, 212, 0.15)",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                        color: "var(--cyan-bright)",
                        fontSize: "11px",
                        fontWeight: "700",
                        fontFamily: "var(--font-mono)",
                        textTransform: "uppercase",
                      }}
                    >
                      {currentQuestion.programmingLanguage || session?.programmingLanguage || "javascript"}
                    </span>
                  </div>

                  <div className="answer-meta-counts" style={{ gap: "8px" }}>
                    <button
                      type="button"
                      onClick={runCode}
                      disabled={isRunningCode}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: isRunningCode ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        color: "#34d399",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: isRunningCode ? "wait" : "pointer",
                      }}
                    >
                      {isRunningCode ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Running Tests...</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} fill="#34d399" />
                          <span>Run Test Cases</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <textarea
                  id="candidate-code-input"
                  className="ai-session-answer"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    background: "rgba(3, 7, 18, 0.95)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    color: "#7dd3fc",
                    minHeight: "240px",
                  }}
                  placeholder="// Implement your algorithmic solution here..."
                  rows={12}
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  disabled={isSubmitting}
                  required
                />

                {/* Test Results Output Console */}
                {(codeResults || codeExecutionOutput) && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: "var(--bg-void)",
                      border: "1px solid var(--border-subtle)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong style={{ color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase" }}>
                        Test Execution Results
                      </strong>
                      <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                        {codeResults ? `${codeResults.filter((r) => r.passed).length}/${codeResults.length} Passed` : ""}
                      </span>
                    </div>

                    {Array.isArray(codeResults) && codeResults.length > 0 && (
                      <div style={{ display: "grid", gap: "8px", marginBottom: "8px" }}>
                        {codeResults.map((tc, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              background: tc.passed ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                              border: tc.passed ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(239, 68, 68, 0.25)",
                            }}
                          >
                            <div>
                              <span style={{ color: "var(--text-muted)", marginRight: "8px" }}>Case {idx + 1}:</span>
                              <span style={{ color: "var(--text-primary)" }}>{tc.input}</span>
                            </div>
                            <span
                              style={{
                                color: tc.passed ? "#34d399" : "#f87171",
                                fontWeight: "700",
                                fontSize: "11px",
                              }}
                            >
                              {tc.passed ? "PASSED" : "FAILED"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {codeExecutionOutput && (
                      <pre style={{ margin: 0, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                        {codeExecutionOutput}
                      </pre>
                    )}
                  </div>
                )}

                <div className="answer-submit-row" style={{ marginTop: "16px" }}>
                  <div className="answer-guidance-hint">
                    <ShieldCheck size={14} aria-hidden="true" />
                    <span>
                      Evaluated on correctness, time complexity bounds, memory efficiency, and edge case coverage.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="ai-session-submit"
                    disabled={isSubmitting || !candidateAnswer.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Evaluating Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Code Solution</span>
                        <Send size={14} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* 3. STANDARD TECHNICAL, SYSTEM DESIGN, HR & VOICE WORKSPACE */
              <div>
                <div className="answer-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label htmlFor="candidate-answer-input">Candidate Response Terminal</label>

                    {/* Structure helpers */}
                    <div style={{ display: "flex", gap: "6px" }}>
                      {session?.interviewType === "HR / Behavioral Interview" ? (
                        <>
                          <button
                            type="button"
                            title="Insert Situation"
                            onClick={() => insertSnippet("\n[Situation]: ")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "5px",
                              background: "rgba(244, 114, 182, 0.15)",
                              border: "1px solid rgba(244, 114, 182, 0.3)",
                              color: "#f472b6",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            [S] Situation
                          </button>
                          <button
                            type="button"
                            title="Insert Task"
                            onClick={() => insertSnippet("\n[Task]: ")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "5px",
                              background: "rgba(244, 114, 182, 0.15)",
                              border: "1px solid rgba(244, 114, 182, 0.3)",
                              color: "#f472b6",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            [T] Task
                          </button>
                          <button
                            type="button"
                            title="Insert Action"
                            onClick={() => insertSnippet("\n[Action]: ")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "5px",
                              background: "rgba(244, 114, 182, 0.15)",
                              border: "1px solid rgba(244, 114, 182, 0.3)",
                              color: "#f472b6",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            [A] Action
                          </button>
                          <button
                            type="button"
                            title="Insert Result"
                            onClick={() => insertSnippet("\n[Result]: ")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "5px",
                              background: "rgba(244, 114, 182, 0.15)",
                              border: "1px solid rgba(244, 114, 182, 0.3)",
                              color: "#f472b6",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            [R] Result
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            title="Insert Bullet Point"
                            onClick={() => insertSnippet("\n- ")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "5px",
                              background: "var(--bg-surface-2)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-muted)",
                              fontSize: "11px",
                            }}
                          >
                            <List size={12} />
                          </button>
                          <button
                            type="button"
                            title="Insert Code Block"
                            onClick={() => insertSnippet("\n```\n// Code or Architecture\n```\n")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "5px",
                              background: "var(--bg-surface-2)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-muted)",
                              fontSize: "11px",
                            }}
                          >
                            <Code size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="answer-meta-counts">
                    {/* Real-time Voice Toggle Button */}
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      disabled={isTranscribingAudio}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: isListening
                          ? "rgba(239, 68, 68, 0.25)"
                          : isTranscribingAudio
                          ? "rgba(6, 182, 212, 0.2)"
                          : "var(--bg-surface-2)",
                        border: isListening
                          ? "1px solid #ef4444"
                          : isTranscribingAudio
                          ? "1px solid var(--cyan-bright)"
                          : "1px solid var(--border-subtle)",
                        color: isListening ? "#f87171" : isTranscribingAudio ? "var(--cyan-bright)" : "var(--text-secondary)",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: isTranscribingAudio ? "wait" : "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {isTranscribingAudio ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Transcribing Audio...</span>
                        </>
                      ) : isListening ? (
                        <>
                          <Radio size={13} className="animate-pulse" style={{ color: "#ef4444" }} />
                          <span>Recording (Click to Finish)</span>
                        </>
                      ) : (
                        <>
                          <Mic size={13} />
                          <span>Voice Dictation</span>
                        </>
                      )}
                    </button>

                    <span>{wordCount} words</span>
                    <span>{candidateAnswer.length} chars</span>
                  </div>
                </div>

                {/* Audio Spectrum Waveform & Status Indicator when Recording */}
                {isListening && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="pulse-dot red" />
                      <span style={{ fontSize: "13px", color: "#f87171", fontWeight: "600" }}>
                        {micStatusMessage || "Microphone active. Speaking..."}
                      </span>
                    </div>

                    {/* Animated Audio Volume Bars */}
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "18px" }}>
                      {[20, 50, 80, 40, 90, 60, 30].map((baseHeight, i) => {
                        const dynamicHeight = Math.max(4, Math.min(22, (baseHeight * (micAudioVolume + 15)) / 100));
                        return (
                          <span
                            key={i}
                            style={{
                              width: "3px",
                              height: `${dynamicHeight}px`,
                              borderRadius: "2px",
                              background: micAudioVolume > 10 ? "#ef4444" : "rgba(239, 68, 68, 0.4)",
                              transition: "height 0.1s ease",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {micStatusMessage && !isListening && (
                  <div
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      background: "var(--bg-surface-2)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: "12px",
                    }}
                  >
                    {micStatusMessage}
                  </div>
                )}

                <textarea
                  id="candidate-answer-input"
                  className="ai-session-answer"
                  placeholder="Explain your architectural design, core algorithms, trade-offs, concurrency handling, and failure modes... (Voice dictation or typing supported)"
                  rows={9}
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  disabled={isSubmitting}
                  required
                />

                <div className="answer-submit-row">
                  <div className="answer-guidance-hint">
                    <ShieldCheck size={14} aria-hidden="true" />
                    <span>
                      Evaluated across technical accuracy, structure, trade-offs, and operational edge cases.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="ai-session-submit"
                    disabled={isSubmitting || !candidateAnswer.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Evaluating Response...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Response</span>
                        <Send size={14} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Step-by-Step Evaluation Breakdown Panel */}
        {evaluationFeedback && (
          <div className="session-evaluation-panel">
            <div className="eval-panel-header">
              <div className="eval-header-left">
                <Award size={20} aria-hidden="true" />
                <h3>Scenario Evaluation Scorecard</h3>
              </div>
              <div className="eval-score-badge">
                <span className="eval-score-num">{evaluationFeedback.score}</span>
                <span className="eval-score-denom">/ 10</span>
              </div>
            </div>

            <div className="eval-details-grid">
              <div className="eval-section">
                <h4>Technical Depth & Correctness</h4>
                <p>{evaluationFeedback.technicalAccuracy}</p>
              </div>

              <div className="eval-section">
                <h4>Communication & Structure</h4>
                <p>{evaluationFeedback.communicationClarity}</p>
              </div>
            </div>

            {evaluationFeedback.strengths && evaluationFeedback.strengths.length > 0 && (
              <div className="eval-bullet-box strengths">
                <h4>Key Strengths</h4>
                <ul>
                  {evaluationFeedback.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluationFeedback.improvements && evaluationFeedback.improvements.length > 0 && (
              <div className="eval-bullet-box improvements">
                <h4>Priority Improvement Areas</h4>
                <ul>
                  {evaluationFeedback.improvements.map((im, idx) => (
                    <li key={idx}>{im}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluationFeedback.keyMissedPoints && evaluationFeedback.keyMissedPoints.length > 0 && (
              <div className="eval-bullet-box missed">
                <h4>Overlooked Trade-offs & Edge Cases</h4>
                <ul>
                  {evaluationFeedback.keyMissedPoints.map((mp, idx) => (
                    <li key={idx}>{mp}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluationFeedback.suggestedModelAnswer && (
              <div className="model-answer-box">
                <h4>Model Answer Benchmark</h4>
                <p>{evaluationFeedback.suggestedModelAnswer}</p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px", gap: "10px" }}>
              <button
                type="button"
                className="next-question-btn"
                onClick={handleProceedToNext}
              >
                <span>
                  Proceed to Next Scenario (#{currentQuestionIndex + 2})
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="finish-session-btn"
                onClick={handleFinishSessionEarly}
              >
                <span>Conclude & Generate Scorecard</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Reference Solution Modal (Explicitly triggered only, never shown by default) */}
        {showSolutionModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(3, 7, 18, 0.85)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={() => setShowSolutionModal(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "720px",
                maxHeight: "85vh",
                overflowY: "auto",
                background: "var(--bg-surface-1)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Code size={20} style={{ color: "#c084fc" }} />
                  <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>
                    Reference Solution Benchmark
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSolutionModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: "1.5" }}>
                Optimal reference implementation for <strong>{currentQuestion?.topic || "Algorithmic Problem"}</strong> in <strong>{currentQuestion?.programmingLanguage || session?.programmingLanguage || "javascript"}</strong>.
              </p>

              {currentQuestion?.referenceSolution ? (
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentQuestion.referenceSolution);
                      setCopiedSolution(true);
                      setTimeout(() => setCopiedSolution(false), 2000);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#ffffff",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    {copiedSolution ? "Copied!" : "Copy Code"}
                  </button>
                  <pre
                    style={{
                      background: "var(--bg-void)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "16px",
                      color: "#a78bfa",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      lineHeight: "1.6",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {currentQuestion.referenceSolution}
                  </pre>
                </div>
              ) : (
                <div style={{ padding: "16px", borderRadius: "8px", background: "var(--bg-surface-2)", color: "var(--text-muted)", fontSize: "13px" }}>
                  No reference solution is configured for this specific conceptual prompt.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  type="button"
                  className="results-primary-btn"
                  onClick={() => setShowSolutionModal(false)}
                >
                  Close Reference Solution
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default AIInterviewSession;
