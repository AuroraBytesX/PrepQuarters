
import { useNavigate } from "react-router-dom";

function Features() {
  const navigate = useNavigate();

  const practiceTools = [
    {
      icon: "🤖",
      title: "AI Interview Practice",
      description:
        "Practice realistic interview questions and improve your answers with useful feedback.",
      path: "/practice/ai-interview",
    },
    {
      icon: "🎯",
      title: "Personalized Questions",
      description:
        "Choose the topics and skills you want to focus on during your preparation.",
      path: "/practice/personalized",
    },
    {
      icon: "📈",
      title: "Progress Tracking",
      description:
        "Keep track of your practice activity and see where you can improve.",
      path: "/practice/progress",
    },
    {
      icon: "💬",
      title: "Instant Feedback",
      description:
        "Get helpful suggestions to understand how you can improve your responses.",
      path: "/practice/feedback",
    },
    {
      icon: "🎚️",
      title: "Difficulty Levels",
      description:
        "Choose a difficulty level that matches your current preparation.",
      path: "/practice/difficulty",
    },
    {
      icon: "💼",
      title: "Role-Based Practice",
      description:
        "Practice questions designed around the type of interview you're preparing for.",
      path: "/practice/role-based",
    },
    {
      icon: "⏱️",
      title: "Timed Practice",
      description:
        "Challenge yourself with timed interview sessions for realistic practice.",
      path: "/practice/timed",
    },
    {
      icon: "📚",
      title: "Question Library",
      description:
        "Explore different questions and keep your preparation fresh.",
      path: "/practice/question-library",
    },
  ];

  return (
    <main className="practice-tools-page">

      <section className="practice-tools-hero">
        <p className="practice-tools-eyebrow">
          PREPQUARTERS PRACTICE TOOLS
        </p>

        <h1>Practice smarter.</h1>

        <p className="practice-tools-description">
          Explore tools designed to help you prepare for interviews,
          improve your skills, and build confidence through practice.
        </p>
      </section>

      <section className="practice-tools-section">

        <div className="practice-tools-heading">
          <p>WHAT YOU CAN PRACTICE</p>

          <h2>
            Everything you need to prepare better.
          </h2>

          <span>
            Choose a tool below to start your preparation.
          </span>
        </div>

        <div className="practice-tools-grid">

          {practiceTools.map((tool, index) => (
            <button
              type="button"
              className="practice-tool-card"
              key={tool.title}
              onClick={() => navigate(tool.path)}
            >
              <div className="practice-tool-top">

                <span className="practice-tool-icon">
                  {tool.icon}
                </span>

                <span className="practice-tool-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

              </div>

              <h3>{tool.title}</h3>

              <p>{tool.description}</p>

              <span className="practice-tool-explore">
                Explore →
              </span>
            </button>
          ))}

        </div>

      </section>

    </main>
  );
}

export default Features;

