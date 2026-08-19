import React from "react";

/**
 * Animated Engineering Workspace Visual
 * A lightweight, GPU-efficient SVG animation representing a candidate
 * actively coding, drawing system architectures, and executing technical interview solutions.
 */
export function EngineeringCanvasVisual({ className = "" }) {
  return (
    <div
      className={`engineering-visual-container ${className}`}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "620px",
        height: "360px",
        margin: "0 auto",
        borderRadius: "16px",
        background: "linear-gradient(145deg, rgba(14, 20, 32, 0.8), rgba(9, 13, 20, 0.95))",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Workspace Header / Window Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", opacity: 0.8 }} />
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", opacity: 0.8 }} />
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", opacity: 0.8 }} />
          <span style={{ marginLeft: "10px", fontSize: "11px", color: "#64748b", fontFamily: "var(--font-mono)" }}>
            architecture_session.py &bull; System Design Sandbox
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            color: "#34d399",
            background: "rgba(16, 185, 129, 0.1)",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: 600,
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
            Active Session
          </span>
        </div>
      </div>

      {/* Interactive Animated SVG Stage */}
      <div style={{ position: "relative", flex: 1, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg
          viewBox="0 0 560 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%" }}
          aria-hidden="true"
        >
          {/* Real-time Code Editor Panel */}
          <rect x="30" y="20" width="220" height="230" rx="8" fill="#0b0f17" stroke="rgba(255,255,255,0.08)" />
          <text x="45" y="42" fill="#94a3b8" fontSize="10" fontFamily="monospace">1</text>
          <text x="60" y="42" fill="#38bdf8" fontSize="10" fontFamily="monospace">class</text>
          <text x="92" y="42" fill="#f8fafc" fontSize="10" fontFamily="monospace">RateLimiter:</text>

          <text x="45" y="60" fill="#94a3b8" fontSize="10" fontFamily="monospace">2</text>
          <text x="60" y="60" fill="#a855f7" fontSize="10" fontFamily="monospace">  def</text>
          <text x="85" y="60" fill="#34d399" fontSize="10" fontFamily="monospace">__init__</text>
          <text x="135" y="60" fill="#cbd5e1" fontSize="10" fontFamily="monospace">(self, rate):</text>

          <text x="45" y="78" fill="#94a3b8" fontSize="10" fontFamily="monospace">3</text>
          <text x="75" y="78" fill="#cbd5e1" fontSize="10" fontFamily="monospace">self.tokens = rate</text>

          <text x="45" y="96" fill="#94a3b8" fontSize="10" fontFamily="monospace">4</text>
          <text x="75" y="96" fill="#cbd5e1" fontSize="10" fontFamily="monospace">self.window = 60</text>

          <text x="45" y="114" fill="#94a3b8" fontSize="10" fontFamily="monospace">5</text>
          <text x="60" y="114" fill="#a855f7" fontSize="10" fontFamily="monospace">  def</text>
          <text x="85" y="114" fill="#34d399" fontSize="10" fontFamily="monospace">allow_req</text>
          <text x="145" y="114" fill="#cbd5e1" fontSize="10" fontFamily="monospace">(user_id):</text>

          <text x="45" y="132" fill="#94a3b8" fontSize="10" fontFamily="monospace">6</text>
          <text x="75" y="132" fill="#fbbf24" fontSize="10" fontFamily="monospace"># CRDT Token Bucket</text>

          {/* Typing indicator cursor on code editor */}
          <rect x="75" y="145" width="60" height="4" rx="2" fill="#10b981">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </rect>
          <rect x="75" y="156" width="90" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
          <rect x="75" y="167" width="45" height="4" rx="2" fill="rgba(255,255,255,0.2)" />

          {/* Test Case Output Pill */}
          <rect x="45" y="195" width="190" height="38" rx="6" fill="#141c2c" stroke="rgba(16,185,129,0.3)" />
          <circle cx="60" cy="214" r="5" fill="#10b981" />
          <text x="72" y="217" fill="#f8fafc" fontSize="10" fontFamily="sans-serif" fontWeight="600">Tests: 3/3 Passed (0.8ms)</text>

          {/* Connecting Data Flow Lines */}
          <path
            d="M 250 135 C 280 135, 280 80, 310 80"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          >
            <animate attributeName="stroke-dashoffset" values="16;0" dur="1s" repeatCount="indefinite" />
          </path>
          <path
            d="M 250 135 C 280 135, 280 190, 310 190"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          >
            <animate attributeName="stroke-dashoffset" values="16;0" dur="1s" repeatCount="indefinite" />
          </path>

          {/* Right Panel: Architecture Sketch & Diagnostic Nodes */}
          {/* Node 1: Edge Ingress */}
          <g>
            <rect x="310" y="55" width="100" height="50" rx="8" fill="#111827" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
            <text x="325" y="78" fill="#f8fafc" fontSize="10" fontWeight="600">Edge Gateway</text>
            <text x="325" y="93" fill="#10b981" fontSize="9">150k req/sec</text>
          </g>

          {/* Node 2: Distributed Cluster */}
          <g>
            <rect x="310" y="165" width="100" height="50" rx="8" fill="#111827" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" />
            <text x="325" y="188" fill="#f8fafc" fontSize="10" fontWeight="600">Redis Cache</text>
            <text x="325" y="203" fill="#38bdf8" fontSize="9">CRDT Replicated</text>
          </g>

          {/* Node 3: AI Diagnostic Evaluator Hub */}
          <g>
            <rect x="435" y="110" width="105" height="60" rx="10" fill="#141c2c" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
            <text x="448" y="133" fill="#f8fafc" fontSize="10" fontWeight="700">AI Evaluator</text>
            <text x="448" y="148" fill="#c084fc" fontSize="9">Score: 9.4/10</text>
            <text x="448" y="160" fill="#94a3b8" fontSize="8">O(1) Time Verified</text>
          </g>

          {/* Arrows into Evaluator */}
          <line x1="410" y1="80" x2="435" y2="125" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <line x1="410" y1="190" x2="435" y2="155" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

          {/* Stylized Developer Hand Interaction Silhouette (Drawing/Coding Vector) */}
          <g opacity="0.85" transform="translate(240, 190) scale(0.65)">
            {/* Hand Path */}
            <path
              d="M 40 90 C 30 70, 35 45, 50 30 C 58 20, 72 20, 80 30 L 95 50 L 110 35 C 118 25, 132 25, 140 35 L 145 55 L 155 45 C 163 35, 177 35, 185 45 C 190 52, 190 62, 185 70 L 165 110 C 150 140, 110 160, 70 150 C 45 145, 42 110, 40 90 Z"
              fill="rgba(16, 185, 129, 0.08)"
              stroke="rgba(16, 185, 129, 0.4)"
              strokeWidth="2"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 8 -5; 0 0"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </path>
            {/* Stylus / Pen Tip */}
            <line x1="50" y1="30" x2="10" y2="-10" stroke="#34d399" strokeWidth="3" strokeLinecap="round">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 8 -5; 0 0"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </line>
            <circle cx="10" cy="-10" r="3" fill="#10b981">
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>

      {/* Visual Footer Metrics Strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 18px",
          background: "rgba(0, 0, 0, 0.3)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          fontSize: "11px",
          color: "#94a3b8",
        }}
      >
        <span>Deterministic Compiler: <strong style={{ color: "#f8fafc" }}>Isolated Sandbox</strong></span>
        <span>LLM Evaluation: <strong style={{ color: "#34d399" }}>Evidence-Based (0-10)</strong></span>
        <span>Latency: <strong style={{ color: "#38bdf8" }}>~450ms</strong></span>
      </div>
    </div>
  );
}

export default EngineeringCanvasVisual;
