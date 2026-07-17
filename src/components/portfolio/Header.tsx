"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/portfolio-content";
import { useScreenNav, SCREENS } from "@/lib/use-screen-nav";
import ThemeToggle from "./ThemeToggle";

/**
 * Header fijo — logo tipográfico a la izquierda, menú mono mayúsculas derecha.
 * P5: ahora usa el screen-nav (goTo) en lugar de Lenis para navegar.
 * Se oculta al bajar (no aplica ya) — ahora siempre visible salvo en la
 * primera pantalla (hero limpio). Al clic en enlace: goTo(index de pantalla).
 */
export default function Header() {
  const { current, goTo } = useScreenNav();
  const [hidden, setHidden] = useState(false);

  // El header no se muestra en la primera pantalla (hero limpio)
  const pastHero = current !== 0;

  const handleNav = (target: string) => {
    const idx = SCREENS.findIndex((s) => s.id === target.replace("#", ""));
    if (idx >= 0) goTo(idx);
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
          onClick={() => goTo(0)}
          className="text-[15px] font-medium tracking-tight lowercase transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-inter)" }}
          aria-label="Volver al inicio"
        >
          {SITE.logo}
        </button>

        <div className="flex items-center gap-5 md:gap-7">
          <nav className="hidden md:flex items-center gap-8 lg:gap-12" aria-label="Principal">
            {SITE.nav.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.target)}
                className="mono text-[11px] hover:opacity-100 opacity-80 transition-opacity duration-300"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <ThemeToggle />
          {/* Menú móvil compacto */}
          <MobileMenu onNav={handleNav} />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({
  onNav,
}: {
  onNav: (target: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        className="pill"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Abrir menú"
      >
        {open ? "CERRAR" : "MENÚ"}
      </button>
      {open && (
        <nav
          className="absolute top-full right-6 mt-2 flex flex-col gap-3 rounded-2xl p-4"
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--pill-border)",
          }}
          aria-label="Móvil"
        >
          {SITE.nav.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                onNav(item.target);
              }}
              className="mono text-[12px] text-left"
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
