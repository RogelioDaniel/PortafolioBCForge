"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MANIFESTO } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Manifiesto — dos bloques editoriales (fondo lavanda):
 * titular display gigante alineado a la izquierda + párrafo pequeño en columna derecha.
 * Reveal por líneas con mask.
 */
export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) return;
      const blocks = ref.current?.querySelectorAll(".manifesto-block");
      blocks?.forEach((block) => {
        const lines = block.querySelectorAll(".reveal-inner");
        gsap.fromTo(
          lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: { trigger: block, start: "top 78%" },
          }
        );
        const body = block.querySelector(".manifesto-body");
        if (body) {
          gsap.fromTo(
            body,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              delay: 0.2,
              scrollTrigger: { trigger: block, start: "top 78%" },
            }
          );
        }
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      id="manifesto"
      className="py-24 md:py-40"
      aria-label="Manifiesto"
    >
      <div className="container-edge flex flex-col gap-20 md:gap-32">
        {MANIFESTO.map((block, i) => (
          <article
            key={i}
            className="manifesto-block grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12"
          >
            <div className="md:col-span-8">
              <h2
                className="audio-title display"
                style={{ fontSize: "clamp(2rem, 6.5vw, 5.5rem)" }}
              >
                {block.title.split(" ").map((word, idx) => (
                  <span key={idx} className="reveal-mask inline-block mr-[0.25em]">
                    <span className="reveal-inner block">{word}</span>
                  </span>
                ))}
              </h2>
            </div>
            <div className="md:col-span-4 md:pt-3">
              <span className="mono text-[11px] opacity-50 block mb-4">
                {String(i + 1).padStart(2, "0")} / {String(MANIFESTO.length).padStart(2, "0")}
              </span>
              <p className="manifesto-body text-[14px] md:text-[15px] leading-relaxed max-w-[42ch]">
                {block.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
