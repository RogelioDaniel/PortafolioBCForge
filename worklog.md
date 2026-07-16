# Worklog — Portafolio awwwards-level (rogelio·dev)

## 1. Estado actual del proyecto

**Portafolio personal inspirado en noomoagency.com**, construido sobre Next.js 16 + React + TypeScript + Tailwind CSS 4 (el stack obligatorio del sandbox), con GSAP 3 + ScrollTrigger, Lenis y Three.js para la dirección de arte y movimiento solicitados.

**Stack adaptado:** el usuario pidió Vite + vanilla JS, pero el entorno exige Next.js 16. Se preservó íntegramente el lenguaje visual y de movimiento: lavanda + glow durazno animado, tipografía Archivo condensada, Space Mono para labels, mask-reveals, scroll storytelling pinneado, theme flip a negro, cursor custom magnético, transiciones con hourglass pixelado.

**Verificado con agent-browser + VLM (todas las secciones renderizan, 0 errores):**
- ✅ Preloader (LOADING + barra-píldora + % + toggle sonido ON/OFF + wipe vertical)
- ✅ Header fijo (logo + nav mono, oculta al bajar / aparece al subir, menú móvil)
- ✅ Hero 100svh (titular 3 líneas con mask-reveal, 3 objetos 3D voxel blancos flotando ENTRE letras vía clip-path, parallax mouse ±10°, bio, indicador SCROLL)
- ✅ Proyectos (scroll storytelling pinneado ~400vh, 4 proyectos: INMERSIVO/INTERACTIVO/A MEDIDA/ENTERPRISE, escena 3D con morph crossfade entre esfera dorada/torus púrpura/cubo cristal/octaedro, tags, VER PROYECTO magnético)
- ✅ Servicios (statement display + 3 columnas Servicios/Stack/♥ con pill chips, stagger 0.05s)
- ✅ Sección cinética (theme flip a negro con ScrollTrigger, palabras EMPUJANDO→LOS LÍMITES→DE LO POSIBLE→EN LA WEB, cursor-flecha voxel)
- ✅ Manifiesto (2 bloques editoriales, reveal por líneas con mask)
- ✅ Logros (mini-hero + statement mono + filas con hover preview siguiendo cursor)
- ✅ Blog (3 filas editoriales con thumbnail + overlay ojo pixelado + LEER)
- ✅ Contacto (inputs de línea, radio-pills de presupuesto, botón magnético, mailto)
- ✅ Footer (links + social + email + nota + logo + "portfolio" en Caveat + pixel icon)
- ✅ Cursor custom (punto que escala + label "VER"/"LEER"/"ENVIAR")
- ✅ Transiciones de página (overlay lavanda + hourglass pixelado + typewriter)
- ✅ Background glow animado (radial durazno flotando 24s loop)
- ✅ Responsive mobile-first (390px verificado, sin scroll horizontal)
- ✅ prefers-reduced-motion y touch desactivan pin/scrub/parallax/cursor

## 2. Objetivos actuales / modificaciones / verificación

- **Dependencias instaladas:** gsap@3.15, three@0.185, lenis@1.3, @types/three
- **Fuentes Google:** Archivo (display condensado), Space Mono (labels), Inter (cuerpo), Caveat (firma script)
- **Estructura creada:**
  - `src/app/layout.tsx` — fuentes + metadata ES
  - `src/app/globals.css` — design tokens completos (colores, tipografía, componentes, cursor, animaciones)
  - `src/app/page.tsx` — orquestador (preloader → smooth scroll → secciones)
  - `src/lib/motion-hooks.ts` — usePrefersReducedMotion, useIsTouch, useMagnetic (useSyncExternalStore)
  - `src/lib/use-smooth-scroll.ts` — Lenis lerp 0.09 sincronizado con gsap.ticker
  - `src/lib/portfolio-content.ts` — todo el contenido placeholder en español
  - `src/components/portfolio/` — Preloader, Header, Hero, Projects, Services, KineticSection, Manifesto, Achievements, Blog, Contact, Footer, Cursor, BackgroundGlow, PageTransition, PixelIcons
  - `src/components/portfolio/three/` — HeroScene (voxel floaters), ProjectsSceneManager (1 contexto WebGL, morph entre proyectos)
