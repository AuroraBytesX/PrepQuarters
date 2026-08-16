import { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { darkMode, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">

      <Link
        to="/"
        className="logo"
        onClick={closeMenu}
      >
        PrepQuarters
      </Link>

      {/* Desktop / Mobile Navigation */}
      <nav
        className={
          menuOpen
            ? "nav-links mobile-open"
            : "nav-links"
        }
      >
        <a href="/#home" onClick={closeMenu}>
          Home
        </a>

        <a href="/#features" onClick={closeMenu}>
          Features
        </a>

        <a href="/#how-it-works" onClick={closeMenu}>
          How It Works
        </a>

        <a href="/#pricing" onClick={closeMenu}>
          Pricing
        </a>

        <a href="/#faq" onClick={closeMenu}>
          FAQ
        </a>

        <a href="/#contact" onClick={closeMenu}>
          Contact
        </a>
      </nav>

      <div className="nav-actions">

        <button
          className="theme-button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <>
              <Sun size={18} />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={18} />
              <span>Dark</span>
            </>
          )}
        </button>

        <button
          className="login-button"
          onClick={() => {
            closeMenu();
            window.location.href = "/login";
          }}
        >
          Login / Signup
        </button>

        {/* Hamburger */}
        <button
          className="hamburger-button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={
            menuOpen ? "Close navigation" : "Open navigation"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>
    </header>
  );
}

export default Navbar;