"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { gsap } from "gsap";
import { SITE, PROJECTS } from "@/lib/portfolio-content";
import { useScreenNav, SCREENS } from "@/lib/use-screen-nav";

/**
 * CommandPalette — paleta de comandos (Cmd+K / Ctrl+K).
 * P5: usa screen-nav (goTo) en lugar de Lenis. Sin sección Blog.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { goTo } = useScreenNav();

  // Toggle con Cmd+K / Ctrl+K / "/"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const inField =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) setQuery("");
          return !o;
        });
      } else if (e.key === "/" && !inField) {
        e.preventDefault();
        setQuery("");
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Animación de entrada/salida
  useEffect(() => {
    if (!open) return;
    const overlay = document.querySelector("[data-cmdk-overlay]");
    const dialog = document.querySelector("[data-cmdk-dialog]");
    if (overlay && dialog) {
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" }
      );
      gsap.fromTo(
        dialog,
        { y: -20, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power3.out",
        }
      );
    }
  }, [open]);

  const run = useCallback(
    (fn: () => void) => {
      setOpen(false);
      setTimeout(fn, 150);
    },
    []
  );

  const goScreenByTarget = (target: string) => {
    const id = target.replace("#", "");
    const idx = SCREENS.findIndex((s) => s.id === id);
    if (idx >= 0) run(() => goTo(idx));
  };

  // Construir lista de comandos
  const navItems = SITE.nav.map((n) => ({
    type: "nav" as const,
    id: `nav-${n.label}`,
    label: n.label,
    hint: "Sección",
    action: () => goScreenByTarget(n.target),
  }));

  const projectItems = PROJECTS.map((p) => ({
    type: "project" as const,
    id: `proj-${p.name}`,
    label: p.name,
    hint: p.keyword,
    action: () => goScreenByTarget("#proyectos"),
  }));

  const actionItems = [
    {
      type: "action" as const,
      id: "act-top",
      label: "Ir al inicio",
      hint: "Acción",
      action: () => run(() => goTo(0)),
    },
    {
      type: "action" as const,
      id: "act-theme",
      label: "Cambiar tema (claro/oscuro)",
      hint: "Acción",
      action: () =>
        run(() => {
          const btn = document.querySelector<HTMLButtonElement>(
            'button[aria-label*="modo"]'
          );
          btn?.click();
        }),
    },
    {
      type: "action" as const,
      id: "act-contact",
      label: "Enviar un mensaje",
      hint: "Acción",
      action: () => goScreenByTarget("#contacto"),
    },
  ];

  const allItems = [...navItems, ...actionItems, ...projectItems];

  const filtered = query
    ? allItems.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          i.hint.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  if (!open) return null;

  return (
    <div
      data-cmdk-overlay
      className="fixed inset-0 z-[95] flex items-start justify-center pt-[15vh] px-4"
      style={{ background: "rgba(14,14,16,0.5)", backdropFilter: "blur(6px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        data-cmdk-dialog
        className="w-full max-w-xl rounded-2xl overflow-hidden border shadow-2xl"
        style={{
          background: "var(--bg-light)",
          borderColor: "var(--pill-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          label="Paleta de comandos"
          className="flex flex-col"
          shouldFilter={false}
        >
          {/* Input */}
          <div
            className="flex items-center gap-3 px-5 py-4 border-b"
            style={{ borderColor: "var(--line)" }}
          >
            <SearchIcon />
            <Command.Input
              autoFocus
              placeholder="Busca secciones, proyectos, acciones…"
              value={query}
              onValueChange={setQuery}
              className="flex-1 bg-transparent outline-none text-[15px]"
              style={{ color: "var(--ink)", fontFamily: "var(--font-inter)" }}
            />
            <kbd
              className="mono text-[10px] px-2 py-1 rounded border"
              style={{
                borderColor: "var(--pill-border)",
                color: "var(--ink-soft)",
              }}
            >
              ESC
            </kbd>
          </div>

          {/* Lista */}
          <Command.List
            className="max-h-[50vh] overflow-y-auto py-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {filtered.length === 0 && (
              <Command.Empty className="px-5 py-8 text-center text-[13px] opacity-50">
                Sin resultados para “{query}”
              </Command.Empty>
            )}

            {filtered.some((i) => i.type === "nav") && (
              <Command.Group
                heading="Navegación"
                className="px-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:opacity-50"
              >
                {filtered
                  .filter((i) => i.type === "nav")
                  .map((item) => (
                    <CommandRow key={item.id} item={item} />
                  ))}
              </Command.Group>
            )}

            {filtered.some((i) => i.type === "action") && (
              <Command.Group
                heading="Acciones"
                className="px-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:opacity-50"
              >
                {filtered
                  .filter((i) => i.type === "action")
                  .map((item) => (
                    <CommandRow key={item.id} item={item} />
                  ))}
              </Command.Group>
            )}

            {filtered.some((i) => i.type === "project") && (
              <Command.Group
                heading="Proyectos"
                className="px-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:opacity-50"
              >
                {filtered
                  .filter((i) => i.type === "project")
                  .map((item) => (
                    <CommandRow key={item.id} item={item} />
                  ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-5 py-3 border-t mono text-[10px] opacity-50"
            style={{ borderColor: "var(--line)" }}
          >
            <span>↵ SELECCIONAR · ↑↓ NAVEGAR</span>
            <span>ROGELIO·DEV</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function CommandRow({
  item,
}: {
  item: { id: string; label: string; hint: string; action: () => void };
}) {
  return (
    <Command.Item
      onSelect={item.action}
      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-[rgba(14,14,16,0.06)]"
    >
      <span className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>
        {item.label}
      </span>
      <span
        className="mono text-[10px] opacity-50"
        style={{ color: "var(--ink)" }}
      >
        {item.hint}
      </span>
    </Command.Item>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ color: "var(--ink)", opacity: 0.5 }}
    >
      <rect x="1" y="1" width="3" height="1" fill="currentColor" />
      <rect x="0" y="2" width="1" height="2" fill="currentColor" />
      <rect x="4" y="2" width="1" height="2" fill="currentColor" />
      <rect x="1" y="4" width="3" height="1" fill="currentColor" />
      <rect x="4" y="4" width="1" height="1" fill="currentColor" />
      <rect x="5" y="5" width="1" height="1" fill="currentColor" />
      <rect x="6" y="6" width="1" height="1" fill="currentColor" />
    </svg>
  );
}
