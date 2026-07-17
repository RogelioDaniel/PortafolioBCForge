"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { KINETIC_WORDS } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import { SCREENS, useScreenNav } from "@/lib/use-screen-nav";
import { PixelArrow } from "./PixelIcons";
import { KineticSandTransition } from "./KineticSandTransition";
import AudioTitleWave from "./AudioTitleWave";

type WordTransition = {
  from: number;
  to: number;
  id: number;
};

/**
 * Sección cinética oscura — EXPERIENCIA GUIADA POR BOTONES.
 *
 * P4 (bug "se queda negra"): ya NO usa ScrollTrigger + pin + scrub. Ahora:
 *  - El flip a negro (body.theme-dark) se aplica al MONTAR y se quita al
 *    DESMONTAR de forma garantizada (useEffect cleanup + un flag defensivo).
 *  - Las palabras se intercambian con flechas (las del screen-nav global).
 *    Cada montaje de la pantalla comienza en la palabra 0.
 *  - Las flechas grandes laterales permiten navegar entre palabras.
 *  - Registra sub-nav para que las flechas inferiores se oculten mientras no
 *    estemos en el último slide, guiando al usuario con la flecha derecha.
 */
export default function KineticSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { registerSubNav, notifySubNavChange } = useScreenNav();
  const [activeWord, setActiveWord] = useState(0);
  const [transition, setTransition] = useState<WordTransition | null>(null);
  const wordRef = useRef(0);
  const transitionRef = useRef(false);
  const transitionIdRef = useRef(0);
  const transitionTargetRef = useRef(0);
  const flipAppliedRef = useRef(false);
  const lastWord = KINETIC_WORDS.length - 1;

  // Flip a negro al montar, quitar al desmontar (garantizado)
  useEffect(() => {
    document.body.classList.add("theme-dark");
    flipAppliedRef.current = true;
    return () => {
      document.body.classList.remove("theme-dark");
      flipAppliedRef.current = false;
    };
  }, []);

  // Sincronizar wordRef con activeWord
  useEffect(() => {
    wordRef.current = activeWord;
  }, [activeWord]);

  // Notificar al screen-nav cuando cambia la palabra (actualiza subNavEdges)
  useEffect(() => {
    notifySubNavChange();
  }, [activeWord, notifySubNavChange]);

  const requestWord = useCallback(
    (target: number) => {
      const next = Math.max(0, Math.min(lastWord, target));
      const current = wordRef.current;
      if (next === current || transitionRef.current) return;

      if (reduced) {
        wordRef.current = next;
        setActiveWord(next);
        return;
      }

      transitionRef.current = true;
      const id = transitionIdRef.current + 1;
      transitionIdRef.current = id;
      transitionTargetRef.current = next;
      setTransition({ from: current, to: next, id });
    },
    [lastWord, reduced]
  );

  const finishTransition = useCallback((runId: number) => {
    if (transitionIdRef.current !== runId) return;
    const target = transitionTargetRef.current;
    wordRef.current = target;
    setActiveWord(target);
    setTransition(null);
    transitionRef.current = false;
  }, []);

  useEffect(() => {
    if (!reduced || !transition) return;
    finishTransition(transition.id);
  }, [finishTransition, reduced, transition]);

  const nextWord = useCallback(
    () => requestWord(wordRef.current + 1),
    [requestWord]
  );
  const prevWord = useCallback(
    () => requestWord(wordRef.current - 1),
    [requestWord]
  );

  // Registrar sub-nav: las flechas inferiores navegan palabras dentro
  // de la sección cinética antes de cruzar a la siguiente pantalla.
  useEffect(() => {
    const kineticIndex = SCREENS.findIndex((screen) => screen.id === "kinetic");
    const sub = {
      screenIndex: kineticIndex,
      atStart: () => wordRef.current <= 0,
      atEnd: () => wordRef.current >= lastWord,
      next: () => requestWord(wordRef.current + 1),
      prev: () => requestWord(wordRef.current - 1),
    };
    registerSubNav(sub);
    return () => registerSubNav(sub, true);
  }, [registerSubNav, lastWord, requestWord]);

  const isAtEnd = activeWord >= lastWord;

  return (
    <section
      ref={ref}
      className="kinetic-section relative h-[100svh] w-full flex items-center justify-center overflow-hidden"
      aria-label="Manifiesto cinético"
      aria-busy={transition ? "true" : "false"}
      data-sand-transition={transition ? "true" : undefined}
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
        <span
          className="kinetic-word audio-title absolute z-[1] display whitespace-nowrap"
          data-kinetic-live-word
          aria-hidden="true"
          style={{
            fontSize: "clamp(2.6rem, 13vw, 12rem)",
            color: "#f4f4f4",
            opacity: transition ? 0 : 1,
            transition: transition
              ? "opacity 150ms linear"
              : "opacity 120ms ease-out",
          }}
        >
          <AudioTitleWave variant="bass" />
          {KINETIC_WORDS[activeWord]}
        </span>

        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {KINETIC_WORDS[transition?.to ?? activeWord]}
        </span>

        {transition && (
          <KineticSandTransition
            fromText={KINETIC_WORDS[transition.from]}
            toText={KINETIC_WORDS[transition.to]}
            direction={transition.to > transition.from ? 1 : -1}
            runId={transition.id}
            onComplete={finishTransition}
          />
        )}
      </div>

      {/* Flechas laterales para navegar entre palabras */}
      <button
        onClick={prevWord}
        disabled={activeWord === 0 || Boolean(transition)}
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
        disabled={isAtEnd || Boolean(transition)}
        aria-label="Palabra siguiente"
        className={`project-subnav project-subnav-right disabled:opacity-0 disabled:pointer-events-none${
          !isAtEnd ? " kinetic-arrow-pulse" : ""
        }`}
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
