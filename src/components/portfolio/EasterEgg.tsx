"use client";

import { useEffect, useRef, useState } from "react";

/**
 * EasterEgg v2 — "Cliente Milenia" 🐱
 *
 * Trigger: escribir "milenial" en el teclado (sin inputs activos).
 * Efecto: el video de gatitos reemplaza la hamburguesa con un efecto
 * 3D fancy — perspectiva CSS + parallax al mover el mouse.
 */

const SECRET = "milenial";

export function useEasterEggTrigger(onActivate: () => void) {
  const bufferRef = useRef("");

  useEffect(() => {
    // 1. Escuchar por teclado (PC)
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(
        -SECRET.length
      );
      if (bufferRef.current === SECRET) {
        onActivate();
        bufferRef.current = "";
      }
    };
    window.addEventListener("keydown", onKey);

    // 2. Escuchar por URL (?milenial o #milenial) para celulares
    const checkUrl = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has("milenial") || window.location.hash === "#milenial") {
        onActivate();
        
        // Limpiamos los parámetros para no trabar la navegación futura
        if (window.location.hash === "#milenial") {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
          const newParams = new URLSearchParams(window.location.search);
          newParams.delete("milenial");
          const query = newParams.toString();
          window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
        }
      }
    };

    // 3. Escuchar por evento táctil del Logo (cabecera)
    const onCustomEvent = () => {
      onActivate();
    };

    checkUrl();
    // Escucha cambios de hash en vivo
    window.addEventListener("hashchange", checkUrl);
    window.addEventListener("trigger-milenial-easter", onCustomEvent);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", checkUrl);
      window.removeEventListener("trigger-milenial-easter", onCustomEvent);
    };
  }, [onActivate]);
}

export default function EasterEgg({ onClose }: { onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef(0);
  const targetRef = useRef({ rx: -8, ry: 6 });
  const currentRef = useRef({ rx: -8, ry: 6 });
  const [entered, setEntered] = useState(false);

  // Entrada suave
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Reproducir video en loop
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.loop = true;
    v.muted = false;
    v.volume = 1.0;
    v.play().catch(() => {});
  }, []);

  // ESC cierra
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Mouse parallax 3D — lerp suave hacia el target
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rx = ((e.clientY / window.innerHeight) - 0.5) * -22;
      const ry = ((e.clientX / window.innerWidth) - 0.5) * 28;
      targetRef.current = { rx, ry };

      const card = cardRef.current;
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mouse-x", `${x}%`);
        card.style.setProperty("--mouse-y", `${y}%`);
      }
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const card = cardRef.current;
      if (!card) return;
      currentRef.current.rx = lerp(currentRef.current.rx, targetRef.current.rx, 0.07);
      currentRef.current.ry = lerp(currentRef.current.ry, targetRef.current.ry, 0.07);
      card.style.transform = `
        perspective(700px)
        rotateX(${currentRef.current.rx}deg)
        rotateY(${currentRef.current.ry}deg)
        translateZ(0px)
      `;
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="easter-wrap"
      data-entered={entered ? "true" : undefined}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Easter egg: cliente Milenia"
    >
      {/* Partículas decorativas */}
      <div className="easter-particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="easter-particle"
            style={{
              "--i": i,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${(Math.random() * 3).toFixed(2)}s`,
              animationDuration: `${(2 + Math.random() * 3).toFixed(2)}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Contenido central */}
      <div className="easter-scene">
        {/* Texto meme arriba */}
        <p className="easter-meme-top">
          Cuando tengo que entregarle el sitio a&nbsp;
          <strong>Milenial:</strong>
        </p>

        {/* Tarjeta 3D con el video */}
        <div className="easter-3d-stage">
          <div ref={cardRef} className="easter-card">
            {/* Brillo especular que sigue al mouse */}
            <div className="easter-card-shine" aria-hidden="true" />

            {/* Video */}
            <video
              ref={videoRef}
              src="/easter/milenia.mp4"
              playsInline
              loop
              preload="auto"
              className="easter-video"
            />

            {/* Overlay de scan lines sobre el video */}
            <div className="easter-card-scanlines" aria-hidden="true" />

            {/* Marco decorativo */}
            <div className="easter-card-frame" aria-hidden="true">
              <span className="easter-corner tl" />
              <span className="easter-corner tr" />
              <span className="easter-corner bl" />
              <span className="easter-corner br" />
            </div>
          </div>

          {/* Sombra 3D del card */}
          <div className="easter-card-shadow" aria-hidden="true" />
        </div>



        {/* Botón cerrar */}
        <button className="easter-exit-btn" onClick={onClose}>
          <span>Volver al portafolio</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Hint teclado */}
        <p className="easter-hint">[ESC] para escapar</p>
      </div>
    </div>
  );
}
