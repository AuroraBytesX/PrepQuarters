import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  FileText,
  Zap,
  Target,
  BarChart2,
  Calendar,
  Layers,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    lastPracticedAt: null,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
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
      // 1. Fetch user sessions
      const sessionsRes = await fetch(`${API_BASE_URL}/api/interview/user/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        if (data.success && Array.isArray(data.sessions)) {
          setRecentSessions(data.sessions);

          const completed = data.sessions.filter((s) => s.status === "completed");
          const scores = completed.map((s) => s.overallEvaluation?.overallScore || 0);
          const avg = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;

          setStats({
            totalInterviews: data.sessions.length,
            completedInterviews: completed.length,
            averageScore: avg,
            lastPracticedAt: data.sessions[0]?.createdAt || null,
          });
        }
      }

      // 2. Fetch skill gap analytics
      const analyticsRes = await fetch(`${API_BASE_URL}/api/interview/user/skill-gap-analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics);
        }
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to sync session history. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-page" style={{ padding: "30px 20px 80px", maxWidth: "1160px", margin: "0 auto" }}>
      {/* 1. Welcome & Primary Quick Actions */}
      <section style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
              <Zap size={14} />
              <span>Candidate Dashboard</span>
            </div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, margin: "0 0 8px", color: "var(--text-primary)" }}>
              Welcome back, {user?.name || "Candidate"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", margin: 0, maxWidth: "680px", lineHeight: 1.5 }}>
              Track your interview performance, review past evaluation feedback, or start a new targeted mock session.
            </p>
          </div>

          {/* Quick Primary Practice Launch Button */}
          <button
            type="button"
            onClick={() => navigate("/practice/ai-interview/setup")}
            style={{
              background: "var(--accent-primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 18px var(--accent-glow)",
            }}
          >
            <span>Start Practice Session</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Quick Hub Navigation Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div
            onClick={() => navigate("/practice/ai-interview/setup")}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              boxShadow: "var(--shadow-glass)",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "var(--accent-soft)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Interview Practice</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>Configure roles, modalities, and start live mock sessions.</p>
          </div>

          <div
            onClick={() => navigate("/practice/question-library")}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              boxShadow: "var(--shadow-glass)",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.12)", color: "var(--accent-cyan)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <BookOpen size={20} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Question Bank</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>Browse 200+ Codeforces and curated technical challenges.</p>
          </div>

          <div
            onClick={() => navigate("/resume-analyzer")}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              boxShadow: "var(--shadow-glass)",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(251, 191, 36, 0.12)", color: "var(--accent-amber)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Resume Tailoring</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>Upload PDF for suggestions or build compile-ready LaTeX.</p>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Strip */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-glass)" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Completed Sessions</span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", margin: "4px 0" }}>{stats.completedInterviews}</div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{stats.totalInterviews} total initiated</span>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-glass)" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Average Score</span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-primary)", margin: "4px 0" }}>{stats.averageScore} / 10</div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Evidence-based rubric rating</span>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-glass)" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Target Role</span>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", margin: "8px 0 4px" }}>{user?.targetRole || "Software Engineer"}</div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user?.targetDomain || "Software Engineering"}</span>
        </div>
      </section>

      {/* 3. Recent Sessions (Latest 2 Completed Retained) */}
      <section style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Recent Practice History
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "2px 0 0" }}>
              Latest completed session replays with full questions and evaluations.
            </p>
          </div>
        </div>

        {recentSessions.length === 0 ? (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "36px", textAlign: "center", boxShadow: "var(--shadow-glass)" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0 0 16px" }}>
              No mock sessions completed yet. Start your first session to calibrate your readiness.
            </p>
            <button
              type="button"
              onClick={() => navigate("/practice/ai-interview/setup")}
              style={{
                background: "var(--accent-primary)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start First Mock Session
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentSessions.slice(0, 5).map((s) => (
              <div
                key={s._id || s.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "18px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  boxShadow: "var(--shadow-glass)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}>
                      {s.interviewType || s.modality || "Technical Interview"}
                    </strong>
                    <span style={{ fontSize: "0.75rem", background: "var(--accent-soft)", color: "var(--accent-primary)", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                      {s.difficulty || "Hard"}
                    </span>
                    <span style={{ fontSize: "0.75rem", background: "var(--bg-secondary)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "6px" }}>
                      {s.role || "Software Engineer"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {new Date(s.createdAt).toLocaleDateString()} &bull; {s.questions?.length || 0} questions evaluated
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {s.overallEvaluation?.overallScore ? (
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Overall Score</span>
                      <strong style={{ fontSize: "1.2rem", color: "var(--accent-primary)" }}>{s.overallEvaluation.overallScore} / 10</strong>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => navigate("/practice/ai-interview/session", {
                      state: {
                        sessionId: s._id || s.id,
                        session: s,
                        initialQuestion: s.questions ? s.questions[0] : null,
                      },
                    })}
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-medium)",
                      color: "var(--text-primary)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    View Replay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Diagnostic Strengths & Weaknesses (If Data Exists) */}
      {analytics && analytics.hasData && (
        <section style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "24px", boxShadow: "var(--shadow-glass)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>
            Diagnostic Skill Observations
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
                Identified Strengths
              </span>
              <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {analytics.strengths?.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            <div>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-amber)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
                Recommended Improvement Areas
              </span>
              <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {analytics.weaknesses?.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default Dashboard;
