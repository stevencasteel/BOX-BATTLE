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
  private chargeRatchetThreshold: number = 0;

  private healRatchetThreshold: number = 0;
  private ratchetSynth!: Tone.PolySynth;

  private heartbeatSynth!: Tone.MembraneSynth;
  private heartbeatLoop!: Tone.Loop;
  private isHeartbeatRunning: boolean = false;
  private lastHealProgress: number = -1;
  private lastChargeProgress: number = -1;
  private healImpactSynth!: Tone.MembraneSynth;

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

    this.ratchetSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.001, decay: 0.012, sustain: 0, release: 0.012 },
      volume: -6
    }).connect(this.panner);

    this.heartbeatSynth = new Tone.MembraneSynth({
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.15 },
      oscillator: { type: "sine" }
    }).connect(this.ctxManager.sfxGain);

    this.heartbeatLoop = new Tone.Loop((time) => {
      this.heartbeatSynth.triggerAttackRelease("A0", "8n", time);
      this.heartbeatSynth.triggerAttackRelease("G0", "8n", time + 0.18);
    }, "1.1s");

    this.healImpactSynth = new Tone.MembraneSynth({
      envelope: { attack: 0.001, decay: 0.8, sustain: 0, release: 0.4 },
      oscillator: { type: "sawtooth" }
    }).connect(this.ctxManager.sfxGain);
  }

  public playHealStart(x?: number) {
    if (!this.ctxManager.initialized) return;
    this.stopHealDrone();

    if (x !== undefined && this.panner) {
      this.panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), Tone.now());
    }

    const now = Tone.now();
    this.healRatchetThreshold = 0;
    this.lastHealProgress = 0;
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

    const elapsed = 2.0 - timer;
    if (elapsed > this.healRatchetThreshold) {
      const progressVal = Math.max(0, Math.min(1.0, elapsed / 2.0));
      const pitch = 220 + progressVal * 380;
      this.ratchetSynth.triggerAttackRelease(pitch, "32n", now);

      const interval = 0.18 - progressVal * 0.145;
      this.healRatchetThreshold = elapsed + interval;
    }
    
    const progress = Math.max(0, Math.min(1.0, (2.0 - timer) / 2.0));
    if (Math.abs(progress - this.lastHealProgress) < 0.04) {
      return;
    }
    this.lastHealProgress = progress;

    const baseFreq = 110 + progress * 220;
    const subFreq = 55 + progress * 55;
    const filterFreq = 220 + Math.pow(progress, 1.5) * 1400;
    const lfoFreq = 12.0 + progress * 16.0;
    
    const lfoAmp = Math.max(0, Math.min(1.0, 0.42 + progress * 0.45));

    this.healOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.healOscSub.frequency.setTargetAtTime(subFreq, now, 0.05);
    this.healFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);
    this.healLfo.frequency.setTargetAtTime(lfoFreq, now, 0.05);
    this.healLfo.amplitude.setTargetAtTime(lfoAmp, now, 0.05);
    
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
    this.lastHealProgress = -1;

    // Fast mechanical zip-back / unwind ratchet sound on release
    for (let i = 0; i < 8; i++) {
      const delay = i * 0.022;
      const pitch = 550 - i * 60; // Descending mechanical ratchet clicks
      this.ratchetSynth.triggerAttackRelease(pitch, "32n", now + delay);
    }
  }

  private lastHealImpactTime: number = 0;

  public playHealComplete() {
    this.stopHealDrone();
    if (!this.ctxManager.initialized) return;

    const now = Tone.now();
    const impactTime = Math.max(now, this.lastHealImpactTime + 0.001);
    this.lastHealImpactTime = impactTime;

    const chimeNotes = ["C5", "Eb5", "G5", "C6", "Eb6"];
    chimeNotes.forEach((note, idx) => {
      this.musicSeq.musicArpSynth.triggerAttackRelease(note, "2n", now + idx * 0.03);
    });

    this.healImpactSynth.triggerAttackRelease("C1", "2n", impactTime);
  }

  public playChargeStart(x?: number) {
    if (!this.ctxManager.initialized) return;
    this.stopChargeDrone();

    if (x !== undefined && this.panner) {
      this.panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), Tone.now());
    }

    const now = Tone.now();
    this.chargeRatchetThreshold = 0;
    this.lastChargeProgress = 0;

    this.chargeOsc.frequency.setValueAtTime(220, now);
    this.chargeFilter.frequency.setValueAtTime(450, now);
    this.chargeLfo.frequency.setValueAtTime(5.5, now);
    this.chargeLfo.amplitude.setValueAtTime(110 / 360, now);
    this.chargeGain.gain.setValueAtTime(0.18, now);

    this.isChargeDroneRunning = true;
  }

  public updateChargeTimer(timer: number) {
    if (!this.ctxManager.initialized || !this.isChargeDroneRunning) return;
    const now = Tone.now();

    if (timer > this.chargeRatchetThreshold) {
      const progressVal = Math.max(0, Math.min(1.0, timer / 1.12));
      const pitch = 380 + progressVal * 520;
      this.ratchetSynth.triggerAttackRelease(pitch, "32n", now);

      const interval = 0.14 - progressVal * 0.105;
      this.chargeRatchetThreshold = timer + interval;
    }

    const progress = Math.max(0, Math.min(1.0, timer / 1.12));
    if (Math.abs(progress - this.lastChargeProgress) < 0.04) {
      return;
    }
    this.lastChargeProgress = progress;

    const baseFreq = 220 + progress * 440;
    const filterFreq = 450 + progress * 1200;
    const lfoFreq = 5.5 + progress * 16.0;
    
    const lfoAmp = Math.max(0, Math.min(1.0, 0.3 + progress * 0.7));

    this.chargeOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.chargeFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);
    this.chargeLfo.frequency.setTargetAtTime(lfoFreq, now, 0.05);
    this.chargeLfo.amplitude.setTargetAtTime(lfoAmp, now, 0.05);
    
    const gainVal = Math.max(0, Math.min(1.0, 0.18 + progress * 0.32));
    this.chargeGain.gain.setTargetAtTime(gainVal, now, 0.05);
  }

  public stopChargeDrone() {
    if (!this.ctxManager.initialized || !this.isChargeDroneRunning) return;
    this.chargeGain.gain.rampTo(0, 0.08);
    this.isChargeDroneRunning = false;
    this.lastChargeProgress = -1;
    
    // Fast mechanical zip-back / unwind ratchet sound on release
    const now = Tone.now();
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.02;
      const pitch = 850 - i * 110; // Descending zip clicks
      this.ratchetSynth.triggerAttackRelease(pitch, "32n", now + delay);
    }
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
