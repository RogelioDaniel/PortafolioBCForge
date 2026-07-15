"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * ScrollProgress — barra fina (3px) en la parte superior que refleja
 * el progreso de scroll de la página. Color tinta, z máxima.
 * Se oculta durante el preloader.
 */
export default function ScrollProgress({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!active) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(ref.current, { scaleX: 0, transformOrigin: "0 0" });
        // Fallback simple con scroll nativo
        const onScroll = () => {
          const h =
            document.documentElement.scrollHeight - window.innerHeight;
          const p = h > 0 ? window.scrollY / h : 0;
          if (ref.current)
            ref.current.style.transform = `scaleX(${p})`;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
      }
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "0 0",
          scrollTrigger: {
            start: 0,
            end: () =>
              document.documentElement.scrollHeight - window.innerHeight,
            scrub: 0.3,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [active, reduced]);

  if (!active) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref={ref}
        className="h-full origin-left"
        style={{
          background: "var(--ink)",
          transform: "scaleX(0)",
          transformOrigin: "0 0",
        }}
      />
    </div>
  );
}
