"use client";

import { useEffect, useRef } from "react";
import type { SceneProps } from "./scene-shared";

/**
 * IceCreamScene — CORTINA CREMOSA que cae y baña las letras "HELADO NUBE".
 *
 * P6: sustituye el cono anterior (horrible) por una cortina de crema fluida
 * que desciende desde arriba con ondas realistas, revelando el texto debajo.
 * Inspirado en el shader de crema de Helado Nube, pero en SVG/CSS puro.
 *
 * Animación con scroll:
 *  - p=0: cortina cubre todo el texto
 *  - p→0.5: la cortina baja descubriendo "HELADO"
 *  - p→1: la cortina termina de bajar y un goteo de crema cuelga
 * La cortina tiene gradiente con vetas, ondas en el borde inferior y brillo.
 */
export default function IceCreamScene({
  activeRef,
  progressRef,
  accent,
  onOpen,
}: SceneProps) {
  const rootRef = useRef<SVGSVGElement>(null);
  const curtainRef = useRef<SVGPathElement>(null);
  const dripRef = useRef<SVGPathElement>(null);
  const drip2Ref = useRef<SVGPathElement>(null);
  const sheenRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = progressRef.current;
      const active = activeRef.current;
      if (active !== 2) return;

      // La cortina baja: en p=0 cubre todo (y=0..440), en p=1 solo queda un charco arriba
      const reveal = Math.min(1, p / 0.85); // 0..1
      // Posición superior del borde inferior de la cortina
      const curtainBottomY = reveal * 440; // baja de 0 a 440

      // Onda sinusoidal en el borde inferior de la cortina (realismo)
      const waveAmp = 14;
      const waveFreq = 0.035;
      const t = performance.now() / 1000;
      let pathD = `M0 0 L360 0 L360 ${curtainBottomY} `;
      // Borde inferior con ondas
      for (let x = 360; x >= 0; x -= 8) {
        const wave = Math.sin(x * waveFreq + t * 1.5) * waveAmp;
        const y = curtainBottomY + wave;
        pathD += `L${x} ${y.toFixed(1)} `;
      }
      pathD += "Z";
      if (curtainRef.current) {
        curtainRef.current.setAttribute("d", pathD);
        curtainRef.current.style.opacity = reveal < 1 ? "1" : "0.15";
      }

      // Goteo central que cuelga cuando la cortina ya bajó bastante
      const dripShow = Math.max(0, (p - 0.4) / 0.6);
      const dripLen = dripShow * 70;
      if (dripRef.current) {
        dripRef.current.setAttribute(
          "d",
          `M175 ${curtainBottomY - 5} Q170 ${curtainBottomY + dripLen * 0.5} 178 ${curtainBottomY + dripLen} Q183 ${curtainBottomY + dripLen + 6} 172 ${curtainBottomY + dripLen + 12} Q162 ${curtainBottomY + dripLen + 6} 168 ${curtainBottomY + dripLen} Z`
        );
        dripRef.current.style.opacity = dripShow.toFixed(2);
      }
      if (drip2Ref.current) {
        const dripLen2 = dripShow * 50;
        drip2Ref.current.setAttribute(
          "d",
          `M205 ${curtainBottomY - 5} Q201 ${curtainBottomY + dripLen2 * 0.5} 207 ${curtainBottomY + dripLen2} Q211 ${curtainBottomY + dripLen2 + 4} 203 ${curtainBottomY + dripLen2 + 9} Q196 ${curtainBottomY + dripLen2 + 4} 200 ${curtainBottomY + dripLen2} Z`
        );
        drip2Ref.current.style.opacity = (dripShow * 0.7).toFixed(2);
      }

      // Brillo/sheen que se desliza (realismo de líquido)
      if (sheenRef.current) {
        const sheenY = (t * 30) % 440;
        sheenRef.current.setAttribute("y", sheenY.toFixed(1));
        sheenRef.current.style.opacity = (reveal < 0.9 ? 0.25 : 0).toFixed(2);
      }
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [activeRef, progressRef]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 360 440"
      className="scene-svg icecream-scene h-auto w-full cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label="Helado Nube — cortina cremosa, click para abrir el sitio"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ maxWidth: "min(75vw, 420px)" }}
    >
      <defs>
        {/* Gradiente de crema con vetas (rosa/fresa de Helado Nube) */}
        <linearGradient id="cream-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbeae0" />
          <stop offset="30%" stopColor="#f8d0d8" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="80%" stopColor="#f5e6c8" />
          <stop offset="100%" stopColor="#e8b8a0" />
        </linearGradient>
        {/* Brillo especular */}
        <linearGradient id="cream-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Vetas más oscuras para realismo */}
        <linearGradient id="cream-streak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="40%" stopColor="#d99890" stopOpacity="0.3" />
          <stop offset="60%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Capa clickable */}
      <rect x="0" y="0" width="360" height="440" fill="transparent" aria-hidden="true" />

      {/* Glow cálido detrás */}
      <ellipse cx="180" cy="220" rx="170" ry="120" fill={accent} opacity="0.08" />

      {/* TEXTO "HELADO NUBE" — debajo de la cortina (se va revelando) */}
      <g className="icecream-text" textAnchor="middle">
        <text
          x="180"
          y="195"
          fontFamily="var(--font-archivo), sans-serif"
          fontSize="58"
          fontWeight="900"
          fill="var(--ink)"
          letterSpacing="-2"
          style={{ fontStretch: "85%" }}
        >
          HELADO
        </text>
        <text
          x="180"
          y="265"
          fontFamily="var(--font-caveat), cursive"
          fontSize="72"
          fontWeight="700"
          fill={accent}
        >
          Nube
        </text>
        {/* Subtítulo editorial */}
        <text
          x="180"
          y="305"
          fontFamily="var(--font-space-mono), monospace"
          fontSize="10"
          fill="var(--ink)"
          opacity="0.6"
          letterSpacing="3"
        >
          EL LUJO SE SIRVE DESPACIO
        </text>
      </g>

      {/* Vetas de crema (decorativas, fijas) */}
      <rect x="0" y="0" width="360" height="440" fill="url(#cream-streak)" opacity="0.5" />

      {/* Brillo que se desliza */}
      <rect
        ref={sheenRef}
        x="0"
        y="0"
        width="360"
        height="40"
        fill="url(#cream-sheen)"
        opacity="0"
      />

      {/* CORTINA CREMOSA — la animación principal (path dinámico) */}
      <path
        ref={curtainRef}
        d="M0 0 L360 0 L360 0 L0 0 Z"
        fill="url(#cream-grad)"
        opacity="1"
      />

      {/* Gotas que cuelgan */}
      <path ref={dripRef} d="M0 0 Z" fill="url(#cream-grad)" opacity="0" />
      <path ref={drip2Ref} d="M0 0 Z" fill="url(#cream-grad)" opacity="0" />
    </svg>
  );
}
