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
    { label: "Contacto", target: "#contacto" },
  ],
};

export const HERO = {
  lines: ["CÓDIGO", "Y DISEÑO QUE", "ELEVAN TU MARCA"],
  bio: "Desarrollador front-end creando sitios web, experiencias y productos que hacen que la gente deje de hacer scroll.",
};

export type SceneKind = "burger" | "lego" | "icecream" | "glass";

export type Project = {
  keyword: string;
  name: string;
  description: string;
  tags: string[];
  url: string;
  liveUrl: string; // URL real del proyecto en producción
  scene: SceneKind; // tipo de escena SVG
  accent: string; // color de acento del proyecto (hex)
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
    keyword: "CARNE VIVA",
    name: "Carne Viva",
    description:
      "Hamburguesería con identidad explosiva. Una hamburguesa cartoon que brinca, te mira y se desarma capa por capa al hacer scroll. Carácter, humor y motion design en cada pixel.",
    tags: ["Branding", "Motion", "Scroll"],
    url: "#",
    liveUrl: "https://hamburguesas-five.vercel.app/",
    scene: "burger",
    accent: "#e8542a",
    year: "2025",
    role: "Front-end + Motion",
    client: "Carne Viva",
    duration: "5 semanas",
    gallery: [
      "Hamburguesa mascot que brinca y reacciona al cursor",
      "Desarme de capas sincronizado con scroll",
      "Recetas que se construyen ingrediente por ingrediente",
    ],
    highlights: [
      "Personaje SVG animado que brinca idle y se desarma con scroll",
      "Recetas como combinaciones de casa, no lotería de ingredientes",
      "Identidad caricaturesca con humor y carácter",
      "Animación de capas con Framer Motion + CSS keyframes",
    ],
    results: [
      { label: "Tiempo en página", value: "+180%" },
      { label: "Engagement", value: "Alto" },
      { label: "Recetas", value: "4" },
    ],
  },
  {
    keyword: "BLOQUE",
    name: "BLOQE",
    description:
      "Escuela de educación inicial donde cada bloque cuenta una historia. Bloques Lego isométricos que se arman y desarman con el scroll. Educación visual, bloque a bloque.",
    tags: ["SVG", "Educativo", "3D Iso"],
    url: "#",
    liveUrl: "https://vercel.com/rogeliodaniels-projects/bloqe",
    scene: "lego",
    accent: "#f5b82e",
    year: "2025",
    role: "Front-end + 3D",
    client: "BLOQE",
    duration: "8 semanas",
    gallery: [
      "Castillo de bloques que se construye con el scroll",
      "Sistema de voxels a Lego con agrupado greedy meshing",
      "Render isométrico SVG con sombreado de 3 caras",
    ],
    highlights: [
      "Motor de voxels a bloques Lego hecho desde cero",
      "9 generadores de estructuras procedurales (castillo, escuela, ABC)",
      "Render isométrico SVG + CSS transforms (sin WebGL, ligero en móvil)",
      "Animación de armado/desarmado controlada por scroll",
    ],
    results: [
      { label: "Generadores", value: "9" },
      { label: "Paletas", value: "10" },
      { label: "Peso", value: "Ligero" },
    ],
  },
  {
    keyword: "CREMA",
    name: "Helado Nube",
    description:
      "Heladería artesanal de lujo desde 1962. Cremas fluyentes, tema reactivo por sabor y un mascot de helado que te sigue con la mirada. El lujo se sirve despacio.",
    tags: ["Editorial", "WebGL", "Luxury"],
    url: "#",
    liveUrl: "https://helados-coral.vercel.app/",
    scene: "icecream",
    accent: "#a73f55",
    year: "2025",
    role: "Front-end + Shaders",
    client: "Helado Nube",
    duration: "7 semanas",
    gallery: [
      "Intro WebGL de crema que inunda y se retira",
      "Tema del sitio que cambia según el sabor activo",
      "Mascot de helado que sigue el cursor",
    ],
    highlights: [
      "Shader WebGL de crema con ruido fbm y cintas de color",
      "6 temas cromáticos reactivos al sabor seleccionado",
      "Cortina de crema que cubre y revela en navegación",
      "Carrito con checkout por WhatsApp",
    ],
    results: [
      { label: "Sabores", value: "6" },
      { label: "Estilo", value: "Luxury" },
      { label: "Desde", value: "1962" },
    ],
  },
  {
    keyword: "PRISMA",
    name: "PRISMA Vidriería",
    description:
      "Vidriería de autor desde 1998. Vidrio que se estrella y se reconstruye. Atelier de precisión con telemetría HUD, cobre y obsidiana. Cada panel, una obra.",
    tags: ["HUD", "Shaders", "Atelier"],
    url: "#",
    liveUrl: "https://vercel.com/rogeliodaniels-projects/vidrieria",
    scene: "glass",
    accent: "#b87333",
    year: "2025",
    role: "Front-end + 3D",
    client: "PRISMA",
    duration: "9 semanas",
    gallery: [
      "Panel de vidrio que se fractura en 280 esquirlas",
      "Reconstrucción inversa antes de revelar el hero",
      "Carrusel con 6 transiciones de vidrio distintas",
    ],
    highlights: [
      "Fractura procedural radial con geometría de un solo draw call",
      "Reconstrucción inversa del panel tras el impacto",
      "Carrusel de materiales con 6 efectos de transición",
      "Chat en vivo + presencia + cotizador en tiempo real",
    ],
    results: [
      { label: "Esquirlas", value: "280" },
      { label: "Transiciones", value: "6" },
      { label: "Desde", value: "1998" },
    ],
  },
];

export const SERVICES = {
  statement: [
    "YA SEA QUE NECESITES",
    "RENOVAR TU PÁGINA O",
    "CREAR TU CONCEPTO DE NEGOCIO.",
  ],
  subtitle:
    "Estos son algunos de los proyectos que he lanzado. Lo importante: que tus clientes sientan que pueden hacer o actualizar su página y su concepto de negocio con nosotros.",
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

