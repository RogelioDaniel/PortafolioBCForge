"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FAQ as FAQ_DATA } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * FAQ — sección de preguntas frecuentes (acordeón).
 * Header con título display 2 líneas + intro.
 * Lista de items expandibles (uno abierto a la vez). Cada item:
 *  - fila con pregunta + icono +/- pixel
 *  - respuesta colapsable con animación de altura (GSAP)
 *  - hairline divisoria entre items
 * Reveal stagger al entrar en viewport.
 */
export default function FAQ() {
  const ref = useRef<HTMLElement>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) return;
      const scroller =
        ref.current?.closest<HTMLElement>("[data-screen-scroll]") ?? undefined;
      const lines = ref.current?.querySelectorAll(".faq-title .reveal-inner");
      if (lines) {
        gsap.fromTo(
          lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: ref.current,
              scroller,
              start: "top 78%",
            },
          }
        );
      }
      const rows = ref.current?.querySelectorAll(".faq-item");
      rows?.forEach((r) => {
        gsap.fromTo(
          r,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: r, scroller, start: "top 92%" },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 540);
    return () => window.clearTimeout(timer);
  }, [openIdx]);

  const toggle = (i: number) => {
    setOpenIdx((prev) => (prev === i ? null : i));
  };

  return (
    <section
      ref={ref}
      id="faq"
      className="py-24 md:py-36 relative"
      aria-label="Preguntas frecuentes"
    >
      <div className="container-edge">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Header */}
          <div className="md:col-span-5 min-w-0">
            <span className="section-label block mb-6">{FAQ_DATA.eyebrow}</span>
            <h2
              className="faq-title audio-title display max-w-full"
              style={{ fontSize: "clamp(2.5rem, 5.2vw, 5.5rem)" }}
            >
              {FAQ_DATA.title.map((line, i) => (
                <span key={i} className="reveal-mask block">
                  <span className="reveal-inner block">{line}</span>
                </span>
              ))}
            </h2>
            <p className="mt-6 text-[14px] leading-relaxed max-w-[40ch] opacity-80">
              {FAQ_DATA.intro}
            </p>
          </div>

          {/* Acordeón */}
          <div className="md:col-span-7">
            <ul className="flex flex-col">
              {FAQ_DATA.items.map((item, i) => {
                const isOpen = openIdx === i;
                return (
                  <li
                    key={i}
                    className="faq-item hairline"
                  >
                    <button
                      id={`faq-button-${i}`}
                      onClick={() => toggle(i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      className="w-full flex items-center justify-between gap-4 py-5 md:py-6 text-left group"
                    >
                      <span
                        className="font-medium transition-transform duration-300 group-hover:translate-x-1"
                        style={{
                          fontFamily: "var(--font-archivo)",
                          fontSize: "clamp(1rem, 2vw, 1.4rem)",
                          textTransform: "uppercase",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.q}
                      </span>
                      <span
                        className="shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300"
                        style={{
                          borderColor: isOpen ? "var(--ink)" : "var(--pill-border)",
                          background: isOpen ? "var(--ink)" : "transparent",
                          color: isOpen ? "var(--bg-light)" : "var(--ink)",
                        }}
                        aria-hidden="true"
                      >
                        {/* Icono +/- pixel que rota */}
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 6 6"
                          shapeRendering="crispEdges"
                          style={{
                            transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
                            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                          }}
                        >
                          <rect x="2" y="0" width="2" height="6" fill="currentColor" />
                          <rect x="0" y="2" width="6" height="2" fill="currentColor" />
                        </svg>
                      </span>
                    </button>
                    {/* Panel colapsable */}
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-button-${i}`}
                      aria-hidden={!isOpen}
                      className="overflow-hidden transition-all duration-500"
                      style={{
                        maxHeight: isOpen ? 400 : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p className="pb-6 pr-12 text-[14px] md:text-[15px] leading-relaxed opacity-80">
                        {item.a}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
