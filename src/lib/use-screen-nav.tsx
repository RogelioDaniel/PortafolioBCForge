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
  { id: "marquee", label: "Stack" },
  { id: "kinetic", label: "Manifiesto", dark: true },
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "contacto", label: "Contacto" },
];

type Direction = "next" | "prev" | null;

type ScreenNavValue = {
  current: number;
  total: number;
  direction: Direction;
  isTransitioning: boolean;
  activeId: string;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** Re-anima la pantalla activa (útil para re-disparar animaciones onEnter) */
  replayTick: number;
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
  const lockRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const total = SCREENS.length;

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

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  // Bloqueo del scroll nativo + interceptación de gestos
  useEffect(() => {
    // Bloquear scroll del body permanentemente
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    // Wheel / trackpad → next/prev
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lockRef.current) return;
      if (Math.abs(e.deltaY) < 12 && Math.abs(e.deltaX) < 12) return;
      if (e.deltaY > 0 || e.deltaX > 0) next();
      else if (e.deltaY < 0 || e.deltaX < 0) prev();
    };

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

    // Touch: swipe vertical/horizontal
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || touchStartX.current === null) return;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const dx = touchStartX.current - e.changedTouches[0].clientX;
      const threshold = 45;
      if (Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx)) {
        if (dy > 0) next();
        else prev();
      } else if (Math.abs(dx) > threshold) {
        if (dx > 0) next();
        else prev();
      }
      touchStartY.current = null;
      touchStartX.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
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
      replayTick,
    }),
    [current, total, direction, isTransitioning, goTo, next, prev, replayTick]
  );

  return (
    <ScreenNavContext.Provider value={value}>
      {children}
    </ScreenNavContext.Provider>
  );
}