- **next.config.ts** — añadido allowedDevOrigins para el gateway
- **Lint:** ✅ limpio (0 errores)
- **Verificación agent-browser:** título correcto, body con todo el contenido, 0 errores runtime, solo warnings cosméticos de THREE.Clock (ya eliminados cambiando a performance.now())

**VLM confirmó visualmente:**
- Hero: lavender+glow, 3D objects, headline, nav, scroll indicator ✓
- Projects: keyword INMERSIVO, esfera dorada 3D, Aurora Studio, tags, botón ✓
- Services: 3 columnas con pills, list items, statement ✓
- Kinetic: theme flip a negro, LOS LÍMITES ✓
- Footer: los 7 elementos ✓
- Mobile 390px: headline cabe, sin overflow horizontal ✓
- Contact form: inputs rellenables, budget pills seleccionables ✓

## 3. Issues sin resolver / riesgos / siguientes pasos

### Ronda 2 (cron webDevReview) — Cambios aplicados

**QA inicial (agent-browser + VLM):** 0 errores runtime, 0 warnings en consola. VLM identificó issues de pulido:
- Hero: objetos 3D tapaban letras del titular
- Projects: indicadores 01-04 sin estado activo; esfera con hotspots duros
- Kinetic: dos palabras superpuestas durante el scrub
- Contact: contraste de placeholders bajo
- Marquee: no existía (falta firma awwwards)

**Fixes aplicados:**
1. ✅ **Ambient sound real (Web Audio API):** el toggle del preloader ahora controla un pad sintetizado (2 osciladores + filtro lowpass + LFO). Creado `src/lib/ambient-sound.ts` (singleton), `SoundToggle` flotante persistente (botón pixel altavoz, esquina inf-izq). Requiere gesto del usuario (política autoplay).
2. ✅ **Hero 3D reposicionado:** objetos movidos a las 4 esquinas (lejos del titular centrado), escala reducida (0.6–0.7), material translúcido (opacity 0.92), float amplitude reducida. Eliminada la capa clip-path z-3 que causaba distorsión visible en el texto. VLM: hero 8/10, titular limpio.
3. ✅ **Projects indicadores interactivos:** los dots 01-04 ahora son botones clicables que saltan al proyecto, con estado activo (opacidad 1 + línea más larga). Click navega vía Lenis scrollTo.
4. ✅ **Kinetic anti-overlap:** las palabras ahora hacen salida completa ANTES de entrar la nueva (sequential en vez de crossfade simultáneo). VLM confirmó palabra única clara.
5. ✅ **3D sphere lighting suavizado:** ambient 0.75, key 0.9 (era 1.7), añadido fill light, reducido point light púrpura. Sin hotspots duros.
6. ✅ **Contraste mejorado:** placeholders de inputs a 0.5 opacity (era 0.35), SCROLL indicator con pill backing (bg 0.92 + border + blur), keyword de projects a 0.18 opacity sin mix-blend.
7. ✅ **Contact budget pills:** añadido ✓ en la pill seleccionada para claridad visual.

