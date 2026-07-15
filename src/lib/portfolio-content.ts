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
    { label: "Sobre mí", target: "#sobre-mi" },
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
  // Detalle para el modal
  year: string;
  role: string;
  client: string;
  duration: string;
  gallery: string[]; // descripciones de "imágenes" (gradientes decorativos)
  highlights: string[];
  results: { label: string; value: string }[];
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
    year: "2024",
    role: "Front-end + 3D",
    client: "Aurora Arquitectos",
    duration: "4 meses",
    gallery: [
      "Vista del recorrido 3D del lobby principal",
      "Configurador de materiales en tiempo real",
      "Transición cinematográfica entre plantas",
    ],
    highlights: [
      "Recorridos virtuales renderizados en tiempo real con WebGL",
      "Sistema de iluminación dinámico basado en hora del día",
      "Transiciones cinematográficas entre espacios",
      "Optimización para dispositivos móviles (60fps en mid-range)",
    ],
    results: [
      { label: "Tiempo en página", value: "+240%" },
      { label: "Leads cualificados", value: "+180%" },
      { label: "Lighthouse Perf", value: "94" },
    ],
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
    year: "2024",
    role: "Front-end lead",
    client: "Nebula Tech",
    duration: "6 meses",
    gallery: [
      "Configurador de producto en vivo",
      "Checkout optimizado sin fricción",
      "Vista 360° interactiva del producto",
    ],
    highlights: [
      "Configurador de producto interactivo en tiempo real",
      "Checkout optimizado (1-página, sin registro obligatoria)",
      "Vista 360° de productos con zoom progresivo",
      "Integración con inventario en tiempo real",
    ],
    results: [
      { label: "Conversión", value: "+38%" },
      { label: "Ticket medio", value: "+22%" },
      { label: "Tasa de rebote", value: "-31%" },
    ],
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
    year: "2023",
    role: "Full-stack",
    client: "Grupo Milenio",
    duration: "8 meses",
    gallery: [
      "Dashboard principal con widgets configurables",
      "Visualización de datos en tiempo real",
      "Sistema de roles multi-tenant",
    ],
    highlights: [
      "Arquitectura multi-tenant escalable (12,000+ usuarios)",
      "Visualización de datos complejos con D3 + WebGL",
      "Sistema de permisos granular por rol",
      "API GraphQL con subscriptions en tiempo real",
    ],
    results: [
      { label: "Usuarios activos", value: "12K+" },
      { label: "Uptime", value: "99.9%" },
      { label: "Query time", value: "-65%" },
    ],
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
    year: "2023",
    role: "Tech lead",
    client: "Helios Corp",
    duration: "12 meses",
    gallery: [
      "Portal principal con diseño system unificado",
      "Flujo de autenticación SSO accesible",
      "Panel de administración multi-rol",
    ],
    highlights: [
      "Design system con 200+ componentes documentados",
      "Accesibilidad WCAG 2.1 AA auditada",
      "Integración SSO (SAML + OIDC) para 12,000+ usuarios",
      "Rendimiento optimizado para mercados emergentes (3G)",
    ],
    results: [
      { label: "Adopción", value: "94%" },
      { label: "Tickets soporte", value: "-58%" },
      { label: "Score a11y", value: "AA" },
    ],
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
      excerpt:
        "Patrones y técnicas para mantener 60fps en escenas complejas: instancing, LOD, frustum culling y más.",
      readTime: "8 min",
    },
    {
      category: "Animación",
      date: "28 Feb 2025",
      title: "Scroll storytelling: la guía completa con GSAP",
      excerpt:
        "Cómo diseñar narrativas de scroll que atrapen al usuario, desde el pinning hasta el scrub y los reveals.",
      readTime: "12 min",
    },
    {
      category: "Performance",
      date: "10 Feb 2025",
      title: "Core Web Vitals en sitios 3D: mitos y realidades",
      excerpt:
        "¿Se puede tener un sitio 3D con LCP < 2.5s? Sí, y te cuento cómo lograrlo sin sacrificar la experiencia.",
      readTime: "10 min",
    },
    {
      category: "Design",
      date: "22 Ene 2025",
      title: "Micro-interacciones: el detalle que separa lo bueno de lo memorable",
      excerpt:
        "Principios de motion design para web: timing, easing, y cuándo animar (y cuándo no).",
      readTime: "6 min",
    },
    {
      category: "Three.js",
      date: "05 Ene 2025",
      title: "Shaders para diseñadores: una introducción visual",
      excerpt:
        "GLSL sin miedo: cómo escribir tu primer fragment shader y entender el pipeline de WebGL.",
      readTime: "15 min",
    },
    {
      category: "Accesibilidad",
      date: "18 Dic 2024",
      title: "Accesibilidad en experiencias 3D: no es opcional",
      excerpt:
        "Cómo hacer que tus escenas Three.js sean navegables con teclado y lectores de pantalla.",
      readTime: "9 min",
    },
  ],
};

