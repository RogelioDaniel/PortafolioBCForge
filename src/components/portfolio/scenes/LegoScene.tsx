"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SceneProps } from "./scene-shared";

/**
 * LegoScene — bloques Lego isométricos que se ARMAN de abajo hacia arriba.
 *
 * P5: la estructura se genera RANDOM cada refresh (entre varios tipos:
 *     torre, castillo, casa, pirámide) usando un generador procedural
 *     inspirado en BLOQE. Cada ladrillo cae a su posición con delay
 *     escalonado según su altura.
 *
 * Render isométrico: 3 caras (top/front/side) + studs por ladrillo.
 */
type Brick = {
  id: number;
  gx: number;
  gy: number;
  gz: number; // nivel de altura
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
  "#7a3d99", // púrpura
];

const STUD = 20;
const iso = (gx: number, gy: number, gz: number) => {
  const x = (gx - gy) * STUD * 0.5;
  const y = (gx + gy) * STUD * 0.26 - gz * STUD * 0.52;
  return { x, y };
};

// PRNG simple (mulberry32) para aleatoriedad determinista por sesión
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generador procedural de estructuras random inspirado en BLOQE. */
function generateStructure(): Brick[] {
  // Semilla distinta cada carga de página
  const seed = Date.now() % 1000000;
  const rng = mulberry32(seed);
  const rand = (min: number, max: number) =>
    Math.floor(rng() * (max - min + 1)) + min;
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  const list: Brick[] = [];
  let id = 0;
  const add = (b: Omit<Brick, "id">) => list.push({ ...b, id: id++ });

  const type = rand(0, 3); // 4 tipos de estructura

  if (type === 0) {
    // CASTILLO: base cuadrada + 4 torres en esquinas + almenas
    const baseColor = pick(LEGO_COLORS);
    const towerColor = pick(LEGO_COLORS.filter((c) => c !== baseColor));
    // Base 4x4
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        add({ gx: x, gy: y, gz: 0, w: 1, d: 1, color: baseColor });
      }
    }
    // Torres en las 4 esquinas (3 niveles)
    const corners = [
      [0, 0],
      [3, 0],
      [0, 3],
      [3, 3],
    ];
    corners.forEach(([cx, cy]) => {
      for (let h = 1; h <= 3; h++) {
        add({ gx: cx, gy: cy, gz: h, w: 1, d: 1, color: towerColor });
      }
    });
    // Almenas (ladrillos en el nivel superior del muro entre torres)
    for (let i = 1; i <= 2; i++) {
      add({ gx: i, gy: 0, gz: 1, w: 1, d: 1, color: baseColor });
      add({ gx: i, gy: 3, gz: 1, w: 1, d: 1, color: baseColor });
      add({ gx: 0, gy: i, gz: 1, w: 1, d: 1, color: baseColor });
      add({ gx: 3, gy: i, gz: 1, w: 1, d: 1, color: baseColor });
    }
  } else if (type === 1) {
    // TORRE: columnas apiladas altas con paleta variada
    const height = rand(5, 7);
    for (let h = 0; h < height; h++) {
      const color = pick(LEGO_COLORS);
      const w = h === height - 1 ? 2 : rand(1, 2);
      const d = h === height - 1 ? 2 : rand(1, 2);
      const gx = h % 2 === 0 ? 1 : 1;
      const gy = h % 2 === 0 ? 1 : 1;
      add({ gx, gy, gz: h, w, d, color });
    }
    // Bandera/pico arriba
    add({ gx: 1, gy: 1, gz: height, w: 1, d: 1, color: "#c4281c" });
  } else if (type === 2) {
    // CASA: base ancha + techo
    const wallColor = pick(["#f0e8d0", "#9c9590", "#e8732c"]);
    const roofColor = pick(["#c4281c", "#2d8a3e", "#7a3d99"]);
    // Paredes 3x3, 2 niveles
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        add({ gx: x, gy: y, gz: 0, w: 1, d: 1, color: wallColor });
        // Hueco en el centro del nivel 1 (puerta/ventana)
        if (!(x === 1 && y === 1)) {
          add({ gx: x, gy: y, gz: 1, w: 1, d: 1, color: wallColor });
        }
      }
    }
    // Techo escalonado
    add({ gx: 0, gy: 0, gz: 2, w: 3, d: 1, color: roofColor });
    add({ gx: 0, gy: 2, gz: 2, w: 3, d: 1, color: roofColor });
    add({ gx: 0, gy: 1, gz: 2, w: 1, d: 1, color: roofColor });
    add({ gx: 2, gy: 1, gz: 2, w: 1, d: 1, color: roofColor });
    add({ gx: 1, gy: 1, gz: 3, w: 1, d: 1, color: "#f5cd2c" }); // chimenea
  } else {
    // PIRÁMIDE escalonada
    const baseColor = pick(LEGO_COLORS);
    const accent = pick(LEGO_COLORS.filter((c) => c !== baseColor));
    for (let level = 0; level < 4; level++) {
      const size = 4 - level;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          add({
            gx: x + level,
            gy: y + level,
            gz: level,
            w: 1,
            d: 1,
            color: level === 0 ? baseColor : accent,
          });
        }
      }
    }
  }

  return list;
}

