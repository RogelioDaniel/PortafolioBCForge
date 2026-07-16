"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroScene from "./three/HeroScene";
import { PixelChevron } from "./PixelIcons";
import { HERO } from "@/lib/portfolio-content";
import {
  useIsTouch,
  usePrefersReducedMotion,
} from "@/lib/motion-hooks";

/**
 * Hero (100vh):
 *  - Titular de 3 líneas con mask reveal (stagger 0.12s, power4.out, 1.2s)
 *  - Escena Three.js entre las letras (canvas z-2, texto base z-1, texto superior z-3 con clip-path)
 *  - Bio abajo-derecha, indicador SCROLL abajo-centro
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouch();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Mask reveal de líneas
      const lines = rootRef.current?.querySelectorAll(".hero-line .reveal-inner");
      if (lines && !reduced) {
        gsap.fromTo(
          lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.12,
            delay: 0.2,
          }
        );
      } else if (lines) {
        gsap.set(lines, { yPercent: 0 });
      }

      // Bio + indicador fade
      gsap.fromTo(
        rootRef.current?.querySelectorAll(".hero-fade") as NodeListOf<HTMLElement>,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.9,
          stagger: 0.12,
        }
      );

      // Parallax de salida del hero
      if (!reduced) {
        gsap.to(rootRef.current?.querySelector(".hero-content") as HTMLElement, {
          yPercent: 12,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative h-[100svh] flex flex-col overflow-hidden pt-24 pb-14"
      aria-label="Introducción"
    >
      {/* Capa 1: texto base (z-1) — debajo del canvas. flex-1 centra el titular
          y deja la bio siempre visible al fondo (sin desbordar el viewport) */}
      <div className="hero-content relative z-[1] flex-1 flex items-center min-h-0">
        <div className="container-edge w-full">
          <h1
            className="display"
            style={{ fontSize: "clamp(3rem, 12.5vw, 12.5rem)" }}
          >
            {HERO.lines.map((line, i) => (
              <span key={i} className="hero-line reveal-mask block">
                <span className="reveal-inner block">{line}</span>
              </span>
            ))}
          </h1>
        </div>
      </div>

      {/* Capa 2: canvas Three.js (z-2) — objetos en las esquinas, no tapan texto */}
      <HeroScene reduced={reduced} isTouch={isTouch} />

      {/* Bio abajo — dentro del viewport siempre */}
      <div className="hero-fade relative z-10 container-edge shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="mono text-[11px]"
              style={{ color: "var(--ink)", opacity: 0.85 }}
            >
              FRONT-END · 3D · MOTION
            </span>
          </div>
          <p className="max-w-[40ch] text-[13px] md:text-[14px] leading-relaxed md:text-right">
            {HERO.bio}
          </p>
        </div>
      </div>

      {/* Indicador SCROLL — texto plano + chevron, sin píldora (como la referencia) */}
      <div
        className="hero-fade absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
        style={{ color: "var(--ink)" }}
      >
        <span className="mono text-[11px] opacity-70">SCROLL</span>
        <PixelChevron className="chevron-bounce opacity-70" size={12} />
      </div>
    </section>
  );
}
