"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SceneProps } from "./scene-shared";

/**
 * GlassScene — panel de vidrio que se FRACTURA en esquirlas triangulares
 * que se dispersan con el scroll. Inspirado en PRISMA Vidriería: vidrio
 * frío, obsidiana y cobre.
 *
 * Sin WebGL: todo es SVG + CSS transforms. Generamos ~30 esquirlas
 * triangulares procedurales con un punto de impacto.
 */
type Shard = {
  id: number;
  points: [number, number, number, number, number, number]; // triángulo (x1,y1,x2,y2,x3,y3)
  cx: number; // centroide
  cy: number;
  // Vector de dispersión (dirección desde el punto de impacto)
  dx: number;
  dy: number;
  rotate: number;
  delay: number;
};

export default function GlassScene({
  activeRef,
  progressRef,
  accent,
  onOpen,
}: SceneProps) {
  const rootRef = useRef<SVGSVGElement>(null);
  const shardsRef = useRef<SVGGElement>(null);
  const impactRef = useRef<SVGCircleElement>(null);

  // Generar esquirlas deterministas (punto de impacto en el centro)
  const shards = useMemo<Shard[]>(() => {
    const list: Shard[] = [];
    const cx = 180;
    const cy = 220;
    // Anillos concéntricos de esquirlas
    const rings = [
      { r: 35, count: 6, delayBase: 0 },
      { r: 70, count: 10, delayBase: 0.05 },
      { r: 110, count: 14, delayBase: 0.12 },
    ];
    let id = 0;
    rings.forEach((ring, ringIdx) => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + ringIdx * 0.3;
        const nextAngle = ((i + 1) / ring.count) * Math.PI * 2 + ringIdx * 0.3;
        const innerR = ringIdx === 0 ? 8 : rings[ringIdx - 1].r;
        const outerR = ring.r;
        // Triángulo: inner-1, inner-2, outer (esquirla tipo "pie slice")
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(nextAngle) * innerR;
        const y2 = cy + Math.sin(nextAngle) * innerR;
        const x3 = cx + Math.cos((angle + nextAngle) / 2) * outerR;
        const y3 = cy + Math.sin((angle + nextAngle) / 2) * outerR;
        const midAngle = (angle + nextAngle) / 2;
        list.push({
          id: id++,
          points: [x1, y1, x2, y2, x3, y3],
          cx: (x1 + x2 + x3) / 3,
          cy: (y1 + y2 + y3) / 3,
          // Dispersión radial hacia afuera desde el impacto
          dx: Math.cos(midAngle) * (60 + ringIdx * 30),
          dy: Math.sin(midAngle) * (60 + ringIdx * 30) + ringIdx * 15, // leve caída
          rotate: ((id * 37) % 60) - 30,
          delay: ring.delayBase + (i / ring.count) * 0.08,
        });
      }
    });
    return list;
  }, []);

  useEffect(() => {
    const container = shardsRef.current;
    if (!container) return;
    const shardEls = Array.from(
      container.querySelectorAll<SVGGElement>("[data-shard-id]")
    );

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = progressRef.current;
      const active = activeRef.current;
      if (active !== 3) return;

      // Onda de fractura: cada esquirla se suelta según su delay
      shardEls.forEach((el) => {
        const shardId = parseInt(el.dataset.shardId || "0", 10);
        const shard = shards[shardId];
        if (!shard) return;
        // Ventana de fractura de cada esquirla
        const startP = 0.1 + shard.delay;
        const endP = startP + 0.25;
        let t = 0;
        if (p < startP) t = 0;
        else if (p > endP) t = 1;
        else t = (p - startP) / (endP - startP);
        // ease-out cuadrático
        t = 1 - Math.pow(1 - t, 2);

        const x = shard.dx * t;
        const y = shard.dy * t;
        const rot = shard.rotate * t;
        const opacity = 1 - t * 0.7; // se difumina al dispersarse
        el.setAttribute(
          "transform",
          `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)} ${shard.cx} ${shard.cy})`
        );
        el.style.opacity = opacity.toFixed(3);
      });

      // Punto de impacto: pulso inicial
      if (impactRef.current) {
        const impactT = Math.min(1, p / 0.1);
        impactRef.current.style.opacity = (1 - impactT).toFixed(2);
        const r = 5 + impactT * 30;
        impactRef.current.setAttribute("r", r.toFixed(1));
      }
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [activeRef, progressRef, shards]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 360 440"
      className="scene-svg glass-scene h-auto w-full"
      role="img"
      aria-label="Panel de vidrio que se fractura al avanzar el scroll"
      style={{ maxWidth: "340px" }}
    >
      <defs>
        <linearGradient id="glass-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6e8ea" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#c2d0d8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#aeb4bc" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="glass-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
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

      {/* Glow cobre detrás */}
      <rect x="40" y="60" width="280" height="320" fill="url(#glass-glow)" rx="4" />

      {/* Panel de vidrio base (intacto al inicio) */}
      <rect
        x="40"
        y="60"
        width="280"
        height="320"
        fill="url(#glass-grad)"
        stroke="var(--ink)"
        strokeWidth="2"
        rx="4"
        opacity="0.4"
      />
      {/* Reflejos del vidrio intacto */}
      <line x1="60" y1="80" x2="100" y2="120" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
      <line x1="280" y1="340" x2="300" y2="360" stroke="#fff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />

      {/* Punto de impacto */}
      <circle
        ref={impactRef}
        cx="180"
        cy="220"
        r="5"
        fill={accent}
        stroke="var(--ink)"
        strokeWidth="2"
        opacity="0"
      />

      {/* Esquirlas (encima de todo) */}
      <g ref={shardsRef}>
        {shards.map((shard) => (
          <ShardShape key={shard.id} shard={shard} accent={accent} />
        ))}
      </g>
    </svg>
  );
}

function ShardShape({ shard, accent }: { shard: Shard; accent: string }) {
  const [x1, y1, x2, y2, x3, y3] = shard.points;
  const d = `M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z`;
  return (
    <g data-shard-id={shard.id} className="glass-shard">
      <path
        d={d}
        fill="#d8dde2"
        fillOpacity="0.85"
        stroke="var(--ink)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Borde cobre en una arista para acento */}
      <path
        d={`M${x1} ${y1} L${x3} ${y3}`}
        stroke={accent}
        strokeWidth="1.2"
        opacity="0.6"
      />
      {/* Reflejo */}
      <path
        d={`M${(x1 + x3) / 2} ${(y1 + y3) / 2} L${(x2 + x3) / 2} ${(y2 + y3) / 2}`}
        stroke="#fff"
        strokeWidth="0.8"
        opacity="0.5"
      />
    </g>
  );
}
