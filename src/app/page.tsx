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
import Manifesto from "@/components/portfolio/Manifesto";
import AboutSection from "@/components/portfolio/AboutSection";
import Achievements from "@/components/portfolio/Achievements";
import Testimonials from "@/components/portfolio/Testimonials";
import Blog from "@/components/portfolio/Blog";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";
import ScrollProgress from "@/components/portfolio/ScrollProgress";
import SoundToggle from "@/components/portfolio/SoundToggle";
import BackToTop from "@/components/portfolio/BackToTop";
import { useKeyboardNav, KeyboardHint } from "@/lib/use-keyboard-nav";
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
  // Atajos de teclado (1–5 secciones, t/home → top)
  useKeyboardNav(loaded && !reduced);

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
      <div className="bg-noise" aria-hidden="true" />
      <Cursor />
      <ScrollProgress active={loaded} />
      {loaded && <SoundToggle />}
      {loaded && <BackToTop />}
      {loaded && !reduced && <KeyboardHint />}

      {!loaded && <Preloader onDone={() => setLoaded(true)} />}

      <div className="page-shell">
        <Header />
        <main>
          <Hero />
          <Projects />
          <Services />
          <Marquee />
          <KineticSection />
          <Manifesto />
          <AboutSection />
          <Achievements />
          <Testimonials />
          <Blog />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
