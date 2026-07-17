import type { CSSProperties } from "react";

const SPARKS = [
  { x: 9, y: 20, strength: 0.72 },
  { x: 20, y: 78, strength: 0.38 },
  { x: 31, y: 15, strength: 0.56 },
  { x: 43, y: 88, strength: 0.8 },
  { x: 58, y: 10, strength: 0.46 },
  { x: 69, y: 74, strength: 0.66 },
  { x: 81, y: 28, strength: 0.94 },
  { x: 91, y: 65, strength: 0.52 },
] as const;

/**
 * BackgroundGlow — resplandor radial cálido durazno/rosa que flota lentamente
 * sobre el fondo lavanda (posición animada con GSAP, ~24s loop, muy sutil).
 * El fondo NUNCA es plano: siempre lavanda + glow en movimiento.
 * Usa CSS custom property --glow-x/--glow-y para mover el centro del radial.
 */
export default function BackgroundGlow() {
  return (
    <div className="bg-glow" aria-hidden="true">
      <div className="audio-rhythm">
        <span className="audio-wash">
          <span className="audio-wash-surface audio-wash-surface--burger" />
          <span className="audio-wash-surface audio-wash-surface--lego" />
          <span className="audio-wash-surface audio-wash-surface--icecream" />
          <span className="audio-wash-surface audio-wash-surface--glass" />
        </span>
        <span className="audio-rail audio-rail--one" />
        <span className="audio-rail audio-rail--two" />
        <span className="audio-rail audio-rail--three" />
        {SPARKS.map((spark) => (
          <span
            key={`${spark.x}-${spark.y}`}
            className="audio-spark"
            style={
              {
                left: `${spark.x}%`,
                top: `${spark.y}%`,
                "--spark-strength": spark.strength,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