export default function LegoScene({
  activeRef,
  progressRef,
  onOpen,
}: SceneProps) {
  const rootRef = useRef<SVGSVGElement>(null);
  const bricksContainerRef = useRef<SVGGElement>(null);

  // Estructura random: useMemo con factory que no depende de nada (cambia por Date.now())
  const bricks = useMemo<Brick[]>(() => generateStructure(), []);

  useEffect(() => {
    const container = bricksContainerRef.current;
    if (!container) return;

    const brickEls = Array.from(
      container.querySelectorAll<SVGGElement>("[data-brick-id]")
    );

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = progressRef.current;
      const active = activeRef.current;
      if (active !== 1) return;

      // Normalizar el orden de armado: por altura gz, luego por posición
      const maxGz = Math.max(...bricks.map((b) => b.gz));

      brickEls.forEach((el) => {
        const brickId = parseInt(el.dataset.brickId || "0", 10);
        const brick = bricks[brickId];
        if (!brick) return;
        // Orden: primero base (gz=0) en el primer tercio, luego capas superiores
        const order = brick.gz / (maxGz + 1);
        // El armado ocurre entre 0.05 y 0.75 del progreso, escalonado por altura
        const startP = 0.05 + order * 0.6;
        const endP = startP + 0.2;
        let buildT = 0;
        if (p < startP) buildT = 0;
        else if (p > endP) buildT = 1;
        else buildT = (p - startP) / (endP - startP);
        // ease-out cúbico
        buildT = 1 - Math.pow(1 - buildT, 3);

        const offsetY = (1 - buildT) * -90;
        const opacity = buildT;
        const scale = 0.5 + buildT * 0.5;
        el.setAttribute(
          "transform",
          `translate(0 ${offsetY.toFixed(2)}) scale(${scale.toFixed(3)})`
        );
        el.style.opacity = opacity.toFixed(3);
        el.style.transformOrigin = "center bottom";
      });
    };
    animate();

    return () => cancelAnimationFrame(raf);
  }, [activeRef, progressRef, bricks]);

  return (
    <svg
      ref={rootRef}
      viewBox="-180 -120 360 320"
      className="scene-svg lego-scene h-auto w-full cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label="Construcción de bloques Lego — click para abrir el sitio"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ maxWidth: "min(70vw, 360px)" }}
    >
      {/* Capa clickable */}
      <rect
        x="-180"
        y="-120"
        width="360"
        height="320"
        fill="transparent"
        aria-hidden="true"
      />

      {/* Baseplate sutil */}
      <ellipse cx="0" cy="115" rx="135" ry="36" fill="var(--ink)" opacity="0.08" />

      <g ref={bricksContainerRef} transform="translate(-20 55)">
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
  const p = (bx: number, by: number, bz: number) => iso(bx, by, bz);

  const x0 = gx,
    y0 = gy;
  const x1 = gx + w,
    y1 = gy;
  const x2 = gx + w,
    y2 = gy + d;
  const x3 = gx,
    y3 = gy + d;
  const h = 0.6;

  const topPts = [
    p(x0, y0, gz + h),
    p(x1, y1, gz + h),
    p(x2, y2, gz + h),
    p(x3, y3, gz + h),
  ];
  const frontPts = [
    p(x1, y1, gz + h),
    p(x2, y2, gz + h),
    p(x2, y2, gz),
    p(x1, y1, gz),
  ];
  const sidePts = [
    p(x2, y2, gz + h),
    p(x3, y3, gz + h),
    p(x3, y3, gz),
    p(x2, y2, gz),
  ];

  const toPath = (pts: { x: number; y: number }[]) =>
    pts
      .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(" ") + " Z";

  const shade = (hex: string, factor: number) => {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.round(((n >> 16) & 255) * factor));
    const g = Math.min(255, Math.round(((n >> 8) & 255) * factor));
    const b = Math.min(255, Math.round((n & 255) * factor));
    return `rgb(${r},${g},${b})`;
  };

  const studs = [];
  for (let sx = 0; sx < w; sx++) {
    for (let sy = 0; sy < d; sy++) {
      const cx = gx + sx + 0.5;
      const cy = gy + sy + 0.5;
      const top = p(cx, cy, gz + h);
      studs.push(
        <ellipse
          key={`${sx}-${sy}`}
          cx={top.x}
          cy={top.y - 3}
          rx={STUD * 0.3}
          ry={STUD * 0.16}
          fill={shade(color, 1.08)}
          stroke="var(--ink)"
          strokeWidth="1"
          opacity="0.95"
        />
      );
    }
  }

  return (
    <g data-brick-id={id} className="lego-brick">
      <path d={toPath(sidePts)} fill={shade(color, 0.68)} stroke="var(--ink)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d={toPath(frontPts)} fill={shade(color, 0.9)} stroke="var(--ink)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d={toPath(topPts)} fill={shade(color, 1.12)} stroke="var(--ink)" strokeWidth="1.3" strokeLinejoin="round" />
      {studs}
    </g>
  );
}
