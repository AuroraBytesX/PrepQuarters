import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radio,
  Code,
  BookOpen,
  Users,
  Layers,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Minimize2,
  Maximize2,
} from "lucide-react";

export function FeatureSlider() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);

  const features = [
    {
      id: "voice_tech",
      title: "AI Voice + Technical Interview",
      tag: "VOICE & REASONING",
      icon: Radio,
      accentColor: "#10b981",
      badge: "LIVE SPOKEN COCKPIT",
      summary: "Speak your technical answers naturally. Groq Whisper transcribes speech in sub-second latency, probing architecture choices and Big-O bounds.",
      detailedPoints: [
        "Bi-directional conversational flow with real speech-to-text",
        "Evaluates core technical substance rather than conversational fluff",
        "Adaptive multi-turn follow-ups probing trade-offs and edge cases",
        "Zero score strictly enforced for gibberish or incorrect assertions",
      ],
      actionText: "Launch Voice Interview",
      route: "/practice/ai-interview/setup",
    },
    {
      id: "coding_sandbox",
      title: "Isolated Coding & DSA Sandbox",
      tag: "COMPILER RUNNER",
      icon: Code,
      accentColor: "#38bdf8",
      badge: "MULTI-LANGUAGE COMPILER",
      summary: "Write and execute algorithmic solutions in Python, JavaScript, Java, C++, Go, and Rust against deterministic test suites.",
      detailedPoints: [
        "Isolated execution environment with memory & 2500ms time limits",
        "Evaluates test case correctness + LLM Big-O complexity analysis",
        "Multi-language starter templates and custom test inputs",
        "Deterministic test results prevent false LLM score overrides",
      ],
      actionText: "Open Coding Sandbox",
      route: "/practice/ai-interview/setup",
    },
    {
      id: "sourced_bank",
      title: "Sourced Question Bank",
      tag: "CODEFORCES & DATASETS",
      icon: BookOpen,
      accentColor: "#a855f7",
      badge: "80% SOURCED TARGET",
      summary: "Practice with problems sourced directly from official Codeforces APIs, curated DSA banks, and top engineering challenges.",
      detailedPoints: [
        "Live Codeforces API integration with server-side 24h caching",
        "Filter by difficulty, topic, tag, domain, and data structure",
        "Source-aware deduplication prevents duplicate questions",
        "Bookmark and save questions for structured preparation",
      ],
      actionText: "Explore Question Library",
      route: "/practice/question-library",
    },
    {
      id: "hr_star",
      title: "HR & Behavioral Practice",
      tag: "STAR METHODOLOGY",
      icon: Users,
      accentColor: "#f472b6",
      badge: "STRUCTURED GUIDANCE",
      summary: "Master behavioral questions using the Situation, Task, Action, Result framework with leadership and conflict resolution rubrics.",
      detailedPoints: [
        "Realistic workplace scenarios for cross-functional leadership",
        "Actionable feedback highlighting missing measurable outcomes",
        "Practice articulating failures, conflicts, and project impact",
        "Focuses on practical coaching without claiming to be a human recruiter",
      ],
      actionText: "Practice Behavioral",
      route: "/practice/ai-interview/setup",
    },
    {
      id: "system_design",
      title: "System Design Interview",
      tag: "SCALE & TRADEOFFS",
      icon: Layers,
      accentColor: "#34d399",
      badge: "DISTRIBUTED ARCHITECTURE",
      summary: "Architect high-throughput distributed systems. Discuss partitioning, caching hierarchies, and regional failover trade-offs.",
      detailedPoints: [
        "Evaluates data reconciliation, CAP theorem, and latency percentiles",
        "Identifies single points of failure and bottleneck mitigations",
        "Interactive architectural reasoning with live rubric scoring",
        "Calibrated benchmarks for high-scale tech leadership roles",
      ],
      actionText: "Start System Design",
      route: "/practice/ai-interview/setup",
    },
    {
      id: "resume_tools",
      title: "Resume Improvement & Builder",
      tag: "TAILORING & LATEX",
      icon: FileText,
      accentColor: "#fbbf24",
      badge: "5MB PDF PARSING",
      summary: "Upload your PDF resume for explainable tailoring against target job descriptions, or build a compile-ready LaTeX resume.",
      detailedPoints: [
        "Robust PDF stream parsing with 5MB server-enforced upload limit",
        "Identifies missing technical keywords, action verbs, and impact metrics",
        "Bidirectional conversational builder with graph-based updates",
        "Pre-generation confirmation step before compiling final PDF",
      ],
      actionText: "Analyze Resume",
      route: "/resume-analyzer",
    },
    {
      id: "skill_analytics",
      title: "Skill Gap Diagnostic Analytics",
      tag: "LONGITUDINAL TELEMETRY",
      icon: TrendingUp,
      accentColor: "#60a5fa",
      badge: "PERFORMANCE TRACKING",
      summary: "Track your competence across technical disciplines, identify recurring architectural blind spots, and review past session replays.",
      detailedPoints: [
        "Maintains latest 2 completed session replays with full transcripts",
        "Aggregates technical accuracy, communication, and reasoning metrics",
        "Pinpoints specific topics requiring targeted remedial practice",
        "Zero placeholder metrics: driven entirely by actual session evidence",
      ],
      actionText: "View Dashboard Analytics",
      route: "/dashboard",
    },
  ];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Touch swipe support for mobile
  const minSwipeDistance = 40;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrev();
  };

  return (
    <div className="feature-slider-wrapper" style={{ width: "100%", position: "relative" }}>
      {/* Slider Header / Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <Sparkles size={14} />
            <span>Interactive Capabilities</span>
          </div>
          <h2 style={{ fontSize: "1.9rem", fontWeight: 800, margin: "4px 0 0", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Explore Preparation Modalities
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginRight: "6px" }}>
            {activeIndex + 1} / {features.length}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous feature"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-medium)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next feature"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-medium)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Sliding Track Viewport */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "16px",
          padding: "4px 0",
        }}
      >
        {/* Horizontal Card Track */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            transform: `translateX(-${activeIndex * (100 / (window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3))}%)`,
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            const isExpanded = expandedId === feat.id;

            return (
              <div
                key={feat.id}
                style={{
                  flex: "0 0 calc(100% - 10px)",
                  maxWidth: isExpanded ? "100%" : (window.innerWidth < 768 ? "100%" : window.innerWidth < 1024 ? "calc(50% - 10px)" : "calc(33.333% - 14px)"),
                  background: isExpanded ? "var(--bg-surface)" : "var(--bg-card)",
                  border: isExpanded ? `1.5px solid ${feat.accentColor}` : "1px solid var(--border-subtle)",
                  borderRadius: "14px",
                  padding: "24px",
                  boxShadow: isExpanded ? `0 14px 40px rgba(0, 0, 0, 0.4), 0 0 20px ${feat.accentColor}22` : "var(--shadow-glass)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.25s ease",
                  cursor: "default",
                }}
              >
                <div>
                  {/* Top Badge & Icon Strip */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: `${feat.accentColor}18`,
                        border: `1px solid ${feat.accentColor}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: feat.accentColor,
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        color: feat.accentColor,
                        background: `${feat.accentColor}12`,
                        padding: "3px 10px",
                        borderRadius: "12px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {feat.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px" }}>
                    {feat.title}
                  </h3>

                  <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 16px" }}>
                    {feat.summary}
                  </p>

                  {/* Inline Expanded Details */}
                  {isExpanded && (
                    <div
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "10px",
                        padding: "16px",
                        marginBottom: "18px",
                        animation: "fadeIn 0.2s ease-out",
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "0.82rem", color: feat.accentColor, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Key Capabilities & Evaluation
                      </strong>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {feat.detailedPoints.map((point, pIdx) => (
                          <li
                            key={pIdx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "8px",
                              fontSize: "0.86rem",
                              color: "var(--text-primary)",
                              marginBottom: "6px",
                              lineHeight: 1.45,
                            }}
                          >
                            <CheckCircle2 size={14} color={feat.accentColor} style={{ marginTop: "3px", flexShrink: 0 }} />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Actions: Expand Button + Launch Button */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(feat.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    {isExpanded ? (
                      <>
                        <Minimize2 size={14} />
                        <span>Collapse</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 size={14} />
                        <span>Details</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(feat.route)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#ffffff",
                      background: feat.accentColor,
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
        {features.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: idx === activeIndex ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: idx === activeIndex ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.15)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default FeatureSlider;
