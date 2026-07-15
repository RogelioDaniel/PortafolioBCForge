"use client";

import { useEffect, useState } from "react";
import { getAmbient } from "@/lib/ambient-sound";

/**
 * SoundToggle — botón flotante (esquina inferior-izquierda) que persiste
 * tras el preloader. Refleja y controla el ambient sound global.
 * Usa el motivo pixel/voxel: un altavoz pixelado mini.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const ambient = getAmbient();
    const unsub = ambient?.subscribe((v) => setOn(v));
    return () => unsub?.();
  }, []);

  const toggle = () => getAmbient()?.toggle();

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Silenciar ambiente" : "Reproducir ambiente"}
      data-cursor={on ? "SILENCIAR" : "SONIDO"}
      className="fixed bottom-5 left-5 z-40 w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{
        borderColor: "var(--pill-border)",
        background: "var(--bg-light)",
        backdropFilter: "blur(8px)",
      }}
    >
      <SpeakerPixel on={on} />
      <span
        className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full transition-opacity"
        style={{
          background: on ? "#16a34a" : "var(--ink-faint)",
          opacity: on ? 1 : 0.3,
        }}
        aria-hidden="true"
      />
    </button>
  );
}

/** Altavoz pixel mini 8-bit. */
function SpeakerPixel({ on }: { on: boolean }) {
  const color = "currentColor";
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ color: "var(--ink)" }}
    >
      {/* Cuerpo */}
      <rect x="1" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="2" width="2" height="4" fill={color} />
      {/* Ondas (solo si on) */}
      {on && (
        <>
          <rect x="5" y="1" width="1" height="1" fill={color} opacity="0.6" />
          <rect x="6" y="2" width="1" height="1" fill={color} opacity="0.4" />
          <rect x="5" y="6" width="1" height="1" fill={color} opacity="0.6" />
          <rect x="6" y="5" width="1" height="1" fill={color} opacity="0.4" />
        </>
      )}
      {!on && (
        <>
          {/* X de silenciado */}
          <rect x="5" y="2" width="1" height="1" fill={color} opacity="0.5" />
          <rect x="6" y="3" width="1" height="1" fill={color} opacity="0.5" />
          <rect x="7" y="4" width="1" height="1" fill={color} opacity="0.5" />
          <rect x="6" y="5" width="1" height="1" fill={color} opacity="0.5" />
          <rect x="5" y="6" width="1" height="1" fill={color} opacity="0.5" />
        </>
      )}
    </svg>
  );
}
