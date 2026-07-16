"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

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

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) return;

      // Animación continua (loop infinito) con mod
      const topEl = topTrack.current;
      const botEl = bottomTrack.current;
      if (!topEl || !botEl) return;

      // Duplicamos contenido para loop seamless
      const dupTop = topEl.innerHTML;
      const dupBot = botEl.innerHTML;
      topEl.innerHTML = dupTop + dupTop;
      botEl.innerHTML = dupBot + dupBot;

      const loopTop = gsap.to(topEl, {
        xPercent: -50,
        duration: 48,
        ease: "none",
        repeat: -1,
      });
      const loopBot = gsap.to(botEl, {
        xPercent: 50,
        duration: 56,
        ease: "none",
        repeat: -1,
      });

      // Velocidad ligada al scroll
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          const speed = gsap.utils.clamp(0.3, 3, 1 + Math.abs(v) / 800);
          loopTop.timeScale(self.direction > 0 ? speed : -speed);
          loopBot.timeScale(self.direction > 0 ? -speed : speed);
        },
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
  }, [reduced]);

  const Star = () => (
    <span
      aria-hidden="true"
      className="inline-block mx-6 md:mx-10 align-middle"
      style={{
        width: 10,
        height: 10,
        background: "currentColor",
        clipPath:
          "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
        opacity: 0.5,
      }}
    />
  );

  return (
    <section
      ref={ref}
      className="py-10 md:py-14 overflow-hidden border-y"
      style={{ borderColor: "var(--line)" }}
      aria-label="Habilidades"
    >
      {/* Fila superior */}
      <div className="relative whitespace-nowrap">
        <div
          ref={topTrack}
          className="inline-flex items-center will-change-transform"
        >
          {ITEMS_TOP.map((it, i) => (
            <span key={i} className="inline-flex items-center">
              <span
                className="display"
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
                className="display"
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
      <div className="relative whitespace-nowrap mt-2 md:mt-4">
        <div
          ref={bottomTrack}
          className="inline-flex items-center will-change-transform"
        >
          {ITEMS_BOTTOM.map((it, i) => (
            <span key={i} className="inline-flex items-center">
              <span
                className="display"
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
                className="display"
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
