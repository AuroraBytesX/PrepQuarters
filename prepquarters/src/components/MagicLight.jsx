import { useEffect, useRef } from "react";
import "./MagicLight.css";

function MagicLight() {
  const lightRef = useRef(null);
  const posRef = useRef({ currentX: -500, currentY: -500, targetX: -500, targetY: -500, isVisible: false });
  const animFrameRef = useRef(null);

  useEffect(() => {
    // Check for reduced motion or coarse pointer (mobile/touch)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion || isCoarsePointer) {
      return;
    }

    const handlePointerMove = (e) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;
      if (!posRef.current.isVisible) {
        posRef.current.isVisible = true;
        if (lightRef.current) {
          lightRef.current.style.opacity = "1";
        }
      }
    };

    const handlePointerLeave = () => {
      posRef.current.isVisible = false;
      if (lightRef.current) {
        lightRef.current.style.opacity = "0";
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animate = () => {
      const pos = posRef.current;
      pos.currentX = lerp(pos.currentX, pos.targetX, 0.12);
      pos.currentY = lerp(pos.currentY, pos.targetY, 0.12);

      if (lightRef.current) {
        lightRef.current.style.transform = `translate3d(${pos.currentX - 120}px, ${pos.currentY - 120}px, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return <div ref={lightRef} className="magic-light-ambient-glow" aria-hidden="true" />;
}

export default MagicLight;
