"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { PROJECTS, type Project } from "@/lib/portfolio-content";
import { useMagnetic, usePrefersReducedMotion } from "@/lib/motion-hooks";
import { PixelSpark } from "./PixelIcons";

/**
 * ProjectModal — overlay a pantalla completa con el detalle de un proyecto.
 * Se abre al hacer clic en "VER PROYECTO". Incluye:
 *  - Galería de "imágenes" (gradient placeholders con descripción)
 *  - Meta info (año, rol, cliente, duración)
 *  - Highlights (lista con checkmarks)
 *  - Resultados (stats grandes)
 *  - Botón cerrar (X pixel) + tecla ESC + click en backdrop
 *  - Animación de entrada/salida con GSAP (wipe + stagger)
 */
export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const closeBtnRef = useMagnetic<HTMLButtonElement>(0.3);
  // Reset del índice de galería: usamos key en el wrapper padre para remontar.
  const [galleryIdx, setGalleryIdx] = useState(0);

  // ESC to close + lock scroll
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setGalleryIdx((i) => (i + 1) % (project.gallery.length || 1));
      if (e.key === "ArrowLeft")
        setGalleryIdx((i) =>
          i === 0 ? (project.gallery.length - 1) : i - 1
        );
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  // Enter/exit animation
  useEffect(() => {
    if (!project) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      // Backdrop fade
      gsap.fromTo(
        rootRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" }
      );
      // Panel slide-up + clip reveal
      gsap.fromTo(
        contentRef.current,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.7,
          ease: "power4.out",
          delay: 0.1,
        }
      );
      // Stagger children
      const items = contentRef.current?.querySelectorAll(".modal-item");
      if (items) {
        gsap.fromTo(
          items,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.06,
            delay: 0.4,
          }
        );
      }
    }, rootRef);
    return () => ctx.revert();
  }, [project, reduced]);

  if (!project) return null;

  // Color helpers for gradients (project.color is a hex number)
  const hex = (n: number) => "#" + n.toString(16).padStart(6, "0");

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle del proyecto ${project.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(14,14,16,0.55)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={contentRef}
        className="relative z-10 w-full h-[92vh] md:h-[88vh] md:max-w-6xl md:rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-light)",
          border: "1px solid var(--pill-border)",
        }}
      >
        {/* Glow decorativo del color del proyecto */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 80% 10%, ${hex(
              project.color
            )}22 0%, transparent 45%)`,
          }}
          aria-hidden="true"
        />

        {/* Top bar — close + keyword */}
        <div className="relative z-10 flex items-center justify-between px-5 md:px-8 py-4 md:py-5 border-b" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-3">
            <span className="mono text-[11px] opacity-50">
              {String(PROJECT_IDX(project) + 1).padStart(2, "0")} / 04
            </span>
            <span
              className="display"
              style={{ fontSize: "clamp(1rem, 3vw, 1.6rem)", color: hex(project.color) }}
            >
              {project.keyword}
            </span>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Cerrar"
            data-cursor="CERRAR"
            className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg-light)]"
            style={{ borderColor: "var(--pill-border)" }}
          >
            <svg width="14" height="14" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
              <rect x="1" y="1" width="1" height="1" fill="currentColor" />
              <rect x="6" y="1" width="1" height="1" fill="currentColor" />
              <rect x="2" y="2" width="1" height="1" fill="currentColor" />
              <rect x="5" y="2" width="1" height="1" fill="currentColor" />
              <rect x="3" y="3" width="2" height="2" fill="currentColor" />
              <rect x="2" y="5" width="1" height="1" fill="currentColor" />
              <rect x="5" y="5" width="1" height="1" fill="currentColor" />
              <rect x="1" y="6" width="1" height="1" fill="currentColor" />
              <rect x="6" y="6" width="1" height="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Content scrollable */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Galería izquierda */}
            <div className="md:col-span-7 p-5 md:p-8 modal-item">
              <div
                className="relative aspect-[16/10] rounded-2xl overflow-hidden"
                style={{ background: hex(project.color) }}
              >
                {/* Gradient decorativo que cambia con galleryIdx */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 30% 40%, ${hex(
                      project.color
                    )}, transparent 60%), radial-gradient(circle at 70% 70%, #16132e88, transparent 55%)`,
                  }}
                />
                {/* Índice grande */}
                <span
                  className="absolute inset-0 flex items-center justify-center display"
                  style={{
                    fontSize: "clamp(4rem, 12vw, 9rem)",
                    color: "rgba(255,255,255,0.12)",
                  }}
                >
                  0{galleryIdx + 1}
                </span>
                {/* Descripción caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <span
                    className="mono text-[11px] text-white/90 block"
                  >
                    {project.gallery[galleryIdx]}
                  </span>
                </div>
                {/* Navegación galería */}
                {project.gallery.length > 1 && (
                  <div className="absolute top-4 right-4 flex gap-1.5">
                    {project.gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setGalleryIdx(i)}
                        aria-label={`Ver imagen ${i + 1}`}
                        className="w-2 h-2 rounded-full transition-all"
                        style={{
                          background:
                            i === galleryIdx ? "#fff" : "rgba(255,255,255,0.4)",
                          transform: i === galleryIdx ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbs */}
              <div className="flex gap-2 mt-3">
                {project.gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIdx(i)}
                    className="flex-1 aspect-[16/10] rounded-lg overflow-hidden relative transition-all"
                    style={{
                      background: hex(project.color),
                      opacity: i === galleryIdx ? 1 : 0.4,
                      outline: i === galleryIdx ? `2px solid ${hex(project.color)}` : "none",
                      outlineOffset: 2,
                    }}
                    aria-label={`Ir a imagen ${i + 1}`}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 40% 50%, ${hex(
                          project.color
                        )}, transparent 70%)`,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info derecha */}
            <div className="md:col-span-5 p-5 md:p-8 md:pl-4 flex flex-col gap-6">
              {/* Nombre + descripción */}
              <div className="modal-item">
                <h2
                  className="display mb-3"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  {project.name}
                </h2>
                <p className="text-[14px] leading-relaxed">{project.description}</p>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4 modal-item">
                {[
                  { label: "AÑO", value: project.year },
                  { label: "ROL", value: project.role },
                  { label: "CLIENTE", value: project.client },
                  { label: "DURACIÓN", value: project.duration },
                ].map((m) => (
                  <div key={m.label}>
                    <span className="mono text-[10px] opacity-50 block mb-1">
                      {m.label}
                    </span>
                    <span className="text-[13px] font-medium">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="modal-item">
                <span className="mono text-[11px] opacity-50 block mb-3">
                  HIGHLIGHTS
                </span>
                <ul className="flex flex-col gap-2">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed">
                      <span
                        className="mt-1 shrink-0 inline-block"
                        style={{ color: hex(project.color) }}
                      >
                        <PixelSpark size={12} />
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resultados */}
              <div className="modal-item">
                <span className="mono text-[11px] opacity-50 block mb-3">
                  RESULTADOS
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {project.results.map((r) => (
                    <div
                      key={r.label}
                      className="rounded-xl p-3 text-center"
                      style={{
                        background: "rgba(14,14,16,0.04)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div
                        className="display"
                        style={{
                          fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                          color: hex(project.color),
                        }}
                      >
                        {r.value}
                      </div>
                      <div className="mono text-[9px] opacity-60 mt-1">
                        {r.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags + CTA */}
              <div className="modal-item flex flex-wrap gap-2 mt-auto pt-2">
                {project.tags.map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper para encontrar el índice del proyecto
function PROJECT_IDX(p: Project): number {
  return PROJECTS.findIndex((x) => x.name === p.name);
}
