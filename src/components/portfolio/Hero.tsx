"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import HeroScene from "./three/HeroScene";
import { PixelChevron } from "./PixelIcons";
import { HERO } from "@/lib/portfolio-content";
import { useIsTouch, usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Hero (100vh) — MINIMALISTA Y ELEGANTE.
 *  - Solo el titular grande de 3 líneas + indicador de navegación.
 *  - Animación elegante: cada letra entra escalonada con leve blur/rotación,
 *    línea decorativa que se dibuja debajo del titular, y respiración sutil.
 *  - P4 (bug "no se ven las letras"): ya NO hay parallax de salida con scroll.
 *    Las letras se animan al montar y quedan visibles durante toda la salida.
 */
export default function Hero({
  playIntro = true,
  onSceneReady,
}: {
  playIntro?: boolean;
  onSceneReady?: () => void;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouch();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const chars = rootRef.current?.querySelectorAll<HTMLElement>(".hero-char");
      const line = lineRef.current;

      if (reduced) {
        if (chars) gsap.set(chars, { opacity: 1, y: 0, rotate: 0, filter: "none" });
        return;
      }

      // Reset por si se re-anima
      if (chars && chars.length) {
        gsap.set(chars, { opacity: 0, yPercent: 120, rotate: 8, filter: "blur(8px)" });
      }
      if (line) {
        const length = line.getTotalLength();
        gsap.set(line, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      }
      gsap.set(
        rootRef.current?.querySelectorAll(".hero-fade") as NodeListOf<HTMLElement>,
        { opacity: 0, y: 20 }
      );

      // Durante el loading se prepara el DOM y un frame WebGL, pero el
      // espectáculo empieza junto con el wipe para evitar flashes.
      if (!playIntro) return;

      // Entrada letra por letra: stagger + blur + rotación
      if (chars && chars.length) {
        gsap.to(chars, {
          opacity: 1,
          yPercent: 0,
          rotate: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power3.out",
          stagger: { each: 0.035, from: "start" },
          delay: 0.3,
        });
      }

      // Línea decorativa que se dibuja debajo del titular
      if (line) {
        gsap.to(
          line,
          {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.inOut",
            delay: 1.2,
          }
        );
      }

      // Indicador fade
      gsap.fromTo(
        rootRef.current?.querySelectorAll(".hero-fade") as NodeListOf<HTMLElement>,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: 1.6,
          stagger: 0.15,
        }
      );

      // Respiración sutil del titular (idle parallax muy leve)
      const title = rootRef.current?.querySelector(".hero-title");
      if (title) {
        gsap.to(title, {
          y: -6,
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 2,
        });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [playIntro, reduced]);

  // Split de cada línea en caracteres (preserva espacios)
  const renderLine = (line: string, lineIdx: number) =>
    line.split("").map((ch, i) => (
      <span
        key={`${lineIdx}-${i}`}
        className="hero-char inline-block"
        style={{ whiteSpace: ch === " " ? "pre" : "normal" }}
        aria-hidden="true"
      >
        {ch}
      </span>
    ));

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative h-[100svh] flex flex-col overflow-hidden pt-24 pb-14"
      aria-label="Introducción"
    >
      {/* Capa 1: texto base (z-1) */}
      <div className="hero-content relative z-[1] flex-1 flex items-center min-h-0">
        <div className="container-edge w-full">
          <h1
            className="hero-title audio-title display"
            style={{ fontSize: "clamp(3rem, 12.5vw, 12.5rem)" }}
          >
            {/* Accessible text (hidden visually) */}
            <span className="sr-only">{HERO.lines.join(" ")}</span>
            {HERO.lines.map((line, i) => (
              <span key={i} className="hero-line reveal-mask block">
                <span className="reveal-inner block">
                  {renderLine(line, i)}
                </span>
              </span>
            ))}
          </h1>

          {/* Línea decorativa que se dibuje debajo del titular */}
          <svg
            className="hero-fade mt-6 md:mt-8"
            width="100%"
            height="10"
            viewBox="0 0 600 10"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ maxWidth: 380 }}
          >
            <path
              ref={lineRef}
              d="M2 5 Q 150 1, 300 5 T 598 5"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>

      {/* Capa 2: canvas Three.js (z-2) */}
      <HeroScene
        reduced={reduced}
        isTouch={isTouch}
        running={playIntro}
        onFirstFrame={onSceneReady}
      />

      {/* Indicador de navegación — abajo-centro (invita a usar las flechas) */}
      <div
        className="hero-fade absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ color: "var(--ink)" }}
      >
        <span className="mono text-[10px] opacity-60 tracking-[0.3em]">
          USA LAS FLECHAS
        </span>
        <PixelChevron className="chevron-bounce opacity-60" size={12} />
      </div>
    </section>
  );
}
