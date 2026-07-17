# HANDOFF — Portafolio de Rogelio (estado actual)

> **Para la siguiente sesión/IA.** Este documento resume TODO el contexto del
> portafolio: arquitectura, decisiones de diseño, lo que ya está hecho, lo que
> falta, y los puntos de atención. Léelo completo antes de tocar código.

---

## 🚀 Cómo levantar el proyecto

```bash
# Desde C:\Users\rogel\Desktop\Portafolio
npm run dev          # arranca en http://localhost:3000 (usa tee a dev.log)
# build de producción:
npm run build        # next.config.ts tiene ignoreBuildErrors: true
```

- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + GSAP + Three.js.
- **Build:** el `next.config.ts` tiene `typescript.ignoreBuildErrors: true`, así que los errores de tipo NO rompen el build (pero hay que evitarlos).
- **El `next` global no funciona** con `npx next build` (descarga una versión ajena y falla con "workspace root"). Usar siempre `npm run dev` / `npm run build` (los scripts locales resuelven bien).

---

## 🎯 Decisión conceptual más importante

El sitio pasó de **scroll libre** a **navegación guiada por pantallas (experiencia VIP)**.

- El **scroll nativo está bloqueado** permanentemente (`use-screen-nav.tsx`).
- Cada sección es una **pantalla 100vh fija**; solo una visible a la vez.
- Se navega con **flechas pixel-art** (`ScreenNav.tsx`), **rueda del mouse**, **swipe** o **teclado** (flechas, PageUp/Down, Home/End, espacio).
- Las animaciones se **detonan al ENTRAR** a cada pantalla (vía `replayTick`), NO con scroll scrub.

---

## 🧭 Las 7 pantallas (en orden)

Definidas en `src/lib/use-screen-nav.tsx` → `SCREENS`:

| # | id          | label      | Componente      | Notas |
|---|-------------|------------|-----------------|-------|
| 0 | `top`       | Inicio     | `Hero`          | Letras grandes animadas letra por letra. Header oculto aquí. |
| 1 | `proyectos` | Proyectos  | `Projects`      | 4 proyectos con sub-nav propia (flechas laterales). |
| 2 | `servicios` | Servicios  | `Services`      | Mensaje "ya sea que necesites..." + stack. |
| 3 | `marquee`   | Stack      | `Marquee`       | Ticker infinito de tecnologías. |
| 4 | `kinetic`   | Manifiesto | `KineticSection`| `dark: true` — fondo negro, palabras que cambian con flechas. |
| 5 | `sobre-mi`  | Sobre mí   | `AboutSection`  | Scroll interno (contenido largo). |
| 6 | `contacto`  | Contacto   | `FAQ` + `Contact` + `Footer` | Scroll interno. |

**Secciones que se QUITARON** (ya no existen): Blog, Logros/Achievements, Testimonios. El cliente pidió una experiencia más enfocada.

---

## 🎨 Modo oscuro por defecto (decisión del cliente)

- La página **arranca en modo oscuro** (navy `#0e0e10`).
- Sistema en `src/lib/use-theme.ts`: clase `theme-site-dark` en `<html>`, persiste en `localStorage` key `rogelio-portfolio-theme`.
- `themeInitScript` (en `layout.tsx`) aplica dark por defecto salvo preferencia guardada.
- **Dos themes oscuros DISTINTOS** (no mezclar):
  - `html.theme-site-dark` → toggle persistente del usuario (afeta tokens CSS).
  - `body.theme-dark` → flip temporal de KineticSection (solo fondo negro + texto claro).

### Cursor (la "bolita")
- En **modo claro**: dot blanco con borde oscuro (`mix-blend-mode: normal`) — visible sobre lavanda.
- En **modo oscuro**: dot crema con `mix-blend-mode: difference`.
- CSS en `globals.css` (buscar `.cursor-dot`). El JS está en `Cursor.tsx` (no hardcodea colores, los toma del CSS).

---

## 🍔 Los 4 proyectos y sus escenas

Cada proyecto tiene una **escena animada** en `src/components/portfolio/scenes/`. Datos en `src/lib/portfolio-content.ts` → `PROJECTS`.

