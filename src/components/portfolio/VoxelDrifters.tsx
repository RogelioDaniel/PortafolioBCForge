"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { getAmbient } from "@/lib/ambient-sound";

type Drifter = {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  variant: "dancer" | "runner" | "totem";
};

const DRIFTERS: Drifter[] = [
  { x: 86, y: 18, size: 62, duration: 17, delay: -3, opacity: 0.5, variant: "dancer" },
  { x: 76, y: 77, size: 42, duration: 14, delay: -8, opacity: 0.35, variant: "runner" },
  { x: 11, y: 66, size: 38, duration: 18, delay: -11, opacity: 0.3, variant: "totem" },
  { x: 92, y: 48, size: 26, duration: 13, delay: -5, opacity: 0.42, variant: "totem" },
  { x: 64, y: 12, size: 32, duration: 16, delay: -13, opacity: 0.28, variant: "runner" },
  { x: 26, y: 83, size: 30, duration: 15, delay: -1, opacity: 0.3, variant: "dancer" },
];

export default function VoxelDrifters({
  screenIndex,
  reduced,
}: {
  screenIndex: number;
  reduced: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const figures = Array.from(
      root.querySelectorAll<HTMLElement>(".voxel-drifter-reactive")
    );
    const shapeBand = (value: number, gain: number) =>
      value <= 0 ? 0 : Math.min(1, Math.pow(value, 0.72) * gain);
    const unsubscribe = getAmbient()?.subscribeAnalysis(
      ({
        bass,
        mid,
        treble,
        energy,
        bassHit = shapeBand(bass, 1.5),
        midFlow = shapeBand(mid, 1.6),
        trebleSpark = shapeBand(treble, 1.85),
        energyLift = shapeBand(energy, 1.55),
      }) => {
        root.style.setProperty("--drifter-bass", bassHit.toFixed(3));
        root.style.setProperty("--drifter-mid", midFlow.toFixed(3));
        root.style.setProperty("--drifter-treble", trebleSpark.toFixed(3));
        root.style.setProperty("--drifter-energy", energyLift.toFixed(3));
        root.dataset.audioActive = energyLift > 0.08 ? "true" : "false";

        figures.forEach((figure, index) => {
          const variant = DRIFTERS[index]?.variant ?? "dancer";
          const direction = index % 2 === 0 ? 1 : -1;
          const motion =
            variant === "runner"
              ? {
                  x: direction * midFlow * 38,
                  y: -bassHit * 13,
                  rotate: direction * trebleSpark * 8,
                  scale: 1 + bassHit * 0.2 + midFlow * 0.1,
                }
              : variant === "totem"
                ? {
                    x: direction * midFlow * 12,
                    y: -bassHit * 9,
                    rotate: direction * trebleSpark * 30,
                    scale: 1 + bassHit * 0.14 + trebleSpark * 0.22,
                  }
                : {
                    x: direction * midFlow * 15,
                    y: -bassHit * 34,
                    rotate: direction * trebleSpark * 12,
                    scale: 1 + bassHit * 0.42 + trebleSpark * 0.06,
                  };

          figure.style.transform = `translate3d(${motion.x.toFixed(2)}px, ${motion.y.toFixed(2)}px, 0) rotate(${motion.rotate.toFixed(2)}deg) scale(${motion.scale.toFixed(3)})`;
        });
      }
    );

    return () => {
      unsubscribe?.();
      delete root.dataset.audioActive;
      root.style.removeProperty("--drifter-bass");
      root.style.removeProperty("--drifter-mid");
      root.style.removeProperty("--drifter-treble");
      root.style.removeProperty("--drifter-energy");
      figures.forEach((figure) => {
        figure.style.removeProperty("transform");
      });
    };
  }, [reduced]);

  return (
    <div ref={rootRef} className="voxel-drifters" aria-hidden="true">
      {DRIFTERS.map((drifter, index) => (
        <span
          key={`${screenIndex}-${drifter.x}-${drifter.y}`}
          className="voxel-drifter"
          style={
            {
              "--drifter-x": `${drifter.x}%`,
              "--drifter-y": `${drifter.y}%`,
              "--drifter-size": `${drifter.size}px`,
              "--drifter-duration": `${drifter.duration}s`,
              "--drifter-delay": `${drifter.delay - screenIndex * 0.4}s`,
              "--drifter-opacity": drifter.opacity,
              "--drifter-start-rotation": index % 2 === 0 ? "-8deg" : "8deg",
              "--drifter-peak-rotation": index % 2 === 0 ? "11deg" : "-11deg",
              "--drifter-end-rotation": index % 2 === 0 ? "-4deg" : "4deg",
            } as CSSProperties
          }
        >
          <span
            className="voxel-drifter-reactive"
            data-variant={drifter.variant}
          >
            <VoxelFigure variant={drifter.variant} />
          </span>
        </span>
      ))}
    </div>
  );
}

function VoxelFigure({ variant }: { variant: Drifter["variant"] }) {
  const cells =
    variant === "runner"
      ? [[7, 1], [6, 3], [7, 3], [8, 3], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [8, 5], [6, 6], [8, 6], [5, 7], [9, 7]]
      : variant === "totem"
        ? [[6, 1], [7, 1], [6, 2], [7, 2], [5, 3], [6, 3], [7, 3], [8, 3], [6, 4], [7, 4], [5, 5], [6, 5], [7, 5], [8, 5], [6, 6], [7, 6], [6, 7], [7, 7]]
        : [[6, 1], [7, 1], [6, 2], [7, 2], [6, 3], [7, 3], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [6, 5], [7, 5], [5, 6], [8, 6], [4, 7], [9, 7]];

  return (
    <svg viewBox="0 0 14 9" shapeRendering="crispEdges" className="voxel-drifter-icon">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}
