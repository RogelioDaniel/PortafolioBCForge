"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ABOUT } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import { useScreenNav } from "@/lib/use-screen-nav";

/**
 * AboutSection — sección "Sobre mí" dedicada.
 * Animaciones onEnter (replayTick del screen-nav). El contenedor hace scroll
 * interno si el contenido excede el viewport (la pantalla es 100vh fija).
 */
export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { replayTick } = useScreenNav();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced) return;

      // Título reveal por líneas
      const lines = ref.current?.querySelectorAll(".about-title .reveal-inner");
      if (lines) {
        gsap.fromTo(
          lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
            delay: 0.15,
          }
        );
      }

      // Intro + body fade
      const body = ref.current?.querySelectorAll(".about-fade");
      if (body) {
        gsap.fromTo(
          body,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            delay: 0.4,
          }
        );
      }

      // Stats — contador animado
      const stats = ref.current?.querySelectorAll<HTMLElement>(".stat-value");
      stats?.forEach((stat) => {
        const raw = stat.dataset.value || "";
        const numeric = parseInt(raw, 10);
        const hasNumeric = !isNaN(numeric) && raw.match(/\d/);
        const suffix = raw.replace(/[0-9]/g, "");
        if (hasNumeric) {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: numeric,
            duration: 1.6,
            ease: "power2.out",
            delay: 0.6,
            onUpdate: () => {
              stat.textContent = Math.round(obj.v) + suffix;
            },
          });
        }
      });

      // Timeline reveal
      const tlItems = ref.current?.querySelectorAll(".timeline-item");
      tlItems?.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            delay: 0.7 + i * 0.12,
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced, replayTick]);

  return (
    <section
      ref={ref}
      id="sobre-mi"
      className="h-[100svh] overflow-y-auto py-16 md:py-20 relative"
      aria-label="Sobre mí"
    >
      <div className="container-edge">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-16 md:mb-24">
          <div className="md:col-span-7">
            <span className="section-label block mb-6">{ABOUT.eyebrow}</span>
            <h2
              className="about-title audio-title display"
              style={{ fontSize: "clamp(2.5rem, 9vw, 8rem)" }}
            >
              {ABOUT.title.map((line, i) => (
                <span key={i} className="reveal-mask block">
                  <span className="reveal-inner block">{line}</span>
                </span>
              ))}
            </h2>
          </div>
          <div className="md:col-span-5 md:pt-3">
            <p className="about-fade text-[16px] md:text-[18px] font-medium leading-relaxed mb-5">
              {ABOUT.intro}
            </p>
            <p className="about-fade text-[13px] md:text-[14px] leading-relaxed text-[var(--ink-soft)]">
              {ABOUT.body}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-20 md:mb-28 border-y py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
          {ABOUT.stats.map((s) => (
            <div key={s.label} className="about-fade">
              <div
                className="stat-value display mb-2"
                data-value={s.value}
                style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
              >
                {s.value}
              </div>
              <div className="mono text-[10px] opacity-60">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-4">
            <span className="mono text-[11px] opacity-50 block mb-4">
              [ TRAYECTORIA ]
            </span>
            <h3
              className="display"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
            >
              UNA LÍNEA
              <br />
              DE TIEMPO
            </h3>
          </div>
          <div className="md:col-span-8">
            <ol className="relative flex flex-col">
              {/* Línea vertical */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-2 bottom-2 w-px"
                style={{ background: "var(--line)" }}
              />
              {ABOUT.timeline.map((t, i) => (
                <li
                  key={t.year}
                  className="timeline-item relative pl-8 md:pl-10 pb-10 last:pb-0"
                >
                  {/* Dot */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 w-3 h-3 rounded-full"
                    style={{
                      background: "var(--ink)",
                      transform: "translateX(-5px)",
                    }}
                  />
                  <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                    <span
                      className="display"
                      style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
                    >
                      {t.year}
                    </span>
                    <span className="mono text-[11px] opacity-50">·</span>
                    <span className="text-[14px] font-medium">{t.role}</span>
                  </div>
                  <div className="mono text-[11px] opacity-60 mb-2">{t.org}</div>
                  <p className="text-[13px] md:text-[14px] leading-relaxed max-w-[50ch]">
                    {t.desc}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
