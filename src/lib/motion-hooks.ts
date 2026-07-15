"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Prefers-reduced-motion: desactiva pin/scrub/parallax/cursor custom.
 * Usa useSyncExternalStore para suscribirse a matchMedia sin lint issues.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    getReducedSnapshot,
    getReducedServerSnapshot
  );
}

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getReducedSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedServerSnapshot() {
  return false;
}

/**
 * Detecta dispositivos táctiles para ocultar cursor custom y parallax de mouse.
 */
export function useIsTouch() {
  return useSyncExternalStore(subscribeTouch, getTouchSnapshot, () => false);
}
function subscribeTouch(cb: () => void) {
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getTouchSnapshot() {
  return (
    window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window
  );
}

/**
 * Hook magnético: atrae el elemento hacia el cursor (máx ~8px, lerp 0.15).
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.4) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      tx = x * strength;
      ty = y * strength;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    const tick = () => {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      el.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [strength]);
  return ref;
}


