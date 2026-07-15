"use client";

import { useEffect } from "react";
import { SITE } from "@/lib/portfolio-content";

/**
 * useKeyboardNav — atajos de teclado para saltar a secciones.
 * 1 → Proyectos, 2 → Sobre mí, 3 → Lab, 4 → Blog, 5 → Contacto.
 * También: Home/t → top, ? → mostrar ayuda.
 * No interfiere con inputs (no activa cuando el foco está en un campo).
 */
export function useKeyboardNav(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      const map: Record<string, string> = {
        "1": "#proyectos",
        "2": "#sobre-mi",
        "3": "#logros",
        "4": "#blog",
        "5": "#contacto",
        t: "#top",
        home: "#top",
      };
      const target = map[key];
      if (target) {
        e.preventDefault();
        const el = document.querySelector(target);
        if (el) {
          const lenis = (
            window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }
          ).__lenis;
          if (lenis) {
            lenis.scrollTo(el as HTMLElement, { duration: 1.2 });
          } else {
            (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}

/** Hint visual de atajos (esquina, fade tras 6s). */
export function KeyboardHint() {
  useEffect(() => {
    const el = document.getElementById("kb-hint");
    if (!el) return;
    const t = setTimeout(() => {
      el.style.opacity = "0";
    }, 7000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      id="kb-hint"
      className="fixed bottom-20 left-5 z-40 hidden md:block transition-opacity duration-700 pointer-events-none"
      style={{ opacity: 0 }}
    >
      <div
        className="mono text-[10px] px-3 py-2 rounded-lg border"
        style={{
          borderColor: "var(--pill-border)",
          background: "rgba(220,226,240,0.85)",
          backdropFilter: "blur(8px)",
          color: "var(--ink)",
        }}
      >
        <div className="opacity-90">ATAJOS</div>
        <div className="opacity-60 mt-1">1–5 · secciones</div>
        <div className="opacity-60 mt-0.5">⌘K · búsqueda</div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `setTimeout(()=>{var e=document.getElementById('kb-hint');if(e){e.style.opacity='0.7';}},1500);`,
        }}
      />
    </div>
  );
}
