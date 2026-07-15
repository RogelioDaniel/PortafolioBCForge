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

### ⚠️ Restricción del sandbox (importante)
El servidor `next dev` **muere entre llamadas del bash tool** (el sandbox reaporea procesos background cuando termina la sesión de shell). Por eso cada verificación requiere arrancar el servidor y testear en el MISMO comando bash. El usuario puede previsualizar vía el Preview Panel; si ve la pantalla de "Z.ai Logo" (waiting del gateway Caddy :81), significa que localhost:3000 está caído y hay que reiniciar `bun run dev`.

### Mejoras posibles para próximas fases (cron webDevReview)
1. ~~**Sonido real del preloader**~~ ✅ Hecho (Ronda 2 — Web Audio API ambient pad)
2. **Imágenes reales de proyectos/blog:** usar image-generation skill para thumbnails WebP en lugar de los gradientes decorativos placeholder.
3. ~~**Parallax por capas (data-speed)**~~ ✅ Hecho (Ronda 2 — cableado con ScrollTrigger en Achievements)
4. **Página de proyecto individual:** el botón VER PROYECTO apunta a `#`; crear vista detalle con transición (modal overlay con galería + info detallada).
5. **Footer sticky verificado en contenido corto:** confirmar que en páginas con poco contenido el footer queda pegado al fondo (la estructura page-shell con min-h-screen + mt-auto ya lo garantiza, pero validar en navegador).
6. **Optimización Three.js:** el ProjectsSceneManager recrea geometría/material al cambiar de proyecto — podría poolarse.
7. **Accesibilidad:** añadir aria-label más descriptivos a los canvas 3D (actualmente aria-hidden).
8. **Performance:** lazy-load de Three.js con dynamic import para reducir el bundle inicial.
9. **Hero 3D integración:** VLM sugiere que los objetos 3D podrían estar más integrados con el texto (8/10 → 10/10). Considerar partículas o shader de fondo sutil.
10. **Sección "Sobre mí" dedicada:** el manifiesto cubre parte, pero falta una sección con foto/avatar + bio extendida + timeline de carrera.
11. **Modo oscuro persistente:** el theme flip actual es solo para la sección cinética; añadir toggle de modo oscuro global con next-themes.

### Nota sobre el stack
El usuario solicitó Vite + vanilla JS. Se construyó sobre Next.js 16 (requisito del sandbox) preservando 100% del lenguaje visual y de movimiento. Toda la lógica de animación (GSAP, Lenis, Three.js) es idéntica a como sería en Vite; solo cambia el wrapper de framework. Los placeholders `[CORCHETES]` están localizados en `src/lib/portfolio-content.ts`.
