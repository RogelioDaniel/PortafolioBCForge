"use client";

import { SITE } from "@/lib/portfolio-content";
import { PixelSpark } from "./PixelIcons";

/**
 * Footer sobre lavanda:
 *  - columna de links (Proyectos, Sobre mí, Blog, Contacto, Privacidad)
 *  - columna social (LinkedIn, GitHub, Instagram, X)
 *  - email visible
 *  - nota: "Tomemos un café. Trabajo desde [CIUDAD] para todo el mundo."
 *  - abajo-izq: logo + "portfolio" en script manuscrito
 *  - abajo-der: icono pixel decorativo
 */
export default function Footer() {
  return (
    <footer className="mt-auto relative z-10 border-t" style={{ borderColor: "var(--line)" }}>
      <div className="container-edge py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-12">
          {/* Brand + nota */}
          <div className="col-span-2 md:col-span-5">
            <h3
              className="display"
              style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}
            >
              TOMEMOS
              <br />
              UN CAFÉ.
            </h3>
            <p className="mt-5 text-[14px] max-w-[34ch]">
              Trabajo desde {SITE.city} para todo el mundo. Disponible para
              nuevos proyectos.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mono-lg inline-block mt-6 underline underline-offset-4"
              style={{ fontFamily: "var(--font-space-mono)", textTransform: "lowercase" }}
            >
              {SITE.email}
            </a>
          </div>

          {/* Links */}
          <div className="md:col-span-3 md:col-start-7">
            <span className="mono text-[11px] opacity-50 block mb-4">NAVEGACIÓN</span>
            <ul className="flex flex-col gap-2">
              {SITE.nav.map((n) => (
                <li key={n.label}>
                  <a
                    href={n.target}
                    className="text-[15px] hover:translate-x-1 inline-block transition-transform duration-300"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  className="text-[15px] hover:translate-x-1 inline-block transition-transform duration-300"
                >
                  Privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-2 md:col-start-10">
            <span className="mono text-[11px] opacity-50 block mb-4">SOCIAL</span>
            <ul className="flex flex-col gap-2">
              {SITE.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] hover:translate-x-1 inline-block transition-transform duration-300"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="hairline mt-14 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-[15px] lowercase">{SITE.logo}</span>
            <span className="script text-[20px] text-[var(--ink-soft)]">
              portfolio
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="mono text-[11px] opacity-50">
              © {new Date().getFullYear()} · HECHO CON ♥ Y GSAP
            </span>
            <PixelSpark size={18} className="text-[var(--ink)]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
