"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getAmbient } from "@/lib/ambient-sound";

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
  running = true,
  onFirstFrame,
}: {
  reduced: boolean;
  isTouch: boolean;
  running?: boolean;
  onFirstFrame?: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(running);
  const startRef = useRef<() => void>(() => undefined);
  const stopRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (reduced) {
      onFirstFrame?.();
      return;
    }

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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      // Un navegador sin WebGL no debe dejar el loader bloqueado.
      onFirstFrame?.();
      return;
    }
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isTouch ? 1 : 1.25)
    );
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
      emissive: 0xf3d8cd,
      emissiveIntensity: 0,
    });

    type Floater = {
      group: THREE.Group;
      basePos: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      floatPhaseX: number;
      floatPhaseY: number;
      floatAmp: number;
      baseScale: number;
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
      
      const initialPhase = Math.random() * Math.PI * 2;
      floaters.push({
        group,
        basePos: new THREE.Vector3(x, y, z),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.003 + 0.0015,
          (Math.random() - 0.5) * 0.0015
        ),
        floatPhaseX: initialPhase,
        floatPhaseY: initialPhase,
        floatAmp: 0.12 + Math.random() * 0.12,
        baseScale: scale,
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

    // Escala contenida: acentos discretos sobre el titular, no protagonistas
    makeVoxelCluster(stairs, -2.9, 1.0, 0.6, 0.17);
    makeVoxelCluster(figure, 2.1, -0.5, 0.9, 0.19);
    // En teléfono dejamos exactamente dos figuras, con recorrido suficiente
    // para asomarse, salir del borde y volver sin saturar la GPU.
    if (!isTouch) {
      makeVoxelCluster(cross, 3.9, 1.6, 0.3, 0.13);
    }

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!isTouch && !reduced) {
      window.addEventListener("mousemove", onMouse);
    }

    const audioBands = { bass: 0, mid: 0, treble: 0 };
    const unsubscribeAudio = getAmbient()?.subscribeAnalysis((bands) => {
      audioBands.bass = bands.bass;
      audioBands.mid = bands.mid;
      audioBands.treble = bands.treble;
    });

    const screenSlot = mount.closest<HTMLElement>(".screen-slot");
    let visible = true;
    let screenActive = screenSlot?.dataset.phase !== "exit";
    let running = false;
    let raf = 0;

    const stop = () => {
      if (!running) return;
      window.cancelAnimationFrame(raf);
      running = false;
    };

    const start = () => {
      if (
        running ||
        !runningRef.current ||
        !visible ||
        !screenActive ||
        document.hidden
      ) {
        return;
      }
      running = true;
      raf = window.requestAnimationFrame(animate);
    };
    startRef.current = start;
    stopRef.current = stop;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(mount);

    const minimumFrameTime = 1000 / (isTouch ? 30 : 40);
    let lastFrameAt = 0;
    const animate = (timestamp: number) => {
      if (
        !runningRef.current ||
        !visible ||
        !screenActive ||
        document.hidden
      ) {
        running = false;
        return;
      }
      if (lastFrameAt > 0 && timestamp - lastFrameAt < minimumFrameTime) {
        raf = window.requestAnimationFrame(animate);
        return;
      }
      
      const now = timestamp;
      const prev = lastFrameAt > 0 ? lastFrameAt : now - 16.6;
      lastFrameAt = now;
      const dt = Math.min(0.1, (now - prev) / 1000);

      mouse.x += (target.x - mouse.x) * 0.05;
      mouse.y += (target.y - mouse.y) * 0.05;

      floaters.forEach((f, index) => {
        const band = index === 0 ? audioBands.bass : index === 1 ? audioBands.mid : audioBands.treble;
        const targetScale = f.baseScale * (1 + band * 0.38);
        f.group.scale.setScalar(
          THREE.MathUtils.lerp(f.group.scale.x, targetScale, 0.14)
        );
        f.group.rotation.x += f.rotSpeed.x * (1 + audioBands.mid * 1.8);
        f.group.rotation.y += f.rotSpeed.y * (1 + audioBands.mid * 1.8);
        f.group.rotation.z += f.rotSpeed.z * (1 + audioBands.treble * 1.5);
        
        // Accumulate phase dynamically using dt instead of absolute time t
        f.floatPhaseY += dt * (0.6 + audioBands.mid * 0.3);
        f.floatPhaseX += dt * (isTouch ? 0.34 : 0.4);

        f.group.position.y =
          f.basePos.y +
          Math.sin(f.floatPhaseY) *
            f.floatAmp *
            (1 + band * 0.7);
        const horizontalTravel = isTouch
          ? index === 0
            ? 0.95
            : 1.1
          : f.floatAmp * 0.5;
        f.group.position.x =
          f.basePos.x +
          Math.cos(f.floatPhaseX) *
            horizontalTravel;
      });

      matWhite.emissiveIntensity = THREE.MathUtils.lerp(
        matWhite.emissiveIntensity,
        audioBands.treble * 0.55,
        0.16
      );

      camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

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
    // Primer frame real: el loader sólo puede terminar después de esta señal.
    renderer.render(scene, camera);
    onFirstFrame?.();
    start();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, isTouch ? 1 : 1.25)
      );
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      phaseObserver?.disconnect();
      unsubscribeAudio?.();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      startRef.current = () => undefined;
      stopRef.current = () => undefined;
      renderer.forceContextLoss();
      renderer.dispose();
      voxelGeo.dispose();
      matWhite.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [reduced, isTouch, onFirstFrame]);

  useEffect(() => {
    runningRef.current = running;
    if (running) startRef.current();
    else stopRef.current();
  }, [running]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-[2] pointer-events-none"
      aria-hidden="true"
    />
  );
}
