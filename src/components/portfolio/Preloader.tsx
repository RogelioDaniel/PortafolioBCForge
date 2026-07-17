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
export default function Preloader({
  ready,
  onDone,
}: {
  ready: boolean;
  onDone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(ready);
  const [pct, setPct] = useState(0);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Sincroniza el estado del toggle con el ambient sound
    const ambient = getAmbient();
    const unsub = ambient?.subscribe((on) => setSoundOn(on));

    let cancelled = false;
    let onWindowLoad: (() => void) | null = null;
    let minimumTimer = 0;
    let failsafeTimer = 0;
    let readyFrame = 0;
    let finishTween: gsap.core.Tween | null = null;
    let exitTween: gsap.core.Tween | null = null;

    // El contador avanza hasta 88 mientras espera las señales reales de
    // documento + fuentes. Sólo llega a 100 cuando la interfaz está lista.
    const obj = { v: 0 };
    const approachTween = gsap.to(obj, {
      v: 88,
      duration: reduced ? 0.15 : 1.35,
      ease: "power2.out",
      onUpdate: () => setPct(Math.round(obj.v)),
    });

    const windowReady = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
        return;
      }
      onWindowLoad = () => resolve();
      window.addEventListener("load", onWindowLoad, { once: true });
    });
    const fontsReady = document.fonts?.ready.then(() => undefined) ??
      Promise.resolve();
    const interfaceReady = new Promise<void>((resolve) => {
      const check = () => {
        if (cancelled) return;
        if (readyRef.current) {
          resolve();
          return;
        }
        readyFrame = window.requestAnimationFrame(check);
      };
      check();
    });
    const minimumVisible = new Promise<void>((resolve) => {
      minimumTimer = window.setTimeout(resolve, reduced ? 80 : 650);
    });
    const failsafe = new Promise<void>((resolve) => {
      failsafeTimer = window.setTimeout(resolve, reduced ? 180 : 2600);
    });

    void Promise.all([
      minimumVisible,
      Promise.race([
        Promise.all([windowReady, fontsReady, interfaceReady]),
        failsafe,
      ]),
    ]).then(() => {
      if (cancelled) return;
      approachTween.kill();
      finishTween = gsap.to(obj, {
        v: 100,
        duration: reduced ? 0.12 : 0.42,
        ease: "power2.out",
        onUpdate: () => setPct(Math.round(obj.v)),
        onComplete: () => {
          setPct(100);
          exitTween = gsap.to(rootRef.current, {
            yPercent: -100,
            duration: reduced ? 0.22 : 0.62,
            ease: "power4.inOut",
            onComplete: onDone,
          });
        },
      });
    });

    return () => {
      cancelled = true;
      approachTween.kill();
      finishTween?.kill();
      exitTween?.kill();
      window.clearTimeout(minimumTimer);
      window.clearTimeout(failsafeTimer);
      window.cancelAnimationFrame(readyFrame);
      if (onWindowLoad) {
        window.removeEventListener("load", onWindowLoad);
      }
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

      {/* Centro — lectura estable arriba y pista completa debajo. El porcentaje
          reserva siempre tres dígitos para no redimensionar la barra. */}
      <div className="relative z-10 w-full px-6 md:px-10">
        <div className="flex items-end justify-between gap-4 md:gap-10">
          <h1
            className="display display--heavy leading-[0.82] min-w-0"
            style={{ fontSize: "clamp(3.2rem, 11vw, 11rem)" }}
          >
            LOADING
          </h1>
          <div className="shrink-0 flex items-start justify-end">
            <span
              className="display display--heavy tabular-nums leading-[0.82] inline-block w-[3ch] text-right"
              style={{ fontSize: "clamp(2rem, 9vw, 11rem)" }}
            >
              {pct}
            </span>
            <span
              className="display display--heavy leading-none mt-1 md:mt-3"
              style={{ fontSize: "clamp(1.1rem, 2.8vw, 3rem)" }}
            >
              %
            </span>
          </div>
        </div>

        {/* La posición y el porcentaje salen del mismo valor; no hay un tween
            separado que pueda adelantar o atrasar la bola. */}
        <div
          className="relative mt-6 md:mt-8 h-14 md:h-20 rounded-full border w-full"
          style={{ borderColor: "var(--pill-border-strong)" }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Cargando"
        >
          <div className="absolute inset-2 md:inset-2.5">
            <span
              className="absolute top-1/2 h-full aspect-square rounded-full bg-[var(--ink)] block"
              style={{
                left: `${pct}%`,
                transform: `translate3d(-${pct}%, -50%, 0)`,
                willChange: "left, transform",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom — toggle sonido arriba, texto debajo (orden de la referencia Labs) */}
      <div className="relative z-10 flex flex-col items-center gap-3 pb-8 md:pb-10">
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
        <p className="mono text-[11px] leading-relaxed text-center opacity-70 max-w-[40ch]">
          PARA UNA EXPERIENCIA MÁS INMERSIVA
          <br />
          ACTIVA EL SONIDO
        </p>
      </div>
    </div>
  );
}
