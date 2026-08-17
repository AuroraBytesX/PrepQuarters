import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Award,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Sliders,
  RotateCcw,
  ArrowRight,
  FileText,
  Zap,
  Target,
  BarChart2,
  Calendar,
  Activity,
  Layers,
} from "lucide-react";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    totalQuestionsAnswered: 0,
    totalPracticeTimeMinutes: 0,
    averageScore: 0,
    highestScore: 0,
    skills: [],
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("prepquartersToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const storedUser = localStorage.getItem("prepquartersUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }

    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    setLoading(true);
    setError("");

    try {
      // 1. Fetch aggregate statistics
      const statsRes = await fetch("https://prepquarters-backend.onrender.com/api/interview/stats/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.stats) {
          setStats(statsData.stats);
        }
      }

      // 2. Fetch session history
      const historyRes = await fetch("https://prepquarters-backend.onrender.com/api/interview/history/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (historyData.success && Array.isArray(historyData.sessions)) {
          setRecentSessions(historyData.sessions);
        }
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to sync telemetry data. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const getReadinessTier = (avgScore) => {
    if (avgScore >= 85) return { label: "Exceptional Readiness", color: "var(--emerald-core)" };
    if (avgScore >= 70) return { label: "Proficient", color: "var(--cyan-bright)" };
    if (avgScore >= 50) return { label: "Developing Baseline", color: "var(--amber-core)" };
    return { label: "Initial Assessment", color: "var(--text-muted)" };
  };

  const readiness = getReadinessTier(stats.averageScore || 0);

  return (
    <main className="dashboard-page bg-grid-cyber">
      <div className="dashboard-main">
        {/* 1. Command Center Telemetry Header */}
        <section className="dashboard-welcome">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p className="dashboard-eyebrow">
                <span className="pulse-dot cyan" />
                <span>CANDIDATE COMMAND CENTER // TELEMETRY ACTIVE</span>
              </p>
              <h1>Welcome back, {user?.name || "Candidate"}</h1>
              <p className="dashboard-description">
                Your AI interview telemetry is synchronized. Review performance trends, analyze
                domain competency gaps, or launch a new adaptive mock session.
              </p>
            </div>

            <div
              style={{
                padding: "12px 20px",
                borderRadius: "14px",
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(6, 182, 212, 0.25)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Interview Readiness Index
              </span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: "800", color: readiness.color }}>
                {stats.averageScore || 0}%
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700", color: readiness.color }}>
                {readiness.label}
              </span>
            </div>
          </div>

          <div className="dashboard-cta-row">
            <button
              type="button"
              className="dashboard-primary-btn"
              onClick={() => navigate("/practice/ai-interview/setup")}
            >
              <Zap size={16} aria-hidden="true" />
              <span>Launch Mock Interview Cockpit</span>
            </button>

            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={() => navigate("/practice/question-library")}
            >
              <BookOpen size={16} aria-hidden="true" />
              <span>Browse Question Bank</span>
            </button>

            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={() => navigate("/practice/progress")}
            >
              <Activity size={16} aria-hidden="true" />
              <span>View Diagnostic Radar</span>
            </button>

            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={() => navigate("/docs")}
            >
              <FileText size={16} aria-hidden="true" />
              <span>System Docs</span>
            </button>
          </div>
        </section>

        {error && (
          <div className="session-error-banner" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* 2. Primary Choice: 10 Interview Modality Command Center */}
        <section style={{ marginBottom: "32px" }}>
          <div className="dashboard-subheading" style={{ marginBottom: "16px" }}>
            <div>
              <h3>Select Interview Modality</h3>
              <p>Calibrate autonomous AI questioning with specialized cockpits and rubrics.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            {[
              { name: "AI Voice Interview", badge: "VOICE", desc: "Live conversational voice mock with Web Audio spectrum and Groq STT." },
              { name: "Technical Interview", badge: "CONCEPTS", desc: "Computer science fundamentals, distributed systems, and protocols." },
              { name: "Coding Interview", badge: "ALGORITHMS", desc: "Interactive editor with runtime sandbox and test assertions." },
              { name: "AI Coding Interview", badge: "PROBING", desc: "Conversational interviewer asking design approach and edge cases." },
              { name: "System Design Interview", badge: "SCALE", desc: "Distributed architectures, sharding, and regional failovers." },
              { name: "HR / Behavioral Interview", badge: "STAR", desc: "Leadership scenarios, conflict resolution, and ownership." },
              { name: "Aptitude Interview", badge: "REASONING", desc: "Quantitative aptitude, syllogisms, and speed derivations." },
              { name: "Language-Specific Technical Interview", badge: "RUNTIME", desc: "V8 Event Loop, Python GIL, JVM threads, and SQL plans." },
              { name: "Company-Specific Interview", badge: "BENCHMARK", desc: "Calibrated rubrics for Google, Meta, Amazon, and Stripe." },
              { name: "Mixed Interview", badge: "HYBRID", desc: "Full round blending technical, algorithmic, and situational questions." },
            ].map((m) => (
              <div
                key={m.name}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span className="stat-badge" style={{ margin: 0 }}>{m.badge}</span>
                  </div>
                  <strong style={{ fontSize: "14px", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    {m.name}
                  </strong>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4", margin: "0 0 12px 0" }}>
                    {m.desc}
                  </p>
                </div>
                <button
                  type="button"
                  className="dashboard-primary-btn"
                  style={{ width: "100%", padding: "6px 12px", fontSize: "12px", justifyContent: "center" }}
                  onClick={() =>
                    navigate("/practice/ai-interview/setup", {
                      state: { prefillInterviewType: m.name },
                    })
                  }
                >
                  <span>Configure {m.badge}</span>
                  <ArrowRight size={12} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Telemetry Statistics Counters */}
        <section className="dashboard-stats" aria-label="Key Performance Indicators">
          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="dashboard-stat-icon">
                <Target size={20} aria-hidden="true" />
              </div>
              <span className="stat-badge">SESSIONS</span>
            </div>
            <div className="dashboard-stat-number">{stats.completedInterviews}</div>
            <div className="dashboard-stat-label">
              Completed Mock Sessions ({stats.totalInterviews} initiated)
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="dashboard-stat-icon">
                <BookOpen size={20} aria-hidden="true" />
              </div>
              <span className="stat-badge">QUESTIONS</span>
            </div>
            <div className="dashboard-stat-number">{stats.totalQuestionsAnswered}</div>
            <div className="dashboard-stat-label">Evaluated with Rubric Feedback</div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="dashboard-stat-icon">
                <Award size={20} aria-hidden="true" />
              </div>
              <span className="stat-badge">PEAK SCORE</span>
            </div>
            <div className="dashboard-stat-number">{stats.highestScore}%</div>
            <div className="dashboard-stat-label">
              Highest Evaluation Score (Avg: {stats.averageScore}%)
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="dashboard-stat-icon">
                <Clock size={20} aria-hidden="true" />
              </div>
              <span className="stat-badge">PRACTICE TIME</span>
            </div>
            <div className="dashboard-stat-number">{stats.totalPracticeTimeMinutes}m</div>
            <div className="dashboard-stat-label">Total Time in Live AI Cockpit</div>
          </div>
        </section>

        {/* 3. Main Split Grid: Session History & Competency Matrix */}
        <section className="dashboard-grid-layout">
          {/* Left Column: Recent Mock Sessions Feed */}
          <div className="dashboard-sessions-panel">
            <div className="dashboard-subheading">
              <div>
                <h3>Recent Interview Telemetry</h3>
                <p>Track multi-turn evaluations, scores, and replay transcripts.</p>
              </div>
              {recentSessions.length > 0 && (
                <span className="view-all-link">
                  {recentSessions.length} Total Sessions
                </span>
              )}
            </div>

            {loading ? (
              <div className="dashboard-loading-card">
                <span>Synchronizing session telemetry...</span>
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="dashboard-empty-card">
                <Bot size={36} aria-hidden="true" style={{ color: "var(--cyan-bright)", marginBottom: "12px" }} />
                <h4>No Interview Sessions Recorded</h4>
                <p>Launch your first mock interview cockpit to test your technical reasoning.</p>
                <button
                  type="button"
                  className="dashboard-primary-btn"
                  style={{ marginTop: "16px" }}
                  onClick={() => navigate("/practice/ai-interview/setup")}
                >
                  Start First Mock Session
                </button>
              </div>
            ) : (
              recentSessions.slice(0, 5).map((s) => {
                const score = s.overallEvaluation?.overallScore;
                const dateStr = new Date(s.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <article className="session-card" key={s._id}>
                    <div className="session-card-header">
                      <div className="session-role-info">
                        <h4>{s.role}</h4>
                        <div className="session-tags">
                          <span className="tag-domain">{s.domain}</span>
                          <span className={`tag-difficulty ${s.difficulty.toLowerCase()}`}>
                            {s.difficulty}
                          </span>
                          <span className="tag-company">
                            <Building size={11} aria-hidden="true" />
                            {s.companyStyle}
                          </span>
                        </div>
                      </div>

                      {typeof score === "number" ? (
                        <div className="session-score-pill">
                          <span className="score-val">{score}%</span>
                          <span className="score-label">Score</span>
                        </div>
                      ) : (
                        <span className="luminous-badge amber">In Progress</span>
                      )}
                    </div>

                    <div className="session-card-footer">
                      <div className="session-meta">
                        <Calendar size={13} aria-hidden="true" />
                        <span>{dateStr}</span>
                        <span>-</span>
                        <span>{s.questions?.length || 0} Questions Evaluated</span>
                      </div>

                      {s.status === "in_progress" ? (
                        <button
                          type="button"
                          className="dashboard-primary-btn"
                          style={{ padding: "6px 14px", fontSize: "12px" }}
                          onClick={() =>
                            navigate("/practice/ai-interview", {
                              state: { sessionId: s._id },
                            })
                          }
                        >
                          <Zap size={13} aria-hidden="true" />
                          <span>Resume Cockpit</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="replay-btn"
                          onClick={() => navigate(`/practice/replay/${s._id}`)}
                        >
                          <RotateCcw size={13} aria-hidden="true" />
                          <span>Transcript Replay</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Right Column: Competency Radar & Actionable Remediation */}
          <div className="dashboard-competency-panel">
            <div className="dashboard-subheading">
              <div>
                <h3>Competency Matrix</h3>
                <p>Aggregated technical depth scores across domain categories.</p>
              </div>
            </div>

            <div className="skills-overview-card">
              {stats.skills && stats.skills.length > 0 ? (
                <div className="skills-meter-list">
                  {stats.skills.slice(0, 5).map((skill, idx) => (
                    <div className="skill-meter-item" key={idx}>
                      <div className="skill-meter-header">
                        <span className="skill-name">{skill.skillName}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--cyan-bright)" }}>
                            {skill.averageScore}%
                          </span>
                          <span
                            className={`skill-status-tag ${skill.status
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {skill.status}
                          </span>
                        </div>
                      </div>

                      <div className="skill-progress-bar">
                        <div
                          className="skill-progress-fill"
                          style={{ width: `${Math.min(100, Math.max(10, skill.averageScore))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  Complete mock interviews to generate your domain competency breakdown.
                </div>
              )}

              {/* Actionable Weakness Remediation */}
              <div className="quick-recommendation-box">
                <div className="rec-header">
                  <TrendingUp size={15} aria-hidden="true" />
                  <span>Targeted Practice Recommendation</span>
                </div>
                <p>
                  Elevate your concurrency and trade-off articulation by running a Hard Mode mock
                  session focused on distributed system architectures.
                </p>
                <button
                  type="button"
                  className="rec-action-btn"
                  onClick={() => navigate("/practice/ai-interview/setup")}
                >
                  <span>Launch Hard Mode Practice</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
