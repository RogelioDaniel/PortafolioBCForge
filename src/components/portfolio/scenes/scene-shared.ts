/**
 * Utilidades compartidas por las escenas de proyectos.
 * Cada escena recibe refs a (activeRef, progressRef) que vienen del
 * sistema de scroll storytelling de Projects.tsx, y aplica sus propias
 * animaciones de capas leyendo progressRef.current (0..1 por proyecto).
 *
 * Todas las escenas comparten una estética cohesiva:
 *  - trazo de línea oscuro uniforme
 *  - paleta con un acento de color del proyecto
 *  - escala y composición centrada comparable
 *  - rotación leve ligada al progreso del scroll (continuidad entre proyectos)
 */

import type { MutableRefObject } from "react";

export interface SceneProps {
  activeRef: MutableRefObject<number>;
  progressRef: MutableRefObject<number>;
  revealCompleteRef: MutableRefObject<boolean>;
  accent: string;
  /** Se llama al hacer click en el cuerpo principal de la escena */
  onOpen: () => void;
}

/** Interpolación lineal entre dos números. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Interpola un valor en una curva de puntos (x = progreso 0..1, y = valor). */
export function sampleCurve(
  points: [number, number][],
  progress: number
): number {
  if (points.length === 0) return 0;
  if (progress <= points[0][0]) return points[0][1];
  if (progress >= points[points.length - 1][0])
    return points[points.length - 1][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (progress >= x0 && progress <= x1) {
      const t = (progress - x0) / (x1 - x0 || 1);
      return lerp(y0, y1, t);
    }
  }
  return points[points.length - 1][1];
}

/** Mantiene una colección de elementos DOM animados por progreso.
 *  El consumidor llama update() desde su único loop para evitar RAF duplicados. */
export function makeScrollDriver(
  progressRef: MutableRefObject<number>,
  layers: Array<{
    el: () => SVGGElement | null;
    /** Curvas x, y (px), rotate (deg) en función del progreso 0..1 */
    x?: [number, number][];
    y?: [number, number][];
    rotate?: [number, number][];
    /** Rango de progreso en el que la opacidad pasa de 1 a 0 */
    fadeOut?: [number, number];
  }>
) {
  let lastP = -1;

  const update = () => {
    const p = progressRef.current;
    // Cuantizar para evitar reflows cuando el progreso no cambia apreciablemente
    const pq = Math.round(p * 1000) / 1000;
    if (pq === lastP) return;
    lastP = pq;

    for (const layer of layers) {
      const el = layer.el();
      if (!el) continue;
      const x = layer.x ? sampleCurve(layer.x, p) : 0;
      const y = layer.y ? sampleCurve(layer.y, p) : 0;
      const r = layer.rotate ? sampleCurve(layer.rotate, p) : 0;
      let opacity = 1;
      if (layer.fadeOut) {
        const [a, b] = layer.fadeOut;
        if (p >= a) opacity = Math.max(0, 1 - (p - a) / (b - a || 1));
      }
      el.setAttribute(
        "transform",
        `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)} 260 215)`
      );
      el.style.opacity = opacity.toFixed(3);
    }
  };

  return {
    update,
  };
}
