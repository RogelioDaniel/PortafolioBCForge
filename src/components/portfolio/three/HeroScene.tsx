"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * HeroScene — 3 objetos voxel/low-poly blancos mate que flotan ENTRE las letras.
 * El canvas va sobre el texto; la capa superior del titular con clip-path parcial
 * hace que los objetos parezcan pasar por delante y por detrás.
 * Rotación lenta + parallax al mouse (±10°, lerp suave).
 * Pausa el rAF cuando el canvas sale del viewport (IntersectionObserver).
 */
export default function HeroScene({
  reduced,
  isTouch,
}: {
  reduced: boolean;
  isTouch: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 6, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf3d8cd, 0.6);
    rim.position.set(-5, -2, 3);
    scene.add(rim);

    const matWhite = new THREE.MeshStandardMaterial({
      color: 0xf4f4f0,
      roughness: 0.65,
      metalness: 0.05,
      flatShading: true,
    });

    type Floater = {
      group: THREE.Group;
      basePos: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      floatPhase: number;
      floatAmp: number;
    };
    const floaters: Floater[] = [];

    // Geometría de cubo unitario compartida por todos los voxels
    const voxelGeo = new THREE.BoxGeometry(1, 1, 1);

    // Crea un cluster voxel (grupo de cubos formando una figura pixel 3D)
    const makeVoxelCluster = (
      cells: [number, number, number][],
      x: number,
      y: number,
      z: number,
      scale: number
    ) => {
      const group = new THREE.Group();
      cells.forEach(([cx, cy, cz]) => {
        const cube = new THREE.Mesh(voxelGeo, matWhite);
        cube.position.set(cx, cy, cz);
        group.add(cube);
      });
      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      group.rotation.y = Math.random() * 0.6 - 0.3;
      scene.add(group);
      floaters.push({
        group,
        basePos: new THREE.Vector3(x, y, z),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.003 + 0.0015,
          (Math.random() - 0.5) * 0.0015
        ),
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.12 + Math.random() * 0.12,
      });
    };

    // Figuras pixel abstractas (escalera, figura humanoide, cruz) flotando
    // SOBRE la franja del titular — pasan por delante de las letras,
    // igual que los voxels blancos de la referencia.
    const stairs: [number, number, number][] = [
      [0, 0, 0], [1, 0, 0], [2, 0, 0],
      [1, 1, 0], [2, 1, 0],
      [2, 2, 0],
      [0, 0, 1], [1, 0, 1],
      [1, 1, 1],
    ];
    const figure: [number, number, number][] = [
      // torso
      [0, 0, 0], [0, 1, 0], [0, 2, 0],
      // cabeza
      [0, 3, 0],
      // brazos
      [-1, 2, 0], [1, 2, 0],
      // piernas
      [-1, -1, 0], [1, -1, 0],
    ];
    const cross: [number, number, number][] = [
      [0, 0, 0], [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1],
    ];

    makeVoxelCluster(stairs, -2.6, 0.9, 0.8, 0.28);
    makeVoxelCluster(figure, 1.9, -0.7, 1.0, 0.3);
    makeVoxelCluster(cross, 3.4, 1.5, 0.4, 0.24);

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!isTouch && !reduced) {
      window.addEventListener("mousemove", onMouse);
    }

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

      mouse.x += (target.x - mouse.x) * 0.05;
      mouse.y += (target.y - mouse.y) * 0.05;

      floaters.forEach((f) => {
        f.group.rotation.x += f.rotSpeed.x;
        f.group.rotation.y += f.rotSpeed.y;
        f.group.rotation.z += f.rotSpeed.z;
        f.group.position.y =
          f.basePos.y + Math.sin(t * 0.6 + f.floatPhase) * f.floatAmp;
        f.group.position.x =
          f.basePos.x + Math.cos(t * 0.4 + f.floatPhase) * f.floatAmp * 0.5;
      });

      camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

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
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      voxelGeo.dispose();
      matWhite.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [reduced, isTouch]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-[2] pointer-events-none"
      aria-hidden="true"
    />
  );
}
