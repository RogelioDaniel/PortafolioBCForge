"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TESTIMONIALS } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";

/**
 * Testimonials — sección de reseñas de clientes.
 * Dos columnas verticales con quotes que se desplazan suavemente en
 * direcciones opuestas al hacer scroll (parallax vertical continuo).
 * Cada quote lleva comilla decorativa pixel + autor + rol.
 * Header con pill chip "TESTIMONIOS".
 */
export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const colA = useRef<HTMLDivElement>(null);
  const colB = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) return;

      // Header reveal
      const header = ref.current?.querySelectorAll(".tst-reveal .reveal-inner");
      if (header) {
        gsap.fromTo(
          header,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: { trigger: ref.current, start: "top 75%" },
          }
        );
      }

      // Parallax vertical continuo de las columnas
      // Duplicamos contenido para loop seamless
      if (colA.current && colB.current) {
        const a = colA.current;
        const b = colB.current;
        // Col A baja, Col B sube (efecto cinético)
        gsap.to(a, {
          y: () => -(a.scrollHeight - a.parentElement!.clientHeight) / 2,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
        gsap.fromTo(
          b,
          { y: () => -(b.scrollHeight - b.parentElement!.clientHeight) / 4 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          }
        );
      }

      // Cards stagger reveal
      const cards = ref.current?.querySelectorAll(".tst-card");
      cards?.forEach((c) => {
        gsap.fromTo(
          c,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: c, start: "top 92%" },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  // Repartir testimonials en dos columnas
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const colAItems = TESTIMONIALS.slice(0, half);
  const colBItems = TESTIMONIALS.slice(half).concat(TESTIMONIALS.slice(0, 1)); // duplica uno para llenar

  return (
    <section
      ref={ref}
      className="py-24 md:py-36 relative overflow-hidden"
      aria-label="Testimonios"
    >
      <div className="container-edge mb-12 md:mb-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="mb-5">
              <span className="pill">Testimonios</span>
            </div>
            <h2
              className="tst-reveal display"
              style={{ fontSize: "clamp(2.5rem, 8vw, 7rem)" }}
            >
              <span className="reveal-mask block">
                <span className="reveal-inner block">LO QUE DICEN</span>
              </span>
              <span className="reveal-mask block">
                <span className="reveal-inner block">MIS CLIENTES</span>
              </span>
            </h2>
          </div>
          <p className="max-w-[34ch] text-[13px] md:text-[14px] leading-relaxed opacity-70">
            La mejor medida de mi trabajo no son los premios, sino la confianza
            de quienes me eligen para construir su presencia digital.
          </p>
        </div>
      </div>

      {/* Grid de dos columnas con parallax */}
      <div className="container-edge">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Columna A */}
          <div className="flex flex-col gap-5 md:gap-6" ref={colA}>
            {colAItems.map((t, i) => (
              <TestimonialCard key={`a-${i}`} t={t} />
            ))}
          </div>
          {/* Columna B (offset en md para efecto masonry) */}
          <div
            className="flex flex-col gap-5 md:gap-6 md:mt-16"
            ref={colB}
          >
            {colBItems.map((t, i) => (
              <TestimonialCard key={`b-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  t,
}: {
  t: { quote: string; author: string; role: string };
}) {
  return (
    <article
      className="tst-card relative rounded-2xl p-6 md:p-8"
      style={{
        background: "rgba(14,14,16,0.03)",
        border: "1px solid var(--line)",
      }}
    >
      {/* Comilla pixel decorativa */}
      <svg
        width="20"
        height="16"
        viewBox="0 0 10 8"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className="mb-4"
        style={{ color: "var(--ink)", opacity: 0.4 }}
      >
        <rect x="0" y="0" width="4" height="3" fill="currentColor" />
        <rect x="0" y="0" width="1" height="5" fill="currentColor" />
        <rect x="0" y="4" width="3" height="1" fill="currentColor" />
        <rect x="6" y="0" width="4" height="3" fill="currentColor" />
        <rect x="6" y="0" width="1" height="5" fill="currentColor" />
        <rect x="6" y="4" width="3" height="1" fill="currentColor" />
      </svg>
      <blockquote className="text-[15px] md:text-[17px] leading-relaxed mb-5">
        “{t.quote}”
      </blockquote>
      <footer className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="w-9 h-9 rounded-full flex items-center justify-center display"
          style={{ background: "var(--ink)", color: "var(--bg-light)", fontSize: 13 }}
        >
          {t.author.charAt(0)}
        </span>
        <div>
          <div className="text-[13px] font-medium">{t.author}</div>
          <div className="mono text-[10px] opacity-60">{t.role}</div>
        </div>
      </footer>
    </article>
  );
}
