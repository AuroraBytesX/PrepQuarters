import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Activity, Clock, Eye, EyeOff, KeyRound, X, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "./config/api";
import { account, ID } from "./config/appwrite";

function Login({ initialMode = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("prepquartersToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const [isLogin, setIsLogin] = useState(() => {
    if (location.pathname === "/signup") return false;
    return initialMode;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState("request"); // 'request' | 'reset'
  const [resetTokenInput, setResetTokenInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotMessageType, setForgotMessageType] = useState("");

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

    const cleanEmail = formData.email.trim().toLowerCase();

    if (!cleanEmail || !formData.password) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
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
        ? `${API_BASE_URL}/api/auth/login`
        : `${API_BASE_URL}/api/auth/signup`;

      const body = isLogin
        ? {
            email: cleanEmail,
            password: formData.password,
          }
        : {
            name: formData.name.trim(),
            email: cleanEmail,
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

      // Sync with Appwrite client SDK if available in background
      try {
        if (!isLogin) {
          await account.create(ID.unique(), cleanEmail, formData.password, formData.name.trim());
        }
      } catch (appwriteErr) {
        // Appwrite client sync notice
      }

      // Save token and user info safely (NEVER save password)
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    setForgotMessageType("");

    if (forgotStep === "request") {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (res.ok && data.success) {
          setForgotMessageType("success");
          setForgotMessage(data.message || "A 6-digit verification code has been sent to your email. Please check your inbox.");
          setResetTokenInput(""); // Require user to type the code from their email
          setForgotStep("reset");
        } else {
          setForgotMessageType("error");
          setForgotMessage(data.message || "Could not find an account with this email.");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setForgotMessageType("error");
        setForgotMessage(err.name === "AbortError" ? "Verification request timed out. Please check your network." : "Failed to reach password recovery service.");
      } finally {
        setForgotLoading(false);
      }
    } else {
      // Reset step with 6-digit verification code
      if (!resetTokenInput.trim() || resetTokenInput.trim().length < 6) {
        setForgotMessageType("error");
        setForgotMessage("Please enter the complete 6-digit verification code sent to your email.");
        setForgotLoading(false);
        return;
      }
      if (newPassword.length < 8) {
        setForgotMessageType("error");
        setForgotMessage("New password must be at least 8 characters long.");
        setForgotLoading(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setForgotMessageType("error");
        setForgotMessage("Passwords do not match.");
        setForgotLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            email: forgotEmail.trim().toLowerCase(),
            code: resetTokenInput.trim(),
            newPassword,
            confirmNewPassword,
          }),
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (res.ok && data.success) {
          setForgotMessageType("success");
          setForgotMessage("Password reset successfully. You can now log in with your new password.");
          setTimeout(() => {
            setForgotModalOpen(false);
            setForgotStep("request");
            setResetTokenInput("");
            setNewPassword("");
            setConfirmNewPassword("");
            setIsLogin(true);
          }, 1800);
        } else {
          setForgotMessageType("error");
          setForgotMessage(data.message || "Invalid verification code or password criteria not met.");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setForgotMessageType("error");
        setForgotMessage(err.name === "AbortError" ? "Password reset request timed out." : "Failed to connect to password reset service.");
      } finally {
        setForgotLoading(false);
      }
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
            {/* Header */}
            <div className="auth-header">
              <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
              <p>
                {isLogin
                  ? "Enter your credentials to access your candidate dashboard."
                  : "Join PrepQuarters and start practicing for senior engineering roles."}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={isLogin}
                className={`auth-tab ${isLogin ? "active" : ""}`}
                onClick={() => handleModeChange(true)}
              >
                Log In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isLogin}
                className={`auth-tab ${!isLogin ? "active" : ""}`}
                onClick={() => handleModeChange(false)}
              >
                Sign Up
              </button>
            </div>

            {/* Alert Notification */}
            {message && (
              <div
                className={`auth-message ${messageType}`}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                  background: messageType === "success" ? "var(--accent-soft)" : "rgba(239, 68, 68, 0.12)",
                  color: messageType === "success" ? "var(--accent-primary)" : "#b91c1c",
                  border: messageType === "success" ? "1px solid var(--accent-border)" : "1px solid rgba(239, 68, 68, 0.35)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {messageType === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{message}</span>
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

              {/* Password with Visibility Toggle */}
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "Enter your password" : "Minimum 8 characters"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    style={{ width: "100%", paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password for Signup with Visibility Toggle */}
              {!isLogin && (
                <div className="auth-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      style={{ width: "100%", paddingRight: "44px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute",
                        right: "12px",
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px",
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password Row */}
              {isLogin && (
                <div className="forgot-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 16px" }}>
                  <label htmlFor="remember-device" className="remember-me" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                    <input id="remember-device" name="rememberDevice" type="checkbox" defaultChecked />
                    <span>Remember device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(true);
                      setForgotEmail(formData.email);
                      setForgotMessage("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-primary)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </button>
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

      {/* =========================================================
          FORGOT PASSWORD MODAL
      ========================================================= */}
      {forgotModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-glass)",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "var(--shadow-dropdown)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              aria-label="Close dialog"
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                <KeyRound size={20} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {forgotStep === "request" ? "Recover Password" : "Reset Password"}
              </h3>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "18px", lineHeight: 1.5 }}>
              {forgotStep === "request"
                ? "Enter your account email. We will send a secure 6-digit verification code to your inbox."
                : `Enter the 6-digit verification code sent to ${forgotEmail} to authorize your new password.`}
            </p>

            {forgotMessage && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                  background: forgotMessageType === "success" ? "var(--accent-soft)" : "rgba(239, 68, 68, 0.12)",
                  color: forgotMessageType === "success" ? "var(--accent-primary)" : "#b91c1c",
                  border: forgotMessageType === "success" ? "1px solid var(--accent-border)" : "1px solid rgba(239, 68, 68, 0.35)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {forgotMessageType === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{forgotMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {forgotStep === "request" ? (
                <div>
                  <label htmlFor="forgot-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Account Email
                  </label>
                  <input
                    id="forgot-email"
                    name="forgotEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="candidate@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-medium)",
                      color: "var(--text-primary)",
                      fontSize: "0.92rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="reset-otp-code" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                      6-Digit Verification Code
                    </label>
                    <input
                      id="reset-otp-code"
                      name="resetOtpCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="123456"
                      value={resetTokenInput}
                      onChange={(e) => setResetTokenInput(e.target.value.replace(/\D/g, ""))}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-medium)",
                        color: "var(--accent-primary)",
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        letterSpacing: "6px",
                        textAlign: "center",
                        boxSizing: "border-box",
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="reset-new-password" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                      New Password
                    </label>
                    <input
                      id="reset-new-password"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-medium)",
                        color: "var(--text-primary)",
                        fontSize: "0.92rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="reset-confirm-password" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                      Confirm New Password
                    </label>
                    <input
                      id="reset-confirm-password"
                      name="confirmNewPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-medium)",
                        color: "var(--text-primary)",
                        fontSize: "0.92rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                style={{
                  padding: "12px 18px",
                  borderRadius: "8px",
                  background: "var(--accent-primary)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  border: "none",
                  cursor: forgotLoading ? "not-allowed" : "pointer",
                  marginTop: "6px",
                }}
              >
                {forgotLoading ? "Processing..." : forgotStep === "request" ? "Send 6-Digit Code" : "Verify Code & Reset Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Login;