| Proyecto | keyword | scene | URL real | Qué hace la animación |
|----------|---------|-------|----------|------------------------|
| Carne Viva | `CARNE VIVA` | `BurgerScene` | hamburguesas-five.vercel.app | Hamburguesa SVG que brinca idle y se desarma por capas con el progreso. Click → abre URL. |
| BLOQE | `BLOQUE` | `LegoScene` | vercel.com/.../bloqe | Bloques Lego isométricos **random cada refresh** (4 tipos: castillo, torre, casa, pirámide) que se arman de abajo arriba. |
| Helado Nube | `CREMA` | `IceCreamScene` | helados-coral.vercel.app | **Cortina cremosa** que cae con ondas realistas revelando el texto "HELADO Nube". |
| PRISMA | `PRISMA` | `GlassSceneWebGL` | vercel.com/.../vidrieria | **WebGL real**: panel de vidrio que se fractura en ~280 esquirlas desde un punto de impacto (shaders). |

### Arquitectura de escenas
- `ProjectScenes.tsx` (wrapper) monta las 4 escenas en capas; **solo la activa tiene `display:flex`** (las demás `display:none`) → esto evita el parpadeo de la escena anterior.
- Cada escena recibe `activeRef` y `progressRef` (mutables, tipo `MutableRefObject<number>`). `Projects.tsx` anima `progressRef.current` de 0→1 con GSAP al cambiar de proyecto.
- `scene-shared.ts` tiene utilidades (`lerp`, `sampleCurve`, `makeScrollDriver`, tipo `SceneProps`).
- **Click en cualquier escena** abre `project.liveUrl` en pestaña nueva (`window.open` con `noopener,noreferrer`).

### GlassSceneWebGL — importante
- Usa **Three.js crudo** (raw WebGL, no react-three-fiber). Shaders VERT/FRAG inline.
- Puerta del `buildShardGeometry` (fractura radial procedural) + PRNG `mulberry32`.
- Punto de impacto + seed aleatorios en cada montaje.
- El `useEffect` depende de `onOpen` → este **debe ser estable** (envuelto en `useCallback` en `ProjectScenes.tsx`).

---

## ⚙️ Sistemas clave (dónde está cada cosa)

### Navegación
- **`src/lib/use-screen-nav.tsx`** — el cerebro. `ScreenNavProvider` + hook `useScreenNav()`.
  - Estado: `current`, `direction`, `isTransitioning`, `replayTick`, `activeId`.
  - Métodos: `goTo(index)`, `next()`, `prev()`.
  - Intercepta wheel/touch/teclado. Debounce anti-spam ~850ms (lockRef).
- **`src/components/portfolio/ScreenNav.tsx`** — las flechas ◀ ▶ + indicador `01/07`.
- **`src/app/page.tsx`** — `AppShell` mapea `SCREENS` a `ScreenSlot` (absolutos 100vh, solo la activa `visibility:visible`).

### Sub-navegación de Proyectos
- Dentro de `Projects.tsx`: flechas laterales grandes (`.project-subnav-left/right`) llaman a `goToProject(index)`.
- `activeRef` y `progressRef` son `useRef`, mutados por GSAP.
- Al cambiar de proyecto: `gsap.to(progressRef, { current: 1, duration: 2.2-2.4 })` detona la animación de la escena.

### KineticSection (antes bug "se queda negra")
- **Ya NO usa ScrollTrigger**. El flip a negro es un `useEffect` que hace `document.body.classList.add("theme-dark")` al montar y `.remove()` en cleanup (garantizado).
- Las palabras se cambian con flechas laterales propias (`activeWord` state).

### Animaciones onEnter
- Todas las secciones usan `const { replayTick } = useScreenNav()` como dependencia de su `useEffect` de GSAP. Cuando `replayTick` cambia (al entrar a la pantalla), re-corren la animación.
- **YA NO usar ScrollTrigger** para reveals (el scroll está bloqueado).

### Componentes que ya NO se usan (pero siguen en el repo)
- `use-smooth-scroll.ts` (Lenis) — sin importar en ningún componente activo. Se puede eliminar.
- `use-keyboard-nav.tsx` — idem.
- `ScrollProgress.tsx`, `CommandKHint.tsx`, `PageTransition.tsx`, `Achievements.tsx`, `Testimonials.tsx`, `Manifesto.tsx`, `Newsletter.tsx` — sin usar. Se pueden limpiar.

