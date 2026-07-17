"use client";

import { useEffect, useRef } from "react";
import { makeScrollDriver, type SceneProps } from "./scene-shared";

/**
 * BurgerScene — la hamburguesa cartoon de Carne Viva.
 * Adaptada del proyecto original (cartoon-burger.tsx) pero con GSAP-free
 * driver de scroll propio para encajar en el sistema del portafolio.
 *
 *  - Brinca idle cuando está activa (CSS keyframe .burger-idle-bounce)
 *  - Se desarma con scroll: las 6 capas salen volando hacia afuera
 *    (mismas trayectorias escaladas del original)
 *  - Cara feliz → asustada conforme avanza el scroll
 *  - Click en la hamburguesa abre la URL real del proyecto
 */
export default function BurgerScene({
  activeRef,
  progressRef,
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

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Curvas que ARRANCAN en 0 (hamburguesa armada/junta en reposo) y separan
    // las capas hacia afuera conforme el progreso sube a 1 (desarme al click).
    const driver = makeScrollDriver(progressRef, [
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

    let raf = 0;
    let lastActive = -1;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = progressRef.current;
      const active = activeRef.current;

      // Arrancar/detener el driver de capas según si está activo
      if (active === 0 && p < 0.05) {
        driver.start();
      }

      // Idle bounce: solo cuando activo y al inicio del scroll
      const idleEl = idleRef.current;
      if (idleEl) {
        if (active === 0 && p < 0.04) {
          idleEl.classList.add("is-bouncing");
        } else {
          idleEl.classList.remove("is-bouncing");
        }
      }

      // Cara: feliz → asustada
      const happy = happyMouthRef.current;
      const scared = scaredMouthRef.current;
      const brow = scaredBrowRef.current;
      const faceOp = Math.max(0, Math.min(1, (p - 0.018) / 0.047));
      if (happy) happy.style.opacity = (1 - faceOp).toFixed(3);
      if (scared) scared.style.opacity = faceOp.toFixed(3);
      if (brow) brow.style.opacity = faceOp.toFixed(3);

      // Rotación leve de toda la hamburguesa con el progreso (continuidad)
      if (faceRef.current) {
        const rot = p * 8; // hasta 8deg
        faceRef.current.style.transform = `rotate(${rot.toFixed(2)}deg)`;
        faceRef.current.style.transformOrigin = "260px 215px";
      }

      lastActive = active;
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      driver.stop();
    };
  }, [activeRef, progressRef]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 520 430"
      className="scene-svg burger-scene h-auto w-full cursor-pointer"
      aria-label="Hamburguesa de Carne Viva — abrir el sitio"
      onClick={onOpen}
      style={{ maxWidth: "min(70vw, 360px)", outline: "none" }}
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
