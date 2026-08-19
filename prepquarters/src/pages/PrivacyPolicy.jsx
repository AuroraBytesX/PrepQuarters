import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 20px", color: "#f3f4f6" }}>
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#10b981",
          textDecoration: "none",
          fontSize: "0.88rem",
          fontWeight: 600,
          marginBottom: "16px"
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#10b981", marginBottom: "8px" }}>
        <Shield size={20} />
        <span style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Legal & Privacy
        </span>
      </div>

      <h1 style={{ fontSize: "2.4rem", fontWeight: 800, margin: "0 0 12px", color: "#ffffff" }}>
        Privacy Policy
      </h1>
      <p style={{ color: "#9ca3af", fontSize: "0.95rem", marginBottom: "36px" }}>
        Last Updated: August 2026. This policy outlines how PrepQuarters collects, processes, and protects your information.
      </p>

      <div style={{
        background: "#111827",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "36px",
        lineHeight: 1.7,
        color: "#d1d5db"
      }}>
        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", marginTop: 0 }}>1. Information We Collect</h2>
          <p>
            When you use PrepQuarters, we collect information necessary to provide AI mock interviews and resume analysis:
          </p>
          <ul style={{ paddingLeft: "20px", color: "#9ca3af" }}>
            <li><strong>Account Data:</strong> Name, email address, password hash, target role, and preferred interview domains.</li>
            <li><strong>Interview Session Data:</strong> Transcripts of spoken or typed answers, submitted code, and generated evaluation scorecards.</li>
            <li><strong>Resume Documents:</strong> Plain text, LaTeX, or PDF files (up to 5MB) uploaded voluntarily for tailoring and ATS readiness feedback.</li>
            <li><strong>Provider Credentials (BYOK):</strong> If you choose Bring Your Own API mode, your API keys are handled strictly in session context and are never stored in plain client logs.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", marginTop: 0 }}>2. How We Use Your Data</h2>
          <p>
            We process your information exclusively to:
          </p>
          <ul style={{ paddingLeft: "20px", color: "#9ca3af" }}>
            <li>Generate adaptive interview questions and multi-turn follow-ups.</li>
            <li>Evaluate technical accuracy, Big-O algorithmic complexity, and communication clarity.</li>
            <li>Provide personalized skill-gap diagnostic analytics on your dashboard.</li>
            <li>Generate compile-ready LaTeX resumes and PDF documents based on your input.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", marginTop: 0 }}>3. Data Storage & Retention Policy</h2>
          <p>
            To respect candidate privacy and maintain optimal database efficiency:
          </p>
          <ul style={{ paddingLeft: "20px", color: "#9ca3af" }}>
            <li><strong>Completed Replay Retention:</strong> We retain only the <strong>2 most recent completed interview replays</strong> per user account. Older completed session records are permanently deleted from database storage.</li>
            <li><strong>Active Sessions:</strong> In-progress sessions are preserved during practice and are never deleted prematurely.</li>
            <li><strong>Resume Storage:</strong> Uploaded resume files and generated LaTeX drafts can be deleted or updated at any time through the Resume interface.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", marginTop: 0 }}>4. Third-Party AI Services</h2>
          <p>
            Depending on your selected AI Provider Mode, requests are processed by:
          </p>
          <ul style={{ paddingLeft: "20px", color: "#9ca3af" }}>
            <li><strong>My API Mode:</strong> Processed through secure server-side inference engines under platform data governance.</li>
            <li><strong>Bring Your Own API Mode:</strong> Direct API calls dispatched to OpenAI, Anthropic, or xAI using your supplied credentials according to each provider's privacy terms.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", marginTop: 0 }}>5. Security Practices</h2>
          <p>
            All network communication uses HTTPS encryption. Access tokens are cryptographically signed, and private inference credentials never reach browser DevTools or client storage.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", marginTop: 0 }}>6. Contact for Privacy Inquiries</h2>
          <p style={{ margin: 0 }}>
            If you have questions regarding this Privacy Policy or wish to request data removal, please submit an inquiry via our <Link to="/" style={{ color: "#10b981" }}>Contact Form</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
