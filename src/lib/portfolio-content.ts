/**
 * Contenido del portafolio — placeholders en español, fáciles de localizar.
 * Cambia aquí los textos y se actualizan en todo el sitio.
 */

export const SITE = {
  logo: "rogelio·dev",
  email: "rogeliodanielrg@gmail.com",
  city: "Guadalajara, México",
  social: [
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "GitHub", href: "https://github.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "X", href: "https://x.com" },
  ],
  nav: [
    { label: "Proyectos", target: "#proyectos" },
    { label: "Sobre mí", target: "#manifesto" },
    { label: "Lab", target: "#logros" },
    { label: "Blog", target: "#blog" },
    { label: "Contacto", target: "#contacto" },
  ],
};

export const HERO = {
  lines: ["CÓDIGO", "Y DISEÑO QUE", "ELEVAN TU PRESENCIA"],
  bio: "Desarrollador front-end creando sitios web, experiencias y productos que hacen que la gente deje de hacer scroll.",
};

export type Project = {
  keyword: string;
  name: string;
  description: string;
  tags: string[];
  url: string;
  // tipo de primitiva 3D
  shape: "sphere" | "torus" | "cube" | "octahedron";
  color: number;
  metalness: number;
  roughness: number;
};

export const PROJECTS: Project[] = [
  {
    keyword: "INMERSIVO",
    name: "Aurora Studio",
    description:
      "Sitio inmersivo 3D para un estudio de arquitectura. Recorridos virtuales en tiempo real con WebGL, iluminación dinámica y transiciones cinematográficas entre espacios.",
    tags: ["Inmersivo", "3D", "WebGL"],
    url: "#",
    shape: "sphere",
    color: 0xd4a24c, // dorado
    metalness: 0.9,
    roughness: 0.15,
  },
  {
    keyword: "INTERACTIVO",
    name: "Nebula Commerce",
    description:
      "E-commerce de productos tecnológicos con experiencias interactivas por producto, configurador en vivo y checkout sin fricción. Aumentó la conversión un 38%.",
    tags: ["Interactivo", "E-commerce", "React"],
    url: "#",
    shape: "torus",
    color: 0x7b3ff2, // púrpura
    metalness: 0.6,
    roughness: 0.3,
  },
  {
    keyword: "A MEDIDA",
    name: "Milenio Dashboard",
    description:
      "Plataforma SaaS a medida para gestión de medios. Panel en tiempo real, visualización de datos complejos y arquitectura multi-tenant escalable.",
    tags: ["A medida", "SaaS", "Data-viz"],
    url: "#",
    shape: "cube",
    color: 0x2e6bff, // azul
    metalness: 0.3,
    roughness: 0.1,
  },
  {
    keyword: "ENTERPRISE",
    name: "Helios Enterprise",
    description:
      "Portal empresarial para 12,000+ usuarios. Diseño system, accesibilidad AA, integraciones con SSO y rendimiento optimizado en mercados emergentes.",
    tags: ["Enterprise", "Accesibilidad", "SSO"],
    url: "#",
    shape: "octahedron",
    color: 0xe8e8ec,
    metalness: 0.1,
    roughness: 0.6,
  },
];

export const SERVICES = {
  statement: ["YA SEA QUE NECESITES UN", "SITIO WEB, UNA APP O", "EXPERIENCIAS INTERACTIVAS."],
  columns: [
    {
      chip: "Servicios",
      items: [
        "Sitios web 3D",
        "Landing pages",
        "Web apps",
        "E-commerce",
        "Animación web",
        "Design systems",
      ],
    },
    {
      chip: "Stack",
      items: [
        "React / Next.js",
        "Three.js / R3F",
        "GSAP",
        "TypeScript",
        "Node.js",
        "Prisma / Postgres",
      ],
    },
    {
      chip: "♥",
      items: [
        "Motion design",
        "Shader art",
        "Scroll storytelling",
        "Micro-interacciones",
        "Accesibilidad",
        "Performance",
      ],
    },
  ],
};

export const KINETIC_WORDS = [
  "EMPUJANDO",
  "LOS LÍMITES",
  "DE LO POSIBLE",
  "EN LA WEB",
];

export const MANIFESTO = [
  {
    title: "EL GRAN TRABAJO NO SUCEDE SIN UN GRAN EQUIPO.",
    body: "Creo en la colaboración cercana con diseñadores, estrategas y clientes. Las mejores ideas nacen del diálogo, no del aislamiento. Cada proyecto es una conversación que se convierte en interfaz.",
  },
  {
    title: "INNOVAR — CON UN TOQUE HUMANO.",
    body: "La tecnología debe servir a las personas, no al revés. Busco el equilibrio entre la experimentación técnica y la empatía por quien usa lo que construyo. Detrás de cada pixel hay una decisión humana.",
  },
];

export const ACHIEVEMENTS = {
  title: "LOGROS",
  statement: "RECONOCIMIENTO POR TRABAJO QUE EMPUJA LO POSIBLE EN DISEÑO DIGITAL.",
  more: "+ 6 MÁS",
  items: [
    { name: "Awwwards Site of the Day", count: "03" },
    { name: "CSS Design Awards Winner", count: "02" },
    { name: "FWA of the Day", count: "01" },
    { name: "Google Developer Expert", count: "01" },
    { name: "Speaker — FrontFest", count: "02" },
    { name: "Artículos publicados", count: "24" },
  ],
};

export const BLOG = {
  title: "MIS ARTÍCULOS",
  items: [
    {
      category: "WebGL",
      date: "12 Mar 2025",
      title: "Construyendo escenas 3D performantes con Three.js",
    },
    {
      category: "Animación",
      date: "28 Feb 2025",
      title: "Scroll storytelling: la guía completa con GSAP",
    },
    {
      category: "Performance",
      date: "10 Feb 2025",
      title: "Core Web Vitals en sitios 3D: mitos y realidades",
    },
  ],
};

export const CONTACT = {
  budgets: ["<1K", "1K–5K", "5K+"],
};
