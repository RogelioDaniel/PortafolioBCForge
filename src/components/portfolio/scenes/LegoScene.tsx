"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SceneProps } from "./scene-shared";

/**
 * LegoScene — bloques Lego isométricos que se ARMAN de abajo hacia arriba
 * con el scroll (inspirado en BLOQE). Cada ladrillo empieza desplazado y
 * cae a su posición conforme avanza el progreso.
 *
 * Render isométrico simplificado: cada ladrillo es un grupo <g> con
 * 3 caras (top, front, side) + studs. La animación de armado se hace
 * bajando translateY de cada ladrillo con delay escalonado.
 */
type Brick = {
  id: number;
  // posición en grid isométrico (en unidades)
  gx: number;
  gy: number;
  gz: number; // altura (número de ladrillos hacia arriba)
  w: number; // ancho en studs
  d: number; // profundo en studs
  color: string;
};

const LEGO_COLORS = [
  "#c4281c", // rojo
  "#f5cd2c", // amarillo
  "#1d5aa3", // azul
  "#2d8a3e", // verde
  "#f0e8d0", // blanco hueso
  "#9c9590", // gris
  "#e8732c", // naranja
];

const STUD = 22; // tamaño de un stud en px isométrico
// Proyección isométrica (2:1 simplificada)
const iso = (gx: number, gy: number, gz: number) => {
  const x = (gx - gy) * STUD * 0.5;
  const y = (gx + gy) * STUD * 0.28 - gz * STUD * 0.55;
  return { x, y };
};

export default function LegoScene({
  activeRef,
  progressRef,
  onOpen,
}: SceneProps) {
  const rootRef = useRef<SVGSVGElement>(null);
  const bricksContainerRef = useRef<SVGGElement>(null);

  // Construir una "torre/casita" de bloques determinista (estilo BLOQE castle simplificado)
  const bricks = useMemo<Brick[]>(() => {
    const list: Brick[] = [];
    let id = 0;
    // Base: 2 capas de ladrillos anchos
    const baseRows = [
      { gx: 0, gy: 0, w: 4, d: 2, color: LEGO_COLORS[1] }, // amarillo
      { gx: 0, gy: 2, w: 4, d: 2, color: LEGO_COLORS[2] }, // azul
      { gx: 4, gy: 0, w: 2, d: 2, color: LEGO_COLORS[0] }, // rojo
      { gx: 4, gy: 2, w: 2, d: 2, color: LEGO_COLORS[3] }, // verde
    ];
    baseRows.forEach((b, i) => {
      list.push({ ...b, id: id++, gz: 0 });
    });
    // Nivel 1
    list.push({ id: id++, gx: 0, gy: 0, w: 2, d: 4, gz: 1, color: LEGO_COLORS[6] });
    list.push({ id: id++, gx: 2, gy: 0, w: 2, d: 2, gz: 1, color: LEGO_COLORS[4] });
    list.push({ id: id++, gx: 4, gy: 2, w: 2, d: 2, gz: 1, color: LEGO_COLORS[0] });
    list.push({ id: id++, gx: 2, gy: 2, w: 2, d: 2, gz: 1, color: LEGO_COLORS[3] });
    // Nivel 2 (techo/corona)
    list.push({ id: id++, gx: 1, gy: 1, w: 3, d: 2, gz: 2, color: LEGO_COLORS[1] });
    list.push({ id: id++, gx: 2, gy: 3, w: 2, d: 1, gz: 2, color: LEGO_COLORS[2] });
    // Pico
    list.push({ id: id++, gx: 2, gy: 2, w: 1, d: 1, gz: 3, color: LEGO_COLORS[0] });
    return list;
  }, []);

  useEffect(() => {
    const container = bricksContainerRef.current;
    if (!container) return;

    // Ordenar por altura (gz) para que el armado sea de abajo hacia arriba
    const brickEls = Array.from(
      container.querySelectorAll<SVGGElement>("[data-brick-id]")
    );

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = progressRef.current;
      const active = activeRef.current;

      // Solo animar cuando es el proyecto activo (lego = índice 1)
      if (active !== 1) return;

      brickEls.forEach((el) => {
        const brickId = parseInt(el.dataset.brickId || "0", 10);
        const brick = bricks[brickId];
        if (!brick) return;
        // Cada ladrillo tiene su ventana de armado según su altura gz
        const order = brick.gz * 4 + (brick.gx + brick.gy) * 0.3;
        const maxOrder = 3 * 4 + 8 * 0.3; // normalizador aproximado
        const normOrder = order / maxOrder;
        // El armado ocurre entre 0.1 y 0.7 del progreso, escalonado
        const startP = 0.08 + normOrder * 0.55;
        const endP = startP + 0.18;
        let buildT = 0;
        if (p < startP) buildT = 0;
        else if (p > endP) buildT = 1;
        else buildT = (p - startP) / (endP - startP);
        // ease-out
        buildT = 1 - Math.pow(1 - buildT, 3);

        // Antes de armarse: desplazado hacia arriba y transparente
        const offsetY = (1 - buildT) * -120;
        const opacity = buildT;
        // Pequeño rebote al final
        const scale = 0.6 + buildT * 0.4;
        el.setAttribute(
          "transform",
          `translate(0 ${offsetY.toFixed(2)}) scale(${scale.toFixed(3)})`
        );
        el.style.opacity = opacity.toFixed(3);
        el.style.transformOrigin = "center";
      });
    };
    animate();

    return () => cancelAnimationFrame(raf);
  }, [activeRef, progressRef, bricks]);

  return (
    <svg
      ref={rootRef}
      viewBox="-180 -120 360 320"
      className="scene-svg lego-scene h-auto w-full"
      role="img"
      aria-label="Construcción de bloques Lego que se arma de abajo hacia arriba"
      style={{ maxWidth: "420px" }}
    >
      {/* Capa clickable */}
      <rect
        x="-180"
        y="-120"
        width="360"
        height="320"
        fill="transparent"
        style={{ cursor: "pointer" }}
        onClick={onOpen}
        aria-hidden="true"
      />

      {/* Baseplate sutil */}
      <ellipse
        cx="0"
        cy="120"
        rx="150"
        ry="40"
        fill="var(--ink)"
        opacity="0.08"
      />

      <g ref={bricksContainerRef} transform="translate(0 60)">
        {bricks.map((brick) => (
          <BrickShape key={brick.id} brick={brick} />
        ))}
      </g>
    </svg>
  );
}

