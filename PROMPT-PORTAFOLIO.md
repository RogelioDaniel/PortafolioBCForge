# PROMPT PARA GLM 5.2 — Portafolio estilo Noomo Agency

Copia todo lo que está debajo de la línea y pégalo como prompt.

---

Actúa como un desarrollador front-end senior especializado en sitios "awwwards-level" (GSAP, Three.js, scroll storytelling). Vas a generar la **base completa y funcional** de mi portafolio web personal, inspirado en la dirección de arte de noomoagency.com. No es una copia: es mi portafolio personal con su mismo lenguaje visual y de movimiento.

## 1. Stack técnico (obligatorio)

- **Vite + vanilla JS (ES Modules) + HTML + CSS puro** (sin framework de UI, sin Tailwind).
- Librerías: **GSAP 3 + ScrollTrigger** (animaciones y pinning), **Lenis** (smooth scroll, lerp ≈ 0.09), **Three.js** (escenas 3D ligeras).
- Estructura de archivos clara: `index.html`, `/src/styles/` (base.css, tokens.css, components.css, sections.css), `/src/js/` (main.js, scroll.js, cursor.js, transitions.js, three/hero-scene.js, three/project-scene.js), `/public/assets/`.
- Todo el contenido en **español**, código comentado en los puntos clave.

## 2. Sistema de diseño

### Colores (define como CSS custom properties en `:root`)
- `--bg-light: #DCE2F0` — lavanda/periwinkle pálido, fondo principal de casi todo el sitio.
- `--bg-glow`: un resplandor radial cálido durazno/rosa (`#F3D8CD` → transparente) que flota lentamente sobre el fondo (posición animada con GSAP, 20–30 s en loop, muy sutil). El fondo NUNCA es plano: siempre lavanda + glow en movimiento.
- `--ink: #0E0E10` — texto casi negro.
- `--bg-dark: #000000` — sección de tipografía cinética.
- `--bg-navy: #16132E` — tarjetas/preview de proyecto oscuro.
- `--pill-border: rgba(14,14,16,.35)` — bordes de chips.
- Sin color de acento fijo: el color lo aportan los objetos 3D (dorado, púrpura, azul).

### Tipografía (Google Fonts)
- **Display**: `Archivo` variable, usando el eje de anchura condensado (width ~75–80%), MAYÚSCULAS, line-height 0.88, letter-spacing -0.01em. Titulares gigantes: `clamp(3.5rem, 11vw, 12rem)`.
- **Mono / etiquetas**: `Space Mono` para labels pequeños en mayúsculas (SCROLL, tags, "PROJECT BUDGET", statements secundarios), letter-spacing 0.05em, 11–13px.
- **Cuerpo**: `Inter` 400/500, 14–16px, line-height 1.5, párrafos de máximo ~40ch.
- **Firma**: una fuente script manuscrita (`Caveat`) solo para la palabra decorativa junto al logo en el footer.

### Componentes recurrentes
- **Pill chip**: borde 1px, radius 999px, fondo transparente, texto mono 11px mayúsculas (ej: `Website`, `Services`, `View All`).
- **Botón primario**: pill negro `#111`, texto blanco 12px mayúsculas + flecha →, con efecto **magnético** (se desplaza sutilmente hacia el cursor) y hover que desliza la flecha.
- **Input de formulario**: solo label mono arriba + línea inferior 1px; sin cajas.
- **Motivo de marca pixel/voxel**: iconos pixelados 8-bit (cursor flecha, reloj de arena, ojo) usados como detalle en transiciones, hovers y footer. Créalos como SVG inline.

## 3. Estructura del sitio (una página + transiciones simuladas)

### 3.0 Preloader
Pantalla lavanda con la palabra **"LOADING"** en display condensado gigante a la izquierda, una barra-píldora con borde donde un círculo negro avanza, y el porcentaje grande a la derecha (contador animado 0→100). Debajo, centrado, texto mono: "PARA UNA EXPERIENCIA MÁS INMERSIVA ACTIVA EL SONIDO" con un toggle pill ON/OFF. Al llegar a 100, la pantalla se abre con un wipe vertical.

