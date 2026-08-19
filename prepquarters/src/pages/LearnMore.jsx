import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  TrendingUp,
  Bot,
  Database,
  Lock,
  Layers,
  Zap,
} from "lucide-react";

function LearnMore() {
  const navigate = useNavigate();

  return (
    <main className="prepquarters-home" style={{ paddingBottom: "100px" }}>
      <section className="features-section" style={{ paddingTop: "70px", maxWidth: "1080px" }}>
        {/* Header */}
        <div className="section-heading">
          <p>SYSTEM ARCHITECTURE</p>
          <h2>Engineering & Security Design</h2>
          <span>
            How PrepQuarters combines server-side NVIDIA NIM reasoning with deterministic telemetry
            and absolute user data privacy.
          </span>
        </div>

        {/* Architecture Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Pillar 1 */}
          <article className="feature-card" style={{ padding: "36px" }}>
            <div className="feature-top-row">
              <div className="feature-icon">
                <Cpu size={24} aria-hidden="true" />
              </div>
              <span className="luminous-badge cyan">01 // INFERENCE PIPELINE</span>
            </div>
            <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>
              Server-Side NVIDIA NIM Orchestration
            </h3>
            <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--text-secondary)" }}>
              All LLM inference executes strictly server-side through high-throughput NVIDIA NIM API
              endpoints powered by state-of-the-art models like Llama 3.3 70B. Prompt templates
              strictly enforce structured JSON responses with explicit rubrics, ensuring objective
              evaluation without conversational hallucination or unnecessary praise.
            </p>
          </article>

          {/* Pillar 2 */}
          <article className="feature-card" style={{ padding: "36px" }}>
            <div className="feature-top-row">
              <div className="feature-icon">
                <Lock size={24} aria-hidden="true" />
              </div>
              <span className="luminous-badge emerald">02 // PRIVACY & ZERO DATA LEAKAGE</span>
            </div>
            <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>
              Strict Data Isolation & Secret Safeguards
            </h3>
            <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--text-secondary)" }}>
              Client browsers never receive API keys or sensitive credentials. All database access
              enforces strict candidate user isolation (users can only access their own sessions).
              Endpoints are fortified with in-memory rate limiting, input sanitization, and security
              headers.
            </p>
          </article>

          {/* Pillar 3 */}
          <article className="feature-card" style={{ padding: "36px" }}>
            <div className="feature-top-row">
              <div className="feature-icon">
                <Database size={24} aria-hidden="true" />
              </div>
              <span className="luminous-badge violet">03 // DETERMINISTIC TELEMETRY</span>
            </div>
            <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>
              Deterministic Hybrid Engine
            </h3>
            <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--text-secondary)" }}>
              Deterministic metrics (timers, question counts, aggregate averages, score bounds) are
              calculated reliably in application code rather than outsourced to LLMs. This hybrid
              architecture guarantees consistent session state, zero latency drift, and 100%
              reproducible scorecards.
            </p>
          </article>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <button
            type="button"
            className="hero-primary-btn"
            onClick={() => navigate("/login")}
          >
            <span>Enter Candidate Cockpit</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
}

export default LearnMore;