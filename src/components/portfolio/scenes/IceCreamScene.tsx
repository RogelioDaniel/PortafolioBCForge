"use client";

import { useEffect, useRef } from "react";
import type { SceneProps } from "./scene-shared";

/**
 * IceCreamScene — cono con bolas de helado que se DERRITEN al avanzar el scroll.
 * Inspirado en Helado Nube: tono editorial, crema fluyente, paleta cálida.
 *
 * Animaciones:
 *  - Idle: las bolas "respiran" sutilmente (idle wobble)
 *  - Scroll: goteo crece, las bolas se achatan ligeramente y gotas caen
 *  - Cortina de crema sutil en el fondo al final del progreso
 */
export default function IceCreamScene({
  activeRef,
  progressRef,
  accent,
  onOpen,
}: SceneProps) {
  const rootRef = useRef<SVGSVGElement>(null);
  const scoop1Ref = useRef<SVGGElement>(null); // bola superior
  const scoop2Ref = useRef<SVGGElement>(null); // bola media
  const dripRef = useRef<SVGPathElement>(null); // goteo del helado
  const dropsRef = useRef<SVGGElement>(null); // gotas que caen
  const creamCurtainRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = progressRef.current;
      const active = activeRef.current;
      if (active !== 2) return;

      // Achatamiento y "derretimiento" de las bolas
      const meltT = Math.min(1, p / 0.8);
      // Bola superior: se aplasta un poco y se desliza abajo
      if (scoop1Ref.current) {
        const scaleY = 1 - meltT * 0.18;
        const translateY = meltT * 12;
        scoop1Ref.current.style.transform = `translateY(${translateY}px) scaleY(${scaleY})`;
        scoop1Ref.current.style.transformOrigin = "center bottom";
      }
      // Bola media
      if (scoop2Ref.current) {
        const scaleY = 1 - meltT * 0.12;
        scoop2Ref.current.style.transform = `scaleY(${scaleY})`;
        scoop2Ref.current.style.transformOrigin = "center bottom";
      }

      // Goteo: la longitud del drip crece con el progreso
      if (dripRef.current) {
        const dripLen = meltT * 80;
        dripRef.current.setAttribute(
          "d",
          `M170 110 Q165 ${110 + dripLen * 0.5} 168 ${110 + dripLen} Q172 ${115 + dripLen} 168 ${120 + dripLen} Z`
        );
        dripRef.current.style.opacity = (0.6 + meltT * 0.4).toFixed(2);
      }

      // Gotas que caen
      if (dropsRef.current) {
        const drops = dropsRef.current.querySelectorAll<SVGCircleElement>("circle");
        drops.forEach((drop, i) => {
          const delay = i * 0.15;
          const localP = Math.max(0, p - delay);
          const fallT = Math.min(1, localP / 0.3);
          const y = 110 + fallT * 130;
          const x = 150 + i * 40 + Math.sin(fallT * Math.PI) * 10;
          drop.setAttribute("cy", y.toFixed(1));
          drop.setAttribute("cx", x.toFixed(1));
          drop.style.opacity = (fallT * (1 - fallT) * 4).toFixed(2); // fade in/out
        });
      }

      // Cortina de crema al final (efecto Helado Nube)
      if (creamCurtainRef.current) {
        const curtainT = Math.max(0, (p - 0.7) / 0.3);
        creamCurtainRef.current.style.opacity = curtainT.toFixed(2);
        const h = 20 + curtainT * 280;
        creamCurtainRef.current.setAttribute("height", h.toFixed(0));
      }
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [activeRef, progressRef]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 360 440"
      className="scene-svg icecream-scene h-auto w-full"
      role="img"
      aria-label="Helado que se derrite al avanzar el scroll"
      style={{ maxWidth: "320px" }}
    >
      <defs>
        <linearGradient id="scoop-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8d0d8" />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <linearGradient id="cone-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8b06a" />
          <stop offset="100%" stopColor="#b8762e" />
        </linearGradient>
      </defs>

      {/* Capa clickable */}
      <rect
        x="0"
        y="0"
        width="360"
        height="440"
        fill="transparent"
        style={{ cursor: "pointer" }}
        onClick={onOpen}
        aria-hidden="true"
      />

      {/* Sombra base */}
      <ellipse cx="180" cy="425" rx="90" ry="12" fill="var(--ink)" opacity="0.1" />

      {/* Cono */}
      <g className="icecream-cone">
        <path
          d="M120 240 L180 420 L240 240 Z"
          fill="url(#cone-grad)"
          stroke="var(--ink)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Patrón de waffle */}
        <g stroke="#8a5520" strokeWidth="1.5" opacity="0.5">
          <line x1="140" y1="280" x2="220" y2="280" />
          <line x1="148" y1="310" x2="212" y2="310" />
          <line x1="156" y1="340" x2="204" y2="340" />
          <line x1="164" y1="370" x2="196" y2="370" />
          {/* Diagonales */}
          <line x1="120" y1="240" x2="180" y2="320" />
          <line x1="150" y1="240" x2="210" y2="320" />
          <line x1="180" y1="240" x2="240" y2="320" />
          <line x1="210" y1="240" x2="150" y2="320" />
          <line x1="240" y1="240" x2="180" y2="320" />
        </g>
      </g>

      {/* Bola media */}
      <g ref={scoop2Ref} className="icecream-scoop">
        <circle cx="180" cy="200" r="70" fill="#f5e6c8" stroke="var(--ink)" strokeWidth="3" />
        <ellipse cx="160" cy="185" rx="20" ry="12" fill="#fff" opacity="0.5" />
      </g>

      {/* Bola superior (sabor: fresa → color de acento) */}
      <g ref={scoop1Ref} className="icecream-scoop">
        <circle cx="180" cy="120" r="60" fill="url(#scoop-grad)" stroke="var(--ink)" strokeWidth="3" />
        <ellipse cx="160" cy="105" rx="18" ry="10" fill="#fff" opacity="0.55" />
        {/* Cerezita */}
        <circle cx="180" cy="58" r="8" fill="#c41e3a" stroke="var(--ink)" strokeWidth="2" />
        <path d="M180 50 Q186 38 196 36" fill="none" stroke="#2d8a3e" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Goteo del helado */}
      <path
        ref={dripRef}
        d="M170 110 Q165 110 168 110 Z"
        fill={accent}
        stroke="var(--ink)"
        strokeWidth="1.5"
        opacity="0"
      />

      {/* Gotas que caen */}
      <g ref={dropsRef}>
        <circle cx="150" cy="110" r="7" fill={accent} stroke="var(--ink)" strokeWidth="1.5" opacity="0" />
        <circle cx="190" cy="110" r="6" fill={accent} stroke="var(--ink)" strokeWidth="1.5" opacity="0" />
        <circle cx="230" cy="110" r="8" fill={accent} stroke="var(--ink)" strokeWidth="1.5" opacity="0" />
        <circle cx="170" cy="110" r="5" fill="#f5e6c8" stroke="var(--ink)" strokeWidth="1.5" opacity="0" />
      </g>

      {/* Cortina de crema al final del scroll */}
      <rect
        ref={creamCurtainRef}
        x="0"
        y="0"
        width="360"
        height="0"
        fill="#f8d0d8"
        opacity="0"
        style={{ transition: "none" }}
      />
    </svg>
  );
}