### 3.1 Header fijo
Logo tipográfico en minúsculas a la izquierda (mi nombre, ej. `rogelio·dev` — usa el placeholder [TU_LOGO]). Menú derecha en mono mayúsculas: PROYECTOS · SOBRE MÍ · LAB · BLOG · CONTACTO. El header se oculta al bajar y reaparece al subir. Al hacer clic en un enlace: **transición de página** (ver 3.10).

### 3.2 Hero (100vh)
- Titular de 3 líneas que ocupa casi todo el ancho: **"DISEÑO QUE ELEVA TU PRESENCIA DIGITAL"** (adáptalo a: "CÓDIGO Y DISEÑO QUE ELEVAN TU PRESENCIA DIGITAL" o placeholder [HEADLINE]). Entrada: las líneas suben desde un clip (mask reveal), stagger 0.12s, ease `power4.out`, duración 1.2s.
- **Escena Three.js**: 2–3 objetos voxel/low-poly blancos mate (estilo pixel 3D) flotando ENTRE las letras: el canvas se coloca sobre el texto y se duplica el titular en una capa superior con `clip-path` parcial, de modo que los objetos parezcan pasar por delante Y por detrás de las letras. Los objetos rotan lento y reaccionan con parallax al mouse (±10°, lerp suave).
- Párrafo pequeño abajo-derecha (máx. 4 líneas): "Desarrollador front-end creando sitios web, experiencias y productos que hacen que la gente deje de hacer scroll." [BIO_CORTA]
- Indicador "SCROLL" + chevron animado abajo-centro (mono, rebote sutil en loop).

### 3.3 Proyectos destacados (scroll storytelling, EL corazón del sitio)
Sección pinneada con ScrollTrigger (`pin: true, scrub: 1`, altura total ≈ 400vh para 3–4 proyectos). Por cada proyecto:
- Una **palabra clave gigante** centrada que define el proyecto: INMERSIVO / INTERACTIVO / A MEDIDA / ENTERPRISE (display condensado, ~14vw).
- Un **objeto 3D central** (Three.js; usa primitivas estilizadas como esfera dorada metálica, torus púrpura, cubo cristal — cada proyecto con material distinto) que rota con el scroll y flota sobre una plataforma low-poly clara.
- Abajo-izquierda: chip `Website` + tags mono "Inmersivo / 3D / Interactivo".
- Abajo-derecha: nombre del proyecto en bold + párrafo de 4–5 líneas. Usa placeholders: [PROYECTO_1_NOMBRE], [PROYECTO_1_DESCRIPCION], etc.
- Centro-abajo: botón pill negro "VER PROYECTO →".
- Transición entre proyectos: la palabra sale hacia arriba con skew sutil, la nueva entra desde abajo; el objeto 3D hace crossfade/morph de escala; textos laterales hacen fade-slide (0.6s, `power3.inOut`).

### 3.4 Servicios y stack
- Statement en display condensado grande: "YA SEA QUE NECESITES UN SITIO WEB, UNA APP O EXPERIENCIAS INTERACTIVAS."
- Tres columnas encabezadas por pill chips: **Servicios** (Sitios web 3D, Landing pages, Web apps, E-commerce, Animación web, [SERVICIOS...]), **Stack** (React, Three.js, GSAP, [STACK...]), **♥** (clientes o tecnologías favoritas). Las filas entran con stagger 0.05s al hacer scroll.

### 3.5 Sección cinética oscura (theme flip)
El fondo de TODA la página funde a negro puro con ScrollTrigger. Sección pinneada donde palabras blancas gigantes se intercambian una a una al ritmo del scroll: "EMPUJANDO → LOS LÍMITES → DE LO POSIBLE → EN LA WEB". Un cursor-flecha voxel 3D flota en la esquina. Al terminar, el fondo vuelve a lavanda.

### 3.6 Manifiesto
Dos bloques editoriales (fondo lavanda): titular display gigante alineado a la izquierda ("EL GRAN TRABAJO NO SUCEDE SIN UN GRAN EQUIPO." / "INNOVAR — CON UN TOQUE HUMANO.") + párrafo pequeño en columna derecha. Reveal por líneas con mask.

