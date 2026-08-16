
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("prepquartersToken");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("prepquartersToken");
    localStorage.removeItem("prepquartersUser");

    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">

      {/* =====================================================
          DASHBOARD NAVBAR
      ===================================================== */}

      <nav className="dashboard-navbar">

        <div className="dashboard-logo">
          PrepQuarters
        </div>

        <div className="dashboard-nav-links">

          <button
            type="button"
            className="dashboard-nav-link active"
            onClick={() => navigate("/dashboard")}
          >
            Overview
          </button>

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={() => navigate("/features")}
          >
            Practice Tools
          </button>

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =====================================================
          DASHBOARD OVERVIEW
      ===================================================== */}

      <main className="dashboard-main">

        {/* WELCOME */}
        <section className="dashboard-welcome">

          <div className="dashboard-welcome-content">

            <p className="dashboard-eyebrow">
              YOUR PREPQUARTERS DASHBOARD
            </p>

            <h1>
              Welcome back.
              <br />
              Ready to practice smarter?
            </h1>

            <p className="dashboard-description">
              Build confidence with personalized interview
              practice, useful feedback, and tools designed
              around your preparation.
            </p>

            

          </div>

        </section>


        {/* =====================================================
            QUICK STATS
        ===================================================== */}

        <section className="dashboard-stats-section">

          <div className="dashboard-section-heading">

            <p>YOUR PROGRESS</p>

            <h2>
              Quick Stats
            </h2>

            <span>
              Keep an eye on your preparation and progress.
            </span>

          </div>


          <div className="dashboard-stats">

            <div className="dashboard-stat-card">

              <span className="dashboard-stat-icon">
                🎤
              </span>

              <span className="dashboard-stat-number">
                0
              </span>

              <span className="dashboard-stat-label">
                Interviews
              </span>

            </div>


            <div className="dashboard-stat-card">

              <span className="dashboard-stat-icon">
                📚
              </span>

              <span className="dashboard-stat-number">
                0
              </span>

              <span className="dashboard-stat-label">
                Questions
              </span>

            </div>


            <div className="dashboard-stat-card">

              <span className="dashboard-stat-icon">
                ⏱️
              </span>

              <span className="dashboard-stat-number">
                0
              </span>

              <span className="dashboard-stat-label">
                Practice Time
              </span>

            </div>


            <div className="dashboard-stat-card">

              <span className="dashboard-stat-icon">
                📈
              </span>

              <span className="dashboard-stat-number">
                0%
              </span>

              <span className="dashboard-stat-label">
                Progress
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            BOTTOM CTA
        ===================================================== */}

        <section className="dashboard-bottom-cta">

          <p>
            READY WHEN YOU ARE
          </p>

          <h2>
            Keep building your interview confidence.
          </h2>

          <button
            type="button"
            onClick={() => navigate("/features")}
          >
            Explore Practice Tools →
          </button>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
