"use client";

import { useEffect, useState } from "react";
import { scrollToSection } from "@/lib/use-smooth-scroll";

/**
 * BackToTop — botón flotante (esquina inferior-derecha) que aparece
 * tras hacer scroll > 80vh. Flecha pixelada hacia arriba.
 * Se oculta en touch para no estorbar.
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={toTop}
      aria-label="Volver arriba"
      data-cursor="ARRIBA"
      className="fixed bottom-5 right-5 z-40 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 hover:scale-110"
      style={{
        borderColor: "rgba(14,14,16,0.25)",
        background: "rgba(220,226,240,0.35)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        opacity: show ? 0.55 : 0,
        transform: show ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
        pointerEvents: show ? "auto" : "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.55";
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 8 8"
        shapeRendering="crispEdges"
        aria-hidden="true"
        style={{ color: "var(--ink)" }}
      >
        <rect x="3" y="0" width="2" height="2" fill="currentColor" />
        <rect x="2" y="2" width="4" height="1" fill="currentColor" />
        <rect x="1" y="3" width="6" height="1" fill="currentColor" />
        <rect x="0" y="4" width="8" height="1" fill="currentColor" />
        <rect x="3" y="5" width="2" height="3" fill="currentColor" />
      </svg>
    </button>
  );
}
