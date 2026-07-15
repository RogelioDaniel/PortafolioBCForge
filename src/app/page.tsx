"use client";

import { useEffect, useState } from "react";
import Preloader from "@/components/portfolio/Preloader";
import BackgroundGlow from "@/components/portfolio/BackgroundGlow";
import Cursor from "@/components/portfolio/Cursor";
import Header from "@/components/portfolio/Header";
import Hero from "@/components/portfolio/Hero";
import Projects from "@/components/portfolio/Projects";
import Services from "@/components/portfolio/Services";
import KineticSection from "@/components/portfolio/KineticSection";
import Manifesto from "@/components/portfolio/Manifesto";
import Achievements from "@/components/portfolio/Achievements";
import Blog from "@/components/portfolio/Blog";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";
import { useSmoothScroll } from "@/lib/use-smooth-scroll";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Página única — portafolio personal.
 * Preloader → smooth scroll (Lenis) → todas las secciones.
 */
export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const reduced = usePrefersReducedMotion();

  // Smooth scroll solo tras preloader y si no hay reduced motion
  useSmoothScroll(loaded && !reduced);

  useEffect(() => {
    // Bloquea scroll durante preloader
    if (!loaded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [loaded]);

  return (
    <>
      <BackgroundGlow />
      <Cursor />

      {!loaded && <Preloader onDone={() => setLoaded(true)} />}

      <div className="page-shell">
        <Header />
        <main>
          <Hero />
          <Projects />
          <Services />
          <KineticSection />
          <Manifesto />
          <Achievements />
          <Blog />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
