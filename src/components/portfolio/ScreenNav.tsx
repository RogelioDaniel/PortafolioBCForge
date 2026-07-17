"use client";

import { useEffect } from "react";
import { useScreenNav, SCREENS } from "@/lib/use-screen-nav";
import { useIsTouch } from "@/lib/motion-hooks";

/**
 * ScreenNav — flechas de navegación de la experiencia guiada.
 *
 * Flechas pixel-art grandes fijas abajo-centro + indicador 01/07.
 * En hover muestra el nombre de la pantalla destino.
 * El cursor custom muestra "SIGUIENTE →" / "← ATRÁS".
 * Oculto en la primera pantalla para no estorbar el hero (ahí hay un hint
 * de scroll que invita a la primera flecha).
 *
 * Cuando una sección tiene sub-navegación, estas flechas avanzan primero entre
 * sus estados internos y luego pasan a la siguiente pantalla.
 */
export default function ScreenNav() {
  const { current, total, next, prev, subNavEdges } = useScreenNav();
  const isTouch = useIsTouch();

  const isFirst = current === 0;
  const isLast = current === total - 1;
  const nextLabel = SCREENS[Math.min(total - 1, current + 1)]?.label;
  const prevLabel = SCREENS[Math.max(0, current - 1)]?.label;

  const isInsideSubNav =
    subNavEdges !== null && (!subNavEdges.atStart || !subNavEdges.atEnd);
  const nextTarget =
    isInsideSubNav && !subNavEdges.atEnd ? "Siguiente proyecto" : nextLabel;
  const prevTarget =
    isInsideSubNav && !subNavEdges.atStart ? "Proyecto anterior" : prevLabel;

  // En pantallas con contenido largo, los controles se apartan visualmente
  // mientras el usuario baja. Al subir o alcanzar un borde recuperan presencia.
  useEffect(() => {
    const root = document.documentElement;
    let scrollFrame = 0;
    let bindFrame = 0;
    let scroller: HTMLElement | null = null;
    let lastTop = 0;

    const setDimmed = (dimmed: boolean) => {
      if (dimmed) root.dataset.controlsDimmed = "true";
      else delete root.dataset.controlsDimmed;
    };

    const onScroll = () => {
      if (!scroller || scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        if (!scroller) return;
        const top = scroller.scrollTop;
        const atTop = top <= 8;
        const atBottom =
          top + scroller.clientHeight >= scroller.scrollHeight - 8;
        const delta = top - lastTop;

        if (atTop || atBottom || delta < -2) setDimmed(false);
        else if (delta > 2) setDimmed(true);
        lastTop = top;
      });
    };

    bindFrame = window.requestAnimationFrame(() => {
      scroller = document.querySelector<HTMLElement>(
        '.screen-slot[data-active="true"] [data-screen-scroll]'
      );
      lastTop = scroller?.scrollTop ?? 0;
      setDimmed(false);
      scroller?.addEventListener("scroll", onScroll, { passive: true });
    });

    return () => {
      window.cancelAnimationFrame(bindFrame);
      window.cancelAnimationFrame(scrollFrame);
      scroller?.removeEventListener("scroll", onScroll);
      setDimmed(false);
    };
  }, [current]);

  return (
    <div
      className="screen-nav-audio fixed bottom-5 left-1/2 -translate-x-1/2 z-[55] flex items-center gap-3 md:gap-5 select-none"
      aria-label="Navegación entre pantallas"
    >
      {/* Flecha anterior */}
      <button
        onClick={prev}
        disabled={isFirst}
        data-cursor="ATRÁS"
        aria-label={prevTarget ?? "Pantalla anterior"}
        className="screen-arrow music-nudge group disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 hover:scale-110"
        style={{
          width: isTouch ? 44 : 46,
          height: isTouch ? 44 : 46,
        }}
      >
        <svg
          viewBox="0 0 14 14"
          shapeRendering="crispEdges"
          className="w-full h-full"
          style={{ color: "var(--ink)" }}
          aria-hidden="true"
        >
          <PixelArrowLeft />
        </svg>
        <span className="screen-arrow-label" aria-hidden="true">
          {prevTarget}
        </span>
      </button>

      {/* Indicador 01/07 */}
      <div
        className="flex items-center gap-2 px-1"
      >
        <span
          className="mono text-[11px] tabular-nums"
          style={{ color: "var(--ink)", opacity: 0.9 }}
        >
          {String(current + 1).padStart(2, "0")}
        </span>
        <span
          className="block h-px"
          style={{ width: 18, background: "var(--ink)", opacity: 0.35 }}
        />
        <span
          className="mono text-[11px] tabular-nums"
          style={{ color: "var(--ink)", opacity: 0.5 }}
        >
          {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Flecha siguiente */}
      <button
        onClick={next}
        disabled={isLast}
        data-cursor="SIGUIENTE"
        aria-label={nextTarget ?? "Siguiente pantalla"}
        className={`screen-arrow music-nudge group disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 hover:scale-110${
          subNavEdges?.atEnd ? " screen-arrow-reveal" : ""
        }`}
        style={{
          width: isTouch ? 44 : 46,
          height: isTouch ? 44 : 46,
        }}
      >
        <svg
          viewBox="0 0 14 14"
          shapeRendering="crispEdges"
          className="w-full h-full"
          style={{ color: "var(--ink)" }}
          aria-hidden="true"
        >
          <PixelArrowRight />
        </svg>
        <span className="screen-arrow-label" aria-hidden="true">
          {nextTarget}
        </span>
      </button>
    </div>
  );
}

function PixelArrowRight() {
  return (
    <>
      <rect x="0" y="6" width="9" height="2" fill="currentColor" />
      <rect x="9" y="4" width="2" height="2" fill="currentColor" />
      <rect x="11" y="2" width="2" height="2" fill="currentColor" />
      <rect x="9" y="8" width="2" height="2" fill="currentColor" />
      <rect x="11" y="10" width="2" height="2" fill="currentColor" />
    </>
  );
}

function PixelArrowLeft() {
  return (
    <>
      <rect x="5" y="6" width="9" height="2" fill="currentColor" />
      <rect x="3" y="4" width="2" height="2" fill="currentColor" />
      <rect x="1" y="2" width="2" height="2" fill="currentColor" />
      <rect x="3" y="8" width="2" height="2" fill="currentColor" />
      <rect x="1" y="10" width="2" height="2" fill="currentColor" />
    </>
  );
}
