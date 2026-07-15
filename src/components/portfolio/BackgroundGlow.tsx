"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

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

  return <div ref={ref} className="bg-glow" aria-hidden="true" />;
}
