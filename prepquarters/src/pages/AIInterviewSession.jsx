import { useNavigate } from "react-router-dom";
import "./AIInterviewSession.css";

function AIInterviewSession() {
  const navigate = useNavigate();

  return (
    <main className="ai-session-page">

      <section className="ai-session-container">

        <p className="ai-session-eyebrow">
          AI INTERVIEW PRACTICE
        </p>

        <h1>
          Let's begin your interview.
        </h1>

        <p className="ai-session-description">
          Answer each question as naturally as you would
          in a real interview.
        </p>

        <div className="ai-session-card">

          <span className="ai-session-question-number">
            QUESTION 01
          </span>

          <h2>
            Tell me about yourself.
          </h2>

          <textarea
            className="ai-session-answer"
            placeholder="Type your answer here..."
            rows="7"
          />

          <button
            type="button"
            className="ai-session-submit"
          >
            Submit Answer →
          </button>

        </div>

        <button
          type="button"
          className="ai-session-back"
          onClick={() => navigate("/practice/ai-interview")}
        >
          ← Back to AI Interview Practice
        </button>

      </section>

    </main>
  );
}

export default AIInterviewSession;
