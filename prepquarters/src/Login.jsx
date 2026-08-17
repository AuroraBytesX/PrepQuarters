import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Activity, Clock } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to dashboard
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

    if (!formData.email || !formData.password) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        setMessage("Please provide your full name.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        setMessage("Password must be at least 8 characters long.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage("Passwords do not match.");
        setMessageType("error");
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin
        ? "https://prepquarters-backend.onrender.com/api/auth/login"
        : "https://prepquarters-backend.onrender.com/api/auth/signup";

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

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed. Please check your credentials.");
      }

      // Save token and user info
      localStorage.setItem("prepquartersToken", data.token);
      localStorage.setItem("prepquartersUser", JSON.stringify(data.user));

      const redirectPath = location.state?.from?.pathname || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server. Please ensure the backend is running.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        {/* Left Side: Product Showcase */}
        <section className="auth-visual">
          <div className="visual-glow glow-one" aria-hidden="true" />
          <div className="visual-glow glow-two" aria-hidden="true" />

          <div className="visual-content">
            <div className="ai-status">
              <span className="status-dot" />
              AI Interviewer Engine Active
            </div>

            <h1>
              Practice with purpose.
              <br />
              <span>Perform with confidence.</span>
            </h1>

            <p className="visual-description">
              Realistic domain-specific interviews, intelligent evaluation,
              and adaptive follow-up questioning tailored to your career path.
            </p>

            {/* Mock Interview Preview Card */}
            <div className="interview-preview">
              <div className="preview-header">
                <div className="avatar-circle">
                  <Sparkles size={16} />
                </div>
                <div>
                  <strong>PrepQuarters AI</strong>
                  <small>Adaptive Mock Room</small>
                </div>
                <span className="live-indicator">LIVE</span>
              </div>

              <div className="chat-area">
                <div className="chat-bubble interviewer">
                  Can you walk me through your technical approach to scaling distributed systems?
                </div>

                <div className="chat-bubble candidate">
                  I prioritize asynchronous message queuing, idempotent workers, and robust rate limiting.
                </div>

                <div className="thinking-bubble">
                  <span />
                  <span />
                  <span />
                  <small>Evaluating response across domain rubrics...</small>
                </div>
              </div>

              <div className="preview-footer">
                <div className="mini-stat">
                  <Activity size={14} aria-hidden="true" />
                  <div>
                    <strong>Domain</strong>
                    <span>Specific</span>
                  </div>
                </div>

                <div className="mini-stat">
                  <ShieldCheck size={14} aria-hidden="true" />
                  <div>
                    <strong>NVIDIA NIM</strong>
                    <span>Inference</span>
                  </div>
                </div>

                <div className="mini-stat">
                  <Clock size={14} aria-hidden="true" />
                  <div>
                    <strong>Real-time</strong>
                    <span>Feedback</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Auth Form */}
        <section className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-heading">
              <span className="auth-label">PREPQUARTERS</span>
              <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
              <p>
                {isLogin
                  ? "Continue your personalized interview preparation."
                  : "Start preparing with structured AI mock sessions."}
              </p>
            </div>

            {/* Login / Sign Up Toggle */}
            <div className="auth-toggle" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={isLogin}
                className={isLogin ? "active" : ""}
                onClick={() => handleModeChange(true)}
              >
                Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isLogin}
                className={!isLogin ? "active" : ""}
                onClick={() => handleModeChange(false)}
              >
                Sign Up
              </button>
            </div>

            {/* Notification message */}
            {message && (
              <div
                className={`auth-message ${
                  messageType === "success" ? "auth-message-success" : "auth-message-error"
                }`}
                role="alert"
              >
                {message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name for Signup */}
              {!isLogin && (
                <div className="auth-field">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="candidate@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isLogin ? "Enter your password" : "Minimum 8 characters"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>

              {/* Confirm Password for Signup */}
              {!isLogin && (
                <div className="auth-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}

              {/* Remember Me for Login */}
              {isLogin && (
                <div className="forgot-row">
                  <label className="remember-me">
                    <input type="checkbox" defaultChecked />
                    <span>Remember this device</span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="auth-submit" disabled={loading}>
                <span>{loading ? "Please wait..." : isLogin ? "Log In to Account" : "Create Candidate Account"}</span>
                {!loading && <ArrowRight size={16} aria-hidden="true" />}
              </button>
            </form>

            {/* Switch Mode Prompt */}
            <p className="auth-switch">
              {isLogin ? "Do not have an account yet?" : "Already have an account?"}
              <button type="button" onClick={() => handleModeChange(!isLogin)}>
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
