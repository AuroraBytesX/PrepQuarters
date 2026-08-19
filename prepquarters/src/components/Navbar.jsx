import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HelpCircle,
  User,
  LogOut,
  Menu,
  X,
  Cpu,
  Layers,
  BookOpen,
  FileText,
  ArrowRight,
  MessageSquare,
  Sun,
  Moon,
  Home,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import Logo from "./Logo";
import AiProviderModal from "./AiProviderModal";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [providerInfo, setProviderInfo] = useState({ mode: "my_api", provider: "platform" });
  const menuRef = useRef(null);

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

      const savedProv = localStorage.getItem("prepquarters_ai_provider");
      if (savedProv) {
        try {
          setProviderInfo(JSON.parse(savedProv));
        } catch (e) {}
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  // Automatic provider prompt on initial entry / post-login
  useEffect(() => {
    if (user && location.pathname !== "/login" && location.pathname !== "/signup") {
      const showPromptFlag = sessionStorage.getItem("prepquarters_show_provider_modal") === "true";
      const isConfigured = localStorage.getItem("prepquarters_ai_provider_configured") === "true";

      if (showPromptFlag || !isConfigured) {
        setProviderModalOpen(true);
        sessionStorage.removeItem("prepquarters_show_provider_modal");
      }
    }
  }, [user, location.pathname]);

  // Close mobile menu on navigation change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("prepquartersToken");
    localStorage.removeItem("prepquartersUser");
    sessionStorage.removeItem("prepquarters_byok_key");
    setUser(null);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const scrollToFaq = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/#faq");
      setTimeout(() => {
        const el = document.getElementById("faq");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById("faq");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToContact = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/#contact");
      setTimeout(() => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          minHeight: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          background: "var(--bg-navbar)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-subtle)",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        {/* Brand Identity - Always links directly to Home */}
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Logo size={22} showText={true} />
        </Link>

        {/* Clean Center Links (When Logged In) */}
        {user ? (
          <nav className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link
              to="/dashboard"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname === "/dashboard" ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/practice/ai-interview/setup"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname.includes("/practice/ai-interview") ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Practice
            </Link>
            <Link
              to="/practice/question-library"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname === "/practice/question-library" ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Question Bank
            </Link>
            <Link
              to="/resume-analyzer"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname === "/resume-analyzer" ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Resume
            </Link>
            <Link
              to="/docs"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname === "/docs" ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Docs
            </Link>
          </nav>
        ) : (
          <nav className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link
              to="/"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname === "/" ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Home
            </Link>
            <Link
              to="/practice/ai-interview/setup"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname.includes("/practice") ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Practice
            </Link>
            <Link
              to="/practice/question-library"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname === "/practice/question-library" ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Question Bank
            </Link>
            <Link
              to="/resume-analyzer"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname === "/resume-analyzer" ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Resume Studio
            </Link>
            <button
              type="button"
              onClick={scrollToFaq}
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                transition: "color 0.15s ease",
                cursor: "pointer",
              }}
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={scrollToContact}
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                transition: "color 0.15s ease",
                cursor: "pointer",
              }}
            >
              Contact
            </button>
            <Link
              to="/docs"
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: location.pathname === "/docs" ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
            >
              Docs
            </Link>
          </nav>
        )}

        {/* Right Actions & Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* AI Engine Status Badge */}
          <button
            type="button"
            onClick={() => setProviderModalOpen(true)}
            className="desktop-only"
            title="Configure AI Inference Engine / BYOK"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 10px",
              background: "var(--accent-soft)",
              border: "1px solid var(--accent-border)",
              borderRadius: "8px",
              fontSize: "0.76rem",
              fontWeight: 600,
              color: "var(--accent-primary)",
              cursor: "pointer",
            }}
          >
            <Cpu size={14} />
            <span>AI Provider</span>
          </button>

          {/* Theme Toggle Button (Sun/Moon SVG Icons) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: isDark ? "#facc15" : "#0284c7",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Auth Controls (Desktop) */}
          {user ? (
            <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 12px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "var(--text-primary)",
                }}
              >
                <User size={14} color="var(--accent-primary)" />
                <span>{user.name || user.email?.split("@")[0]}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  cursor: "pointer",
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  padding: "7px 14px",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                style={{
                  padding: "7px 16px",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  background: "var(--accent-primary)",
                  color: "#ffffff",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            type="button"
            className="mobile-only"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: mobileMenuOpen ? "var(--accent-soft)" : "var(--bg-card)",
              border: mobileMenuOpen ? "1px solid var(--accent-border)" : "1px solid var(--border-subtle)",
              color: mobileMenuOpen ? "var(--accent-primary)" : "var(--text-primary)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* =========================================================
          MOBILE FLOATING GLASS COMMAND MENU (SMALL FLOATING DROPDOWN)
          Anchored to top-right under header, width: min(85vw, 320px), height: auto
      ========================================================= */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Dismissal Layer (Transparent, Does NOT Lock Scroll) */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              background: "rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(2px)",
            }}
            aria-hidden="true"
          />

          {/* Floating Glass Dropdown Panel */}
          <nav
            ref={menuRef}
            className="floating-glass-dropdown"
            style={{
              position: "fixed",
              top: "74px",
              right: "16px",
              width: "min(85vw, 320px)",
              maxHeight: "calc(100vh - 90px)",
              overflowY: "auto",
              zIndex: 9999,
              background: "var(--bg-surface-glass)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--border-glass)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-dropdown)",
              padding: "12px 10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {/* User Profile Header (If Authenticated) */}
            {user && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "var(--accent-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-primary)",
                  }}
                >
                  <User size={15} />
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                    {user.name || "Candidate"}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="floating-menu-item"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: location.pathname === "/" ? "var(--accent-soft)" : "transparent",
                color: location.pathname === "/" ? "var(--accent-primary)" : "var(--text-primary)",
                fontWeight: location.pathname === "/" ? 600 : 500,
                fontSize: "0.92rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Home size={16} color={location.pathname === "/" ? "var(--accent-primary)" : "var(--text-secondary)"} />
              <span>Home</span>
            </Link>

            {user && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="floating-menu-item"
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: location.pathname === "/dashboard" ? "var(--accent-soft)" : "transparent",
                  color: location.pathname === "/dashboard" ? "var(--accent-primary)" : "var(--text-primary)",
                  fontWeight: location.pathname === "/dashboard" ? 600 : 500,
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <LayoutDashboard size={16} color={location.pathname === "/dashboard" ? "var(--accent-primary)" : "var(--text-secondary)"} />
                <span>Dashboard</span>
              </Link>
            )}

            <Link
              to="/practice/ai-interview/setup"
              onClick={() => setMobileMenuOpen(false)}
              className="floating-menu-item"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: location.pathname.includes("/practice/ai-interview") ? "var(--accent-soft)" : "transparent",
                color: location.pathname.includes("/practice/ai-interview") ? "var(--accent-primary)" : "var(--text-primary)",
                fontWeight: location.pathname.includes("/practice/ai-interview") ? 600 : 500,
                fontSize: "0.92rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Zap size={16} color={location.pathname.includes("/practice/ai-interview") ? "var(--accent-primary)" : "var(--text-secondary)"} />
              <span>Practice Cockpit</span>
            </Link>

            <Link
              to="/practice/question-library"
              onClick={() => setMobileMenuOpen(false)}
              className="floating-menu-item"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: location.pathname === "/practice/question-library" ? "var(--accent-soft)" : "transparent",
                color: location.pathname === "/practice/question-library" ? "var(--accent-primary)" : "var(--text-primary)",
                fontWeight: location.pathname === "/practice/question-library" ? 600 : 500,
                fontSize: "0.92rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <BookOpen size={16} color={location.pathname === "/practice/question-library" ? "var(--accent-primary)" : "var(--text-secondary)"} />
              <span>Question Bank</span>
            </Link>

            <Link
              to="/resume-analyzer"
              onClick={() => setMobileMenuOpen(false)}
              className="floating-menu-item"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: location.pathname === "/resume-analyzer" ? "var(--accent-soft)" : "transparent",
                color: location.pathname === "/resume-analyzer" ? "var(--accent-primary)" : "var(--text-primary)",
                fontWeight: location.pathname === "/resume-analyzer" ? 600 : 500,
                fontSize: "0.92rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FileText size={16} color={location.pathname === "/resume-analyzer" ? "var(--accent-primary)" : "var(--text-secondary)"} />
              <span>Resume Studio</span>
            </Link>

            {!user && (
              <>
                <button
                  type="button"
                  onClick={scrollToFaq}
                  className="floating-menu-item"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontWeight: 500,
                    fontSize: "0.92rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <HelpCircle size={16} color="var(--text-secondary)" />
                  <span>FAQ & Answers</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToContact}
                  className="floating-menu-item"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontWeight: 500,
                    fontSize: "0.92rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <MessageSquare size={16} color="var(--text-secondary)" />
                  <span>Contact & Support</span>
                </button>
              </>
            )}

            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="floating-menu-item"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: location.pathname === "/docs" ? "var(--accent-soft)" : "transparent",
                color: location.pathname === "/docs" ? "var(--accent-primary)" : "var(--text-primary)",
                fontWeight: location.pathname === "/docs" ? 600 : 500,
                fontSize: "0.92rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <HelpCircle size={16} color={location.pathname === "/docs" ? "var(--accent-primary)" : "var(--text-secondary)"} />
              <span>Documentation</span>
            </Link>

            <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)", margin: "4px 0" }} />

            {/* AI Provider Action in Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setProviderModalOpen(true);
              }}
              className="floating-menu-item"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "transparent",
                color: "var(--text-primary)",
                fontWeight: 500,
                fontSize: "0.92rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Cpu size={16} color="var(--accent-primary)" />
              <span>AI Provider Config</span>
            </button>

            {/* Theme Toggle Button inside Mobile Menu */}
            <button
              type="button"
              onClick={toggleTheme}
              className="floating-menu-item"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "transparent",
                color: "var(--text-primary)",
                fontWeight: 500,
                fontSize: "0.92rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {isDark ? <Sun size={16} color="#facc15" /> : <Moon size={16} color="#0284c7" />}
                <span>Theme: {isDark ? "Dark Mode" : "Light Mode"}</span>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                {isDark ? "Switch to Light" : "Switch to Dark"}
              </span>
            </button>

            {/* Bottom Actions */}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#f87171",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "6px",
                  cursor: "pointer",
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-medium)",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/signup");
                  }}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background: "var(--accent-primary)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </>
      )}

      {/* AI Provider Modal */}
      <AiProviderModal
        isOpen={providerModalOpen}
        onClose={() => setProviderModalOpen(false)}
        onSelectProvider={(prov) => setProviderInfo(prov)}
      />
    </>
  );
}

export default Navbar;