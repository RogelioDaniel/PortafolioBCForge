"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Project } from "@/lib/portfolio-content";

/**
 * ProjectsSceneManager — UN solo contexto WebGL para todos los proyectos.
 * Cambia la primitiva central según el índice activo con un morph de escala
 * (scale 1 → 0 → 1) para dar sensación de crossfade entre objetos.
 * Rota con el progreso del scroll (0..1 global de la sección pinneada).
 */
export default function ProjectsSceneManager({
  projects,
  activeRef,
  progressRef,
}: {
  projects: Project[];
  activeRef: React.MutableRefObject<number>;
  progressRef: React.MutableRefObject<number>;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.8, 7.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);
    // Luz clave más suave y difusa para evitar hotspots duros
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf3d8cd, 0.5);
    rim.position.set(-5, -1, 3);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xdce2f0, 0.4);
    fill.position.set(0, -3, 4);
    scene.add(fill);
    const purple = new THREE.PointLight(0x7b3ff2, 0.35, 20);
    purple.position.set(-3, 2, 3);
    scene.add(purple);

    // Plataforma low-poly clara (compartida)
    const platformGeo = new THREE.CylinderGeometry(2.6, 2.9, 0.18, 6);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xeae6da,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -1.9;
    scene.add(platform);

    const ringGeo = new THREE.TorusGeometry(2.6, 0.02, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0e0e10,
      transparent: true,
      opacity: 0.22,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.8;
    scene.add(ring);

    // Construir geometrías por proyecto
    const makeGeo = (shape: Project["shape"]) => {
      switch (shape) {
        case "sphere":
          return new THREE.IcosahedronGeometry(1.5, 4);
        case "torus":
          return new THREE.TorusKnotGeometry(1.05, 0.34, 160, 24);
        case "cube":
          return new THREE.BoxGeometry(2, 2, 2, 2, 2, 2);
        case "octahedron":
        default:
          return new THREE.OctahedronGeometry(1.5, 0);
      }
    };

    const makeMat = (p: Project) => {
      const isGlass = p.shape === "cube";
      return new THREE.MeshStandardMaterial({
        color: p.color,
        metalness: p.metalness,
        roughness: p.roughness,
        flatShading: p.shape !== "sphere",
        transparent: isGlass,
        opacity: isGlass ? 0.78 : 1,
      });
    };

    // Mesh activo (se recrea al cambiar de proyecto)
    let mesh: THREE.Mesh | null = null;
    let mat: THREE.MeshStandardMaterial | null = null;
    let geo: THREE.BufferGeometry | null = null;
    let lastIndex = -1;
    let morphT = 1; // 0 = colapsado, 1 = expandido

    const buildMesh = (idx: number) => {
      const p = projects[idx];
      if (mesh) {
        scene.remove(mesh);
        geo?.dispose();
        mat?.dispose();
      }
      geo = makeGeo(p.shape);
      mat = makeMat(p);
      mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(0.001);
      scene.add(mesh);
      morphT = 0;
      lastIndex = idx;
    };

    buildMesh(0);

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(mount);

    let raf = 0;
    const startTime = performance.now();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) return;
      const t = (performance.now() - startTime) / 1000;

      // Cambio de proyecto con morph
      const idx = activeRef.current;
      if (idx !== lastIndex && idx >= 0 && idx < projects.length) {
        buildMesh(idx);
      }

      // Morph de escala (0 → 1) con ease elástico suave
      if (morphT < 1) {
        morphT = Math.min(1, morphT + 0.045);
      }
      const eased = 1 - Math.pow(1 - morphT, 3);
      const baseScale = 0.9 + Math.sin(t * 0.8) * 0.05;
      if (mesh) {
        mesh.scale.setScalar(baseScale * eased);
        const p = progressRef.current;
        mesh.rotation.y = p * Math.PI * 2.4 + t * 0.15;
        mesh.rotation.x = Math.sin(p * Math.PI) * 0.4;
        mesh.position.y = Math.sin(t * 0.8) * 0.1;
      }

      platform.rotation.y = t * 0.05;
      ring.rotation.z = t * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      geo?.dispose();
      mat?.dispose();
      platformGeo.dispose();
      platformMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [projects, activeRef, progressRef]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-[2] pointer-events-none"
      aria-hidden="true"
    />
  );
}
