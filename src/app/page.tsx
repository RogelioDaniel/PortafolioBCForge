"use client";

import { useEffect, useState } from "react";
import Preloader from "@/components/portfolio/Preloader";
import BackgroundGlow from "@/components/portfolio/BackgroundGlow";
import Cursor from "@/components/portfolio/Cursor";
import Header from "@/components/portfolio/Header";
import Hero from "@/components/portfolio/Hero";
import Projects from "@/components/portfolio/Projects";
import Services from "@/components/portfolio/Services";
import Marquee from "@/components/portfolio/Marquee";
import KineticSection from "@/components/portfolio/KineticSection";
import AboutSection from "@/components/portfolio/AboutSection";
import FAQ from "@/components/portfolio/FAQ";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";
import SoundToggle from "@/components/portfolio/SoundToggle";
import CommandPalette from "@/components/portfolio/CommandPalette";
import BackToTop from "@/components/portfolio/BackToTop";
import ScreenNav from "@/components/portfolio/ScreenNav";
import { ScreenNavProvider, useScreenNav, SCREENS } from "@/lib/use-screen-nav";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Página única — portafolio personal.
 * EXPERIENCIA GUIADA POR PANTALLAS (sin scroll libre):
 *  - ScreenNavProvider gestiona qué pantalla está activa.
 *  - Cada pantalla ocupa 100vh; solo la activa es visible.
 *  - Las flechas (ScreenNav) y el teclado/swipe cambian de pantalla.
 *  - Al cambiar de pantalla se detona un replayTick que las secciones usan
 *    para re-animar su contenido onEnter.
 *  - Se quitan: Blog, Logros, Testimonios (experiencia más enfocada).
 */
export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Bloquea scroll durante preloader (el screen-nav también lo bloquea después)
    if (!loaded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [loaded]);

  return (
    <>
      <BackgroundGlow />
      <div className="bg-noise" aria-hidden="true" />
      <Cursor />

      {!loaded && <Preloader onDone={() => setLoaded(true)} />}

      {loaded && (
        <ScreenNavProvider>
          <AppShell reduced={reduced} />
        </ScreenNavProvider>
      )}
    </>
  );
}

/** Capa interna que vive dentro del provider para acceder al contexto. */
function AppShell({ reduced }: { reduced: boolean }) {
  const { current, direction, replayTick } = useScreenNav();

  return (
    <>
      <Header />
      {<SoundToggle />}
      {<CommandPalette />}
      <BackToTop />
      <ScreenNav />

      {/* Contenedor de pantallas — solo la activa es visible */}
      <div className="screen-deck fixed inset-0 z-[1]">
        {SCREENS.map((screen, i) => (
          <ScreenSlot
            key={screen.id}
            index={i}
            active={i === current}
            direction={direction}
            replayTick={replayTick}
            reduced={reduced}
            dark={screen.dark}
          >
            {renderScreen(screen.id)}
          </ScreenSlot>
        ))}
      </div>
    </>
  );
}

/** Renderiza el componente de cada pantalla según su id. */
function renderScreen(id: string) {
  switch (id) {
    case "top":
      return <Hero />;
    case "proyectos":
      return <Projects />;
    case "servicios":
      return <Services />;
    case "marquee":
      return (
        <div className="h-full flex items-center">
          <Marquee />
        </div>
      );
    case "kinetic":
      return <KineticSection />;
    case "sobre-mi":
      return <AboutSection />;
    case "contacto":
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <FAQ />
            <Contact />
          </div>
          <Footer />
        </div>
      );
    default:
      return null;
  }
}

/**
 * ScreenSlot — un "slot" de pantalla 100vh.
 * Solo la pantalla activa se muestra. Las transiciones son slide + fade.
 * Usa el atributo data-active para que las secciones hijas puedan detectar
 * cuándo entran (vía MutationObserver o al leer replayTick).
 */
function ScreenSlot({
  index,
  active,
  direction,
  replayTick,
  reduced,
  dark,
  children,
}: {
  index: number;
  active: boolean;
  direction: "next" | "prev" | null;
  replayTick: number;
  reduced: boolean;
  dark?: boolean;
  children: React.ReactNode;
}) {
  const slotRef = (node: HTMLDivElement | null) => {
    if (node && active) {
      node.setAttribute("data-active", "true");
    } else if (node) {
      node.removeAttribute("data-active");
    }
  };

  return (
    <div
      ref={slotRef}
      className="screen-slot absolute inset-0 h-[100svh] w-full overflow-hidden"
      data-screen-index={index}
      data-replay-tick={replayTick}
      data-dark={dark ? "true" : "false"}
      style={{
        // Solo la activa es visible; las demás fuera de viewport
        visibility: active ? "visible" : "hidden",
        pointerEvents: active ? "auto" : "none",
        zIndex: active ? 2 : 1,
      }}
    >
      {children}
    </div>
  );
}
