import React from "react";

/**
 * Dedicated PrepQuarters Brand Logo Asset Structure
 * Clean SVG symbol with modular icon and text identity.
 * Fully responsive to Light Mode and Dark Mode.
 */
export function LogoIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="9" height="9" rx="2" fill="#10b981" fillOpacity="0.85" />
      <rect x="13" y="2" width="9" height="9" rx="2" fill="#34d399" fillOpacity="0.4" />
      <rect x="2" y="13" width="9" height="9" rx="2" fill="#34d399" fillOpacity="0.4" />
      <rect x="13" y="13" width="9" height="9" rx="2" fill="#10b981" fillOpacity="0.85" />
      <path
        d="M8.5 6.5L15.5 17.5"
        stroke="#ffffff"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ size = 20, showText = true, className = "" }) {
  return (
    <div className={`prepquarters-logo-wrapper ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <div className="logo-badge" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-soft)", border: "1px solid var(--accent-border)" }}>
        <LogoIcon size={size} />
      </div>
      {showText && (
        <span style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          PrepQuarters
        </span>
      )}
    </div>
  );
}

export default Logo;
