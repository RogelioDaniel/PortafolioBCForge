"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { PixelHourglass } from "./PixelIcons";

/**
 * Transición de página simulada:
 *  - overlay lavanda a pantalla completa
 *  - centro: reloj de arena pixelado + nombre de la sección escribiéndose
 *    con efecto typewriter ("PROYECT|" → "PROYECTOS")
 *  - overlay se abre (wipe vertical) y ancla a la sección
 *  - duración total ≈ 1.1s (gestionada por el padre)
 */
export default function PageTransition({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    // Typewriter
    let i = 0;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      if (now - last > 60) {
        if (i <= label.length) {
          setTyped(label.slice(0, i) + (i < label.length ? "|" : ""));
          i++;
          last = now;
        }
        if (i > label.length) return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Entrada + salida
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.4, ease: "power3.out" }
      );
    });
    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
    };
  }, [label]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[90] bg-[var(--bg-light)] flex flex-col items-center justify-center"
      aria-live="polite"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--bg-glow) 0%, transparent 50%)",
          opacity: 0.5,
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <PixelHourglass size={40} spin className="text-[var(--ink)]" />
        <span
          className="display"
          style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}
        >
          {typed}
          <span className="caret">|</span>
        </span>
      </div>
    </div>
  );
}