/** Dibuja un ladrillo isométrico individual con 3 caras + studs. */
function BrickShape({ brick }: { brick: Brick }) {
  const { gx, gy, gz, w, d, color, id } = brick;
  // Esquinas del ladrillo en espacio isométrico
  const p = (bx: number, by: number, bz: number) => iso(bx, by, bz);

  // 4 esquinas de la base + 4 esquinas del techo
  const x0 = gx,
    y0 = gy;
  const x1 = gx + w,
    y1 = gy;
  const x2 = gx + w,
    y2 = gy + d;
  const x3 = gx,
    y3 = gy + d;
  const h = 0.6; // altura de un ladrillo

  // Top face (cuarantes superiores)
  const topPts = [
    p(x0, y0, gz + h),
    p(x1, y1, gz + h),
    p(x2, y2, gz + h),
    p(x3, y3, gz + h),
  ];
  // Front face (mirando hacia abajo-derecha)
  const frontPts = [
    p(x1, y1, gz + h),
    p(x2, y2, gz + h),
    p(x2, y2, gz),
    p(x1, y1, gz),
  ];
  // Side face (mirando hacia abajo-izquierda)
  const sidePts = [
    p(x2, y2, gz + h),
    p(x3, y3, gz + h),
    p(x3, y3, gz),
    p(x2, y2, gz),
  ];

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(" ") + " Z";

  // Color shading: top brillante, front medio, side oscuro
  const shade = (hex: string, factor: number) => {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.round(((n >> 16) & 255) * factor));
    const g = Math.min(255, Math.round(((n >> 8) & 255) * factor));
    const b = Math.min(255, Math.round((n & 255) * factor));
    return `rgb(${r},${g},${b})`;
  };

  // Studs (uno por unidad de w x d)
  const studs = [];
  for (let sx = 0; sx < w; sx++) {
    for (let sy = 0; sy < d; sy++) {
      const cx = gx + sx + 0.5;
      const cy = gy + sy + 0.5;
      const top = p(cx, cy, gz + h);
      const bot = p(cx, cy, gz + h + 0.35);
      studs.push(
        <ellipse
          key={`${sx}-${sy}`}
          cx={top.x}
          cy={top.y - 4}
          rx={STUD * 0.32}
          ry={STUD * 0.18}
          fill={shade(color, 1.08)}
          stroke="var(--ink)"
          strokeWidth="1.2"
          opacity="0.95"
        />
      );
    }
  }

  return (
    <g data-brick-id={id} className="lego-brick">
      {/* Side (oscura) */}
      <path d={toPath(sidePts)} fill={shade(color, 0.7)} stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Front (media) */}
      <path d={toPath(frontPts)} fill={shade(color, 0.92)} stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Top (brillante) */}
      <path d={toPath(topPts)} fill={shade(color, 1.12)} stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
      {studs}
    </g>
  );
}