export const CONTACT = {
  budgets: ["<1K", "1K–5K", "5K+"],
};

export const ABOUT = {
  eyebrow: "[ SOBRE MÍ ]",
  title: ["DISEÑO", "CON CÓDIGO.", "CONSTRUYO", "CON ALMA."],
  intro:
    "Soy Rogelio Daniel, desarrollador front-end especializado en experiencias web inmersivas. Combinando diseño obsesivo y código limpio, construyo sitios que la gente recuerda.",
  body: "Llevo más de 8 años creando productos digitales para startups y empresas en LATOM, EU y EE.UU. Mi obsesión: que cada interacción se sienta intencional, cada animación tenga propósito, y cada pixel cargue significado. Cuando no estoy codeando, estoy explorando shaders, montando en bici o tomando café de especialidad.",
  stats: [
    { value: "8+", label: "Años de experiencia" },
    { value: "60+", label: "Proyectos lanzados" },
    { value: "14", label: "Países atendidos" },
    { value: "∞", label: "Tazas de café" },
  ],
  timeline: [
    {
      year: "2025",
      role: "Front-end Lead",
      org: "Estudio independiente",
      desc: "Liderando proyectos 3D y experiencias inmersivas para clientes globales.",
    },
    {
      year: "2022",
      role: "Senior Front-end",
      org: "Agencia digital",
      desc: "Especialización en WebGL, GSAP y scroll storytelling. 3 SOTD en Awwwards.",
    },
    {
      year: "2019",
      role: "Front-end Developer",
      org: "Startup SaaS",
      desc: "Construcción de design systems y dashboards de data-viz en tiempo real.",
    },
    {
      year: "2017",
      role: "Junior Developer",
      org: "Primeros pasos",
      desc: "Empezando con HTML, CSS y JS vanilla. Descubrí GSAP y nunca volví atrás.",
    },
  ],
};

export const TESTIMONIALS = [
  {
    quote:
      "Rogelio no solo entregó un sitio, entregó una experiencia. La conversión se disparó y nuestros clientes no dejan de hablar del sitio.",
    author: "María Fernández",
    role: "CEO, Nebula Tech",
  },
  {
    quote:
      "Trabajar con él es raro: combina el rigor técnico de un senior con la sensibilidad de un director de arte. Punto de referencia para nuestros proyectos.",
    author: "Carlos Mendez",
    role: "Product Lead, Grupo Milenio",
  },
  {
    quote:
      "El nivel de detalle en cada animación, cada transición, cada micro-interacción es obsesivo. El resultado habla por sí solo: Awwwards SOTD.",
    author: "Ana Ruiz",
    role: "Creative Director, Aurora",
  },
  {
    quote:
      "Nos entregó un design system que escaló a 12,000 usuarios sin un solo ticket de UX. Profesional y humano en igual medida.",
    author: "David Soler",
    role: "CTO, Helios Corp",
  },
];

export const FAQ = {
  eyebrow: "[ PREGUNTAS FRECUENTES ]",
  title: ["¿DUDAS?", "RESPONDO."],
  intro:
    "Las preguntas que más recibo. Si tienes una que no está aquí, escríbeme y te respondo personalmente.",
  items: [
    {
      q: "¿Cuánto tarda un proyecto típico?",
      a: "Depende del alcance: una landing page inmersiva toma 2-3 semanas, un sitio 3D completo 6-10 semanas, y un producto SaaS 3-6 meses. Tras una llamada de descubrimiento te doy un estimado preciso.",
    },
    {
      q: "¿Trabajas con clientes de cualquier país?",
      a: "Sí. Trabajo remoto desde Guadalajara, México, para clientes en toda LATAM, EE.UU. y Europa. Me adapto a tu zona horaria para reuniones y comunicación asíncrona.",
    },
    {
      q: "¿Incluye diseño o solo desarrollo?",
      a: "Ambos. Lidero el diseño visual y la dirección de arte, y también escribo todo el código. Si ya tienes diseño, lo implemento con fidelidad pixel-perfect. Si no, lo creamos juntos.",
    },
    {
      q: "¿Qué tecnologías utilizas?",
      a: "Stack core: React/Next.js, TypeScript, Three.js, GSAP y Tailwind. Para backend: Node.js, Prisma y PostgreSQL. Cada proyecto elige las herramientas óptimas, no las de moda.",
    },
    {
      q: "¿Ofreces mantenimiento post-lanzamiento?",
      a: "Sí. Todos los proyectos incluyen 30 días de soporte gratuito. Después ofrezco planes de mantenimiento mensual (actualizaciones, monitorización, mejoras iterativas).",
    },
    {
      q: "¿Cómo es el proceso de pago?",
      a: "50% al inicio, 50% al entregar. Para proyectos largos, hitos intermedios. Acepto transferencia, PayPal y cripto. Facturación formal disponible.",
    },
  ],
};