### 3.7 Logros / Reconocimientos
- Mini-hero con palabras gigantes (ej. "CERTIFICACIONES" o "LOGROS") y objetos 3D pequeños flotando dispersos con parallax por capas de profundidad.
- Statement en Space Mono: "RECONOCIMIENTO POR TRABAJO QUE EMPUJA LO POSIBLE EN DISEÑO DIGITAL."
- **Lista de filas** (1px de línea divisoria): nombre + superíndice con cantidad + flecha → a la derecha. En hover: la fila activa a opacidad 1, las demás bajan a 0.3, y una **imagen preview flota siguiendo al cursor**. Cierra con "+ [N] MÁS" alineado a la derecha. Usa placeholders [LOGRO_1..6].

### 3.8 Blog / Insights
Titular "MIS ARTÍCULOS" + pill "Ver todos". Filas editoriales: thumbnail 16:9 a la izquierda con chips de categoría apiladas encima; al hover el thumbnail se cubre con overlay oscuro, un **ojo pixelado** SVG y la palabra "LEER"; título del artículo a la derecha (18–22px), debajo "Categoría • Fecha" en mono; flecha → en la esquina. 3 filas placeholder.

### 3.9 Contacto
- Formulario minimalista: inputs de línea "TU NOMBRE", "TU EMAIL", "TU PROYECTO TRATA DE…" (labels mono mayúsculas). 
- "PRESUPUESTO (USD)" con radio-pills seleccionables: `<1K` · `1K–5K` · `5K+`.
- Botón pill negro "ENVIAR →" magnético.
- Envío: `mailto:rogeliodanielrg@gmail.com` o placeholder de action.

### 3.10 Footer + transiciones de página
- Footer sobre el fondo lavanda: columna de links (Proyectos, Sobre mí, Blog, Contacto, Privacidad), columna social (LinkedIn, GitHub, Instagram, X), email visible, y nota: "Tomemos un café. Trabajo desde [CIUDAD] para todo el mundo." Abajo-izquierda el logo + la palabra "portfolio" en script manuscrito; abajo-derecha un icono pixel decorativo.
- **Transición de página** (para los enlaces del menú): overlay lavanda a pantalla completa; en el centro, un reloj de arena pixelado + el nombre de la sección escribiéndose con efecto **typewriter** ("PROYECT|" → "PROYECTOS"); luego el overlay se abre y hace scroll/ancla a la sección. Duración total ≈ 1.1s.

## 4. Animación y micro-interacción (reglas globales)

- **Lenis** para todo el scroll; sincronizado con `gsap.ticker`.
- Reveals de texto SIEMPRE con máscara (overflow hidden + translateY 110% → 0), `power4.out`, 0.9–1.2s, stagger por línea.
- Cursor personalizado: punto negro pequeño que escala 3× sobre elementos interactivos y muestra "VER" sobre las cards de proyecto. Ocúltalo en touch.
- Botones magnéticos (atracción máx. 8px, lerp 0.15).
- Hovers 0.3s `power2.out`; nada instantáneo, nada mayor a 0.4s en micro-interacciones.
- Parallax por capas en objetos decorativos (data-speed).
- `prefers-reduced-motion`: desactiva pin/scrub/parallax/cursor custom y deja fades simples de 0.3s.

## 5. Rendimiento y accesibilidad

- Carga diferida de las escenas Three.js con IntersectionObserver; `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`; pausar el rAF cuando el canvas no está en viewport.
- Imágenes WebP con `loading="lazy"` y dimensiones reservadas (CLS < 0.1). `font-display: swap` y preload de las 2 fuentes críticas.
- Contraste AA (el texto #0E0E10 sobre #DCE2F0 cumple), `:focus-visible` visible, navegación completa por teclado, aria-labels en botones de icono, HTML semántico (header/main/section/footer, un solo h1).
- Mobile-first: en móvil el titular hero baja a ~13vw, las escenas 3D se simplifican (1 objeto, sin parallax de mouse), las filas de blog/logros se apilan, sin scroll horizontal jamás.

## 6. Entregable

Genera TODOS los archivos completos y funcionales (no fragmentos): package.json con dependencias exactas, index.html, todos los CSS y JS, y las escenas Three.js con primitivas (sin cargar modelos externos). El sitio debe correr con `npm install && npm run dev` sin errores. Usa datos placeholder realistas en español donde marqué [CORCHETES] y déjalos fáciles de localizar.
