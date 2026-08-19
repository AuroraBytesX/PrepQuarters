import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Sliders,
  Building,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Code,
  Database,
  Briefcase,
  Layout,
  Cloud,
  Users,
  ShieldCheck,
  Zap,
  Radio,
  Terminal,
  Activity,
  Award,
  Clock,
  Mic,
  Volume2,
  VolumeX,
  Check,
  Plus,
  HelpCircle,
  Binary,
  GitBranch,
  BrainCircuit,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import "./InterviewSetup.css";

const MODALITIES = [
  {
    id: "voice_technical",
    name: "AI Voice + Technical Interview",
    badge: "VOICE & REASONING",
    icon: Radio,
    color: "#10b981",
    desc: "Live multi-turn technical interview with speech recognition (Groq Whisper), real-time transcription, and architectural reasoning probes.",
    supportsLanguages: true,
  },
  {
    id: "hr_behavioral",
    name: "HR / Behavioral Interview",
    badge: "STAR METHODOLOGY",
    icon: Users,
    color: "#f472b6",
    desc: "Calibrated behavioral scenarios evaluating Situation, Task, Action, and Result with leadership and conflict resolution guidance.",
    supportsLanguages: false,
  },
  {
    id: "aptitude",
    name: "Aptitude & Reasoning Interview",
    badge: "COGNITIVE SPEED",
    icon: Activity,
    color: "#fbbf24",
    desc: "Quantitative aptitude, logical deduction, probability, and data interpretation from sourced datasets.",
    supportsLanguages: false,
  },
  {
    id: "language_specific",
    name: "Language-Specific Technical Interview",
    badge: "RUNTIME & DSA",
    icon: Cpu,
    color: "#60a5fa",
    desc: "Language-calibrated rounds covering Python, Java, C++, Go, Rust, and SQL runtime internals and data structure implementation.",
    supportsLanguages: true,
  },
  {
    id: "company_specific",
    name: "Company-Specific Interview",
    badge: "COMPANY BENCHMARK",
    icon: Building,
    color: "#f87171",
    desc: "Mock interviews calibrated against publicly known evaluation patterns for Google, Meta, Amazon, Apple, Netflix, or Stripe.",
    supportsLanguages: true,
  },
  {
    id: "system_design",
    name: "System Design Interview",
    badge: "HIGH SCALE ARCHITECTURE",
    icon: Layers,
    color: "#34d399",
    desc: "High-scale distributed architectures, database partitioning, caching hierarchies, and regional failover trade-offs.",
    supportsLanguages: true,
  },
];

const DOMAIN_DATA = {
  "Software Engineering": {
    roles: ["Backend Developer", "Full Stack Engineer", "Frontend Engineer", "Distributed Systems Architect", "Systems Engineer", "Mobile Engineer"],
    companies: ["Google", "Amazon", "Meta", "Microsoft", "Apple", "Uber", "Stripe"],
    topics: ["Distributed Systems", "Concurrency & Threading", "API & Protocol Design", "Data Modeling", "Caching & Latency"],
  },
  "Data Science & ML": {
    roles: ["Machine Learning Engineer", "Data Scientist", "AI Research Scientist", "Data Engineer", "MLOps Specialist"],
    companies: ["Netflix", "Meta", "Google", "Uber", "Airbnb"],
    topics: ["Model Architecture", "Feature Engineering", "Covariate Shift", "Distributed Training", "Statistical Inference"],
  },
  "Product Management": {
    roles: ["Technical Product Manager", "Growth Product Manager", "Platform PM", "Principal PM", "Associate PM"],
    companies: ["Google", "Meta", "Amazon", "Stripe", "Airbnb"],
    topics: ["0-to-1 Strategy", "Metric Prioritization", "User Empathy", "Technical Trade-Offs", "GTM Execution"],
  },
  "UI/UX Design": {
    roles: ["Product Designer", "Design Systems Lead", "UX Researcher", "Interaction Designer", "Visual UI Designer"],
    companies: ["Apple", "Airbnb", "Stripe", "Figma", "Google"],
    topics: ["Design Systems", "Accessibility (WCAG)", "User Journeys", "Micro-Interactions", "Prototyping"],
  },
  "DevOps & Cloud": {
    roles: ["Site Reliability Engineer (SRE)", "Cloud Infrastructure Architect", "DevOps Engineer", "Kubernetes Specialist", "Security Platform Engineer"],
    companies: ["Amazon (AWS)", "Microsoft (Azure)", "Google (GCP)", "Netflix", "Uber"],
    topics: ["Zero-Downtime Deployments", "Kubernetes Orchestration", "Observability & Metrics", "Chaos Engineering", "IaC Security"],
  },
  "HR & Leadership": {
    roles: ["Engineering Manager", "Technical Lead", "Senior HR Business Partner", "VP of Engineering", "Talent Acquisition Lead"],
    companies: ["Google", "Microsoft", "Amazon", "Salesforce", "HubSpot"],
    topics: ["Cross-Functional Conflict", "STAR Leadership", "Crisis Prioritization", "Mentorship", "Team Scaling"],
  },
};

