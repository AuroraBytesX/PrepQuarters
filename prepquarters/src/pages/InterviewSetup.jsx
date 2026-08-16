
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InterviewSetup.css";

function InterviewSetup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("Software Engineer");
  const [customRole, setCustomRole] = useState("");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Intermediate");

  const roles = [
    "Software Engineer",
    "Data Analyst",
    "Marketing",
    "HR",
    "Product Manager",
    "UI/UX Designer",
  ];

  const interviewTypes = [
    "Behavioral",
    "Technical",
    "HR",
    "Mixed",
  ];

  const difficulties = [
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  const handleStartInterview = () => {
    const selectedRole = customRole.trim() || role;

    navigate("/practice/ai-interview/session", {
      state: {
        role: selectedRole,
        interviewType,
        difficulty,
      },
    });
  };

  return (
    <main className="interview-setup-page">

      <section className="interview-setup-container">

        {/* HERO */}

        <div className="interview-setup-hero">

          <p className="interview-setup-eyebrow">
            AI INTERVIEW PRACTICE
          </p>

          <h1>
            Set up your interview.
          </h1>

          <p className="interview-setup-description">
            Choose your role, interview type, and difficulty.
            We'll take care of the rest.
          </p>

        </div>


        {/* SETUP */}

        <div className="interview-setup-form">


          {/* ROLE */}

          <section className="interview-setup-group">

            <div className="interview-setup-heading">
              <span className="interview-setup-number">
                01
              </span>

              <div>
                <p>ROLE</p>

                <h2>
                  What are you preparing for?
                </h2>
              </div>
            </div>


            <div className="interview-option-grid">

              {roles.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    role === item && !customRole
                      ? "interview-option active"
                      : "interview-option"
                  }
                  onClick={() => {
                    setRole(item);
                    setCustomRole("");
                  }}
                >
                  {item}
                </button>
              ))}

            </div>


            <div className="custom-role">

              <label htmlFor="custom-role">
                Or enter your own role
              </label>

              <input
                id="custom-role"
                type="text"
                value={customRole}
                onChange={(event) => {
                  setCustomRole(event.target.value);
                }}
                placeholder="Example: Cybersecurity Analyst"
              />

            </div>

          </section>


          {/* INTERVIEW TYPE */}

          <section className="interview-setup-group">

            <div className="interview-setup-heading">
              <span className="interview-setup-number">
                02
              </span>

              <div>
                <p>INTERVIEW TYPE</p>

                <h2>
                  What kind of interview?
                </h2>
              </div>
            </div>


            <div className="interview-option-grid interview-type-grid">

              {interviewTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={
                    interviewType === type
                      ? "interview-option active"
                      : "interview-option"
                  }
                  onClick={() => setInterviewType(type)}
                >
                  {type}
                </button>
              ))}

            </div>

          </section>


          {/* DIFFICULTY */}

          <section className="interview-setup-group">

            <div className="interview-setup-heading">
              <span className="interview-setup-number">
                03
              </span>

              <div>
                <p>DIFFICULTY</p>

                <h2>
                  Choose your challenge.
                </h2>
              </div>
            </div>


            <div className="interview-option-grid difficulty-grid">

              {difficulties.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={
                    difficulty === level
                      ? "interview-option active"
                      : "interview-option"
                  }
                  onClick={() => setDifficulty(level)}
                >
                  {level}
                </button>
              ))}

            </div>

          </section>


          {/* SUMMARY */}

          <section className="interview-setup-summary">

            <p className="summary-label">
              YOUR INTERVIEW
            </p>

            <div className="summary-details">

              <span>
                {customRole.trim() || role}
              </span>

              <span>
                {interviewType}
              </span>

              <span>
                {difficulty}
              </span>

            </div>

          </section>


          {/* START */}

          <button
            type="button"
            className="interview-setup-start"
            onClick={handleStartInterview}
          >
            Start Interview →
          </button>


          <button
            type="button"
            className="interview-setup-back"
            onClick={() => navigate("/practice/ai-interview")}
          >
            ← Back to AI Interview Practice
          </button>

        </div>

      </section>

    </main>
  );
}

export default InterviewSetup;

