
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  // If the user is already logged in, go directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem("prepquartersToken");

    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  };

  const handleModeChange = (loginMode) => {
    setIsLogin(loginMode);

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const endpoint = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/signup";

      const body = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            role: "candidate",
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong."
        );
      }

      // Save token
      localStorage.setItem(
        "prepquartersToken",
        data.token
      );

      // Save logged-in user
      localStorage.setItem(
        "prepquartersUser",
        JSON.stringify(data.user)
      );

      // Console log for successful authentication
      if (isLogin) {
        console.log("Logged in user:", data.user);
      } else {
        console.log("Created user:", data.user);
      }

      // Clear signup form after successful account creation
      if (!isLogin) {
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }

      // Both Login and Sign Up go to Dashboard
      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Authentication error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to connect to the server."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">

        {/* =====================================================
            LEFT — INTERACTIVE PREPQUARTERS VISUAL
        ====================================================== */}

        <section className="auth-visual">

          <div className="visual-glow glow-one"></div>
          <div className="visual-glow glow-two"></div>

          <div className="visual-content">

            <div className="ai-status">
              <span className="status-dot"></span>
              AI Interviewer Online
            </div>

            <h1>
              Practice smarter.
              <br />
              <span>Interview stronger.</span>
            </h1>

            <p className="visual-description">
              Build confidence through realistic practice,
              thoughtful feedback, and AI-assisted preparation.
            </p>

            {/* INTERVIEW PREVIEW */}

            <div className="interview-preview">

              <div className="preview-header">

                <div className="avatar-circle">
                  P
                </div>

                <div>
                  <strong>PrepQuarters AI</strong>
                  <small>Mock Interview</small>
                </div>

                <span className="live-indicator">
                  ●
                </span>

              </div>

              <div className="chat-area">

                <div className="chat-bubble interviewer">
                  Tell me about yourself.
                </div>

                <div className="chat-bubble candidate">
                  I'm ready to put my preparation
                  into practice.
                </div>

                <div className="thinking-bubble">

                  <span></span>
                  <span></span>
                  <span></span>

                  <small>
                    Analyzing response...
                  </small>

                </div>

              </div>

              <div className="preview-footer">

                <div className="mini-stat">
                  <strong>Practice</strong>
                  <span>Focused</span>
                </div>

                <div className="mini-stat">
                  <strong>Feedback</strong>
                  <span>AI-assisted</span>
                </div>

                <div className="mini-stat">
                  <strong>Progress</strong>
                  <span>Tracking</span>
                </div>

              </div>

            </div>

          </div>
        </section>


        {/* =====================================================
            RIGHT — LOGIN / SIGNUP
        ====================================================== */}

        <section className="auth-form-section">

          <div className="auth-form-container">

            <div className="auth-heading">

              <span className="auth-label">
                PREPQUARTERS
              </span>

              <h2>
                {isLogin
                  ? "Welcome back."
                  : "Create your account."}
              </h2>

              <p>
                {isLogin
                  ? "Continue your interview preparation."
                  : "Start preparing with clarity and confidence."}
              </p>

            </div>


            {/* LOGIN / SIGNUP TOGGLE */}

            <div className="auth-toggle">

              <button
                type="button"
                className={isLogin ? "active" : ""}
                onClick={() =>
                  handleModeChange(true)
                }
              >
                Login
              </button>

              <button
                type="button"
                className={!isLogin ? "active" : ""}
                onClick={() =>
                  handleModeChange(false)
                }
              >
                Sign Up
              </button>

            </div>


            {/* MESSAGE */}

            {message && (
              <div
                className={`auth-message ${
                  messageType === "success"
                    ? "auth-message-success"
                    : "auth-message-error"
                }`}
              >
                {message}
              </div>
            )}


            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* NAME — SIGN UP ONLY */}

              {!isLogin && (
                <div className="auth-field">

                  <label htmlFor="name">
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>
              )}


              {/* EMAIL */}

              <div className="auth-field">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="auth-field">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* CONFIRM PASSWORD — SIGN UP ONLY */}

              {!isLogin && (
                <div className="auth-field">

                  <label htmlFor="confirmPassword">
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                </div>
              )}


              {/* FORGOT PASSWORD — LOGIN ONLY */}

              {isLogin && (
                <div className="forgot-row">

                  <label className="remember-me">

                    <input type="checkbox" />

                    <span>
                      Remember me
                    </span>

                  </label>

                  <button
                    type="button"
                    className="forgot-button"
                    onClick={() => {
                      setMessage(
                        "Password recovery will be added next."
                      );

                      setMessageType("error");
                    }}
                  >
                    Forgot password?
                  </button>

                </div>
              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Login"
                    : "Create Account"}

                {!loading && (
                  <span>→</span>
                )}
              </button>


              {/* DIVIDER */}

              <div className="auth-divider">
                <span>
                  or continue with
                </span>
              </div>


              {/* GOOGLE */}

              <button
                type="button"
                className="google-button"
                onClick={() => {
                  setMessage(
                    "Google sign-in will be connected later."
                  );

                  setMessageType("error");
                }}
              >
                <span className="google-icon">
                  G
                </span>

                Continue with Google
              </button>


              {/* LOGIN / SIGNUP SWITCH */}

              <p className="auth-switch">

                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}

                <button
                  type="button"
                  onClick={() =>
                    handleModeChange(!isLogin)
                  }
                >
                  {isLogin
                    ? "Sign Up"
                    : "Login"}
                </button>

              </p>

            </form>

          </div>

        </section>

      </div>


      {/* =====================================================
          AUTH MESSAGE STYLES
      ====================================================== */}

      <style>{`

        .auth-message {
          margin-bottom: 18px;
          padding: 11px 13px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.5;
        }

        .auth-message-success {
          background: #eef8ef;
          color: #34723a;
          border: 1px solid #cce7cf;
        }

        .auth-message-error {
          background: #fff1f0;
          color: #a54840;
          border: 1px solid #f0ccc8;
        }

        .auth-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        body.dark-mode .auth-message-success {
          background: #17261b;
          color: #9ed9a5;
          border-color: #315737;
        }

        body.dark-mode .auth-message-error {
          background: #2a1919;
          color: #f0aaa5;
          border-color: #5d3030;
        }

      `}</style>

    </main>
  );
}

export default Login;
