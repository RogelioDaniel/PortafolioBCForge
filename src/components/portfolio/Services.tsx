"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Servicios y stack — statement display + 3 columnas con pill chips.
 * Filas entran con stagger 0.05s al hacer scroll.
 */
export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) return;
      // Statement reveal por línea
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
            scrollTrigger: { trigger: ref.current, start: "top 75%" },
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
            scrollTrigger: { trigger: ref.current, start: "top 60%" },
          }
        );
      }
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} className="py-24 md:py-36" aria-label="Servicios y stack">
      <div className="container-edge">
        {/* Statement */}
        <h2
          className="svc-statement display max-w-[18ch]"
          style={{ fontSize: "clamp(2rem, 7vw, 6rem)" }}
        >
          {SERVICES.statement.map((line, i) => (
            <span key={i} className="reveal-mask block">
              <span className="reveal-inner block">{line}</span>
            </span>
          ))}
        </h2>

        {/* Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mt-14 md:mt-20">
          {SERVICES.columns.map((col) => (
            <div key={col.chip}>
              <div className="mb-6">
                <span className="pill">{col.chip}</span>
              </div>
              <ul className="flex flex-col">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="svc-row hairline py-4 flex items-center justify-between group cursor-default"
                  >
                    <span className="text-[15px] md:text-[16px] group-hover:translate-x-1 transition-transform duration-300">
                      {item}
                    </span>
                    <span className="mono text-[11px] opacity-40">→</span>
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
