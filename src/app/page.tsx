"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import Preloader from "@/components/portfolio/Preloader";
import BackgroundGlow from "@/components/portfolio/BackgroundGlow";
import Cursor from "@/components/portfolio/Cursor";
import Header from "@/components/portfolio/Header";
import Hero from "@/components/portfolio/Hero";
import Projects from "@/components/portfolio/Projects";
import Services from "@/components/portfolio/Services";
import Pricing from "@/components/portfolio/Pricing";
import WhatsAppButton from "@/components/portfolio/WhatsAppButton";
import KineticSection from "@/components/portfolio/KineticSection";
import AboutSection from "@/components/portfolio/AboutSection";
import FAQ from "@/components/portfolio/FAQ";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";
import SoundToggle from "@/components/portfolio/SoundToggle";
import CommandPalette from "@/components/portfolio/CommandPalette";
import ScreenNav from "@/components/portfolio/ScreenNav";
import VoxelDrifters from "@/components/portfolio/VoxelDrifters";
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
  const [appReady, setAppReady] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);
  const reduced = usePrefersReducedMotion();
  const finishPreloader = useCallback(() => setLoaded(true), []);
  const reportAppReady = useCallback(() => setAppReady(true), []);
  const startIntro = useCallback(() => setIntroStarted(true), []);

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
      {loaded && <Cursor />}

      <ScreenNavProvider enabled={loaded}>
        <div
          inert={!loaded}
          aria-hidden={!loaded}
          data-preloading={!introStarted ? "true" : undefined}
        >
          <AppShell
            reduced={reduced}
            interactive={loaded}
            heroRunning={introStarted}
            onHeroReady={reportAppReady}
          />
        </div>
      </ScreenNavProvider>

      {!loaded && (
        <Preloader
          ready={appReady}
          onExitStart={startIntro}
          onDone={finishPreloader}
        />
      )}
    </>
  );
}

/** Capa interna que vive dentro del provider para acceder al contexto. */
function AppShell({
  reduced,
  interactive,
  heroRunning,
  onHeroReady,
}: {
  reduced: boolean;
  interactive: boolean;
  heroRunning: boolean;
  onHeroReady: () => void;
}) {
  const { current, direction } = useScreenNav();

  return (
    <>
      <Header />
      {interactive && (
        <>
          <SoundToggle />
          <CommandPalette />
          <WhatsAppButton />
          <ScreenNav />
        </>
      )}

      {/* RENDIMIENTO: solo se monta la pantalla activa (y brevemente la que
          sale, para su animación de salida). Así el WebGL/RAF de las demás
          pantallas NO corre en segundo plano. */}
      <ScreenStage
        current={current}
        direction={direction}
        reduced={reduced}
        heroRunning={heroRunning}
        onHeroReady={onHeroReady}
      />
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
  heroRunning,
  onHeroReady,
}: {
  current: number;
  direction: "next" | "prev" | null;
  reduced: boolean;
  heroRunning: boolean;
  onHeroReady: () => void;
}) {
  const [stage, setStage] = useState(() => ({
    displayedCurrent: current,
    outgoing: null as number | null,
    transitionDirection: direction,
  }));

  // Ajuste de estado durante render: React reconcilia la key de la pantalla
  // anterior como "outgoing" sin desmontarla entre ambos estados.
  if (current !== stage.displayedCurrent) {
    setStage({
      displayedCurrent: current,
      outgoing: reduced ? null : stage.displayedCurrent,
      transitionDirection: direction,
    });
  }

  const displayedCurrent = stage.displayedCurrent;
  const outgoing = reduced ? null : stage.outgoing;
  const transitionDirection = stage.transitionDirection;

  useEffect(() => {
    if (outgoing === null) return;
    const isProjectReveal =
      outgoing === 0 &&
      displayedCurrent === 1 &&
      transitionDirection === "next";
    const t = window.setTimeout(() => {
      setStage((value) =>
        value.outgoing === outgoing ? { ...value, outgoing: null } : value
      );
    }, isProjectReveal ? 640 : 440);
    return () => window.clearTimeout(t);
  }, [displayedCurrent, outgoing, transitionDirection]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (outgoing === null) {
      delete root.dataset.screenTransition;
      return;
    }

    root.dataset.screenTransition = "true";
    return () => {
      delete root.dataset.screenTransition;
    };
  }, [outgoing]);

  const isProjectReveal =
    !reduced &&
    outgoing === 0 &&
    displayedCurrent === 1 &&
    transitionDirection === "next";

  return (
    <div className="screen-deck fixed inset-0 z-[1]">
      {outgoing !== null && outgoing !== displayedCurrent && (
        <ScreenSlot
          key={`in-${outgoing}`}
          index={outgoing}
          phase="exit"
          direction={transitionDirection}
          dark={SCREENS[outgoing]?.dark}
          reduced={reduced}
          transition={isProjectReveal ? "project-reveal" : undefined}
        >
          {renderScreen(
            SCREENS[outgoing].id,
            true,
            outgoing === 0 ? onHeroReady : undefined
          )}
        </ScreenSlot>
      )}
      <ScreenSlot
        key={`in-${displayedCurrent}`}
        index={displayedCurrent}
        phase="enter"
        direction={transitionDirection}
        dark={SCREENS[displayedCurrent]?.dark}
        reduced={reduced}
        transition={isProjectReveal ? "project-reveal" : undefined}
      >
        {renderScreen(
          SCREENS[displayedCurrent].id,
          heroRunning,
          displayedCurrent === 0 ? onHeroReady : undefined
        )}
      </ScreenSlot>
      {isProjectReveal && <ProjectRevealTransition />}
    </div>
  );
}

function ProjectRevealTransition() {
  return (
    <div className="project-reveal-transition" aria-hidden="true">
      <span className="project-reveal-flare" />
      <span className="project-reveal-beam" />
      <span className="project-reveal-caption">
        <span>Selected work</span>
        <strong>01</strong>
      </span>
    </div>
  );
}

/** Renderiza el componente de cada pantalla según su id. */
function renderScreen(
  id: string,
  heroRunning = true,
  onHeroReady?: () => void
) {
  switch (id) {
    case "top":
      return (
        <Hero playIntro={heroRunning} onSceneReady={onHeroReady} />
      );
    case "proyectos":
      return <Projects />;
    case "servicios":
      return <Services />;
    case "precios":
      return <Pricing />;
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
  reduced,
  transition,
  children,
}: {
  index: number;
  phase: "enter" | "exit";
  direction: "next" | "prev" | null;
  dark?: boolean;
  reduced: boolean;
  transition?: "project-reveal";
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
      data-transition={transition}
      style={{
        zIndex: phase === "enter" ? 2 : 1,
        pointerEvents: phase === "enter" ? "auto" : "none",
      }}
    >
      <VoxelDrifters screenIndex={index} reduced={reduced} />
      <div className="relative z-[2] h-full">{children}</div>
    </div>
  );
}
