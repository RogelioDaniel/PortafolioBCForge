"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import ProjectScenes from "./scenes/ProjectScenes";
import { PROJECTS, type Project } from "@/lib/portfolio-content";
import { useScreenNav } from "@/lib/use-screen-nav";
import { getAmbient } from "@/lib/ambient-sound";

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
  const { registerSubNav } = useScreenNav();
  const sectionRef = useRef<HTMLElement>(null);
  const keywordRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);
  const [panelTick, setPanelTick] = useState(1);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const lastIndex = PROJECTS.length - 1;

  // Detona la animación de una escena al ENTRAR (patrón proxy + onUpdate, que
  // sí engancha con GSAP). Cada escena tiene su ritmo:
  //  - burger: se desarma y se re-arma una vez, luego vuelve a brincar (idle).
  //  - glass: loop lento (estalla y reconstruye) para que RELUZCA sin apurarse.
  //  - lego/crema: se construyen/caen una vez y se quedan.
  const startReveal = useCallback((index: number, delay = 0) => {
    tweenRef.current?.kill();
    progressRef.current = 0;
    const scene = PROJECTS[index]?.scene;
    const obj = { v: 0 };
    const write = () => {
      progressRef.current = obj.v;
    };
    if (scene === "burger") {
      tweenRef.current = gsap.to(obj, {
        v: 1,
        duration: 2.0,
        delay: delay + 0.3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.8,
        onUpdate: write,
      });
    } else if (scene === "glass") {
      // Lento y en bucle: da tiempo a que el vidrio reluzca.
      tweenRef.current = gsap.to(obj, {
        v: 1,
        duration: 5.5,
        delay,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        repeatDelay: 0.5,
        onUpdate: write,
      });
    } else {
      tweenRef.current = gsap.to(obj, {
        v: 1,
        duration: 2.4,
        delay,
        ease: "power2.inOut",
        onUpdate: write,
      });
    }
  }, []);

  // Entrar a un proyecto: detona su animación de escena.
  const goToProject = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(lastIndex, index));
      if (target === activeRef.current) return;
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
    startReveal(0, 0.2);
    return () => {
      tweenRef.current?.kill();
    };
  }, [startReveal]);

  useEffect(() => {
    const section = sectionRef.current;
    const keyword = keywordRef.current;
    if (!section || !keyword) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let phase = 0;
    const unsubscribe = getAmbient()?.subscribeAnalysis(
      ({ bass, mid, treble, energy }) => {
        if (motionQuery.matches) return;
        phase += 0.075 + energy * 0.06;
        section.style.setProperty("--project-bass", bass.toFixed(3));
        section.style.setProperty("--project-mid", mid.toFixed(3));
        section.style.setProperty("--project-treble", treble.toFixed(3));
        section.style.setProperty("--project-energy", energy.toFixed(3));
        section.dataset.beat = energy > 0.045 ? "on" : "off";

        (keywordRef.current ?? keyword).querySelectorAll<HTMLElement>(".project-letter").forEach(
          (letter, index) => {
            const wave = Math.sin(phase + index * 0.72);
            const counterWave = Math.cos(phase * 0.78 + index * 0.48);
            const lift = wave * (1.5 + mid * 10);
            const sway = counterWave * treble * 2.4;
            const scaleY = 1 + bass * (0.035 + (index % 3) * 0.012);
            const scaleX = 1 - bass * 0.018;
            letter.style.transform = `translate3d(${sway.toFixed(2)}px, ${lift.toFixed(2)}px, 0) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
          }
        );
      }
    );

    return () => {
      unsubscribe?.();
      delete section.dataset.beat;
    };
  }, []);

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

  const openProject = (project: Project) => {
    if (project.liveUrl && project.liveUrl !== "#") {
      window.open(project.liveUrl, "_blank", "noopener,noreferrer");
    }
  };

  const current = PROJECTS[active];

  return (
    <section
      ref={sectionRef}
      id="proyectos"
      className="project-stage relative h-[100svh] w-full overflow-hidden flex items-center justify-center"
      aria-label="Proyectos destacados"
    >
      {/* Palabra clave gigante centrada — DEBAJO de la escena */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
        <span
          ref={keywordRef}
          key={`kw-${active}`}
          className="project-keyword display whitespace-nowrap project-kw-enter"
          style={{
            fontSize: "clamp(3.2rem, 15vw, 14.5rem)",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
          }}
        >
          {Array.from(current.keyword).map((character, index) => (
            <span
              key={`${current.keyword}-${index}`}
              className="project-letter"
              style={{ "--letter-index": index } as CSSProperties}
              aria-hidden="true"
            >
              {character === " " ? "\u00a0" : character}
            </span>
          ))}
          <span className="sr-only">{current.keyword}</span>
        </span>
      </div>

      {/* Escena central (solo se monta la activa). Click en la escena → sitio. */}
      <ProjectScenes
        projects={PROJECTS}
        active={active}
        activeRef={activeRef}
        progressRef={progressRef}
        onOpen={() => openProject(current)}
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
            style={{ opacity: active === i ? 1 : 0.4, color: "var(--ink)" }}
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
