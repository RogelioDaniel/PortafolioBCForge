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
          gsap.set(w, { autoAlpha: 1, yPercent: 0 });
        } else {
          gsap.set(w, { autoAlpha: 0, yPercent: 70 });
          // Salida completa de la palabra anterior ANTES de entrar la nueva
          // (evita superposición ilegible durante el scrub)
          tl.to(words[i - 1], {
            yPercent: -70,
            autoAlpha: 0,
            duration: 0.42,
            ease: "power3.in",
          });
          tl.to(
            w,
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.42,
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
          {/* Capa de palabras */}
          <div className="relative w-full h-full flex items-center justify-center">
            {KINETIC_WORDS.map((w) => (
              <span
                key={w}
                className="kinetic-word absolute display"
                style={{
                  fontSize: "clamp(2.5rem, 13vw, 11rem)",
                  color: "#f4f4f4",
                  willChange: "transform, opacity",
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
          <div className="absolute top-8 left-6 md:top-12 md:left-12 z-10">
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
