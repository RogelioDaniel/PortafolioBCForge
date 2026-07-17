"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import { useScreenNav } from "@/lib/use-screen-nav";

/**
 * Marquee — ticker horizontal infinito, firma awwwards.
 * Dos filas que se desplazan en direcciones opuestas, velocidad ligada
 * al scroll (scrub). Items separados por un asterisco pixel ✦.
 * Pausa al hover.
 */
const ITEMS_TOP = [
  "Three.js",
  "GSAP",
  "WebGL",
  "Scroll Storytelling",
  "Motion Design",
  "React",
  "Shaders",
  "Creative Dev",
];
const ITEMS_BOTTOM = [
  "Sitios 3D",
  "Experiencias",
  "Landing Pages",
  "Web Apps",
  "Animación",
  "E-commerce",
  "Design Systems",
  "Accesibilidad",
];

export default function Marquee() {
  const ref = useRef<HTMLElement>(null);
  const topTrack = useRef<HTMLDivElement>(null);
  const bottomTrack = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { replayTick } = useScreenNav();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced) return;

      // Animación continua (loop infinito) con mod
      const topEl = topTrack.current;
      const botEl = bottomTrack.current;
      if (!topEl || !botEl) return;

      // Duplicamos contenido para loop seamless (solo si no se duplicó ya)
      if (topEl.children.length <= ITEMS_TOP.length) {
        topEl.innerHTML = topEl.innerHTML + topEl.innerHTML;
        botEl.innerHTML = botEl.innerHTML + botEl.innerHTML;
      }

      const loopTop = gsap.to(topEl, {
        xPercent: -50,
        duration: 40,
        ease: "none",
        repeat: -1,
      });
      const loopBot = gsap.to(botEl, {
        xPercent: 50,
        duration: 46,
        ease: "none",
        repeat: -1,
      });

      // Pausa al hover
      const hover = (tl: gsap.core.Tween) => (e: Event) => {
        if (e.type === "mouseenter") tl.timeScale(0.15);
        else tl.timeScale(1);
      };
      const onTop = hover(loopTop);
      const onBot = hover(loopBot);
      topEl.addEventListener("mouseenter", onTop);
      topEl.addEventListener("mouseleave", onTop);
      botEl.addEventListener("mouseenter", onBot);
      botEl.addEventListener("mouseleave", onBot);

      return () => {
        topEl.removeEventListener("mouseenter", onTop);
        topEl.removeEventListener("mouseleave", onTop);
        botEl.removeEventListener("mouseenter", onBot);
        botEl.removeEventListener("mouseleave", onBot);
      };
    }, ref);
    return () => ctx.revert();
  }, [reduced, replayTick]);

  const Star = () => (
    <span
      aria-hidden="true"
      className="marquee-star inline-block mx-6 md:mx-10 align-middle spin-slow"
      style={{
        width: 14,
        height: 14,
        background: "var(--ink)",
        clipPath:
          "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
        opacity: 0.4,
      }}
    />
  );

  return (
    <section
      ref={ref}
      className="marquee-section py-12 md:py-16 overflow-hidden border-y relative"
      style={{ borderColor: "var(--line)" }}
      aria-label="Habilidades"
    >
      {/* Glow decorativo de fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--bg-glow) 0%, transparent 60%)",
          opacity: 0.3,
        }}
      />
      {/* Fila superior */}
      <div className="relative whitespace-nowrap">
        <div
          ref={topTrack}
          className="inline-flex items-center will-change-transform"
        >
          {ITEMS_TOP.map((it, i) => (
            <span key={i} className="inline-flex items-center">
              <span
                className="marquee-word display transition-all duration-300"
                style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
              >
                {it}
              </span>
              <Star />
            </span>
          ))}
          {ITEMS_TOP.map((it, i) => (
            <span key={`d-${i}`} className="inline-flex items-center">
              <span
                className="marquee-word display transition-all duration-300"
                style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
              >
                {it}
              </span>
              <Star />
            </span>
          ))}
        </div>
      </div>

      {/* Fila inferior (dirección opuesta, outline style) */}
      <div className="relative whitespace-nowrap mt-3 md:mt-5">
        <div
          ref={bottomTrack}
          className="inline-flex items-center will-change-transform"
        >
          {ITEMS_BOTTOM.map((it, i) => (
            <span key={i} className="inline-flex items-center">
              <span
                className="marquee-word display"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                  WebkitTextStroke: "1.5px var(--ink)",
                  color: "transparent",
                }}
              >
                {it}
              </span>
              <Star />
            </span>
          ))}
          {ITEMS_BOTTOM.map((it, i) => (
            <span key={`d-${i}`} className="inline-flex items-center">
              <span
                className="marquee-word display"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                  WebkitTextStroke: "1.5px var(--ink)",
                  color: "transparent",
                }}
              >
                {it}
              </span>
              <Star />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
