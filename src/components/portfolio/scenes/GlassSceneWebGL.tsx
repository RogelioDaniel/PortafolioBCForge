"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SceneProps } from "./scene-shared";

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
  const uvs: number[] = [];

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
      edgeMasks.push(edgeMask[idx]);
      uvs.push((p.x + paneW / 2) / paneW, (p.y + paneH / 2) / paneH);
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
        pushTri(impact.clone(), b, c, [0, 0, 1], 0);
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
  geo.setAttribute("aUv", new THREE.Float32BufferAttribute(uvs, 2));
  return geo;
}

const VERT = /* glsl */ `
attribute vec3 aCentroid;
attribute vec3 aBary;
attribute vec3 aRandom;
attribute float aDelay;
attribute vec3 aEdgeMask;
attribute vec2 aUv;

uniform float uShatter;
uniform vec2 uImpact;

varying vec3 vBary;
varying vec3 vEdgeMask;
varying vec2 vUv;
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
  float ang = s * (2.2 + aRandom.x * 2.4);
  vec3 rotated = rotateAxis(local, axis, ang);

  vec3 explode;
  explode.xy = dir * s * spread;
  explode.z = s * (1.4 + aRandom.z * 1.2);
  explode.y -= s * s * 0.5;

  vec3 pos = aCentroid + rotated + explode;

  vBary = aBary;
  vEdgeMask = aEdgeMask;
  vUv = aUv;
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

varying vec3 vBary;
varying vec3 vEdgeMask;
varying vec2 vUv;
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
  col += edgeCore * (0.08 + vShatter * 0.20) * vec3(0.82, 0.76, 0.68);

  float alpha = (0.46 + edge * 0.22) * uOpacity;
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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // Dimensiones del panel que cubre el viewport
    const vH = 2 * camera.position.z * Math.tan((50 * Math.PI) / 180 / 2);
    const vW = vH * (mount.clientWidth / mount.clientHeight);
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
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Click → abrir URL
    const onClick = () => onOpen();
    renderer.domElement.style.cursor = "pointer";
    renderer.domElement.addEventListener("click", onClick);

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(mount);

    const animate = () => {
      const raf = requestAnimationFrame(animate);
      if (!visible) return;
      const p = progressRef.current;
      const active = activeRef.current;
      // uShatter: 0 al inicio, sube a 1 al 50% del progreso, vuelve a 0 al final
      let shatter = 0;
      if (p < 0.5) {
        shatter = (p / 0.5) ** 1.3;
      } else {
        // reconstrucción (easeInOutCubic invertida)
        const k = (p - 0.5) / 0.5;
        shatter = 1 - (1 - Math.pow(1 - k, 3));
      }
      // Solo anima cuando es el proyecto activo (glass = índice 3)
      if (active !== 3) shatter = 0;
      mat.uniforms.uShatter.value = shatter;
      renderer.render(scene, camera);
      return raf;
    };
    const rafId = animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(typeof rafId === "number" ? rafId : 0);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      geo.dispose();
      mat.dispose();
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