---

## 📐 Diseño / tokens (`src/app/globals.css`)

Paleta (modo claro, `:root`):
- `--bg-light: #dce2f0` (lavanda)
- `--bg-glow: #f3d8cd` (durazno, glow radial animado via `.bg-glow`)
- `--ink: #0e0e10` (casi negro)
- `--bg-dark: #000000`, `--bg-navy: #16132e`

Modo oscuro (`html.theme-site-dark`): invierte `--bg-light`→`#0e0e10`, `--ink`→`#f4f4f0`.

**Fuentes** (cargadas en `layout.tsx`): Archivo (display, con eje `wdth` para condensado), Space Mono (mono), Inter (body), Caveat (script).

Clases clave: `.display`, `.mono`, `.pill`, `.btn-primary`, `.reveal-mask/.reveal-inner`, `.screen-slot`, `.screen-arrow`, `.project-subnav`, `.click-hint`, `.kinetic-glow`.

---

## ✅ Lo que está HECHO y verificado

1. Navegación por pantallas con flechas/wheel/swipe/teclado.
2. Modo oscuro por defecto + cursor visible en ambos modos.
3. 4 escenas de proyecto (burger, lego random, crema, vidrio WebGL).
4. Click en escenas y botones abre URL real en pestaña nueva.
5. Bug "se queda negra" arreglado (kinetic sin ScrollTrigger).
6. Bug "no se ven las letras" arreglado (hero sin parallax de salida).
7. Blog/Logros/Testimonios eliminados.
8. Build compila sin errores (`npm run dev` → HTTP 200, 76KB).

---

## ⚠️ Cosas que conviene revisar / mejorar

- **Limpieza:** eliminar los componentes/hooks sin uso (lista arriba) para reducir ruido.
- **GlassSceneWebGL:** el `useEffect` re-crea la escena si cambia `onOpen`. Ya está estabilizado con `useCallback` en `ProjectScenes`, pero conviene verificar que no se re-monte al cambiar de proyecto.
- **Reduced motion:** todas las animaciones deberían respetar `usePrefersReducedMotion()`. La mayoría ya lo hace; revisar las escenas SVG.
- **Mobile:** las flechas y swipe funcionan en touch, pero conviene probar en dispositivo real. El `BackToTop` se oculta en touch.
- **FAQ + Contact** están dentro de una pantalla con scroll interno — ver que no se solapen con el footer.
- **Lenis** sigue como dependencia en `package.json` pero ya no se usa; se puede quitar.
- **Storytelling del scroll:** como ya no hay scroll, el mensaje "ya sea que necesites..." vive en Servicios. El cliente podría quererlo en una pantalla dedicada antes de Contacto.

---

## 💬 Preferencias del cliente (Rogelio)

- Quiere **experiencia VIP, refinada y fina**.
- Le gustan los **fondos oscuros** y el efecto de la sección negra.
- **No quiere scroll libre** — navegación guiada por botones.
- Los proyectos reales son: **Hamburguesas, Bloqe, Helados, Vidrieria** (todos en `C:\Users\rogel\Desktop\`).
- El helado anterior (cono) le pareció "horrible" → ahora es cortina cremosa.
- El vidrio SVG no le gustó → ahora es fractura WebGL real de su proyecto.
- Quiso quitar **Blog, premios/logros, testimonios**.
- Le gusta que el **Lego sea random** cada refresh.
- Respondió en español; la UI está en español.

---

## 📂 Archivos nuevos clave (para leer primero)

1. `src/lib/use-screen-nav.tsx` — cerebro de navegación.
2. `src/components/portfolio/ScreenNav.tsx` — flechas.
3. `src/components/portfolio/scenes/GlassSceneWebGL.tsx` — fractura WebGL.
4. `src/components/portfolio/Projects.tsx` — cómo se integran las escenas + sub-nav.
5. `src/app/page.tsx` — composición por pantallas (`AppShell`, `ScreenSlot`).
6. `src/lib/portfolio-content.ts` — datos de los 4 proyectos + `SCREENS`.

---

*Última actualización: estado funcional, build verde (HTTP 200). Sin commit pendiente salvo que el cliente lo pida.*
