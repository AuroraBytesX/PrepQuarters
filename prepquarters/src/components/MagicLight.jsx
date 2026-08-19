import { useEffect, useRef } from "react";
import "./MagicLight.css";

function MagicLight() {
  const lightRef = useRef(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    // Check for reduced motion or coarse pointer (mobile/touch) or small screen
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 900
    ) {
      return;
    }

    let ticking = false;

    const handlePointerMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (lightRef.current) {
            lightRef.current.style.transform = `translate3d(${e.clientX - 120}px, ${e.clientY - 120}px, 0)`;
            if (!isVisibleRef.current) {
              isVisibleRef.current = true;
              lightRef.current.style.opacity = "1";
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const handlePointerLeave = () => {
      isVisibleRef.current = false;
      if (lightRef.current) {
        lightRef.current.style.opacity = "0";
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return <div ref={lightRef} className="magic-light-ambient-glow" aria-hidden="true" />;
}

export default MagicLight;
