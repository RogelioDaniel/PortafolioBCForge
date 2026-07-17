"use client";

import type { Project } from "@/lib/portfolio-content";
import BurgerScene from "./BurgerScene";
import LegoScene from "./LegoScene";
import IceCreamScene from "./IceCreamScene";
import GlassSceneWebGL from "./GlassSceneWebGL";

/**
 * ProjectScenes — muestra SOLO la escena del proyecto activo.
 *
 * RENDIMIENTO / BUG NaN: antes se montaban las 4 escenas a la vez (las
 * inactivas con display:none). La escena WebGL de vidrio se inicializaba con
 * ancho/alto = 0 → geometría con posiciones NaN (spam en consola) y, además,
 * los 4 loops de animación corrían siempre. Ahora solo se monta la activa, así
 * que la escena WebGL se inicializa ya con tamaño y solo corre un loop.
 *
 * Click en la escena → onOpen() abre la URL real del proyecto (el sitio en vivo).
 * La animación de cada escena se detona automáticamente al entrar (Projects.tsx).
 */
export default function ProjectScenes({
  projects,
  active,
  activeRef,
  progressRef,
  revealCompleteRef,
  onOpen,
}: {
  projects: Project[];
  active: number;
  activeRef: React.MutableRefObject<number>;
  progressRef: React.MutableRefObject<number>;
  revealCompleteRef: React.MutableRefObject<boolean>;
  onOpen: () => void;
}) {
  const p = projects[active];
  const accentFallback = ["#e8542a", "#f5b82e", "#a73f55", "#b87333"];

  const common = {
    activeRef,
    progressRef,
    revealCompleteRef,
    accent: p?.accent || accentFallback[active] || "#e8542a",
    onOpen, // click en la escena = abrir el sitio en vivo
  };

  return (
    <div
      className="absolute inset-0 z-[2] flex items-center justify-center"
      aria-hidden="false"
    >
      {active === 0 && <BurgerScene {...common} />}
      {active === 1 && <LegoScene {...common} />}
      {active === 2 && <IceCreamScene {...common} />}
      {active === 3 && <GlassSceneWebGL {...common} />}
    </div>
  );
}
