"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * use-screen-nav — cerebro de la navegación guiada por pantallas.
 *
 * Reemplaza el scroll libre por una experiencia VIP:
 *  - Cada "pantalla" ocupa 100vh y solo una está visible a la vez.
 *  - El scroll nativo (wheel, trackpad, touch, teclado) está bloqueado y se
 *    convierte en goTo(screen ± 1).
 *  - Transiciones con debounce anti-spam (~800ms).
 *  - Expone goTo/next/prev + el índice activo y la dirección de la última
 *    transición (para que las animaciones de cada pantalla se detonen).
 *
 * Las pantallas (screens) se definen en SCREENS abajo; cada una lleva un id
 * y una etiqueta. El provider vive en page.tsx y envuelve toda la app.
 */

export type Screen = {
  id: string;
  label: string;
  /** Si la pantalla requiere fondo oscuro (kinetic) */
  dark?: boolean;
};

export const SCREENS: Screen[] = [
  { id: "top", label: "Inicio" },
  { id: "proyectos", label: "Proyectos" },
  { id: "servicios", label: "Servicios" },
  { id: "precios", label: "Precios" },
  { id: "marquee", label: "Stack" },
  { id: "kinetic", label: "Manifiesto", dark: true },
  { id: "sobre-mi", label: "Nosotros" },
  { id: "contacto", label: "Contacto" },
];

type Direction = "next" | "prev" | null;

/**
 * SubNav — una pantalla (p.ej. Proyectos) puede registrar una sub-navegación
 * interna. Mientras esté registrada Y sea la pantalla activa, las flechas /
 * teclado / rueda avanzan PRIMERO dentro de la pantalla (proyecto → proyecto)
 * y solo cruzan a la siguiente pantalla cuando llegan al borde.
 */
export type SubNav = {
  screenIndex: number;
  atStart: () => boolean;
  atEnd: () => boolean;
  next: () => void;
  prev: () => void;
};

/** Estado reactivo de los bordes del sub-nav (para que ScreenNav reaccione) */
export type SubNavEdges = {
  atStart: boolean;
  atEnd: boolean;
};

type ScreenNavValue = {
  current: number;
  total: number;
  direction: Direction;
  isTransitioning: boolean;
  activeId: string;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** Registra la sub-navegación de la pantalla activa. Para limpiar, pasa el
   *  MISMO objeto con unregister=true (solo se limpia si sigue siendo el actual,
   *  evitando que una pantalla saliente borre el registro de la entrante). */
  registerSubNav: (sub: SubNav | null, unregister?: boolean) => void;
  /** Re-anima la pantalla activa (útil para re-disparar animaciones onEnter) */
  replayTick: number;
  /** Estado reactivo de los bordes del sub-nav activo (null si no hay sub-nav) */
  subNavEdges: SubNavEdges | null;
  /** Notifica al provider que el estado interno del sub-nav cambió (p.ej.
   *  después de navegar internamente con flechas laterales). */
  notifySubNavChange: () => void;
};

const ScreenNavContext = createContext<ScreenNavValue | null>(null);

export function useScreenNav() {
  const ctx = useContext(ScreenNavContext);
  if (!ctx) throw new Error("useScreenNav debe usarse dentro de <ScreenNavProvider>");
  return ctx;
}

export function ScreenNavProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<Direction>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [replayTick, setReplayTick] = useState(0);
  const [subNavEdges, setSubNavEdges] = useState<SubNavEdges | null>(null);
  const lockRef = useRef(false);
  const subNavRef = useRef<SubNav | null>(null);
  const currentRef = useRef(current);
  currentRef.current = current;

  const total = SCREENS.length;

  /** Lee los bordes actuales del sub-nav y actualiza el estado reactivo. */
  const syncEdges = useCallback(() => {
    const sub = subNavRef.current;
    if (sub && sub.screenIndex === currentRef.current) {
      setSubNavEdges({ atStart: sub.atStart(), atEnd: sub.atEnd() });
    } else {
      setSubNavEdges(null);
    }
  }, []);

  const registerSubNav = useCallback(
    (sub: SubNav | null, unregister = false) => {
      if (unregister) {
        if (subNavRef.current === sub) {
          subNavRef.current = null;
          setSubNavEdges(null);
        }
      } else {
        subNavRef.current = sub;
        // Inicializar bordes si estamos en la pantalla del sub-nav
        if (sub && sub.screenIndex === currentRef.current) {
          setSubNavEdges({ atStart: sub.atStart(), atEnd: sub.atEnd() });
        }
      }
    },
    []
  );

  // Sincronizar bordes cuando cambia la pantalla activa
  useEffect(() => {
    syncEdges();
  }, [current, syncEdges]);

  const goTo = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(total - 1, index));
      setCurrent((cur) => {
        if (target === cur || lockRef.current) return cur;
        lockRef.current = true;
        setDirection(target > cur ? "next" : "prev");
        setIsTransitioning(true);
        // Liberar el lock tras la duración de la transición (~800ms)
        window.setTimeout(() => {
          lockRef.current = false;
          setIsTransitioning(false);
        }, 850);
        // Disparar replayTick para que la nueva pantalla re-animen
        setReplayTick((t) => t + 1);
        return target;
      });
    },
    [total]
  );

  // advance(dir): primero intenta la sub-navegación de la pantalla activa
  // (proyecto → proyecto); si está en el borde, cruza a la pantalla vecina.
  const advance = useCallback(
    (dir: 1 | -1) => {
      const sub = subNavRef.current;
      if (sub && sub.screenIndex === current) {
        const canSub = dir === 1 ? !sub.atEnd() : !sub.atStart();
        if (canSub) {
          if (lockRef.current) return;
          lockRef.current = true;
          window.setTimeout(() => {
            lockRef.current = false;
          }, 620);
          if (dir === 1) sub.next();
          else sub.prev();
          // Actualizar bordes tras la navegación interna
          syncEdges();
          return;
        }
      }
      goTo(current + dir);
    },
    [goTo, current, syncEdges]
  );

  const next = useCallback(() => advance(1), [advance]);
  const prev = useCallback(() => advance(-1), [advance]);

  // Navegación SOLO por teclado dedicado (flechas, PageUp/Down, Home/End).
  // El scroll con rueda/trackpad/touch queda LIBRE para revisar contenido
  // fuera de vista; las flechas (ScreenNav) son las únicas que cambian de
  // pantalla. No bloqueamos el overflow del body.
  useEffect(() => {
    // Teclado: flechas, PageUp/Down, Home/End
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // No interceptar si el foco está en un input/textarea/contenteditable
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (["ArrowDown", "PageDown", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (["ArrowUp", "PageUp", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [next, prev, goTo, total]);

  const value = useMemo<ScreenNavValue>(
    () => ({
      current,
      total,
      direction,
      isTransitioning,
      activeId: SCREENS[current]?.id ?? "top",
      goTo,
      next,
      prev,
      registerSubNav,
      replayTick,
      subNavEdges,
      notifySubNavChange: syncEdges,
    }),
    [current, total, direction, isTransitioning, goTo, next, prev, registerSubNav, replayTick, subNavEdges, syncEdges]
  );

  return (
    <ScreenNavContext.Provider value={value}>
      {children}
    </ScreenNavContext.Provider>
  );
}
