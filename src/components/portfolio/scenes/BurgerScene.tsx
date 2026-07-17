"use client";

import { useEffect, useRef } from "react";
import { getAmbient } from "@/lib/ambient-sound";
import { makeScrollDriver, type SceneProps } from "./scene-shared";

/**
 * BurgerScene — la hamburguesa cartoon de Carne Viva.
 * Adaptada del proyecto original (cartoon-burger.tsx) pero con GSAP-free
 * driver de scroll propio para encajar en el sistema del portafolio.
 *
 *  - Tras la intro, brinca con música apagada o separa ingredientes por banda
 *  - Se desarma con scroll: las 6 capas salen volando hacia afuera
 *    (mismas trayectorias escaladas del original)
 *  - Cara feliz → asustada conforme avanza el scroll
 *  - Click en la hamburguesa abre la URL real del proyecto
 */
export default function BurgerScene({
  activeRef,
  progressRef,
  revealCompleteRef,
  onOpen,
}: SceneProps) {
  const rootRef = useRef<SVGSVGElement>(null);
  const topRef = useRef<SVGGElement>(null);
  const lettuceRef = useRef<SVGGElement>(null);
  const tomatoRef = useRef<SVGGElement>(null);
  const cheeseRef = useRef<SVGGElement>(null);
  const pattyRef = useRef<SVGGElement>(null);
  const bottomRef = useRef<SVGGElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const idleRef = useRef<SVGGElement>(null);
  const happyMouthRef = useRef<SVGPathElement>(null);
  const scaredMouthRef = useRef<SVGEllipseElement>(null);
  const scaredBrowRef = useRef<SVGPathElement>(null);
  const armsRef = useRef<SVGGElement>(null);
  const steamRef = useRef<SVGGElement>(null);
  const sparkRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // El progreso visual se desacopla del ref compartido para poder congelar la
    // composición armada cuando el usuario pide movimiento reducido.
    const visualProgress = { current: 0 };

    // Curvas que ARRANCAN en 0 (hamburguesa armada/junta en reposo) y separan
    // las capas hacia afuera conforme el progreso sube a 1 (desarme al click).
    const driver = makeScrollDriver(visualProgress, [
      // Las capas se desprenden de arriba hacia abajo, en orden staggered
      {
        el: () => topRef.current,
        x: [[0, 0], [0.5, -18], [1, -34]],
        y: [[0, 0], [0.5, -260], [1, -560]],
        rotate: [[0, 0], [0.5, -9], [1, -17]],
        fadeOut: [0.82, 1],
      },
      {
        el: () => lettuceRef.current,
        x: [[0, 0], [0.55, 16], [1, 30]],
        y: [[0, 0], [0.55, -210], [1, -450]],
        rotate: [[0, 0], [0.55, 7], [1, 13]],
        fadeOut: [0.84, 1],
      },
      {
        el: () => tomatoRef.current,
        x: [[0, 0], [0.6, -18], [1, -34]],
        y: [[0, 0], [0.6, -150], [1, -330]],
        rotate: [[0, 0], [0.6, -7], [1, -13]],
        fadeOut: [0.86, 1],
      },
      {
        el: () => cheeseRef.current,
        x: [[0, 0], [0.65, 18], [1, 34]],
        y: [[0, 0], [0.65, 70], [1, 150]],
        rotate: [[0, 0], [0.65, 8], [1, 14]],
        fadeOut: [0.88, 1],
      },
      {
        el: () => pattyRef.current,
        x: [[0, 0], [0.7, -14], [1, -24]],
        y: [[0, 0], [0.7, 190], [1, 380]],
        rotate: [[0, 0], [0.7, -5], [1, -9]],
        fadeOut: [0.9, 1],
      },
      {
        el: () => bottomRef.current,
        x: [[0, 0], [0.72, 12], [1, 20]],
        y: [[0, 0], [0.72, 300], [1, 540]],
        rotate: [[0, 0], [0.72, 4], [1, 8]],
        fadeOut: [0.92, 1],
      },
      {
        // Brazos salen volando primero
        el: () => armsRef.current,
        x: [[0, 0], [0.4, 0]],
        fadeOut: [0.3, 0.42],
      },
    ]);

    const ambient = getAmbient();
    const audio = {
      bassHit: 0,
      midFlow: 0,
      trebleSpark: 0,
      energyLift: 0,
    };
    let musicEnabled = ambient?.isEnabled() ?? false;
    const unsubscribeEnabled = ambient?.subscribe((enabled) => {
      musicEnabled = enabled;
    });
    const unsubscribeAudio = ambient?.subscribeAnalysis((bands) => {
      audio.bassHit = bands.bassHit;
      audio.midFlow = bands.midFlow;
      audio.trebleSpark = bands.trebleSpark;
      audio.energyLift = bands.energyLift;
    });

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };
    motionQuery.addEventListener("change", onMotionPreferenceChange);

    type BurgerMode = "intro" | "idle" | "reactive" | "still";
    let mode: BurgerMode = "still";
    let raf = 0;
    let running = false;
    let lastFrameAt = 0;
    let lastActive = -1;
    let lastProgress = -1;
    let lastAudioKey = "";
    const screenSlot = root.closest<HTMLElement>(".screen-slot");
    let screenActive = screenSlot?.dataset.phase !== "exit";

    const setLayerTransform = (
      element: SVGGElement | null,
      x: number,
      y: number,
      rotation: number,
      pivotY: number
    ) => {
      element?.setAttribute(
        "transform",
        `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(2)} 260 ${pivotY})`
      );
    };

    const resetAudioPose = () => {
      [
        topRef.current,
        lettuceRef.current,
        tomatoRef.current,
        cheeseRef.current,
        pattyRef.current,
        bottomRef.current,
        armsRef.current,
      ].forEach((element) => element?.removeAttribute("transform"));
      if (steamRef.current) steamRef.current.style.opacity = "0.5";
      if (sparkRef.current) sparkRef.current.style.opacity = "1";
    };

    const applyAudioPose = () => {
      const bass = audio.bassHit;
      const mid = audio.midFlow;
      const treble = audio.trebleSpark;

      // Cada ingrediente responde a la banda que mejor encaja con su peso:
      // bajos en pan/carne, medios en rellenos y agudos en hojas/pan superior.
      setLayerTransform(bottomRef.current, -bass * 1.8, bass * 3.2, bass * 0.45, 355);
      setLayerTransform(pattyRef.current, bass * 1.4, -bass * 5.8, -bass * 0.8, 292);
      setLayerTransform(cheeseRef.current, mid * 3.2, -mid * 6.4, mid * 1.15, 260);
      setLayerTransform(tomatoRef.current, -mid * 3.8, -mid * 8.1, -mid * 1.25, 225);
      setLayerTransform(lettuceRef.current, treble * 4.8, -treble * 9.6, treble * 1.55, 201);
      setLayerTransform(
        topRef.current,
        -treble * 3.5,
        -(bass * 3.6 + treble * 7.2),
        (treble - bass) * 1.4,
        145
      );
      setLayerTransform(
        armsRef.current,
        (treble - mid) * 2.8,
        -treble * 3.2,
        (mid - treble) * 0.9,
        245
      );
      if (steamRef.current) {
        steamRef.current.style.opacity = (0.34 + audio.energyLift * 0.34).toFixed(3);
      }
      if (sparkRef.current) {
        sparkRef.current.style.opacity = (0.58 + treble * 0.42).toFixed(3);
      }
    };

    const updateCamera = (progress: number) => {
      // Cámara dinámica: conserva la hamburguesa grande al estar armada y abre
      // el encuadre durante el desarme para que ninguna capa quede recortada.
      // El SVG también crece físicamente: así el vuelo ocupa la página en vez
      // de quedar visible dentro de un recuadro central diminuto.
      const cameraT = progress;
      const height = 430 + cameraT * 1050;
      const width = height * (520 / 430);
      const x = 260 - width / 2;
      const y = 215 - height / 2;
      const restingWidth = Math.min(430, window.innerWidth * 0.78);
      const expandedWidth = Math.min(1100, window.innerWidth * 0.94);
      const displayWidth =
        restingWidth + (expandedWidth - restingWidth) * cameraT;
      root.style.maxWidth = `${displayWidth.toFixed(1)}px`;
      root.setAttribute(
        "viewBox",
        `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)}`
      );
    };

    const updateScrollPose = (progress: number, active: number) => {
      visualProgress.current = progress;
      driver.update();

      // Cara: feliz → asustada
      const faceOp = Math.max(0, Math.min(1, (progress - 0.018) / 0.047));
      if (happyMouthRef.current) {
        happyMouthRef.current.style.opacity = (1 - faceOp).toFixed(3);
      }
      if (scaredMouthRef.current) {
        scaredMouthRef.current.style.opacity = faceOp.toFixed(3);
      }
      if (scaredBrowRef.current) {
        scaredBrowRef.current.style.opacity = faceOp.toFixed(3);
      }

      if (faceRef.current) {
        faceRef.current.style.transform = `rotate(${(progress * 8).toFixed(2)}deg)`;
        faceRef.current.style.transformOrigin = "260px 215px";
      }
      updateCamera(progress);
      lastActive = active;
      lastProgress = Math.round(progress * 1000) / 1000;
    };

    const animate = (timestamp: number) => {
      if (!running) return;
      raf = requestAnimationFrame(animate);
      if (timestamp - lastFrameAt < 1000 / 30) {
        return;
      }
      lastFrameAt = timestamp;

      const rawProgress = progressRef.current;
      const p = reducedMotion ? 0 : rawProgress;
      const active = activeRef.current;
      const quantizedProgress = Math.round(p * 1000) / 1000;

      const introComplete =
        active === 0 && revealCompleteRef.current && p <= 0.01;
      const musicReactive =
        introComplete &&
        !reducedMotion &&
        musicEnabled &&
        document.documentElement.dataset.musicReactive === "true";
      const nextMode: BurgerMode = !introComplete
        ? "intro"
        : reducedMotion || musicEnabled
          ? musicReactive
            ? "reactive"
            : "still"
          : "idle";

      // Al salir del modo musical se limpia primero su pose; si la intro vuelve
      // a arrancar, el driver de progreso escribe enseguida la pose correcta.
      if (mode === "reactive" && nextMode !== "reactive") {
        resetAudioPose();
        lastAudioKey = "";
      }

      if (active !== lastActive || quantizedProgress !== lastProgress) {
        updateScrollPose(p, active);
      }

      if (nextMode !== mode) {
        idleRef.current?.classList.toggle("is-bouncing", nextMode === "idle");
        mode = nextMode;
      }
      if (mode === "reactive") {
        // El analizador puede conservar una muestra durante más de un tick.
        // Evitamos reescribir nueve propiedades SVG si las bandas no cambiaron.
        const audioKey = [
          audio.bassHit,
          audio.midFlow,
          audio.trebleSpark,
          audio.energyLift,
        ]
          .map((value) => Math.round(value * 100))
          .join(":");
        if (audioKey !== lastAudioKey) {
          applyAudioPose();
          lastAudioKey = audioKey;
        }
      }
    };

    const stop = () => {
      if (!running) return;
      cancelAnimationFrame(raf);
      running = false;
    };
    const start = () => {
      if (running || document.hidden || !screenActive) return;
      running = true;
      lastFrameAt = 0;
      raf = requestAnimationFrame(animate);
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    const phaseObserver = screenSlot
      ? new MutationObserver(() => {
          screenActive = screenSlot.dataset.phase !== "exit";
          if (screenActive) start();
          else stop();
        })
      : null;

    phaseObserver?.observe(screenSlot!, {
      attributes: true,
      attributeFilter: ["data-phase"],
    });
    document.addEventListener("visibilitychange", onVisibilityChange);
    start();

    return () => {
      stop();
      phaseObserver?.disconnect();
      unsubscribeEnabled?.();
      unsubscribeAudio?.();
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      idleRef.current?.classList.remove("is-bouncing");
      resetAudioPose();
    };
  }, [activeRef, progressRef, revealCompleteRef]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 520 430"
      className="scene-svg burger-scene h-auto w-full cursor-pointer"
      aria-label="Hamburguesa de Carne Viva — abrir el sitio"
      onClick={onOpen}
      style={{ maxWidth: "min(78vw, 430px)", outline: "none" }}
    >
      {/* Capa clickable invisible para todo el cuerpo */}
      <rect
        x="60"
        y="40"
        width="400"
        height="370"
        fill="transparent"
        aria-hidden="true"
      />

      <g ref={idleRef} className="burger-idle">
        {/* Vapor */}
        <g
          ref={steamRef}
          className="burger-steam"
          fill="none"
          stroke="#fff4d9"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.5"
        >
          <path d="M170 44 C148 24 182 13 163 -9" />
          <path d="M260 29 C238 8 272 -3 253 -25" />
          <path d="M350 44 C328 24 362 13 343 -9" />
        </g>

        {/* Brazos */}
        <g ref={armsRef} className="burger-arms">
          <g className="burger-arm burger-arm-left">
            <path
              d="M112 256 C70 244 52 217 38 190"
              fill="none"
              stroke="#1b1b1b"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M39 190 C20 177 19 154 36 145 C49 138 59 149 56 161 C65 148 81 153 80 168 C78 183 61 194 39 190Z"
              fill="#fff"
              stroke="#1b1b1b"
              strokeWidth="9"
              strokeLinejoin="round"
            />
          </g>
          <g className="burger-arm burger-arm-right">
            <path
              d="M408 256 C449 244 468 217 482 190"
              fill="none"
              stroke="#1b1b1b"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M481 190 C500 177 501 154 484 145 C471 138 461 149 464 161 C455 148 439 153 440 168 C442 183 459 194 481 190Z"
              fill="#fff"
              stroke="#1b1b1b"
              strokeWidth="9"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* Pan inferior */}
        <g ref={bottomRef} className="burger-layer burger-layer-bottom">
          <path
            d="M102 326 C128 310 181 305 260 306 C339 305 392 310 418 326 C414 364 385 391 349 400 C300 411 220 411 171 400 C135 391 106 364 102 326Z"
            fill="#e8a84a"
            stroke="#1b1b1b"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          <path
            d="M119 329 C158 318 211 316 260 317 C309 316 362 318 401 329 C390 345 343 351 260 351 C177 351 130 345 119 329Z"
            fill="#ffe09a"
            stroke="#1b1b1b"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M125 355 C173 378 347 378 395 355"
            fill="none"
            stroke="#f7c868"
            strokeWidth="13"
            strokeLinecap="round"
            opacity=".95"
          />
          <path
            d="M133 379 C181 397 339 397 387 379"
            fill="none"
            stroke="#bd6c2e"
            strokeWidth="11"
            strokeLinecap="round"
            opacity=".8"
          />
          <g fill="#cd7a31" opacity=".6">
            <ellipse cx="170" cy="365" rx="7" ry="3" />
            <ellipse cx="221" cy="372" rx="5" ry="2.5" />
            <ellipse cx="310" cy="372" rx="5" ry="2.5" />
            <ellipse cx="355" cy="365" rx="7" ry="3" />
          </g>
        </g>

        {/* Carne */}
        <g ref={pattyRef} className="burger-layer burger-layer-patty">
          <path
            d="M90 285 C99 258 126 249 161 252 C212 242 309 242 360 252 C395 249 422 258 430 285 C438 312 405 331 371 328 C318 338 202 338 149 328 C115 331 82 312 90 285Z"
            fill="#5a2e1b"
            stroke="#1b1b1b"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          <path
            d="M145 284 L190 272 M238 290 L282 276 M328 286 L373 274"
            stroke="#8e4a28"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>

        {/* Queso */}
        <g ref={cheeseRef} className="burger-layer burger-layer-cheese">
          <path
            d="M104 250 L162 228 L260 237 L358 228 L416 250 L385 282 L346 271 L329 300 L294 270 L251 289 L215 269 L180 294 L159 269 L126 280Z"
            fill="#ffd750"
            stroke="#1b1b1b"
            strokeWidth="9"
            strokeLinejoin="round"
          />
        </g>

        {/* Tomate */}
        <g ref={tomatoRef} className="burger-layer burger-layer-tomato">
          <path
            d="M104 225 C121 200 166 195 207 202 C239 194 281 194 313 202 C354 195 399 200 416 225 C403 247 363 252 323 245 C285 253 235 253 197 245 C157 252 117 247 104 225Z"
            fill="#f91814"
            stroke="#1b1b1b"
            strokeWidth="9"
            strokeLinejoin="round"
          />
          <path
            d="M159 222 C193 210 327 210 361 222"
            fill="none"
            stroke="#ff6860"
            strokeWidth="8"
            strokeLinecap="round"
            opacity=".72"
          />
        </g>

        {/* Lechuga */}
        <g ref={lettuceRef} className="burger-layer burger-layer-lettuce">
          <path
            d="M89 204 L115 180 L150 188 L177 170 L213 184 L250 164 L286 184 L322 168 L353 188 L389 178 L431 204 L405 224 L367 216 L335 232 L296 217 L258 234 L220 217 L181 231 L148 215 L111 224Z"
            fill="#72aa35"
            stroke="#1b1b1b"
            strokeWidth="9"
            strokeLinejoin="round"
          />
          <path
            d="M129 200 C190 181 330 181 391 200"
            fill="none"
            stroke="#a9d75a"
            strokeWidth="8"
            strokeLinecap="round"
            opacity=".75"
          />
        </g>

        {/* Pan superior + cara */}
        <g ref={topRef} className="burger-layer burger-layer-top">
          <path
            d="M103 178 C109 98 167 49 260 49 C353 49 411 98 417 178 C375 198 145 198 103 178Z"
            fill="#f0b85a"
            stroke="#1b1b1b"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          <path
            d="M131 150 C158 82 226 66 260 66 C294 66 362 82 389 150"
            fill="none"
            stroke="#ffd879"
            strokeWidth="17"
            strokeLinecap="round"
            opacity=".66"
          />
          {/* Semillas de ajonjolí */}
          <g fill="#fff0be" stroke="#1b1b1b" strokeWidth="3">
            <ellipse cx="180" cy="102" rx="10" ry="4" transform="rotate(-24 180 102)" />
            <ellipse cx="231" cy="84" rx="10" ry="4" transform="rotate(12 231 84)" />
            <ellipse cx="286" cy="91" rx="10" ry="4" transform="rotate(-8 286 91)" />
            <ellipse cx="339" cy="111" rx="10" ry="4" transform="rotate(23 339 111)" />
            <ellipse cx="260" cy="126" rx="10" ry="4" transform="rotate(-18 260 126)" />
          </g>

          {/* Cara */}
          <g ref={faceRef} className="burger-face">
            <path
              ref={scaredBrowRef}
              className="burger-scared-brow"
              d="M197 116 L231 124 M289 124 L323 116"
              fill="none"
              stroke="#1b1b1b"
              strokeWidth="8"
              strokeLinecap="round"
              style={{ opacity: 0 }}
            />
            <ellipse cx="221" cy="147" rx="21" ry="27" fill="#fff" stroke="#1b1b1b" strokeWidth="8" />
            <ellipse cx="299" cy="147" rx="21" ry="27" fill="#fff" stroke="#1b1b1b" strokeWidth="8" />
            <circle className="burger-pupil" cx="228" cy="153" r="8" fill="#1b1b1b" />
            <circle className="burger-pupil" cx="306" cy="153" r="8" fill="#1b1b1b" />
            <path
              ref={happyMouthRef}
              className="burger-happy-mouth"
              d="M229 178 C245 197 277 197 293 178"
              fill="none"
              stroke="#1b1b1b"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <ellipse
              ref={scaredMouthRef}
              className="burger-scared-mouth"
              cx="260"
              cy="187"
              rx="15"
              ry="21"
              fill="#4c0016"
              stroke="#1b1b1b"
              strokeWidth="8"
              style={{ opacity: 0 }}
            />
          </g>
        </g>

        {/* Chispas cómic */}
        <g
          ref={sparkRef}
          className="burger-spark"
          fill="#ffd750"
          stroke="#1b1b1b"
          strokeWidth="6"
          strokeLinejoin="round"
        >
          <path d="M61 77 L69 97 L89 104 L69 111 L61 132 L53 111 L33 104 L53 97Z" />
          <path d="M452 80 L458 95 L474 101 L458 107 L452 123 L446 107 L430 101 L446 95Z" />
        </g>
      </g>
    </svg>
  );
}
