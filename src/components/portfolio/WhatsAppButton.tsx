"use client";

import { WHATSAPP_URL } from "@/lib/portfolio-content";

/**
 * WhatsAppButton — botón flotante fijo que abre WhatsApp con un mensaje
 * pre-llenado. Colocado arriba de la nav inferior, lado derecho.
 */
export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      data-cursor="WHATSAPP"
      className="wa-fab fixed right-4 bottom-36 md:bottom-40 z-[56] flex items-center justify-center rounded-full"
    >
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path
          fill="#fff"
          d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-4.9 1 1-4.8-.3-.4C5.5 18.9 5 17 5 15 5 9 9.9 4.1 16 4.1S27 9 27 15 22.1 24.8 16 24.8zm5.5-7.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.5-.4z"
        />
      </svg>
      <span className="wa-fab-label">WhatsApp</span>
    </a>
  );
}
