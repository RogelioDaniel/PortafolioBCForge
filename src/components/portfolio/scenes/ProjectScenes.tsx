"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/portfolio-content";
import BurgerScene from "./BurgerScene";
import LegoScene from "./LegoScene";
import IceCreamScene from "./IceCreamScene";
import GlassScene from "./GlassScene";

/**
 * ProjectScenes — reemplaza al antiguo ProjectsSceneManager (Three.js).
 * Monta las 4 escenas SVG en capas absolutas y hace crossfade entre ellas
 * según el índice activo. Cada escena recibe (activeRef, progressRef) y
 * gestiona su propia animación de capas interna.
 *
 * Reemplaza también el indicador de "click para ver" + el handler de
 * apertura de URL real.
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

  const openProject = (url: string) => {
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 z-[2] pointer-events-none"
      aria-hidden="false"
    >
      {/* Cada escena en su propia capa; la activa es visible y recibe clicks */}
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
        <GlassScene
          activeRef={activeRef}
          progressRef={progressRef}
          accent={projects[3]?.accent || "#b87333"}
          onOpen={() => openProject(projects[3]?.liveUrl)}
        />
      </SceneLayer>

      {/* Indicador de click pulsante — solo en la escena activa */}
      <ClickHint active={active} accent={projects[active]?.accent || "var(--ink)"} />
    </div>
  );
}

/** Capa contenedora de una escena: absoluta, crossfade según active. */
function SceneLayer({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
      style={{
        opacity: active ? 1 : 0,
        pointerEvents: active ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}

/** Indicador "click para ver" pulsante que flota sobre la escena activa. */
function ClickHint({ active, accent }: { active: number; accent: string }) {
  return (
    <div
      key={active}
      className="click-hint pointer-events-none absolute bottom-[18%] left-1/2 -translate-x-1/2 flex items-center gap-2 mono text-[10px]"
      style={{ color: "var(--ink)" }}
    >
      <span
        className="click-hint-dot"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <span className="opacity-70">CLICK PARA VER EL SITIO →</span>
    </div>
  );
}
