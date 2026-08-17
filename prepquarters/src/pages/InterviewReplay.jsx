import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RotateCcw,
  ArrowLeft,
  Award,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Zap,
  Bot,
  User,
  Check,
  TrendingUp,
  Download,
} from "lucide-react";

function InterviewReplay() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleExportReport = () => {
    if (!session) return;
    const lines = [
      `# PrepQuarters Candidate Evaluation Report`,
      `**Role:** ${session.role} | **Domain:** ${session.domain} | **Difficulty:** ${session.difficulty}`,
      `**Company Benchmark:** ${session.companyStyle}`,
      `**Date:** ${new Date(session.createdAt).toLocaleDateString()}`,
      `**Overall Score:** ${session.overallEvaluation?.overallScore || 0}/100 (${session.overallEvaluation?.hireRecommendation || "Evaluation Complete"})`,
      `\n## Executive Summary`,
      session.overallEvaluation?.summaryText || "Interview completed.",
      `\n## Question Transcripts & Evaluations`,
    ];

    session.questions?.forEach((q, idx) => {
      lines.push(`\n### Scenario ${idx + 1}: ${q.topic} (${q.difficulty || session.difficulty})`);
      lines.push(`**Question:** ${q.questionText}`);
      lines.push(`\n**Candidate Answer:**\n${q.candidateAnswer || "No answer recorded."}`);
      if (q.evaluation) {
        lines.push(`\n**Score:** ${q.evaluation.score}/10`);
        lines.push(`**Technical Assessment:** ${q.evaluation.technicalAccuracy}`);
        if (q.evaluation.strengths?.length) {
          lines.push(`**Strengths:** ${q.evaluation.strengths.join(", ")}`);
        }
        if (q.evaluation.improvements?.length) {
          lines.push(`**Growth Areas:** ${q.evaluation.improvements.join(", ")}`);
        }
      }
    });

    if (session.overallEvaluation?.personalizedPreparationPlan?.length) {
      lines.push(`\n## Personalized Preparation Roadmap`);
      session.overallEvaluation.personalizedPreparationPlan.forEach((step) => {
        lines.push(`${step.step}. **${step.title}:** ${step.action}`);
      });
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PrepQuarters_Report_${session.domain.replace(/\s+/g, "_")}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const token = localStorage.getItem("prepquartersToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchReplay = async () => {
      try {
        const res = await fetch(`https://prepquarters-backend.onrender.com/api/interview/${sessionId}/replay`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load interview replay.");

        const data = await res.json();
        if (data.success && data.session) {
          setSession(data.session);
        }
      } catch (err) {
        setError(err.message || "Failed to load replay data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReplay();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <main className="ai-session-page results-page bg-grid-cyber">
        <div className="ai-session-container">
          <div className="dashboard-loading-card">
            <span>Loading interview transcript telemetry...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="ai-session-page results-page bg-grid-cyber">
        <div className="ai-session-container">
          <div className="session-error-banner" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error || "Session replay not found."}</span>
          </div>
          <button
            type="button"
            className="dashboard-secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            Back to Command Center
          </button>
        </div>
      </main>
    );
  }

  const overallScore = session.overallEvaluation?.overallScore;
  const dateStr = new Date(session.createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="ai-session-page replay-page bg-grid-cyber">
      <section className="ai-session-container">
        {/* Replay Header */}
        <div className="session-top-bar">
          <div className="session-info-left">
            <div className="session-breadcrumbs">
              <span>{session.domain}</span>
              <span>/</span>
              <strong>{session.role}</strong>
            </div>

            <div className="session-badge-row">
              <span className={`badge-diff ${session.difficulty.toLowerCase()}`}>
                {session.difficulty} Mode
              </span>
              <span className="badge-company">
                <Building size={12} aria-hidden="true" />
                {session.companyStyle} Benchmark
              </span>
              <span className="luminous-badge cyan">
                <Calendar size={11} aria-hidden="true" />
                <span>{dateStr}</span>
              </span>
            </div>
          </div>

          <div className="session-progress-right">
            {typeof overallScore === "number" && (
              <div className="eval-score-badge">
                <span className="eval-score-num">{overallScore}%</span>
                <span className="eval-score-denom"> Overall</span>
              </div>
            )}
          </div>
        </div>

        {/* Back Link & Export Action */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
          <button
            type="button"
            className="dashboard-secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Back to Command Center</span>
          </button>

          <button
            type="button"
            className="dashboard-secondary-btn"
            onClick={handleExportReport}
            style={{
              borderColor: "rgba(6, 182, 212, 0.4)",
              color: "var(--cyan-bright)",
              background: "rgba(6, 182, 212, 0.08)",
            }}
          >
            <Download size={14} aria-hidden="true" />
            <span>Download Evaluation Report (.md)</span>
          </button>
        </div>

        {/* Question by Question Transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {session.questions?.map((q, idx) => (
            <article
              className="session-question-card"
              key={idx}
              style={{ marginBottom: 0, padding: "28px" }}
            >
              <div className="question-card-meta">
                <span className="question-index-pill">
                  SCENARIO {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="question-topic-pill">{q.topic}</span>
                {q.isFollowUp && (
                  <span className="badge-followup" style={{ marginLeft: "auto" }}>
                    <Zap size={11} aria-hidden="true" />
                    Adaptive Follow-up
                  </span>
                )}
              </div>

              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  lineHeight: "1.5",
                  margin: "0 0 18px",
                }}
              >
                {q.questionText}
              </h3>

              {/* Submitted Answer Terminal */}
              <div
                style={{
                  padding: "18px 20px",
                  background: "var(--bg-surface-1)",
                  borderRadius: "14px",
                  border: "1px solid var(--border-card)",
                  marginBottom: "16px",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--cyan-bright)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  Candidate Response:
                </strong>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    lineHeight: "1.65",
                    color: "var(--text-secondary)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {q.candidateAnswer || "No answer recorded."}
                </p>
              </div>

              {/* Evaluation Card */}
              {q.evaluation && (
                <div
                  style={{
                    padding: "20px",
                    background: "var(--bg-surface-2)",
                    borderRadius: "14px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "var(--cyan-bright)",
                        textTransform: "uppercase",
                      }}
                    >
                      AI Rubric Evaluation
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "16px",
                        fontWeight: "800",
                        color: "var(--cyan-bright)",
                      }}
                    >
                      Score: {q.evaluation.score}/10
                    </span>
                  </div>

                  <p style={{ fontSize: "14px", color: "var(--text-primary)", margin: "0 0 14px" }}>
                    {q.evaluation.technicalAccuracy}
                  </p>

                  {q.evaluation.strengths && q.evaluation.strengths.length > 0 && (
                    <div style={{ marginBottom: "10px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "var(--emerald-core)",
                        }}
                      >
                        Strengths:{" "}
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {q.evaluation.strengths.join(", ")}
                      </span>
                    </div>
                  )}

                  {q.evaluation.improvements && q.evaluation.improvements.length > 0 && (
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#60a5fa" }}>
                        Growth Areas:{" "}
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {q.evaluation.improvements.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default InterviewReplay;
