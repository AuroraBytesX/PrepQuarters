import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Mic, MessageSquare, ArrowRight, Sparkles, Building, Sliders } from "lucide-react";
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
        <p className="ai-interview-eyebrow">AI INTERVIEW PRACTICE</p>
        <h1>Practice like it is a real interview.</h1>
        <p className="ai-interview-description">
          Answer realistic interview questions, receive objective evaluations,
          and tackle intelligent follow-up challenges adapted to your responses.
        </p>

        <button
          type="button"
          className="ai-interview-start-button"
          onClick={() => navigate("/practice/ai-interview/setup")}
        >
          <span>Configure & Start Interview</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </section>

      <section className="ai-interview-info">
        <div className="ai-interview-info-card">
          <span className="info-card-icon">
            <Bot size={24} aria-hidden="true" />
          </span>
          <h2>Adaptive Questions</h2>
          <p>
            Experience dynamic questions generated around your chosen domain, difficulty level,
            and company interview style.
          </p>
        </div>

        <div className="ai-interview-info-card">
          <span className="info-card-icon">
            <Mic size={24} aria-hidden="true" />
          </span>
          <h2>One-Question-at-a-Time</h2>
          <p>
            Work through questions sequentially with realistic interviewer pacing, timing indicators,
            and complete focus.
          </p>
        </div>

        <div className="ai-interview-info-card">
          <span className="info-card-icon">
            <MessageSquare size={24} aria-hidden="true" />
          </span>
          <h2>Constructive Evaluation</h2>
          <p>
            Receive detailed feedback on technical correctness, strengths, and missed trade-offs
            before moving forward.
          </p>
        </div>
      </section>

      <div className="practice-quick-links">
        <button
          type="button"
          className="ai-interview-back-button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
        <button
          type="button"
          className="ai-interview-library-button"
          onClick={() => navigate("/practice/question-library")}
        >
          View Question Library
        </button>
      </div>
    </main>
  );
}

export default InterviewPractice;