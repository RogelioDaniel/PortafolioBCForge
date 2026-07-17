"use client";

import { useLayoutEffect, useRef } from "react";

type Point = { x: number; y: number };

type Particle = {
  fromX: number;
  fromY: number;
  erodeX: number;
  erodeY: number;
  cloudX: number;
  cloudY: number;
  toX: number;
  toY: number;
  size: number;
  tone: number;
  delay: number;
};

type Props = {
  fromText: string;
  toText: string;
  direction: 1 | -1;
  runId: number;
  onComplete: (runId: number) => void;
};

const DURATION_MS = 900;
const FRAME_INTERVAL = 1000 / 30;
const DESKTOP_PARTICLES = 1400;
const MOBILE_PARTICLES = 550;
const SAND_COLORS = ["#f4f1eb", "#e7d7c9", "#c8b0c6"];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (a: number, b: number, amount: number) =>
  a + (b - a) * amount;
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Samples text pixels with reservoir sampling. This keeps memory and particle
 * count bounded even on a 4K viewport.
 */
function sampleText(
  text: string,
  width: number,
  height: number,
  computed: CSSStyleDeclaration,
  maxParticles: number,
  random: () => number
) {
  const baseScale = width < 768 ? 0.62 : 0.46;
  const sampleScale = Math.min(baseScale, 1200 / width, 720 / height);
  const sampleWidth = Math.max(1, Math.round(width * sampleScale));
  const sampleHeight = Math.max(1, Math.round(height * sampleScale));
  const canvas = document.createElement("canvas");
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [];

  const cssFontSize = Number.parseFloat(computed.fontSize) || width * 0.13;
  const fontSize = cssFontSize * sampleScale;
  const fontFamily = computed.fontFamily || '"Archivo", sans-serif';
  const fontWeight = computed.fontWeight || "500";
  const advancedContext = context as CanvasRenderingContext2D & {
    fontStretch?: string;
    letterSpacing?: string;
  };

  context.clearRect(0, 0, sampleWidth, sampleHeight);
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  advancedContext.fontStretch = "condensed";
  const cssLetterSpacing = Number.parseFloat(computed.letterSpacing);
  advancedContext.letterSpacing = Number.isFinite(cssLetterSpacing)
    ? `${cssLetterSpacing * sampleScale}px`
    : "-0.01em";
  context.fillText(
    text,
    sampleWidth / 2,
    sampleHeight / 2,
    sampleWidth * 0.9
  );

  const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
  const points: Point[] = [];
  let opaquePixels = 0;
  const step = width < 768 ? 1 : 2;

  for (let y = 0; y < sampleHeight; y += step) {
    for (let x = 0; x < sampleWidth; x += step) {
      if (pixels[(y * sampleWidth + x) * 4 + 3] < 90) continue;
      opaquePixels += 1;
      const point = { x: x / sampleScale, y: y / sampleScale };
      if (points.length < maxParticles) {
        points.push(point);
        continue;
      }
      const replacement = Math.floor(random() * opaquePixels);
      if (replacement < maxParticles) points[replacement] = point;
    }
  }

  return points;
}

function padPoints(
  points: Point[],
  count: number,
  width: number,
  height: number,
  random: () => number
) {
  if (points.length === 0) {
    return Array.from({ length: count }, () => ({
      x: width / 2,
      y: height / 2,
    }));
  }

  return Array.from({ length: count }, (_, index) => {
    const point = points[index % points.length];
    return {
      x: point.x + (random() - 0.5) * 1.4,
      y: point.y + (random() - 0.5) * 1.4,
    };
  });
}

/**
 * A bounded, 2D-canvas sand transition. The canvas is decorative; the real
 * headline remains in the DOM in KineticSection for selection and a11y.
 */
