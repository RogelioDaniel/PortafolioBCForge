"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * EasterEgg — Sección secreta "Cliente Milenia" 🎬
 *
 * Se activa escribiendo "milenia" en el teclado desde cualquier pantalla.
 * Muestra el meme del cliente que solo pone atención si le mandas reels.
 * El video se procesa con chroma key en canvas para remover el fondo.
 */

const KONAMI = "milenia";

export function useEasterEggTrigger(onActivate: () => void) {
  const bufferRef = useRef("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return;

      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-KONAMI.length);
      if (bufferRef.current === KONAMI) {
        onActivate();
        bufferRef.current = "";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onActivate]);
}

export default function EasterEgg({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [phase, setPhase] = useState<"intro" | "meme" | "outro">("intro");
  const [videoReady, setVideoReady] = useState(false);

  // Procesar chroma key frame a frame (elimina fondo verde/negro)
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Chroma key: eliminar tonos de verde (fondo chroma típico)
    // Si no hay fondo verde, simplifica a mix-blend-mode en CSS
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Detectar verde chroma (g >> r && g >> b)
      const isGreen = g > 100 && g > r * 1.4 && g > b * 1.4;
      // Detectar negro/fondo muy oscuro
      const isBlack = r < 30 && g < 30 && b < 30;
      // Detectar blanco casi puro
      const isWhite = r > 230 && g > 230 && b > 230;

      if (isGreen || isBlack || isWhite) {
        data[i + 3] = 0; // transparente
      }
    }

    ctx.putImageData(imageData, 0, 0);
    rafRef.current = requestAnimationFrame(processFrame);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => {
      setVideoReady(true);
      // Fase intro → meme al cabo de 1.8s
      setTimeout(() => setPhase("meme"), 1800);
    };

    video.addEventListener("loadeddata", onReady);
    video.load();

    return () => {
      video.removeEventListener("loadeddata", onReady);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Arrancar chroma key cuando el video reproduce
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoReady || phase !== "meme") return;

    video.play().catch(() => {});

    const onPlay = () => {
      rafRef.current = requestAnimationFrame(processFrame);
    };
    const onEnd = () => {
      cancelAnimationFrame(rafRef.current);
      setPhase("outro");
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("ended", onEnd);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("ended", onEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, [videoReady, phase, processFrame]);

  // ESC para cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="easter-egg-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Easter egg secreto: cliente Milenia"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Grain texture */}
      <div className="easter-grain" aria-hidden="true" />

      {/* Scanlines retro */}
      <div className="easter-scanlines" aria-hidden="true" />

      {/* Header clasificado */}
      <div className="easter-header">
        <span className="easter-badge">⚠ CLASIFICADO</span>
        <span className="easter-code">NIVEL: MILENIA · ACCESO CONCEDIDO</span>
      </div>

      {/* Contenido principal */}
      <div className="easter-content">

        {/* Fase intro */}
        {phase === "intro" && (
          <div className="easter-intro">
            <p className="easter-label">Cuando tengo que entregarle el sitio a mi cliente</p>
            <h2 className="easter-title glitch" data-text="MILENIA:">
              MILENIA:
            </h2>
          </div>
        )}

        {/* Fase meme */}
        {phase === "meme" && (
          <div className="easter-meme">
            <p className="easter-label">Necesito mandarle&hellip;</p>

            {/* Lista de reels necesarios */}
            <div className="easter-checklist">
              {[
                "📱 3 Reels de TikTok",
                "🎬 2 videos de YouTube",
                "📊 Un PowerPoint animado",
                "💌 Un PDF con GIFs",
                "☎️ Una llamada de 45 min",
              ].map((item, i) => (
                <span
                  key={item}
                  className="easter-check-item"
                  style={{ animationDelay: `${i * 0.18}s` }}
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Video del meme (canvas con chroma key) */}
            <div className="easter-video-wrap">
              {/* Video oculto fuente */}
              <video
                ref={videoRef}
                src="/easter/milenia.mp4"
                muted
                playsInline
                preload="auto"
                className="easter-video-src"
                aria-hidden="true"
              />
              {/* Canvas con fondo removido */}
              <canvas
                ref={canvasRef}
                className="easter-canvas"
                aria-label="Video meme del cliente"
              />
              {/* Glow debajo del video */}
              <div className="easter-video-glow" aria-hidden="true" />
            </div>

            <p className="easter-caption">
              &hellip;para que me haga caso.
            </p>
          </div>
        )}

        {/* Fase outro */}
        {phase === "outro" && (
          <div className="easter-outro">
            <p className="easter-outro-text">Gracias por entender, Milenia. 🙏</p>
            <p className="easter-outro-sub">
              (¿Nos mandas tu feedback por TikTok?)
            </p>
            <button className="easter-close-btn" onClick={onClose}>
              Volver al sitio normal
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="easter-footer">
        <span>[ESC] para escapar de esta realidad</span>
        {phase !== "outro" && (
          <button className="easter-skip" onClick={onClose}>
            Saltar →
          </button>
        )}
      </div>
    </div>
  );
}
