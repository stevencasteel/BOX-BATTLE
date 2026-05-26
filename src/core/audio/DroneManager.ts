import * as Tone from "tone";
import { AudioContextManager } from "./AudioContextManager";
import { MusicSequencer } from "./MusicSequencer";

export class DroneManager {
  private ctxManager: AudioContextManager;
  private musicSeq: MusicSequencer;
  private panner!: Tone.Panner;

  private healOsc!: Tone.Oscillator;
  private healOscSub!: Tone.Oscillator;
  private healFilter!: Tone.Filter;
  private healLfo!: Tone.LFO;
  private healGain!: Tone.Gain;
  private isHealDroneRunning: boolean = false;

  private chargeOsc!: Tone.Oscillator;
  private chargeFilter!: Tone.Filter;
  private chargeLfo!: Tone.LFO;
  private chargeGain!: Tone.Gain;
  private isChargeDroneRunning: boolean = false;
  private currentChargeLevel: number = 0;

  private heartbeatSynth!: Tone.MembraneSynth;
  private heartbeatLoop!: Tone.Loop;
  private isHeartbeatRunning: boolean = false;

  constructor(ctxManager: AudioContextManager, musicSeq: MusicSequencer) {
    this.ctxManager = ctxManager;
    this.musicSeq = musicSeq;
    this.ctxManager.registerOnInit(() => this.init());
  }

  private init() {
    this.panner = new Tone.Panner(0).connect(this.ctxManager.sfxGain);

    this.healOsc = new Tone.Oscillator({ type: "sawtooth", frequency: 110 }).start();
    this.healOscSub = new Tone.Oscillator({ type: "triangle", frequency: 55 }).start();
    this.healFilter = new Tone.Filter({ frequency: 220, type: "bandpass", Q: 7.0 });
    this.healLfo = new Tone.LFO({ frequency: 12.0, min: -150, max: 150 }).start();
    this.healGain = new Tone.Gain(0);

    this.healLfo.connect(this.healFilter.frequency);
    this.healOsc.connect(this.healFilter);
    this.healOscSub.connect(this.healFilter);
    this.healFilter.connect(this.healGain);
    this.healGain.connect(this.panner);

    this.chargeOsc = new Tone.Oscillator({ type: "sawtooth", frequency: 220 }).start();
    this.chargeFilter = new Tone.Filter({ frequency: 450, type: "lowpass", Q: 4.0 });
    this.chargeLfo = new Tone.LFO({ frequency: 5.5, min: -360, max: 360, type: "sine" }).start();
    this.chargeGain = new Tone.Gain(0);

    this.chargeLfo.connect(this.chargeFilter.frequency);
    this.chargeOsc.connect(this.chargeFilter);
    this.chargeFilter.connect(this.chargeGain);
    this.chargeGain.connect(this.panner);

    this.heartbeatSynth = new Tone.MembraneSynth({
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.15 },
      oscillator: { type: "sine" }
    }).connect(this.ctxManager.sfxGain);

