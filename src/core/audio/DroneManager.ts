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
  }

  public playHealStart(x?: number) {
    if (!this.ctxManager.initialized) return;
    this.stopHealDrone();

    if (x !== undefined && this.panner) {
      this.panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), Tone.now());
    }

    const now = Tone.now();
    this.healRatchetThreshold = 0;
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

    // Play a mechanical pull-string winding click
    const elapsed = 2.0 - timer;
    if (elapsed > this.healRatchetThreshold) {
      const progress = Math.max(0, Math.min(1.0, elapsed / 2.0));
      const pitch = 220 + progress * 380; // Heavier woody mechanical click
      this.ratchetSynth.triggerAttackRelease(pitch, "32n", now);

      const interval = 0.18 - progress * 0.145; // Speed up click intervals as tension builds
      this.healRatchetThreshold = elapsed + interval;
    }
    
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

    // Fast mechanical zip-back / unwind ratchet sound on release
    for (let i = 0; i < 8; i++) {
      const delay = i * 0.022;
      const pitch = 550 - i * 60; // Descending mechanical ratchet clicks
      this.ratchetSynth.triggerAttackRelease(pitch, "32n", now + delay);
    }
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
    this.chargeRatchetThreshold = 0;

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

    // Play a rapid mechanical pull-string winding click
    if (timer > this.chargeRatchetThreshold) {
      const progress = Math.max(0, Math.min(1.0, timer / 1.12));
      const pitch = 380 + progress * 520; // High tension spring clicks
      this.ratchetSynth.triggerAttackRelease(pitch, "32n", now);

      const interval = 0.14 - progress * 0.105; // Speed up click intervals as tension builds
      this.chargeRatchetThreshold = timer + interval;
    }

    // Clamp progress safely to [0, 1] relative to the Level 2 max timer
    const progress = Math.max(0, Math.min(1.0, timer / 1.12));

    const baseFreq = 220 + progress * 440;
    const filterFreq = 450 + progress * 1200;
    const lfoFreq = 5.5 + progress * 16.0;
    
    // Clamp LFO amplitude strictly to NormalRange [0, 1] to prevent crashes
    const lfoAmp = Math.max(0, Math.min(1.0, 0.3 + progress * 0.7));

    this.chargeOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.chargeFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);
    this.chargeLfo.frequency.setTargetAtTime(lfoFreq, now, 0.05);
    this.chargeLfo.amplitude.setTargetAtTime(lfoAmp, now, 0.05);
    
    // Clamp output gain value to NormalRange [0, 1]
    const gainVal = Math.max(0, Math.min(1.0, 0.18 + progress * 0.32));
    this.chargeGain.gain.setTargetAtTime(gainVal, now, 0.05);
  }

  public stopChargeDrone() {
    if (!this.ctxManager.initialized || !this.isChargeDroneRunning) return;
    this.chargeGain.gain.rampTo(0, 0.08);
    this.isChargeDroneRunning = false;
    
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
