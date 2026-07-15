"use client";

/**
 * AmbientSound — ambiente sonoro sutil generado con Web Audio API.
 * No carga archivos: sintetiza un pad suave (dos osciladores + filtro lowpass
 * + leve LFO de volumen) que evoca el tono lavanda/durazno del sitio.
 *
 * API:
 *   - enable(): crea el AudioContext (debe llamarse desde un gesto del usuario)
 *   - disable(): silencia y suspende
 *   - isEnabled(): estado actual
 *   - subscribe(cb): notifica cambios (para sincronizar UI)
 *
 * Se expone en window.__ambient para que el Preloader, Header y otros lo usen.
 */

type Cb = (enabled: boolean) => void;

class AmbientSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private enabled = false;
  private subs = new Set<Cb>();

  isEnabled() {
    return this.enabled;
  }

  subscribe(cb: Cb) {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }

  private notify() {
    this.subs.forEach((cb) => cb(this.enabled));
  }

  async enable() {
    if (this.enabled) return;
    try {
      if (!this.ctx) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        this.ctx = new Ctx();
      }
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
      const ctx = this.ctx;

      // Master gain (fade-in suave)
      this.master = ctx.createGain();
      this.master.gain.setValueAtTime(0, ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(
        0.06,
        ctx.currentTime + 1.5
      );
      this.master.connect(ctx.destination);

      // Filtro lowpass — tono cálido
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.Q.setValueAtTime(0.6, ctx.currentTime);
      filter.connect(this.master);
      this.nodes.push(filter);

      // Dos osciladores formando un intervalo abierto (pad)
      const freqs = [110, 164.81]; // A2 + E3 (quinta justa)
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        const g = ctx.createGain();
        g.gain.setValueAtTime(i === 0 ? 0.5 : 0.28, ctx.currentTime);
        osc.connect(g);
        g.connect(filter);
        osc.start();
        this.nodes.push(osc, g);
      });

      // LFO de volumen muy lento (respiración)
      this.lfo = ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      this.lfoGain = ctx.createGain();
      this.lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.master.gain);
      this.lfo.start();

      this.enabled = true;
      this.notify();
    } catch (e) {
      // Audio no disponible — fail silencioso
      console.warn("AmbientSound: no se pudo iniciar", e);
    }
  }

  async disable() {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    // Fade-out
    if (this.master) {
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.setValueAtTime(
        this.master.gain.value,
        ctx.currentTime
      );
      this.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    }
    setTimeout(() => {
      this.nodes.forEach((n) => {
        try {
          if ("stop" in n && typeof (n as OscillatorNode).stop === "function") {
            (n as OscillatorNode).stop();
          }
          n.disconnect();
        } catch {
          /* noop */
        }
      });
      this.nodes = [];
      try {
        this.lfo?.stop();
        this.lfoGain?.disconnect();
      } catch {
        /* noop */
      }
      this.lfo = null;
      this.lfoGain = null;
      this.ctx?.suspend();
    }, 700);
    this.enabled = false;
    this.notify();
  }

  toggle() {
    if (this.enabled) this.disable();
    else this.enable();
  }
}

// Singleton expuesto en window
const w = typeof window !== "undefined" ? (window as unknown as { __ambient?: AmbientSound }) : undefined;
if (w && !w.__ambient) {
  w.__ambient = new AmbientSound();
}

export function getAmbient() {
  return typeof window !== "undefined"
    ? (window as unknown as { __ambient?: AmbientSound }).__ambient
    : undefined;
}
