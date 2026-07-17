"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import ProjectScenes from "./scenes/ProjectScenes";
import { PROJECTS, type Project } from "@/lib/portfolio-content";
import { useScreenNav } from "@/lib/use-screen-nav";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Proyectos destacados — EXPERIENCIA GUIADA (sin scroll).
 *
 * Navegación: las flechas globales / teclado / rueda avanzan de proyecto en
 * proyecto (registrado como sub-nav en el screen-nav). Solo al pasar el último
 * proyecto se cruza a la pantalla de Servicios. También hay dots a la derecha.
 *
 * Animación de escena:
 *  - Escenas "auto" (lego, crema, vidrio): al entrar, progressRef se anima
 *    0→1 (~2.2s) y se detona la animación de la escena.
 *  - Escena "click" (hamburguesa): entra en IDLE (brinca). Al hacer click se
 *    desarma (progress 0→1) y luego se re-arma para volver a brincar.
 *  - "Ver proyecto" abre la URL real en una pestaña nueva.
 */

export default function Projects() {
  const { registerSubNav, notifySubNavChange } = useScreenNav();
  const reduced = usePrefersReducedMotion();
  const activeRef = useRef(0);
  const progressRef = useRef(0);
  const revealCompleteRef = useRef(false);
  const [active, setActive] = useState(0);
  const [panelTick, setPanelTick] = useState(1);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const reducedRef = useRef(reduced);

  useLayoutEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  const lastIndex = PROJECTS.length - 1;
  const current = PROJECTS[active];

  // Detona la animación de una escena al ENTRAR (patrón proxy + onUpdate, que
  // sí engancha con GSAP). Cada escena tiene su ritmo:
  //  - burger: se desarma y se re-arma una vez, luego vuelve a brincar (idle).
  //  - glass: estalla y se reconstruye una sola vez.
  //  - lego/crema: se construyen/caen una vez y se quedan.
  const startReveal = useCallback((index: number, delay = 0) => {
    tweenRef.current?.kill();
    progressRef.current = 0;
    revealCompleteRef.current = false;
    const scene = PROJECTS[index]?.scene;
    if (reducedRef.current) {
      progressRef.current = scene === "burger" ? 0 : 1;
      revealCompleteRef.current = true;
      return;
    }
    const obj = { v: 0 };
    const write = () => {
      progressRef.current = obj.v;
    };
    const complete = () => {
      progressRef.current = scene === "burger" ? 0 : 1;
      revealCompleteRef.current = true;
    };
    if (scene === "burger") {
      tweenRef.current = gsap.to(obj, {
        v: 1,
        duration: 1.45,
        delay: delay + 0.15,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.35,
        onUpdate: write,
        onComplete: complete,
      });
    } else if (scene === "cafe") {
      // La escena traduce este progreso lineal a: arrugar, cambiar la comanda
      // dentro de la bola y desdoblar. Replica el ritmo del sitio original.
      tweenRef.current = gsap.to(obj, {
        v: 1,
        duration: 2.45,
        delay,
        ease: "none",
        onUpdate: write,
        onComplete: complete,
      });
    } else if (scene === "glass") {
      // Tres fases legibles: apertura, suspensión y reconstrucción. La curva
      // vive en GlassSceneWebGL para conservar tiempos uniformes aquí.
      tweenRef.current = gsap.to(obj, {
        v: 1,
        duration: 4.6,
        delay,
        ease: "none",
        onUpdate: write,
        onComplete: complete,
      });
    } else {
      tweenRef.current = gsap.to(obj, {
        v: 1,
        duration: 1.7,
        delay,
        ease: "power2.out",
        onUpdate: write,
        onComplete: complete,
      });
    }
  }, []);

  useEffect(() => {
    if (!reduced) return;
    tweenRef.current?.kill();
    progressRef.current = current.scene === "burger" ? 0 : 1;
    revealCompleteRef.current = true;
  }, [current.scene, reduced]);

  // Entrar a un proyecto: detona su animación de escena.
  const goToProject = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(lastIndex, index));
      if (target === activeRef.current) return;
      const root = document.documentElement;
      root.dataset.projectTransition = "true";
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      transitionTimerRef.current = window.setTimeout(() => {
        if (root.dataset.projectTransition === "true") {
          delete root.dataset.projectTransition;
        }
        transitionTimerRef.current = null;
      }, 720);
      activeRef.current = target;
      setActive(target);
      setPanelTick((t) => t + 1);
      startReveal(target);
    },
    [lastIndex, startReveal]
  );

  // Al montar (entrar a la pantalla de proyectos): arrancar en el proyecto 0.
  useEffect(() => {
    activeRef.current = 0;
    progressRef.current = 0;
    startReveal(0);
    return () => {
      tweenRef.current?.kill();
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
      delete document.documentElement.dataset.projectTransition;
    };
  }, [startReveal]);

  // El glow global cambia de material/color con el proyecto activo.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const tone = current.scene;
    root.dataset.projectTone = tone;
    return () => {
      if (root.dataset.projectTone === tone) {
        delete root.dataset.projectTone;
      }
    };
  }, [current.scene]);

  // Registrar la sub-navegación: las flechas globales avanzan de proyecto.
  useEffect(() => {
    const sub = {
      screenIndex: 1, // índice de "proyectos" en SCREENS
      atStart: () => activeRef.current <= 0,
      atEnd: () => activeRef.current >= lastIndex,
      next: () => goToProject(activeRef.current + 1),
      prev: () => goToProject(activeRef.current - 1),
    };
    registerSubNav(sub);
    return () => registerSubNav(sub, true);
  }, [registerSubNav, goToProject, lastIndex]);

  useEffect(() => {
    notifySubNavChange();
  }, [active, notifySubNavChange]);

  const openProject = useCallback((project: Project) => {
    if (project.liveUrl && project.liveUrl !== "#") {
      window.open(project.liveUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  // Identidad estable: evita reconstruir el renderer de PRISMA cuando el
  // contexto de navegación vuelve a renderizar la pantalla.
  const openCurrentProject = useCallback(() => {
    const project = PROJECTS[activeRef.current];
    if (project) openProject(project);
  }, [openProject]);

  return (
    <section
      id="proyectos"
      className="project-stage relative h-[100svh] w-full overflow-hidden flex items-center justify-center"
      data-project-tone={current.scene}
      aria-label="Proyectos destacados"
    >
      {/* Helado Nube y Café Tonalli ya llevan lettering dentro de su escena. */}
      {current.scene !== "icecream" && current.scene !== "cafe" && (
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
      )}

      {/* Escena central (solo se monta la activa). Click en la escena → sitio. */}
      <ProjectScenes
        projects={PROJECTS}
        active={active}
        activeRef={activeRef}
        progressRef={progressRef}
        revealCompleteRef={revealCompleteRef}
        onOpen={openCurrentProject}
      />

      {/* Panel superior: nombre + descripción del proyecto.
          El indicador y pill van alineados a la izquierda con el nombre para
          no chocar con el menú de navegación (arriba-derecha). */}
      <div
        className="absolute top-0 left-0 right-0 z-[3] container-edge pointer-events-none"
        style={{ paddingTop: "clamp(6.5rem, 9vw, 9rem)" }}
      >
        <div
          key={`panel-${panelTick}`}
          className="project-panel-enter max-w-[52rem]"
        >
          {/* Línea 1: nombre + indicador + pill */}
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h3
              className="shrink-0 leading-tight"
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 600,
                fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)",
                letterSpacing: "-0.01em",
              }}
            >
              {current.name}
            </h3>
            <span
              className="block h-px hidden md:block"
              style={{ width: 32, background: "var(--line)" }}
            />
            <span className="mono text-[11px] opacity-60">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(PROJECTS.length).padStart(2, "0")}
            </span>
            <span
              className="pill"
              style={{ borderColor: current.accent, color: current.accent }}
            >
              Website
            </span>
          </div>
          {/* Línea 2: descripción */}
          <p className="mt-3 text-[13px] md:text-[15px] leading-relaxed max-w-[52ch] opacity-80">
            {current.description}
          </p>
        </div>
      </div>

      {/* Botón "Ver proyecto" — elevado para NO chocar con la nav global inferior */}
      <div className="absolute left-0 right-0 bottom-24 md:bottom-28 z-[3] container-edge">
        <div className="project-cta-reactive flex justify-center" style={{ pointerEvents: "auto" }}>
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

      {/* Indicador de proyectos (dots) a la derecha — también navega */}
      <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-[4] flex-col gap-3 items-end">
        {PROJECTS.map((p, i) => (
          <button
            key={p.keyword}
            onClick={() => goToProject(i)}
            className={`project-dot group flex items-center gap-2 mono text-[10px] transition-all duration-300${active === i ? " is-active" : ""}`}
            style={{ opacity: active === i ? 1 : 0.6, color: "var(--ink)" }}
            aria-label={`Ir al proyecto ${i + 1}: ${p.keyword}`}
          >
            <span
              className="block h-1.5 rounded-full transition-all duration-300"
              style={{
                width: active === i ? 24 : 6,
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