    this.heartbeatLoop = new Tone.Loop((time) => {
      this.heartbeatSynth.triggerAttackRelease("A0", "8n", time);
      this.heartbeatSynth.triggerAttackRelease("G0", "8n", time + 0.18);
    }, "1.1s");
  }

  public playHealStart(x?: number) {
    if (!this.ctxManager.initialized) return;
    this.stopHealDrone();

    if (x !== undefined && this.panner) {
      this.panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), Tone.now());
    }

    const now = Tone.now();
    this.healOsc.frequency.setValueAtTime(110, now);
    this.healOscSub.frequency.setValueAtTime(55, now);
    this.healFilter.frequency.setValueAtTime(220, now);
    this.healLfo.frequency.setValueAtTime(12.0, now);
    this.healLfo.amplitude.setValueAtTime(150 / 350, now);
    this.healGain.gain.rampTo(0.35, 0.1);

    this.isHealDroneRunning = true;
  }

  public updateHealTimer(timer: number) {
    if (!this.ctxManager.initialized || !this.isHealDroneRunning) return;
    const now = Tone.now();
    
    // Strict clamp progress to normal range [0, 1]
    const progress = Math.max(0, Math.min(1.0, (2.0 - timer) / 2.0));

    const baseFreq = 110 + progress * 220;
    const subFreq = 55 + progress * 55;
    const filterFreq = 220 + Math.pow(progress, 1.5) * 1400;
    const lfoFreq = 12.0 + progress * 16.0;
    
    // Scale LFO amplitude safely and clamp to [0, 1] normal range
    const lfoAmp = Math.max(0, Math.min(1.0, 0.42 + progress * 0.45));

    this.healOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.healOscSub.frequency.setTargetAtTime(subFreq, now, 0.05);
    this.healFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);
    this.healLfo.frequency.setTargetAtTime(lfoFreq, now, 0.05);
    this.healLfo.amplitude.setTargetAtTime(lfoAmp, now, 0.05);
    
    // Clamp output gain value to [0, 1] normal range
    const gainVal = Math.max(0, Math.min(1.0, 0.35 + progress * 0.25));
    this.healGain.gain.setTargetAtTime(gainVal, now, 0.05);
  }

  public stopHealDrone() {
    if (!this.ctxManager.initialized || !this.isHealDroneRunning) return;
    const now = Tone.now();
    this.healGain.gain.cancelScheduledValues(now);
    this.healGain.gain.setValueAtTime(this.healGain.gain.value, now);
    this.healGain.gain.rampTo(0, 0.12);
    this.isHealDroneRunning = false;
  }

  public playHealComplete() {
    this.stopHealDrone();
    if (!this.ctxManager.initialized) return;

    const now = Tone.now();
    const chimeNotes = ["C5", "Eb5", "G5", "C6", "Eb6"];
    chimeNotes.forEach((note, idx) => {
      this.musicSeq.musicArpSynth.triggerAttackRelease(note, "2n", now + idx * 0.03);
    });

    const impactSynth = new Tone.MembraneSynth({
      envelope: { attack: 0.001, decay: 0.8, sustain: 0, release: 0.4 },
      oscillator: { type: "sawtooth" }
    }).connect(this.ctxManager.sfxGain);

    impactSynth.triggerAttackRelease("C1", "2n", now);
    setTimeout(() => {
      impactSynth.dispose();
    }, 2000);
  }

  public playChargeStart(x?: number) {
    if (!this.ctxManager.initialized) return;
    this.stopChargeDrone();

    if (x !== undefined && this.panner) {
      this.panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), Tone.now());
    }

    const now = Tone.now();

    this.chargeOsc.frequency.setValueAtTime(220, now);
    this.chargeFilter.frequency.setValueAtTime(450, now);
    this.chargeLfo.frequency.setValueAtTime(5.5, now);
    this.chargeLfo.amplitude.setValueAtTime(110 / 360, now);
    this.chargeGain.gain.setValueAtTime(0.18, now);

    this.isChargeDroneRunning = true;
    this.currentChargeLevel = 0;
  }

  public updateChargeTimer(timer: number) {
    if (!this.ctxManager.initialized || !this.isChargeDroneRunning) return;
    const now = Tone.now();

    if (timer < 0.25) {
      const progress = timer / 0.25;
      this.chargeOsc.frequency.setTargetAtTime(220 + progress * 100, now, 0.05);
      this.chargeFilter.frequency.setTargetAtTime(450 + progress * 150, now, 0.05);
      this.chargeLfo.frequency.setTargetAtTime(6.0, now, 0.05);
      this.chargeLfo.amplitude.setTargetAtTime(110 / 360, now, 0.05);
      this.chargeGain.gain.setTargetAtTime(0.25, now, 0.05);
    } else if (timer >= 0.25 && timer < 1.12) {
      this.currentChargeLevel = 1;
      const range = (timer - 0.25) / (1.12 - 0.25);

      this.chargeOsc.frequency.setTargetAtTime(320 + range * 120, now, 0.06);
      this.chargeFilter.frequency.setTargetAtTime(600 + range * 250, now, 0.06);
      this.chargeLfo.frequency.setTargetAtTime(6.0 + range * 4.0, now, 0.06);
      this.chargeLfo.amplitude.setTargetAtTime((120 + range * 120) / 360, now, 0.06);
      this.chargeGain.gain.setTargetAtTime(0.45, now, 0.05);
    } else if (timer >= 1.12) {
      if (this.currentChargeLevel < 2) {
        this.currentChargeLevel = 2;
      }
      const vibration = Math.sin(now * 30) * 8;
      this.chargeOsc.frequency.setTargetAtTime(660 + vibration, now, 0.08);
      this.chargeFilter.frequency.setTargetAtTime(1500, now, 0.08);
      this.chargeLfo.frequency.setTargetAtTime(15.0, now, 0.08);
      this.chargeLfo.amplitude.setTargetAtTime(1.0, now, 0.08);
      this.chargeGain.gain.setTargetAtTime(0.35, now, 0.05);
    }
  }

  public stopChargeDrone() {
    if (!this.ctxManager.initialized || !this.isChargeDroneRunning) return;
    this.chargeGain.gain.rampTo(0, 0.08);
    this.isChargeDroneRunning = false;
    this.currentChargeLevel = 0;
  }

  public setHeartbeat(active: boolean) {
    if (!this.ctxManager.initialized || !this.heartbeatLoop) return;
    if (active === this.isHeartbeatRunning) return;
    this.isHeartbeatRunning = active;
    if (active) {
      this.heartbeatLoop.start(0);
    } else {
      this.heartbeatLoop.stop();
    }
  }
}
