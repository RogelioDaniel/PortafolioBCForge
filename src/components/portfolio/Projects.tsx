"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectsSceneManager from "./three/ProjectsSceneManager";
import ProjectModal from "./ProjectModal";
import { PROJECTS, type Project } from "@/lib/portfolio-content";
import { useMagnetic, usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Proyectos destacados — scroll storytelling (EL corazón del sitio).
 * Sección pinneada (pin: true, scrub: 1, ~400vh para 4 proyectos).
 * Por cada proyecto:
 *  - palabra clave gigante centrada (display condensado ~14vw)
 *  - objeto 3D central (ProjectsSceneManager) que rota con scroll
 *  - chip Website + tags mono abajo-izquierda
 *  - nombre + descripción abajo-derecha
 *  - botón pill negro "VER PROYECTO →" centro-abajo
 * Transición: palabra sale hacia arriba con skew, nueva entra desde abajo;
 * objeto 3D hace crossfade/morph; textos laterales fade-slide (0.6s, power3.inOut).
 */
export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const reduced = usePrefersReducedMotion();
  const btnRef = useMagnetic<HTMLAnchorElement>(0.4);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".project-panel");
      const keywords = gsap.utils.toArray<HTMLElement>(".project-keyword");

      if (reduced) {
        // Sin pin: mostrar todo en flujo
        panels.forEach((p) => gsap.set(p, { opacity: 1, y: 0 }));
        return;
      }

      // Pin de la sección
      const total = panels.length;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${total * 100}%`,
          pin: pinRef.current,
          scrub: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            const seg = 1 / total;
            const idx = Math.min(
              total - 1,
              Math.floor(self.progress / seg)
            );
            if (idx !== activeRef.current) {
              activeRef.current = idx;
              updateActive(idx);
              setActive(idx);
            }
            // progreso local del proyecto activo (0..1)
            const localP = gsap.utils.clamp(
              0,
              1,
              (self.progress - idx * seg) / seg
            );
            progressRef.current = localP;
          },
        },
      });

      function updateActive(idx: number) {
        panels.forEach((p, i) => {
          const kw = keywords[i];
          if (i === idx) {
            gsap.to(p, {
              autoAlpha: 1,
              duration: 0.6,
              ease: "power3.inOut",
            });
            if (kw) {
              gsap.fromTo(
                kw,
                { yPercent: 120, skewY: 4 },
                { yPercent: 0, skewY: 0, duration: 0.7, ease: "power3.out" }
              );
            }
          } else if (i < idx) {
            gsap.set(p, { autoAlpha: 0, y: -20 });
            if (kw) gsap.set(kw, { yPercent: -120, skewY: -4 });
          } else {
            gsap.set(p, { autoAlpha: 0, y: 20 });
            if (kw) gsap.set(kw, { yPercent: 120, skewY: 4 });
          }
        });
      }

      // Estado inicial
      panels.forEach((p, i) => {
        gsap.set(p, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 20 });
      });
      keywords.forEach((kw, i) => {
        gsap.set(kw, { yPercent: i === 0 ? 0 : 120, skewY: i === 0 ? 0 : 4 });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="proyectos"
      className="relative"
      aria-label="Proyectos destacados"
    >
      {/* Altura total = 100% * número de proyectos */}
      <div style={{ height: reduced ? "auto" : `${PROJECTS.length * 100}vh` }}>
        <div
          ref={pinRef}
          className="sticky top-0 h-[100svh] w-full overflow-hidden flex items-center justify-center"
        >
          {/* Escena 3D central */}
          <ProjectsSceneManager
            projects={PROJECTS}
            activeRef={activeRef}
            progressRef={progressRef}
          />

          {/* Palabra clave gigante centrada (capa sobre el 3D) */}
          <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full">
              {PROJECTS.map((p, i) => (
                <div
                  key={p.keyword}
                  className="project-keyword absolute inset-0 flex items-center justify-center overflow-hidden"
                >
                  <span
                    className="display"
                    style={{
                      fontSize: "clamp(3rem, 14vw, 13rem)",
                      opacity: 0.18,
                      color: "var(--ink)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {p.keyword}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Paneles de contenido por proyecto (tags / nombre / desc / botón) */}
          {PROJECTS.map((p, i) => (
            <div
              key={p.name}
              className="project-panel absolute inset-0 z-[3] flex flex-col justify-between"
              style={{ pointerEvents: "none" }}
            >
              {/* Top: índice */}
              <div className="container-edge pt-24 md:pt-28">
                <div className="flex items-center gap-3">
                  <span className="mono text-[11px] opacity-60">
                    {String(i + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
                  </span>
                  <span
                    className="block h-px flex-1 max-w-[120px]"
                    style={{ background: "var(--line)" }}
                  />
                </div>
              </div>

              {/* Centro: nombre + palabra clave legible (móvil) */}
              <div className="container-edge md:hidden text-center">
                <span
                  className="display block"
                  style={{ fontSize: "clamp(2rem, 11vw, 5rem)" }}
                >
                  {p.keyword}
                </span>
              </div>

              {/* Bottom: tags izq + desc der + botón centro */}
              <div className="container-edge pb-10 md:pb-14">
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end"
                  style={{ pointerEvents: "auto" }}
                >
                  {/* Tags */}
                  <div className="md:col-span-4 flex flex-wrap gap-2">
                    <span className="pill">Website</span>
                    {p.tags.map((t) => (
                      <span key={t} className="pill">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Botón centro */}
                  <div className="md:col-span-4 flex justify-start md:justify-center">
                    <button
                      ref={i === 0 ? btnRef : undefined}
                      onClick={() => setModalProject(p)}
                      className="btn-primary"
                      data-cursor="VER"
                      aria-label={`Ver proyecto ${p.name}`}
                    >
                      Ver proyecto
                      <span className="btn-arrow" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </div>

                  {/* Desc derecha */}
                  <div className="md:col-span-4 md:text-right">
                    <h3
                      className="font-bold mb-2"
                      style={{
                        fontFamily: "var(--font-archivo)",
                        fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
                        textTransform: "uppercase",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p.name}
                    </h3>
                    <p className="text-[13px] md:text-[14px] leading-relaxed max-w-[42ch] md:ml-auto">
                      {p.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Indicador de progreso lateral con estado activo */}
          <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-[4] flex-col gap-3 items-end">
            {PROJECTS.map((p, i) => (
              <button
                key={p.keyword}
                onClick={() => {
                  // Saltar al proyecto i (scroll relativo a la sección)
                  const seg = 1 / PROJECTS.length;
                  const targetProg = i * seg + seg * 0.5;
                  const st = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis;
                  if (sectionRef.current) {
                    const rect = sectionRef.current.getBoundingClientRect();
                    const totalH = rect.height - window.innerHeight;
                    const y = window.scrollY + rect.top + totalH * targetProg;
                    if (st) {
                      st.scrollTo(sectionRef.current, {
                        offset: totalH * targetProg,
                        duration: 1,
                      });
                    } else {
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }
                }}
                className="group flex items-center gap-2 mono text-[10px] transition-all duration-300"
                style={{
                  opacity: active === i ? 1 : 0.4,
                  color: "var(--ink)",
                }}
                aria-label={`Ir al proyecto ${i + 1}: ${p.keyword}`}
              >
                <span
                  className="block h-px transition-all duration-300"
                  style={{
                    width: active === i ? 28 : 12,
                    background: "var(--ink)",
                  }}
                />
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de detalle del proyecto — key remounts on project change */}
      {modalProject && (
        <ProjectModal
          key={modalProject.name}
          project={modalProject}
          onClose={() => setModalProject(null)}
        />
      )}
    </section>
  );
}
