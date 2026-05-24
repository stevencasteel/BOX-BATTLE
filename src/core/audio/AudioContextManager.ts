import * as Tone from "tone";
import { settingsManager } from "@/core/SettingsManager";
import { UNITS } from "@/core/Units";

export class AudioContextManager {
  public hasUserGestured: boolean = false;
  public initialized: boolean = false;

  public masterVolume!: Tone.Volume;
  public sfxGain!: Tone.Volume;
  public musicGain!: Tone.Volume;
  public cabinetFilter!: Tone.Filter;
  public limiter!: Tone.Limiter;

  private onInitCallbacks: (() => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const resumeOnGesture = () => {
        this.hasUserGestured = true;
        this.resumeContext();

        window.removeEventListener("click", resumeOnGesture);
        window.removeEventListener("keydown", resumeOnGesture);
        window.removeEventListener("touchend", resumeOnGesture);
        window.removeEventListener("mousedown", resumeOnGesture);
      };
      window.addEventListener("click", resumeOnGesture);
      window.addEventListener("keydown", resumeOnGesture);
      window.addEventListener("touchend", resumeOnGesture);
      window.addEventListener("mousedown", resumeOnGesture);
    }
  }

  public registerOnInit(callback: () => void) {
    if (this.initialized) {
      callback();
    } else {
      this.onInitCallbacks.push(callback);
    }
  }

  public resumeContext(force = false) {
    if (force) {
      this.hasUserGestured = true;
    }
    if (this.hasUserGestured) {
      Tone.start();
      this.init();
      if (Tone.getContext().state === "suspended") {
        Tone.getContext().resume();
      }
    }
  }

  public getPanFromX(x: number): number {
    const clampedX = Math.max(0, Math.min(UNITS.WORLD_SIZE, x));
    const rawPan = clampedX / UNITS.WORLD_HALF_SIZE - 1.0;
    const scaledPan = rawPan * UNITS.AUDIO_MAX_PAN_SCALE;
    return Math.max(-UNITS.AUDIO_MAX_PAN_SCALE, Math.min(UNITS.AUDIO_MAX_PAN_SCALE, scaledPan));
  }

  private init() {
    if (this.initialized) return;
    if (!this.hasUserGestured) return;

    this.initialized = true;

    const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    Tone.getContext().lookAhead = isMobile ? 0.15 : 0.05;

    this.masterVolume = new Tone.Volume(-120).toDestination();
    this.limiter = new Tone.Limiter(-12);

    this.cabinetFilter = new Tone.Filter({
      frequency: 20000,
      type: "lowpass",
      Q: 1.0,
    });

    this.sfxGain = new Tone.Volume(-120);
    this.musicGain = new Tone.Volume(-120);

    this.sfxGain.chain(this.cabinetFilter, this.limiter, this.masterVolume);
    this.musicGain.chain(this.cabinetFilter, this.limiter, this.masterVolume);

    this.updateVolumes();

    for (const cb of this.onInitCallbacks) {
      cb();
    }
    this.onInitCallbacks = [];
  }

  public updateVolumes() {
    if (!this.initialized) return;

    const config = settingsManager.getAudio();

    const masterDb = config.masterVolume <= 0 ? -120 : Tone.gainToDb(config.masterVolume * 0.35);
    const sfxDb = config.sfxVolume <= 0 ? -120 : Tone.gainToDb(config.sfxVolume * 0.85);
    const musicDb = config.musicVolume <= 0 ? -120 : Tone.gainToDb(config.musicVolume * 0.3);

    this.masterVolume.mute = config.masterMuted || config.masterVolume <= 0;
    this.sfxGain.mute = config.sfxMuted || config.sfxVolume <= 0;
    this.musicGain.mute = config.musicMuted || config.musicVolume <= 0;

    this.masterVolume.volume.setTargetAtTime(masterDb, Tone.now(), 0.05);
    this.sfxGain.volume.setTargetAtTime(sfxDb, Tone.now(), 0.05);
    this.musicGain.volume.setTargetAtTime(musicDb, Tone.now(), 0.05);
  }

  public setCabinetMuffle(active: boolean) {
    if (!this.initialized || !this.cabinetFilter) return;

    const targetFreq = active ? 600 : 20000;
    this.cabinetFilter.frequency.rampTo(targetFreq, 0.3);
  }
}
