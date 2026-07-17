"use client";

import { useEffect, useRef, useState } from "react";
import {
  AMBIENT_TRACKS,
  getAmbient,
  type AmbientTrack,
} from "@/lib/ambient-sound";

/**
 * SoundToggle — botón flotante (esquina inferior-izquierda) que persiste
 * tras el preloader. Refleja y controla la música global.
 * Usa el motivo pixel/voxel: un altavoz pixelado mini.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [track, setTrack] = useState<AmbientTrack>(AMBIENT_TRACKS[0]);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ambient = getAmbient();
    const unsubEnabled = ambient?.subscribe((v) => setOn(v));
    const unsubTrack = ambient?.subscribeTrack((nextTrack) =>
      setTrack(nextTrack)
    );
    return () => {
      unsubEnabled?.();
      unsubTrack?.();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const closeFromOutside = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [menuOpen]);

  const toggle = () => {
    setHasInteracted(true);
    getAmbient()?.toggle();
  };

  const chooseTrack = async (trackId: string) => {
    const ambient = getAmbient();
    if (!ambient) return;

    setHasInteracted(true);
    setMenuOpen(false);
    await ambient.selectTrack(trackId);
    if (!ambient.isEnabled()) {
      await ambient.enable();
    }
  };

  const shouldInvite = !on && !hasInteracted;

  return (
    <div
      ref={dockRef}
      className="sound-dock fixed bottom-5 left-5 z-[57] flex items-center gap-2"
    >
      {menuOpen && (
        <div
          id="sound-track-menu"
          className="sound-track-menu"
          role="menu"
          aria-label="Elegir canción"
        >
          <div className="sound-track-menu-heading">
            <span>Selecciona canción</span>
            <span>{String(AMBIENT_TRACKS.length).padStart(2, "0")}</span>
          </div>
          <div className="sound-track-list">
            {AMBIENT_TRACKS.map((item) => {
              const active = item.id === track.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  className={`sound-track-option${active ? " is-active" : ""}`}
                  onClick={() => void chooseTrack(item.id)}
                >
                  <span className="sound-track-option-dot" aria-hidden="true" />
                  <span className="min-w-0">
                    <strong>{item.title}</strong>
                    <small>{item.artist}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "Silenciar música" : "Reproducir música"}
        data-cursor={on ? "SILENCIAR" : "SONIDO"}
        data-on={on ? "true" : "false"}
        data-invite={shouldInvite ? "true" : "false"}
        className="sound-toggle relative w-11 h-11 shrink-0 rounded-full border flex items-center justify-center transition-transform duration-200 hover:scale-105"
        style={{
          borderColor: "var(--pill-border)",
          background: "var(--bg-light)",
          backdropFilter: "blur(8px)",
        }}
      >
        {shouldInvite && (
          <>
            <span className="sound-invite-ring sound-invite-ring--one" aria-hidden="true" />
            <span className="sound-invite-ring sound-invite-ring--two" aria-hidden="true" />
            <span className="sound-invite-label" aria-hidden="true">
              Activa el ritmo
            </span>
          </>
        )}
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

      <button
        type="button"
        className="sound-track-toggle"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls="sound-track-menu"
        aria-label={`Canción actual: ${track.title}, ${track.artist}. Elegir otra canción`}
        onClick={() => {
          setHasInteracted(true);
          setMenuOpen((open) => !open);
        }}
      >
        <span className="sound-track-status" aria-hidden="true">
          {on ? "ON AIR" : "TRACK"}
        </span>
        <span className="sound-track-copy">
          <strong>{track.title}</strong>
          <small>{track.artist}</small>
        </span>
        <svg
          viewBox="0 0 10 10"
          width="10"
          height="10"
          aria-hidden="true"
          className={menuOpen ? "rotate-180" : undefined}
        >
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>

      <span
        className="sr-only"
        aria-live="polite"
      >
        {on
          ? `Reproduciendo ${track.title} de ${track.artist}`
          : `Canción seleccionada: ${track.title} de ${track.artist}`}
      </span>
    </div>
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
