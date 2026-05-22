import * as Tone from "tone";
import { AudioContextManager } from "./AudioContextManager";
import { MusicSequencer } from "./MusicSequencer";

interface DroneVoice {
  osc: Tone.Oscillator;
  filter: Tone.Filter;
  gain: Tone.Gain;
}

interface ChargeDrone {
  osc: Tone.Oscillator;
  filter: Tone.Filter;
  lfo: Tone.LFO;
  gain: Tone.Gain;
}

export class DroneManager {
  private ctxManager: AudioContextManager;
  private musicSeq: MusicSequencer;
  private panner!: Tone.Panner;

  private healDrone: DroneVoice | null = null;
  private chargeDrone: ChargeDrone | null = null;
  private currentChargeLevel: number = 0;

  constructor(ctxManager: AudioContextManager, musicSeq: MusicSequencer) {
    this.ctxManager = ctxManager;
    this.musicSeq = musicSeq;
    this.ctxManager.registerOnInit(() => this.init());
  }

  private init() {
    this.panner = new Tone.Panner(0).connect(this.ctxManager.sfxGain);
  }

  public playHealStart(x?: number) {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    this.stopHealDrone();

    if (x !== undefined && this.panner) {
      this.panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), Tone.now());
    }

    const osc = new Tone.Oscillator({ type: "sine", frequency: 220 }).start();
    const filter = new Tone.Filter({ frequency: 440, type: "bandpass", Q: 3.0 });
    const gain = new Tone.Gain(0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.panner);

    osc.frequency.rampTo(660, 2.0);
    filter.frequency.rampTo(1320, 2.0);
    gain.gain.rampTo(0.25, 0.15);

    this.healDrone = { osc, filter, gain };
  }

  public stopHealDrone() {
    if (!this.healDrone) return;
    const { osc, filter, gain } = this.healDrone;
    const now = Tone.now();

    gain.gain.setValueAtTime(0, now);
    setTimeout(() => {
      try {
        osc.stop();
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();

        osc.dispose();
        filter.dispose();
        gain.dispose();
      } catch (e) {
        // Safe disposal
      }
    }, 150);

    this.healDrone = null;
  }

  public playChargeStart(x?: number) {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    this.stopChargeDrone();

    if (x !== undefined && this.panner) {
      this.panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), Tone.now());
    }

    const osc = new Tone.Oscillator({ type: "sawtooth", frequency: 220 }).start();
    const filter = new Tone.Filter({ frequency: 450, type: "lowpass", Q: 4.0 });
    const lfo = new Tone.LFO({ frequency: 5.5, min: -360, max: 360, type: "sine" }).start();
    const gain = new Tone.Gain(0.18);

    lfo.connect(filter.frequency);
    lfo.amplitude.setValueAtTime(110 / 360, Tone.now());

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.panner);

    this.chargeDrone = { osc, filter, lfo, gain };
    this.currentChargeLevel = 0;
  }

  public updateChargeTimer(timer: number) {
    if (!this.ctxManager.initialized || !this.chargeDrone) return;
    const { osc, filter, lfo, gain } = this.chargeDrone;
    const now = Tone.now();

    if (timer < 0.25) {
      const progress = timer / 0.25;
      osc.frequency.setTargetAtTime(220 + progress * 100, now, 0.05);
      filter.frequency.setTargetAtTime(450 + progress * 150, now, 0.05);
      lfo.frequency.setTargetAtTime(6.0, now, 0.05);
      lfo.amplitude.setTargetAtTime(120 / 360, now, 0.05);
      gain.gain.setTargetAtTime(0.25, now, 0.05);
    } 
    else if (timer >= 0.25 && timer < 1.12) {
      this.currentChargeLevel = 1;
      const range = (timer - 0.25) / (1.12 - 0.25);
          
      osc.frequency.setTargetAtTime(320 + range * 120, now, 0.06);
      filter.frequency.setTargetAtTime(600 + range * 250, now, 0.06);
      lfo.frequency.setTargetAtTime(6.0 + range * 4.0, now, 0.06);
      lfo.amplitude.setTargetAtTime((120 + range * 120) / 360, now, 0.06);
      gain.gain.setTargetAtTime(0.45, now, 0.05);
    } 
    else if (timer >= 1.12) {
      if (this.currentChargeLevel < 2) {
        this.currentChargeLevel = 2;
        this.playChargeCompleteDing();
      }
      const vibration = Math.sin(now * 30) * 8;
      osc.frequency.setTargetAtTime(660 + vibration, now, 0.08);
      filter.frequency.setTargetAtTime(1500, now, 0.08);
      lfo.frequency.setTargetAtTime(15.0, now, 0.08);
      lfo.amplitude.setTargetAtTime(1.0, now, 0.08);
      gain.gain.setTargetAtTime(0.35, now, 0.05);
    }
  }

  private playChargeCompleteDing() {
    if (!this.ctxManager.initialized) return;
    this.musicSeq.musicArpSynth.triggerAttackRelease("G6", "4n");
  }

  public stopChargeDrone() {
    if (!this.chargeDrone) return;
    const { osc, filter, lfo, gain } = this.chargeDrone;
    const now = Tone.now();

    gain.gain.setValueAtTime(0, now);
    setTimeout(() => {
      try {
        osc.stop();
        lfo.stop();
        osc.disconnect();
        lfo.disconnect();
        filter.disconnect();
        gain.disconnect();

        osc.dispose();
        lfo.dispose();
        filter.dispose();
        gain.dispose();
      } catch (e) {
        // Safe disposal
      }
    }, 80);

    this.chargeDrone = null;
    this.currentChargeLevel = 0;
  }

  public playHealComplete() {
    this.stopHealDrone();
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;

    const chimeNotes = ["C5", "E5", "G5", "C6"];
    const now = Tone.now();

    chimeNotes.forEach((note, idx) => {
      this.musicSeq.musicArpSynth.triggerAttackRelease(note, "4n", now + idx * 0.05);
    });
  }
}
