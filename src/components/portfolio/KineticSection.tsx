"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KINETIC_WORDS } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import { PixelArrow } from "./PixelIcons";

/**
 * Sección cinética oscura (theme flip):
 *  - El fondo de TODA la página funde a negro con ScrollTrigger (body.theme-dark)
 *  - Sección pinneada donde palabras blancas gigantes se intercambian al ritmo del scroll
 *  - Un cursor-flecha voxel flota en la esquina
 *  - Al terminar, el fondo vuelve a lavanda
 */
export default function KineticSection() {
  const ref = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) return;

      const words = gsap.utils.toArray<HTMLElement>(".kinetic-word");

      // Pin + timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: () => `+=${words.length * 80}%`,
          pin: pinRef.current,
          scrub: 1,
        },
      });

      // Theme flip al entrar/salir
      const flipOn = () =>
        document.body.classList.add("theme-dark");
      const flipOff = () =>
        document.body.classList.remove("theme-dark");

      words.forEach((w, i) => {
        if (i === 0) {
          tl.call(flipOn, [], 0);
          gsap.set(w, { autoAlpha: 1, yPercent: 0, filter: "blur(0px)" });
        } else {
          gsap.set(w, { autoAlpha: 0, yPercent: 70, filter: "blur(12px)" });
          // Salida completa de la palabra anterior ANTES de entrar la nueva
          tl.to(words[i - 1], {
            yPercent: -70,
            autoAlpha: 0,
            filter: "blur(12px)",
            duration: 0.42,
            ease: "power3.in",
          });
          tl.to(
            w,
            {
              yPercent: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.5,
              ease: "power3.out",
            },
            ">-0.05"
          );
        }
      });
      // Al salir, vuelve a lavanda
      tl.call(flipOff, [], "+=0.1");

      // ScrollTrigger para flip off también al salir por arriba
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onLeaveBack: flipOff,
      });
    }, ref);
    return () => {
      ctx.revert();
      document.body.classList.remove("theme-dark");
    };
  }, [reduced]);

  return (
    <section ref={ref} className="relative" aria-label="Manifiesto cinético">
      <div style={{ height: reduced ? "auto" : `${KINETIC_WORDS.length * 80}vh` }}>
        <div
          ref={pinRef}
          className="sticky top-0 h-[100svh] w-full flex items-center justify-center overflow-hidden"
        >
          {/* Glow radial pulsante (fancy) */}
          <div
            aria-hidden="true"
            className="kinetic-glow absolute inset-0 pointer-events-none"
          />
          {/* Líneas HUD decorativas */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none kinetic-hud"
          >
            {/* Esquinas tipo bracket */}
            <span className="absolute top-8 left-6 md:top-12 md:left-12 w-6 h-6 border-l border-t border-white/30" />
            <span className="absolute top-8 right-6 md:top-12 md:right-12 w-6 h-6 border-r border-t border-white/30" />
            <span className="absolute bottom-8 left-6 md:bottom-12 md:left-12 w-6 h-6 border-l border-b border-white/30" />
            <span className="absolute bottom-8 right-6 md:bottom-12 md:right-12 w-6 h-6 border-r border-b border-white/30" />
            {/* Línea horizontal tenue que cruza */}
            <span className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
            {/* Dots indicadores */}
            <span className="absolute top-1/2 left-6 w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="absolute top-1/2 right-6 w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>

          {/* Capa de palabras */}
          <div className="relative w-full h-full flex items-center justify-center">
            {KINETIC_WORDS.map((w) => (
              <span
                key={w}
                className="kinetic-word absolute display whitespace-nowrap"
                style={{
                  fontSize: "clamp(2.6rem, 14.5vw, 13rem)",
                  color: "#f4f4f4",
                  textShadow: "0 0 40px rgba(243,216,205,0.25)",
                  willChange: "transform, opacity, filter",
                }}
              >
                {w}
              </span>
            ))}
          </div>

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
              [ KINETIC · MOTION ]
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
