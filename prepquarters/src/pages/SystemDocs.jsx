import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Bot,
  Radio,
  Code,
  Terminal,
  Activity,
  Award,
  Building,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Database,
  Lock,
  RotateCcw,
  Sliders,
  Server,
  FileText,
  Clock,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import "./SystemDocs.css";

function SystemDocs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [docsData, setDocsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://prepquarters-backend.onrender.com/api/system/docs");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.docs) {
          setDocsData(data.docs);
        }
      }
    } catch (err) {
      console.warn("Using offline documentation fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modalitiesList = docsData?.modalities || [
    {
      id: "voice",
      name: "AI Voice Interview",
      badge: "VOICE TELEMETRY",
      description: "Live conversational voice mock with Web Audio spectrum visualizer, Groq Whisper STT, and natural neural voice feedback.",
      configFields: ["Target Role", "Technical Domain", "Challenge Level", "Company Style Benchmark", "Session Duration (2-30m)", "Voice Controls"],
      evaluationCriteria: ["Technical Accuracy & Depth", "Speech Articulation & Clarity", "Trade-Off Analysis"],
    },
    {
      id: "technical",
      name: "Technical Interview",
      badge: "ARCHITECTURE & CONCEPTS",
      description: "Core computer science fundamentals, distributed system mechanics, database internals, and network protocols.",
      configFields: ["Technical Discipline", "Role Persona", "Difficulty Level", "Company Benchmark", "Session Duration (2-30m)"],
      evaluationCriteria: ["Concept Accuracy", "Failure Mode Mitigations", "Component Decoupling"],
    },
    {
      id: "coding",
      name: "Coding Interview",
      badge: "ALGORITHMIC SUITE",
      description: "Interactive code editor with multi-language starter templates, runtime sandbox execution, and test assertion verification.",
      configFields: ["Programming Language", "Algorithmic Topic", "Difficulty", "Problem Type", "Time Limit (15-45m)"],
      evaluationCriteria: ["Algorithmic Correctness", "Time Complexity Bounds", "Space Complexity Efficiency", "Edge Case Coverage"],
    },
    {
      id: "ai_coding",
      name: "AI Coding Interview",
      badge: "CONVERSATIONAL CODE",
      description: "Interactive AI interviewer probing solution design, edge case assumptions, hints, and evaluating both implementation and explanation.",
      configFields: ["Language", "Topic", "Difficulty", "Hints & Clarifications", "Time Limit"],
      evaluationCriteria: ["Code Correctness", "Approach Articulation", "Algorithmic Complexity Communication"],
    },
    {
      id: "system_design",
      name: "System Design Interview",
      badge: "HIGH SCALE ARCHITECTURE",
      description: "High-scale distributed systems, database partitioning, caching layers, and regional failover patterns.",
      configFields: ["Architecture Topic", "Difficulty", "Target Scale", "Company Style", "Session Duration (10-30m)"],
      evaluationCriteria: ["Scalability Bounds", "Bottleneck Identification", "Data Reconciliation", "Latency Percentiles"],
    },
    {
      id: "hr_behavioral",
      name: "HR / Behavioral Interview",
      badge: "STAR METHODOLOGY",
      description: "Leadership scenarios, stakeholder conflict resolution, project prioritization, and cross-functional ownership.",
      configFields: ["Role", "Behavioral Focus", "Company Style", "Session Duration (5-20m)"],
      evaluationCriteria: ["Situation Breakdown", "Task Clarity", "Action Impact", "Quantified Result"],
    },
    {
      id: "aptitude",
      name: "Aptitude Interview",
      badge: "COGNITIVE SPEED",
      description: "Quantitative aptitude, logical deduction, probability, and data interpretation with verified mathematical proofs.",
      configFields: ["Category", "Difficulty", "Session Duration (2-15m)"],
      evaluationCriteria: ["Mathematical Accuracy", "Formula Derivation", "Time Management"],
    },
    {
      id: "language_specific",
      name: "Language-Specific Technical Interview",
      badge: "RUNTIME INTERNALS",
      description: "Deep-dive questions into JavaScript V8 engine, Python GIL & generators, Java JVM memory allocation & Project Loom, and SQL indexing.",
      configFields: ["Language", "Core Concepts", "Difficulty", "Session Duration (5-20m)"],
      evaluationCriteria: ["Runtime Accuracy", "Memory Model Nuances", "Concurrency Semantics"],
    },
    {
      id: "company_specific",
      name: "Company-Specific Interview",
      badge: "COMPANY BENCHMARK",
      description: "Interviews calibrated to evaluation styles of Google, Meta, Amazon, Apple, Netflix, Uber, and Stripe.",
      configFields: ["Target Company", "Role Persona", "Interview Style", "Difficulty", "Session Duration (5-30m)"],
      evaluationCriteria: ["Company Cultural Rubrics", "Technical Bar Standards", "System Scale Expectations"],
    },
    {
      id: "mixed",
      name: "Mixed Interview",
      badge: "COMPREHENSIVE ROUND",
      description: "Full multi-discipline interview blending technical questions, algorithmic problem solving, system design, and behavioral traits.",
      configFields: ["Selected Round Types", "Difficulty Level", "Session Duration (10-30m)", "Company Style"],
      evaluationCriteria: ["Multi-Faceted Competency", "Adaptive Thinking", "Cross-Domain Knowledge"],
    },
  ];

  const apiEndpointsList = docsData?.apiEndpoints || [
    { method: "POST", path: "/api/auth/signup", description: "Register new candidate account with bcrypt password hashing." },
    { method: "POST", path: "/api/auth/login", description: "Authenticate candidate and issue secure JWT." },
    { method: "GET", path: "/api/auth/me", description: "Retrieve authenticated candidate profile and statistics." },
    { method: "POST", path: "/api/interview/start", description: "Initialize time-based interview session with selected modality configuration." },
    { method: "POST", path: "/api/interview/:sessionId/answer", description: "Submit candidate answer, execute validation, generate rubric score & follow-up." },
    { method: "POST", path: "/api/interview/:sessionId/finish", description: "Conclude session on demand and generate final comprehensive evaluation scorecard." },
    { method: "POST", path: "/api/interview/:sessionId/run-code", description: "Execute and validate candidate code against sandbox test assertions." },
    { method: "POST", path: "/api/interview/transcribe-audio", description: "Sub-second audio blob transcription using Groq Whisper." },
    { method: "POST", path: "/api/resume/analyze", description: "Deep ATS resume audit, keyword matching, and downloadable score report." },
    { method: "POST", path: "/api/resume/improve-bullet", description: "Transform weak resume bullets into STAR/XYZ impact statements." },
    { method: "GET", path: "/api/interview/library/questions", description: "Search, filter, and retrieve questions across all domains and modalities." },
    { method: "GET", path: "/api/interview/stats/summary", description: "Get candidate aggregate performance scores and skill radar metrics." },
    { method: "GET", path: "/api/interview/history/all", description: "Retrieve candidate past session transcripts for replay." },
    { method: "GET", path: "/api/system/docs", description: "Fetch platform documentation, modality workflows, and API specifications." },
  ];

  return (
    <main className="system-docs-page bg-grid-cyber">
      <div className="system-docs-container">
        {/* Navigation Breadcrumb Bar */}
        <div className="docs-breadcrumb-bar">
          <button
            type="button"
            className="docs-back-btn"
            onClick={() => navigate("/features")}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Back to Features</span>
          </button>
          <div className="docs-breadcrumb-path">
            <span>PrepQuarters</span>
            <ChevronRight size={12} />
            <span>Architecture & Intelligence</span>
            <ChevronRight size={12} />
            <strong>System Documentation</strong>
          </div>
        </div>

        {/* Hero Section */}
        <header className="docs-hero">
          <div className="docs-hero-eyebrow">
            <span className="pulse-dot cyan" />
            <span className="docs-hero-badge">SYSTEM DOCUMENTATION // TECHNICAL SPECIFICATION</span>
          </div>
          <h1 className="docs-hero-title">PrepQuarters Architecture & Modality Reference</h1>
          <p className="docs-hero-subtitle">
            Comprehensive developer and engineering guide to PrepQuarters autonomous interview engines,
            multi-modal workspaces, speech-to-text pipeline, evaluation rubrics, and API specifications.
          </p>

          <div className="docs-meta-row">
            <span className="docs-meta-pill">
              <span>Platform Version:</span>
              <strong>v2.4.0 (Production)</strong>
            </span>
            <span className="docs-meta-pill">
              <span>Inference Engine:</span>
              <strong>NVIDIA NIM Llama 3.3 70B</strong>
            </span>
            <span className="docs-meta-pill">
              <span>STT Engine:</span>
              <strong>Groq Whisper (whisper-large-v3)</strong>
            </span>
            <span className="docs-meta-pill">
              <span>Session Model:</span>
              <strong>Time-Based (2m - 30m)</strong>
            </span>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="docs-tabs-nav" aria-label="Documentation Sections">
          {[
            { id: "overview", label: "Architecture Overview", icon: Server },
            { id: "modalities", label: "10 Interview Modalities", icon: Layers },
            { id: "voice_stt", label: "Speech & Audio Pipeline", icon: Radio },
            { id: "code_runner", label: "Code Execution Sandbox", icon: Code },
            { id: "rubrics", label: "Evaluation & Scoring Rubrics", icon: Award },
            { id: "api", label: "REST API Specification", icon: Terminal },
            { id: "security", label: "Security & Data Privacy", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`docs-tab-btn ${isSelected ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: Architecture Overview */}
        {activeTab === "overview" && (
          <section className="docs-section">
            <div className="docs-card">
              <div className="docs-card-header">
                <h2 className="docs-card-title">
                  <Server size={20} aria-hidden="true" />
                  <span>Hybrid Deterministic-Neural Architecture</span>
                </h2>
                <span className="docs-modality-badge">ZERO LATENCY DRIFT</span>
              </div>
              <div className="docs-card-body">
                <p>
                  PrepQuarters is built on a hybrid architecture that cleanly separates deterministic application logic
                  (session timers, state machine, cross-session question uniqueness tracking, code assertion verification,
                  and score persistence) from probabilistic neural reasoning (NVIDIA NIM Llama 3.3 70B & Groq Whisper).
                </p>
                <p>
                  This dual-layer design guarantees reproducible candidate scorecards, eliminates hallucination risks
                  during structured question flows, and provides sub-second latency across all 10 interview modalities.
                </p>
              </div>
            </div>

            {/* Global Context & Validation Specifications */}
            <div className="docs-card" style={{ marginTop: "24px" }}>
              <div className="docs-card-header">
                <h2 className="docs-card-title">
                  <Sliders size={20} aria-hidden="true" />
                  <span>Global Context & Calibration Architecture</span>
                </h2>
                <span className="docs-modality-badge">MODULAR CONFIGURATION</span>
              </div>
              <div className="docs-card-body">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "8px" }}>
                  <div style={{ padding: "16px", borderRadius: "10px", background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
                    <strong style={{ color: "var(--cyan-bright)", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                      1. Global Interview Context
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", display: "block" }}>
                      Target Domain (e.g. Software Engineering, Data Science & ML, Product Management), Role Persona, and Cognitive Challenge Level are globally defined and inherited by all 10 modalities.
                    </span>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "10px", background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
                    <strong style={{ color: "#34d399", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                      2. Domain & Role Semantic Validation
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", display: "block" }}>
                      Both client and server validate custom role inputs against target disciplines, rejecting incompatible roles with clear alternative suggestions while supporting emerging tech roles.
                    </span>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "10px", background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
                    <strong style={{ color: "#a78bfa", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                      3. Multi-Language & Agnostic Runtime
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", display: "block" }}>
                      Supports single language execution, multi-language architectural comparisons (e.g. Python vs Rust concurrency), or language-agnostic logic modes where appropriate.
                    </span>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "10px", background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
                    <strong style={{ color: "#f87171", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                      4. Controlled Reference Solutions
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", display: "block" }}>
                      Reference solutions and progressive hints are strictly hidden by default and accessible only on explicit user request, without artificially skewing evaluation rubrics.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="docs-features-triad" style={{ marginTop: "24px" }}>
              <div className="docs-feature-box">
                <strong>
                  <Cpu size={18} style={{ color: "var(--cyan-bright)" }} aria-hidden="true" />
                  <span>NVIDIA NIM Engine</span>
                </strong>
                <p>
                  High-throughput server-side LLM inference executing multi-turn candidate evaluation, edge-case probing,
                  and structured JSON telemetry extraction.
                </p>
              </div>

              <div className="docs-feature-box">
                <strong>
                  <Radio size={18} style={{ color: "#38bdf8" }} aria-hidden="true" />
                  <span>Groq Whisper STT</span>
                </strong>
                <p>
                  Sub-second speech-to-text pipeline (under 600ms) with Web Audio API frequency analysis and browser-independent
                  speech recognition stability.
                </p>
              </div>

              <div className="docs-feature-box">
                <strong>
                  <Database size={18} style={{ color: "#34d399" }} aria-hidden="true" />
                  <span>MongoDB Persistence</span>
                </strong>
                <p>
                  Strict per-user data tenancy storing interview transcripts, execution outputs, time telemetry,
                  and longitudinal skill-gap diagnostics.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: 10 Interview Modalities Matrix */}
        {activeTab === "modalities" && (
          <section className="docs-section">
            <div className="docs-card">
              <div className="docs-card-header">
                <h2 className="docs-card-title">
                  <Layers size={20} aria-hidden="true" />
                  <span>10 Specialized Interview Modalities</span>
                </h2>
                <span className="docs-modality-badge">CONTEXTUAL WORKSPACES</span>
              </div>
              <p className="docs-card-body">
                Each interview modality provides a custom configuration flow and interactive workspace
                specifically calibrated for its target discipline and evaluation criteria.
              </p>
            </div>

            <div className="docs-modalities-grid">
              {modalitiesList.map((m, idx) => (
                <article key={m.id || idx} className="docs-modality-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="docs-modality-badge">{m.badge}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                      MODALITY 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="docs-modality-title">{m.name}</h3>
                  <p className="docs-modality-desc">{m.description}</p>

                  <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                    <span className="docs-modality-section-label">Contextual Settings</span>
                    <div className="docs-tags-row">
                      {m.configFields.map((field, i) => (
                        <span key={i} className="docs-tag">{field}</span>
                      ))}
                    </div>

                    <span className="docs-modality-section-label" style={{ color: "#34d399" }}>Evaluation Rubric</span>
                    <div className="docs-tags-row" style={{ marginBottom: 0 }}>
                      {m.evaluationCriteria.map((crit, i) => (
                        <span key={i} className="docs-tag green">{crit}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: Speech & Audio Pipeline */}
        {activeTab === "voice_stt" && (
          <section className="docs-section">
            <div className="docs-card">
              <div className="docs-card-header">
                <h2 className="docs-card-title">
                  <Radio size={20} aria-hidden="true" />
                  <span>Speech-to-Text & Text-to-Speech Architecture</span>
                </h2>
                <span className="docs-modality-badge">CLOUD WHISPER // SUB-600MS</span>
              </div>
              <div className="docs-card-body">
                <p>
                  PrepQuarters eliminates browser SpeechRecognition unreliability by streaming recorded audio blobs
                  directly through server-side Whisper inference. The entire audio lifecycle is monitored with
                  diagnostic telemetry hooks:
                </p>
                <div className="docs-table-wrapper">
                  <table className="docs-spec-table">
                    <thead>
                      <tr>
                        <th>Pipeline Stage</th>
                        <th>Telemetry Event</th>
                        <th>Component Engine</th>
                        <th>Latency Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Microphone Permission</td>
                        <td><code>[MIC_GRANTED]</code></td>
                        <td>Web Audio API Navigator</td>
                        <td>Instant (&lt;50ms)</td>
                      </tr>
                      <tr>
                        <td>Recording & Volume Meter</td>
                        <td><code>[RECORDING_STARTED]</code></td>
                        <td>AnalyserNode + MediaRecorder</td>
                        <td>Real-time (60fps)</td>
                      </tr>
                      <tr>
                        <td>Blob Packaging</td>
                        <td><code>[AUDIO_BLOB_CREATED]</code></td>
                        <td>audio/webm;codecs=opus</td>
                        <td>&lt;10ms</td>
                      </tr>
                      <tr>
                        <td>Whisper Transcription</td>
                        <td><code>[STT_REQUEST_SENT]</code></td>
                        <td>Groq Whisper (whisper-large-v3)</td>
                        <td>~450ms - 650ms</td>
                      </tr>
                      <tr>
                        <td>Neural Voice TTS</td>
                        <td><code>[TTS_SPEAKING]</code></td>
                        <td>SpeechSynthesisUtterance</td>
                        <td>Instant Auto-Speech</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: Sandbox Code Runner */}
        {activeTab === "code_runner" && (
          <section className="docs-section">
            <div className="docs-card">
              <div className="docs-card-header">
                <h2 className="docs-card-title">
                  <Code size={20} aria-hidden="true" />
                  <span>Sandbox Code Runner & Test Assertion Engine</span>
                </h2>
                <span className="docs-modality-badge">VM ISOLATION</span>
              </div>
              <div className="docs-card-body">
                <p>
                  In Coding and AI Coding rounds, candidate code is executed in an isolated VM sandbox against predefined
                  and dynamic test assertions.
                </p>
                <div className="docs-code-block">
                  <span className="docs-code-comment">// POST /api/interview/:sessionId/run-code Request Schema</span>
                  <pre>{JSON.stringify(
                    {
                      code: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}",
                      language: "javascript",
                      testCases: [
                        { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
                        { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]" }
                      ]
                    },
                    null,
                    2
                  )}</pre>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: Evaluation & Scoring Rubrics */}
        {activeTab === "rubrics" && (
          <section className="docs-section">
            <div className="docs-card">
              <div className="docs-card-header">
                <h2 className="docs-card-title">
                  <Award size={20} aria-hidden="true" />
                  <span>Evidence-Based Multi-Factor Evaluation</span>
                </h2>
                <span className="docs-modality-badge">ZERO FAKE SCORES</span>
              </div>
              <div className="docs-card-body">
                <p>
                  Candidate answers are never assigned arbitrary scores. Each submission is graded across 4 core dimensions:
                </p>
                <div className="docs-table-wrapper">
                  <table className="docs-spec-table">
                    <thead>
                      <tr>
                        <th>Dimension</th>
                        <th>Weight</th>
                        <th>Evaluation Rubric</th>
                        <th>Failure Threshold</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Technical Depth & Accuracy</strong></td>
                        <td>40%</td>
                        <td>Domain key points, complexity bounds, memory layouts, protocols</td>
                        <td>Missing critical constraints</td>
                      </tr>
                      <tr>
                        <td><strong>Trade-Off & Edge Cases</strong></td>
                        <td>25%</td>
                        <td>Comparison of 2+ approaches, latency vs consistency, boundary conditions</td>
                        <td>Single naive approach</td>
                      </tr>
                      <tr>
                        <td><strong>Communication Clarity</strong></td>
                        <td>20%</td>
                        <td>Structured decomposition, STAR methodology adherence, clear naming</td>
                        <td>Unstructured stream of thought</td>
                      </tr>
                      <tr>
                        <td><strong>Operational Accuracy</strong></td>
                        <td>15%</td>
                        <td>Code test assertions passed, syntax correctness, error budgets</td>
                        <td>Failing test cases / runtime errors</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 6: REST API Specification */}
        {activeTab === "api" && (
          <section className="docs-section">
            <div className="docs-card">
              <div className="docs-card-header">
                <h2 className="docs-card-title">
                  <Terminal size={20} aria-hidden="true" />
                  <span>REST API Endpoints Specification</span>
                </h2>
                <span className="docs-modality-badge">JWT AUTHENTICATED</span>
              </div>
              <div className="docs-table-wrapper">
                <table className="docs-spec-table">
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Endpoint Path</th>
                      <th>Description</th>
                      <th>Auth Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiEndpointsList.map((ep, idx) => (
                      <tr key={idx}>
                        <td>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: ep.method === "POST" ? "rgba(6, 182, 212, 0.2)" : "rgba(16, 185, 129, 0.2)",
                              border: ep.method === "POST" ? "1px solid rgba(6, 182, 212, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)",
                              color: ep.method === "POST" ? "var(--cyan-bright)" : "#34d399",
                              fontFamily: "var(--font-mono)",
                              fontSize: "11px",
                              fontWeight: "800",
                            }}
                          >
                            {ep.method}
                          </span>
                        </td>
                        <td><code style={{ color: "var(--text-primary)", fontWeight: "600" }}>{ep.path}</code></td>
                        <td>{ep.description}</td>
                        <td>
                          {ep.path.startsWith("/api/auth/signup") || ep.path.startsWith("/api/auth/login") || ep.path === "/api/system/docs" ? (
                            <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Public</span>
                          ) : (
                            <span style={{ color: "var(--cyan-bright)", fontSize: "11px", fontWeight: "700" }}>Bearer JWT</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 7: Security & Data Privacy */}
        {activeTab === "security" && (
          <section className="docs-section">
            <div className="docs-card">
              <div className="docs-card-header">
                <h2 className="docs-card-title">
                  <ShieldCheck size={20} aria-hidden="true" />
                  <span>Security & Zero Client Credential Leakage</span>
                </h2>
                <span className="docs-modality-badge">ENTERPRISE SECURITY</span>
              </div>
              <div className="docs-card-body">
                <p>
                  PrepQuarters enforces strict security perimeters. All AI keys (NVIDIA NIM, Groq STT, database credentials)
                  reside strictly in server-side environment variables and are never bundled into client distributions.
                </p>
                <div className="docs-features-triad" style={{ marginTop: "20px" }}>
                  <div className="docs-feature-box">
                    <strong>
                      <Lock size={18} style={{ color: "#34d399" }} aria-hidden="true" />
                      <span>Zero Secret Leakage</span>
                    </strong>
                    <p>Browser clients never receive or handle third-party AI provider tokens.</p>
                  </div>
                  <div className="docs-feature-box">
                    <strong>
                      <ShieldCheck size={18} style={{ color: "var(--cyan-bright)" }} aria-hidden="true" />
                      <span>Tenant Isolation</span>
                    </strong>
                    <p>Database queries enforce strict user ID matching on every session, answer, and telemetry fetch.</p>
                  </div>
                  <div className="docs-feature-box">
                    <strong>
                      <Zap size={18} style={{ color: "#fbbf24" }} aria-hidden="true" />
                      <span>Input Sanitization</span>
                    </strong>
                    <p>Sanitization middleware strips disallowed control characters and prevents injection attacks.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quick Launch Footer Banner */}
        <div className="docs-footer-banner">
          <div>
            <h3 className="docs-footer-title">Ready to launch an adaptive mock interview?</h3>
            <p className="docs-footer-subtitle">
              Select from 10 distinct modalities, configure your target duration (2m to 30m), and experience real-time AI evaluation.
            </p>
          </div>
          <button
            type="button"
            className="dashboard-primary-btn"
            style={{ padding: "10px 22px", fontSize: "14px" }}
            onClick={() => navigate("/practice/ai-interview/setup")}
          >
            <span>Launch Mock Interview Cockpit</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
}

export default SystemDocs;
