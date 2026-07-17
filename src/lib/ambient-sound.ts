"use client";

export type AudioBands = {
  bass: number;
  mid: number;
  treble: number;
  energy: number;
  bassHit: number;
  midFlow: number;
  trebleSpark: number;
  energyLift: number;
};

type EnabledCallback = (enabled: boolean) => void;
type AnalysisCallback = (bands: AudioBands) => void;
type TrackCallback = (track: AmbientTrack) => void;

export type AmbientTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
};

export const AMBIENT_TRACKS: readonly AmbientTrack[] = [
  {
    id: "guitar-afro-beat",
    title: "Guitar Afro Beat",
    artist: "Aexbeats",
    src: "/sounds/aexbeats-guitar-afro-beat-554799.mp3",
  },
  {
    id: "duro",
    title: "Duro",
    artist: "Kontraa",
    src: "/sounds/kontraa-duro-afro-music-278978.mp3",
  },
  {
    id: "unlock-me",
    title: "Unlock Me",
    artist: "Kontraa",
    src: "/sounds/kontraa-unlock-me-amapiano-music-149058.mp3",
  },
  {
    id: "milligram",
    title: "Milligram",
    artist: "Yellowbirdbeats",
    src: "/sounds/yellowbirdbeats-afro-smooth-x-afropop-x-afrobeat-chill-afro-beat-milligram-331758.mp3",
  },
];

