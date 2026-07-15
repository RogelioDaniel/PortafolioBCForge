"use client";

import { useTheme } from "@/lib/use-theme";

/**
 * ThemeToggle — botón de modo oscuro/claro para el header.
 * Icono pixel sol/luna. Persiste en localStorage.
 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      data-cursor={isDark ? "CLARO" : "OSCURO"}
      className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{
        borderColor: "var(--pill-border)",
        background: "transparent",
      }}
    >
      {isDark ? <MoonPixel /> : <SunPixel />}
    </button>
  );
}

function SunPixel() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 10 10"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ color: "var(--ink)" }}
    >
      {/* Sol central */}
      <rect x="4" y="4" width="2" height="2" fill="currentColor" />
      <rect x="3" y="3" width="1" height="1" fill="currentColor" />
      <rect x="6" y="3" width="1" height="1" fill="currentColor" />
      <rect x="3" y="6" width="1" height="1" fill="currentColor" />
      <rect x="6" y="6" width="1" height="1" fill="currentColor" />
      {/* Rayos */}
      <rect x="4" y="1" width="2" height="1" fill="currentColor" opacity="0.7" />
      <rect x="4" y="8" width="2" height="1" fill="currentColor" opacity="0.7" />
      <rect x="1" y="4" width="1" height="2" fill="currentColor" opacity="0.7" />
      <rect x="8" y="4" width="1" height="2" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function MoonPixel() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 10 10"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ color: "var(--ink)" }}
    >
      {/* Luna creciente */}
      <rect x="3" y="2" width="4" height="6" fill="currentColor" />
      <rect x="4" y="1" width="3" height="1" fill="currentColor" />
      <rect x="4" y="8" width="3" height="1" fill="currentColor" />
      <rect x="2" y="3" width="1" height="4" fill="currentColor" />
      <rect x="7" y="3" width="1" height="4" fill="currentColor" />
      {/* Recorte para creciente */}
      <rect x="5" y="2" width="3" height="6" fill="var(--bg-light)" />
      <rect x="6" y="1" width="2" height="1" fill="var(--bg-light)" />
      <rect x="6" y="8" width="2" height="1" fill="var(--bg-light)" />
      <rect x="7" y="3" width="1" height="4" fill="var(--bg-light)" />
    </svg>
  );
}
