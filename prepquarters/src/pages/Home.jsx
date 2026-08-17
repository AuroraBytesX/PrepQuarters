import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Layers,
  Award,
  BookOpen,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap,
  Building,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Clock,
  Activity,
  Sliders,
  ChevronDown,
  FileText,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("swe");
  const [emailInput, setEmailInput] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const domainDemos = {
    swe: {
      domain: "Software Engineering",
      role: "Distributed Systems Architect",
      company: "Google Benchmark",
      question:
        "Design a globally replicated rate limiter capable of handling 150,000 requests per second across 4 continents. How do you address clock skew, network partitions, and counter reconciliation?",
      candidateAnswer:
        "I employ a hybrid sliding window counter. Edge nodes use local in-memory token buckets with batched asynchronous syncing to regional Redis clusters via CRDTs (Conflict-free Replicated Data Types). During partitions, nodes fail open to maintain critical checkout flows.",
      evaluation: {
        score: "9.2/10",
        verdict: "High Technical Rigor",
        feedback:
          "Strong mitigation of cross-region network latency using CRDTs. Correct trade-off decision to fail open during partition events.",
      },
    },
    ds: {
      domain: "Data Science & ML",
      role: "Machine Learning Engineer",
      company: "Netflix Benchmark",
      question:
        "How do you handle embedding staleness and real-time covariate shift in a large-scale video recommendation engine serving 50M daily active users?",
      candidateAnswer:
        "I implement a two-tower neural retrieval architecture with streaming updates via Apache Flink. Lightweight online ranking models consume real-time session clicks to adjust candidate weights before final beam search reranking.",
      evaluation: {
        score: "9.0/10",
        verdict: "Exceptional Architecture",
        feedback:
          "Clear separation of heavy offline vector indexing from lightweight streaming feature scoring. Good awareness of inference budget.",
      },
    },
    pm: {
      domain: "Product Management",
      role: "Principal Product Manager",
      company: "Stripe Benchmark",
      question:
        "Stripe is launching cross-border merchant payouts in emerging markets with unstable local currency conversion. What is your 0-to-1 launch strategy and risk mitigation framework?",
      candidateAnswer:
        "I break this into three pillars: treasury hedging via multi-currency liquidity pools, developer UX via guaranteed 15-minute FX lock-in windows, and merchant risk tiers with phased rollout limits.",
      evaluation: {
        score: "8.8/10",
        verdict: "High Strategic Clarity",
        feedback:
          "Excellent mitigation of FX volatility risk combined with developer-first API guarantees.",
      },
    },
  };

  const currentDemo = domainDemos[activeTab] || domainDemos.swe;

  return (
    <main className="prepquarters-home bg-grid-cyber">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-eyebrow">
          <span className="pulse-dot cyan" />
          <span>AUTONOMOUS AI INTERVIEW COCKPIT</span>
        </div>

        <h1>
          Master Technical Interviews
          <br />
          With Adaptive AI Intelligence
        </h1>

        <p className="hero-description">
          PrepQuarters is an autonomous interview cockpit powered by server-side NVIDIA NIM
          reasoning models. Experience sequential multi-turn questioning, intelligent follow-up
          probes, and rigorous domain skill gap telemetry without generic chatbot flattery.
        </p>

        <div className="hero-buttons">
          <button
            type="button"
            className="hero-primary-btn"
            onClick={() => navigate("/login")}
          >
            <span>Launch Mock Cockpit</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="hero-secondary-btn"
            onClick={() => navigate("/practice/question-library")}
          >
            <BookOpen size={16} aria-hidden="true" />
            <span>Explore Question Bank</span>
          </button>
        </div>

        {/* Live Interactive Terminal Showcase */}
        <div className="hero-terminal-mockup">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
            </div>

            <div className="terminal-title">
              LIVE COCKPIT SESSION // {currentDemo.domain.toUpperCase()}
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {["swe", "ds", "pm"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: activeTab === t ? "rgba(6, 182, 212, 0.25)" : "transparent",
                    color: activeTab === t ? "var(--cyan-bright)" : "var(--text-muted)",
                    border: activeTab === t ? "1px solid rgba(6, 182, 212, 0.4)" : "none",
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="terminal-body">
            {/* Question */}
            <div className="terminal-prompt-row">
              <span className="terminal-tag">AI INTERVIEWER</span>
              <div className="terminal-text">
                <strong>{currentDemo.question}</strong>
              </div>
            </div>

            {/* Answer */}
            <div className="terminal-prompt-row">
              <span className="terminal-tag candidate">CANDIDATE</span>
              <div className="terminal-text" style={{ color: "var(--text-secondary)" }}>
                {currentDemo.candidateAnswer}
              </div>
            </div>

            {/* Live Evaluation Telemetry */}
            <div
              className="terminal-prompt-row"
              style={{
                background: "rgba(6, 182, 212, 0.05)",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(6, 182, 212, 0.2)",
              }}
            >
              <span className="terminal-tag evaluation">SCORE {currentDemo.evaluation.score}</span>
              <div className="terminal-text" style={{ fontSize: "13px" }}>
                <span style={{ color: "var(--emerald-core)", fontWeight: "700" }}>
                  {currentDemo.evaluation.verdict}:
                </span>{" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  {currentDemo.evaluation.feedback}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES / FEATURES */}
      <section className="features-section">
        <div className="section-heading">
          <p>ENGINEERED FOR RIGOR</p>
          <h2>Advanced AI Evaluation Engine</h2>
          <span>
            Unlike generic chat interfaces, PrepQuarters enforces realistic interview constraints,
            deep reasoning rubrics, and diagnostic skill gap telemetry.
          </span>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-top-row">
              <div className="feature-icon">
                <Cpu size={22} aria-hidden="true" />
              </div>
              <span className="feature-number">01</span>
            </div>
            <h3>NVIDIA NIM Intelligence</h3>
            <p>
              Server-side execution on high-parameter reasoning models delivers authentic technical
              evaluation and probes edge cases with zero client credential exposure.
            </p>
            <Link to="/features" className="feature-link">
              <span>View System Specs</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-top-row">
              <div className="feature-icon">
                <Sliders size={22} aria-hidden="true" />
              </div>
              <span className="feature-number">02</span>
            </div>
            <h3>Sequential Adaptive Pacing</h3>
            <p>
              Questions are presented one at a time. The engine evaluates your response and
              dynamically decides whether to ask an intelligent follow-up probe or advance.
            </p>
            <Link to="/practice/ai-interview/setup" className="feature-link">
              <span>Configure Cockpit</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-top-row">
              <div className="feature-icon">
                <Building size={22} aria-hidden="true" />
              </div>
              <span className="feature-number">03</span>
            </div>
            <h3>Top 5 Company Hard Mode</h3>
            <p>
              Simulate realistic industry interview patterns for leaders like Google, Amazon, Meta,
              Netflix, Apple, Stripe, and Airbnb across 6 core technical domains.
            </p>
            <Link to="/practice/question-library" className="feature-link">
              <span>Inspect Company Rubrics</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-top-row">
              <div className="feature-icon">
                <TrendingUp size={22} aria-hidden="true" />
              </div>
              <span className="feature-number">04</span>
            </div>
            <h3>Skill Gap Telemetry</h3>
            <p>
              Receive multidimensional competency scoring, hiring recommendation probabilities,
              overlooked trade-offs, and custom 3-step preparation roadmaps.
            </p>
            <Link to="/practice/progress" className="feature-link">
              <span>View Diagnostic Model</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-top-row">
              <div className="feature-icon">
                <FileText size={22} aria-hidden="true" style={{ color: "var(--cyan-bright)" }} />
              </div>
              <span className="feature-number">05</span>
            </div>
            <h3>AI Resume Analyzer</h3>
            <p>
              Scan your resume against real ATS heuristics, benchmark alignment with target Job Descriptions,
              detect weak bullet points, and download structured improvement audits.
            </p>
            <Link to="/resume-analyzer" className="feature-link">
              <span>Launch Resume Audit</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      {/* 3. HARD MODE COMPANY BENCHMARK BANNER */}
      <section className="expert-section">
        <div className="expert-card">
          <div className="expert-content">
            <p className="expert-label">DIFFICULTY TELEMETRY</p>
            <h2>Simulate Top Tier Engineering Interviews</h2>
            <p>
              In Hard Mode, PrepQuarters shifts from foundational terminology into complex system
              trade-offs, concurrency hazards, distributed failure recovery, and architectural
              scaling under realistic interview pressure.
            </p>
          </div>

          <button
            type="button"
            className="expert-button"
            onClick={() => navigate("/practice/ai-interview/setup")}
          >
            <span>Launch Hard Mode Practice</span>
            <Zap size={16} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* 4. PRICING TIERS */}
      <section className="pricing-section">
        <div className="section-heading">
          <p>TRANSPARENT ACCESS</p>
          <h2>Candidate Preparation Tiers</h2>
          <span>Everything you need to practice, diagnose gaps, and perform with confidence.</span>
        </div>

        <div className="pricing-grid">
          <article className="pricing-card">
            <span className="plan-name">Community Practice</span>
            <h3>Free</h3>
            <p className="plan-description">
              Essential technical preparation with full domain mock room access and instant scoring.
            </p>
            <ul>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Unlimited Easy & Hard mock interviews</span>
              </li>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>6 Technical domain tracks</span>
              </li>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Full Question Library access</span>
              </li>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Session transcript replays</span>
              </li>
            </ul>
            <button type="button" onClick={() => navigate("/login")}>
              Get Started Free
            </button>
          </article>

          <article className="pricing-card featured-plan">
            <span className="popular-label">RECOMMENDED</span>
            <span className="plan-name">Candidate Pro</span>
            <h3>$19</h3>
            <p className="plan-description">
              Continuous diagnostic tracking, custom company benchmarks, and deep skill gap telemetry.
            </p>
            <ul>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Everything in Free tier</span>
              </li>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Top 5 Company Hard Mode simulations</span>
              </li>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Persistent Skill Gap Analytics radar</span>
              </li>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Personalized 3-step study roadmaps</span>
              </li>
            </ul>
            <button type="button" onClick={() => navigate("/login")}>
              Start Pro Preparation
            </button>
          </article>

          <article className="pricing-card">
            <span className="plan-name">Enterprise / Team</span>
            <h3>$49</h3>
            <p className="plan-description">
              Custom evaluation rubrics, team skill analytics, and structured candidate screening.
            </p>
            <ul>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Everything in Pro tier</span>
              </li>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Custom domain rubrics & questions</span>
              </li>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Team performance telemetry</span>
              </li>
              <li>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Dedicated API concurrency quota</span>
              </li>
            </ul>
            <button type="button" onClick={() => navigate("/login")}>
              Contact Sales
            </button>
          </article>
        </div>
      </section>

      {/* 5. INTERACTIVE FAQ */}
      <section className="faq-section">
        <div className="section-heading">
          <p>KNOWLEDGE BASE</p>
          <h2>Frequently Asked Questions</h2>
          <span>Clear answers on platform architecture, NVIDIA NIM models, and evaluation criteria.</span>
        </div>

        <div className="faq-list">
          <details className="faq-item">
            <summary>
              <span>What makes PrepQuarters different from a generic chatbot?</span>
              <ChevronDown size={16} className="faq-arrow" aria-hidden="true" />
            </summary>
            <p>
              PrepQuarters uses a structured, server-side multi-turn interview orchestrator. It asks
              one question at a time, strictly evaluates technical accuracy against structured
              domain rubrics, probes incomplete answers with adaptive follow-ups, and produces
              quantitative scorecards instead of conversational flattery.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>How does Top 5 Company Hard Mode work?</span>
              <ChevronDown size={16} className="faq-arrow" aria-hidden="true" />
            </summary>
            <p>
              In Hard Mode, the system adapts the interviewer persona and question complexity to
              reflect publicly known interview patterns for top leaders (e.g. Google, Amazon, Meta,
              Netflix, Stripe, and Apple) focusing on distributed scalability, edge case handling,
              and trade-off articulation.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>Are my interview sessions and transcripts saved?</span>
              <ChevronDown size={16} className="faq-arrow" aria-hidden="true" />
            </summary>
            <p>
              Yes. All completed sessions are persisted to your Candidate Dashboard with full
              transcripts, question-by-question candidate answers, scores, feedback points, and
              aggregated competency tracking.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>How are API credentials handled securely?</span>
              <ChevronDown size={16} className="faq-arrow" aria-hidden="true" />
            </summary>
            <p>
              All AI inference calls are executed server-side. Private API keys and environment
              variables are never transmitted to or accessible by client browsers.
            </p>
          </details>
        </div>
      </section>

      {/* 6. CONTACT & FEEDBACK */}
      <section className="contact-section">
        <div className="contact-card">
          <div className="contact-info">
            <p className="contact-label">CANDIDATE SUPPORT</p>
            <h2>Connect with Engineering</h2>
            <p>
              Have questions about custom rubric integration or technical domain coverage? Our
              support team is here to assist.
            </p>

            <div className="contact-details">
              <div>
                <strong>Support Channel</strong>
                <span>support@prepquarters.ai</span>
              </div>
              <div>
                <strong>Inference Telemetry</strong>
                <span>NVIDIA NIM // 99.98% Model Uptime</span>
              </div>
            </div>
          </div>

          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              setContactMessage("Inquiry received. A representative will contact you shortly.");
              setEmailInput("");
            }}
          >
            {contactMessage && (
              <div className="auth-message auth-message-success">{contactMessage}</div>
            )}
            <div className="form-group">
              <label htmlFor="contact-email">Email Address</label>
              <input
                id="contact-email"
                type="email"
                placeholder="candidate@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-inquiry">Message</label>
              <textarea
                id="contact-inquiry"
                rows={4}
                placeholder="Inquire about enterprise teams, custom rubrics, or API access..."
                required
              />
            </div>
            <button type="submit" className="send-button">
              <span>Send Message</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      {/* 7. SITE FOOTER */}
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="logo" style={{ marginBottom: "12px" }}>
              <div className="logo-badge">
                <Bot size={18} aria-hidden="true" />
              </div>
              <span>PrepQuarters</span>
            </div>
            <p>
              The autonomous AI interview cockpit engineered for technical mastery, deep
              diagnostic feedback, and confident performance.
            </p>
          </div>

          <div className="footer-column">
            <h4>Practice Hub</h4>
            <Link to="/practice/ai-interview/setup">Interview Setup</Link>
            <Link to="/practice/question-library">Question Bank</Link>
            <Link to="/practice/progress">Skill Gap Analytics</Link>
            <Link to="/dashboard">Candidate Dashboard</Link>
          </div>

          <div className="footer-column">
            <h4>Platform</h4>
            <Link to="/features">Capabilities</Link>
            <Link to="/learn-more">Architecture</Link>
            <Link to="/login">Sign In / Register</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>(C) 2026 PrepQuarters. Autonomous AI Preparation Platform.</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>NVIDIA NIM Powered</span>
            <span>Zero Data Leakage</span>
            <span>ISO 27001 Standard Compliant</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;