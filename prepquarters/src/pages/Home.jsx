import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Send,
  Terminal,
  Shield,
  Layers,
  Code,
  Mic,
  BrainCircuit,
  Target,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import Logo from "../components/Logo";
import EngineeringCanvasVisual from "../components/EngineeringCanvasVisual";
import EngineeringHeroCanvas from "../components/EngineeringHeroCanvas";
import FeatureSlider from "../components/FeatureSlider";

function Home() {
  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [contactStatus, setContactStatus] = useState(null);
  const [submittingContact, setSubmittingContact] = useState(false);
  const [activeTab, setActiveTab] = useState("distributed");

  const demoScenarios = {
    distributed: {
      title: "Distributed Rate Limiter",
      topic: "System Design & Concurrency",
      question: "Design a globally distributed rate limiter handling 150,000 req/sec across 4 regions with sub-5ms latency and network partition fail-over.",
      candidateResponse: "I use a hybrid token bucket model. Edge nodes consume local in-memory tokens and batch asynchronous delta synchronizations to regional Redis clusters via CRDTs. During cross-region partitions, nodes fail open on critical checkout paths to preserve user uptime.",
      score: "9.2 / 10",
      analysis: "Correct trade-off decision to fail open on checkout paths. Strong utilization of CRDTs to prevent cross-region synchronization bottlenecks.",
      timeComplexity: "O(1) Local Memory Lookup",
      spaceComplexity: "O(U) Total Active Users",
    },
    algorithmic: {
      title: "Optimized Dynamic Sliding Window",
      topic: "Data Structures & Algorithms",
      question: "Given a string s, find the length of the longest substring without repeating characters in O(n) time and O(min(m,n)) space.",
      candidateResponse: "I maintain a sliding window with two pointers (left, right) and a hash map storing the last seen index of each character. When right encounters a duplicate, left jumps to last_seen[char] + 1, ensuring every element is visited at most twice.",
      score: "9.5 / 10",
      analysis: "Optimal two-pointer sliding window with single-pass index jumping. Accurately verified against boundary test cases with zero duplicate traversals.",
      timeComplexity: "O(n) Linear Time",
      spaceComplexity: "O(k) Distinct Characters",
    },
    behavioral: {
      title: "High-Stakes Architecture Dispute",
      topic: "HR & Technical Leadership (STAR)",
      question: "Describe a situation where you had a fundamental architectural disagreement with a Principal Engineer before a major production launch.",
      candidateResponse: "Situation: A proposed monolithic cache risked memory cascades. Task: I needed to demonstrate the vulnerability without delaying rollout. Action: I built an isolated load benchmark simulating 3x traffic and presented quantifiable memory exhaustion curves. Result: The team adopted a partitioned cache, preventing an estimated 4-hour outage during Black Friday.",
      score: "9.0 / 10",
      analysis: "Excellent adherence to STAR methodology. Quantified impact with load benchmarks rather than subjective opinions. Clear cross-functional leadership.",
      timeComplexity: "Quantified Impact: 3x Load",
      spaceComplexity: "Risk Mitigation: Zero Outage",
    },
  };

  const currentScenario = demoScenarios[activeTab] || demoScenarios.distributed;

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput || !messageInput) return;

    setSubmittingContact(true);
    setContactStatus(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/system/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: nameInput.trim(),
          email: emailInput.trim(),
          message: messageInput.trim(),
        }),
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (res.ok && data.success) {
        setContactStatus({ success: true, message: data.message || "Message sent successfully to support." });
        setNameInput("");
        setEmailInput("");
        setMessageInput("");
      } else {
        setContactStatus({ success: false, message: data.message || "Unable to send message. Please reach us at tapashidhar2004@gmail.com." });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setContactStatus({ success: false, message: "Request timed out. Please contact support directly at tapashidhar2004@gmail.com." });
      } else {
        setContactStatus({ success: false, message: "Could not reach email service. Direct contact: tapashidhar2004@gmail.com." });
      }
    } finally {
      setSubmittingContact(false);
    }
  };

  return (
    <main className="prepquarters-home-container" style={{ position: "relative", width: "100%", overflowX: "hidden" }}>
      {/* Background Animated Developer Workstation Canvas */}
      <EngineeringHeroCanvas />

      {/* 1. HERO SECTION */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "70px 20px 40px",
          maxWidth: "1160px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Eyebrow Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "20px",
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent-primary)",
            fontSize: "0.82rem",
            fontWeight: 600,
            marginBottom: "20px",
            letterSpacing: "0.02em",
          }}
        >
          <Sparkles size={15} />
          <span>AI TECHNICAL INTERVIEW PLATFORM</span>
        </div>

        {/* Main Human-Readable Tagline */}
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            margin: "0 auto 20px",
            maxWidth: "900px",
            color: "var(--text-primary)",
          }}
        >
          AI interview practice that gives
          <br />
          <span style={{ color: "var(--accent-primary)", background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            real feedback on your technical reasoning.
          </span>
        </h1>

        {/* Concise Product Description */}
        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: "700px",
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          Practice technical, coding, and system design interviews with multi-turn AI reasoning,
          isolated compilers, and actionable diagnostic feedback.
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap", marginBottom: "50px" }}>
          <button
            type="button"
            onClick={() => navigate("/practice/ai-interview/setup")}
            style={{
              background: "var(--accent-primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "14px 28px",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 20px var(--accent-glow)",
              transition: "transform 0.15s ease",
            }}
          >
            <span>Start Free Practice</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/practice/question-library")}
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-medium)",
              borderRadius: "10px",
              padding: "14px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <BookOpen size={18} />
            <span>Browse Question Bank</span>
          </button>
        </div>

        {/* Animated Engineering Workspace Canvas Visual */}
        <EngineeringCanvasVisual />
      </section>

      {/* 2. MAIN PREPQUARTERS PRODUCT FOCAL CARD (LIVE EVALUATION PROOF) */}
      <section style={{ maxWidth: "1080px", margin: "60px auto", padding: "0 20px" }}>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "18px",
            padding: "32px",
            boxShadow: "var(--shadow-glass)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <Terminal size={14} />
                <span>Live Evaluation Intelligence</span>
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", margin: "4px 0 0" }}>
                Evidence-Based Scoring Breakdown
              </h2>
            </div>

            {/* Interactive Tab Selectors */}
            <div style={{ display: "flex", gap: "8px", background: "var(--bg-secondary)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              {[
                { id: "distributed", label: "System Architecture" },
                { id: "algorithmic", label: "DSA & Coding" },
                { id: "behavioral", label: "Behavioral STAR" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeTab === tab.id ? "var(--accent-primary)" : "transparent",
                    color: activeTab === tab.id ? "#ffffff" : "var(--text-secondary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }} className="scenario-grid">
            {/* Left: Question and Candidate Answer */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--bg-secondary)", padding: "18px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Scenario &bull; {currentScenario.topic}
                </span>
                <p style={{ margin: "8px 0 0", color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.5 }}>
                  "{currentScenario.question}"
                </p>
              </div>

              <div style={{ background: "var(--bg-secondary)", padding: "18px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-purple)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Candidate Response
                </span>
                <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.55 }}>
                  "{currentScenario.candidateResponse}"
                </p>
              </div>
            </div>

            {/* Right: AI Scorecard & Diagnostic Feedback */}
            <div style={{ background: "var(--accent-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--accent-border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Diagnostic Evaluation
                  </span>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-primary)", background: "var(--bg-card)", padding: "4px 12px", borderRadius: "8px", border: "1px solid var(--accent-border)" }}>
                    {currentScenario.score}
                  </span>
                </div>

                <p style={{ fontSize: "0.92rem", color: "var(--text-primary)", lineHeight: 1.55, margin: "0 0 16px" }}>
                  {currentScenario.analysis}
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.78rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", padding: "4px 10px", borderRadius: "6px", color: "var(--text-secondary)" }}>
                    Time: <strong style={{ color: "var(--text-primary)" }}>{currentScenario.timeComplexity}</strong>
                  </span>
                  <span style={{ fontSize: "0.78rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", padding: "4px 10px", borderRadius: "6px", color: "var(--text-secondary)" }}>
                    Space: <strong style={{ color: "var(--text-primary)" }}>{currentScenario.spaceComplexity}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.8rem", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                <Shield size={14} color="var(--accent-primary)" />
                <span>Zero score enforced for fundamentally incorrect or gibberish answers.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HORIZONTALLY SLIDING FEATURE CARDS */}
      <section style={{ maxWidth: "1120px", margin: "60px auto", padding: "0 20px" }}>
        <FeatureSlider />
      </section>

      {/* 4. HOW PREPQUARTERS WORKS (3-STEP VALUE FLOW) */}
      <section style={{ maxWidth: "1080px", margin: "60px auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <p style={{ color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em", margin: "0 0 6px", textTransform: "uppercase" }}>
            Preparation Workflow
          </p>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            How PrepQuarters Works
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            {
              step: "01",
              title: "Choose Domain & Modality",
              desc: "Select your target role (Software Engineer, DevOps, ML), challenge difficulty (Easy, Medium, Hard), and preferred practice mode (Voice, Coding, System Design).",
              icon: Target,
            },
            {
              step: "02",
              title: "Multi-Turn Interactive Practice",
              desc: "Answer by voice with real Whisper transcription or write code in the isolated compiler sandbox. The AI probes edge cases and architectural assumptions with adaptive follow-ups.",
              icon: Mic,
            },
            {
              step: "03",
              title: "Actionable Diagnostic Scorecard",
              desc: "Receive evidence-based quantitative scoring on technical correctness, Big-O efficiency, and communication clarity with detailed model solutions.",
              icon: BrainCircuit,
            },
          ].map((item, idx) => {
            const StepIcon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "14px",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "var(--shadow-glass)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                      {item.step}
                    </span>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                      <StepIcon size={18} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PRODUCT FAQ SECTION */}
      <section id="faq" style={{ maxWidth: "860px", margin: "70px auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <p style={{ color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em", margin: "0 0 6px", textTransform: "uppercase" }}>
            Frequently Asked Questions
          </p>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Everything You Need to Know
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            {
              q: "What is PrepQuarters?",
              a: "PrepQuarters is a technical interview preparation platform combining multi-turn AI reasoning, isolated code execution, and structured evaluation rubrics for engineers and developers.",
            },
            {
              q: "How does PrepQuarters work?",
              a: "You select an interview modality, domain, and difficulty. The platform presents structured problems, transcribes spoken answers live, runs code against test cases, probes edge cases, and produces quantitative scorecards.",
            },
            {
              q: "Who is PrepQuarters for?",
              a: "PrepQuarters is built for software engineers, backend developers, frontend architects, data scientists, and engineering managers preparing for rigorous technical rounds.",
            },
            {
              q: "How can I use the interview practice features?",
              a: "Navigate to Practice, select your target role, difficulty, and modality (Voice + Technical, Coding Sandbox, HR Behavioral, or System Design), and begin your session.",
            },
            {
              q: "What types of interviews are supported?",
              a: "PrepQuarters supports AI Voice + Technical, HR / Behavioral (STAR method), Aptitude & Reasoning, Language-Specific Technical (Python, Java, C++, Go, Rust, SQL), Company-Specific benchmarks, and System Design.",
            },
            {
              q: "How does the coding interview work?",
              a: "You write solutions in your selected language and execute them in an isolated sandbox against multi-input test cases. The AI evaluates your algorithmic approach, code quality, and Big-O efficiency.",
            },
            {
              q: "Where does the question-bank data come from?",
              a: "The question library integrates sourced challenges from official Codeforces problem sets combined with curated computer science and algorithmic challenges.",
            },
            {
              q: "How does the resume feature work?",
              a: "Upload a PDF resume up to 5MB with an optional Job Description to identify missing technical keywords and formatting improvements, or use the interactive assistant to build compile-ready LaTeX resumes.",
            },
            {
              q: "What is the difference between My API and Bring Your Own API?",
              a: "My API uses built-in platform intelligence with a rate limit of 40 requests per minute. Bring Your Own API (BYOK) allows you to connect your own OpenAI, Anthropic, or xAI key without platform quotas.",
            },
            {
              q: "How is my data handled?",
              a: "Transcripts and session scorecards are stored in your private account. Private inference credentials never reach browser logs or client-side storage.",
            },
          ].map((item, idx) => (
            <details
              key={idx}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "16px 20px",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              <summary
                style={{
                  fontWeight: 600,
                  fontSize: "0.98rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  listStyle: "none",
                }}
              >
                <span>{item.q}</span>
                <ChevronDown size={18} color="var(--text-secondary)" />
              </summary>
              <p style={{ margin: "14px 0 0", color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 6. CONTACT / QUERIES SECTION */}
      <section id="contact" style={{ maxWidth: "780px", margin: "60px auto", padding: "0 20px" }}>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            padding: "36px",
            boxShadow: "var(--shadow-glass)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <p style={{ color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em", margin: "0 0 6px", textTransform: "uppercase" }}>
              Contact / Queries
            </p>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text-primary)" }}>
              Contact / Queries
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", margin: "0 0 8px" }}>
              Direct Email:{" "}
              <a
                href="mailto:tapashidhar2004@gmail.com"
                style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}
              >
                tapashidhar2004@gmail.com
              </a>
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              Send an inquiry directly or submit a message below.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {contactStatus && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: contactStatus.success ? "var(--accent-soft)" : "rgba(239, 68, 68, 0.12)",
                  color: contactStatus.success ? "var(--accent-primary)" : "#f87171",
                  border: contactStatus.success ? "1px solid var(--accent-border)" : "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                {contactStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{contactStatus.message}</span>
              </div>
            )}

            <div>
              <label htmlFor="home-contact-name" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                Your Name
              </label>
              <input
                id="home-contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Candidate Name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label htmlFor="home-contact-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                Your Email Address
              </label>
              <input
                id="home-contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label htmlFor="home-contact-msg" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                Message
              </label>
              <textarea
                id="home-contact-msg"
                name="message"
                rows={4}
                placeholder="Write your question or feedback..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submittingContact}
              style={{
                background: "var(--accent-primary)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: submittingContact ? "not-allowed" : "pointer",
                opacity: submittingContact ? 0.7 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>{submittingContact ? "Sending..." : "Send Message"}</span>
              <Send size={15} />
            </button>
          </form>
        </div>
      </section>

      {/* 7. MINIMAL SITE FOOTER */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "40px 20px",
          marginTop: "60px",
          background: "var(--bg-navbar)",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <Logo size={20} showText={true} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "6px 0 0" }}>
              AI technical interview preparation platform.
            </p>
          </div>

          <div style={{ display: "flex", gap: "24px", fontSize: "0.88rem" }}>
            <a
              href="https://github.com/AuroraBytesX/PrepQuarters"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              GitHub Repository
            </a>
            <Link to="/docs" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
              Documentation
            </Link>
            <Link to="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;