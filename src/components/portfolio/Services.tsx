"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SERVICES } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import { useScreenNav } from "@/lib/use-screen-nav";
import AudioTitleWave from "./AudioTitleWave";

/**
 * Servicios y stack — statement display + 3 columnas con pill chips.
 * Incluye el mensaje final "YA SEA QUE NECESITES..." (puntos 10 y 12).
 * Animaciones onEnter (replayTick del screen-nav) en lugar de ScrollTrigger.
 */
export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const reduced = usePrefersReducedMotion();
  const { replayTick } = useScreenNav();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced) return;
      // Statement reveal por línea (mask reveal elegante)
      const lines = ref.current?.querySelectorAll(".svc-statement .reveal-inner");
      if (lines) {
        gsap.fromTo(
          lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
            delay: 0.15,
          }
        );
      }
      // Subtitle sube suavemente (punto 12)
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            delay: 0.5,
          }
        );
      }
      // Filas stagger
      const rows = ref.current?.querySelectorAll(".svc-row");
      if (rows) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.05,
            delay: 0.3,
          }
        );
      }
    }, ref);
    return () => ctx.revert();
  }, [reduced, replayTick]);

  return (
    <section
      ref={ref}
      data-screen-scroll
      className="h-[100svh] overflow-y-auto py-16 md:py-20"
      aria-label="Servicios y stack"
    >
      <div className="container-edge">
        {/* Statement */}
        <h2
          className="svc-statement audio-title display max-w-[18ch]"
          style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}
        >
          <AudioTitleWave variant="groove" />
          {SERVICES.statement.map((line, i) => (
            <span key={i} className="reveal-mask block">
              <span className="reveal-inner block">{line}</span>
            </span>
          ))}
        </h2>

        {/* Subtitle / mensaje final — sube suavemente (puntos 10 y 12) */}
        {SERVICES.subtitle && (
          <p
            ref={subtitleRef}
            className="mt-6 md:mt-8 max-w-[52ch] text-[14px] md:text-[16px] leading-relaxed"
            style={{ color: "var(--ink)", opacity: 0.85 }}
          >
            {SERVICES.subtitle}
          </p>
        )}

        {/* Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-10 md:mt-14">
          {SERVICES.columns.map((col) => (
            <div key={col.chip}>
              <div className="mb-4">
                <span className="pill">{col.chip}</span>
              </div>
              {/* Lista de texto plano, sin divisores */}
              <ul className="flex flex-col gap-2">
                {col.items.map((item) => (
                  <li key={item} className="svc-row cursor-default">
                    <span className="text-[15px] md:text-[16px] inline-block hover:translate-x-1 transition-transform duration-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
