"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getAmbient } from "@/lib/ambient-sound";
import type { SceneProps } from "./scene-shared";

const GLASS_DESKTOP_FPS = 24;
const GLASS_TOUCH_FPS = 20;
const GLASS_DESKTOP_DPR = 1.2;
const GLASS_BREAK_END = 0.34;
const GLASS_FLOAT_END = 0.67;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const quantizeUnit = (value: number, steps: number) =>
  Math.round(clamp01(value) * steps) / steps;

const smoothUnit = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

/**
 * GlassSceneWebGL — panel de vidrio que se FRACTURA desde un punto de impacto
 * y se RECONSTRUYE, adaptado del proyecto PRISMA Vidrieria.
 *
 * Usa Three.js crudo (raw WebGL, no R3F) con shaders personalizados.
 * La fractura se controla con el progreso de scroll (progressRef):
 *  - p=0: vidrio intacto
 *  - p→0.5: fractura radial desde el impacto, esquirlas vuelan
 *  - p→1: reconstrucción inversa
 *
 * Punto de impacto + seed aleatorios cada vez que la escena se monta.
 */

// PRNG determinista (mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RINGS = 8;
const SECTORS = 22;

/** Construye la geometría de esquirlas (radial fracture). Adaptado de Vidrieria. */
function buildShardGeometry(impact: THREE.Vector2, paneW: number, paneH: number, seed: number) {
  const rng = mulberry32(seed);
  const maxR = Math.hypot(paneW, paneH) * 0.6;

  // Nodos en grid polar alrededor del impacto
  const nodes: THREE.Vector3[][] = [];
  for (let k = 0; k <= RINGS; k++) {
    const ring: THREE.Vector3[] = [];
    const baseR = (k / RINGS);
    const r = maxR * Math.pow(baseR, 1.4 + rng() * 0.25);
    const sectorJitter = (0.42 + rng() * 0.22) * (Math.PI * 2) / SECTORS;
    for (let j = 0; j < SECTORS; j++) {
      const angle = (j / SECTORS) * Math.PI * 2 + sectorJitter * (rng() - 0.5);
      const rad = r * (1 + (rng() - 0.5) * 0.18);
      ring.push(
        new THREE.Vector3(
          impact.x + Math.cos(angle) * rad,
          impact.y + Math.sin(angle) * rad,
          0
        )
      );
    }
    nodes.push(ring);
  }

  const positions: number[] = [];
  const centroids: number[] = [];
  const barys: number[] = [];
  const randoms: number[] = [];
  const delays: number[] = [];
  const edgeMasks: number[] = [];

  const pushTri = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
    edgeMask: [number, number, number],
    delay: number
  ) => {
    const cx = (a.x + b.x + c.x) / 3;
    const cy = (a.y + b.y + c.y) / 3;
    const rand = [rng(), rng(), rng()];
    [a, b, c].forEach((p, idx) => {
      positions.push(p.x, p.y, p.z);
      centroids.push(cx, cy, 0);
      // Coordenadas baricéntricas
      barys.push(
        idx === 0 ? 1 : 0,
        idx === 1 ? 1 : 0,
        idx === 2 ? 1 : 0
      );
      randoms.push(rand[0], rand[1], rand[2]);
      delays.push(delay);
      // La máscara describe las tres aristas del triángulo y debe repetirse
      // completa en cada vértice para interpolar junto a aBary.
      edgeMasks.push(edgeMask[0], edgeMask[1], edgeMask[2]);
    });
  };

  for (let k = 0; k < RINGS; k++) {
    for (let j = 0; j < SECTORS; j++) {
      const jn = (j + 1) % SECTORS;
      const a = nodes[k][j];
      const b = nodes[k][jn];
      const c = nodes[k + 1][j];
      const d = nodes[k + 1][jn];
      const delay = k / RINGS;
      const branch = rng() < 0.18 ? 1 : 0;
      if (k === 0) {
        // impact es Vector2: usar Vector3 con z=0 (antes p.z era undefined → NaN)
        pushTri(new THREE.Vector3(impact.x, impact.y, 0), b, c, [0, 0, 1], 0);
      } else if (branch) {
        pushTri(a, b, c, [1, 1, 1], delay);
        pushTri(b, c, d, [1, 1, 1], delay);
      } else {
        pushTri(a, b, d, [1, 1, 1], delay);
        pushTri(a, d, c, [1, 1, 1], delay);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("aCentroid", new THREE.Float32BufferAttribute(centroids, 3));
  geo.setAttribute("aBary", new THREE.Float32BufferAttribute(barys, 3));
  geo.setAttribute("aRandom", new THREE.Float32BufferAttribute(randoms, 3));
  geo.setAttribute("aDelay", new THREE.Float32BufferAttribute(delays, 1));
  geo.setAttribute("aEdgeMask", new THREE.Float32BufferAttribute(edgeMasks, 3));
  return geo;
}

const VERT = /* glsl */ `
attribute vec3 aCentroid;
attribute vec3 aBary;
attribute vec3 aRandom;
attribute float aDelay;
attribute vec3 aEdgeMask;

uniform float uShatter;
uniform vec2 uImpact;
uniform float uDance;
uniform float uFloat;
uniform float uTime;

varying vec3 vBary;
varying vec3 vEdgeMask;
varying float vShatter;
varying float vDist;

vec3 rotateAxis(vec3 v, vec3 axis, float angle) {
  axis = normalize(axis);
  float c = cos(angle);
  float s = sin(angle);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}

void main() {
  float d = aDelay * 0.6;
  float s = clamp((uShatter - d) / (1.0 - d), 0.0, 1.0);
  s = smoothstep(0.0, 1.0, s);

  vec2 dir = normalize(aCentroid.xy - uImpact + vec2(0.0001));
  float spread = 1.6 + aRandom.y * 0.9;

  vec3 local = position - aCentroid;
  vec3 axis = normalize(aRandom + vec3(0.0, 0.0, 0.6));
  // Aun reconstruido, cada celda conserva un pulso mínimo. Al fracturarse,
  // la misma banda abre progresivamente todo el recorrido.
  float movement = clamp(uDance + uFloat, 0.0, 1.0);
  float danceGate = mix(0.18, 1.0, s) * movement;
  float dancePhase =
    uTime * (2.4 + aRandom.x * 1.8) +
    aRandom.y * 6.2831853;
  float sway = sin(dancePhase);
  float lift = cos(dancePhase * 0.82 + aRandom.z * 4.0);
  float ang =
    s * (2.2 + aRandom.x * 2.4) +
    danceGate * sway * 0.32;
  vec3 rotated = rotateAxis(local, axis, ang);

  vec3 explode;
  explode.xy = dir * s * spread;
  explode.z = s * (1.4 + aRandom.z * 1.2);
  explode.y -= s * s * 0.5;
  vec2 tangent = vec2(-dir.y, dir.x);
  explode.xy +=
    tangent * sway * danceGate * (0.10 + aRandom.z * 0.08);
  explode.z +=
    lift * danceGate * (0.08 + aRandom.x * 0.08);

  vec3 pos = aCentroid + rotated + explode;

  vBary = aBary;
  vEdgeMask = aEdgeMask;
  vShatter = s;
  vDist = length(aCentroid.xy - uImpact);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform vec3 uFrost;
uniform vec3 uCopper;
uniform float uOpacity;
uniform float uEdgePulse;

varying vec3 vBary;
varying vec3 vEdgeMask;
varying float vShatter;
varying float vDist;

void main() {
  vec3 col = mix(uFrost * 0.26, uFrost * 0.48, 0.5);
  // Luz cobre agrupándose alrededor del impacto
  float glow = exp(-vDist * 0.55);
  col = mix(col, uCopper, glow * 0.24);

  // Crack: corte carbonizado fino + núcleo plata/cobre
  vec3 edgeCuts = (vec3(1.0) - smoothstep(vec3(0.0), vec3(0.011), vBary)) * vEdgeMask;
  vec3 coreCuts = (vec3(1.0) - smoothstep(vec3(0.0), vec3(0.0028), vBary)) * vEdgeMask;
  float edge = max(edgeCuts.x, max(edgeCuts.y, edgeCuts.z));
  float edgeCore = max(coreCuts.x, max(coreCuts.y, coreCuts.z));
  col = mix(col, vec3(0.018, 0.022, 0.024), edge * 0.68);
  vec3 liveEdge = mix(
    vec3(0.82, 0.76, 0.68),
    uCopper,
    uEdgePulse * 0.62
  );
  col +=
    edgeCore *
    (0.08 + vShatter * 0.20 + uEdgePulse * 0.48) *
    liveEdge;
  col += edge * uEdgePulse * 0.10 * uCopper;

  float alpha =
    (0.46 + edge * (0.22 + uEdgePulse * 0.08)) * uOpacity;
  gl_FragColor = vec4(col, alpha);
}
`;

export default function GlassSceneWebGL({
  activeRef,
  progressRef,
  onOpen,
}: SceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const initialRect = mount.getBoundingClientRect();
    // Nunca se construye la proyección con cero: evita atributos NaN durante
    // montajes tempranos o cambios de pantalla.
    let W = Math.max(
      1,
      Math.round(initialRect.width || mount.clientWidth || window.innerWidth)
    );
    let H = Math.max(
      1,
      Math.round(initialRect.height || mount.clientHeight || window.innerHeight)
    );
    const initialAspect = W / H;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const frameRate = coarsePointer ? GLASS_TOUCH_FPS : GLASS_DESKTOP_FPS;
    const frameInterval = 1000 / frameRate;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let reducedMotion = reducedMotionQuery.matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.z = 6;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !coarsePointer,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const getTargetDpr = () =>
      Math.min(
        window.devicePixelRatio || 1,
        coarsePointer ? 1 : GLASS_DESKTOP_DPR
      );
    let currentDpr = getTargetDpr();
    renderer.setPixelRatio(currentDpr);
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    // Dimensiones del panel que cubre el viewport
    const vH = 2 * camera.position.z * Math.tan((50 * Math.PI) / 180 / 2);
    const vW = vH * (W / H);
    const paneW = vW * 0.9;
    const paneH = vH * 0.9;

    // Punto de impacto aleatorio dentro del panel
    const seed = Math.floor(Math.random() * 1000000);
    const rng = mulberry32(seed);
    const impact = new THREE.Vector2(
      paneW * (rng() * 0.5 - 0.25),
      paneH * (rng() * 0.4 - 0.2)
    );

    const geo = buildShardGeometry(impact, paneW, paneH, seed);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uShatter: { value: 0 },
        uImpact: { value: new THREE.Vector2(impact.x, impact.y) },
        uFrost: { value: new THREE.Color(0xc2d0d8) },
        uCopper: { value: new THREE.Color(0xd18a45) },
        uOpacity: { value: 1 },
        uDance: { value: 0 },
        uFloat: { value: 0 },
        uTime: { value: 0 },
        uEdgePulse: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    // Solo cambia de escala al redimensionar; evita recomponer la matriz en
    // cada render.
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    mesh.frustumCulled = false;
    scene.add(mesh);

    // Click → abrir URL
    const onClick = () => onOpen();
    renderer.domElement.style.cursor = "pointer";
    renderer.domElement.addEventListener("click", onClick);

    const ambient = getAmbient();
    const audioBands = {
      dance: 0,
      edge: 0,
    };
    let musicEnabled = ambient?.isEnabled() ?? false;
    const screenSlot = mount.closest<HTMLElement>(".screen-slot");
    let visible =
      initialRect.width > 0 &&
      initialRect.height > 0 &&
      initialRect.bottom > 0 &&
      initialRect.top < window.innerHeight;
    let screenActive =
      !screenSlot || screenSlot.dataset.phase !== "exit";
    let loopRunning = false;
    let lastRenderAt = -Infinity;
    let lastRenderSignature = "";

    const canRender = () =>
      visible &&
      screenActive &&
      !document.hidden &&
      activeRef.current === 3;

    const readShatterPhase = () => {
      if (activeRef.current !== 3) return { shatter: 0, float: 0 };
      const p = clamp01(progressRef.current);
      if (p < GLASS_BREAK_END) {
        const t = p / GLASS_BREAK_END;
        return {
          shatter: t ** 1.25,
          float: 0.36 * smoothUnit((p - 0.22) / 0.12),
        };
      }
      if (p < GLASS_FLOAT_END) {
        return { shatter: 1, float: 0.36 };
      }

      const t = (p - GLASS_FLOAT_END) / (1 - GLASS_FLOAT_END);
      const reconstruction = smoothUnit(t);
      return {
        shatter: 1 - reconstruction,
        float: 0.36 * (1 - reconstruction),
      };
    };

    const renderFrame = (timestamp: number, force = false) => {
      if (!canRender()) {
        if (loopRunning) {
          renderer.setAnimationLoop(null);
          loopRunning = false;
        }
        return;
      }
      if (
        !force &&
        timestamp - lastRenderAt < frameInterval
      ) {
        return;
      }
      lastRenderAt = timestamp;

      const phase = readShatterPhase();
      const shatter = quantizeUnit(phase.shatter, 180);
      const floatMotion = reducedMotion
        ? 0
        : quantizeUnit(phase.float, 48);
      const dance =
        musicEnabled && !reducedMotion
          ? quantizeUnit(audioBands.dance, 36)
          : 0;
      const edgePulse =
        musicEnabled && !reducedMotion
          ? quantizeUnit(audioBands.edge, 48)
          : 0;
      const musicMotionActive =
        musicEnabled &&
        !reducedMotion &&
        (dance > 0.02 || edgePulse > 0.02);
      const floatMotionActive = floatMotion > 0.01;
      const timeBucket = musicMotionActive || floatMotionActive
        ? Math.floor(timestamp / frameInterval)
        : 0;
      const signature = `${shatter}|${floatMotion}|${dance}|${edgePulse}|${timeBucket}`;
      if (!force && signature === lastRenderSignature) return;
      lastRenderSignature = signature;

      if (mat.uniforms.uShatter.value !== shatter) {
        mat.uniforms.uShatter.value = shatter;
      }
      if (mat.uniforms.uDance.value !== dance) {
        mat.uniforms.uDance.value = dance;
      }
      if (mat.uniforms.uFloat.value !== floatMotion) {
        mat.uniforms.uFloat.value = floatMotion;
      }
      if (mat.uniforms.uEdgePulse.value !== edgePulse) {
        mat.uniforms.uEdgePulse.value = edgePulse;
      }
      if (musicMotionActive || floatMotionActive) {
        const quantizedTime = (timeBucket % (frameRate * 1024)) / frameRate;
        if (mat.uniforms.uTime.value !== quantizedTime) {
          mat.uniforms.uTime.value = quantizedTime;
        }
      }

      renderer.render(scene, camera);
    };

    const animate = (timestamp: number) => {
      renderFrame(timestamp);
      if (
        progressRef.current >= 0.999 &&
        !musicEnabled &&
        loopRunning
      ) {
        renderer.setAnimationLoop(null);
        loopRunning = false;
      }
    };

    function syncRenderLoop() {
      const shouldRender =
        canRender() && (progressRef.current < 0.999 || musicEnabled);
      if (shouldRender === loopRunning) return;

      loopRunning = shouldRender;
      if (shouldRender) {
        lastRenderAt = -Infinity;
        lastRenderSignature = "";
        renderer.setAnimationLoop(animate);
      } else {
        renderer.setAnimationLoop(null);
      }
    }

    const unsubscribeEnabled = ambient?.subscribe((enabled) => {
      musicEnabled = enabled;
      lastRenderSignature = "";
      syncRenderLoop();
    });
    const unsubscribeAnalysis = ambient?.subscribeAnalysis((bands) => {
      // Medios sostenidos mueven las esquirlas; agudos transitorios prenden
      // sus cortes. Los callbacks solo escriben memoria: ningún setState.
      audioBands.dance = bands.midFlow;
      audioBands.edge = bands.trebleSpark;
    });

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncRenderLoop();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(mount);

    const phaseObserver = screenSlot
      ? new MutationObserver(() => {
          screenActive = screenSlot.dataset.phase !== "exit";
          syncRenderLoop();
        })
      : null;
    phaseObserver?.observe(screenSlot!, {
      attributes: true,
      attributeFilter: ["data-phase"],
    });

    const onVisibilityChange = () => syncRenderLoop();
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      lastRenderSignature = "";
      if (canRender()) renderFrame(performance.now(), true);
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    let resizeFrame = 0;
    const applyResize = () => {
      resizeFrame = 0;
      const rect = mount.getBoundingClientRect();
      const nextW = Math.max(
        1,
        Math.round(rect.width || mount.clientWidth || window.innerWidth)
      );
      const nextH = Math.max(
        1,
        Math.round(rect.height || mount.clientHeight || window.innerHeight)
      );
      const nextDpr = getTargetDpr();
      if (nextW === W && nextH === H && nextDpr === currentDpr) return;

      W = nextW;
      H = nextH;
      currentDpr = nextDpr;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(currentDpr);
      renderer.setSize(W, H, false);
      mesh.scale.x =
        Math.round(((W / H) / initialAspect) * 1000) / 1000;
      mesh.updateMatrix();
      lastRenderSignature = "";
      if (canRender()) renderFrame(performance.now(), true);
    };
    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(applyResize);
    });
    resizeObserver.observe(mount);

    // El primer frame no depende del loop ni de que IntersectionObserver haya
    // entregado su primera entrada.
    if (canRender()) {
      renderFrame(performance.now(), true);
    }
    syncRenderLoop();

    return () => {
      renderer.setAnimationLoop(null);
      loopRunning = false;
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }
      renderer.domElement.removeEventListener("click", onClick);
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );
      reducedMotionQuery.removeEventListener(
        "change",
        onReducedMotionChange
      );
      unsubscribeEnabled?.();
      unsubscribeAnalysis?.();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      phaseObserver?.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [activeRef, progressRef, onOpen]);

  return (
    <div
      ref={mountRef}
      className="glass-scene-webgl absolute inset-0 z-[2]"
      style={{ pointerEvents: "auto" }}
      aria-hidden="false"
    />
  );
}
