import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const homeRef = useRef(null);

  /* =====================================================
     HOMEPAGE INTERACTIONS
     - Cursor spotlight across the full homepage
     - Magnetic hero buttons
  ===================================================== */

  useEffect(() => {
    const home = homeRef.current;

    if (!home) return;

    const handlePointerMove = (event) => {
      const rect = home.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      home.style.setProperty("--mouse-x", `${x}px`);
      home.style.setProperty("--mouse-y", `${y}px`);

      const buttons = home.querySelectorAll(
        ".hero-section [data-magnetic]"
      );

      buttons.forEach((button) => {
        const buttonRect = button.getBoundingClientRect();

        const centerX =
          buttonRect.left + buttonRect.width / 2;

        const centerY =
          buttonRect.top + buttonRect.height / 2;

        const distanceX = event.clientX - centerX;
        const distanceY = event.clientY - centerY;

        const distance = Math.sqrt(
          distanceX * distanceX +
            distanceY * distanceY
        );

        if (distance < 110) {
          const strength = 0.12;

          button.style.transform = `
            translate(
              ${distanceX * strength}px,
              ${distanceY * strength}px
            )
          `;
        } else {
          button.style.transform = "";
        }
      });
    };

    const handlePointerLeave = () => {
      home.style.setProperty("--mouse-x", "50%");
      home.style.setProperty("--mouse-y", "10%");

      home
        .querySelectorAll(
          ".hero-section [data-magnetic]"
        )
        .forEach((button) => {
          button.style.transform = "";
        });
    };

    home.addEventListener(
      "pointermove",
      handlePointerMove
    );

    home.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    return () => {
      home.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      home.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );
    };
  }, []);

  /* =====================================================
     FEATURES
  ===================================================== */

  const features = [
    {
      icon: "🤖",
      title: "AI Interview Practice",
      description:
        "Practice realistic interview questions and improve your answers with useful feedback.",
    },
    {
      icon: "🎯",
      title: "Personalized Questions",
      description:
        "Choose the topics and skills you want to focus on during your preparation.",
    },
    {
      icon: "📈",
      title: "Progress Tracking",
      description:
        "Keep track of your practice activity and see where you can improve.",
    },
    {
      icon: "💬",
      title: "Instant Feedback",
      description:
        "Get helpful suggestions to understand how you can improve your responses.",
    },
    {
      icon: "🎚️",
      title: "Difficulty Levels",
      description:
        "Choose a difficulty level that matches your current preparation.",
    },
    {
      icon: "💼",
      title: "Role-Based Practice",
      description:
        "Practice questions designed around the type of interview you're preparing for.",
    },
    {
      icon: "⏱️",
      title: "Timed Practice",
      description:
        "Challenge yourself with timed interview sessions for realistic practice.",
    },
    {
      icon: "📚",
      title: "Question Library",
      description:
        "Explore different questions and keep your preparation fresh.",
    },
  ];

  /* =====================================================
     HOW IT WORKS
  ===================================================== */

  const processSteps = [
    {
      icon: "🎯",
      number: "01",
      title: "Choose your practice",
      description:
        "Select your interview role, topic, and preferred difficulty level.",
    },
    {
      icon: "🎤",
      number: "02",
      title: "Answer questions",
      description:
        "Work through realistic questions and practice explaining your ideas.",
    },
    {
      icon: "📊",
      number: "03",
      title: "Review and improve",
      description:
        "Check your feedback, identify areas to improve, and practice again.",
    },
  ];

  return (
    <div
      className="prepquarters-home"
      ref={homeRef}
    >
      {/* =====================================================
          HOMEPAGE-ONLY STYLES
      ===================================================== */}

      <style>{`
        /* =================================================
           FULL HOMEPAGE CURSOR SPOTLIGHT
        ================================================= */

        .prepquarters-home {
          --mouse-x: 50%;
          --mouse-y: 10%;

          position: relative;
          overflow: hidden;
        }

        .prepquarters-home::before {
          content: "";

          position: absolute;

          left: var(--mouse-x);
          top: var(--mouse-y);

          width: 520px;
          height: 520px;

          transform: translate(-50%, -50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(236, 72, 153, 0.30) 0%,
              rgba(244, 114, 182, 0.16) 24%,
              rgba(249, 168, 212, 0.07) 44%,
              transparent 72%
            );

          filter: blur(8px);

          pointer-events: none;

          transition:
            left 0.08s linear,
            top 0.08s linear;

          z-index: 0;
        }

        .prepquarters-home > * {
          position: relative;
          z-index: 1;
        }

        /* =================================================
           HERO
        ================================================= */

        .hero-section {
          position: relative;
          overflow: hidden;
        }

        .hero-section > * {
          position: relative;
          z-index: 1;
        }

        .hero-eyebrow {
          font-weight: 800 !important;
          letter-spacing: 1.7px;
        }

        /* =================================================
           HERO BUTTONS
        ================================================= */

        .hero-buttons button {
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            background-color 0.22s ease;
        }

        .hero-buttons button:first-child:hover {
          box-shadow:
            0 12px 28px rgba(15, 23, 42, 0.18);
        }

        .hero-buttons button:last-child:hover {
          box-shadow:
            0 12px 28px rgba(15, 23, 42, 0.10);
        }

        /* =================================================
           FEATURE ICONS
        ================================================= */

        .feature-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .feature-icon {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background: #f8fafc;

          font-size: 22px;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background-color 0.25s ease;
        }

        .feature-card:hover .feature-icon {
          transform:
            translateY(-3px)
            rotate(-4deg)
            scale(1.08);

          box-shadow:
            0 8px 20px rgba(15, 23, 42, 0.10);
        }

        .feature-card:hover {
          transform: translateY(-8px);

          box-shadow:
            0 20px 42px rgba(15, 23, 42, 0.10);
        }

        /* =========================================================
   FEATURE EXPLORE BUTTON
========================================================= */

.feature-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  margin-top: 20px;
  padding: 9px 15px;

  border: 1px solid #e5d8ee;
  border-radius: 9px;

  background: #faf7ff;
  color: #4f4058;

  font: inherit;
  font-size: 13px;
  font-weight: 700;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-card:hover .feature-link {
  transform: translateY(-2px);
}

.feature-link:hover {
  background: #f3eafa;
  border-color: #cdb5df;
  color: #3f3745;

  box-shadow:
    0 7px 18px rgba(91, 66, 61, 0.12);
}

.feature-link:active {
  transform: translateY(0);
}

.feature-link:focus-visible {
  outline: 2px solid #a78bfa;
  outline-offset: 3px;
}


/* =========================================================
   DARK MODE
========================================================= */

body.dark-mode .feature-link {
  background: #1f2937;
  border-color: #475569;
  color: #f8fafc;
}

body.dark-mode .feature-link:hover {
  background: #334155;
  border-color: #64748b;
  color: #ffffff;
}

        /* =================================================
           EXPERT CARD
        ================================================= */

        .expert-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 25px 50px 110px;
        }

        .expert-card {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 35px;

          overflow: hidden;

          padding: 38px 42px;

          border: 1px solid #eadfd8;

          border-radius: 24px;

          background:
            linear-gradient(
              135deg,
              #fff8f4,
              #faf7ff
            );

          box-shadow:
            0 15px 40px rgba(91, 66, 61, 0.07);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .expert-card:hover {
          transform: translateY(-5px);

          border-color: #d8c4e8;

          box-shadow:
            0 22px 50px rgba(91, 66, 61, 0.12);
        }

        .expert-content {
          max-width: 760px;
        }

        .expert-label {
          margin: 0 0 9px !important;

          color: #8b6b99 !important;

          font-size: 11px !important;

          font-weight: 800 !important;

          letter-spacing: 1.5px;
        }

        .expert-card h2 {
          margin: 0 0 10px;

          color: #332d36;

          font-size: 29px;

          line-height: 1.2;
        }

        .expert-card p:last-child {
          margin: 0;

          color: #756d78;

          line-height: 1.7;
        }

        .expert-button {
          flex-shrink: 0;

          padding: 13px 22px;

          border: none;

          border-radius: 999px;

          background: #3f3745;

          color: #ffffff;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            background-color 0.22s ease;
        }

        .expert-button:hover {
          transform: translateY(-3px);

          background: #574b60;

          box-shadow:
            0 12px 26px rgba(63, 55, 69, 0.20);
        }

        .expert-card::after {
          content: "";

          position: absolute;

          top: -120%;
          left: -35%;

          width: 24%;
          height: 320%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.44),
              transparent
            );

          transform: rotate(22deg);

          opacity: 0;

          pointer-events: none;
        }

        .expert-card:hover::after {
          animation:
            expertCardShine
            0.9s
            ease
            forwards;
        }

        @keyframes expertCardShine {
          0% {
            left: -35%;
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          100% {
            left: 125%;
            opacity: 0;
          }
        }

        /* =================================================
           HOW IT WORKS
        ================================================= */

        .process-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 38px;
        }

        .process-icon {
          width: 46px;
          height: 46px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background: #faf7ff;

          border: 1px solid #e7dcf0;

          font-size: 22px;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .process-card:hover {
          transform: translateY(-8px);

          box-shadow:
            0 20px 42px rgba(15, 23, 42, 0.10);
        }

        .process-card:hover .process-icon {
          transform:
            translateY(-3px)
            scale(1.08);

          box-shadow:
            0 8px 18px rgba(139, 92, 246, 0.10);
        }

        .process-action {
          display: flex;
          justify-content: center;
          margin-top: 42px;
        }

        .process-action button {
          padding: 13px 24px;

          border: none;

          border-radius: 999px;

          background: #3f3745;

          color: #ffffff;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            background-color 0.22s ease;
        }

        .process-action button:hover {
          transform: translateY(-3px);

          background: #574b60;

          box-shadow:
            0 12px 25px rgba(63, 55, 69, 0.18);
        }

        /* =================================================
           FAQ FIX
        ================================================= */

        .faq-item summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .faq-question {
          transform: none !important;
        }

        .faq-arrow {
          display: inline-block;

          transform: none;

          transition:
            transform 0.25s ease;
        }

        .faq-item[open] summary span {
          transform: none !important;
        }

        .faq-item[open] summary .faq-arrow {
          transform: rotate(180deg) !important;
        }

        /* =================================================
           DARK MODE
        ================================================= */

        body.dark-mode .prepquarters-home::before {
          background:
            radial-gradient(
              circle,
              rgba(236, 72, 153, 0.20) 0%,
              rgba(167, 139, 250, 0.12) 30%,
              transparent 72%
            );
        }

        body.dark-mode .hero-section {
          background: #0f172a;
        }

        body.dark-mode .hero-eyebrow {
          color: #f8fafc !important;
        }

        body.dark-mode .feature-icon {
          background: #1f2937;
        }

        body.dark-mode .feature-card {
          background: #111827;
          border-color: #374151;
        }

        body.dark-mode .feature-card:hover {
          background: #172033;
          border-color: #64748b;
        }

        body.dark-mode .feature-card h3 {
          color: #f8fafc;
        }

        body.dark-mode .feature-card p {
          color: #cbd5e1;
        }

        body.dark-mode .feature-number {
          color: #94a3b8;
        }

        body.dark-mode .feature-link {
          color: #ddd6fe;
        }

        body.dark-mode .expert-card {
          background:
            linear-gradient(
              135deg,
              #111827,
              #172033
            );

          border-color: #374151;
        }

        body.dark-mode .expert-card:hover {
          border-color: #64748b;
        }

        body.dark-mode .expert-card h2 {
          color: #f8fafc;
        }

        body.dark-mode .expert-card p:last-child {
          color: #cbd5e1;
        }

        body.dark-mode .expert-label {
          color: #c4b5fd !important;
        }

        body.dark-mode .expert-button {
          background: #f8fafc;
          color: #111827;
        }

        body.dark-mode .expert-button:hover {
          background: #e2e8f0;
        }

        body.dark-mode .expert-card::after {
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.12),
              transparent
            );
        }

        body.dark-mode .process-card {
          background: #111827;
          border-color: #374151;
        }

        body.dark-mode .process-card:hover {
          background: #172033;
          border-color: #64748b;
        }

        body.dark-mode .process-card h3 {
          color: #f8fafc;
        }

        body.dark-mode .process-card p {
          color: #cbd5e1;
        }

        body.dark-mode .process-icon {
          background: #1f2937;
          border-color: #374151;
        }

        body.dark-mode .process-number {
          color: #94a3b8;
        }

        body.dark-mode .process-action button {
          background: #f8fafc;
          color: #111827;
        }

        body.dark-mode .process-action button:hover {
          background: #e2e8f0;
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 800px) {
          .prepquarters-home::before {
            width: 300px;
            height: 300px;
          }

          .hero-section {
            min-height: auto;
            padding: 65px 20px 80px;
          }

          .hero-section h1 {
            font-size: 44px;
          }

          .hero-eyebrow {
            font-size: 12px !important;
            letter-spacing: 1.2px;
          }

          .hero-description {
            font-size: 16px;
          }

          .hero-description br {
            display: none;
          }

          .hero-buttons {
            width: 100%;
            flex-direction: column;
            align-items: center;
          }

          .hero-buttons button {
            width: min(320px, 100%);
          }

          .expert-section {
            padding: 20px 20px 80px;
          }

          .expert-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 30px 25px;
          }

          .expert-card h2 {
            font-size: 26px;
          }

          .expert-button {
            width: 100%;
          }

          .process-action button {
            width: min(320px, 100%);
          }
        }

        @media (hover: none), (pointer: coarse) {
          .prepquarters-home::before {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .prepquarters-home::before,
          .hero-buttons button,
          .feature-card,
          .feature-icon,
          .feature-link,
          .expert-card,
          .expert-button,
          .process-card,
          .process-icon {
            transition: none !important;
          }

          .expert-card::after {
            animation: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          HOME / HERO
      ===================================================== */}

      <section
        id="home"
        className="hero-section"
      >
        <p className="hero-eyebrow">
          AI-POWERED INTERVIEW PREPARATION
        </p>

        <h1>
          Level Up with
          <br />
          Smart Practice
        </h1>

        <p className="hero-description">
          Practice interviews with instant AI feedback,
          <br />
          real-world questions, and personalized insights.
        </p>

        <div className="hero-buttons">
          <button
            type="button"
            data-magnetic
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>

          <button
            type="button"
            data-magnetic
            onClick={() => navigate("/learn-more")}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="features-section"
      >
        <div className="section-heading">
          <p>WHAT PREPQUARTERS OFFERS</p>

          <h2>
            Everything you need to practice better.
          </h2>

          <p>
            Build confidence with tools designed to make
            your interview preparation smarter and more
            effective.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <div
              className="feature-card"
              key={feature.title}
            >
              <div className="feature-top-row">
                <span className="feature-icon">
                  {feature.icon}
                </span>

                <span className="feature-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <button
  type="button"
  className="feature-link"
  onClick={() => navigate("/login")}
>
  Explore →
</button>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          ONE-TO-ONE EXPERT INTERVIEW
      ===================================================== */}

      <section className="expert-section">
        <div className="expert-card">
          <div className="expert-content">
            <p className="expert-label">
              PERSONALIZED GUIDANCE
            </p>

            <h2>
              Book a one-to-one interview with experts.
            </h2>

            <p>
              Get personalized advice and feedback from
              industry professionals to boost your career
              confidence and skills.
            </p>
          </div>

          <button
            type="button"
            className="expert-button"
            onClick={() => navigate("/login")}
          >
            Book Now →
          </button>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="process-section"
      >
        <div className="section-heading">
          <p>HOW IT WORKS</p>

          <h2>
            A simple path to better preparation.
          </h2>

          <p>
            Pick what you want to practice, complete your
            session, and use your results to improve.
          </p>
        </div>

        <div className="process-grid">
          {processSteps.map((step) => (
            <div
              className="process-card"
              key={step.number}
            >
              <div className="process-top">
                <span className="process-icon">
                  {step.icon}
                </span>

                <span className="process-number">
                  {step.number}
                </span>
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </div>
          ))}
        </div>

        <div className="process-action">
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Start Your Practice Journey →
          </button>
        </div>
      </section>

      {/* =====================================================
          PRICING
      ===================================================== */}

      <section
        id="pricing"
        className="pricing-section"
      >
        <div className="section-heading">
          <p>PRICING</p>

          <h2>
            Start practicing your way.
          </h2>

          <p>
            These are demo plans for now. Real pricing and
            payments can be connected later.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <p className="plan-name">
              FREE
            </p>

            <h3>$0</h3>

            <p className="plan-description">
              A simple way to get started with interview
              preparation.
            </p>

            <ul>
              <li>✓ Basic practice questions</li>
              <li>✓ Limited practice sessions</li>
              <li>✓ Basic progress tracking</li>
            </ul>

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Get Started
            </button>
          </div>

          <div className="pricing-card featured-plan">
            <span className="popular-label">
              MOST POPULAR
            </span>

            <p className="plan-name">
              PRO
            </p>

            <h3>$9.99</h3>

            <p className="plan-description">
              More tools for consistent and focused
              preparation.
            </p>

            <ul>
              <li>✓ Unlimited practice</li>
              <li>✓ AI feedback</li>
              <li>✓ Progress insights</li>
              <li>✓ Advanced difficulty levels</li>
            </ul>

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Choose Pro
            </button>
          </div>

          <div className="pricing-card">
            <p className="plan-name">
              PREMIUM
            </p>

            <h3>$19.99</h3>

            <p className="plan-description">
              A complete preparation experience for
              serious practice.
            </p>

            <ul>
              <li>✓ Everything in Pro</li>
              <li>✓ Advanced practice modes</li>
              <li>✓ Detailed performance insights</li>
              <li>✓ Priority features</li>
            </ul>

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Choose Premium
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section
        id="faq"
        className="faq-section"
      >
        <div className="section-heading">
          <p>FAQ</p>

          <h2>
            Questions you might have.
          </h2>

          <p>
            Here are some common questions about
            PrepQuarters.
          </p>
        </div>

        <div className="faq-list">
          <details className="faq-item">
            <summary>
              <span className="faq-question">
                What is PrepQuarters?
              </span>

              <span className="faq-arrow">
                ⌄
              </span>
            </summary>

            <p>
              PrepQuarters is an interview preparation
              platform designed to help you practice
              questions, improve your responses, and track
              your preparation.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span className="faq-question">
                Who can use PrepQuarters?
              </span>

              <span className="faq-arrow">
                ⌄
              </span>
            </summary>

            <p>
              Anyone preparing for an interview can use
              the platform to practice different types of
              interview questions.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span className="faq-question">
                Can I choose the difficulty level?
              </span>

              <span className="faq-arrow">
                ⌄
              </span>
            </summary>

            <p>
              Yes. The planned practice system will allow
              you to choose different difficulty levels
              depending on your preparation.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span className="faq-question">
                Will the AI give me feedback?
              </span>

              <span className="faq-arrow">
                ⌄
              </span>
            </summary>

            <p>
              Yes. The AI feedback system will be added
              when we build the working interview practice
              functionality.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span className="faq-question">
                Can I track my progress?
              </span>

              <span className="faq-arrow">
                ⌄
              </span>
            </summary>

            <p>
              Progress tracking is planned so you can see
              your practice activity and identify areas
              that need more attention.
            </p>
          </details>
        </div>
      </section>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section
        id="contact"
        className="contact-section"
      >
        <div className="contact-card">
          <div className="contact-info">
            <p className="contact-label">
              CONTACT US
            </p>

            <h2>
              Let's talk about your next step.
            </h2>

            <p>
              Have a question, suggestion, or just want to
              learn more about PrepQuarters? Send us a
              message.
            </p>

            <div className="contact-details">
              <div>
                <strong>Email</strong>

                <span>
                  hello@prepquarters.com
                </span>
              </div>

              <div>
                <strong>Phone</strong>

                <span>
                  +1 (000) 123-4567
                </span>
              </div>
            </div>
          </div>

          <form
            className="contact-form"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <div className="form-group">
              <label htmlFor="name">
                Your Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                rows="5"
                placeholder="Write your message..."
              />
            </div>

            <button
              type="submit"
              className="send-button"
            >
              <span>
                Send Message
              </span>

              <span className="send-arrow">
                →
              </span>
            </button>
          </form>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <h3>
              PrepQuarters
            </h3>

            <p>
              Empowering your career journey with AI-driven
              mock interviews, smart practice, and instant
              feedback.
            </p>

            <div className="social-links">
              <a href="#" aria-label="Facebook">
                f
              </a>

              <a href="#" aria-label="Instagram">
                ◎
              </a>

              <a href="#" aria-label="LinkedIn">
                in
              </a>

              <a href="#" aria-label="X">
                𝕏
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>
              Quick Links
            </h4>

            <a href="/#home">
              Home
            </a>

            <a href="/#features">
              Features
            </a>

            <a href="/#how-it-works">
              How It Works
            </a>

            <a href="/#pricing">
              Pricing
            </a>

            <a href="/#faq">
              FAQ
            </a>
          </div>

          <div className="footer-column">
            <h4>
              Contact
            </h4>

            <a href="mailto:hello@prepquarters.com">
              hello@prepquarters.com
            </a>

            <a href="tel:+10001234567">
              +1 (000) 123-4567
            </a>

            <a href="/#contact">
              Contact Us
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 PrepQuarters. All rights reserved.
          </span>

          <span>
            AI Mock Interview Platform
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Home;