"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Project } from "@/lib/portfolio-content";
import BurgerScene from "./BurgerScene";
import LegoScene from "./LegoScene";
import IceCreamScene from "./IceCreamScene";
import GlassSceneWebGL from "./GlassSceneWebGL";

/**
 * ProjectScenes — monta las 4 escenas SVG en capas y muestra SOLO la activa.
 *
 * P4 (parpadeo): el cambio entre escenas es instantáneo (display:none en las
 *   inactivas), sin transición de opacidad que deje ver la escena anterior.
 * P3 (click): toda la capa activa captura el click; el click en la animación
 *   O en el indicador abre la URL real del proyecto.
 */
export default function ProjectScenes({
  projects,
  activeRef,
  progressRef,
}: {
  projects: Project[];
  activeRef: React.MutableRefObject<number>;
  progressRef: React.MutableRefObject<number>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Sincroniza el estado de React con activeRef (que muta GSAP)
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const cur = activeRef.current;
      if (cur !== last) {
        last = cur;
        setActive(cur);
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [activeRef]);

  const openProject = useCallback((url: string) => {
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 z-[2] flex items-center justify-center"
      aria-hidden="false"
    >
      {/* Cada escena en su propia capa; SOLO la activa está en el DOM visual.
          display:none en las inactivas evita el parpadeo de la escena anterior. */}
      <SceneLayer active={active === 0}>
        <BurgerScene
          activeRef={activeRef}
          progressRef={progressRef}
          accent={projects[0]?.accent || "#e8542a"}
          onOpen={() => openProject(projects[0]?.liveUrl)}
        />
      </SceneLayer>
      <SceneLayer active={active === 1}>
        <LegoScene
          activeRef={activeRef}
          progressRef={progressRef}
          accent={projects[1]?.accent || "#f5b82e"}
          onOpen={() => openProject(projects[1]?.liveUrl)}
        />
      </SceneLayer>
      <SceneLayer active={active === 2}>
        <IceCreamScene
          activeRef={activeRef}
          progressRef={progressRef}
          accent={projects[2]?.accent || "#a73f55"}
          onOpen={() => openProject(projects[2]?.liveUrl)}
        />
      </SceneLayer>
      <SceneLayer active={active === 3}>
        <GlassSceneWebGL
          activeRef={activeRef}
          progressRef={progressRef}
          accent={projects[3]?.accent || "#b87333"}
          onOpen={() => openProject(projects[3]?.liveUrl)}
        />
      </SceneLayer>

      {/* Indicador de click pulsante — también clickable */}
      <button
        type="button"
        onClick={() => openProject(projects[active]?.liveUrl)}
        className="click-hint absolute z-[6] bottom-[16%] left-1/2 -translate-x-1/2 flex items-center gap-2 mono text-[10px] bg-transparent border-0 cursor-pointer"
        style={{ color: "var(--ink)" }}
        aria-label={`Abrir ${projects[active]?.name} en una nueva pestaña`}
      >
        <span
          className="click-hint-dot"
          style={{ background: projects[active]?.accent || "var(--ink)" }}
          aria-hidden="true"
        />
        <span className="opacity-70">CLICK PARA VER EL SITIO →</span>
      </button>
    </div>
  );
}

/** Capa contenedora de una escena: solo la activa se renderiza visualmente. */
function SceneLayer({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        display: active ? "flex" : "none",
      }}
    >
      {children}
    </div>
  );
}
