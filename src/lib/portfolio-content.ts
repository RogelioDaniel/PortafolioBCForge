/**
 * Contenido del portafolio — placeholders en español, fáciles de localizar.
 * Cambia aquí los textos y se actualizan en todo el sitio.
 */

// Canales de contacto de BCForge
export const WHATSAPP_NUMBER = "525617075485"; // +52 1 55/56... formato wa.me
export const WHATSAPP_MSG = "Hola BCForge, quiero información sobre una página web.";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MSG
)}`;
export const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61590245424775";

export const SITE = {
  logo: "BCForge",
  email: "bcforge@hotmail.com",
  city: "México",
  whatsapp: WHATSAPP_URL,
  whatsappDisplay: "56 1707 5485",
  facebook: FACEBOOK_URL,
  social: [
    { label: "WhatsApp", href: WHATSAPP_URL },
    { label: "Facebook", href: FACEBOOK_URL },
  ],
  nav: [
    { label: "Proyectos", target: "#proyectos" },
    { label: "Precios", target: "#precios" },
    { label: "Nosotros", target: "#sobre-mi" },
    { label: "Contacto", target: "#contacto" },
  ],
};

export const HERO = {
  lines: ["SITIOS WEB", "QUE ELEVAN TU", "NEGOCIO"],
  bio: "BCForge — consultora de desarrollo web. Creamos sitios, tiendas en línea y experiencias interactivas que hacen crecer tu negocio.",
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
    liveUrl: "https://bloqe-beta.vercel.app/",
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
    liveUrl: "https://vidrieria-pi.vercel.app/",
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
    "Estos son algunos de los proyectos que hemos lanzado. Lo importante: que sientas que puedes crear o actualizar tu página y tu concepto de negocio con nosotros.",
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
    body: "En BCForge creemos en la colaboración cercana contigo. Las mejores ideas nacen del diálogo, no del aislamiento. Cada proyecto es una conversación que se convierte en tu sitio web.",
  },
  {
    title: "INNOVAR — CON UN TOQUE HUMANO.",
    body: "La tecnología debe servir a las personas, no al revés. Buscamos el equilibrio entre la experimentación técnica y la empatía por quien usa lo que construimos. Detrás de cada pixel hay una decisión humana.",
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
  budgets: ["$3K–6K", "$6K–15K", "$15K+"],
};

// Precios — sección nueva (MXN). Páginas sencillas desde $3,000.
export const PRICING = {
  eyebrow: "[ PRECIOS ]",
  title: ["PRECIOS", "CLAROS."],
  intro:
    "Sin sorpresas. Elige el punto de partida y lo ajustamos a tu negocio. Precios en pesos mexicanos (MXN).",
  tiers: [
    {
      name: "Página sencilla",
      price: "$3,000",
      unit: "MXN",
      tagline: "Ideal para presentar tu negocio",
      features: [
        "Landing de una sección",
        "Diseño a medida y responsivo",
        "Formulario o botón de WhatsApp",
        "Optimizada para móvil",
      ],
      popular: false,
    },
    {
      name: "Sitio profesional",
      price: "$6,500",
      unit: "MXN",
      tagline: "El favorito de los negocios",
      features: [
        "Hasta 5 secciones o páginas",
        "Animaciones e interacciones",
        "SEO básico y velocidad",
        "Catálogo, blog o galería",
      ],
      popular: true,
    },
    {
      name: "Tienda / A medida",
      price: "$15,000",
      unit: "MXN",
      tagline: "E-commerce o experiencia única",
      features: [
        "Tienda en línea o panel admin",
        "Integraciones y pagos",
        "Experiencias 3D / interactivas",
        "Todo a la medida de tu marca",
      ],
      popular: false,
    },
  ],
  note: "Todos incluyen dominio y hosting el primer año, y 30 días de soporte. ¿No sabes cuál elegir? Escríbenos por WhatsApp y te asesoramos gratis.",
};

export const ABOUT = {
  eyebrow: "[ SOBRE BCFORGE ]",
  title: ["DISEÑO", "CON CÓDIGO.", "CONSTRUIMOS", "TU MARCA."],
  intro:
    "BCForge es una consultora de desarrollo web. Combinamos diseño obsesivo y código limpio para construir sitios que la gente recuerda — y que hacen crecer tu negocio.",
  body: "Trabajamos con negocios y emprendedores de todo México creando páginas web, tiendas en línea y experiencias interactivas. Desde una landing sencilla hasta un producto a medida: cada proyecto se entrega con intención, rendimiento y soporte cercano.",
  stats: [
    { value: "30+", label: "Proyectos lanzados" },
    { value: "100%", label: "Personalizado" },
    { value: "24h", label: "Tiempo de respuesta" },
    { value: "MX", label: "En todo el país" },
  ],
  timeline: [
    {
      year: "01",
      role: "Descubrimiento",
      org: "Entendemos tu negocio",
      desc: "Una llamada para conocer tus objetivos, tu público y qué necesitas lograr con tu sitio.",
    },
    {
      year: "02",
      role: "Diseño",
      org: "Dirección de arte a medida",
      desc: "Definimos identidad, estructura y estilo. Nada de plantillas genéricas: tu marca, tu voz.",
    },
    {
      year: "03",
      role: "Desarrollo",
      org: "Código limpio y rápido",
      desc: "Construimos con las mejores herramientas, cuidando velocidad, SEO y experiencia móvil.",
    },
    {
      year: "04",
      role: "Lanzamiento",
      org: "En línea y con soporte",
      desc: "Publicamos, medimos y te acompañamos 30 días. Después, planes de mantenimiento opcionales.",
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
  title: ["¿DUDAS?", "RESPONDEMOS."],
  intro:
    "Las preguntas que más nos hacen. Si tienes una que no está aquí, escríbenos por WhatsApp y te respondemos personalmente.",
  items: [
    {
      q: "¿Cuánto cuesta una página web?",
      a: "Una página sencilla arranca desde $3,000 MXN. Un sitio profesional de varias secciones desde $6,500 MXN, y una tienda en línea o proyecto a medida desde $15,000 MXN. Te damos un precio exacto tras una llamada corta.",
    },
    {
      q: "¿Cuánto tarda un proyecto?",
      a: "Una landing sencilla toma 1-2 semanas, un sitio profesional 3-5 semanas, y una tienda o proyecto a medida de 6 semanas en adelante. Tras conocer tu proyecto te damos una fecha clara.",
    },
    {
      q: "¿Trabajan en toda la República?",
      a: "Sí. Somos remotos y trabajamos con negocios de todo México. Coordinamos todo por WhatsApp, llamada o videollamada, a tu horario.",
    },
    {
      q: "¿Incluye diseño o solo desarrollo?",
      a: "Ambos. Nosotros diseñamos y programamos tu sitio. Si ya tienes diseño o logo, lo respetamos; si no, lo creamos juntos desde cero.",
    },
    {
      q: "¿Incluye hosting y dominio?",
      a: "Sí. Los planes incluyen dominio y hosting el primer año, más 30 días de soporte. Después ofrecemos mantenimiento mensual opcional.",
    },
    {
      q: "¿Cómo es el proceso de pago?",
      a: "50% para arrancar y 50% al entregar. Aceptamos transferencia y depósito. Emitimos factura si la necesitas.",
    },
  ],
};
