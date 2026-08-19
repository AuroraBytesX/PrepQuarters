import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Cpu, MessageSquare, Code, Users, FileText, Shield, ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";

function SystemDocs() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: BookOpen },
    { id: "provider-modes", title: "AI Provider Modes", icon: Cpu },
    { id: "interview-modalities", title: "Interview Modalities", icon: MessageSquare },
    { id: "coding-sandbox", title: "Coding Sandbox", icon: Code },
    { id: "resume-tools", title: "Resume Improvement", icon: FileText },
    { id: "privacy-security", title: "Data & Privacy", icon: Shield },
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px 80px", color: "var(--text-primary)" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--accent-primary)",
            textDecoration: "none",
            fontSize: "0.88rem",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, margin: "0 0 8px", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Platform Documentation
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", margin: 0, lineHeight: 1.5 }}>
          Practical guidance on configuring mock interviews, executing code in the sandbox, and managing your AI intelligence provider.
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "32px", alignItems: "start" }}>
        {/* Navigation Sidebar */}
        <nav
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "14px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            boxShadow: "var(--shadow-glass)",
          }}
        >
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                  color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={16} />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Panel */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            padding: "32px",
            lineHeight: 1.7,
            boxShadow: "var(--shadow-glass)",
          }}
        >
          {activeSection === "getting-started" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 0 }}>Getting Started</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                PrepQuarters is designed to provide structured, multi-turn technical interview preparation across engineering disciplines.
              </p>
              <h3 style={{ fontSize: "1.2rem", color: "var(--accent-primary)", marginTop: "24px" }}>Quick Setup Steps</h3>
              <ol style={{ paddingLeft: "20px", color: "var(--text-secondary)" }}>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Create an Account:</strong> Register with your email address and target role.</li>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Select AI Provider:</strong> Choose between built-in platform intelligence (My API) or connect your own provider key (BYOK).</li>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Choose Modality:</strong> Select from Voice + Technical, Coding Sandbox, HR Behavioral, or System Design.</li>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Review Feedback:</strong> Completed sessions generate scorecards breaking down technical accuracy, communication, and missed edge cases.</li>
              </ol>
            </div>
          )}

          {activeSection === "provider-modes" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 0 }}>AI Provider Modes</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                PrepQuarters supports two provider modes to ensure accessibility and control over AI intelligence:
              </p>
              <h3 style={{ fontSize: "1.2rem", color: "var(--accent-primary)", marginTop: "20px" }}>Mode A: My API (Platform Intelligence)</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Uses PrepQuarters platform infrastructure. Requests are subject to a server-side rate limit of <strong>40 requests per minute</strong> per user/IP. API keys are handled strictly on the backend and never exposed to the client.
              </p>
              <h3 style={{ fontSize: "1.2rem", color: "var(--accent-primary)", marginTop: "20px" }}>Mode B: Bring Your Own API (BYOK)</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Allows you to supply your own API key for OpenAI, Anthropic, or xAI. BYOK keys are verified securely and stored in session context only, completely bypassing platform quotas.
              </p>
            </div>
          )}

          {activeSection === "interview-modalities" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 0 }}>Supported Interview Modalities</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                <div style={{ padding: "16px", background: "var(--bg-surface-2)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>AI Voice + Technical Interview</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Spoken question and answer flow using live Whisper speech-to-text. Evaluates core architectural and technical reasoning.</p>
                </div>
                <div style={{ padding: "16px", background: "var(--bg-surface-2)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>HR / Behavioral Interview</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Structured practice for situational questions following the STAR (Situation, Task, Action, Result) framework.</p>
                </div>
                <div style={{ padding: "16px", background: "var(--bg-surface-2)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>Language-Specific Technical</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Deep-dive concept questions targeting Python, Java, C, C++, Rust, Go, or SQL runtime internals.</p>
                </div>
                <div style={{ padding: "16px", background: "var(--bg-surface-2)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>System Design Interview</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>High-scale architectural scenarios evaluating database sharding, caching tiers, asynchronous pipelines, and fault tolerance.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "coding-sandbox" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 0 }}>Isolated Coding Sandbox</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                The coding environment executes user solutions against deterministic test cases with strict runtime boundaries.
              </p>
              <h3 style={{ fontSize: "1.2rem", color: "var(--accent-primary)", marginTop: "20px" }}>Execution & Evaluation Rules</h3>
              <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)" }}>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Test Assertion Verification:</strong> Solutions run against multiple test inputs measuring runtime and memory correctness.</li>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Evidence-Based Scoring:</strong> AI evaluates Big-O complexity and code quality. If code is fundamentally incorrect, the technical score is strictly 0.</li>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Timeouts:</strong> Execution is bounded to 2500ms to prevent infinite loops.</li>
              </ul>
            </div>
          )}

          {activeSection === "resume-tools" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 0 }}>Resume Improvement & Builder</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                The resume module focuses on explainable improvements rather than arbitrary universal scores.
              </p>
              <h3 style={{ fontSize: "1.2rem", color: "var(--accent-primary)", marginTop: "20px" }}>Key Capabilities</h3>
              <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)" }}>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>5MB PDF Upload:</strong> Upload standard PDF documents up to 5MB with automatic stream text parsing.</li>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Job Description Tailoring:</strong> Optional job description comparison highlights missing technical keywords and experience alignment.</li>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Bidirectional LaTeX Builder:</strong> Conversational assistant interviews you about your projects and generates compile-ready LaTeX with editable confirmation before download.</li>
              </ul>
            </div>
          )}

          {activeSection === "privacy-security" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 0 }}>Data & Privacy</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                PrepQuarters is engineered with strict server-side credential isolation.
              </p>
              <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)" }}>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Zero Client Key Exposure:</strong> Private provider keys never reach client browser network logs or localStorage.</li>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Retention Policy:</strong> Completed interview history is capped to the 2 most recent completed sessions per user in the database, with automatic deletion of older records.</li>
                <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--text-primary)" }}>Read the Full Policy:</strong> View our complete <Link to="/privacy" style={{ color: "var(--accent-primary)" }}>Privacy Policy</Link> for detailed data governance terms.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemDocs;
