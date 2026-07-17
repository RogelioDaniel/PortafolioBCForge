"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SceneProps } from "./scene-shared";

const DESKTOP_FPS = 28;
const TOUCH_FPS = 24;
const DESKTOP_DPR = 1.2;
const PAPER_WIDTH = 1.12;
const PAPER_HEIGHT = 1.56;
const ENTRY_END = 0.12;
const CRUMPLE_END = 0.46;
const HOLD_END = 0.58;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (start: number, end: number, value: number) => {
  const t = clamp01((value - start) / Math.max(0.0001, end - start));
  return t * t * (3 - 2 * t);
};

const easeInOutCubic = (value: number) =>
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

function pseudoRandom(x: number, y: number, seed: number) {
  const value =
    Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return value - Math.floor(value);
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawCoffeeBean(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rotation: number,
  color: string
) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(scale, scale);
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(0, 0, 30, 46, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(255,248,222,.72)";
  context.lineWidth = 4;
  context.beginPath();
  context.bezierCurveTo(-8, -35, 12, -12, -7, 35);
  context.stroke();
  context.restore();
}

/** Hoja interior: la comanda que se arruga sin mover el cartel trasero. */
function createMenuCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 780;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const ink = "#1d2059";
  const cream = "#fff4cf";
  const yellow = "#f2c84b";
  const clay = "#9a4933";

  context.clearRect(0, 0, canvas.width, canvas.height);
  roundedRect(context, 8, 8, canvas.width - 16, canvas.height - 16, 28);
  context.fillStyle = cream;
  context.fill();

  context.fillStyle = clay;
  context.font = "900 58px Arial, sans-serif";
  context.letterSpacing = "-2px";
  context.fillText("RITUAL", 56, 118);
  context.fillStyle = ink;
  context.fillText("TONALLI", 56, 176);

  context.fillStyle = yellow;
  context.fillRect(56, 208, 448, 8);
  context.fillStyle = ink;
  context.font = "700 20px Arial, sans-serif";
  context.letterSpacing = "3px";
  context.fillText("LA COMANDA DE LA CASA", 56, 262);

  const rows = [
    ["ESPRESSO SOL", "INTENSO · CACAO"],
    ["TONALLI LATTE", "MIEL · CANELA"],
    ["CAFÉ DE OLLA", "PILONCILLO · ANÍS"],
    ["COLD BREW", "CÍTRICOS · CACAO"],
  ];

  rows.forEach(([name, note], index) => {
    const y = 340 + index * 88;
    context.fillStyle = ink;
    context.font = "800 25px Arial, sans-serif";
    context.letterSpacing = "1px";
    context.fillText(name, 56, y);
    context.fillStyle = clay;
    context.font = "700 15px Arial, sans-serif";
    context.letterSpacing = "2px";
    context.fillText(note, 56, y + 27);
    context.fillStyle = index % 2 === 0 ? yellow : clay;
    context.beginPath();
    context.arc(482, y - 9, 12, 0, Math.PI * 2);
    context.fill();
  });

  drawCoffeeBean(context, 92, 698, 0.56, -0.32, clay);
  drawCoffeeBean(context, 152, 694, 0.43, 0.45, ink);
  context.fillStyle = ink;
  context.font = "700 16px Arial, sans-serif";
  context.letterSpacing = "3px";
  context.fillText("HECHO CON TIEMPO", 252, 692);
  context.fillText("SERVIDO CON SOL", 252, 720);
  return canvas;
}

function createTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uCrumple;
  uniform float uTime;

  attribute vec3 aCrumpled;
  attribute vec3 aFolded;
  attribute float aDelay;
  attribute float aCrease;

  varying vec2 vUv;
  varying float vCrease;
  varying float vDepth;
  varying float vCrumple;

  float easeInOut(float value) {
    return value < 0.5
      ? 4.0 * value * value * value
      : 1.0 - pow(-2.0 * value + 2.0, 3.0) * 0.5;
  }

  void main() {
    vUv = uv;
    float delayed = clamp(
      (uCrumple - aDelay * 0.16) / max(0.001, 1.0 - aDelay * 0.16),
      0.0,
      1.0
    );
    float wrinkle = smoothstep(0.015, 0.30, delayed);
    float wrinkleHold = 1.0 - smoothstep(0.74, 1.0, delayed);
    float fold = easeInOut(smoothstep(0.26, 0.78, delayed));
    float ball = easeInOut(smoothstep(0.70, 1.0, delayed));
    float edge = max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0;

    vec2 directionA = normalize(vec2(0.82, 0.57));
    vec2 directionB = normalize(vec2(-0.46, 0.89));
    float waveA = sin(dot(position.xy, directionA) * 20.0 + aCrease * 5.4);
    float waveB = sin(dot(position.xy, directionB) * 28.0 - aCrease * 4.1);
    float ridgeA = sign(waveA) * pow(abs(waveA), 7.0);
    float ridgeB = sign(waveB) * pow(abs(waveB), 9.0);

    vec3 wrinkled = position;
    wrinkled.z += wrinkle * wrinkleHold * (
      ridgeA * 0.075 + ridgeB * 0.044 + edge * edge * 0.035
    );
    wrinkled.xy += wrinkle * wrinkleHold * (
      directionA * ridgeA * 0.014 + directionB * ridgeB * 0.010
    );

    vec3 folded = mix(wrinkled, aFolded, fold);
    folded.z += wrinkle * (1.0 - ball) * (ridgeA * 0.034 + ridgeB * 0.024);
    vec3 deformed = mix(folded, aCrumpled, ball);
    deformed.z += sin(uTime * 2.2 + aCrease * 12.0) * ball * 0.0035;

    vCrease = clamp(
      abs(ridgeA) * 0.62 + abs(ridgeB) * 0.46 + fold * 0.12,
      0.0,
      1.0
    );
    vDepth = deformed.z;
    vCrumple = delayed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(deformed, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uPaperMap;

  varying vec2 vUv;
  varying float vCrease;
  varying float vDepth;
  varying float vCrumple;

  void main() {
    vec4 paper = texture2D(uPaperMap, vUv);

    float deformation = smoothstep(0.02, 0.64, vCrumple);
    float creaseShadow = smoothstep(0.54, 1.0, vCrease) * deformation;
    float ridgeLight = smoothstep(0.08, 0.38, vDepth) * deformation;
    float shade = 1.0 - creaseShadow * 0.24 + ridgeLight * 0.15;
    vec3 color = paper.rgb * shade;
    color += vec3(1.0, 0.91, 0.67) * ridgeLight * 0.055;

    if (!gl_FrontFacing) {
      vec3 paperBack = vec3(1.0, 0.957, 0.79) * (0.77 + ridgeLight * 0.18);
      color = mix(paperBack, color, 0.12);
    }

    gl_FragColor = vec4(color, paper.a);
    #include <colorspace_fragment>
  }
`;

function readPaperPose(progress: number, reducedMotion: boolean) {
  const p = clamp01(progress);

  if (reducedMotion) {
    return {
      crumple: 0,
      entry: 1,
    };
  }

  const entry = easeInOutCubic(clamp01(p / ENTRY_END));
  if (p <= ENTRY_END) return { crumple: 0, entry };

  if (p <= CRUMPLE_END) {
    return {
      crumple: easeInOutCubic(
        (p - ENTRY_END) / (CRUMPLE_END - ENTRY_END)
      ),
      entry,
    };
  }
  if (p < HOLD_END) {
    return { crumple: 1, entry };
  }

  return {
    crumple: 1 - easeInOutCubic((p - HOLD_END) / (1 - HOLD_END)),
    entry,
  };
}

/**
 * Café Tonalli: el cartel editorial permanece fijo y sólo su comanda interior
 * se arruga, sostiene la bola y vuelve a desplegarse. Una malla, una textura y
 * un draw call; no captura el DOM del proyecto externo.
 */
export default function CafePaperScene({
  activeRef,
  progressRef,
  revealCompleteRef,
  onOpen,
}: SceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const fallbackPaper = mount.querySelector<HTMLElement>(
      "[data-cafe-menu-fallback]"
    );

    const initialRect = mount.getBoundingClientRect();
    const sceneIndex = activeRef.current;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const compactViewport = initialRect.width <= 820;
    const constrainedDevice = coarsePointer || compactViewport;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let reducedMotion = reducedMotionQuery.matches;
    const targetFps = constrainedDevice ? TOUCH_FPS : DESKTOP_FPS;
    const frameInterval = 1000 / targetFps;
    let width = Math.max(1, Math.round(initialRect.width || mount.clientWidth));
    let height = Math.max(1, Math.round(initialRect.height || mount.clientHeight));
    let visible =
      initialRect.width > 0 &&
      initialRect.height > 0 &&
      initialRect.bottom > 0 &&
      initialRect.top < window.innerHeight;
    const screenSlot = mount.closest<HTMLElement>(".screen-slot");
    let screenActive = !screenSlot || screenSlot.dataset.phase !== "exit";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 8);
    camera.position.z = 3;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !constrainedDevice,
        powerPreference: "high-performance",
      });
    } catch {
      // El póster HTML permanece visible y funcional como fallback.
      return;
    }

    const dpr = () =>
      Math.min(
        window.devicePixelRatio || 1,
        constrainedDevice ? 1 : DESKTOP_DPR
      );
    let currentDpr = dpr();
    renderer.setPixelRatio(currentDpr);
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.dataset.ready = "false";
    renderer.domElement.setAttribute("aria-hidden", "true");
    Object.assign(renderer.domElement.style, {
      display: "block",
      height: "100%",
      inset: "0",
      opacity: "0",
      pointerEvents: "none",
      position: "absolute",
      transition: "opacity 280ms cubic-bezier(.22,1,.36,1)",
      width: "100%",
    });

    const segmentsX = constrainedDevice ? 22 : 34;
    const segmentsY = constrainedDevice ? 30 : 46;
    const geometry = new THREE.PlaneGeometry(
      PAPER_WIDTH,
      PAPER_HEIGHT,
      segmentsX,
      segmentsY
    );
    const positions = geometry.getAttribute("position");
    const uvs = geometry.getAttribute("uv");
    const count = positions.count;
    const crumpled = new Float32Array(count * 3);
    const folded = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    const creases = new Float32Array(count);
    const seed = 5.871;
    const ballRadius = constrainedDevice ? 0.205 : 0.22;

    for (let index = 0; index < count; index += 1) {
      const u = uvs.getX(index);
      const v = uvs.getY(index);
      const nx = u * 2 - 1;
      const ny = v * 2 - 1;
      const random = pseudoRandom(u * 17, v * 19, seed);
      const smoothNoise =
        Math.sin(u * 18.7 + v * 9.2 + seed) * 0.5 +
        Math.sin(u * 7.1 - v * 15.3 + seed * 0.7) * 0.5;
      const creaseField = clamp01(
        0.5 +
          Math.sin(u * Math.PI * 4.2 + seed) * 0.25 +
          Math.sin(v * Math.PI * 3.4 - seed * 0.7) * 0.25
      );
      const triangleX =
        (2 / Math.PI) *
        Math.asin(Math.sin((u - 0.5) * Math.PI * 3.4 + seed * 0.11));
      const triangleY =
        (2 / Math.PI) *
        Math.asin(Math.sin((v - 0.5) * Math.PI * 2.6 - seed * 0.07));
      const foldedX =
        triangleX * PAPER_WIDTH * 0.35 +
        Math.sin(v * Math.PI * 3 + seed) * 0.032;
      const foldedY =
        triangleY * PAPER_HEIGHT * 0.34 +
        Math.sin(u * Math.PI * 2 - seed) * 0.026;
      const foldedZ =
        Math.cos((u - 0.5) * Math.PI * 3.4) * 0.14 +
        Math.cos((v - 0.5) * Math.PI * 2.6) * 0.105 +
        smoothNoise * 0.024;

      folded[index * 3] = foldedX;
      folded[index * 3 + 1] = foldedY;
      folded[index * 3 + 2] = foldedZ;

      const radial = Math.min(1, Math.hypot(nx, ny) / Math.SQRT2);
      const angle = Math.atan2(foldedY, foldedX) + smoothNoise * 0.2;
      const polar = Math.pow(radial, 0.76) * Math.PI * 0.96;
      const lobes =
        Math.sin(angle * 3 + seed) * 0.095 +
        Math.sin(angle * 7 - seed) * 0.045;
      const radius =
        ballRadius *
        (0.9 + lobes + smoothNoise * 0.055 + (random - 0.5) * 0.024);
      const ring = Math.sin(polar);

      crumpled[index * 3] =
        Math.cos(angle) * ring * radius * 1.08 + foldedX * 0.035;
      crumpled[index * 3 + 1] =
        Math.sin(angle) * ring * radius * 0.9 + foldedY * 0.035;
      crumpled[index * 3 + 2] =
        Math.cos(polar) * radius + smoothNoise * 0.012;

      const distanceFromCenter = Math.min(
        1,
        Math.hypot(nx, ny) / Math.SQRT2
      );
      delays[index] = Math.max(
        0,
        (1 - distanceFromCenter) * 0.04 +
          Math.max(0, creaseField - 0.5) * 0.018
      );
      creases[index] = creaseField;
    }

    geometry.setAttribute(
      "aCrumpled",
      new THREE.BufferAttribute(crumpled, 3)
    );
    geometry.setAttribute("aFolded", new THREE.BufferAttribute(folded, 3));
    geometry.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));
    geometry.setAttribute("aCrease", new THREE.BufferAttribute(creases, 1));

    const menuTexture = createTexture(createMenuCanvas());
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPaperMap: { value: menuTexture },
        uCrumple: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });
    const paper = new THREE.Mesh(geometry, material);
    paper.frustumCulled = false;
    scene.add(paper);

    const resizePaper = () => {
      const aspect = width / height;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
      const scale = Math.min(
        1.76 / PAPER_HEIGHT,
        (aspect * 2 * 0.9) / PAPER_WIDTH
      );
      paper.scale.setScalar(Math.max(0.48, scale));
      paper.position.y = 0;
    };
    resizePaper();

    mount.appendChild(renderer.domElement);

    let lastFrameAt = -Infinity;
    let lastSignature = "";
    let lastPoseSignature = "";
    let loopRunning = false;
    let idleTimer = 0;
    let resizeFrame = 0;
    let readyFrame = 0;

    const canRender = () =>
      visible &&
      screenActive &&
      !document.hidden &&
      activeRef.current === sceneIndex;

    const poseSignature = () => {
      const pose = readPaperPose(progressRef.current, reducedMotion);
      return `${Math.round(pose.crumple * 360)}|${Math.round(
        pose.entry * 180
      )}|${reducedMotion ? 1 : 0}`;
    };

    const stopLoop = () => {
      if (!loopRunning) return;
      renderer.setAnimationLoop(null);
      loopRunning = false;
    };

    const scheduleIdlePoll = () => {
      if (idleTimer || !canRender()) return;
      idleTimer = window.setTimeout(() => {
        idleTimer = 0;
        if (!canRender()) return;
        if (poseSignature() !== lastPoseSignature) {
          startLoop();
        } else {
          scheduleIdlePoll();
        }
      }, 150);
    };

    const renderFrame = (timestamp: number, force = false) => {
      if (!canRender()) {
        stopLoop();
        return;
      }
      if (!force && timestamp - lastFrameAt < frameInterval) return;
      lastFrameAt = timestamp;

      const pose = readPaperPose(progressRef.current, reducedMotion);
      const crumple = Math.round(pose.crumple * 360) / 360;
      const entry = Math.round(pose.entry * 180) / 180;
      const isMovingPaper = !reducedMotion && crumple > 0.002;
      const timeBucket = isMovingPaper
        ? Math.floor(timestamp / frameInterval)
        : 0;
      const signature = `${crumple}|${entry}|${timeBucket}`;
      lastPoseSignature = poseSignature();

      if (force || signature !== lastSignature) {
        lastSignature = signature;
        material.uniforms.uCrumple.value = crumple;
        material.uniforms.uTime.value = timeBucket / targetFps;
        const entranceScale = 0.93 + entry * 0.07;
        const baseScale = Math.min(
          1.76 / PAPER_HEIGHT,
          ((width / height) * 2 * 0.9) / PAPER_WIDTH
        );
        paper.scale.setScalar(Math.max(0.48, baseScale) * entranceScale);
        paper.position.y = (1 - entry) * -0.055;
        paper.rotation.z = (1 - entry) * -0.018;
        renderer.render(scene, camera);
      }

      const flat = crumple <= 0.002;
      if (flat && revealCompleteRef.current) {
        stopLoop();
        scheduleIdlePoll();
      }
    };

    const animate = (timestamp: number) => renderFrame(timestamp);

    function startLoop() {
      if (loopRunning || !canRender()) return;
      if (idleTimer) {
        window.clearTimeout(idleTimer);
        idleTimer = 0;
      }
      loopRunning = true;
      lastFrameAt = -Infinity;
      lastSignature = "";
      renderer.setAnimationLoop(animate);
    }

    const syncLoop = () => {
      if (canRender()) startLoop();
      else {
        stopLoop();
        if (idleTimer) {
          window.clearTimeout(idleTimer);
          idleTimer = 0;
        }
      }
    };

    const wakeFromInteraction = () => {
      if (canRender()) startLoop();
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncLoop();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(mount);

    const phaseObserver = screenSlot
      ? new MutationObserver(() => {
          screenActive = screenSlot.dataset.phase !== "exit";
          syncLoop();
        })
      : null;
    phaseObserver?.observe(screenSlot!, {
      attributes: true,
      attributeFilter: ["data-phase"],
    });

    const onVisibilityChange = () => syncLoop();
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      lastSignature = "";
      startLoop();
      if (canRender()) renderFrame(performance.now(), true);
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    window.addEventListener("pointerdown", wakeFromInteraction, true);
    window.addEventListener("wheel", wakeFromInteraction, { passive: true });
    window.addEventListener("touchstart", wakeFromInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", wakeFromInteraction);

    const applyResize = () => {
      resizeFrame = 0;
      const rect = mount.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width || mount.clientWidth));
      const nextHeight = Math.max(
        1,
        Math.round(rect.height || mount.clientHeight)
      );
      const nextDpr = dpr();
      if (
        width === nextWidth &&
        height === nextHeight &&
        currentDpr === nextDpr
      ) {
        return;
      }
      width = nextWidth;
      height = nextHeight;
      currentDpr = nextDpr;
      renderer.setPixelRatio(currentDpr);
      renderer.setSize(width, height, false);
      resizePaper();
      lastSignature = "";
      if (canRender()) renderFrame(performance.now(), true);
    };

    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(applyResize);
    });
    resizeObserver.observe(mount);

    try {
      renderer.compile(scene, camera);
      renderFrame(performance.now(), true);
      readyFrame = window.requestAnimationFrame(() => {
        renderer.domElement.dataset.ready = "true";
        renderer.domElement.style.opacity = "1";
        if (fallbackPaper) fallbackPaper.style.opacity = "0";
      });
      syncLoop();
    } catch {
      // Un fallo tardío de shader conserva visible la comanda HTML.
      renderer.domElement.style.opacity = "0";
      renderer.domElement.dataset.ready = "false";
      if (fallbackPaper) fallbackPaper.style.opacity = "1";
    }

    return () => {
      renderer.setAnimationLoop(null);
      loopRunning = false;
      if (idleTimer) window.clearTimeout(idleTimer);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      if (readyFrame) window.cancelAnimationFrame(readyFrame);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      window.removeEventListener("pointerdown", wakeFromInteraction, true);
      window.removeEventListener("wheel", wakeFromInteraction);
      window.removeEventListener("touchstart", wakeFromInteraction);
      window.removeEventListener("keydown", wakeFromInteraction);
      intersectionObserver.disconnect();
      phaseObserver?.disconnect();
      resizeObserver.disconnect();
      scene.remove(paper);
      geometry.dispose();
      material.dispose();
      menuTexture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (fallbackPaper) fallbackPaper.style.opacity = "1";
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [activeRef, onOpen, progressRef, revealCompleteRef]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className="absolute inset-0 z-[2] flex cursor-pointer items-center justify-center"
      onClick={onOpen}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Abrir proyecto Café Tonalli"
    >
      <div
        aria-hidden="true"
        className="relative overflow-hidden rounded-[3px]"
        style={{
          aspectRatio: "5 / 7",
          background: "#1d2059",
          boxShadow:
            "0 28px 65px rgba(0,0,0,.34), 0 0 0 1px rgba(255,244,207,.18)",
          width: "min(72vw, 490px)",
        }}
      >
        <div
          style={{
            color: "#fff4cf",
            fontFamily: "Arial, sans-serif",
            fontSize: "clamp(1rem, 2.2vw, 1.7rem)",
            fontWeight: 800,
            letterSpacing: ".18em",
            left: "8%",
            position: "absolute",
            top: "5.5%",
            zIndex: 1,
          }}
        >
          CAFÉ TONALLI
        </div>
        <div
          aria-hidden="true"
          style={{
            background: "#fff4cf",
            bottom: "13%",
            left: 0,
            position: "absolute",
            right: 0,
            top: "16%",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            background: "#f2c84b",
            bottom: "9%",
            left: "9%",
            position: "absolute",
            top: "12%",
            width: "5.8%",
            zIndex: 2,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            background: "#f2c84b",
            bottom: "9%",
            position: "absolute",
            right: "9%",
            top: "12%",
            width: "5.8%",
            zIndex: 2,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            background: "#9a4933",
            bottom: 0,
            left: 0,
            position: "absolute",
            right: 0,
            top: "86%",
          }}
        />
        <div
          style={{
            bottom: "4.4%",
            color: "#fff4cf",
            fontFamily: "Arial, sans-serif",
            fontSize: "clamp(.55rem, 1.4vw, .9rem)",
            fontWeight: 800,
            left: "8%",
            letterSpacing: ".2em",
            position: "absolute",
            zIndex: 4,
          }}
        >
          MÉXICO EN CADA TAZA
        </div>

        <div
          ref={mountRef}
          className="absolute"
          style={{
            bottom: "10%",
            left: "14%",
            right: "14%",
            top: "14%",
            zIndex: 3,
          }}
        >
          <div
            data-cafe-menu-fallback
            className="absolute inset-0 overflow-hidden rounded-[clamp(10px,2.2vw,22px)]"
            style={{
              background: "#fff4cf",
              color: "#1d2059",
              fontFamily: "Arial, sans-serif",
              padding: "10% 9% 8%",
              transition: "opacity 180ms ease-out",
            }}
          >
            <div
              style={{
                color: "#9a4933",
                fontSize: "clamp(1rem, 4vw, 2.7rem)",
                fontWeight: 900,
                letterSpacing: "-.035em",
                lineHeight: 0.9,
              }}
            >
              RITUAL
              <div style={{ color: "#1d2059" }}>TONALLI</div>
            </div>
            <div
              style={{
                background: "#f2c84b",
                height: 4,
                margin: "8% 0 6%",
              }}
            />
            <div
              style={{
                fontSize: "clamp(.42rem, 1.25vw, .72rem)",
                fontWeight: 800,
                letterSpacing: ".12em",
              }}
            >
              LA COMANDA DE LA CASA
            </div>
            <div style={{ marginTop: "10%" }}>
              {[
                ["ESPRESSO SOL", "INTENSO · CACAO"],
                ["TONALLI LATTE", "MIEL · CANELA"],
                ["CAFÉ DE OLLA", "PILONCILLO · ANÍS"],
                ["COLD BREW", "CÍTRICOS · CACAO"],
              ].map(([name, note]) => (
                <div key={name} style={{ marginBottom: "7.5%" }}>
                  <div
                    style={{
                      fontSize: "clamp(.55rem, 1.7vw, 1rem)",
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      color: "#9a4933",
                      fontSize: "clamp(.35rem, .9vw, .58rem)",
                      fontWeight: 800,
                      letterSpacing: ".12em",
                      marginTop: ".3em",
                    }}
                  >
                    {note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
