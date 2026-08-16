import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./InterviewPractice.css";

function InterviewPractice() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("prepquartersToken");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <main className="ai-interview-page">
      <section className="ai-interview-hero">

        <p className="ai-interview-eyebrow">
          AI INTERVIEW PRACTICE
        </p>

        <h1>
          Practice like it's a real interview.
        </h1>

        <p className="ai-interview-description">
          Answer realistic interview questions, build confidence,
          and receive useful feedback to improve your responses.
        </p>

        <button
  type="button"
  className="ai-interview-start-button"
  onClick={() => navigate("/practice/ai-interview/setup")}
>
  Start Interview →
</button>

      </section>

      <section className="ai-interview-info">

        <div className="ai-interview-info-card">
          <span>🤖</span>

          <h2>AI-powered questions</h2>

          <p>
            Practice with questions designed around your
            interview preparation.
          </p>
        </div>

        <div className="ai-interview-info-card">
          <span>🎤</span>

          <h2>Real interview flow</h2>

          <p>
            Work through questions one at a time, just like
            a real interview.
          </p>
        </div>

        <div className="ai-interview-info-card">
          <span>💬</span>

          <h2>Useful feedback</h2>

          <p>
            Review your answers and understand where you
            can improve.
          </p>
        </div>

      </section>

      <button
        type="button"
        className="ai-interview-back-button"
        onClick={() => navigate("/features")}
      >
        ← Back to Practice Tools
      </button>

    </main>
  );
}

export default InterviewPractice;