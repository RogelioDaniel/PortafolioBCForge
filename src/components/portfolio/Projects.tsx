"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import ProjectScenes from "./scenes/ProjectScenes";
import { PROJECTS, type Project } from "@/lib/portfolio-content";
import { useScreenNav } from "@/lib/use-screen-nav";

/**
 * Proyectos destacados — EXPERIENCIA GUIADA POR BOTONES (sin scroll).
 *
 * Las flechas ‹ › grandes (sub-nav propia de proyectos, además de las del
 * screen-nav global) avanzan entre los 4 proyectos. Al cambiar de proyecto:
 *  - activeRef se actualiza (la escena correspondiente se muestra).
 *  - progressRef se anima de 0→1 con GSAP (~2.2s) para detonar la animación
 *    de esa escena (hamburguesa se desarma, lego se arma, crema cae, vidrio
 *    se fractura). En el ÚLTIMO proyecto el progreso sube y se mantiene.
 *  - El texto (nombre/descripción/tags arriba) se intercambia con fade.
 *
 * P1: NO hay mensaje final sobre el último proyecto (tapaba la animación).
 * El mensaje "¿necesitas renovar tu página?" vive en la pantalla de Servicios.
 */
export default function Projects() {
  const { replayTick } = useScreenNav();
  const activeRef = useRef(0);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);
  const [panelTick, setPanelTick] = useState(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const lastIndex = PROJECTS.length - 1;

  // Cambiar de proyecto (sub-navegación dentro de la pantalla de proyectos)
  const goToProject = (index: number) => {
    const target = Math.max(0, Math.min(lastIndex, index));
    if (target === activeRef.current) return;
    activeRef.current = target;
    setActive(target);
    setPanelTick((t) => t + 1);
    // Detonar la animación de la nueva escena: progress 0→1
    tweenRef.current?.kill();
    progressRef.current = 0;
    // El último proyecto mantiene el progreso subiendo hasta 1 (sin loop)
    tweenRef.current = gsap.to(progressRef, {
      current: 1,
      duration: target === lastIndex ? 2.4 : 2.2,
      ease: "power2.inOut",
    });
  };

  // Al entrar a esta pantalla (replayTick cambia), re-detonar el proyecto 0
  useEffect(() => {
    activeRef.current = 0;
    progressRef.current = 0;
    setActive(0);
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(progressRef, {
      current: 1,
      duration: 2.4,
      ease: "power2.inOut",
      delay: 0.3,
    });
    return () => {
      tweenRef.current?.kill();
    };
  }, [replayTick]);

  const openProject = (project: Project) => {
    if (project.liveUrl && project.liveUrl !== "#") {
      window.open(project.liveUrl, "_blank", "noopener,noreferrer");
    }
  };

  const current = PROJECTS[active];

  return (
    <section
      id="proyectos"
      className="relative h-[100svh] w-full overflow-hidden flex items-center justify-center"
      aria-label="Proyectos destacados"
    >
      {/* Palabra clave gigante centrada — DEBAJO del canvas */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
        <span
          key={`kw-${active}`}
          className="project-keyword display whitespace-nowrap project-kw-enter"
          style={{
            fontSize: "clamp(3.2rem, 15vw, 14.5rem)",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
          }}
        >
          {current.keyword}
        </span>
      </div>

      {/* Escenas SVG/WebGL centrales — sobre el texto */}
      <ProjectScenes
        projects={PROJECTS}
        activeRef={activeRef}
        progressRef={progressRef}
      />

      {/* Panel superior: índice + nombre + tags + descripción (lejos de botones) */}
      <div className="absolute top-0 left-0 right-0 z-[3] container-edge pt-24 md:pt-28 pointer-events-none">
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[11px] opacity-60">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(PROJECTS.length).padStart(2, "0")}
          </span>
          <span
            className="block h-px flex-1 max-w-[120px]"
            style={{ background: "var(--line)" }}
          />
          <span
            className="pill"
            style={{ borderColor: current.accent, color: current.accent }}
          >
            Website
          </span>
        </div>
        <div
          key={`panel-${panelTick}`}
          className="project-panel-enter flex flex-col md:flex-row md:items-baseline md:justify-between gap-3"
        >
          <h3
            className="shrink-0"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 600,
              fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)",
              letterSpacing: "-0.01em",
            }}
          >
            {current.name}
          </h3>
          <p className="text-[12px] md:text-[13px] leading-relaxed max-w-[44ch] md:text-right opacity-80">
            {current.description}
          </p>
        </div>
      </div>

      {/* Panel inferior: SOLO botón "Ver proyecto" centrado */}
      <div className="absolute bottom-0 left-0 right-0 z-[3] container-edge pb-10 md:pb-14">
        <div className="flex justify-center" style={{ pointerEvents: "auto" }}>
          <a
            href={current.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openProject(current);
            }}
            className="btn-primary"
            data-cursor="VER"
            aria-label={`Abrir ${current.name} en una nueva pestaña`}
          >
            Ver proyecto
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>

      {/* Sub-navegación de proyectos: flechas ‹ › laterales grandes */}
      <button
        onClick={() => goToProject(active - 1)}
        disabled={active === 0}
        aria-label="Proyecto anterior"
        data-cursor="ATRÁS"
        className="project-subnav project-subnav-left disabled:opacity-0 disabled:pointer-events-none"
      >
        <svg viewBox="0 0 14 14" shapeRendering="crispEdges" className="w-full h-full" style={{ color: "var(--ink)" }} aria-hidden="true">
          <rect x="5" y="6" width="9" height="2" fill="currentColor" />
          <rect x="3" y="4" width="2" height="2" fill="currentColor" />
          <rect x="1" y="2" width="2" height="2" fill="currentColor" />
          <rect x="3" y="8" width="2" height="2" fill="currentColor" />
          <rect x="1" y="10" width="2" height="2" fill="currentColor" />
        </svg>
      </button>
      <button
        onClick={() => goToProject(active + 1)}
        disabled={active === lastIndex}
        aria-label="Proyecto siguiente"
        data-cursor="SIGUIENTE"
        className="project-subnav project-subnav-right disabled:opacity-0 disabled:pointer-events-none"
      >
        <svg viewBox="0 0 14 14" shapeRendering="crispEdges" className="w-full h-full" style={{ color: "var(--ink)" }} aria-hidden="true">
          <rect x="0" y="6" width="9" height="2" fill="currentColor" />
          <rect x="9" y="4" width="2" height="2" fill="currentColor" />
          <rect x="11" y="2" width="2" height="2" fill="currentColor" />
          <rect x="9" y="8" width="2" height="2" fill="currentColor" />
          <rect x="11" y="10" width="2" height="2" fill="currentColor" />
        </svg>
      </button>

      {/* Indicador de progreso lateral (dots) */}
      <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-[4] flex-col gap-3 items-end">
        {PROJECTS.map((p, i) => (
          <button
            key={p.keyword}
            onClick={() => goToProject(i)}
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
    </section>
  );
}
