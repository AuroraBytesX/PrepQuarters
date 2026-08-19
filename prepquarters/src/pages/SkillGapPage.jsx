import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  Activity,
  Target,
  ShieldCheck,
  Calendar,
  RotateCcw,
  Building,
  Check,
  XCircle,
  HelpCircle,
  Download,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

function SkillGapPage() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("prepquartersToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/interview/stats/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load diagnostic telemetry.");

        const data = await res.json();
        if (data.success && data.stats) {
          setStatsData(data.stats);
          setHasData(Boolean(data.hasData && data.stats.completedInterviews > 0));
        }
      } catch (err) {
        setError(err.message || "Failed to load skill analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <main className="ai-session-page results-page">
        <div className="ai-session-container">
          <div className="dashboard-loading-card">
            <span>Loading diagnostic competency telemetry...</span>
          </div>
        </div>
      </main>
    );
  }

  const skills = statsData?.skills || [];
  const performanceTrends = statsData?.performanceTrends || [];
  const topStrengths = statsData?.topStrengths || [];
  const topWeaknesses = statsData?.topWeaknesses || [];
  const recurringMistakes = statsData?.recurringMistakes || [];
  const recommendation = statsData?.recommendedNextPractice;

  return (
    <main className="ai-session-page results-page">
      <section className="results-container">
        {/* Header */}
        <div className="results-header-banner">
          <p className="results-eyebrow">
            <span className="pulse-dot cyan" />
            <span>DIAGNOSTIC COMPETENCY TELEMETRY // REAL-TIME EVALUATION</span>
          </p>
          <h1>Skill Gap Analysis & Readiness Trajectory</h1>
          <p className="results-subtitle">
            Continuous diagnostic tracking aggregated across your completed mock interview sessions.
          </p>

          <div className="scorecard-top-summary">
            <div className="overall-score-box">
              <span className="score-number">{statsData?.averageScore || 0}%</span>
              <span className="score-label">Readiness Index</span>
            </div>

            <div className="overall-score-box">
              <span className="score-number">{statsData?.completedInterviews || 0}</span>
              <span className="score-label">Sessions Evaluated</span>
            </div>

            <div className="overall-score-box">
              <span className="score-number">{statsData?.totalQuestionsAnswered || 0}</span>
              <span className="score-label">Questions Evaluated</span>
            </div>

            <div className="overall-score-box">
              <span className="score-number">{statsData?.totalPracticeTimeMinutes || 0}m</span>
              <span className="score-label">Practice Time</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="session-error-banner" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State for New Users */}
        {!hasData ? (
          <div className="results-card" style={{ textAlign: "center", padding: "60px 30px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                background: "rgba(6, 182, 212, 0.1)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "var(--cyan-bright)",
              }}
            >
              <BarChart2 size={32} aria-hidden="true" />
            </div>

            <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
              No Competency Telemetry Recorded Yet
            </h3>
            <p
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
                maxWidth: "540px",
                margin: "0 auto 28px",
                lineHeight: "1.6",
              }}
            >
              Complete your first mock interview scenario in the AI Cockpit to activate continuous
              competency tracking, weakness detection, score trends, and targeted practice roadmaps.
            </p>

            <button
              type="button"
              className="results-primary-btn"
              onClick={() => navigate("/practice/ai-interview/setup")}
            >
              <Zap size={16} aria-hidden="true" />
              <span>Launch First Mock Interview</span>
            </button>
          </div>
        ) : (
          <>
            {/* 1. Targeted Practice Recommendation Box */}
            {recommendation && (
              <div
                className="results-card"
                style={{
                  background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
                  borderColor: "rgba(6, 182, 212, 0.35)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <TrendingUp size={18} style={{ color: "var(--cyan-bright)" }} aria-hidden="true" />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "var(--cyan-bright)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Targeted Remediation Recommendation
                  </span>
                </div>

                <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>{recommendation.title}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
                  {recommendation.description}
                </p>

                <button
                  type="button"
                  className="results-primary-btn"
                  onClick={() => {
                    const titleLower = (recommendation.title || "").toLowerCase();
                    let targetModality = "Technical Interview";
                    if (titleLower.includes("system") || titleLower.includes("architect") || titleLower.includes("scalab")) {
                      targetModality = "System Design Interview";
                    } else if (titleLower.includes("algorithm") || titleLower.includes("code") || titleLower.includes("data structure")) {
                      targetModality = "Coding Interview";
                    } else if (titleLower.includes("behavior") || titleLower.includes("lead") || titleLower.includes("star")) {
                      targetModality = "HR / Behavioral Interview";
                    } else if (titleLower.includes("sql") || titleLower.includes("v8") || titleLower.includes("runtime")) {
                      targetModality = "Language-Specific Technical Interview";
                    }

                    navigate("/practice/ai-interview/setup", {
                      state: {
                        prefillInterviewType: targetModality,
                        prefillDomain: recommendation.domain || "Software Engineering",
                        prefillDifficulty: recommendation.difficulty || "Hard",
                        prefillTargetTopic: recommendation.title,
                        remediationMode: true,
                      },
                    });
                  }}
                >
                  <Zap size={15} aria-hidden="true" />
                  <span>Start Targeted Remediation Session</span>
                </button>
              </div>
            )}

            {/* 2. Competencies Matrix */}
            <div className="results-card">
              <h3>Domain Competency Breakdown</h3>
              <p className="summary-body-text">
                Real-time scoring evaluated across technical depth, system architecture, API design,
                and trade-offs.
              </p>

              <div className="skill-gap-list">
                {skills.map((s, idx) => {
                  const sNameLower = s.skillName.toLowerCase();
                  let skillModality = "Technical Interview";
                  if (sNameLower.includes("system") || sNameLower.includes("architect") || sNameLower.includes("scalab")) {
                    skillModality = "System Design Interview";
                  } else if (sNameLower.includes("algorithm") || sNameLower.includes("code") || sNameLower.includes("data structure")) {
                    skillModality = "Coding Interview";
                  } else if (sNameLower.includes("behavior") || sNameLower.includes("lead") || sNameLower.includes("star")) {
                    skillModality = "HR / Behavioral Interview";
                  } else if (sNameLower.includes("sql") || sNameLower.includes("runtime")) {
                    skillModality = "Language-Specific Technical Interview";
                  }

                  return (
                    <div className="skill-gap-card" key={idx}>
                      <div className="skill-gap-card-header">
                        <div>
                          <strong>{s.skillName}</strong>
                          <span className="skill-cat-label">{s.category}</span>
                        </div>
                        <div className="skill-score-group">
                          <span className="skill-score-num">{s.averageScore}%</span>
                          <span
                            className={`status-pill ${s.status.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {s.status}
                          </span>
                        </div>
                      </div>

                      <div className="skill-bar-track">
                        <div
                          className="skill-bar-progress"
                          style={{ width: `${Math.min(100, Math.max(10, s.averageScore))}%` }}
                        />
                      </div>

                      {s.gapDescription && <p className="gap-desc">{s.gapDescription}</p>}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", flexWrap: "wrap", gap: "10px" }}>
                        {s.recommendedAction ? (
                          <div className="recommended-action-box" style={{ margin: 0, flex: 1 }}>
                            <strong>Recommended Practice:</strong> {s.recommendedAction}
                          </div>
                        ) : <div />}

                        <button
                          type="button"
                          className="dashboard-secondary-btn"
                          style={{ padding: "5px 12px", fontSize: "11px", fontWeight: "700" }}
                          onClick={() =>
                            navigate("/practice/ai-interview/setup", {
                              state: {
                                prefillInterviewType: skillModality,
                                prefillDomain: s.category || "Software Engineering",
                                prefillDifficulty: s.averageScore < 60 ? "Medium" : "Hard",
                                prefillTargetTopic: s.skillName,
                                remediationMode: true,
                              },
                            })
                          }
                        >
                          <span>Remediate Skill</span>
                          <ArrowRight size={11} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Strengths, Weaknesses & Recurring Mistakes Breakdown */}
            <div className="evaluation-columns">
              {/* Strengths */}
              <div className="results-card" style={{ marginBottom: 0 }}>
                <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "var(--emerald-core)", marginBottom: "16px" }}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>Demonstrated Strengths</span>
                </h4>

                {topStrengths.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Evaluating strengths across active sessions...</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                    {topStrengths.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Weaknesses & Missed Trade-offs */}
              <div className="results-card" style={{ marginBottom: 0 }}>
                <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#60a5fa", marginBottom: "16px" }}>
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>Priority Improvement Areas</span>
                </h4>

                {topWeaknesses.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Evaluating growth areas across active sessions...</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                    {topWeaknesses.map((im, i) => (
                      <li key={i}>{im}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 4. Recurring Missed Edge Cases */}
            {recurringMistakes.length > 0 && (
              <div className="results-card">
                <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "var(--amber-core)", marginBottom: "12px" }}>
                  <HelpCircle size={18} aria-hidden="true" />
                  <span>Frequently Overlooked Trade-offs & Edge Cases</span>
                </h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Patterns identified across multiple scenarios where critical constraints or failure modes were omitted:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recurringMistakes.map((mis, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "rgba(245, 158, 11, 0.08)",
                        borderLeft: "3px solid var(--amber-core)",
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {mis}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Performance Trajectory / History Table */}
            {performanceTrends.length > 0 && (
              <div className="results-card">
                <h3>Session Performance Trajectory</h3>
                <p className="summary-body-text">
                  Session-by-session score progression, duration, and transcript audit links.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {performanceTrends.map((pt) => {
                    const dStr = new Date(pt.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={pt.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 18px",
                          borderRadius: "12px",
                          background: "var(--bg-surface-2)",
                          border: "1px solid var(--border-subtle)",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "rgba(6, 182, 212, 0.15)",
                              color: "var(--cyan-bright)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "var(--font-mono)",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            #{pt.sessionIndex}
                          </span>

                          <div>
                            <strong style={{ fontSize: "14px", color: "var(--text-primary)", display: "block" }}>
                              {pt.role}
                            </strong>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                              <span>{pt.domain}</span>
                              <span>-</span>
                              <span>{pt.companyStyle}</span>
                              <span>-</span>
                              <span>{dStr}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: "800", color: "var(--cyan-bright)" }}>
                              {pt.overallScore}%
                            </span>
                            <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                              {pt.hireRecommendation}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="replay-btn"
                            onClick={() => navigate(`/practice/replay/${pt.id}`)}
                          >
                            <RotateCcw size={12} aria-hidden="true" />
                            <span>Replay</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Actions */}
        <div className="results-actions-row">
          {hasData && (
            <button
              type="button"
              className="results-primary-btn"
              onClick={() => {
                const lines = [
                  `# PrepQuarters Longitudinal Diagnostic Telemetry Report`,
                  `**Date:** ${new Date().toLocaleDateString()}`,
                  `**Readiness Index:** ${statsData?.averageScore || 0}%`,
                  `**Sessions Completed:** ${statsData?.completedInterviews || 0} (${statsData?.totalInterviews || 0} initiated)`,
                  `**Total Practice Time:** ${statsData?.totalPracticeTimeMinutes || 0} minutes`,
                  `\n## Top Strengths`,
                ];

                (statsData?.topStrengths || []).forEach((st) => lines.push(`- **${st.skillName}** (${st.averageScore}%): Demonstrating strong domain mastery.`));

                if (statsData?.topWeaknesses?.length) {
                  lines.push(`\n## Priority Skill Gaps & Growth Areas`);
                  statsData.topWeaknesses.forEach((w) => lines.push(`- **${w.skillName}** (${w.averageScore}% // ${w.status})`));
                }

                if (statsData?.recurringMistakes?.length) {
                  lines.push(`\n## Recurring Mistake Patterns`);
                  statsData.recurringMistakes.forEach((m) => lines.push(`- ${m}`));
                }

                if (statsData?.skills?.length) {
                  lines.push(`\n## Full Competency Matrix`);
                  statsData.skills.forEach((s) => {
                    lines.push(`- **${s.skillName}** (${s.category}): ${s.averageScore}% // ${s.status}`);
                  });
                }

                const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `PrepQuarters_Diagnostic_Radar_${Date.now()}.md`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={16} aria-hidden="true" />
              <span>Download Diagnostic Report (.md)</span>
            </button>
          )}

          <button
            type="button"
            className="results-primary-btn"
            onClick={() => navigate("/practice/ai-interview/setup")}
          >
            <Zap size={16} aria-hidden="true" />
            <span>Launch Mock Interview</span>
          </button>
          <button
            type="button"
            className="results-secondary-btn"
            onClick={() => navigate("/practice/question-library")}
          >
            <span>Browse Question Bank</span>
          </button>
          <button
            type="button"
            className="results-tertiary-btn"
            onClick={() => navigate("/dashboard")}
          >
            <span>Return to Command Center</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default SkillGapPage;
