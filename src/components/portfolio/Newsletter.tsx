"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMagnetic } from "@/lib/motion-hooks";

/**
 * Newsletter — signup minimalista para el footer.
 * Input de línea + botón pill magnético "→".
 * Validación de email básica. Toast de confirmación al suscribir.
 * Frase corta invitando a suscribirse.
 */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const btnRef = useMagnetic<HTMLButtonElement>(0.4);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email) {
      toast.error("Falta tu email", {
        description: "Escribe tu email para suscribirte.",
      });
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Email inválido", {
        description: "Revisa el formato: nombre@dominio.com",
      });
      return;
    }
    setSending(true);
    // Simulación de envío (no hay backend real)
    setTimeout(() => {
      toast.success("¡Suscripción confirmada!", {
        description: "Gracias. Te escribiré cuando publique algo nuevo.",
        duration: 5000,
      });
      setEmail("");
      setSending(false);
    }, 800);
  };

  return (
    <div className="w-full">
      <span className="mono text-[11px] opacity-50 block mb-2">
        NEWSLETTER
      </span>
      <p className="text-[13px] leading-relaxed mb-4 max-w-[34ch] opacity-80">
        Conectamos de vez en cuando. Sin spam, solo ideas sobre diseño, código
        y experiencias web.
      </p>
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Tu email
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="line-input"
            style={{ fontSize: 14 }}
          />
        </div>
        <button
          ref={btnRef}
          type="submit"
          disabled={sending}
          aria-label="Suscribirse al newsletter"
          data-cursor="SUSCRIBIR"
          className="btn-primary shrink-0"
          style={{ opacity: sending ? 0.6 : 1, padding: "0.75rem 1.1rem" }}
        >
          {sending ? "…" : "→"}
        </button>
      </form>
    </div>
  );
}
