"use client";

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
          onClick={() => goTo(0)}
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
