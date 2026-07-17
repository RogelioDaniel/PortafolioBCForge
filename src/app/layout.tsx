import type { Metadata } from "next";
import { Archivo, Space_Mono, Inter, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { themeInitScript } from "@/lib/use-theme";

// Display: Archivo VARIABLE con eje de anchura (wdth 62–125).
// CRÍTICO: sin `axes: ["wdth"]` next/font sirve instancias estáticas y
// `font-stretch` se ignora — el look condensado de todo el sitio depende de esto.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BCForge — Sitios web que elevan tu negocio",
  description:
    "BCForge, consultora de desarrollo web en México. Creamos páginas web, tiendas en línea y experiencias interactivas desde $3,000 MXN.",
  keywords: [
    "BCForge",
    "páginas web México",
    "desarrollo web",
    "tienda en línea",
    "sitios web",
    "diseño web",
    "landing page",
  ],
  authors: [{ name: "BCForge" }],
  openGraph: {
    title: "BCForge — Sitios web que elevan tu negocio",
    description:
      "Consultora de desarrollo web en México. Páginas, tiendas en línea y experiencias interactivas desde $3,000 MXN.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Evita FOUC del dark mode: aplica la clase antes de pintar */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${archivo.variable} ${spaceMono.variable} ${inter.variable} ${caveat.variable} antialiased`}
      >
        {children}
        <Toaster />
        <SonnerToaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--ink)",
              color: "var(--bg-light)",
              border: "1px solid var(--ink)",
              borderRadius: "999px",
              fontFamily: "var(--font-space-mono)",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
          }}
        />
      </body>
    </html>
  );
}
