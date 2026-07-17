"use client";

export type AudioBands = {
  bass: number;
  mid: number;
  treble: number;
  energy: number;
};

type EnabledCallback = (enabled: boolean) => void;
type AnalysisCallback = (bands: AudioBands) => void;

const EMPTY_BANDS: AudioBands = { bass: 0, mid: 0, treble: 0, energy: 0 };
const TRACK_URL = "/sounds/kontraa-unlock-me-amapiano-music-149058.mp3";

class AmbientSound {
  private ctx: AudioContext | null = null;
  private audio: HTMLAudioElement | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> | null = null;
  private enabled = false;
  private wantsPlayback = false;
  private analysisFrame: number | null = null;
  private stopTimer: number | null = null;
  private visibilityListening = false;
  private bands: AudioBands = { ...EMPTY_BANDS };
  private subscribers = new Set<EnabledCallback>();
  private analysisSubscribers = new Set<AnalysisCallback>();

  isEnabled() {
    return this.enabled;
  }

  subscribe(callback: EnabledCallback) {
    this.subscribers.add(callback);
    callback(this.enabled);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  subscribeAnalysis(callback: AnalysisCallback) {
    this.analysisSubscribers.add(callback);
    callback(this.bands);
    return () => {
      this.analysisSubscribers.delete(callback);
    };
  }

  private notify() {
    this.subscribers.forEach((callback) => callback(this.enabled));
  }

  private notifyAnalysis() {
    const root = document.documentElement;
    root.style.setProperty("--music-bass", this.bands.bass.toFixed(3));
    root.style.setProperty("--music-mid", this.bands.mid.toFixed(3));
    root.style.setProperty("--music-treble", this.bands.treble.toFixed(3));
    root.style.setProperty("--music-glow", `${Math.round(4 + this.bands.energy * 18)}px`);
    root.style.setProperty("--music-scale", (1 + this.bands.bass * 0.22).toFixed(3));
    root.dataset.musicReactive =
      this.enabled && this.bands.energy > 0.025 ? "true" : "false";
    this.analysisSubscribers.forEach((callback) => callback(this.bands));
  }

  private createAudioGraph() {
    if (!this.ctx) {
      const AudioContextConstructor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioContextConstructor();
    }

    if (this.source && this.master && this.analyser && this.audio) return;

    const audio = new Audio(TRACK_URL);
    audio.loop = true;
    audio.preload = "auto";
    audio.addEventListener("error", this.handleAudioError);

    const source = this.ctx.createMediaElementSource(audio);
    const master = this.ctx.createGain();
    const analyser = this.ctx.createAnalyser();

    master.gain.value = 0;
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.84;

    source.connect(master);
    master.connect(analyser);
    analyser.connect(this.ctx.destination);

    this.audio = audio;
    this.source = source;
    this.master = master;
    this.analyser = analyser;
    this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
  }

  private readonly handleAudioError = () => {
    if (!this.wantsPlayback && !this.enabled) return;
    this.wantsPlayback = false;
    this.enabled = false;
    this.stopAnalysis();
    this.notify();
    console.warn("AmbientSound: no se pudo cargar la pista de música.");
  };

  async enable() {
    if (this.enabled || this.wantsPlayback) return;
    this.wantsPlayback = true;

    try {
      this.createAudioGraph();
      if (!this.ctx || !this.master || !this.audio) return;

      if (this.stopTimer !== null) {
        window.clearTimeout(this.stopTimer);
        this.stopTimer = null;
      }

      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0.16, now + 0.45);

      await this.audio.play();
      if (!this.wantsPlayback) {
        this.audio.pause();
        return;
      }

      this.enabled = true;
      this.notify();
      this.startAnalysis();
    } catch (error) {
      if (this.wantsPlayback) {
        console.warn("AmbientSound: no se pudo iniciar", error);
      }
      this.wantsPlayback = false;
      this.enabled = false;
      this.stopAnalysis();
      this.notify();
    }
  }

  async disable() {
    this.wantsPlayback = false;
    this.stopAnalysis();

    if (this.stopTimer !== null) {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    if (!this.ctx || !this.master) {
      this.audio?.pause();
      if (this.enabled) {
        this.enabled = false;
        this.notify();
      }
      return;
    }

    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.28);

    if (this.enabled) {
      this.enabled = false;
      this.notify();
    }

    this.stopTimer = window.setTimeout(() => {
      if (this.wantsPlayback) return;
      this.audio?.pause();
      void this.ctx?.suspend();
      this.stopTimer = null;
    }, 320);
  }

  toggle() {
    if (this.enabled || this.wantsPlayback) {
      void this.disable();
      return;
    }
    void this.enable();
  }

  private startAnalysis() {
    if (
      !this.enabled ||
      !this.ctx ||
      !this.analyser ||
      !this.frequencyData ||
      document.hidden ||
      this.analysisFrame !== null
    ) {
      return;
    }

    if (!this.visibilityListening) {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
      this.visibilityListening = true;
    }

    const tick = () => {
      this.analysisFrame = null;
      if (!this.enabled || document.hidden || !this.analyser || !this.frequencyData) {
        return;
      }

      this.analyser.getByteFrequencyData(this.frequencyData);
      const nextBands = {
        bass: this.readBand(32, 150),
        mid: this.readBand(150, 2_000),
        treble: this.readBand(2_000, 9_000),
      };

      this.bands = {
        bass: this.smooth(this.bands.bass, nextBands.bass, 0.42),
        mid: this.smooth(this.bands.mid, nextBands.mid, 0.3),
        treble: this.smooth(this.bands.treble, nextBands.treble, 0.36),
        energy: 0,
      };
      this.bands.energy = Math.min(
        1,
        this.bands.bass * 0.52 +
          this.bands.mid * 0.32 +
          this.bands.treble * 0.16
      );
      this.notifyAnalysis();
      this.analysisFrame = window.requestAnimationFrame(tick);
    };

    this.analysisFrame = window.requestAnimationFrame(tick);
  }

  private stopAnalysis(keepVisibilityListener = false) {
    if (this.analysisFrame !== null) {
      window.cancelAnimationFrame(this.analysisFrame);
      this.analysisFrame = null;
    }
    if (this.visibilityListening && !keepVisibilityListener) {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
      this.visibilityListening = false;
    }
    this.bands = { ...EMPTY_BANDS };
    this.notifyAnalysis();
  }

  private readonly handleVisibilityChange = () => {
    if (document.hidden) {
      this.stopAnalysis(true);
      return;
    }
    this.startAnalysis();
  };

  private readBand(startHz: number, endHz: number) {
    if (!this.ctx || !this.analyser || !this.frequencyData) return 0;

    const binWidth = this.ctx.sampleRate / this.analyser.fftSize;
    const firstBin = Math.max(0, Math.floor(startHz / binWidth));
    const lastBin = Math.min(
      this.frequencyData.length - 1,
      Math.ceil(endHz / binWidth)
    );

    let total = 0;
    for (let index = firstBin; index <= lastBin; index += 1) {
      total += this.frequencyData[index];
    }

    return total / Math.max(1, lastBin - firstBin + 1) / 255;
  }

  private smooth(current: number, next: number, amount: number) {
    return current + (next - current) * amount;
  }
}

const globalWindow =
  typeof window !== "undefined"
    ? (window as unknown as { __ambient?: AmbientSound })
    : undefined;

if (globalWindow && !globalWindow.__ambient) {
  globalWindow.__ambient = new AmbientSound();
}

export function getAmbient() {
  return typeof window !== "undefined"
    ? (window as unknown as { __ambient?: AmbientSound }).__ambient
    : undefined;
}
