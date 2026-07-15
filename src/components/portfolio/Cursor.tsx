"use client";

import { useEffect, useRef } from "react";
import { useIsTouch, usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Cursor personalizado:
 *  - punto negro pequeño que escala 3× sobre elementos interactivos
 *  - muestra "VER" sobre las cards de proyecto (data-cursor="ver")
 *  - oculto en touch / reduced motion
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (isTouch || reduced) return;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const t = e.target as HTMLElement;
      const interactive = t.closest(
        'a, button, [data-cursor], input, textarea, [role="button"]'
      );
      if (interactive) {
        const labelTxt = interactive.getAttribute("data-cursor");
        dot.classList.add("is-hover");
        label.textContent = labelTxt || "";
        label.style.opacity = labelTxt ? "1" : "0";
      } else {
        dot.classList.remove("is-hover");
        label.style.opacity = "0";
      }
    };

    const tick = () => {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      label.style.transform = `translate(${cx}px, ${cy}px) translate(20px, 20px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [isTouch, reduced]);

  if (isTouch || reduced) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <span
        ref={labelRef}
        className="cursor-label"
        aria-hidden="true"
      />
    </>
  );
}
