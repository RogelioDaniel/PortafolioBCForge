"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { KINETIC_WORDS } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import { useScreenNav } from "@/lib/use-screen-nav";
import { PixelArrow } from "./PixelIcons";

/**
 * Sección cinética oscura — EXPERIENCIA GUIADA POR BOTONES.
 *
 * P4 (bug "se queda negra"): ya NO usa ScrollTrigger + pin + scrub. Ahora:
 *  - El flip a negro (body.theme-dark) se aplica al MONTAR y se quita al
 *    DESMONTAR de forma garantizada (useEffect cleanup + un flag defensivo).
 *  - Las palabras se intercambian con flechas (las del screen-nav global).
 *    Al detectar replayTick (entrar a esta pantalla) se resetea a la palabra 0.
 *  - Las flechas grandes laterales permiten navegar entre palabras.
 */
export default function KineticSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { replayTick } = useScreenNav();
  const [activeWord, setActiveWord] = useState(0);
  const flipAppliedRef = useRef(false);

  // Flip a negro al montar, quitar al desmontar (garantizado)
  useEffect(() => {
    document.body.classList.add("theme-dark");
    flipAppliedRef.current = true;
    return () => {
      document.body.classList.remove("theme-dark");
      flipAppliedRef.current = false;
    };
  }, []);

  // Resetear a la primera palabra al entrar a la pantalla
  useEffect(() => {
    setActiveWord(0);
  }, [replayTick]);

  // Animar la palabra activa al cambiar
  useEffect(() => {
    if (reduced) return;
    const words = ref.current?.querySelectorAll<HTMLElement>(".kinetic-word");
    if (!words) return;
    words.forEach((w, i) => {
      if (i === activeWord) {
        gsap.fromTo(
          w,
          { yPercent: 70, autoAlpha: 0, filter: "blur(12px)" },
          {
            yPercent: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.55,
            ease: "power3.out",
          }
        );
      } else {
        gsap.to(w, {
          yPercent: i < activeWord ? -70 : 70,
          autoAlpha: 0,
          filter: "blur(12px)",
          duration: 0.4,
          ease: "power3.in",
        });
      }
    });
  }, [activeWord, reduced]);

  const nextWord = () =>
    setActiveWord((w) => Math.min(KINETIC_WORDS.length - 1, w + 1));
  const prevWord = () => setActiveWord((w) => Math.max(0, w - 1));

  return (
    <section
      ref={ref}
      className="kinetic-section relative h-[100svh] w-full flex items-center justify-center overflow-hidden"
      aria-label="Manifiesto cinético"
    >
      {/* Glow radial pulsante (fancy) */}
      <div
        aria-hidden="true"
        className="kinetic-glow absolute inset-0 pointer-events-none"
      />
      {/* Líneas HUD decorativas */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <span className="absolute top-8 left-6 md:top-12 md:left-12 w-6 h-6 border-l border-t border-white/30" />
        <span className="absolute top-8 right-6 md:top-12 md:right-12 w-6 h-6 border-r border-t border-white/30" />
        <span className="absolute bottom-8 left-6 md:bottom-12 md:left-12 w-6 h-6 border-l border-b border-white/30" />
        <span className="absolute bottom-8 right-6 md:bottom-12 md:right-12 w-6 h-6 border-r border-b border-white/30" />
        <span className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
        <span className="absolute top-1/2 left-6 w-1.5 h-1.5 rounded-full bg-white/40" />
        <span className="absolute top-1/2 right-6 w-1.5 h-1.5 rounded-full bg-white/40" />
      </div>

      {/* Capa de palabras */}
      <div className="relative w-full h-full flex items-center justify-center">
        {KINETIC_WORDS.map((w, i) => (
          <span
            key={w}
            className="kinetic-word absolute display whitespace-nowrap"
            style={{
              fontSize: "clamp(2.6rem, 13vw, 12rem)",
              color: "#f4f4f4",
              textShadow: "0 0 40px rgba(243,216,205,0.25)",
              visibility: i === activeWord ? "visible" : "hidden",
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Flechas laterales para navegar entre palabras */}
      <button
        onClick={prevWord}
        disabled={activeWord === 0}
        aria-label="Palabra anterior"
        className="project-subnav project-subnav-left disabled:opacity-0 disabled:pointer-events-none"
        style={{
          borderColor: "rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.06)",
          color: "#f4f4f4",
        }}
      >
        <svg viewBox="0 0 14 14" shapeRendering="crispEdges" className="w-full h-full" style={{ color: "#f4f4f4" }} aria-hidden="true">
          <rect x="5" y="6" width="9" height="2" fill="currentColor" />
          <rect x="3" y="4" width="2" height="2" fill="currentColor" />
          <rect x="1" y="2" width="2" height="2" fill="currentColor" />
          <rect x="3" y="8" width="2" height="2" fill="currentColor" />
          <rect x="1" y="10" width="2" height="2" fill="currentColor" />
        </svg>
      </button>
      <button
        onClick={nextWord}
        disabled={activeWord === KINETIC_WORDS.length - 1}
        aria-label="Palabra siguiente"
        className="project-subnav project-subnav-right disabled:opacity-0 disabled:pointer-events-none"
        style={{
          borderColor: "rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.06)",
          color: "#f4f4f4",
        }}
      >
        <svg viewBox="0 0 14 14" shapeRendering="crispEdges" className="w-full h-full" style={{ color: "#f4f4f4" }} aria-hidden="true">
          <rect x="0" y="6" width="9" height="2" fill="currentColor" />
          <rect x="9" y="4" width="2" height="2" fill="currentColor" />
          <rect x="11" y="2" width="2" height="2" fill="currentColor" />
          <rect x="9" y="8" width="2" height="2" fill="currentColor" />
          <rect x="11" y="10" width="2" height="2" fill="currentColor" />
        </svg>
      </button>

      {/* Cursor-flecha voxel flotante */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-10">
        <div className="spin-slow text-white opacity-60">
          <PixelArrow size={48} />
        </div>
      </div>

      {/* Etiqueta esquina */}
      <div className="absolute top-8 left-6 md:top-12 md:left-12 z-10 pl-8">
        <span
          className="mono text-[11px]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          [ KINETIC · MOTION · {String(activeWord + 1).padStart(2, "0")}/
          {String(KINETIC_WORDS.length).padStart(2, "0")} ]
        </span>
      </div>
    </section>
  );
}
