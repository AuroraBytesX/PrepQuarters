import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Copy,
  Check,
  RefreshCw,
  Target,
  Layers,
  Send,
  Code,
  Edit3,
  ListOrdered,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  Zap,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import "./ResumeAnalyzer.css";

function ResumeAnalyzer() {
  const navigate = useNavigate();

  // Primary Workspace Mode: "analyzer" vs "builder"
  const [workspaceTab, setWorkspaceTab] = useState("analyzer");

  /* =========================================================
     1. RESUME IMPROVEMENT & TAILORING STATE
  ========================================================= */
  const [inputMode, setInputMode] = useState("paste"); // "paste" | "upload"
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  /* =========================================================
     2. AI RESUME BUILDER & LATEX STUDIO STATE
  ========================================================= */
  const [builderStep, setBuilderStep] = useState("role");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your AI Resume Architect. What is your target role (e.g., Senior Backend Engineer, Full Stack Developer, DevOps Specialist)?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  const [builtResume, setBuiltResume] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    targetRole: "",
    summary: "",
    skills: { languages: [], frameworks: [], databases: [], tools: [] },
    experience: [],
    education: [],
    projects: [],
  });

  const [latexCode, setLatexCode] = useState("");
  const [generatingLatex, setGeneratingLatex] = useState(false);

  // File Upload handler for analyzer
  const processSelectedFile = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Document exceeds 5MB. Please upload a standard resume document under 5MB.");
      return;
    }

    setSelectedFile(file);
    setUploadedFileName(file.name);
    setError("");

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      setResumeText(`[Uploaded Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB) - Ready for ATS parsing]`);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        if (typeof content === "string") {
          setResumeText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Run Qualitative Resume Analysis
  const handleAnalyze = async (textToUse) => {
    const content = typeof textToUse === "string" ? textToUse : resumeText;
    const isUsingFile = Boolean(selectedFile && (!textToUse || inputMode === "upload"));

    if (!isUsingFile && (!content || content.trim().length < 20)) {
      setError("Please paste your resume content or upload a document (minimum 20 characters).");
      return;
    }

    setError("");
    setAnalyzing(true);
    setReport(null);

    try {
      let res;
      if (isUsingFile) {
        const formData = new FormData();
        formData.append("resumeFile", selectedFile);
        formData.append("jobDescription", jobDescription || "");
        formData.append("targetRole", targetRole || "Software Engineer");

        res = await fetch(`${API_BASE_URL}/api/resume/analyze`, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/resume/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: content,
            jobDescription: jobDescription || "",
            targetRole: targetRole || "Software Engineer",
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to analyze resume.");
      }

      if (data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
      setReport(null);
      setError(err.message || "Failed to connect to resume analysis service.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Conversational Resume Builder message submission
  const handleSendMessage = async (customMsg = null, confirmGenerate = false) => {
    const text = typeof customMsg === "string" ? customMsg : chatInput;
    if (!text.trim() && !confirmGenerate) return;

    if (!confirmGenerate) {
      setChatMessages((prev) => [...prev, { sender: "user", text: text.trim() }]);
      setChatInput("");
    }
    setIsAiThinking(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/resume/builder/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentResume: builtResume,
          message: confirmGenerate ? "generate final resume" : text.trim(),
          step: builderStep,
          userConfirmed: confirmGenerate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: data.aiResponse }]);
        if (data.updatedResume) setBuiltResume(data.updatedResume);
        if (data.nextStep) setBuilderStep(data.nextStep);
        if (typeof data.confirmationPending === "boolean") setConfirmationPending(data.confirmationPending);
        if (data.latex) setLatexCode(data.latex);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: "I encountered an issue updating your resume state. Please try again." },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleCompileLatex = async () => {
    setGeneratingLatex(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/resume/generate-latex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: builtResume }),
      });
      const data = await res.json();
      if (data.success && data.latex) {
        setLatexCode(data.latex);
      }
    } catch (e) {
      console.error("LaTeX compilation error:", e);
    } finally {
      setGeneratingLatex(false);
    }
  };

  // Download LaTeX .tex file
  const downloadLatexFile = () => {
    const filename = `${(builtResume.name || "Resume").replace(/\s+/g, "_")}_ATS.tex`;
    const blob = new Blob([latexCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="resume-analyzer-page">
      <div className="resume-container">
        {/* Navigation Bar */}
        <div className="resume-nav-row">
          <button type="button" className="resume-back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <div className="resume-badge-pill">
            <span>RESUME INTELLIGENCE & TAILORING</span>
          </div>
        </div>

        {/* Header */}
        <header className="resume-header">
          <div className="resume-eyebrow">
            <Sparkles size={14} />
            <span>PRACTICAL RESUME FEEDBACK</span>
          </div>
          <h1>Resume Improvement & Tailoring</h1>
          <p className="resume-subtitle">
            Get actionable suggestions on missing impact metrics, technical keywords, and job-description alignment without arbitrary numerical scores.
          </p>
        </header>

        {/* Primary Workspace Mode Switcher */}
        <div className="resume-workspace-switcher">
          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === "analyzer" ? "active" : ""}`}
            onClick={() => setWorkspaceTab("analyzer")}
          >
            <Target size={16} />
            <span>Resume Improvement & Suggestions</span>
          </button>
          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === "builder" ? "active" : ""}`}
            onClick={() => setWorkspaceTab("builder")}
          >
            <Code size={16} />
            <span>Interactive LaTeX Builder</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="resume-error-banner">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* =========================================================
            TAB 1: RESUME IMPROVEMENT & SUGGESTIONS
        ========================================================= */}
        {workspaceTab === "analyzer" && (
          <div className="resume-analyzer-layout">
            <div className="resume-input-grid">
              {/* Left: Input Mode & Content */}
              <section className="resume-card">
                <div className="resume-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FileText size={20} style={{ color: "#10b981" }} />
                    <h3>Resume Document</h3>
                  </div>

                  <div className="resume-mode-pills">
                    <button
                      type="button"
                      className={`mode-pill ${inputMode === "paste" ? "active" : ""}`}
                      onClick={() => setInputMode("paste")}
                    >
                      Paste Text
                    </button>
                    <button
                      type="button"
                      className={`mode-pill ${inputMode === "upload" ? "active" : ""}`}
                      onClick={() => setInputMode("upload")}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {inputMode === "paste" ? (
                  <div className="resume-textarea-wrap">
                    <textarea
                      className="resume-textarea"
                      rows={14}
                      placeholder="Paste your plain text, Markdown, or LaTeX resume content here...&#10;&#10;Example:&#10;Technical Skills: Python, Go, Distributed Systems, PostgreSQL, AWS, Docker&#10;Experience: Architected distributed event streaming pipeline handling 150k req/sec..."
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        setSelectedFile(null);
                        setUploadedFileName("");
                      }}
                    />
                    <div className="resume-char-count">
                      <span>{resumeText.length} characters</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`resume-upload-zone ${isDragging ? "dragging-active" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processSelectedFile(e.dataTransfer.files[0]);
                      }
                    }}
                    style={{
                      border: isDragging ? "2px dashed #10b981" : "2px dashed rgba(255, 255, 255, 0.15)",
                      background: isDragging ? "rgba(16, 185, 129, 0.08)" : "rgba(0, 0, 0, 0.2)",
                      borderRadius: "14px",
                      padding: "28px 20px",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <input
                      type="file"
                      id="resume-file-input"
                      accept=".pdf,.docx,.doc,.txt,.md,.tex"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />

                    {selectedFile ? (
                      <div
                        style={{
                          background: "rgba(16, 185, 129, 0.06)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          borderRadius: "12px",
                          padding: "20px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "10px",
                            background: "rgba(16, 185, 129, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#10b981",
                          }}
                        >
                          <FileText size={26} />
                        </div>

                        <div>
                          <strong style={{ display: "block", color: "#f8fafc", fontSize: "1rem", wordBreak: "break-all" }}>
                            {selectedFile.name}
                          </strong>
                          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                            {(selectedFile.size / 1024).toFixed(1)} KB &bull; Document Verified (Max 5MB)
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "0.85rem", fontWeight: 600 }}>
                          <CheckCircle2 size={16} />
                          <span>Ready for Text Extraction</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setUploadedFileName("");
                            setResumeText("");
                          }}
                          style={{
                            marginTop: "8px",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#f87171",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Remove / Choose Another File
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="resume-file-input" style={{ cursor: "pointer", display: "block" }}>
                        <UploadCloud size={44} style={{ color: "#10b981", margin: "0 auto 12px" }} />
                        <strong style={{ display: "block", fontSize: "1.05rem", color: "#f8fafc", marginBottom: "6px" }}>
                          Choose a PDF document or drag & drop
                        </strong>
                        <p style={{ fontSize: "0.88rem", color: "#94a3b8", margin: "0 0 14px" }}>
                          Supports PDF, DOCX, LaTeX, Markdown, or TXT (Max 5MB)
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "8px 18px",
                            borderRadius: "8px",
                            background: "rgba(16, 185, 129, 0.12)",
                            border: "1px solid rgba(16, 185, 129, 0.35)",
                            color: "#34d399",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                          }}
                        >
                          Browse File
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </section>

              {/* Right: Job Description & Controls */}
              <section className="resume-card">
                <div className="resume-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Target size={20} style={{ color: "#34d399" }} />
                    <h3>Target Job Description (Optional)</h3>
                  </div>
                  <span className="resume-optional-tag">RECOMMENDED FOR TAILORING</span>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label className="resume-field-label">Target Role Persona</label>
                  <select
                    className="resume-role-select"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    <option value="Software Engineer">Software Engineer (General)</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Full Stack Engineer">Full Stack Engineer</option>
                    <option value="Distributed Systems Architect">Distributed Systems Architect</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Site Reliability Engineer (SRE)">Site Reliability Engineer (SRE)</option>
                    <option value="Technical Product Manager">Technical Product Manager</option>
                  </select>
                </div>

                <div className="resume-textarea-wrap">
                  <textarea
                    className="resume-textarea"
                    rows={9}
                    placeholder="Paste the target job description to analyze missing keywords, tech stack alignment, and tailoring suggestions..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="resume-analyze-btn"
                  disabled={analyzing || (!selectedFile && !resumeText.trim())}
                  onClick={() => handleAnalyze()}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw size={18} className="spin-icon" />
                      <span>Analyzing Resume & Generating Suggestions...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      <span>Generate Actionable Suggestions</span>
                    </>
                  )}
                </button>
              </section>
            </div>

            {/* =========================================================
                ACTIONABLE QUALITATIVE SUGGESTIONS (NO ARBITRARY ATS SCORE)
            ========================================================= */}
            {report && (
              <div className="resume-report-container" style={{ marginTop: "36px" }}>
                <div className="report-header-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "24px", boxShadow: "var(--shadow-glass)" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    SUGGESTIONS & TAILORING FEEDBACK
                  </span>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", margin: "4px 0 8px" }}>
                    Resume Diagnostic Suggestions
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0, lineHeight: 1.5 }}>
                    {report.summaryFeedback}
                  </p>
                </div>

                {/* 1. Improvements to Make */}
                {report.improvementsToMake?.length > 0 && (
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "24px", marginTop: "18px", boxShadow: "var(--shadow-glass)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f59e0b", marginBottom: "16px" }}>
                      <AlertTriangle size={20} />
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Improve This
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {report.improvementsToMake.map((imp, idx) => (
                        <div key={idx} style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "16px" }}>
                          <strong style={{ color: "#d97706", fontSize: "0.9rem", display: "block", marginBottom: "4px" }}>
                            {imp.category}: {imp.issue}
                          </strong>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
                            {imp.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Consider Adding */}
                {report.recommendedAdditions?.length > 0 && (
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "24px", marginTop: "18px", boxShadow: "var(--shadow-glass)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-primary)", marginBottom: "16px" }}>
                      <PlusCircle size={20} />
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Consider Adding
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {report.recommendedAdditions.map((add, idx) => (
                        <div key={idx} style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)", borderRadius: "10px", padding: "16px" }}>
                          <strong style={{ color: "var(--accent-primary)", fontSize: "0.9rem", display: "block", marginBottom: "4px" }}>
                            {add.category}
                          </strong>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
                            {add.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Consider Removing */}
                {report.recommendedRemovals?.length > 0 && (
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "24px", marginTop: "18px", boxShadow: "var(--shadow-glass)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f43f5e", marginBottom: "16px" }}>
                      <MinusCircle size={20} />
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Consider Removing
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {report.recommendedRemovals.map((rem, idx) => (
                        <div key={idx} style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "10px", padding: "16px" }}>
                          <strong style={{ color: "#dc2626", fontSize: "0.9rem", display: "block", marginBottom: "4px" }}>
                            {rem.category}: {rem.issue}
                          </strong>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
                            {rem.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Job Description Alignment */}
                {report.jdTailoredSuggestions?.length > 0 && (
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "24px", marginTop: "18px", boxShadow: "var(--shadow-glass)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-cyan)", marginBottom: "16px" }}>
                      <Target size={20} />
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Job Description Alignment & Missing Keywords
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {report.jdTailoredSuggestions.map((jd, idx) => (
                        <div key={idx} style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "16px" }}>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                            {jd.missingKeywords?.map((kw, kIdx) => (
                              <span key={kIdx} style={{ fontSize: "0.78rem", background: "rgba(56, 189, 248, 0.15)", color: "var(--accent-cyan)", padding: "3px 8px", borderRadius: "6px", fontWeight: 600 }}>
                                + {kw}
                              </span>
                            ))}
                          </div>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
                            {jd.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: INTERACTIVE LATEX BUILDER STUDIO
        ========================================================= */}
        {workspaceTab === "builder" && (
          <div style={{ marginTop: "24px" }}>
            {/* Instructional Reference Example Panel */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-glass)",
                borderRadius: "14px",
                padding: "20px 24px",
                marginBottom: "20px",
                boxShadow: "var(--shadow-glass)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Sparkles size={16} color="var(--accent-primary)" />
                <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  What Good Information Looks Like (Instructional Reference)
                </strong>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-mono)",
                    background: "var(--accent-soft)",
                    color: "var(--accent-primary)",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontWeight: 700,
                  }}
                >
                  EXAMPLE ONLY
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.5 }}>
                Use this format as a reference when answering the assistant. Concrete engineering metrics and active verbs yield the strongest LaTeX resume output. This reference is never injected into your document.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                <div style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "14px" }}>
                  <strong style={{ fontSize: "0.82rem", color: "var(--accent-primary)", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Project Impact Example
                  </strong>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", margin: "0 0 4px", fontWeight: 600 }}>
                    Distributed Rate Limiter (Go, Redis, gRPC)
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    Engineered token-bucket rate limiter handling 120k req/sec with 0.8ms p99 latency, reducing API downtime by 99.9%.
                  </p>
                </div>

                <div style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "14px" }}>
                  <strong style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Experience Bullet Example
                  </strong>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", margin: "0 0 4px", fontWeight: 600 }}>
                    Software Engineer at TechCorp
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    Spearheaded database query optimization and Redis caching, reducing server compute costs by $24k annually.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Left: Conversational Assistant */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "24px", display: "flex", flexDirection: "column", height: "600px", boxShadow: "var(--shadow-glass)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px", marginBottom: "16px" }}>
                <Code size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Conversational Resume Assistant
                </h3>
              </div>

              {/* Chat Message Stream */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "8px" }}>
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: msg.sender === "user" ? "var(--accent-primary)" : "var(--bg-surface-2)",
                      color: msg.sender === "user" ? "#ffffff" : "var(--text-primary)",
                      fontSize: "0.9rem",
                      lineHeight: 1.5,
                      border: msg.sender === "user" ? "none" : "1px solid var(--border-subtle)",
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                {isAiThinking && (
                  <div style={{ alignSelf: "flex-start", color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                    AI Architect is thinking...
                  </div>
                )}
              </div>

              {/* Pre-Generation Confirmation Prompt */}
              {confirmationPending && (
                <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)", borderRadius: "10px", padding: "14px", margin: "12px 0" }}>
                  <p style={{ margin: "0 0 10px", fontSize: "0.88rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                    Would you like to edit anything before I generate the final resume?
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => handleSendMessage(null, true)}
                      style={{
                        background: "var(--accent-primary)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Confirm & Compile LaTeX
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{ display: "flex", gap: "10px", marginTop: "12px" }}
              >
                <input
                  type="text"
                  placeholder="Type your response or edit request (e.g. 'change target role to DevOps Specialist')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
                <button
                  type="submit"
                  disabled={isAiThinking || !chatInput.trim()}
                  style={{
                    background: "var(--accent-primary)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Right: Compile-Ready LaTeX Code Preview */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "24px", display: "flex", flexDirection: "column", height: "600px", boxShadow: "var(--shadow-glass)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Compile-Ready LaTeX Document
                </h3>
                {latexCode && (
                  <button
                    type="button"
                    onClick={downloadLatexFile}
                    style={{
                      background: "var(--accent-primary)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 14px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Download size={14} />
                    <span>Download .tex</span>
                  </button>
                )}
              </div>

              <textarea
                readOnly
                value={latexCode || "% Complete the conversational interview on the left to compile your clean LaTeX resume.\n% No fake placeholder candidate data will be generated."}
                style={{
                  flex: 1,
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "var(--accent-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  resize: "none",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  </main>
);
}

export default ResumeAnalyzer;
