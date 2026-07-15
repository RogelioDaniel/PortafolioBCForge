"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Preloader — pantalla lavanda con:
 *  - "LOADING" en display condensado gigante a la izquierda
 *  - barra-píldora con borde donde un círculo negro avanza
 *  - porcentaje grande a la derecha (contador 0→100)
 *  - toggle pill ON/OFF de sonido
 * Al llegar a 100, la pantalla se abre con un wipe vertical.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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
      {
        duration: 0.1,
        onComplete: () => {},
      },
      "+=0.1"
    );
    // Wipe vertical — dos mitades se separan
    tl.call(() => setLeaving(true));
    tl.to(rootRef.current, {
      yPercent: -100,
      duration: reduced ? 0.3 : 0.9,
      ease: "power4.inOut",
      onComplete: () => onDone(),
    });

    return () => {
      tl.kill();
    };
  }, [onDone]);

  const pctWidth = `${pct}%`;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] bg-[var(--bg-light)] flex flex-col justify-between"
      style={{
        transform: leaving ? undefined : undefined,
      }}
      aria-hidden={leaving}
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
        <span className="mono text-[11px] opacity-60">[TU_LOGO]</span>
        <span className="mono text-[11px] opacity-60">PORTAFOLIO · 2025</span>
      </div>

      {/* Centro — LOADING + barra + % */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-8 md:gap-12 px-6 md:px-10">
        <div className="flex-1">
          <h1
            className="display leading-[0.85]"
            style={{ fontSize: "clamp(3.5rem, 14vw, 11rem)" }}
          >
            LOADING
          </h1>
        </div>
        <div className="w-full md:w-[34%] md:pb-3">
          {/* Barra píldora */}
          <div
            className="relative h-9 rounded-full border w-full overflow-hidden"
            style={{ borderColor: "var(--pill-border-strong)" }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Cargando"
          >
            <div
              className="absolute inset-y-0 left-0 bg-[var(--ink)] rounded-full flex items-center justify-end pr-3"
              style={{ width: pctWidth, transition: "width 0.1s linear" }}
            >
              <span
                className="block w-2 h-2 rounded-full"
                style={{ background: "var(--bg-light)" }}
              />
            </div>
          </div>
        </div>
        <div className="md:pb-2">
          <span
            className="display tabular-nums"
            style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
          >
            {String(pct).padStart(3, "0")}
          </span>
        </div>
      </div>

      {/* Bottom — toggle sonido */}
      <div className="relative z-10 flex flex-col items-center pb-8 md:pb-10">
        <p className="mono text-[11px] text-center opacity-70 max-w-[26ch] mb-3">
          PARA UNA EXPERIENCIA MÁS INMERSIVA ACTIVA EL SONIDO
        </p>
        <button
          onClick={() => setSoundOn((s) => !s)}
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
