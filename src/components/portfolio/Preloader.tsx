"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { getAmbient } from "@/lib/ambient-sound";
import { SITE } from "@/lib/portfolio-content";

/**
 * Preloader — pantalla lavanda con:
 *  - "LOADING" en display condensado gigante a la izquierda
 *  - barra-píldora con borde donde un círculo negro avanza
 *  - porcentaje grande a la derecha (contador 0→100)
 *  - toggle pill ON/OFF de sonido (conectado a Web Audio API)
 * Al llegar a 100, la pantalla se abre con un wipe vertical.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Sincroniza el estado del toggle con el ambient sound
    const ambient = getAmbient();
    const unsub = ambient?.subscribe((on) => setSoundOn(on));

    // Contador 0 → 100
    const obj = { v: 0 };
    const tl = gsap.timeline();
    tl.to(obj, {
      v: 100,
      duration: reduced ? 0.3 : 2.2,
      ease: "power1.inOut",
      onUpdate: () => setPct(Math.round(obj.v)),
    });
    tl.to(
      rootRef.current,
      { duration: 0.1, onComplete: () => {} },
      "+=0.1"
    );
    tl.call(() => setLeaving(true));
    tl.to(rootRef.current, {
      yPercent: -100,
      duration: reduced ? 0.3 : 0.9,
      ease: "power4.inOut",
      onComplete: () => onDone(),
    });

    return () => {
      tl.kill();
      unsub?.();
    };
  }, [onDone]);

  const toggleSound = () => {
    // Requiere gesto del usuario para iniciar AudioContext
    getAmbient()?.toggle();
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] bg-[var(--bg-light)] flex flex-col justify-between"
      aria-hidden={false}
    >
      {/* Glow sutil de fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 40%, var(--bg-glow) 0%, transparent 45%)",
          opacity: 0.5,
        }}
      />

      {/* Top — logo mini */}
      <div className="relative z-10 flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8">
        <span className="mono text-[11px] opacity-60">{SITE.logo}</span>
        <span className="mono text-[11px] opacity-60">
          PORTAFOLIO · {new Date().getFullYear()}
        </span>
      </div>

      {/* Centro — LOADING + barra con círculo deslizante + % (estilo Labs) */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 md:gap-10 px-6 md:px-10">
        <h1
          className="display display--heavy leading-[0.85] shrink-0"
          style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
        >
          LOADING
        </h1>
        {/* Barra píldora outline: el círculo negro viaja de izquierda a derecha */}
        <div
          className="relative h-12 md:h-16 rounded-full border w-full flex-1"
          style={{ borderColor: "var(--pill-border-strong)" }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Cargando"
        >
          <span
            className="absolute top-1/2 -translate-y-1/2 rounded-full bg-[var(--ink)] block w-8 h-8 md:w-11 md:h-11"
            style={{
              left: `calc(0.5rem + (100% - 1rem - 2.75rem) * ${pct / 100})`,
              transition: "left 0.1s linear",
            }}
          />
        </div>
        <div className="shrink-0 flex items-start">
          <span
            className="display display--heavy tabular-nums leading-none"
            style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
          >
            {pct}
          </span>
          <span
            className="display display--heavy leading-none mt-1 md:mt-2"
            style={{ fontSize: "clamp(1.2rem, 3vw, 2.4rem)" }}
          >
            %
          </span>
        </div>
      </div>

      {/* Bottom — toggle sonido */}
      <div className="relative z-10 flex flex-col items-center pb-8 md:pb-10">
        <p className="mono text-[11px] text-center opacity-70 max-w-[26ch] mb-3">
          PARA UNA EXPERIENCIA MÁS INMERSIVA ACTIVA EL SONIDO
        </p>
        <button
          onClick={toggleSound}
          className="pill"
          aria-pressed={soundOn}
          aria-label={soundOn ? "Desactivar sonido" : "Activar sonido"}
        >
          <span>SONIDO</span>
          <span className="inline-flex items-center">
            <span
              className={`w-7 h-3 rounded-full relative transition-colors ${
                soundOn ? "bg-[var(--ink)]" : "bg-transparent border"
              }`}
              style={{ borderColor: "var(--pill-border)" }}
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-all ${
                  soundOn
                    ? "left-4 bg-[var(--bg-light)]"
                    : "left-0.5 bg-[var(--ink)]"
                }`}
              />
            </span>
            <span className="ml-2 w-7">{soundOn ? "ON" : "OFF"}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
