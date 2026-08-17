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
  ShieldCheck,
  Zap,
  Target,
  Layers,
  Briefcase,
  Sliders,
  TrendingUp,
  Cpu,
  Bot,
  Send,
  Code,
  Edit3,
  ListOrdered,
  AlertOctagon,
  Info,
} from "lucide-react";
import "./ResumeAnalyzer.css";

function ResumeAnalyzer() {
  const navigate = useNavigate();

  // Primary Workspace Mode: "analyzer" vs "builder"
  const [workspaceTab, setWorkspaceTab] = useState("analyzer");

  /* =========================================================
     1. ATS ANALYZER STATE
  ========================================================= */
  const [inputMode, setInputMode] = useState("paste"); // "paste" | "upload"
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  /* =========================================================
     2. AI RESUME BUILDER & LATEX STUDIO STATE
  ========================================================= */
  const [builderStep, setBuilderStep] = useState("role");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your AI Resume Architect. Let's create an ATS-friendly, compile-ready LaTeX resume. To begin, what is your target role (e.g. Senior Backend Engineer, Full Stack Developer)?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [builtResume, setBuiltResume] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    targetRole: "Senior Software Engineer",
    summary: "Senior Software Engineer with 5+ years specializing in distributed systems, high-throughput microservices, and cloud infrastructure.",
    skills: {
      languages: ["Python", "Go", "TypeScript", "SQL"],
      frameworks: ["React", "Node.js", "FastAPI", "Docker"],
      databases: ["PostgreSQL", "Redis", "Kafka"],
      tools: ["AWS", "Kubernetes", "CI/CD", "Git"],
    },
    experience: [
      {
        title: "Senior Backend Engineer",
        company: "Acme Cloud Systems",
        location: "San Francisco, CA",
        dateRange: "2022 - Present",
        bullets: [
          "Architected distributed Kafka event streaming pipeline handling 150,000 requests per second across 3 cloud regions.",
          "Optimized PostgreSQL database query execution plans, reducing P99 latency by 45% and saving $40,000 annually.",
          "Automated container deployment pipelines with Kubernetes, increasing release velocity by 3x.",
        ],
      },
    ],
    education: [
      {
        degree: "B.S. in Computer Science",
        institution: "University of California, Berkeley",
        dateRange: "2018 - 2022",
        details: "Relevant Coursework: Distributed Systems, Operating Systems, Database Internals.",
      },
    ],
    projects: [
      {
        name: "Distributed Raft Key-Value Store",
        tech: "Go, Raft Consensus, gRPC",
        bullets: [
          "Engineered sharded key-value store with leader election and log replication.",
          "Maintained 99.99% availability during simulated network partition stress tests.",
        ],
      },
    ],
  });

  const [latexCode, setLatexCode] = useState("");
  const [generatingLatex, setGeneratingLatex] = useState(false);

  // File Upload handler for analyzer
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (typeof content === "string") {
        setResumeText(content);
      }
    };
    reader.readAsText(file);
  };

  // Run ATS Analyzer
  const handleAnalyze = async (textToUse) => {
    const content = typeof textToUse === "string" ? textToUse : resumeText;
    if (!content || content.trim().length < 40) {
      setError("Please paste your resume content or upload a document (minimum 40 characters).");
      return;
    }

    setError("");
    setAnalyzing(true);
    setReport(null);

    try {
      const res = await fetch("https://prepquarters-backend.onrender.com/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: content,
          jobDescription,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to analyze resume.");
      }

      if (data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
      setError(err.message || "Failed to connect to ATS analysis service.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Send Conversational Builder message
  const handleSendBuilderChat = async () => {
    if (!chatInput.trim() || isAiThinking) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setIsAiThinking(true);

    try {
      const res = await fetch("https://prepquarters-backend.onrender.com/api/resume/build/chat-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userText,
          currentResume: builtResume,
          step: builderStep,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: data.aiResponse }]);
        setBuilderStep(data.nextStep);
        if (data.updatedResume) {
          setBuiltResume(data.updatedResume);
        }
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Got it. Let's proceed to the next section or review the preview on the right." },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Generate Compile-Ready LaTeX
  const handleGenerateLatex = async () => {
    setGeneratingLatex(true);
    try {
      const res = await fetch("https://prepquarters-backend.onrender.com/api/resume/build/generate-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: builtResume }),
      });
      const data = await res.json();
      if (data.success && data.latex) {
        setLatexCode(data.latex);
      }
    } catch (e) {
      console.error("LaTeX generation error:", e);
    } finally {
      setGeneratingLatex(false);
    }
  };

  // Download LaTeX .tex file
  const downloadLatexFile = () => {
    const content = latexCode || generateLocalLatexFallback(builtResume);
    const filename = `${(builtResume.name || "Resume").replace(/\s+/g, "_")}_ATS.tex`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Send Built Resume to ATS Analyzer (Iterative Loop)
  const handleSendToAtsAudit = () => {
    const compiledText = `
${builtResume.name}
${builtResume.email} | ${builtResume.phone} | ${builtResume.location}

PROFESSIONAL SUMMARY:
${builtResume.summary}

TECHNICAL SKILLS:
Languages: ${builtResume.skills.languages?.join(", ")}
Frameworks: ${builtResume.skills.frameworks?.join(", ")}
Databases: ${builtResume.skills.databases?.join(", ")}
Tools: ${builtResume.skills.tools?.join(", ")}

WORK EXPERIENCE:
${builtResume.experience?.map((e) => `${e.title} at ${e.company} (${e.dateRange})\n${e.bullets?.map((b) => `* ${b}`).join("\n")}`).join("\n\n")}

EDUCATION:
${builtResume.education?.map((ed) => `${ed.degree} - ${ed.institution} (${ed.dateRange})\n${ed.details || ""}`).join("\n")}

PROJECTS:
${builtResume.projects?.map((p) => `${p.name} (${p.tech})\n${p.bullets?.map((b) => `* ${b}`).join("\n")}`).join("\n")}
    `.trim();

    setResumeText(compiledText);
    setWorkspaceTab("analyzer");
    handleAnalyze(compiledText);
  };

  const generateLocalLatexFallback = (data) => {
    return `% PrepQuarters ATS-Optimized Professional Resume
\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=0.65in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\begin{document}
\\begin{center}
    {\\huge \\textbf{${data.name}}} \\\\[4pt]
    \\small ${data.phone} $|$ \\href{mailto:${data.email}}{${data.email}} $|$ ${data.location}
\\end{center}
\\section*{Professional Summary}
${data.summary}
\\end{document}
    `;
  };

  // Download ATS Analysis Report
  const downloadReport = (format = "md") => {
    if (!report) return;

    let content = "";
    const filename = `PrepQuarters_ATS_Readiness_Report_${Date.now()}.${format}`;

    if (format === "md") {
      content = `# PrepQuarters Explainable ATS Readiness Report
Target Role: ${report.targetRole}
Analyzed At: ${new Date(report.analyzedAt).toLocaleString()}

## 1. Overall ATS Readiness Score: ${report.overallScore}/100

### Category Breakdown:
- Parsing Compatibility: ${report.categoryScores?.parsingCompatibility?.score}/100 -> ${report.categoryScores?.parsingCompatibility?.explanation}
- Document Structure: ${report.categoryScores?.documentStructure?.score}/100 -> ${report.categoryScores?.documentStructure?.explanation}
- Keyword Coverage: ${report.categoryScores?.keywordRelevance?.score}/100 -> ${report.categoryScores?.keywordRelevance?.explanation}
- Job Description Alignment: ${report.categoryScores?.jdAlignment?.score ? `${report.categoryScores.jdAlignment.score}/100` : "Not provided"} -> ${report.categoryScores?.jdAlignment?.explanation}
- Skills Relevance: ${report.categoryScores?.skillsRelevance?.score}/100 -> ${report.categoryScores?.skillsRelevance?.explanation}
- Experience Quality: ${report.categoryScores?.experienceQuality?.score}/100 -> ${report.categoryScores?.experienceQuality?.explanation}
- Content Quality: ${report.categoryScores?.contentQuality?.score}/100 -> ${report.categoryScores?.contentQuality?.explanation}

## 2. Prioritized Improvement Target ("What is preventing this resume from being stronger?")
${report.prioritizedImprovements?.map((p, i) => `### [${p.priority}] ${p.issue}
- Why It Matters: ${p.whyItMatters}
- Suggested Action: ${p.suggestedImprovement}
${p.exampleWording ? `- Example Wording: "${p.exampleWording}"` : ""}`).join("\n\n")}

## 3. Keywords & Competency Analysis
- Matched Keywords: ${report.foundKeywords?.join(", ") || "None"}
- Missing Target Keywords: ${report.missingKeywords?.join(", ") || "None"}

---
*Disclaimer: ${report.disclaimer}*
`;
    } else {
      content = `PREPQUARTERS ATS READINESS REPORT
==================================
Overall Score: ${report.overallScore}/100
Target Role: ${report.targetRole}

IMPROVEMENT PRIORITIES:
${report.prioritizedImprovements?.map((p) => `[${p.priority}] ${p.issue}\n-> Action: ${p.suggestedImprovement}\n`).join("\n")}
`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <main className="resume-analyzer-page bg-grid-cyber">
      <div className="resume-container">
        {/* Navigation & Header */}
        <div className="resume-nav-row">
          <button type="button" className="resume-back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Home</span>
          </button>
          <div className="resume-badge-pill">
            <span className="pulse-dot cyan" />
            <span>ATS INTELLIGENCE // RESUME SUITE</span>
          </div>
        </div>

        {/* Hero Header */}
        <header className="resume-header">
          <div className="resume-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            <span>EXPLAINABLE ATS READINESS & LATEX BUILDER</span>
          </div>
          <h1>Industry-Standard ATS Resume Intelligence</h1>
          <p className="resume-subtitle">
            Scan your resume against standards-based ATS heuristics, analyze keyword coverage,
            receive prioritized improvement targets, or build compile-ready LaTeX resumes in a guided AI studio.
          </p>
        </header>

        {/* Primary Workspace Mode Selector */}
        <div className="workspace-tabs-row">
          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === "analyzer" ? "active" : ""}`}
            onClick={() => setWorkspaceTab("analyzer")}
          >
            <FileText size={16} />
            <span>ATS Resume Analyzer & Scanner</span>
          </button>
          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === "builder" ? "active" : ""}`}
            onClick={() => {
              setWorkspaceTab("builder");
              if (!latexCode) handleGenerateLatex();
            }}
          >
            <Bot size={16} />
            <span>AI Resume Builder & LaTeX Studio</span>
          </button>
        </div>

        {error && (
          <div className="resume-error-banner" role="alert">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* =========================================================
            WORKSPACE TAB 1: ATS RESUME ANALYZER
        ========================================================= */}
        {workspaceTab === "analyzer" && (
          <div>
            <div className="resume-input-grid">
              {/* Left: Resume Input */}
              <section className="resume-card">
                <div className="resume-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FileText size={20} style={{ color: "var(--cyan-bright)" }} />
                    <h3>Resume Content</h3>
                  </div>
                  <div className="resume-toggle-pills">
                    <button
                      type="button"
                      className={`resume-toggle-btn ${inputMode === "paste" ? "active" : ""}`}
                      onClick={() => setInputMode("paste")}
                    >
                      Paste Text / LaTeX
                    </button>
                    <button
                      type="button"
                      className={`resume-toggle-btn ${inputMode === "upload" ? "active" : ""}`}
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
                      placeholder="Paste your plain text, Markdown, or LaTeX resume content here...&#10;&#10;Example:&#10;John Doe - Senior Backend Engineer&#10;Technical Skills: Python, Go, Distributed Systems, PostgreSQL, AWS, Docker&#10;Experience: Senior Engineer at Acme Corp (2022-Present)..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                    <div className="resume-char-count">
                      <span>{resumeText.length} characters</span>
                    </div>
                  </div>
                ) : (
                  <div className="resume-upload-zone">
                    <input
                      type="file"
                      id="resume-file-input"
                      accept=".txt,.md,.tex,.doc,.docx,.pdf"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="resume-file-input" className="resume-dropzone-label">
                      <UploadCloud size={40} style={{ color: "var(--cyan-bright)", marginBottom: "10px" }} />
                      <strong>Choose a document or drag & drop</strong>
                      <p>Supports .txt, .md, .tex, .docx, .pdf text documents</p>
                      {uploadedFileName && (
                        <div className="uploaded-file-tag">
                          <Check size={14} />
                          <span>{uploadedFileName}</span>
                        </div>
                      )}
                    </label>
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
                  <span className="resume-optional-tag">RECOMMENDED FOR JD MATCH</span>
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
                    placeholder="Paste the target job description to analyze keyword overlap, missing skills, and candidate qualification alignment..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="resume-analyze-btn"
                  disabled={analyzing || !resumeText.trim()}
                  onClick={() => handleAnalyze()}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw size={18} className="spin-icon" />
                      <span>Evaluating ATS Readiness Heuristics...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      <span>Run Explainable ATS Audit</span>
                    </>
                  )}
                </button>
              </section>
            </div>

            {/* =========================================================
                EXPLAINABLE ATS READINESS REPORT DASHBOARD
            ========================================================= */}
            {report && (
              <div className="resume-report-container">
                {/* Scorecard Header */}
                <div className="report-header-card">
                  <div>
                    <span className="report-badge">AUDIT COMPLETE</span>
                    <h2>Explainable ATS Readiness Assessment</h2>
                    <p>Target Role: <strong>{report.targetRole}</strong> // Benchmarked against multi-category applicant tracking heuristics.</p>
                  </div>

                  <div className="report-download-actions">
                    <button
                      type="button"
                      className="report-action-btn"
                      onClick={() => downloadReport("md")}
                    >
                      <Download size={15} />
                      <span>Download Markdown Report</span>
                    </button>
                    <button
                      type="button"
                      className="report-action-btn secondary"
                      onClick={() => downloadReport("txt")}
                    >
                      <Download size={15} />
                      <span>Download Text Summary</span>
                    </button>
                  </div>
                </div>

                {/* Overall Score Banner */}
                <div className="ats-overall-banner">
                  <div className="overall-score-left">
                    <span className="overall-label">OVERALL ATS READINESS SCORE</span>
                    <strong className="overall-val">{report.overallScore}<span>/100</span></strong>
                  </div>
                  <p className="overall-explanation">
                    Weighted calculation of parsing compatibility, structural integrity, keyword coverage, and quantifiable achievement density.
                  </p>
                </div>

                {/* Granular Category Scores Grid */}
                <div className="category-scores-grid">
                  {Object.entries(report.categoryScores || {}).map(([catKey, catObj]) => (
                    <div key={catKey} className="category-score-card">
                      <div className="category-score-top">
                        <strong className="category-name">
                          {catKey.replace(/([A-Z])/g, " $1").trim()}
                        </strong>
                        <span className={`cat-score-pill ${catObj.score >= 80 ? "high" : catObj.score >= 60 ? "med" : "low"}`}>
                          {catObj.score !== null ? `${catObj.score}/100` : "N/A"}
                        </span>
                      </div>
                      <p className="cat-score-desc">{catObj.explanation}</p>
                    </div>
                  ))}
                </div>

                {/* Prioritized Improvement Target: "What is preventing this resume from being stronger?" */}
                <div className="report-card">
                  <div className="report-card-header-row">
                    <h3 style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                      <ListOrdered size={20} />
                      <span>What is preventing this resume from being stronger?</span>
                    </h3>
                    <span className="docs-tag">PRIORITIZED TARGETS</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "18px" }}>
                    Actionable, evidence-based recommendations categorized by severity.
                  </p>

                  <div className="priorities-container">
                    {report.prioritizedImprovements?.map((item, idx) => (
                      <div key={idx} className={`priority-item-card ${item.priority.toLowerCase()}`}>
                        <div className="priority-header-row">
                          <span className={`priority-tag ${item.priority.toLowerCase()}`}>{item.priority}</span>
                          <strong className="priority-issue">{item.issue}</strong>
                        </div>
                        <p className="priority-why">
                          <strong>Why It Matters:</strong> {item.whyItMatters}
                        </p>
                        <p className="priority-action">
                          <strong>Suggested Improvement:</strong> {item.suggestedImprovement}
                        </p>
                        {item.exampleWording && (
                          <div className="priority-example-box">
                            <span>Example Wording:</span>
                            <code>"{item.exampleWording}"</code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keywords Cloud */}
                <div className="report-grid-2col">
                  <div className="report-card">
                    <h4 style={{ color: "#34d399", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <CheckCircle2 size={18} />
                      <span>Identified Technical Skills ({report.foundKeywords.length})</span>
                    </h4>
                    <div className="keywords-tags-cloud">
                      {report.foundKeywords.map((k) => (
                        <span key={k} className="keyword-pill matched">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="report-card">
                    <h4 style={{ color: "#f87171", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <AlertTriangle size={18} />
                      <span>Missing & Recommended Keywords ({report.recommendedKeywords.length})</span>
                    </h4>
                    <div className="keywords-tags-cloud">
                      {report.recommendedKeywords.map((k) => (
                        <span key={k} className="keyword-pill missing">
                          + {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weak Bullets & STAR Rewrites */}
                {report.weakBullets && report.weakBullets.length > 0 && (
                  <div className="report-card">
                    <div className="report-card-header-row">
                      <h4 style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                        <Sparkles size={18} />
                        <span>Weak Bullet Points & Suggested STAR / XYZ Rewrites</span>
                      </h4>
                      <span className="docs-tag">XYZ FORMULA</span>
                    </div>

                    <div className="weak-bullets-list" style={{ marginTop: "16px" }}>
                      {report.weakBullets.map((b, idx) => (
                        <div key={idx} className="weak-bullet-item">
                          <div className="bullet-original">
                            <span className="bullet-label original">Original:</span>
                            <p>"{b.original}"</p>
                            <span className="bullet-issue">Issue: {b.issue}</span>
                          </div>

                          <div className="bullet-suggested">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span className="bullet-label suggested">Suggested STAR Rewrite:</span>
                              <button
                                type="button"
                                className="bullet-copy-btn"
                                onClick={() => copyText(b.suggestedRewrite, `bullet_${idx}`)}
                              >
                                {copiedSection === `bullet_${idx}` ? <Check size={13} /> : <Copy size={13} />}
                                <span>{copiedSection === `bullet_${idx}` ? "Copied" : "Copy"}</span>
                              </button>
                            </div>
                            <p className="suggested-text">"{b.suggestedRewrite}"</p>
                          </div>
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
            WORKSPACE TAB 2: AI RESUME BUILDER & LATEX STUDIO
        ========================================================= */}
        {workspaceTab === "builder" && (
          <div className="builder-workspace-grid">
            {/* Left: Guided Conversational AI Assistant */}
            <section className="builder-chat-card">
              <div className="builder-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Bot size={20} style={{ color: "var(--cyan-bright)" }} />
                  <h3>Guided Conversational Resume Architect</h3>
                </div>
                <span className="builder-step-pill">STEP: {builderStep.toUpperCase()}</span>
              </div>

              <div className="builder-messages-pane">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble-wrap ${msg.sender}`}>
                    <div className={`chat-bubble ${msg.sender}`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isAiThinking && (
                  <div className="chat-bubble-wrap ai">
                    <div className="chat-bubble ai thinking">
                      <RefreshCw size={14} className="spin-icon" />
                      <span>Structuring resume data...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="builder-input-bar">
                <input
                  type="text"
                  className="builder-chat-input"
                  placeholder="Type your response (e.g. your skills, role, or past projects)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendBuilderChat();
                  }}
                />
                <button
                  type="button"
                  className="builder-send-btn"
                  disabled={!chatInput.trim() || isAiThinking}
                  onClick={handleSendBuilderChat}
                >
                  <Send size={16} />
                </button>
              </div>
            </section>

            {/* Right: Live Structured Resume Preview & Compile-Ready LaTeX Actions */}
            <section className="builder-preview-card">
              <div className="builder-preview-top">
                <div>
                  <h3>Live Resume Document Preview</h3>
                  <p>Real-time ATS structured preview. Verified user information only.</p>
                </div>
                <div className="builder-actions-row">
                  <button
                    type="button"
                    className="report-action-btn"
                    onClick={downloadLatexFile}
                  >
                    <Download size={14} />
                    <span>Download .tex (LaTeX)</span>
                  </button>
                  <button
                    type="button"
                    className="report-action-btn secondary"
                    onClick={handleSendToAtsAudit}
                  >
                    <Zap size={14} />
                    <span>Run ATS Audit Loop</span>
                  </button>
                </div>
              </div>

              {/* Document Paper Preview */}
              <div className="paper-preview-wrap">
                <div className="paper-preview">
                  <header className="paper-header">
                    <h2>{builtResume.name}</h2>
                    <p className="paper-contact">
                      {builtResume.phone} | {builtResume.email} | {builtResume.location}
                    </p>
                    <p className="paper-links">{builtResume.linkedin} | {builtResume.github}</p>
                  </header>

                  <section className="paper-section">
                    <h4>PROFESSIONAL SUMMARY</h4>
                    <p>{builtResume.summary}</p>
                  </section>

                  <section className="paper-section">
                    <h4>TECHNICAL SKILLS</h4>
                    <p><strong>Languages:</strong> {builtResume.skills.languages?.join(", ")}</p>
                    <p><strong>Frameworks:</strong> {builtResume.skills.frameworks?.join(", ")}</p>
                    <p><strong>Databases:</strong> {builtResume.skills.databases?.join(", ")}</p>
                    <p><strong>Cloud/Tools:</strong> {builtResume.skills.tools?.join(", ")}</p>
                  </section>

                  <section className="paper-section">
                    <h4>WORK EXPERIENCE</h4>
                    {builtResume.experience?.map((exp, i) => (
                      <div key={i} className="paper-item">
                        <div className="paper-item-top">
                          <strong>{exp.title} - {exp.company}</strong>
                          <span>{exp.dateRange}</span>
                        </div>
                        <ul>
                          {exp.bullets?.map((b, bi) => (
                            <li key={bi}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>

                  <section className="paper-section">
                    <h4>TECHNICAL PROJECTS</h4>
                    {builtResume.projects?.map((proj, pi) => (
                      <div key={pi} className="paper-item">
                        <div className="paper-item-top">
                          <strong>{proj.name}</strong>
                          <span>{proj.tech}</span>
                        </div>
                        <ul>
                          {proj.bullets?.map((b, bi) => (
                            <li key={bi}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>

                  <section className="paper-section">
                    <h4>EDUCATION</h4>
                    {builtResume.education?.map((edu, ei) => (
                      <div key={ei} className="paper-item">
                        <div className="paper-item-top">
                          <strong>{edu.degree} - {edu.institution}</strong>
                          <span>{edu.dateRange}</span>
                        </div>
                        {edu.details && <p style={{ fontSize: "11px", color: "#666" }}>{edu.details}</p>}
                      </div>
                    ))}
                  </section>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default ResumeAnalyzer;