**Features nuevas:**
1. ✅ **Marquee ticker** (`Marquee.tsx`): dos filas infinitas en direcciones opuestas, velocidad ligada al scroll (ScrollTrigger velocity), pausa al hover. Fila superior sólida, inferior outline (WebkitTextStroke 1.5px). Items: Three.js/GSAP/WebGL/... y Sitios 3D/Experiencias/...
2. ✅ **Scroll progress bar** (`ScrollProgress.tsx`): barra fina 3px en la parte superior, scaleX ligado al scroll global (scrub 0.3). Aparece tras preloader.
3. ✅ **Back-to-top button** (`BackToTop.tsx`): botón flotante pixel (flecha arriba) en esquina inf-derecha, aparece tras 80vh scroll, transición suave.
4. ✅ **Keyboard navigation** (`use-keyboard-nav.tsx`): atajos 1→Proyectos, 2→Manifesto, 3→Logros, 4→Blog, 5→Contacto, t/Home→top. No interfiere con inputs. Hint visual flotante que fade-out a los 7s.
5. ✅ **Parallax por capas:** los objetos decorativos de Achievements con `data-speed` ahora se mueven a distintas velocidades según el scroll (profundidad real).
6. ✅ **Custom scrollbar:** scrollbar estilizada (8px, thumb lavanda/ink 0.25, hover 0.45) en webkit + Firefox.

**Verificación final:** 0 errores runtime, 0 console errors, lint limpio. Todas las features confirmadas en DOM vía agent-browser. Keyboard nav probado (press 5 → contacto). VLM hero 8/10.

### Ronda 3 (cron webDevReview) — Cambios aplicados

**QA inicial:** 0 errores runtime, 0 console errors, lint limpio. Body ~3188 chars, 9 secciones. VLM: hero 8/10.

**Features nuevas (3 secciones + 1 modal):**
1. ✅ **ProjectModal** (`ProjectModal.tsx`): overlay a pantalla completa al clic en "VER PROYECTO". Galería navegable (click + flechas teclado), meta info (año/rol/cliente/duración), highlights con checkmarks pixel, resultados en stats boxes con color del proyecto, botón cerrar (X pixel magnético), ESC para cerrar, click backdrop para cerrar, animación GSAP de entrada (wipe up + stagger). Datos extendidos en `portfolio-content.ts` (4 proyectos con highlights/results/gallery).
2. ✅ **AboutSection** (`AboutSection.tsx`): sección "Sobre mí" dedicada con eyebrow + título 4 líneas (DISEÑO/CON CÓDIGO/CONSTRUYO/CON ALMA), intro + body, **stats con contador animado** (8+ años, 60+ proyectos, 14 países, ∞ café), timeline vertical de carrera (4 hitos: 2025/2022/2019/2017) con dots + reveal stagger.
3. ✅ **Testimonials** (`Testimonials.tsx`): sección de reseñas con header "LO QUE DICEN MIS CLIENTES", 2 columnas con parallax vertical opuesto (cinético), cards con comilla pixel decorativa, quote, avatar inicial + autor + rol. 4 testimonials placeholder.
4. ✅ **Noise texture overlay** (`.bg-noise` en globals.css): grano SVG fractal sutil (opacity 0.035, mix-blend multiply) para dar profundidad premium al fondo lavanda.

**Mejoras de styling:**
- Nav "Sobre mí" ahora apunta a `#sobre-mi` (era `#manifesto`)
- Keyboard nav actualizado (2 → sobre-mi)
- ProjectModal con `key={project.name}` para reset de estado en cambio de proyecto

**Verificación final:** 0 errores runtime, 0 console errors, lint limpio. Body creció a 5355 chars, 11 secciones. Modal probado (abre/cierra/galería/ESC). About confirmado en DOM (4 stats, 4 timeline). Testimonials confirmado (5 cards, header correcto). Noise overlay presente. VLM Testimonials 8/10.

### Ronda 4 (cron webDevReview) — Cambios aplicados

**QA inicial:** 0 errores runtime, 0 console errors, lint limpio. Body ~5355 chars, 11 secciones.

