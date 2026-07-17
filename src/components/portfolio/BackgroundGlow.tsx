"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import { getAmbient } from "@/lib/ambient-sound";

const SPARKS = [
  { x: 9, y: 20, strength: 0.72 },
  { x: 20, y: 78, strength: 0.38 },
  { x: 31, y: 15, strength: 0.56 },
  { x: 43, y: 88, strength: 0.8 },
  { x: 58, y: 10, strength: 0.46 },
  { x: 69, y: 74, strength: 0.66 },
  { x: 81, y: 28, strength: 0.94 },
  { x: 91, y: 65, strength: 0.52 },
] as const;

/**
 * BackgroundGlow — resplandor radial cálido durazno/rosa que flota lentamente
 * sobre el fondo lavanda (posición animada con GSAP, ~24s loop, muy sutil).
 * El fondo NUNCA es plano: siempre lavanda + glow en movimiento.
 * Usa CSS custom property --glow-x/--glow-y para mover el centro del radial.
 */
export default function BackgroundGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    // Estado inicial
    const ctx = gsap.context(() => {
      const state = { x: 28, y: 22 };
      gsap.to(state, {
        x: 72,
        y: 70,
        duration: 12,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          document.documentElement.style.setProperty(
            "--glow-x",
            `${state.x}%`
          );
          document.documentElement.style.setProperty(
            "--glow-y",
            `${state.y}%`
          );
        },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;

    const unsubscribe = getAmbient()?.subscribeAnalysis(
      ({ bass, mid, treble, energy }) => {
        element.style.setProperty("--audio-bass", bass.toFixed(3));
        element.style.setProperty("--audio-mid", mid.toFixed(3));
        element.style.setProperty("--audio-treble", treble.toFixed(3));
        element.style.setProperty("--audio-energy", energy.toFixed(3));
        element.dataset.audioActive = energy > 0.025 ? "true" : "false";
      }
    );

    return () => {
      unsubscribe?.();
      element.style.removeProperty("--audio-bass");
      element.style.removeProperty("--audio-mid");
      element.style.removeProperty("--audio-treble");
      element.style.removeProperty("--audio-energy");
      delete element.dataset.audioActive;
    };
  }, [reduced]);

  return (
    <div ref={ref} className="bg-glow" aria-hidden="true">
      <div className="audio-rhythm">
        <span className="audio-wash" />
        <span className="audio-rail audio-rail--one" />
        <span className="audio-rail audio-rail--two" />
        <span className="audio-rail audio-rail--three" />
        {SPARKS.map((spark) => (
          <span
            key={`${spark.x}-${spark.y}`}
            className="audio-spark"
            style={
              {
                left: `${spark.x}%`,
                top: `${spark.y}%`,
                "--spark-strength": spark.strength,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
