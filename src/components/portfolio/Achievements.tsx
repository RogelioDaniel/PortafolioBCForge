"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ACHIEVEMENTS } from "@/lib/portfolio-content";
import { usePrefersReducedMotion, useIsTouch } from "@/lib/motion-hooks";

/**
 * Logros / Reconocimientos:
 *  - Mini-hero con palabra gigante + objetos 3D pequeños flotantes (decoración CSS)
 *  - Statement en Space Mono
 *  - Lista de filas (1px divisoria): nombre + superíndice cantidad + flecha →
 *  - En hover: fila activa opacidad 1, demás 0.3; preview flota siguiendo al cursor
 *  - Cierra con "+ [N] MÁS" alineado a la derecha
 */
export default function Achievements() {
  const ref = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouch();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) return;
      const title = ref.current?.querySelector(".ach-title");
      if (title) {
        gsap.fromTo(
          title,
          { yPercent: 20, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: { trigger: ref.current, start: "top 70%" },
          }
        );
      }
      const rows = ref.current?.querySelectorAll(".ach-row");
      rows?.forEach((r) => {
        gsap.fromTo(
          r,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: r, start: "top 90%" },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  // Preview sigue cursor
  useEffect(() => {
    if (isTouch || reduced) return;
    const preview = previewRef.current;
    if (!preview) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      preview.style.transform = `translate(${cx}px, ${cy}px) translate(20px, 20px)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [isTouch, reduced]);

  return (
    <section ref={ref} id="logros" className="py-24 md:py-36 relative" aria-label="Logros">
      <div className="container-edge">
        {/* Mini-hero con objetos decorativos flotantes (parallax por capas) */}
        <div className="relative mb-16 md:mb-24">
          <h2
            className="ach-title display"
            style={{ fontSize: "clamp(3rem, 16vw, 14rem)" }}
          >
            {ACHIEVEMENTS.title}
          </h2>
          {/* Objetos decorativos pixel (CSS) flotando dispersos */}
          <DecorFloaters />
        </div>

        {/* Statement mono */}
        <p className="mono-lg max-w-[50ch] mb-12 md:mb-16" style={{ fontFamily: "var(--font-space-mono)", textTransform: "none", letterSpacing: 0 }}>
          {ACHIEVEMENTS.statement}
        </p>

        {/* Lista de filas */}
        <ul className="flex flex-col">
          {ACHIEVEMENTS.items.map((item, i) => (
            <li
              key={item.name}
              className="ach-row hairline group relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <button
                className="w-full py-6 md:py-8 flex items-center justify-between text-left transition-opacity duration-300"
                style={{ opacity: hovered === null || hovered === i ? 1 : 0.3 }}
              >
                <span className="flex items-baseline gap-3 md:gap-4">
                  <span
                    className="display"
                    style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}
                  >
                    {item.name}
                  </span>
                  <sup className="mono text-[11px] opacity-60">
                    {item.count}
                  </sup>
                </span>
                <span className="mono text-[16px] md:text-[20px] transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* "+ N MÁS" */}
        <div className="mt-8 md:mt-10 flex justify-end">
          <button className="pill">
            {ACHIEVEMENTS.more}
            <span className="ml-1">→</span>
          </button>
        </div>
      </div>

      {/* Preview flotante siguiendo al cursor */}
      {!isTouch && !reduced && (
        <div
          ref={previewRef}
          className="fixed top-0 left-0 z-40 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: hovered !== null ? 1 : 0,
            width: 200,
            height: 130,
          }}
          aria-hidden="true"
        >
          <div
            className="w-full h-full rounded-2xl border flex items-center justify-center"
            style={{
              borderColor: "var(--pill-border)",
              background: "var(--bg-navy)",
            }}
          >
            <span className="mono text-[11px] text-white/70">
              {hovered !== null ? ACHIEVEMENTS.items[hovered].name : ""}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

/** Objetos decorativos pixel flotantes con parallax por capas (data-speed). */
function DecorFloaters() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div
        data-speed="0.3"
        className="absolute top-[10%] right-[8%] w-10 h-10 rotate-12"
        style={{
          background: "var(--ink)",
          clipPath:
            "polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)",
          opacity: 0.85,
        }}
      />
      <div
        data-speed="0.6"
        className="absolute top-[60%] left-[5%] w-7 h-7 rounded-full"
        style={{ background: "#d4a24c" }}
      />
      <div
        data-speed="0.45"
        className="absolute top-[20%] left-[40%] w-5 h-5"
        style={{
          background: "#7b3ff2",
          clipPath: "polygon(50% 0,100% 50%,50% 100%,0 50%)",
        }}
      />
      <div
        data-speed="0.7"
        className="absolute top-[75%] right-[20%] w-6 h-6 rotate-45"
        style={{ background: "#2e6bff", opacity: 0.8 }}
      />
    </div>
  );
}
