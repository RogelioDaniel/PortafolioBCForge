"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectScenes from "./scenes/ProjectScenes";
import { PROJECTS, type Project } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Proyectos destacados — scroll storytelling (EL corazón del sitio).
 * Sección pinneada (pin: true, scrub: 1, ~400vh para 4 proyectos).
 * Por cada proyecto:
 *  - palabra clave gigante centrada (display condensado ~14vw)
 *  - escena SVG central (ProjectScenes) que reacciona al scroll
 *  - chip Website + tags mono abajo-izquierda
 *  - nombre + descripción abajo-derecha
 *  - botón pill negro "VER PROYECTO →" centro-abajo (abre URL real en nueva pestaña)
 *
 * FIX scroll rápido (amontonamiento): las transiciones usan overwrite:true,
 * duración corta y, si la velocidad de scroll es muy alta, se fuerza el
 * estado final inmediatamente para que no se solapen textos.
 * En el ÚLTIMO proyecto, un mensaje final sube suavemente invitando a contactar.
 */
export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const btnRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const finalMsgRef = useRef<HTMLDivElement>(null);

  // ref callback helper (usa callback ref para no crear refs nuevos por render)
  const setBtnRef =
    (i: number) =>
    (el: HTMLAnchorElement | null): void => {
      btnRefs.current[i] = el;
    };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".project-panel");
      const keywords = gsap.utils.toArray<HTMLElement>(".project-keyword");

      if (reduced) {
        panels.forEach((p) => gsap.set(p, { opacity: 1, y: 0 }));
        return;
      }

      const total = panels.length;
      let lastProgress = 0;
      let lastTime = performance.now();

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
              // Detectar velocidad de scroll: si es muy rápida, forzar estado inmediato
              const now = performance.now();
              const dt = now - lastTime;
              const dp = Math.abs(self.progress - lastProgress);
              const velocity = dt > 0 ? dp / dt : 0;
              const isFast = velocity > 0.0025; // umbral empírico
              lastTime = now;
              lastProgress = self.progress;

              activeRef.current = idx;
              updateActive(idx, isFast);
              setActive(idx);
            } else {
              lastTime = performance.now();
              lastProgress = self.progress;
            }
            const localP = gsap.utils.clamp(
              0,
              1,
              (self.progress - idx * seg) / seg
            );
            progressRef.current = localP;
          },
        },
      });

      function updateActive(idx: number, instant = false) {
        const dur = instant ? 0.001 : 0.4;
        panels.forEach((p, i) => {
          const kw = keywords[i];
          if (i === idx) {
            gsap.to(p, {
              autoAlpha: 1,
              duration: dur,
              ease: "power3.inOut",
              overwrite: true,
            });
            if (kw) {
              gsap.fromTo(
                kw,
                { yPercent: 120, skewY: 4 },
                {
                  yPercent: 0,
                  skewY: 0,
                  duration: Math.max(0.001, dur * 1.2),
                  ease: "power3.out",
                  overwrite: true,
                }
              );
            }
          } else if (i < idx) {
            gsap.to(p, {
              autoAlpha: 0,
              y: -20,
              duration: dur,
              ease: "power3.inOut",
              overwrite: true,
            });
            if (kw)
              gsap.set(kw, { yPercent: -120, skewY: -4, overwrite: true });
          } else {
            gsap.to(p, {
              autoAlpha: 0,
              y: 20,
              duration: dur,
              ease: "power3.inOut",
              overwrite: true,
            });
            if (kw) gsap.set(kw, { yPercent: 120, skewY: 4, overwrite: true });
          }
        });

        // Mensaje final: visible solo en el último proyecto y según progreso
        if (finalMsgRef.current) {
          const isLast = idx === total - 1;
          if (isLast) {
            const localP = gsap.utils.clamp(
              0,
              1,
              (progressRef.current - idx * (1 / total)) / (1 / total)
            );
            const showT = Math.max(0, (localP - 0.5) / 0.5);
            gsap.to(finalMsgRef.current, {
              autoAlpha: showT,
              y: (1 - showT) * 30,
              duration: instant ? 0.001 : 0.4,
              ease: "power2.out",
              overwrite: true,
            });
          } else {
            gsap.set(finalMsgRef.current, { autoAlpha: 0, y: 30 });
          }
        }
      }

      // Estado inicial
      panels.forEach((p, i) => {
        gsap.set(p, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 20 });
      });
      keywords.forEach((kw, i) => {
        gsap.set(kw, { yPercent: i === 0 ? 0 : 120, skewY: i === 0 ? 0 : 4 });
      });
      if (finalMsgRef.current) {
        gsap.set(finalMsgRef.current, { autoAlpha: 0, y: 30 });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  // Abrir la URL real del proyecto en nueva pestaña
  const openProject = (project: Project) => {
    if (project.liveUrl && project.liveUrl !== "#") {
      window.open(project.liveUrl, "_blank", "noopener,noreferrer");
    }
  };

  const lastIndex = PROJECTS.length - 1;

  return (
    <section
      ref={sectionRef}
      id="proyectos"
      className="relative"
      aria-label="Proyectos destacados"
    >
      <div style={{ height: reduced ? "auto" : `${PROJECTS.length * 100}vh` }}>
        <div
          ref={pinRef}
          className="sticky top-0 h-[100svh] w-full overflow-hidden flex items-center justify-center"
        >
          {/* Palabra clave gigante centrada — DEBAJO del canvas */}
          <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full">
              {PROJECTS.map((p) => (
                <div
                  key={p.keyword}
                  className="project-keyword absolute inset-0 flex items-center justify-center overflow-hidden"
                >
                  <span
                    className="display whitespace-nowrap"
                    style={{
                      fontSize: "clamp(3.2rem, 15vw, 14.5rem)",
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

          {/* Escenas SVG centrales — sobre el texto */}
          <ProjectScenes
            projects={PROJECTS}
            activeRef={activeRef}
            progressRef={progressRef}
          />

          {/* Mensaje final (último proyecto) — sube suavemente */}
          <div
            ref={finalMsgRef}
            className="absolute z-[5] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 mt-[22vh] text-center pointer-events-none"
            style={{ width: "min(90vw, 520px)" }}
          >
            <p
              className="display"
              style={{
                fontSize: "clamp(1rem, 2.4vw, 1.8rem)",
                color: "var(--ink)",
                lineHeight: 1.1,
              }}
            >
              ¿NECESITAS RENOVAR TU PÁGINA O CREAR TU CONCEPTO DE NEGOCIO?
            </p>
            <p className="mono text-[11px] mt-3 opacity-70">
              HAGÁMOSLO JUNTOS →
            </p>
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
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(PROJECTS.length).padStart(2, "0")}
                  </span>
                  <span
                    className="block h-px flex-1 max-w-[120px]"
                    style={{ background: "var(--line)" }}
                  />
                </div>
              </div>

              {/* Bottom: tags izq + desc der + botón centro */}
              <div className="container-edge pb-10 md:pb-14">
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end"
                  style={{ pointerEvents: "auto" }}
                >
                  {/* Tags */}
                  <div className="md:col-span-4 flex flex-wrap items-center gap-3">
                    <span
                      className="pill"
                      style={{ borderColor: p.accent, color: p.accent }}
                    >
                      Website
                    </span>
                    <span className="mono text-[11px] opacity-70">
                      {p.tags.join(" / ")}
                    </span>
                  </div>

                  {/* Botón centro — abre URL real en nueva pestaña */}
                  <div className="md:col-span-4 flex justify-start md:justify-center">
                    <a
                      ref={setBtnRef(i)}
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        openProject(p);
                      }}
                      className="btn-primary"
                      data-cursor="VER"
                      aria-label={`Abrir ${p.name} en una nueva pestaña`}
                    >
                      Ver proyecto
                      <span className="btn-arrow" aria-hidden="true">
                        →
                      </span>
                    </a>
                  </div>

                  {/* Desc derecha */}
                  <div className="md:col-span-4 md:text-right">
                    <h3
                      className="mb-2"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontWeight: 600,
                        fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
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
                    background: active === i ? p.accent : "var(--ink)",
                  }}
                />
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