const PROGRAMMING_LANGUAGES = [
  { id: "python", label: "Python", runtime: "CPython 3.12 / GIL / asyncio" },
  { id: "javascript", label: "JavaScript", runtime: "V8 Engine / Event Loop" },
  { id: "typescript", label: "TypeScript", runtime: "Static Type System & AST" },
  { id: "java", label: "Java", runtime: "JVM 21 / Project Loom / ZGC" },
  { id: "cpp", label: "C++", runtime: "C++20 / RAII / Move Semantics" },
  { id: "c", label: "C", runtime: "ANSI C / Pointers & Memory" },
  { id: "go", label: "Go", runtime: "Go Runtime / GMP Scheduler" },
  { id: "rust", label: "Rust", runtime: "Borrow Checker & Lifetimes" },
  { id: "sql", label: "SQL", runtime: "Relational Engine & B-Trees" },
];

const HR_FOCUS_OPTIONS = [
  "Behavioral",
  "STAR-based",
  "Situational",
  "Leadership",
  "Communication",
  "Conflict Resolution",
  "Teamwork",
  "Culture/Values",
  "Career/Motivation",
];

const APTITUDE_FOCUS_OPTIONS = [
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Probability",
  "Data Interpretation",
  "Numerical Reasoning",
  "Verbal Reasoning",
  "Analytical Reasoning",
];

const DSA_TOPICS_OPTIONS = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks/Queues",
  "Trees",
  "Graphs",
  "Recursion",
  "Dynamic Programming",
  "Greedy",
  "Searching",
  "Sorting",
  "Hashing",
  "Heaps",
  "Backtracking",
];

const INCOMPATIBLE_ROLES = [
  "plumber", "carpenter", "electrician", "mechanic", "chef", "cook", "driver", "trucker",
  "pilot", "doctor", "surgeon", "dentist", "nurse", "pharmacist", "janitor", "cleaner",
  "cashier", "waiter", "waitress", "barista", "farmer", "gardener", "florist", "tailor",
  "actor", "actress", "singer", "dancer", "athlete", "coach", "painter", "sculptor",
];

