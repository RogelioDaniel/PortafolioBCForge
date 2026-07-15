import type { Metadata } from "next";
import { Archivo, Space_Mono, Inter, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Display: Archivo variable — usaremos el eje de anchura condensado via font-stretch
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
  title: "rogelio·dev — Código y diseño que elevan tu presencia digital",
  description:
    "Portafolio de Rogelio Daniel, desarrollador front-end especializado en sitios web 3D, experiencias interactivas y productos digitales inmersivos.",
  keywords: [
    "portafolio",
    "desarrollador front-end",
    "Three.js",
    "GSAP",
    "web 3D",
    "experiencias interactivas",
  ],
  authors: [{ name: "Rogelio Daniel" }],
  openGraph: {
    title: "rogelio·dev — Portafolio",
    description:
      "Código y diseño que elevan tu presencia digital. Sitios web 3D, experiencias y productos interactivos.",
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
      <body
        className={`${archivo.variable} ${spaceMono.variable} ${inter.variable} ${caveat.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
