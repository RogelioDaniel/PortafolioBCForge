"use client";

import { useEffect, useRef, useState } from "react";
import Preloader from "@/components/portfolio/Preloader";
import BackgroundGlow from "@/components/portfolio/BackgroundGlow";
import Cursor from "@/components/portfolio/Cursor";
import Header from "@/components/portfolio/Header";
import Hero from "@/components/portfolio/Hero";
import Projects from "@/components/portfolio/Projects";
import Services from "@/components/portfolio/Services";
import Pricing from "@/components/portfolio/Pricing";
import WhatsAppButton from "@/components/portfolio/WhatsAppButton";
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
  const { current, direction } = useScreenNav();

  return (
    <>
      <Header />
      {<SoundToggle />}
      {<CommandPalette />}
      <BackToTop />
      <WhatsAppButton />
      <ScreenNav />

      {/* RENDIMIENTO: solo se monta la pantalla activa (y brevemente la que
          sale, para su animación de salida). Así el WebGL/RAF de las demás
          pantallas NO corre en segundo plano. */}
      <ScreenStage current={current} direction={direction} reduced={reduced} />
    </>
  );
}

/**
 * ScreenStage — monta SOLO la pantalla activa. Durante una transición mantiene
 * montada la pantalla saliente ~640ms para animar su salida (slide + fade).
 */
function ScreenStage({
  current,
  direction,
  reduced,
}: {
  current: number;
  direction: "next" | "prev" | null;
  reduced: boolean;
}) {
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const prevCurrent = useRef(current);

  useEffect(() => {
    if (current === prevCurrent.current) return;
    const leaving = prevCurrent.current;
    prevCurrent.current = current;
    if (reduced) {
      setOutgoing(null);
      return;
    }
    setOutgoing(leaving);
    const t = window.setTimeout(() => setOutgoing(null), 640);
    return () => window.clearTimeout(t);
  }, [current, reduced]);

  return (
    <div className="screen-deck fixed inset-0 z-[1]">
      {outgoing !== null && outgoing !== current && (
        <ScreenSlot
          key={`in-${outgoing}`}
          index={outgoing}
          phase="exit"
          direction={direction}
          dark={SCREENS[outgoing]?.dark}
        >
          {renderScreen(SCREENS[outgoing].id)}
        </ScreenSlot>
      )}
      <ScreenSlot
        key={`in-${current}`}
        index={current}
        phase="enter"
        direction={direction}
        dark={SCREENS[current]?.dark}
      >
        {renderScreen(SCREENS[current].id)}
      </ScreenSlot>
    </div>
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
    case "precios":
      return <Pricing />;
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
      // data-screen-scroll: el screen-nav cede la rueda a este contenedor
      // mientras no esté en su borde (así se puede leer FAQ + contacto + footer).
      return (
        <div
          data-screen-scroll
          className="h-[100svh] w-full overflow-y-auto overflow-x-hidden"
        >
          <FAQ />
          <Contact />
          <Footer />
        </div>
      );
    default:
      return null;
  }
}

/**
 * ScreenSlot — un "slot" de pantalla 100vh.
 * phase="enter" anima la entrada; phase="exit" anima la salida. La dirección
 * (next/prev) decide el sentido del deslizamiento.
 */
function ScreenSlot({
  index,
  phase,
  direction,
  dark,
  children,
}: {
  index: number;
  phase: "enter" | "exit";
  direction: "next" | "prev" | null;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="screen-slot absolute inset-0 h-[100svh] w-full overflow-y-auto overflow-x-hidden"
      data-screen-index={index}
      data-active={phase === "enter" ? "true" : undefined}
      data-phase={phase}
      data-dir={direction ?? "next"}
      data-dark={dark ? "true" : "false"}
      style={{
        zIndex: phase === "enter" ? 2 : 1,
        pointerEvents: phase === "enter" ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}
