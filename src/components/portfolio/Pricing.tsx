"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { PRICING, WHATSAPP_NUMBER } from "@/lib/portfolio-content";
import { usePrefersReducedMotion } from "@/lib/motion-hooks";
import AudioTitleWave from "./AudioTitleWave";

/**
 * Pricing — pantalla de precios (una vista, sin scroll interno en desktop).
 * 3 planes con precio "desde", features y CTA a WhatsApp con mensaje
 * pre-llenado según el plan. Coherente con la estética del sitio.
 */
export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const cards = ref.current?.querySelectorAll(".price-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1, delay: 0.15 }
        );
      }
      const head = ref.current?.querySelectorAll(".price-head");
      if (head) {
        gsap.fromTo(
          head,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }
        );
      }
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const waLink = (plan: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Hola BCForge, me interesa el plan "${plan}". ¿Me pueden dar más información?`
    )}`;

  return (
    <section
      ref={ref}
      id="precios"
      data-screen-scroll
      className="relative h-[100svh] w-full overflow-y-auto overflow-x-hidden"
      aria-label="Precios"
    >
      <div className="pricing-layout container-edge w-full min-h-[100svh] flex flex-col justify-start">
        {/* Encabezado */}
        <div className="mb-8 md:mb-10 max-w-[46ch]">
          <span className="price-head section-label block mb-4">
            {PRICING.eyebrow}
          </span>
          <h2
            className="price-head audio-title display"
            style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)" }}
          >
            <AudioTitleWave variant="spark" />
            {PRICING.title.join(" ")}
          </h2>
          <p className="price-head mt-4 text-[13px] md:text-[15px] leading-relaxed opacity-80 max-w-[42ch]">
            {PRICING.intro}
          </p>
        </div>

        {/* Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {PRICING.tiers.map((tier) => (
            <div
              key={tier.name}
              className="price-card relative rounded-2xl border p-6 md:p-6 flex flex-col"
              style={{
                borderColor: tier.popular ? "var(--ink)" : "var(--pill-border)",
                background: tier.popular
                  ? "rgba(220,226,240,0.06)"
                  : "transparent",
              }}
            >
              {tier.popular && (
                <span
                  className="pill absolute -top-3 right-5"
                  style={{
                    background: "var(--ink)",
                    color: "var(--bg-light)",
                    borderColor: "var(--ink)",
                  }}
                >
                  Más popular
                </span>
              )}

              <span className="mono text-[11px] opacity-60">{tier.name}</span>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="mono text-[12px] opacity-50">desde</span>
                <span
                  className="display"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  {tier.price}
                </span>
                <span className="mono text-[11px] opacity-50">{tier.unit}</span>
              </div>
              <p className="text-[12px] opacity-70 mt-1 mb-5">{tier.tagline}</p>

              <ul className="flex flex-col gap-2.5 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    <span
                      aria-hidden="true"
                      className="mt-[6px] block shrink-0 w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--ink)", opacity: 0.7 }}
                    />
                    <span className="opacity-90">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={waLink(tier.name)}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="WHATSAPP"
                className={tier.popular ? "btn-primary mt-auto justify-center" : "btn-primary btn-primary--light mt-auto justify-center"}
              >
                Cotizar por WhatsApp
                <span className="btn-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>

        {/* Nota */}
        <p className="price-head mt-6 md:mt-8 text-[12px] opacity-60 max-w-[70ch] leading-relaxed">
          {PRICING.note}
        </p>
      </div>
    </section>
  );
}
