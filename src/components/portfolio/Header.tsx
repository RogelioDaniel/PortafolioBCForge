"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SITE } from "@/lib/portfolio-content";
import { useMagnetic } from "@/lib/motion-hooks";
import PageTransition from "./PageTransition";
import ThemeToggle from "./ThemeToggle";

/**
 * Header fijo — logo tipográfico a la izquierda, menú mono mayúsculas derecha.
 * Se oculta al bajar y reaparece al subir. Al clic en enlace: transición de página.
 */
export default function Header() {
  const ref = useRef<HTMLElement>(null);
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);
  const [transition, setTransition] = useState<null | string>(null);
  const logoRef = useMagnetic<HTMLAnchorElement>(0.25);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 120 && y > lastY.current) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (target: string, label: string) => {
    // Transición de página simulada (overlay lavanda + hourglass + typewriter)
    setTransition(label);
    // La transición se encarga del scrollTo al terminar
    setTimeout(() => {
      const el = document.querySelector(target);
      if (el) {
        const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis;
        if (lenis) {
          lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.2 });
        } else {
          (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
        }
      }
      // Tiempo para que la transición cierre el overlay
      setTimeout(() => setTransition(null), 600);
    }, 900);
  };

  return (
    <>
      <header
        ref={ref}
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-500"
        style={{
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
        }}
      >
        <div className="container-edge flex items-center justify-between py-5 md:py-6">
          <a
            ref={logoRef}
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-[15px] font-medium tracking-tight lowercase"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {SITE.logo}
          </a>

          <div className="flex items-center gap-5 md:gap-7">
            <nav className="hidden md:flex items-center gap-7" aria-label="Principal">
              {SITE.nav.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.target, item.label)}
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

      {transition && <PageTransition label={transition} />}
    </>
  );
}

function MobileMenu({
  onNav,
}: {
  onNav: (target: string, label: string) => void;
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
          className="absolute top-full right-6 mt-2 flex flex-col gap-3 bg-[var(--bg-light)] border rounded-2xl p-4"
          style={{ borderColor: "var(--pill-border)" }}
          aria-label="Móvil"
        >
          {SITE.nav.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                onNav(item.target, item.label);
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
