"use client";

/**
 * Iconos pixel/voxel 8-bit como SVG inline.
 * Motivo de marca: cursor flecha, reloj de arena, ojo.
 * Usados en transiciones, hovers y footer.
 */

type IconProps = { className?: string; size?: number };

export function PixelArrow({ className, size = 24 }: IconProps) {
  // Flecha cursor pixelada
  const cells = [
    "1,1 2,1",
    "1,2 2,2 3,2",
    "1,3 2,3 3,3 4,3",
    "1,4 2,4 3,4 4,4 5,4",
    "1,5 2,5 3,5",
    "1,6 2,6",
    "1,7",
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {cells.map((row, i) =>
        row.split(", ").map((c, j) => (
          <rect
            key={`${i}-${j}`}
            x={parseInt(c)}
            y={i + 1}
            width={1}
            height={1}
            fill="currentColor"
          />
        ))
      )}
    </svg>
  );
}

export function PixelHourglass({
  className,
  size = 24,
  spin = false,
}: IconProps & { spin?: boolean }) {
  // Reloj de arena pixelado
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      className={`${className} ${spin ? "spin-slow" : ""}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Marco */}
      <rect x="1" y="0" width="6" height="1" fill="currentColor" />
      <rect x="1" y="7" width="6" height="1" fill="currentColor" />
      <rect x="1" y="0" width="1" height="8" fill="currentColor" />
      <rect x="6" y="0" width="1" height="8" fill="currentColor" />
      {/* Arena superior */}
      <rect x="2" y="1" width="4" height="1" fill="currentColor" opacity="0.6" />
      <rect x="3" y="2" width="2" height="1" fill="currentColor" opacity="0.6" />
      {/* Centro */}
      <rect x="3" y="3" width="2" height="1" fill="currentColor" />
      <rect x="3" y="4" width="2" height="1" fill="currentColor" />
      {/* Arena inferior */}
      <rect x="3" y="5" width="2" height="1" fill="currentColor" opacity="0.6" />
      <rect x="2" y="6" width="4" height="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function PixelEye({ className, size = 24 }: IconProps) {
  // Ojo pixelado para hovers de blog
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 8"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="1" y="2" width="8" height="1" fill="currentColor" />
      <rect x="0" y="3" width="1" height="2" fill="currentColor" />
      <rect x="9" y="3" width="1" height="2" fill="currentColor" />
      <rect x="1" y="5" width="8" height="1" fill="currentColor" />
      {/* Pupila */}
      <rect x="4" y="3" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

export function PixelChevron({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 6 6"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="1" height="1" fill="currentColor" />
      <rect x="1" y="1" width="1" height="1" fill="currentColor" />
      <rect x="2" y="2" width="1" height="1" fill="currentColor" />
      <rect x="3" y="3" width="1" height="1" fill="currentColor" />
      <rect x="4" y="4" width="1" height="1" fill="currentColor" />
      <rect x="5" y="5" width="1" height="1" fill="currentColor" />
      <rect x="4" y="0" width="1" height="1" fill="currentColor" />
      <rect x="3" y="1" width="1" height="1" fill="currentColor" />
    </svg>
  );
}

export function PixelSpark({ className, size = 16 }: IconProps) {
  // Detalle decorativo (estrella pixel)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 7 7"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="3" y="0" width="1" height="7" fill="currentColor" />
      <rect x="0" y="3" width="7" height="1" fill="currentColor" />
      <rect x="2" y="2" width="3" height="3" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
