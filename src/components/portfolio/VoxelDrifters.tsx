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

    const unsubscribe = getAmbient()?.subscribeAnalysis(({ energy }) => {
      root.dataset.audioActive = energy > 0.025 ? "true" : "false";
    });

    return () => {
      unsubscribe?.();
      delete root.dataset.audioActive;
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
          <VoxelFigure variant={drifter.variant} />
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
