import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Layers,
  BookOpen,
  TrendingUp,
  Sliders,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  Zap,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("prepquartersUser");
      const token = localStorage.getItem("prepquartersToken");
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [location.pathname]);

  // Close mobile drawer on route change and toggle body scroll lock
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("prepquartersToken");
    localStorage.removeItem("prepquartersUser");
    setUser(null);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="navbar">
      {/* Brand Identity */}
      <Link to={user ? "/dashboard" : "/"} className="logo">
        <div className="logo-badge">
          <Bot size={18} aria-hidden="true" />
        </div>
        <span>PrepQuarters</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="nav-links" aria-label="Main Navigation">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className={isActive("/dashboard") ? "active-link" : ""}
            >
              Dashboard
            </Link>
            <Link
              to="/practice/ai-interview/setup"
              className={isActive("/practice/ai-interview") ? "active-link" : ""}
            >
              Interview Cockpit
            </Link>
            <Link
              to="/practice/question-library"
              className={isActive("/practice/question-library") ? "active-link" : ""}
            >
              Question Bank
            </Link>
            <Link
              to="/practice/progress"
              className={isActive("/practice/progress") ? "active-link" : ""}
            >
              Skill Analytics
            </Link>
            <Link
              to="/resume-analyzer"
              className={isActive("/resume-analyzer") ? "active-link" : ""}
            >
              Resume Analyzer
            </Link>
          </>
        ) : (
          <>
            <Link to="/" className={isActive("/") ? "active-link" : ""}>
              Platform
            </Link>
            <Link
              to="/features"
              className={isActive("/features") ? "active-link" : ""}
            >
              Capabilities
            </Link>
            <Link
              to="/resume-analyzer"
              className={isActive("/resume-analyzer") ? "active-link" : ""}
            >
              Resume Analyzer
            </Link>
            <Link
              to="/practice/question-library"
              className={isActive("/practice/question-library") ? "active-link" : ""}
            >
              Question Library
            </Link>
            <Link
              to="/learn-more"
              className={isActive("/learn-more") ? "active-link" : ""}
            >
              Architecture
            </Link>
          </>
        )}
      </nav>

      {/* Right Controls */}
      <div className="nav-actions">
        <div className="system-status-pill">
          <span className="pulse-dot" />
          <span>NVIDIA NIM ACTIVE</span>
        </div>

        {user ? (
          <div className="user-nav-group desktop-only">
            <button
              type="button"
              className="user-profile-button"
              onClick={() => navigate("/dashboard")}
              title="Candidate Dashboard"
            >
              <User size={14} aria-hidden="true" />
              <span>{user.name || "Candidate"}</span>
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={14} aria-hidden="true" />
              <span>Exit</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="login-button desktop-only"
            onClick={() => navigate("/login")}
          >
            <span>Enter Cockpit</span>
            <Zap size={14} aria-hidden="true" />
          </button>
        )}

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="hamburger-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer rendered in document.body to avoid backdrop-filter stacking trap */}
      {mobileMenuOpen && typeof document !== "undefined" && createPortal(
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="logo">
                <div className="logo-badge">
                  <Bot size={18} aria-hidden="true" />
                </div>
                <span>PrepQuarters</span>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-nav-links">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`mobile-nav-item ${isActive("/dashboard") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Candidate Dashboard</span>
                  </Link>
                  <Link
                    to="/practice/ai-interview/setup"
                    className={`mobile-nav-item ${isActive("/practice/ai-interview") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Interview Cockpit</span>
                  </Link>
                  <Link
                    to="/practice/question-library"
                    className={`mobile-nav-item ${isActive("/practice/question-library") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Question Bank</span>
                  </Link>
                  <Link
                    to="/practice/progress"
                    className={`mobile-nav-item ${isActive("/practice/progress") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Skill Analytics</span>
                  </Link>
                  <Link
                    to="/resume-analyzer"
                    className={`mobile-nav-item ${isActive("/resume-analyzer") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Resume Analyzer</span>
                  </Link>

                  <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", color: "var(--text-secondary)" }}>
                      <User size={16} />
                      <span style={{ fontSize: "14px", fontWeight: "600" }}>{user.name || "Candidate"}</span>
                    </div>
                    <button
                      type="button"
                      className="logout-button"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={handleLogout}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`mobile-nav-item ${isActive("/") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Platform</span>
                  </Link>
                  <Link
                    to="/features"
                    className={`mobile-nav-item ${isActive("/features") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Capabilities</span>
                  </Link>
                  <Link
                    to="/resume-analyzer"
                    className={`mobile-nav-item ${isActive("/resume-analyzer") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Resume Analyzer</span>
                  </Link>
                  <Link
                    to="/practice/question-library"
                    className={`mobile-nav-item ${isActive("/practice/question-library") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Question Library</span>
                  </Link>
                  <Link
                    to="/learn-more"
                    className={`mobile-nav-item ${isActive("/learn-more") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Architecture</span>
                  </Link>

                  <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border-subtle)" }}>
                    <button
                      type="button"
                      className="login-button"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/login");
                      }}
                    >
                      <span>Enter Cockpit</span>
                      <Zap size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

export default Navbar;