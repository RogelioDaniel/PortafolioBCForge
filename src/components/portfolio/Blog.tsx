"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BLOG } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import { PixelEye } from "./PixelIcons";

/**
 * Blog / Insights:
 *  - Titular "MIS ARTÍCULOS" + pill "Ver todos"
 *  - Filas editoriales: thumbnail 16:9 izq con chips de categoría encima;
 *    al hover el thumbnail se cubre con overlay oscuro, ojo pixelado SVG y "LEER";
 *    título a la derecha; "Categoría • Fecha" en mono; flecha → esquina.
 */
export default function Blog() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) return;
      const rows = ref.current?.querySelectorAll(".blog-row");
      rows?.forEach((r) => {
        gsap.fromTo(
          r,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: r, start: "top 88%" },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} id="blog" className="py-24 md:py-36" aria-label="Blog">
      <div className="container-edge">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 md:mb-16 gap-6">
          <h2
            className="display"
            style={{ fontSize: "clamp(2.5rem, 9vw, 8rem)" }}
          >
            {BLOG.title}
          </h2>
          <button className="pill shrink-0">
            Ver todos
            <span className="ml-1">→</span>
          </button>
        </div>

        {/* Filas */}
        <ul className="flex flex-col">
          {BLOG.items.map((item, i) => (
            <li
              key={i}
              className="blog-row hairline group cursor-pointer py-6 md:py-8"
            >
              <a href="#" className="block" data-cursor="LEER">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
                  {/* Thumbnail 16:9 con chips + overlay hover */}
                  <div className="md:col-span-5 relative">
                    {/* Chips de categoría apilados encima */}
                    <div className="absolute -top-3 left-4 z-20 flex flex-col gap-1.5">
                      <span className="pill bg-[var(--bg-light)]">
                        {item.category}
                      </span>
                    </div>
                    <div
                      className="relative aspect-[16/9] overflow-hidden rounded-xl"
                      style={{ background: "var(--bg-navy)" }}
                    >
                      {/* Textura decorativa del thumbnail */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 40%, rgba(123,63,242,0.5), transparent 60%), radial-gradient(circle at 70% 70%, rgba(46,107,255,0.4), transparent 55%)",
                        }}
                      />
                      <span
                        className="absolute inset-0 flex items-center justify-center display"
                        style={{
                          fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                          color: "rgba(255,255,255,0.15)",
                        }}
                      >
                        0{i + 1}
                      </span>
                      {/* Overlay hover: oscuro + ojo + LEER */}
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PixelEye size={32} className="text-white" />
                        <span className="mono text-white">LEER</span>
                      </div>
                    </div>
                  </div>

                  {/* Contenido derecha */}
                  <div className="md:col-span-6 md:col-start-7">
                    <span className="mono text-[11px] opacity-60 block mb-3">
                      {item.category} · {item.date}
                    </span>
                    <h3
                      className="font-bold leading-tight"
                      style={{
                        fontFamily: "var(--font-archivo)",
                        fontSize: "clamp(1.2rem, 2.4vw, 1.8rem)",
                        textTransform: "uppercase",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Flecha */}
                  <div className="md:col-span-1 flex md:justify-end">
                    <span className="mono text-[18px] transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
