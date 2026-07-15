"use client";

import { useState } from "react";
import { CONTACT, SITE } from "@/lib/portfolio-content";
import { useMagnetic } from "@/lib/motion-hooks";

/**
 * Contacto — formulario minimalista:
 *  - inputs de línea (label mono arriba + línea inferior 1px)
 *  - "PRESUPUESTO (USD)" con radio-pills seleccionables
 *  - botón pill negro magnético "ENVIAR →"
 *  - envío: mailto
 */
export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [budget, setBudget] = useState(CONTACT.budgets[0]);
  const btnRef = useMagnetic<HTMLButtonElement>(0.4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Nuevo proyecto — ${name || "Sin nombre"}`);
    const body = encodeURIComponent(
      `Nombre: ${name}\nEmail: ${email}\nPresupuesto: ${budget}\n\nProyecto:\n${project}`
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contacto"
      className="py-24 md:py-40"
      aria-label="Contacto"
    >
      <div className="container-edge">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          {/* Izquierda: titular */}
          <div className="md:col-span-5">
            <span className="section-label block mb-6">[ CONTACTO ]</span>
            <h2
              className="display"
              style={{ fontSize: "clamp(2.5rem, 8vw, 7rem)" }}
            >
              HABLEMOS
            </h2>
            <p className="mt-6 text-[15px] max-w-[34ch]">
              ¿Tienes un proyecto en mente? Cuéntame qué necesitas y te
              respondo en menos de 24 horas.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mono-lg inline-block mt-8 underline underline-offset-4"
              style={{ fontFamily: "var(--font-space-mono)", textTransform: "lowercase" }}
            >
              {SITE.email}
            </a>
          </div>

          {/* Derecha: formulario */}
          <form onSubmit={handleSubmit} className="md:col-span-7 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="name" className="mono text-[11px] block mb-2">
                  TU NOMBRE
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rogelio Daniel"
                  className="line-input"
                />
              </div>
              <div>
                <label htmlFor="email" className="mono text-[11px] block mb-2">
                  TU EMAIL
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hola@email.com"
                  className="line-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="project" className="mono text-[11px] block mb-2">
                TU PROYECTO TRATA DE…
              </label>
              <textarea
                id="project"
                required
                rows={3}
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Un sitio inmersivo para lanzar mi marca…"
                className="line-input resize-none"
              />
            </div>

            {/* Presupuesto radio-pills */}
            <div>
              <span className="mono text-[11px] block mb-3">PRESUPUESTO (USD)</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Presupuesto">
                {CONTACT.budgets.map((b) => (
                  <button
                    key={b}
                    type="button"
                    role="radio"
                    aria-checked={budget === b}
                    onClick={() => setBudget(b)}
                    className="pill transition-all"
                    style={{
                      background: budget === b ? "var(--ink)" : "transparent",
                      color: budget === b ? "#fff" : "var(--ink)",
                      borderColor: budget === b ? "var(--ink)" : "var(--pill-border)",
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                ref={btnRef}
                type="submit"
                className="btn-primary"
                data-cursor="ENVIAR"
              >
                Enviar
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
