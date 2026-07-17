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
 *  - p=0: sin cortina, texto visible
 *  - p→0.5: la cortina baja cubriendo "HELADO"
 *  - p→1: la cortina baja completamente, luego se disuelve suavemente
 *    dejando un residuo cremoso en la parte inferior con gotas elegantes.
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
  const residueRef = useRef<SVGPathElement>(null);
  const dripRef = useRef<SVGPathElement>(null);
  const drip2Ref = useRef<SVGPathElement>(null);
  const drip3Ref = useRef<SVGPathElement>(null);
  const sheenRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const screenSlot = root?.closest<HTMLElement>(".screen-slot");
    let raf = 0;
    let lastFrameAt = 0;
    const animate = (timestamp: number) => {
      raf = requestAnimationFrame(animate);
      if (
        document.hidden ||
        screenSlot?.dataset.phase === "exit" ||
        timestamp - lastFrameAt < 1000 / 30
      ) {
        return;
      }
      lastFrameAt = timestamp;

      const p = progressRef.current;
      const active = activeRef.current;
      if (active !== 2) return;

      const t = performance.now() / 1000;

      // La cortina baja: en p=0 no hay cortina, en p=0.85 llega abajo
      const reveal = Math.min(1, p / 0.85); // 0..1
      const curtainBottomY = reveal * 440;

      // Fase de disolución suave (p > 0.85): la cortina se funde elegantemente
      const dissolveStart = 0.82;
      const dissolveEnd = 1.0;
      const dissolveT = p < dissolveStart ? 0 : Math.min(1, (p - dissolveStart) / (dissolveEnd - dissolveStart));
      // Suavizar con ease-out cuadrático
      const dissolveEased = 1 - (1 - dissolveT) * (1 - dissolveT);

      // Onda sinusoidal en el borde inferior de la cortina (realismo)
      const waveAmp = 14 + dissolveEased * 8; // ondas más amplias al disolverse
      const waveFreq = 0.035;
      const waveSpeed = 1.5 + dissolveEased * 0.5;
      let pathD = `M0 0 L360 0 L360 ${curtainBottomY} `;
      for (let x = 360; x >= 0; x -= 8) {
        const wave = Math.sin(x * waveFreq + t * waveSpeed) * waveAmp;
        const y = curtainBottomY + wave;
        pathD += `L${x} ${y.toFixed(1)} `;
      }
      pathD += "Z";
      if (curtainRef.current) {
        curtainRef.current.setAttribute("d", pathD);
        // Transición suave de opacidad: de 1.0 a 0.0 durante la disolución
        const curtainOp = 1 - dissolveEased * 1.0;
        curtainRef.current.style.opacity = curtainOp.toFixed(3);
      }

      // Residuo cremoso en la parte inferior — aparece cuando la cortina se disuelve
      if (residueRef.current) {
        const residueShow = dissolveEased;
        const rY = 400; // posición del residuo (cerca del fondo)
        const rAmp = 6 + Math.sin(t * 0.8) * 3;
        let rPath = `M0 440 L0 ${rY} `;
        for (let x = 0; x <= 360; x += 10) {
          const wave = Math.sin(x * 0.04 + t * 1.2) * rAmp;
          rPath += `L${x} ${(rY + wave).toFixed(1)} `;
        }
        rPath += `L360 440 Z`;
        residueRef.current.setAttribute("d", rPath);
        residueRef.current.style.opacity = (residueShow * 0.35).toFixed(3);
      }

      // Goteo central que cuelga cuando la cortina ya bajó bastante
      const dripShow = Math.max(0, (p - 0.4) / 0.6);
      // Las gotas persisten con suave ondulación al final
      const dripPersist = dissolveEased > 0.5 ? 1 : dripShow;
      const dripSway = Math.sin(t * 2) * 3 * dissolveEased;
      const dripLen = dripPersist * 70;

      if (dripRef.current) {
        const cx = 175 + dripSway;
        dripRef.current.setAttribute(
          "d",
          `M${cx} ${curtainBottomY - 5} Q${cx - 5} ${curtainBottomY + dripLen * 0.5} ${cx + 3} ${curtainBottomY + dripLen} Q${cx + 8} ${curtainBottomY + dripLen + 6} ${cx - 3} ${curtainBottomY + dripLen + 12} Q${cx - 13} ${curtainBottomY + dripLen + 6} ${cx - 7} ${curtainBottomY + dripLen} Z`
        );
        // Las gotas se mantienen visibles al final con un pulso suave
        const dripOp = dissolveEased > 0.8
          ? 0.6 + Math.sin(t * 1.5) * 0.15
          : dripShow;
        dripRef.current.style.opacity = dripOp.toFixed(3);
      }
      if (drip2Ref.current) {
        const dripLen2 = dripPersist * 50;
        const cx2 = 205 + dripSway * 0.7;
        drip2Ref.current.setAttribute(
          "d",
          `M${cx2} ${curtainBottomY - 5} Q${cx2 - 4} ${curtainBottomY + dripLen2 * 0.5} ${cx2 + 2} ${curtainBottomY + dripLen2} Q${cx2 + 6} ${curtainBottomY + dripLen2 + 4} ${cx2 - 2} ${curtainBottomY + dripLen2 + 9} Q${cx2 - 9} ${curtainBottomY + dripLen2 + 4} ${cx2 - 5} ${curtainBottomY + dripLen2} Z`
        );
        const drip2Op = dissolveEased > 0.8
          ? 0.4 + Math.sin(t * 1.8 + 1) * 0.1
          : dripShow * 0.7;
        drip2Ref.current.style.opacity = drip2Op.toFixed(3);
      }
      // Tercera gota decorativa (aparece solo al final, más pequeña)
      if (drip3Ref.current) {
        if (dissolveEased > 0.3) {
          const dripLen3 = dissolveEased * 35;
          const cx3 = 145 + dripSway * 0.5;
          drip3Ref.current.setAttribute(
            "d",
            `M${cx3} ${curtainBottomY - 3} Q${cx3 - 3} ${curtainBottomY + dripLen3 * 0.5} ${cx3 + 2} ${curtainBottomY + dripLen3} Q${cx3 + 5} ${curtainBottomY + dripLen3 + 3} ${cx3 - 1} ${curtainBottomY + dripLen3 + 7} Q${cx3 - 7} ${curtainBottomY + dripLen3 + 3} ${cx3 - 3} ${curtainBottomY + dripLen3} Z`
          );
          const drip3Op = (dissolveEased - 0.3) * 0.5 + Math.sin(t * 2.2 + 2) * 0.08;
          drip3Ref.current.style.opacity = Math.max(0, drip3Op).toFixed(3);
        } else {
          drip3Ref.current.style.opacity = "0";
        }
      }

      // Brillo/sheen que se desliza (realismo de líquido)
      if (sheenRef.current) {
        const sheenY = (t * 30) % 440;
        sheenRef.current.setAttribute("y", sheenY.toFixed(1));
        // El brillo se desvanece suavemente junto con la cortina
        const sheenOp = reveal < 0.9 ? 0.25 : 0.25 * (1 - dissolveEased);
        sheenRef.current.style.opacity = sheenOp.toFixed(3);
      }

    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [activeRef, progressRef]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 360 440"
      className="scene-svg icecream-scene h-auto w-full cursor-pointer"
      aria-label="Helado Nube — abrir el sitio"
      onClick={onOpen}
      style={{ maxWidth: "min(75vw, 420px)", outline: "none" }}
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
        {/* Gradiente del residuo cremoso */}
        <linearGradient id="cream-residue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fbeae0" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Capa clickable */}
      <rect x="0" y="0" width="360" height="440" fill="transparent" aria-hidden="true" />

      {/* TEXTO "HELADO NUBE" — debajo de la cortina (se va revelando) */}
      <g className="icecream-text audio-title-svg" textAnchor="middle">
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

      {/* Residuo cremoso en la parte inferior (aparece al disolverse la cortina) */}
      <path ref={residueRef} d="M0 440 Z" fill="url(#cream-residue)" opacity="0" />

      {/* CORTINA CREMOSA — la animación principal (path dinámico) */}
      <path
        ref={curtainRef}
        d="M0 0 L360 0 L360 0 L0 0 Z"
        fill="url(#cream-grad)"
        opacity="1"
        style={{ transition: "opacity 0.1s ease-out" }}
      />

      {/* Gotas que cuelgan */}
      <path ref={dripRef} d="M0 0 Z" fill="url(#cream-grad)" opacity="0" />
      <path ref={drip2Ref} d="M0 0 Z" fill="url(#cream-grad)" opacity="0" />
      <path ref={drip3Ref} d="M0 0 Z" fill="url(#cream-grad)" opacity="0" />
    </svg>
  );
}
