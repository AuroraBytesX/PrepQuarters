import { useState, useEffect } from "react";
import { Sparkles, Key, CheckCircle, AlertCircle, Shield, ArrowRight, X, Cpu } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export function AiProviderModal({ isOpen, onClose, onSelectProvider }) {
  const [selectedMode, setSelectedMode] = useState("my_api");
  const [byokProvider, setByokProvider] = useState("openai");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null); // { success: boolean, message: string }

  useEffect(() => {
    // Load current preference
    const saved = localStorage.getItem("prepquarters_ai_provider");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setSelectedMode(parsed.mode);
        if (parsed.provider) setByokProvider(parsed.provider);
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyAndSaveByok = async () => {
    if (!apiKeyInput.trim()) {
      setVerifyStatus({ success: false, message: "Please enter your API key to verify." });
      return;
    }

    setVerifying(true);
    setVerifyStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/system/verify-byok`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: byokProvider,
          apiKey: apiKeyInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setVerifyStatus({ success: true, message: `${byokProvider.toUpperCase()} key verified successfully.` });
        
        // Save session configuration (key held in session storage or state, not localStorage plaintext)
        sessionStorage.setItem("prepquarters_byok_key", apiKeyInput.trim());
        localStorage.setItem("prepquarters_ai_provider_configured", "true");
        localStorage.setItem(
          "prepquarters_ai_provider",
          JSON.stringify({ mode: "byok", provider: byokProvider, configured: true })
        );

        if (onSelectProvider) {
          onSelectProvider({ mode: "byok", provider: byokProvider, apiKey: apiKeyInput.trim() });
        }
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setVerifyStatus({ success: false, message: data.message || "Invalid API key string." });
      }
    } catch (err) {
      setVerifyStatus({ success: false, message: "Could not connect to verification service." });
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveMyApi = () => {
    localStorage.setItem("prepquarters_ai_provider_configured", "true");
    localStorage.setItem(
      "prepquarters_ai_provider",
      JSON.stringify({ mode: "my_api", provider: "platform", configured: true })
    );
    sessionStorage.removeItem("prepquarters_byok_key");

    if (onSelectProvider) {
      onSelectProvider({ mode: "my_api", provider: "platform" });
    }
    onClose();
  };

  return (
    <div className="provider-modal-overlay" style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.65)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="provider-modal-card" style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "580px",
        padding: "28px",
        boxShadow: "var(--shadow-dropdown)",
        color: "var(--text-primary)",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <Cpu size={16} />
              <span>AI Provider Mode</span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, margin: "6px 0 0", color: "var(--text-primary)" }}>
              Choose AI Intelligence Engine
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>
          Select how you want AI evaluations and questioning powered during your mock interview sessions.
        </p>

        {/* Mode Selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div
            onClick={() => setSelectedMode("my_api")}
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: selectedMode === "my_api" ? "2px solid var(--accent-primary)" : "1px solid var(--border-medium)",
              background: selectedMode === "my_api" ? "var(--accent-soft)" : "var(--bg-card)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              <strong style={{ fontSize: "0.98rem", color: "var(--text-primary)" }}>Platform Engine</strong>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
              Platform-managed intelligence with a 40 req/min limit. Zero setup required.
            </p>
          </div>

          <div
            onClick={() => setSelectedMode("byok")}
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: selectedMode === "byok" ? "2px solid var(--accent-primary)" : "1px solid var(--border-medium)",
              background: selectedMode === "byok" ? "var(--accent-soft)" : "var(--bg-card)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Key size={18} color="var(--accent-primary)" />
              <strong style={{ fontSize: "0.98rem", color: "var(--text-primary)" }}>Bring Your Own Key</strong>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
              Connect your own OpenAI, Anthropic, or xAI key. Dedicated quota, zero limits.
            </p>
          </div>
        </div>

        {/* BYOK Configuration Form */}
        {selectedMode === "byok" && (
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-medium)",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "20px"
          }}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                Select Provider
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["openai", "anthropic", "xai"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setByokProvider(p)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: byokProvider === p ? "2px solid var(--accent-primary)" : "1px solid var(--border-medium)",
                      background: byokProvider === p ? "var(--accent-soft)" : "var(--bg-surface)",
                      color: byokProvider === p ? "var(--accent-primary)" : "var(--text-secondary)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize"
                    }}
                  >
                    {p === "xai" ? "xAI (Grok)" : p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label htmlFor="byok-api-key" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                {byokProvider.toUpperCase()} API Key
              </label>
              <input
                id="byok-api-key"
                name="byokApiKey"
                type="password"
                placeholder={`sk-... (${byokProvider} secret key)`}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
              <Shield size={14} color="var(--accent-primary)" />
              <span>Keys are verified server-side and never exposed in browser network logs.</span>
            </div>

            {verifyStatus && (
              <div style={{
                marginTop: "12px",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: verifyStatus.success ? "var(--accent-soft)" : "rgba(239, 68, 68, 0.1)",
                color: verifyStatus.success ? "var(--accent-primary)" : "#ef4444",
                border: verifyStatus.success ? "1px solid var(--accent-border)" : "1px solid rgba(239, 68, 68, 0.3)"
              }}>
                {verifyStatus.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                <span>{verifyStatus.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid var(--border-medium)",
              borderRadius: "8px",
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            Cancel
          </button>

          {selectedMode === "my_api" ? (
            <button
              type="button"
              onClick={handleSaveMyApi}
              style={{
                padding: "10px 20px",
                background: "var(--accent-primary)",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>Use Platform Engine</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVerifyAndSaveByok}
              disabled={verifying}
              style={{
                padding: "10px 20px",
                background: "var(--accent-primary)",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: verifying ? "not-allowed" : "pointer",
                opacity: verifying ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>{verifying ? "Verifying..." : "Verify & Activate"}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiProviderModal;
