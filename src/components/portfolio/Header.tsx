"use client";

import { useRef } from "react";
import { useScreenNav } from "@/lib/use-screen-nav";
import { SITE } from "@/lib/portfolio-content";
import ThemeToggle from "./ThemeToggle";

/**
 * Header fijo — logo tipográfico a la izquierda, theme toggle a la derecha.
 * El menú de navegación se eliminó: la navegación entre pantallas se hace
 * únicamente con las flechas (ScreenNav) y el teclado.
 */
export default function Header() {
  const { current, goTo } = useScreenNav();

  // El header no se muestra en la primera pantalla (hero limpio)
  const pastHero = current !== 0;

  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  const handleLogoClick = () => {
    const now = Date.now();
    // Si pasa más de 1.2s entre toques, reseteamos el contador
    if (now - lastTapRef.current > 1200) {
      tapCountRef.current = 1;
    } else {
      tapCountRef.current += 1;
    }
    lastTapRef.current = now;

    if (tapCountRef.current >= 5) {
      // Disparamos un evento personalizado para activar el easter egg
      window.dispatchEvent(new CustomEvent("trigger-milenial-easter"));
      tapCountRef.current = 0;
    } else {
      goTo(0);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
      style={{
        opacity: pastHero ? 1 : 0,
        pointerEvents: pastHero ? "auto" : "none",
      }}
    >
      <div className="container-edge flex items-center justify-between py-5 md:py-6">
        <button
          onClick={handleLogoClick}
          className="text-[16px] font-semibold tracking-tight transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-inter)" }}
          aria-label="Volver al inicio"
        >
          {SITE.logo}
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
