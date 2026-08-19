import { useNavigate } from "react-router-dom";
import {
  Cpu,
  Sliders,
  Building,
  TrendingUp,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  Zap,
  ArrowRight,
  Bot,
  Activity,
  Terminal,
  Radio,
  Code,
  FileText,
} from "lucide-react";

function Features() {
  const navigate = useNavigate();

  const capabilities = [
    {
      icon: Cpu,
      title: "NVIDIA AI Intelligence",
      tag: "INFERENCE TELEMETRY",
      description:
        "High-throughput server-side LLM orchestration with multi-turn reasoning, structured evaluation rubrics, and zero client credential leakage.",
      link: "/docs",
      btnLabel: "View System Specs",
    },
    {
      icon: Radio,
      title: "AI Voice Interview Suite",
      tag: "VOICE TELEMETRY",
      description:
        "Full bi-directional voice interviewing with real-time audio spectrum visualization, Groq Whisper transcription, speech clarity scoring, and automated neural voice responses.",
      link: "/practice/ai-interview/setup",
      btnLabel: "Start Voice Interview",
    },
    {
      icon: Code,
      title: "Interactive Coding & Test Runner",
      tag: "ALGORITHMIC SUITE",
      description:
        "Dedicated coding IDE supporting JavaScript, Python, Java, C++, and SQL with live test assertion execution, Big-O runtime analysis, and multi-language starter templates.",
      link: "/practice/ai-interview/setup",
      btnLabel: "Launch Coding Cockpit",
    },
    {
      icon: Bot,
      title: "AI Coding Interviewer",
      tag: "CONVERSATIONAL CODE",
      description:
        "Autonomous technical interviewer probing algorithmic bounds, asking clarifying questions on edge cases, offering structured hints, and grading communication alongside code.",
      link: "/practice/ai-interview/setup",
      btnLabel: "Experience AI Coding",
    },
    {
      icon: Activity,
      title: "Aptitude & Reasoning Round",
      tag: "COGNITIVE EVALUATION",
      description:
        "Quantitative aptitude, logical deduction, and data interpretation rounds with verified answer keys, step-by-step mathematical proofs, and speed metrics.",
      link: "/practice/ai-interview/setup",
      btnLabel: "Take Aptitude Test",
    },
    {
      icon: Terminal,
      title: "System Design & Architecture",
      tag: "DISTRIBUTED SYSTEMS",
      description:
        "High-scale scenarios probing horizontal partitioning, event-driven pipelines, consistency models, latency percentiles, and multi-region database failovers.",
      link: "/practice/ai-interview/setup",
      btnLabel: "Design Scalable Systems",
    },
    {
      icon: ShieldCheck,
      title: "HR & Behavioral Interview",
      tag: "STAR METHODOLOGY",
      description:
        "Calibrated scenarios evaluating Situation, Task, Action, and Result with leadership principles, constructive conflict resolution, and ownership rubrics.",
      link: "/practice/ai-interview/setup",
      btnLabel: "Practice Behavioral",
    },
    {
      icon: Cpu,
      title: "Language-Specific Technical Deep-Dives",
      tag: "RUNTIME INTERNALS",
      description:
        "Language-calibrated rounds covering V8 Event Loop, Python GIL & generators, Java JVM memory allocation & Project Loom, and SQL indexing query plans.",
      link: "/practice/ai-interview/setup",
      btnLabel: "Explore Language Rounds",
    },
    {
      icon: Building,
      title: "Company-Specific Benchmarks",
      tag: "CALIBRATED RUBRICS",
      description:
        "Evaluate answers against publicly calibrated interview patterns for Google, Meta, Amazon, Apple, Netflix, Uber, and Stripe.",
      link: "/practice/question-library",
      btnLabel: "Inspect Company Rubrics",
    },
    {
      icon: TrendingUp,
      title: "Skill-Gap Diagnostics & Roadmap",
      tag: "LONGITUDINAL TELEMETRY",
      description:
        "Multi-session skill gap radars, recurring mistake identification, and downloadable Markdown candidate evaluation reports.",
      link: "/practice/progress",
      btnLabel: "View Diagnostic Radar",
    },
    {
      icon: BookOpen,
      title: "Expanded Question Library",
      tag: "REPOSITORY",
      description:
        "Search and filter hundreds of verified coding problems, aptitude MCQs, system design architectures, and behavioral scenarios.",
      link: "/practice/question-library",
      btnLabel: "Explore Question Library",
    },
    {
      icon: FileText,
      title: "AI Resume Analyzer & ATS Optimizer",
      tag: "ATS INTELLIGENCE",
      description:
        "Explainable ATS readiness audit scanning parsing compatibility, keyword coverage, JD alignment, and prioritized improvement targets.",
      link: "/resume-analyzer",
      btnLabel: "Scan Resume with ATS",
    },
    {
      icon: Bot,
      title: "AI Resume Builder & LaTeX Studio",
      tag: "LATEX STUDIO",
      description:
        "Guided conversational resume creation generating clean, compile-ready .tex LaTeX resumes without fabricating candidate achievements.",
      link: "/resume-analyzer",
      btnLabel: "Build LaTeX Resume",
    },
  ];

  return (
    <main className="prepquarters-home" style={{ paddingBottom: "100px" }}>
      <section className="features-section" style={{ paddingTop: "70px" }}>
        <div className="section-heading">
          <p>ENGINEERING CAPABILITIES</p>
          <h2>Platform Architecture & Telemetry</h2>
          <span>
            Explore the core systems powering PrepQuarters autonomous mock interview environment.
          </span>
        </div>

        <div className="feature-grid">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <article className="feature-card" key={idx}>
                <div className="feature-top-row">
                  <div className="feature-icon">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <span className="luminous-badge cyan">{cap.tag}</span>
                </div>

                <h3>{cap.title}</h3>
                <p>{cap.description}</p>

                <button
                  type="button"
                  className="feature-link"
                  onClick={() => navigate(cap.link)}
                >
                  <span>{cap.btnLabel}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <button
            type="button"
            className="hero-primary-btn"
            onClick={() => navigate("/practice/ai-interview/setup")}
          >
            <span>Launch Mock Interview Cockpit</span>
            <Zap size={16} aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
}

export default Features;
