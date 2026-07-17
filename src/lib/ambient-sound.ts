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
  {
    id: "afro-beat",
    title: "Afro Beat",
    artist: "Instrumental",
    src: "/sounds/34606291-afro-beat-147339.mp3",
  },
  {
    id: "afrobeat-reggaeton",
    title: "Afrobeat Reggaeton",
    artist: "Instrumental",
    src: "/sounds/37660440-afrobeat-reggaeton-afro-type-beat-176797.mp3",
  },
  {
    id: "afrobeat-dancehall",
    title: "Afrobeat Dancehall",
    artist: "Instrumental",
    src: "/sounds/37660440-afrobeat-x-afro-type-beat-x-dancehall-beat-instrumental-162906.mp3",
  },
  {
    id: "afro-drill-pop",
    title: "Afro Drill Pop",
    artist: "OneSevenBeatxs",
    src: "/sounds/onesevenbeatxs-afro-drill-pop-commercial-rap-beatprod-by-onesevenbeatxs-311100.mp3",
  },
  {
    id: "afro-trap-brass",
    title: "Afro Trap — Guitar & Brass",
    artist: "Yellowbirdbeats",
    src: "/sounds/yellowbirdbeats-afro-x-afro-trap-guitar-amp-brass-trumpet-chill-grotesque-311676.mp3",
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
const ANALYSIS_FPS = 24;
const ANALYSIS_FPS_COARSE = 20;
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
  private lastCssValues = ["", "", "", ""];
  private trackIndex = Math.floor(Math.random() * AMBIENT_TRACKS.length);
  private shuffleBag: number[] = [];
  private trackChangeToken = 0;
  private failedTrackIndexes = new Set<number>();
  private bands: AudioBands = { ...EMPTY_BANDS };
  private subscribers = new Set<EnabledCallback>();
  private analysisSubscribers = new Set<AnalysisCallback>();
  private trackSubscribers = new Set<TrackCallback>();

  isEnabled() {
    return this.enabled;
  }

  isPlaybackRequested() {
    return this.enabled || this.wantsPlayback;
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

  private notifyAnalysis(forceCss = false) {
    const root = document.documentElement;
    // Durante un cambio de pantalla hay dos composiciones superpuestas.
    // Conservamos la última luz publicada para no repintar ambos titulares
    // gigantes 30 veces por segundo; Three.js sigue recibiendo las bandas.
    if (
      forceCss ||
      (root.dataset.screenTransition !== "true" &&
        root.dataset.projectTransition !== "true")
    ) {
      // Dos decimales dan 100 pasos visuales por banda. La cuantización evita
      // invalidar estilos globales cuando una muestra apenas cambió.
      const cssValues = [
        this.bands.bassHit,
        this.bands.midFlow,
        this.bands.trebleSpark,
        this.bands.energyLift,
      ].map((value) => value.toFixed(2));
      const cssVariables = [
        "--music-bass-hit",
        "--music-mid-flow",
        "--music-treble-spark",
        "--music-energy-lift",
      ] as const;
      cssVariables.forEach((variable, index) => {
        if (forceCss || cssValues[index] !== this.lastCssValues[index]) {
          root.style.setProperty(variable, cssValues[index]);
          this.lastCssValues[index] = cssValues[index];
        }
      });
      const nextReactive =
        this.enabled && this.bands.energy > 0.025 ? "true" : "false";
      if (root.dataset.musicReactive !== nextReactive) {
        root.dataset.musicReactive = nextReactive;
      }
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
    analyser.fftSize = 1024;
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
    this.failedTrackIndexes.add(this.trackIndex);

    if (this.failedTrackIndexes.size < AMBIENT_TRACKS.length) {
      const nextIndex = this.takeRandomTrackIndex();
      if (nextIndex !== this.trackIndex) {
        void this.selectTrack(AMBIENT_TRACKS[nextIndex].id);
        return;
      }
    }

    this.trackChangeToken += 1;
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
    let candidates = AMBIENT_TRACKS.map((_, index) => index).filter(
      (index) =>
        index !== this.trackIndex && !this.failedTrackIndexes.has(index)
    );
    if (candidates.length === 0) {
      this.failedTrackIndexes.clear();
      candidates = AMBIENT_TRACKS.map((_, index) => index).filter(
        (index) => index !== this.trackIndex
      );
    }
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
    this.shuffleBag = this.shuffleBag.filter(
      (index) =>
        index !== this.trackIndex && !this.failedTrackIndexes.has(index)
    );
    if (this.shuffleBag.length === 0) this.refillShuffleBag();
    return this.shuffleBag.pop() ?? this.trackIndex;
  }

  async selectTrack(trackId: string) {
    const nextIndex = AMBIENT_TRACKS.findIndex(
      (track) => track.id === trackId
    );
    if (nextIndex < 0) return false;

    const token = ++this.trackChangeToken;
    // Volver a elegir la pista visible también es una acción válida: cancela
    // cualquier cambio anterior y toma control del fade/reproducción actual.
    if (nextIndex === this.trackIndex) {
      return this.restoreCurrentTrack(token);
    }

    const shouldResume = this.enabled || this.wantsPlayback;

    if (shouldResume && this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + 0.12);
      await new Promise((resolve) => window.setTimeout(resolve, 135));
      if (
        token !== this.trackChangeToken ||
        (shouldResume && !this.wantsPlayback)
      ) {
        return false;
      }
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

    if (!shouldResume) return true;
    if (!this.audio || !this.wantsPlayback) return false;

    try {
      if (this.ctx?.state === "suspended") {
        await this.ctx.resume();
      }
      if (token !== this.trackChangeToken || !this.wantsPlayback) return false;
      await this.audio.play();
      if (token !== this.trackChangeToken || !this.wantsPlayback) {
        if (!this.wantsPlayback) this.audio.pause();
        return false;
      }
      if (this.ctx && this.master) {
        const now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(0, now);
        this.master.gain.linearRampToValueAtTime(0.16, now + 0.2);
      }
      this.failedTrackIndexes.delete(this.trackIndex);
      if (!this.enabled) {
        this.enabled = true;
        this.notify();
      }
      this.startAnalysis();
      return true;
    } catch (error) {
      if (token !== this.trackChangeToken) return false;
      this.wantsPlayback = false;
      this.enabled = false;
      this.stopAnalysis();
      this.notify();
      console.warn("AmbientSound: no se pudo cambiar de pista", error);
      return false;
    }
  }

  async enable() {
    if (this.enabled || this.wantsPlayback) return;
    const token = ++this.trackChangeToken;
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
      if (token !== this.trackChangeToken || !this.wantsPlayback) return;

      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0.16, now + 0.45);

      await this.audio.play();
      if (token !== this.trackChangeToken || !this.wantsPlayback) {
        if (!this.wantsPlayback) this.audio.pause();
        return;
      }

      this.enabled = true;
      this.failedTrackIndexes.delete(this.trackIndex);
      this.notify();
      this.startAnalysis();
    } catch (error) {
      if (token !== this.trackChangeToken) return;
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
    this.trackChangeToken += 1;
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

  private async restoreCurrentTrack(token: number) {
    // Si estaba apagado, la selección ya quedó confirmada. SoundToggle será
    // quien inicie la reproducción a partir del mismo gesto del usuario.
    if (!this.wantsPlayback) return true;

    try {
      this.createAudioGraph();
      if (!this.ctx || !this.master || !this.audio) return false;

      if (this.stopTimer !== null) {
        window.clearTimeout(this.stopTimer);
        this.stopTimer = null;
      }
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
      if (token !== this.trackChangeToken || !this.wantsPlayback) return false;

      await this.audio.play();
      if (token !== this.trackChangeToken || !this.wantsPlayback) {
        if (!this.wantsPlayback) this.audio.pause();
        return false;
      }

      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0.16, now + 0.18);
      this.failedTrackIndexes.delete(this.trackIndex);
      if (!this.enabled) {
        this.enabled = true;
        this.notify();
      }
      this.startAnalysis();
      return true;
    } catch (error) {
      if (token !== this.trackChangeToken) return false;
      this.wantsPlayback = false;
      this.enabled = false;
      this.stopAnalysis();
      this.notify();
      console.warn("AmbientSound: no se pudo reanudar la pista", error);
      return false;
    }
  }

  toggle() {
    if (this.enabled || this.wantsPlayback) {
      void this.disable();
      return;
    }
    void this.enable();
  }

  private startAnalysis() {
    if (this.enabled && !this.visibilityListening) {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
      this.visibilityListening = true;
    }

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

    this.lastAnalysisAt = 0;
    const analysisIntervalMs =
      1000 /
      (window.matchMedia("(pointer: coarse)").matches
        ? ANALYSIS_FPS_COARSE
        : ANALYSIS_FPS);
    const tick = (timestamp: number) => {
      this.analysisFrame = null;
      if (!this.enabled || document.hidden || !this.analyser || !this.frequencyData) {
        return;
      }

      // 24 fps en escritorio y 20 en táctil conservan el pulso sin obligar a
      // recalcular toda la cascada visual a la frecuencia del monitor.
      if (
        this.lastAnalysisAt > 0 &&
        timestamp - this.lastAnalysisAt < analysisIntervalMs
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
    this.notifyAnalysis(true);
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

const AMBIENT_VERSION = 6;
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
