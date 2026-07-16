"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BLOG } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import { PixelEye } from "./PixelIcons";

/**
 * Blog / Insights con búsqueda y filtro por categoría:
 *  - Titular "MIS ARTÍCULOS" + input de búsqueda + pill "Ver todos"
 *  - Chips de filtro de categoría (Todas + categorías únicas)
 *  - Filas editoriales: thumbnail 16:9 con overlay hover (ojo + LEER),
 *    título, excerpt, "Categoría • Fecha • ReadTime", flecha →
 *  - Filtra en vivo por texto y categoría
 */
export default function Blog() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("Todas");

  // Categorías únicas para los chips de filtro
  const categories = useMemo(() => {
    const cats = Array.from(new Set(BLOG.items.map((i) => i.category)));
    return ["Todas", ...cats];
  }, []);

  // Items filtrados
  const filtered = useMemo(() => {
    return BLOG.items.filter((item) => {
      const matchesCat =
        activeCat === "Todas" || item.category === activeCat;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, activeCat]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) return;
      const rows = ref.current?.querySelectorAll(".blog-row");
      rows?.forEach((r) => {
        gsap.fromTo(
          r,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: r, start: "top 92%" },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced, filtered]);

  return (
    <section ref={ref} id="blog" className="py-24 md:py-36" aria-label="Blog">
      <div className="container-edge">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
          <h2
            className="display"
            style={{ fontSize: "clamp(2.5rem, 9vw, 8rem)" }}
          >
            {BLOG.title}
          </h2>
          <div className="flex items-center gap-3">
            {/* Input de búsqueda */}
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar…"
                aria-label="Buscar artículos"
                className="pill pr-8 outline-none w-40 md:w-52"
                style={{ background: "transparent", cursor: "text" }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-[var(--ink)] hover:text-[var(--bg-light)] transition-colors"
                  style={{ fontSize: 10 }}
                >
                  ✕
                </button>
              )}
            </div>
            <button className="pill shrink-0">
              Ver todos
              <span className="ml-1">→</span>
            </button>
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap gap-2 mb-10 md:mb-14">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className="pill transition-all"
              style={{
                background: activeCat === cat ? "var(--ink)" : "transparent",
                color: activeCat === cat ? "var(--bg-light)" : "var(--ink)",
                borderColor: activeCat === cat ? "var(--ink)" : "var(--pill-border)",
              }}
            >
              {cat}
            </button>
          ))}
          <span className="mono text-[11px] opacity-50 self-center ml-2">
            {filtered.length} {filtered.length === 1 ? "artículo" : "artículos"}
          </span>
        </div>

        {/* Filas */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mono text-[12px] opacity-60 mb-2">
              NO SE ENCONTRARON ARTÍCULOS
            </p>
            <p className="text-[14px]">
              Prueba con otra búsqueda o categoría.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((item, i) => (
              <li
                key={`${item.title}-${i}`}
                className="blog-row hairline group cursor-pointer py-6 md:py-8"
              >
                <a href="#" className="block" data-cursor="LEER">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
                    {/* Thumbnail 16:9 con chips apiladas dentro (arriba-derecha) + overlay hover */}
                    <div className="md:col-span-4 relative">
                      <div
                        className="relative aspect-[16/9] overflow-hidden rounded-xl"
                        style={{ background: "var(--bg-navy)" }}
                      >
                        <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1.5">
                          <span className="pill pill--ghost-light backdrop-blur-sm">
                            {item.category}
                          </span>
                        </div>
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "radial-gradient(circle at 30% 40%, rgba(123,63,242,0.5), transparent 60%), radial-gradient(circle at 70% 70%, rgba(46,107,255,0.4), transparent 55%)",
                          }}
                        />
                        <span
                          className="absolute inset-0 flex items-center justify-center display"
                          style={{
                            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                            color: "rgba(255,255,255,0.15)",
                          }}
                        >
                          0{i + 1}
                        </span>
                        {/* Overlay hover: oscuro + ojo + LEER */}
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <PixelEye size={32} className="text-white" />
                          <span className="mono text-white">LEER</span>
                        </div>
                      </div>
                    </div>

                    {/* Contenido derecha */}
                    <div className="md:col-span-7">
                      <span className="mono text-[11px] opacity-60 block mb-3">
                        {item.category} · {item.date} · {item.readTime}
                      </span>
                      <h3
                        className="leading-snug mb-2"
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontWeight: 500,
                          fontSize: "clamp(1.15rem, 2vw, 1.55rem)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-[13px] md:text-[14px] leading-relaxed opacity-70 max-w-[55ch]">
                        {item.excerpt}
                      </p>
                    </div>

                    {/* Flecha en caja cuadrada oscura (como la referencia) */}
                    <div className="md:col-span-1 flex md:justify-end">
                      <span
                        className="w-9 h-9 flex items-center justify-center border transition-all duration-300 group-hover:bg-[var(--ink)] group-hover:text-[var(--bg-light)] group-hover:border-[var(--ink)]"
                        style={{ borderColor: "var(--pill-border)" }}
                        aria-hidden="true"
                      >
                        <span className="mono text-[14px] transition-transform duration-300 group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
