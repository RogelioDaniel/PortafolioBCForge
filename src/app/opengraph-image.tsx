import { ImageResponse } from "next/og";

/**
 * opengraph-image — imagen de vista previa (1200×630) que ven Facebook,
 * WhatsApp, LinkedIn, iMessage, Slack, etc. al compartir el sitio.
 *
 * Next.js App Router la detecta automáticamente y genera las etiquetas
 * <meta property="og:image"> apuntando a la URL absoluta (gracias a
 * metadataBase configurado en layout.tsx).
 *
 * Estilo coherente con el sitio: fondo lavanda + glow durazno + tipografía
 * display pesada + marcas HUD de esquina. Usa sans-serif del sistema para
 * evitar dependencia de red en tiempo de build (Satori lo soporta nativo).
 */

export const alt = "BCForge — Sitios web que elevan tu negocio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const runtime = "nodejs";
// Pre-renderiza la imagen en build (cacheada, rápida en runtime).
export const dynamic = "force-static";

// Paleta del sitio (ver globals.css)
const BG = "#dce2f0"; // lavanda
const GLOW = "#f3d8cd"; // durazno
const INK = "#0e0e10"; // tinta

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: INK,
          padding: 64,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow durazno en esquina superior derecha (igual que el sitio) */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${GLOW} 0%, transparent 65%)`,
            opacity: 0.85,
          }}
        />

        {/* Marcas HUD de esquina */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 28,
            height: 28,
            borderTop: `2px solid ${INK}`,
            borderLeft: `2px solid ${INK}`,
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 28,
            height: 28,
            borderTop: `2px solid ${INK}`,
            borderRight: `2px solid ${INK}`,
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            width: 28,
            height: 28,
            borderBottom: `2px solid ${INK}`,
            borderLeft: `2px solid ${INK}`,
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            width: 28,
            height: 28,
            borderBottom: `2px solid ${INK}`,
            borderRight: `2px solid ${INK}`,
            opacity: 0.5,
          }}
        />

        {/* Header — logo + año */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            fontFamily: "monospace",
            letterSpacing: 1,
            opacity: 0.6,
          }}
        >
          <span style={{ fontWeight: 700 }}>BCFORGE</span>
          <span>CONSULTORA · {new Date().getFullYear()}</span>
        </div>

        {/* Centro — titular display + subtítulo */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 20,
              fontFamily: "monospace",
              letterSpacing: 2,
              opacity: 0.55,
            }}
          >
            [ SITIOS WEB · TIENDAS · EXPERIENCIAS ]
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              lineHeight: 0.88,
              letterSpacing: -4,
              textTransform: "uppercase",
              maxWidth: 1020,
            }}
          >
            Elevamos tu negocio en la web
          </div>
          <div
            style={{
              fontSize: 27,
              opacity: 0.7,
              maxWidth: 820,
              lineHeight: 1.4,
            }}
          >
            Páginas web, tiendas en línea y experiencias interactivas. Desde
            $3,000 MXN.
          </div>
        </div>

        {/* Footer — url + precio */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            fontFamily: "monospace",
          }}
        >
          <span style={{ fontWeight: 700 }}>bcforge.company</span>
          <span
            style={{
              border: `1px solid ${INK}`,
              borderRadius: 999,
              padding: "10px 20px",
              fontSize: 18,
              letterSpacing: 1,
            }}
          >
            DESDE $3,000 MXN
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