export function KineticSandTransition({
  fromText,
  toText,
  direction,
  runId,
  onComplete,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const textElement = container?.querySelector<HTMLElement>(
      "[data-kinetic-live-word]"
    );
    if (!canvas || !container || !textElement) {
      onComplete(runId);
      return;
    }

    let disposed = false;
    let frame = 0;
    let startTime = 0;
    let lastDraw = -Infinity;
    let pausedAt: number | null = null;
    let pausedDuration = 0;
    let completed = false;

    const finish = () => {
      if (completed || disposed) return;
      completed = true;
      onComplete(runId);
    };

    const begin = () => {
      if (disposed) return;
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) {
        finish();
        return;
      }

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const maxParticles =
        width < 768 ? MOBILE_PARTICLES : DESKTOP_PARTICLES;
      const seed = hashText(`${fromText}:${toText}:${runId}`);
      const random = mulberry32(seed);
      const computed = window.getComputedStyle(textElement);
      const fromSamples = sampleText(
        fromText,
        width,
        height,
        computed,
        maxParticles,
        random
      );
      const toSamples = sampleText(
        toText,
        width,
        height,
        computed,
        maxParticles,
        random
      );
      const count = Math.min(
        maxParticles,
        Math.max(fromSamples.length, toSamples.length)
      );

      if (count === 0) {
        finish();
        return;
      }

      const from = padPoints(fromSamples, count, width, height, random);
      const to = padPoints(toSamples, count, width, height, random);
      const wind = direction * Math.min(96, width * 0.075);
      const particles: Particle[] = from.map((source, index) => {
        const destination = to[index];
        const grit = random();
        const verticalDrift = 18 + random() * Math.min(92, height * 0.1);
        const erodeX = source.x + wind * (0.12 + random() * 0.28);
        const erodeY = source.y + verticalDrift;
        return {
          fromX: source.x,
          fromY: source.y,
          erodeX: erodeX + (random() - 0.5) * 22,
          erodeY,
          cloudX:
            lerp(source.x, destination.x, 0.55) +
            wind * (0.35 + random() * 0.7) +
            (random() - 0.5) * Math.min(120, width * 0.1),
          cloudY:
            lerp(source.y, destination.y, 0.55) +
            (random() - 0.38) * Math.min(180, height * 0.2),
          toX: destination.x,
          toY: destination.y,
          size: 0.85 + grit * 1.65,
          tone: Math.min(SAND_COLORS.length - 1, Math.floor(random() * 3)),
          delay: random() * 0.12,
        };
      });

      const draw = (now: number) => {
        if (disposed || completed) return;
        if (document.hidden) return;
        if (startTime === 0) startTime = now;

        if (now - lastDraw < FRAME_INTERVAL) {
          frame = window.requestAnimationFrame(draw);
          return;
        }
        lastDraw = now;

        const progress = clamp01(
          (now - startTime - pausedDuration) / DURATION_MS
        );
        context.clearRect(0, 0, width, height);

        particles.forEach((particle) => {
          let x: number;
          let y: number;
          let alpha: number;
          let size = particle.size;

          if (progress < 0.34) {
            const local = clamp01(
              progress / 0.34 - particle.delay
            );
            const amount = local * local;
            x = lerp(particle.fromX, particle.erodeX, amount);
            y = lerp(particle.fromY, particle.erodeY, amount);
            alpha = 1 - amount * 0.32;
          } else if (progress < 0.64) {
            const amount = smoothstep((progress - 0.34) / 0.3);
            x = lerp(particle.erodeX, particle.cloudX, amount);
            y = lerp(particle.erodeY, particle.cloudY, amount);
            alpha = 0.68 - Math.sin(amount * Math.PI) * 0.18;
            size *= 0.82;
          } else {
            const local = clamp01(
              (progress - 0.64) / 0.36 - particle.delay * 0.45
            );
            const amount = easeOutCubic(local);
            x = lerp(particle.cloudX, particle.toX, amount);
            y = lerp(particle.cloudY, particle.toY, amount);
            alpha = 0.62 + amount * 0.38;
            size *= 0.82 + amount * 0.18;
          }

          context.globalAlpha = alpha;
          context.fillStyle = SAND_COLORS[particle.tone];
          context.fillRect(x - size / 2, y - size / 2, size, size);
        });
        context.globalAlpha = 1;

        if (progress >= 1) {
          finish();
          return;
        }
        frame = window.requestAnimationFrame(draw);
      };

      const onVisibilityChange = () => {
        if (document.hidden) {
          if (startTime > 0 && pausedAt === null) {
            pausedAt = performance.now();
          }
          window.cancelAnimationFrame(frame);
          return;
        }
        if (pausedAt !== null) {
          pausedDuration += performance.now() - pausedAt;
          pausedAt = null;
        }
        frame = window.requestAnimationFrame(draw);
      };

      const onResize = () => finish();
      document.addEventListener("visibilitychange", onVisibilityChange);
      window.addEventListener("resize", onResize, { passive: true });
      if (!document.hidden) frame = window.requestAnimationFrame(draw);

      return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("resize", onResize);
      };
    };

    let teardown: (() => void) | undefined;
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    void fontsReady.then(() => {
      if (!disposed) teardown = begin();
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      teardown?.();
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [direction, fromText, onComplete, runId, toText]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-[2] h-full w-full pointer-events-none"
      data-kinetic-sand
    />
  );
}
