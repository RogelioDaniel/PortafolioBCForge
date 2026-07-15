"use client";

import { useEffect, useState } from "react";

/**
 * CommandKHint — pequeño botón flotante que muestra "⌘K" y abre la paleta.
 * Aparece en la esquina inferior derecha (junto al back-to-top).
 * Se oculta en pantallas pequeñas (mobile) donde el teclado no es relevante.
 */
export default function CommandKHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        // El CommandPalette maneja el toggle; solo evitamos el default
      }
    };
    window.addEventListener("keydown", onKey);
    // Mostrar después de un breve delay
    const t = setTimeout(() => setShow(true), 2000);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, []);

  // Dispara el atajo Cmd+K programáticamente
  const trigger = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      })
    );
  };

  return (
    <button
      onClick={trigger}
      aria-label="Abrir paleta de comandos (Cmd+K)"
      data-cursor="BUSCAR"
      className="hidden md:flex fixed bottom-5 right-20 z-40 items-center gap-2 h-11 px-4 rounded-full border transition-all duration-500 hover:scale-105 group"
      style={{
        borderColor: "var(--pill-border)",
        background: "var(--bg-light)",
        backdropFilter: "blur(8px)",
        opacity: show ? 1 : 0,
        transform: show
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.8)",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 8 8"
        shapeRendering="crispEdges"
        aria-hidden="true"
        style={{ color: "var(--ink)", opacity: 0.6 }}
      >
        <rect x="1" y="1" width="3" height="1" fill="currentColor" />
        <rect x="0" y="2" width="1" height="2" fill="currentColor" />
        <rect x="4" y="2" width="1" height="2" fill="currentColor" />
        <rect x="1" y="4" width="3" height="1" fill="currentColor" />
        <rect x="4" y="4" width="1" height="1" fill="currentColor" />
        <rect x="5" y="5" width="1" height="1" fill="currentColor" />
        <rect x="6" y="6" width="1" height="1" fill="currentColor" />
      </svg>
      <span
        className="mono text-[10px] opacity-60 group-hover:opacity-100 transition-opacity"
      >
        ⌘K
      </span>
    </button>
  );
}