function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Global Interview Context (Always Visible)
  const [domain, setDomain] = useState(location.state?.prefillDomain || "Software Engineering");
  const [customDomain, setCustomDomain] = useState("");
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [role, setRole] = useState("Backend Developer");
  const [customRole, setCustomRole] = useState("");
  const [difficulty, setDifficulty] = useState(location.state?.prefillDifficulty || "Hard");
  const [companyStyle, setCompanyStyle] = useState(location.state?.prefillCompany || "Google");

  // 2. Modality Selection
  const [interviewType, setInterviewType] = useState(
    location.state?.prefillInterviewType || "AI Voice Interview"
  );

  // 3. Programming Language & Runtime Context
  const [selectedLanguages, setSelectedLanguages] = useState(["javascript"]);
  const [isLanguageAgnostic, setIsLanguageAgnostic] = useState(false);

  // 4. HR Interview Focus Selections
  const [hrFocusSelections, setHrFocusSelections] = useState(["Behavioral", "STAR-based", "Leadership"]);

  // 5. Aptitude Focus Selections
  const [aptitudeFocusSelections, setAptitudeFocusSelections] = useState(["Quantitative Aptitude", "Logical Reasoning"]);

  // 6. DSA Mode & Topics (for Language-Specific & Coding)
  const [dsaEnabled, setDsaEnabled] = useState(false);
  const [dsaTopicSelections, setDsaTopicSelections] = useState(["Arrays", "Hashing", "Trees"]);

  // 7. Modality-Specific Context
  const [sessionDuration, setSessionDuration] = useState("10 Minutes (Standard)");
  const [autoTTS, setAutoTTS] = useState(true);

  // System Design Specific
  const [systemDesignTopic, setSystemDesignTopic] = useState("Distributed Rate Limiting");
  const [targetScale, setTargetScale] = useState("250,000 RPS // Multi-Region Active-Active");

  const [validationWarning, setValidationWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeDomainName = isCustomDomain && customDomain.trim() ? customDomain.trim() : domain;
  const activeRoleName = customRole.trim() ? customRole.trim() : role;

  // Sync predefined roles when domain changes
  useEffect(() => {
    if (!isCustomDomain) {
      const config = DOMAIN_DATA[domain];
      if (config && !location.state?.prefillDomain && !customRole.trim()) {
        setRole(config.roles[0]);
      }
    }
  }, [domain, isCustomDomain]);

  // Live validation on custom role
  useEffect(() => {
    if (customRole.trim()) {
      const rLower = customRole.trim().toLowerCase();
      const isBad = INCOMPATIBLE_ROLES.some((b) => rLower === b || rLower.startsWith(b + " ") || rLower.endsWith(" " + b));
      if (isBad) {
        setValidationWarning(
          `The role "${customRole.trim()}" does not match the "${activeDomainName}" domain. Please select or enter a valid professional role.`
        );
      } else {
        setValidationWarning("");
      }
    } else {
      setValidationWarning("");
    }
  }, [customRole, activeDomainName]);

  const toggleLanguage = (langId) => {
    if (isLanguageAgnostic) setIsLanguageAgnostic(false);

    if (selectedLanguages.includes(langId)) {
      const next = selectedLanguages.filter((l) => l !== langId);
      if (next.length === 0) {
        setIsLanguageAgnostic(true);
      }
      setSelectedLanguages(next);
    } else {
      setSelectedLanguages([...selectedLanguages, langId]);
    }
  };

  const setAgnosticMode = () => {
    setIsLanguageAgnostic(true);
    setSelectedLanguages([]);
  };

  const toggleHrFocus = (focusItem) => {
    if (hrFocusSelections.includes(focusItem)) {
      setHrFocusSelections(hrFocusSelections.filter((f) => f !== focusItem));
    } else {
      setHrFocusSelections([...hrFocusSelections, focusItem]);
    }
  };

  const toggleAptitudeFocus = (focusItem) => {
    if (aptitudeFocusSelections.includes(focusItem)) {
      setAptitudeFocusSelections(aptitudeFocusSelections.filter((f) => f !== focusItem));
    } else {
      setAptitudeFocusSelections([...aptitudeFocusSelections, focusItem]);
    }
  };

  const toggleDsaTopic = (topic) => {
    if (dsaTopicSelections.includes(topic)) {
      setDsaTopicSelections(dsaTopicSelections.filter((t) => t !== topic));
    } else {
      setDsaTopicSelections([...dsaTopicSelections, topic]);
    }
  };

  const handleLaunchSession = async () => {
    if (loading) return;

    if (!activeRoleName) {
      setError("Please select or enter a target role persona.");
      return;
    }

    if (validationWarning) {
      setError(validationWarning);
      return;
    }

    setError("");
    setLoading(true);

    const token = localStorage.getItem("prepquartersToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const languagesPayload = isLanguageAgnostic ? [] : selectedLanguages;
    const primaryLanguage = languagesPayload[0] || "javascript";

    const payload = {
      role: activeRoleName,
      domain: activeDomainName,
      difficulty,
      companyStyle: difficulty === "Hard" || interviewType.includes("Company") ? companyStyle : "General Tech",
      interviewType,
      programmingLanguage: primaryLanguage,
      programmingLanguages: languagesPayload,
      sessionDuration,
      autoTTS,
      modalityConfig: {
        sessionDuration,
        autoTTS,
        hrFocusAreas: hrFocusSelections,
        aptitudeFocusAreas: aptitudeFocusSelections,
        dsaEnabled,
        dsaTopics: dsaTopicSelections,
        systemDesignTopic,
        targetScale,
      },
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to initialize interview session.");
      }

      navigate("/practice/ai-interview/session", {
        state: {
          sessionId: data.session._id || data.session.id,
          session: data.session,
          initialQuestion: data.session.currentQuestion || (data.session.questions ? data.session.questions[0] : null),
        },
      });
    } catch (err) {
      console.error("Session launch error:", err);
      setError(err.message || "Failed to initialize session. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const currentModalityObj = MODALITIES.find((m) => m.name === interviewType) || MODALITIES[0];

  return (
    <main className="setup-page">
      <div className="setup-container">
        {/* Navigation Bar */}
        <div className="setup-nav-row">
          <button type="button" className="setup-back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Dashboard</span>
          </button>
          <div className="setup-session-pill">
            <span className="pulse-dot cyan" />
            <span>INTERVIEW COCKPIT // CALIBRATION ENGINE</span>
          </div>
        </div>

        {/* Header */}
        <header className="setup-header">
          <div className="setup-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            <span>NEURAL INTERVIEW ORCHESTRATION</span>
          </div>
          <h1>Calibrate Mock Interview Cockpit</h1>
          <p className="setup-subtitle">
            Configure global interview context, select from 10 distinct modalities, calibrate language runtimes and focus areas,
            and engage with autonomous AI interviewers.
          </p>
        </header>

        {error && (
          <div className="session-error-banner" role="alert" style={{ marginBottom: "24px" }}>
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="setup-grid-layout">
          <div className="setup-main-flow">
            {/* =================================================================
                CARD 1: GLOBAL INTERVIEW CONTEXT (ALWAYS VISIBLE)
            ================================================================= */}
            <section className="setup-card">
              <div className="setup-step-header">
                <span className="step-num">01</span>
                <div>
                  <h3>Global Interview Context</h3>
                  <p>Target domain, role persona, and cognitive difficulty are inherited across all modalities.</p>
                </div>
              </div>

              {/* Domain Selection */}
              <div style={{ marginBottom: "20px" }}>
                <label className="setup-field-label">Target Technical Domain / Discipline</label>
                <div className="setup-pills-wrap">
                  {Object.keys(DOMAIN_DATA).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`setup-pill-btn ${!isCustomDomain && domain === d ? "selected" : ""}`}
                      onClick={() => {
                        setIsCustomDomain(false);
                        setDomain(d);
                      }}
                    >
                      <span>{d}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`setup-pill-btn ${isCustomDomain ? "selected" : ""}`}
                    onClick={() => setIsCustomDomain(true)}
                  >
                    <Plus size={13} />
                    <span>Custom Discipline</span>
                  </button>
                </div>

                {isCustomDomain && (
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="text"
                      className="setup-custom-input"
                      placeholder="Enter custom technical domain (e.g. Distributed Robotics, Quantitative Trading)..."
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Role Persona Selection */}
              <div style={{ marginBottom: "20px" }}>
                <label className="setup-field-label">Target Role Persona</label>
                {!isCustomDomain && DOMAIN_DATA[domain] && (
                  <div className="setup-pills-wrap" style={{ marginBottom: "10px" }}>
                    {DOMAIN_DATA[domain].roles.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`setup-pill-btn small ${!customRole && role === r ? "selected" : ""}`}
                        onClick={() => {
                          setCustomRole("");
                          setRole(r);
                        }}
                      >
                        <span>{r}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    className="setup-custom-input"
                    placeholder="Or type a custom role (e.g. Rust Systems Engineer, MLOps Lead, Staff iOS)..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                  />
                  {customRole && (
                    <button
                      type="button"
                      className="setup-pill-btn small"
                      onClick={() => setCustomRole("")}
                      style={{ height: "42px" }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {validationWarning && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", color: "#fbbf24", fontSize: "12px" }}>
                    <AlertCircle size={14} />
                    <span>{validationWarning}</span>
                  </div>
                )}
              </div>

              {/* Cognitive Challenge Level */}
              <div>
                <label className="setup-field-label">Cognitive Challenge Level</label>
                <div className="difficulty-toggle-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                  <button
                    type="button"
                    className={`diff-card-btn ${difficulty === "Easy" ? "selected easy" : ""}`}
                    onClick={() => setDifficulty("Easy")}
                  >
                    <div className="diff-card-header">
                      <span className="diff-pill easy">EASY MODE</span>
                      <strong>Foundational</strong>
                    </div>
                    <p>Core conceptual definitions, fundamental data structures, protocol mechanics, and clean code.</p>
                  </button>

                  <button
                    type="button"
                    className={`diff-card-btn ${difficulty === "Medium" ? "selected" : ""}`}
                    style={{
                      borderColor: difficulty === "Medium" ? "var(--cyan-bright)" : "var(--border-subtle)",
                      background: difficulty === "Medium" ? "rgba(6, 182, 212, 0.08)" : "var(--bg-surface-2)",
                    }}
                    onClick={() => setDifficulty("Medium")}
                  >
                    <div className="diff-card-header">
                      <span className="diff-pill" style={{ background: "rgba(6, 182, 212, 0.15)", color: "var(--cyan-bright)", border: "1px solid rgba(6, 182, 212, 0.3)" }}>MEDIUM MODE</span>
                      <strong>Practical</strong>
                    </div>
                    <p>Component integration, query optimization, API security, and async background workers.</p>
                  </button>

                  <button
                    type="button"
                    className={`diff-card-btn ${difficulty === "Hard" ? "selected hard" : ""}`}
                    onClick={() => setDifficulty("Hard")}
                  >
                    <div className="diff-card-header">
                      <span className="diff-pill hard">HARD MODE</span>
                      <strong>High Rigor</strong>
                    </div>
                    <p>Multi-region distributed systems, concurrency hazards, cascading failure mitigations, and bar-raiser rubrics.</p>
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================================
                CARD 2: SELECT INTERVIEW MODALITY (10 DISTINCT MODALITIES)
            ================================================================= */}
            <section className="setup-card">
              <div className="setup-step-header">
                <span className="step-num">02</span>
                <div>
                  <h3>Select Interview Modality</h3>
                  <p>Choose an autonomous interview engine calibrated for your preparation goal.</p>
                </div>
              </div>

              <div className="modality-cards-grid">
                {MODALITIES.map((mod) => {
                  const Icon = mod.icon;
                  const isSelected = interviewType === mod.name;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      className={`modality-select-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => setInterviewType(mod.name)}
                    >
                      <div className="modality-select-top">
                        <div className="modality-icon-wrap" style={{ color: mod.color }}>
                          <Icon size={20} aria-hidden="true" />
                        </div>
                        <span className="modality-badge-tag">{mod.badge}</span>
                      </div>
                      <strong className="modality-title">{mod.name}</strong>
                      <p className="modality-desc">{mod.desc}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* =================================================================
                CARD 3: PROGRAMMING LANGUAGE & RUNTIME CONTEXT (RELEVANCE-AWARE)
            ================================================================= */}
            {currentModalityObj.supportsLanguages && (
              <section className="setup-card">
                <div className="setup-step-header">
                  <span className="step-num">03</span>
                  <div>
                    <h3>Programming Language & Runtime Context</h3>
                    <p>Configure single, multi-language comparison, or general language-agnostic interview context.</p>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                    <label className="setup-field-label" style={{ margin: 0 }}>
                      Select Language(s) or Comparison Context
                    </label>
                    <button
                      type="button"
                      onClick={setAgnosticMode}
                      className={`setup-pill-btn small ${isLanguageAgnostic ? "selected" : ""}`}
                      style={{ fontSize: "11px" }}
                    >
                      <span>General / Language-Agnostic</span>
                    </button>
                  </div>

                  <div className="setup-pills-wrap">
                    {PROGRAMMING_LANGUAGES.map((lang) => {
                      const isSelected = selectedLanguages.includes(lang.id);
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          className={`setup-pill-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleLanguage(lang.id)}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedLanguages.length > 1 && (
                    <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.25)", fontSize: "12px", color: "var(--cyan-bright)" }}>
                      <span>Comparative Mode Active: Questions will probe architectural differences between {selectedLanguages.map((l) => l.toUpperCase()).join(", ")}.</span>
                    </div>
                  )}

                  {isLanguageAgnostic && (
                    <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", fontSize: "12px", color: "#34d399" }}>
                      <span>Language-Agnostic Mode Active: Questions will evaluate fundamental logic and algorithmic complexity without language bias.</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* =================================================================
                CARD 4A: HR / BEHAVIORAL INTERVIEW FOCUS CARD (CONDITIONAL)
            ================================================================= */}
            {interviewType === "HR / Behavioral Interview" && (
              <section className="setup-card">
                <div className="setup-step-header">
                  <span className="step-num">03</span>
                  <div>
                    <h3>HR & Behavioral Interview Focus</h3>
                    <p>Select one, multiple, or broad behavioral focus areas to guide scenario generation.</p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                  <label className="setup-field-label" style={{ margin: 0 }}>Behavioral Competencies & Rubrics</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      className="setup-pill-btn small"
                      onClick={() => setHrFocusSelections([...HR_FOCUS_OPTIONS])}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="setup-pill-btn small"
                      onClick={() => setHrFocusSelections([])}
                    >
                      Broad / All
                    </button>
                  </div>
                </div>

                <div className="setup-pills-wrap">
                  {HR_FOCUS_OPTIONS.map((opt) => {
                    const isSelected = hrFocusSelections.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`setup-pill-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleHrFocus(opt)}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  {hrFocusSelections.length === 0
                    ? "Broad HR Interview: Questions will cover all behavioral leadership and situational competencies dynamically."
                    : `Active Focus: Questions will target ${hrFocusSelections.join(", ")}.`}
                </div>
              </section>
            )}

            {/* =================================================================
                CARD 4B: APTITUDE INTERVIEW FOCUS CARD (CONDITIONAL)
            ================================================================= */}
            {interviewType.includes("Aptitude") && (
              <section className="setup-card">
                <div className="setup-step-header">
                  <span className="step-num">03</span>
                  <div>
                    <h3>Aptitude & Cognitive Reasoning Focus</h3>
                    <p>Select targeted mathematical, logical, and analytical problem-solving categories.</p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                  <label className="setup-field-label" style={{ margin: 0 }}>Cognitive Disciplines</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      className="setup-pill-btn small"
                      onClick={() => setAptitudeFocusSelections([...APTITUDE_FOCUS_OPTIONS])}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="setup-pill-btn small"
                      onClick={() => setAptitudeFocusSelections([])}
                    >
                      All / Mixed
                    </button>
                  </div>
                </div>

                <div className="setup-pills-wrap">
                  {APTITUDE_FOCUS_OPTIONS.map((opt) => {
                    const isSelected = aptitudeFocusSelections.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`setup-pill-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleAptitudeFocus(opt)}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  {aptitudeFocusSelections.length === 0
                    ? "Broad Aptitude Round: Questions will sample across Quantitative, Logical, Probability, and Analytical fields."
                    : `Active Focus: Questions will emphasize ${aptitudeFocusSelections.join(", ")}.`}
                </div>
              </section>
            )}

            {/* =================================================================
                CARD 4C: OPTIONAL DSA MODE (FOR LANGUAGE-SPECIFIC & CODING)
            ================================================================= */}
            {(interviewType.includes("Language-Specific") || interviewType.includes("Coding")) && (
              <section className="setup-card">
                <div className="setup-step-header">
                  <span className="step-num">04</span>
                  <div>
                    <h3>Data Structures & Algorithms (DSA) Engine</h3>
                    <p>Optionally enable LeetCode-style algorithmic problem solving with execution timing and memory analysis.</p>
                  </div>
                </div>

                <div style={{ padding: "14px 18px", borderRadius: "12px", background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <BrainCircuit size={16} style={{ color: dsaEnabled ? "var(--cyan-bright)" : "var(--text-muted)" }} />
                        <span>Enable Algorithmic DSA Challenge Mode</span>
                      </strong>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
                        Presents concrete coding challenges with test assertions, execution timing, and Big-O runtime analysis.
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`setup-pill-btn small ${dsaEnabled ? "selected" : ""}`}
                      onClick={() => setDsaEnabled(!dsaEnabled)}
                    >
                      <span>{dsaEnabled ? "DSA Mode ENABLED" : "DSA Mode Disabled"}</span>
                    </button>
                  </div>
                </div>

                {dsaEnabled && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                      <label className="setup-field-label" style={{ margin: 0 }}>Target DSA Topics</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="setup-pill-btn small"
                          onClick={() => setDsaTopicSelections([...DSA_TOPICS_OPTIONS])}
                        >
                          All Topics
                        </button>
                        <button
                          type="button"
                          className="setup-pill-btn small"
                          onClick={() => setDsaTopicSelections([])}
                        >
                          Dynamic AI Choice
                        </button>
                      </div>
                    </div>

                    <div className="setup-pills-wrap">
                      {DSA_TOPICS_OPTIONS.map((t) => {
                        const isSelected = dsaTopicSelections.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            className={`setup-pill-btn small ${isSelected ? "selected" : ""}`}
                            onClick={() => toggleDsaTopic(t)}
                          >
                            {isSelected && <Check size={11} />}
                            <span>{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* =================================================================
                CARD 5: MODALITY PARAMETERS & SESSION DURATION
            ================================================================= */}
            <section className="setup-card">
              <div className="setup-step-header">
                <span className="step-num">05</span>
                <div>
                  <h3>Modality Parameters ({interviewType})</h3>
                  <p>Fine-tune session duration and controls specific to this interview experience.</p>
                </div>
              </div>

              {/* Time-Based Session Duration (Common across all modalities) */}
              <div style={{ marginBottom: "24px" }}>
                <label className="setup-field-label">Session Duration (Time-Based Limit)</label>
                <div className="length-pills-row">
                  {[
                    { dur: "2 Minutes", label: "2 Minutes", note: "Quick Calibration" },
                    { dur: "5 Minutes", label: "5 Minutes", note: "Express Sprint" },
                    { dur: "10 Minutes", label: "10 Minutes", note: "Standard Round" },
                    { dur: "15 Minutes", label: "15 Minutes", note: "Deep Assessment" },
                    { dur: "20 Minutes", label: "20 Minutes", note: "Staff / Lead Loop" },
                    { dur: "30 Minutes", label: "30 Minutes", note: "Full Panel Bar-Raiser" },
                  ].map((item) => (
                    <button
                      key={item.dur}
                      type="button"
                      className={`length-card-btn ${sessionDuration.startsWith(item.dur) ? "selected" : ""}`}
                      onClick={() => setSessionDuration(item.dur)}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mixed Interview Multi-Stage Roadmap */}
              {interviewType === "Mixed Interview" && (
                <div style={{ padding: "18px", borderRadius: "12px", background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
                  <label className="setup-field-label">Multi-Stage Adaptive Interview Loop</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginTop: "10px" }}>
                    {[
                      { step: "1. Technical", note: "System Fundamentals" },
                      { step: "2. Coding / DSA", note: "Algorithmic Bounds" },
                      { step: "3. Aptitude", note: "Logical Deduction" },
                      { step: "4. Behavioral", note: "STAR Leadership" },
                      { step: "5. System Design", note: "Scale & Trade-Offs" },
                    ].map((s, idx) => (
                      <div key={idx} style={{ padding: "10px", borderRadius: "8px", background: "var(--bg-card)", border: "1px solid rgba(6, 182, 212, 0.2)" }}>
                        <strong style={{ fontSize: "12px", color: "var(--cyan-bright)", display: "block" }}>{s.step}</strong>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{s.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Modality Options */}
              {interviewType === "AI Voice Interview" && (
                <div style={{ padding: "18px", borderRadius: "12px", background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                        {autoTTS ? <Volume2 size={16} style={{ color: "var(--cyan-bright)" }} /> : <VolumeX size={16} style={{ color: "var(--text-muted)" }} />}
                        <span>Autonomous Speech Response (Auto-Speak)</span>
                      </strong>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
                        {autoTTS
                          ? "AI interviewer will automatically vocalize questions and spoken feedback."
                          : "AI remains silent. Spoken audio is only played when you explicitly click 'Play Audio'."}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`setup-pill-btn small ${autoTTS ? "selected" : ""}`}
                      onClick={() => setAutoTTS(!autoTTS)}
                    >
                      <span>{autoTTS ? "Auto-Speak ON" : "Explicit Play Only"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* System Design Options */}
              {interviewType === "System Design Interview" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                  <div>
                    <label className="setup-field-label">Architecture Scenario</label>
                    <select
                      className="setup-custom-input"
                      value={systemDesignTopic}
                      onChange={(e) => setSystemDesignTopic(e.target.value)}
                    >
                      <option value="Distributed Rate Limiting">Distributed Rate Limiting</option>
                      <option value="Real-Time Collaborative Document Editing">Real-Time Collaborative Document Editing</option>
                      <option value="High-Throughput Global Video Transcoding">High-Throughput Global Video Transcoding</option>
                      <option value="Distributed Notification & Push Gateway">Distributed Notification & Push Gateway</option>
                      <option value="Sharded Distributed Key-Value Store">Sharded Distributed Key-Value Store</option>
                    </select>
                  </div>
                  <div>
                    <label className="setup-field-label">Target Scale Bound</label>
                    <input
                      type="text"
                      className="setup-custom-input"
                      value={targetScale}
                      onChange={(e) => setTargetScale(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {(interviewType.includes("Company-Specific") || difficulty === "Hard") && (
                <div style={{ marginTop: "16px" }}>
                  <label className="setup-field-label">Company Rubric Benchmark</label>
                  <div className="setup-pills-wrap">
                    {["Google", "Amazon", "Meta", "Microsoft", "Apple", "Netflix", "Uber", "Stripe"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`setup-pill-btn small ${companyStyle === c ? "selected" : ""}`}
                        onClick={() => setCompanyStyle(c)}
                      >
                        <span>{c}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* =================================================================
              CARD 6: REAL-TIME TELEMETRY HUD SIDEBAR
          ================================================================= */}
          <aside className="setup-hud-sidebar">
            <div className="hud-sticky-card">
              <div className="hud-header">
                <Cpu size={18} aria-hidden="true" />
                <span>SESSION TELEMETRY HUD</span>
              </div>

              <div className="hud-params-list">
                <div className="hud-param-item">
                  <span className="param-label">Active Modality</span>
                  <span className="param-value" style={{ color: "var(--cyan-bright)", fontWeight: "700" }}>
                    {interviewType}
                  </span>
                </div>

                <div className="hud-param-item">
                  <span className="param-label">Target Domain</span>
                  <span className="param-value">{activeDomainName}</span>
                </div>

                <div className="hud-param-item">
                  <span className="param-label">Role Persona</span>
                  <span className="param-value">{activeRoleName}</span>
                </div>

                <div className="hud-param-item">
                  <span className="param-label">Session Duration</span>
                  <span className="param-value" style={{ color: "#34d399", fontWeight: "700" }}>
                    {sessionDuration}
                  </span>
                </div>

                <div className="hud-param-item">
                  <span className="param-label">Challenge Mode</span>
                  <span className={`param-badge ${difficulty.toLowerCase()}`}>
                    {difficulty} Mode
                  </span>
                </div>

                {currentModalityObj.supportsLanguages && (
                  <div className="hud-param-item">
                    <span className="param-label">Languages / Runtime</span>
                    <span className="param-value">
                      {isLanguageAgnostic
                        ? "General (Language Agnostic)"
                        : selectedLanguages.map((l) => l.toUpperCase()).join(", ") || "General"}
                    </span>
                  </div>
                )}

                {dsaEnabled && (
                  <div className="hud-param-item">
                    <span className="param-label">DSA Engine</span>
                    <span className="param-value" style={{ color: "var(--cyan-bright)" }}>
                      Active ({dsaTopicSelections.length ? dsaTopicSelections.join(", ") : "All Topics"})
                    </span>
                  </div>
                )}

                {interviewType === "HR / Behavioral Interview" && (
                  <div className="hud-param-item">
                    <span className="param-label">HR Focus</span>
                    <span className="param-value">
                      {hrFocusSelections.length ? hrFocusSelections.join(", ") : "Broad HR"}
                    </span>
                  </div>
                )}

                {interviewType.includes("Aptitude") && (
                  <div className="hud-param-item">
                    <span className="param-label">Aptitude Focus</span>
                    <span className="param-value">
                      {aptitudeFocusSelections.length ? aptitudeFocusSelections.join(", ") : "All / Mixed"}
                    </span>
                  </div>
                )}

                {interviewType === "AI Voice Interview" && (
                  <div className="hud-param-item">
                    <span className="param-label">Speech Response</span>
                    <span className="param-value" style={{ color: autoTTS ? "var(--cyan-bright)" : "#fbbf24" }}>
                      {autoTTS ? "Autonomous Voice (Auto-Speak)" : "Explicit On-Demand"}
                    </span>
                  </div>
                )}

                {interviewType === "System Design Interview" && (
                  <div className="hud-param-item">
                    <span className="param-label">Design Target</span>
                    <span className="param-value">{systemDesignTopic} // {targetScale}</span>
                  </div>
                )}

                <div className="hud-param-item">
                  <span className="param-label">Session Model</span>
                  <span className="param-value font-mono" style={{ color: "var(--cyan-bright)", fontSize: "11px" }}>
                    Time-Based ({sessionDuration}) // Continuous Adaptive Q&A
                  </span>
                </div>

                <div className="hud-param-item">
                  <span className="param-label">Inference Engine</span>
                  <span className="param-value font-mono">NVIDIA NIM // 70B & Groq Whisper</span>
                </div>
              </div>

              <div className="hud-security-guarantee">
                <ShieldCheck size={14} aria-hidden="true" />
                <span>Zero fake data. All evaluations persist to your candidate profile.</span>
              </div>

              <button
                type="button"
                className="hud-launch-button"
                disabled={loading || Boolean(validationWarning)}
                onClick={handleLaunchSession}
              >
                {loading ? (
                  <>
                    <span className="submit-spinner" />
                    <span>Calibrating Cockpit...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Cockpit</span>
                    <Zap size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default InterviewSetup;