const EMPTY_BANDS: AudioBands = {
  bass: 0,
  mid: 0,
  treble: 0,
  energy: 0,
  bassHit: 0,
  midFlow: 0,
  trebleSpark: 0,
  energyLift: 0,
};
const ANALYSIS_INTERVAL_MS = 1000 / 30;
const shapeBand = (value: number, gain: number) =>
  value <= 0 ? 0 : Math.min(1, Math.pow(value, 0.72) * gain);

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
  private lastAnalysisAt = 0;
  private trackIndex = Math.floor(Math.random() * AMBIENT_TRACKS.length);
  private shuffleBag: number[] = [];
  private trackChangeToken = 0;
  private bands: AudioBands = { ...EMPTY_BANDS };
  private subscribers = new Set<EnabledCallback>();
  private analysisSubscribers = new Set<AnalysisCallback>();
  private trackSubscribers = new Set<TrackCallback>();

  isEnabled() {
    return this.enabled;
  }

  getTracks() {
    return AMBIENT_TRACKS;
  }

  getCurrentTrack() {
    return AMBIENT_TRACKS[this.trackIndex] ?? AMBIENT_TRACKS[0];
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

  subscribeTrack(callback: TrackCallback) {
    this.trackSubscribers.add(callback);
    callback(this.getCurrentTrack());
    return () => {
      this.trackSubscribers.delete(callback);
    };
  }

  private notify() {
    this.subscribers.forEach((callback) => callback(this.enabled));
  }

  private notifyTrack() {
    const track = this.getCurrentTrack();
    this.trackSubscribers.forEach((callback) => callback(track));
  }

  private notifyAnalysis() {
    const root = document.documentElement;
    root.style.setProperty("--music-bass", this.bands.bass.toFixed(3));
    root.style.setProperty("--music-mid", this.bands.mid.toFixed(3));
    root.style.setProperty("--music-treble", this.bands.treble.toFixed(3));
    root.style.setProperty("--music-bass-hit", this.bands.bassHit.toFixed(3));
    root.style.setProperty("--music-mid-flow", this.bands.midFlow.toFixed(3));
    root.style.setProperty(
      "--music-treble-spark",
      this.bands.trebleSpark.toFixed(3)
    );
    root.style.setProperty(
      "--music-energy-lift",
      this.bands.energyLift.toFixed(3)
    );
    root.style.setProperty(
      "--music-glow",
      `${Math.round(4 + this.bands.energyLift * 30)}px`
    );
    root.style.setProperty(
      "--music-title-glow",
      `${Math.round(3 + this.bands.energyLift * 27 + this.bands.trebleSpark * 13)}px`
    );
    const nextReactive =
      this.enabled && this.bands.energy > 0.025 ? "true" : "false";
    if (root.dataset.musicReactive !== nextReactive) {
      root.dataset.musicReactive = nextReactive;
    }
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

    const audio = new Audio(this.getCurrentTrack().src);
    audio.loop = false;
    audio.preload = "auto";
    audio.addEventListener("error", this.handleAudioError);
    audio.addEventListener("ended", this.handleTrackEnded);

    const source = this.ctx.createMediaElementSource(audio);
    const master = this.ctx.createGain();
    const analyser = this.ctx.createAnalyser();

    master.gain.value = 0;
    analyser.fftSize = 2048;
    // Conserva continuidad, pero deja pasar los golpes y detalles rítmicos.
    analyser.smoothingTimeConstant = 0.72;

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

  private readonly handleTrackEnded = () => {
    if (!this.wantsPlayback) return;
    const nextIndex = this.takeRandomTrackIndex();
    void this.selectTrack(AMBIENT_TRACKS[nextIndex].id);
  };

  private refillShuffleBag() {
    const candidates = AMBIENT_TRACKS.map((_, index) => index).filter(
      (index) => index !== this.trackIndex
    );
    for (let index = candidates.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [candidates[index], candidates[target]] = [
        candidates[target],
        candidates[index],
      ];
    }
    this.shuffleBag = candidates;
  }

  private takeRandomTrackIndex() {
    if (this.shuffleBag.length === 0) this.refillShuffleBag();
    return this.shuffleBag.pop() ?? this.trackIndex;
  }

  async selectTrack(trackId: string) {
    const nextIndex = AMBIENT_TRACKS.findIndex(
      (track) => track.id === trackId
    );
    if (nextIndex < 0 || nextIndex === this.trackIndex) return;

    const token = ++this.trackChangeToken;
    const shouldResume = this.enabled || this.wantsPlayback;

    if (shouldResume && this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + 0.12);
      await new Promise((resolve) => window.setTimeout(resolve, 135));
      if (token !== this.trackChangeToken) return;
    }

    this.trackIndex = nextIndex;
    this.shuffleBag = this.shuffleBag.filter((index) => index !== nextIndex);
    const track = this.getCurrentTrack();

    if (this.audio) {
      this.audio.pause();
      this.audio.src = track.src;
      this.audio.load();
    }
    this.notifyTrack();

    if (!shouldResume || !this.audio) return;

    try {
      if (this.ctx?.state === "suspended") {
        await this.ctx.resume();
      }
      await this.audio.play();
      if (token !== this.trackChangeToken) return;
      if (this.ctx && this.master) {
        const now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(0, now);
        this.master.gain.linearRampToValueAtTime(0.16, now + 0.2);
      }
    } catch (error) {
      console.warn("AmbientSound: no se pudo cambiar de pista", error);
    }
  }

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

    this.lastAnalysisAt = 0;
    const tick = (timestamp: number) => {
      this.analysisFrame = null;
      if (!this.enabled || document.hidden || !this.analyser || !this.frequencyData) {
        return;
      }

      // Treinta muestras visuales por segundo conservan el pulso musical y
      // dejan margen de GPU/CPU para las transiciones y las escenas.
      if (
        this.lastAnalysisAt > 0 &&
        timestamp - this.lastAnalysisAt < ANALYSIS_INTERVAL_MS
      ) {
        this.analysisFrame = window.requestAnimationFrame(tick);
        return;
      }
      this.lastAnalysisAt = timestamp;

      this.analyser.getByteFrequencyData(this.frequencyData);
      const nextBands = {
        bass: this.readBand(32, 150),
        mid: this.readBand(150, 2_000),
        treble: this.readBand(2_000, 9_000),
      };

      const bass = this.smooth(this.bands.bass, nextBands.bass, 0.56);
      const mid = this.smooth(this.bands.mid, nextBands.mid, 0.38);
      const treble = this.smooth(this.bands.treble, nextBands.treble, 0.48);
      const energy = Math.min(
        1,
        bass * 0.52 + mid * 0.32 + treble * 0.16
      );
      this.bands = {
        bass,
        mid,
        treble,
        energy,
        bassHit: shapeBand(bass, 1.5),
        midFlow: shapeBand(mid, 1.6),
        trebleSpark: shapeBand(treble, 1.85),
        energyLift: shapeBand(energy, 1.55),
      };
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
    this.lastAnalysisAt = 0;
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

    let totalSquares = 0;
    for (let index = firstBin; index <= lastBin; index += 1) {
      const value = this.frequencyData[index];
      totalSquares += value * value;
    }

    const sampleCount = Math.max(1, lastBin - firstBin + 1);
    return Math.sqrt(totalSquares / sampleCount) / 255;
  }

  private smooth(current: number, next: number, amount: number) {
    return current + (next - current) * amount;
  }
}

const AMBIENT_VERSION = 2;
const globalWindow =
  typeof window !== "undefined"
    ? (window as unknown as {
        __ambient?: AmbientSound;
        __ambientVersion?: number;
      })
    : undefined;

if (
  globalWindow &&
  (!globalWindow.__ambient || globalWindow.__ambientVersion !== AMBIENT_VERSION)
) {
  if (globalWindow.__ambient?.isEnabled()) {
    void globalWindow.__ambient.disable();
  }
  globalWindow.__ambient = new AmbientSound();
  globalWindow.__ambientVersion = AMBIENT_VERSION;
}

export function getAmbient() {
  return typeof window !== "undefined"
    ? (
        window as unknown as {
          __ambient?: AmbientSound;
          __ambientVersion?: number;
        }
      ).__ambient
    : undefined;
}
