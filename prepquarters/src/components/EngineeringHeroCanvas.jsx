import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

/**
 * EngineeringHeroCanvas / OrganicIntelligentNetworkCanvas
 * A high-performance, calm, futuristic technical background rendering organic network activity:
 * dynamic nodes, visible flowing connections, subtle communicating pulses,
 * floating technical tokens, and gentle pointer interactivity.
 *
 * Fully responsive, GPU-efficient, 0 static grids, theme-adaptive.
 */
export function EngineeringHeroCanvas() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let isPaused = false;
    let isIntersecting = true;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Pointer state for gentle ambient interaction
    const pointer = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 140,
      active: false,
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = e.clientX - rect.left;
      pointer.targetY = e.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.targetX = -1000;
      pointer.targetY = -1000;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    // IntersectionObserver to pause when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
          if (isIntersecting && !isPaused && !prefersReducedMotion) {
            lastTime = performance.now();
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(render);
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const resize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      // Clamp canvas height to hero container height (max 950px) to prevent massive memory thrashing
      height = Math.min(parent?.clientHeight || window.innerHeight, 950);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused && isIntersecting && !prefersReducedMotion) {
        lastTime = performance.now();
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Compute theme colors dynamically with high contrast
    const isLight = theme === "light";
    const primaryNodeColor = isLight ? "#059669" : "#10b981";
    const secondaryNodeColor = isLight ? "#0284c7" : "#38bdf8";
    const tokenTextColor = isLight ? "rgba(51, 65, 85, 0.65)" : "rgba(148, 163, 184, 0.55)";

    // Generate Network Nodes with optimized count
    const isMobile = width < 768;
    const nodeCount = isMobile ? 18 : 36;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.3),
        vy: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.3),
        radius: Math.random() * 2 + 1.8,
        color: Math.random() > 0.4 ? primaryNodeColor : secondaryNodeColor,
      });
    }

    // Data Pulses traveling along organic connection routes
    const pulses = [];
    const maxPulses = isMobile ? 6 : 12;
    for (let i = 0; i < maxPulses; i++) {
      pulses.push({
        fromIndex: Math.floor(Math.random() * nodeCount),
        toIndex: Math.floor(Math.random() * nodeCount),
        progress: Math.random(),
        speed: Math.random() * 0.005 + 0.003,
        color: Math.random() > 0.5 ? primaryNodeColor : secondaryNodeColor,
      });
    }

    // Floating Technical Tokens
    const codeKeywords = [
      "O(1)",
      "CRDT",
      "Kafka",
      "STAR",
      "BST",
      "QPS",
      "Redis",
      "Async",
      "GraphQL",
      "LaTeX",
      "gRPC",
      "Raft",
    ];

    const tokenCount = isMobile ? 6 : 12;
    const tokens = [];
    for (let i = 0; i < tokenCount; i++) {
      tokens.push({
        text: codeKeywords[i % codeKeywords.length],
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      });
    }

    let lastTime = performance.now();
    const maxDist = isMobile ? 120 : 155;
    const maxDistSq = maxDist * maxDist;

    const render = (currentTime) => {
      if (isPaused || !isIntersecting) return;

      lastTime = currentTime;
      ctx.clearRect(0, 0, width, height);

      // Smooth pointer interpolation
      pointer.x += (pointer.targetX - pointer.x) * 0.1;
      pointer.y += (pointer.targetY - pointer.y) * 0.1;

      // 1. Draw Technical Tokens
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle = tokenTextColor;
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (!prefersReducedMotion) {
          t.x += t.vx;
          t.y += t.vy;

          if (t.x < -60) t.x = width + 60;
          if (t.x > width + 60) t.x = -60;
          if (t.y < -30) t.y = height + 30;
          if (t.y > height + 30) t.y = -30;
        }
        ctx.fillText(t.text, t.x, t.y);
      }

      // 2. Update node positions & gentle pointer repulsion
      for (let i = 0; i < nodes.length; i++) {
        const na = nodes[i];
        if (!prefersReducedMotion) {
          na.x += na.vx;
          na.y += na.vy;

          if (pointer.active) {
            const pdx = na.x - pointer.x;
            const pdy = na.y - pointer.y;
            const pdistSq = pdx * pdx + pdy * pdy;
            if (pdistSq < 19600 && pdistSq > 0) {
              const pdist = Math.sqrt(pdistSq);
              const force = (1 - pdist / 140) * 0.8;
              na.x += (pdx / pdist) * force;
              na.y += (pdy / pdist) * force;
            }
          }

          if (na.x < 0 || na.x > width) na.vx *= -1;
          if (na.y < 0 || na.y > height) na.vy *= -1;
        }
      }

      // 3. Draw Network Lines with high-contrast visibility
      ctx.lineWidth = isLight ? 1.0 : 0.9;
      for (let i = 0; i < nodes.length; i++) {
        const na = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nb = nodes[j];
          const dx = nb.x - na.x;
          const dy = nb.y - na.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            // High visibility alpha: 0.22 - 0.45 in dark, 0.25 - 0.50 in light
            const ratio = 1 - dist / maxDist;
            const alpha = isLight ? ratio * 0.35 + 0.15 : ratio * 0.32 + 0.12;

            ctx.strokeStyle = isLight
              ? `rgba(71, 85, 105, ${alpha.toFixed(2)})`
              : `rgba(56, 189, 248, ${alpha.toFixed(2)})`;

            ctx.beginPath();
            ctx.moveTo(na.x, na.y);
            ctx.lineTo(nb.x, nb.y);
            ctx.stroke();
          }
        }
      }

      // 4. Draw Traveling Pulses
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        if (!prefersReducedMotion) {
          p.progress += p.speed;
          if (p.progress >= 1) {
            p.progress = 0;
            p.fromIndex = Math.floor(Math.random() * nodeCount);
            p.toIndex = Math.floor(Math.random() * nodeCount);
          }
        }

        const na = nodes[p.fromIndex];
        const nb = nodes[p.toIndex];
        if (na && nb) {
          const px = na.x + (nb.x - na.x) * p.progress;
          const py = na.y + (nb.y - na.y) * p.progress;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Draw Network Nodes
      for (let i = 0; i < nodes.length; i++) {
        const na = nodes[i];
        ctx.fillStyle = na.color;
        ctx.beginPath();
        ctx.arc(na.x, na.y, na.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}

export default EngineeringHeroCanvas;