**Features nuevas (4):**
1. ✅ **Dark mode persistente** (`ThemeToggle.tsx` + `use-theme.ts`): toggle en header con icono pixel sol/luna. Persiste en localStorage. Script anti-FOUC en `<head>`. CSS tokens completos para dark (--bg-light→#0e0e10, --ink→#f4f4f0, glow púrpura, pills/botones invertidos). Independiente del theme flip de la sección cinética. VLM: dark 8/10, tema oscuro pulido y cohesivo.
2. ✅ **FAQ acordeón** (`FAQ.tsx`): sección de preguntas frecuentes antes del contacto. Título "¿DUDAS? RESPONDO." + intro. 6 preguntas expandibles (uno abierto a la vez), icono +/- pixel que rota 45° al abrir, animación de altura con transition, hairline divisoria. Acordeón accesible (aria-expanded, aria-controls, role=region). VLM: 8/10.
3. ✅ **Blog con búsqueda y filtros** (`Blog.tsx` reescrito): input de búsqueda con botón clear (✕), chips de filtro por categoría (Todas + 6 categorías únicas), filtrado en vivo por texto y categoría, contador de resultados, estado vacío ("NO SE ENCONTRARON ARTÍCULOS"). 6 artículos con excerpt + readTime añadidos al content. VLM: 10/10.
4. ✅ **Contact form toast** (`Contact.tsx` + sonner): feedback visual al enviar — toast success "Abriendo tu cliente de email…" con nombre personalizado, toast error si faltan campos, estado "Enviando…" en botón. Sonner Toaster añadido al layout con styling pill mono que matchea el design system.

**Mejoras de styling:**
- ThemeToggle integrado en header entre nav y mobile menu
- Dark mode CSS completo (tokens, pills, botones, cursor, noise, selection)
- Blog items ampliados a 6 con excerpt + readTime
- Sonner toaster con estilo pill (border-radius 999, mono uppercase)

**Verificación final:** 0 errores runtime, 0 console errors, lint limpio. Body creció a 7748 chars, 13 secciones (12 + notifications). Dark mode probado (toggle on/off correcto). FAQ probado (6 items, expansión correcta, 1 abierto a la vez). Blog search probado (shader→1 resultado). Contact toast probado. VLM: dark 8/10, FAQ 8/10, blog 10/10.

### Ronda 5 (cron webDevReview) — Cambios aplicados

**QA inicial:** 0 errores runtime, 0 console errors, lint limpio. Body ~7748 chars, 13 secciones.

**Features nuevas (3):**
1. ✅ **Command Palette (Cmd+K)** (`CommandPalette.tsx` + `CommandKHint.tsx`): paleta de comandos con `cmdk`. Abre con ⌘K / Ctrl+K / "/". Búsqueda global en tiempo real: navegación (5 secciones), acciones (ir arriba, cambiar tema, contacto), proyectos (4), blog (6 artículos). Agrupados por tipo con headings mono. Animación GSAP de entrada (fade + scale). Cierre con ESC o click backdrop. Hint flotante "⌘K" en esquina inferior derecha que aparece tras 2s. Footer con hints (↵ seleccionar, ↑↓ navegar). Pixel search icon SVG.
2. ✅ **Newsletter signup** (`Newsletter.tsx`): integrado en el footer. Input de línea (estilo minimalista) + botón pill magnético "→". Validación de email con regex. Toast de success ("¡Suscripción confirmada!") y error (email inválido/faltante). Estado sending. Frase invitando a suscribirse.
3. ✅ **Footer mejorado** (`Footer.tsx`): links de navegación y social con hover effect de flecha que desliza desde la izquierda (→ para internos, ↗ para externos). Newsletter integrado bajo el email. Layout refinado con mejor spacing.

**Mejoras de styling:**
- Keyboard hint actualizado: ahora muestra "⌘K · búsqueda" además de "1–5 · secciones"
- Footer social/nav con animación de flecha en hover (translate + opacity)
- CommandKHint con pixel search icon + estilo pill consistente

**Verificación:** Lint limpio. Server devuelve HTTP 200 (113KB). HTML confirma: NEWSLETTER, Buscar artículos, todas las secciones (proyectos, sobre-mi, logros, blog, faq, contacto). 0 errores en dev log. agent-browser no pudo verificar visualmente (timeout por peso de 3D en sandbox), pero curl + grep confirman render correcto.

### ⚠️ Restricción del sandbox (importante)
El servidor `next dev` **muere entre llamadas del bash tool** (el sandbox reaporea procesos background cuando termina la sesión de shell). Por eso cada verificación requiere arrancar el servidor y testear en el MISMO comando bash. El usuario puede previsualizar vía el Preview Panel; si ve la pantalla de "Z.ai Logo" (waiting del gateway Caddy :81), significa que localhost:3000 está caído y hay que reiniciar `bun run dev`.

### Mejoras posibles para próximas fases (cron webDevReview)
1. ~~**Sonido real del preloader**~~ ✅ Hecho (Ronda 2 — Web Audio API ambient pad)
2. **Imágenes reales de proyectos/blog:** usar image-generation skill para thumbnails WebP en lugar de los gradientes decorativos placeholder.
3. ~~**Parallax por capas (data-speed)**~~ ✅ Hecho (Ronda 2 — cableado con ScrollTrigger en Achievements)
4. ~~**Página de proyecto individual**~~ ✅ Hecho (Ronda 3 — ProjectModal overlay con galería + highlights + results)
5. **Footer sticky verificado en contenido corto:** confirmar que en páginas con poco contenido el footer queda pegado al fondo (la estructura page-shell con min-h-screen + mt-auto ya lo garantiza, pero validar en navegador).
6. **Optimización Three.js:** el ProjectsSceneManager recrea geometría/material al cambiar de proyecto — podría poolarse.
7. **Accesibilidad:** añadir aria-label más descriptivos a los canvas 3D (actualmente aria-hidden).
8. **Performance:** lazy-load de Three.js con dynamic import para reducir el bundle inicial.
9. **Hero 3D integración:** VLM sugiere que los objetos 3D podrían estar más integrados con el texto (8/10 → 10/10). Considerar partículas o shader de fondo sutil.
10. ~~**Sección "Sobre mí" dedicada**~~ ✅ Hecho (Ronda 3 — AboutSection con timeline + stats counter)
11. ~~**Modo oscuro persistente**~~ ✅ Hecho (Ronda 4 — ThemeToggle con localStorage, FOUC script, CSS tokens dark)
12. **Filtros de proyectos:** añadir chips de filtro por categoría en la sección de proyectos.
13. ~~**Búsqueda de blog**~~ ✅ Hecho (Ronda 4 — Blog con input search + filtros por categoría, 6 artículos)
14. ~~**FAQ**~~ ✅ Hecho (Ronda 4 — FAQSection acordeón con 6 preguntas, animación +/- pixel)
15. ~~**Toast de confirmación al enviar formulario**~~ ✅ Hecho (Ronda 4 — sonner con success/error, estado sending)
16. **Page transitions con View Transitions API** para navegación real entre rutas.
17. ~~**Command palette (Cmd+K)**~~ ✅ Hecho (Ronda 5 — CommandPalette con cmdk, búsqueda global + navegación)
18. **Compartir en redes** en proyectos/blog (Web Share API).
19. ~~**Newsletter signup**~~ ✅ Hecho (Ronda 5 — Newsletter en footer con validación + toast)
20. **Cookies/privacy banner** minimalista.
21. **Página 404 custom** con diseño awwwards.
22. **Loading skeleton** para secciones pesadas.
23. **Open Graph image** dinámica con OG image generation.

### Nota sobre el stack
El usuario solicitó Vite + vanilla JS. Se construyó sobre Next.js 16 (requisito del sandbox) preservando 100% del lenguaje visual y de movimiento. Toda la lógica de animación (GSAP, Lenis, Three.js) es idéntica a como sería en Vite; solo cambia el wrapper de framework. Los placeholders `[CORCHETES]` están localizados en `src/lib/portfolio-content.ts`.
