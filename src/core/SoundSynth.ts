import * as Tone from "tone";
import { settingsManager } from "@/core/SettingsManager";

interface FrictionVoice {
  source: Tone.Noise;
  filter: Tone.Filter;
  gain: Tone.Gain;
}

interface DroneVoice {
  osc: Tone.Oscillator;
  filter: Tone.Filter;
  gain: Tone.Gain;
}

class SoundSynth {
  private hasUserGestured: boolean = false;
  private initialized: boolean = false;

  // High-precision trigger timestamps for deduplication & throttling
  private lastTriggerTimes: Record<string, number> = {};

  // Master Output Bus Routing
  private masterVolume!: Tone.Volume;
  private sfxGain!: Tone.Volume;
  private musicGain!: Tone.Volume;
  private cabinetFilter!: Tone.Filter;
  private limiter!: Tone.Limiter;

  // Synthesizer Plucks, Sweeps, and Noises
  private jumpSynth!: Tone.Synth;
  private dashNoise!: Tone.Noise;
  private dashFilter!: Tone.Filter;
  private dashEnv!: Tone.AmplitudeEnvelope;
  private slashSynth!: Tone.Synth;
  private hitSynth!: Tone.MetalSynth;
  private pogoSynth!: Tone.Synth;
  private hurtSynth!: Tone.MonoSynth;
  private spikeSynth!: Tone.Synth;
  private dialogueSynthPlayer!: Tone.Synth;
  private dialogueSynthBoss!: Tone.Synth;
  private teleportSynth!: Tone.Synth;

  // Music Synthesizers & Space Effects
  private musicBassSynth!: Tone.MonoSynth;
  private musicArpSynth!: Tone.PolySynth;
  private bassSeq!: Tone.Sequence<string>;
  private arpSeq!: Tone.Sequence<string>;

  // Dynamic Real-time Voice Maps
  private activeSlides: Map<string, FrictionVoice> = new Map();
  private healDrone: DroneVoice | null = null;
  private chargeDrone: {
    osc: Tone.Oscillator;
    filter: Tone.Filter;
    lfo: Tone.LFO;
    gain: Tone.Gain;
  } | null = null;

  private currentChargeLevel: number = 0;
  private isMusicPlaying: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const resumeOnGesture = () => {
        this.hasUserGestured = true;
        this.resumeContext();

        window.removeEventListener("click", resumeOnGesture);
        window.removeEventListener("keydown", resumeOnGesture);
        window.removeEventListener("touchstart", resumeOnGesture);
        window.removeEventListener("mousedown", resumeOnGesture);
      };
      window.addEventListener("click", resumeOnGesture, { passive: true });
      window.addEventListener("keydown", resumeOnGesture, { passive: true });
      window.addEventListener("touchstart", resumeOnGesture, { passive: true });
      window.addEventListener("mousedown", resumeOnGesture, { passive: true });
    }
  }

  private init() {
    if (this.initialized) return;
    if (!this.hasUserGestured) return;

    // Guard immediately against infinite re-entrant loops during creation
    this.initialized = true;

    // 1. Initialize Global Outputs & Limiters in Silent Mode (-120 dB)
    this.masterVolume = new Tone.Volume(-120).toDestination();
    this.limiter = new Tone.Limiter(-12);

    this.cabinetFilter = new Tone.Filter({
      frequency: 20000,
      type: "lowpass",
      Q: 1.0
    });

    this.sfxGain = new Tone.Volume(-120);
    this.musicGain = new Tone.Volume(-120);

    // Wire outputs: [Channel] -> [Cabinet Lowpass Filter] -> [Limiter] -> [Master Out]
    this.sfxGain.chain(this.cabinetFilter, this.limiter, this.masterVolume);
    this.musicGain.chain(this.cabinetFilter, this.limiter, this.masterVolume);

    // 2. Initialize SFX Synthesizers
    this.jumpSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.12 }
    }).connect(this.sfxGain);

    this.slashSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.12 }
    }).connect(this.sfxGain);

    this.pogoSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(this.sfxGain);

    this.dashNoise = new Tone.Noise("white");
    this.dashFilter = new Tone.Filter({ frequency: 1400, type: "bandpass", Q: 2.5 });
    this.dashEnv = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.18,
      sustain: 0,
      release: 0.18
    });
    this.dashNoise.chain(this.dashFilter, this.dashEnv, this.sfxGain);
    this.dashNoise.start();

    this.hitSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.08 },
      harmonicity: 5.1,
      resonance: 4000
    }).connect(this.sfxGain);
    this.hitSynth.frequency.value = 440;

    this.hurtSynth = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      filter: { Q: 2.0, type: "lowpass", frequency: 280 },
      envelope: { attack: 0.01, decay: 0.16, sustain: 0, release: 0.16 },
      filterEnvelope: { attack: 0.01, decay: 0.16, sustain: 0, release: 0.16, baseFrequency: 280, octaves: -2 }
    }).connect(this.sfxGain);

    this.spikeSynth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.12 }
    }).connect(this.sfxGain);

    this.teleportSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.3 }
    }).connect(this.sfxGain);

    this.dialogueSynthPlayer = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 }
    }).connect(this.sfxGain);

    this.dialogueSynthBoss = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.07, sustain: 0, release: 0.07 }
    }).connect(this.sfxGain);

    // 3. Initialize Music Sequencer and Synthesizers
    this.musicBassSynth = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      filter: { type: "lowpass", frequency: 350, Q: 1.0 },
      envelope: { attack: 0.02, decay: 0.12, sustain: 0.4, release: 0.15 },
      filterEnvelope: { attack: 0.02, decay: 0.15, sustain: 0.3, release: 0.15, baseFrequency: 350, octaves: 1.5 }
    }).connect(this.musicGain);

    this.musicArpSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.25 }
    }).connect(this.musicGain);

    const delay = new Tone.FeedbackDelay("8n.", 0.35).connect(this.musicGain);
    this.musicArpSynth.connect(delay);

    this.setupMusicSequences();
    this.updateVolumes();

    // Start music loop if it was scheduled to play during boot
    if (this.isMusicPlaying) {
      this.bassSeq.start(0);
      this.arpSeq.start(0);
      Tone.getTransport().start();
      this.fadeInMusic(0.4); // Primed and snappy instant fade-in!
    }
  }

  private setupMusicSequences() {
    const bassNotes = ["C2", "C2", "D#2", "D#2", "F2", "F2", "A#1", "A#1"];
    this.bassSeq = new Tone.Sequence<string>(
      (time, note) => {
        this.musicBassSynth.triggerAttackRelease(note, "8n", time);
      },
      bassNotes,
      "4n"
    );

    const arpProgression = ["C4", "C4", "G3", "G3", "F3", "F3", "G#3", "A#3"];
    this.arpSeq = new Tone.Sequence<string>(
      (time, baseNote) => {
        const chord = (baseNote === "G3" || baseNote === "A#3")
          ? [baseNote, Tone.Frequency(baseNote).transpose(4).toNote(), Tone.Frequency(baseNote).transpose(7).toNote()]
          : [baseNote, Tone.Frequency(baseNote).transpose(3).toNote(), Tone.Frequency(baseNote).transpose(7).toNote()];

        chord.forEach((note, index) => {
          this.musicArpSynth.triggerAttackRelease(note, "8n", time + index * 0.05);
        });
      },
      arpProgression,
      "2n"
    );

    Tone.getTransport().bpm.value = 135;
  }

  // Returns true if the sound is allowed to play; false if throttled
  private checkThrottle(key: string, limitMs: number): boolean {
    const now = performance.now();
    const last = this.lastTriggerTimes[key] || 0;
    if (now - last < limitMs) {
      return false;
    }
    this.lastTriggerTimes[key] = now;
    return true;
  }

  public updateVolumes() {
    if (!this.initialized) return;

    const config = settingsManager.getAudio();

    // Clamp silences strictly to -120 dB to guarantee finite numbers (Web Audio API constraint)
    const masterDb = config.masterVolume <= 0 ? -120 : Tone.gainToDb(config.masterVolume * 0.35);
    const sfxDb = config.sfxVolume <= 0 ? -120 : Tone.gainToDb(config.sfxVolume * 0.85);
    const musicDb = config.musicVolume <= 0 ? -120 : Tone.gainToDb(config.musicVolume * 0.30);

    // Apply native mute states
    this.masterVolume.mute = config.masterMuted || config.masterVolume <= 0;
    this.sfxGain.mute = config.sfxMuted || config.sfxVolume <= 0;
    this.musicGain.mute = config.musicMuted || config.musicVolume <= 0;

    // Smoothly fade to the targets
    this.masterVolume.volume.setTargetAtTime(masterDb, Tone.now(), 0.05);
    this.sfxGain.volume.setTargetAtTime(sfxDb, Tone.now(), 0.05);
    this.musicGain.volume.setTargetAtTime(musicDb, Tone.now(), 0.05);
  }

  public setCabinetMuffle(active: boolean) {
    this.resumeContext();
    if (!this.initialized || !this.cabinetFilter) return;

    const targetFreq = active ? 600 : 20000;
    this.cabinetFilter.frequency.rampTo(targetFreq, 0.3);
  }

  public resumeContext() {
    if (this.hasUserGestured) {
      Tone.start();
      this.init();
      if (Tone.getContext().state === "suspended") {
        Tone.getContext().resume();
      }
    }
  }

  public handleEntitySlide(id: string, width: number, height: number, speed: number, shouldSlide: boolean) {
    if (!shouldSlide) {
      this.stopFrictionSlide(id);
      return;
    }

    this.resumeContext();
    if (!this.initialized) return;

    let voice = this.activeSlides.get(id);

    if (!voice) {
      // Scale lowpass cutoff frequency dynamically based on entity physical dimensions!
      const volume = width * height;
      const sizeFactor = Math.max(0.6, Math.min(1.8, 3200 / volume));
      const baseFreq = 800 * sizeFactor;

      // Warm, tactile "sandpaper" brown noise
      const source = new Tone.Noise("brown").start();
      const filter = new Tone.Filter({ frequency: baseFreq, type: "lowpass" });
      const gain = new Tone.Gain(0);

      source.chain(filter, gain, this.sfxGain);

      voice = { source, filter, gain };
      this.activeSlides.set(id, voice);
    }

    const maxSpeed = 450;
    const ratio = Math.min(1.0, speed / maxSpeed);
    const targetGain = ratio * 0.35; // Robust, highly satisfying walking scuff

    // Smoothly scale both gain and cutoff based on entity velocity
    voice.gain.gain.rampTo(targetGain, 0.05);

    // Scale current cutoff dynamically following speed ratio
    const volume = width * height;
    const sizeFactor = Math.max(0.6, Math.min(1.8, 3200 / volume));
    const baseFreq = 800 * sizeFactor;
    const targetCutoff = baseFreq * 0.5 + ratio * baseFreq * 0.75;

    voice.filter.frequency.rampTo(targetCutoff, 0.05);
  }

  private stopFrictionSlide(id: string) {
    const voice = this.activeSlides.get(id);
    if (!voice) return;

    const now = Tone.now();
    voice.gain.gain.setValueAtTime(0, now);

    const source = voice.source;
    const filter = voice.filter;
    const gain = voice.gain;

    setTimeout(() => {
      try {
        source.stop();
        source.disconnect();
        filter.disconnect();
        gain.disconnect();

        // Release Web Audio context memory to prevent node accumulation crashes
        source.dispose();
        filter.dispose();
        gain.dispose();
      } catch (err) {
        // Safe disposal
      }
    }, 80);

    this.activeSlides.delete(id);
  }

  public clearAllSlides() {
    const ids = Array.from(this.activeSlides.keys());
    for (const id of ids) {
      this.stopFrictionSlide(id);
    }
  }

  public playBossTelegraph() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("boss_telegraph", 150)) return;

    const now = Tone.now();
    this.jumpSynth.triggerAttackRelease(320, "8n", now);
    this.jumpSynth.frequency.rampTo(680, 0.35);
  }

  public playBossLunge() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("boss_lunge", 200)) return;

    const now = Tone.now();
    this.hurtSynth.triggerAttackRelease(120, "2n", now);
    this.hurtSynth.frequency.rampTo(40, 0.45);
  }

  public playDashRecharge() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("dash_recharge", 150)) return;

    const now = Tone.now();
    this.jumpSynth.triggerAttackRelease("A5", "16n", now);
    this.jumpSynth.triggerAttackRelease("E6", "16n", now + 0.04);
  }

  public playBossSwipe() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("boss_swipe", 150)) return;

    this.hurtSynth.triggerAttackRelease(180, "8n");
    this.hurtSynth.frequency.rampTo(50, 0.22);
  }

  public playMinionSpawning() {
    this.resumeContext();
    if (!this.initialized) return;
    // Deduplicate simultaneous spawns to clean up overlapping sound blasts
    if (!this.checkThrottle("minion_spawn", 100)) return;

    this.teleportSynth.triggerAttackRelease(180, "4n");
    this.teleportSynth.frequency.rampTo(720, 0.3);
  }

  public playMinionDeconstruct() {
    this.resumeContext();
    if (!this.initialized) return;
    // Deduplicate simultaneous deconstructions
    if (!this.checkThrottle("minion_deconstruct", 100)) return;

    this.hurtSynth.triggerAttackRelease(280, "4n");
    this.hurtSynth.frequency.rampTo(60, 0.28);
  }

  public playBossPhaseShift() {
    this.resumeContext();
    if (!this.initialized) return;

    this.hurtSynth.triggerAttackRelease(80, "2n");
    this.hurtSynth.frequency.rampTo(320, 0.8);
  }

  public playBossExplosion() {
    this.resumeContext();
    if (!this.initialized) return;

    const now = Tone.now();
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.25;
      this.hurtSynth.triggerAttackRelease(140 - i * 20, "4n", now + delay);
      this.hurtSynth.frequency.rampTo(40, 0.35);
    }
  }

  public playPlayerExplosion() {
    this.resumeContext();
    if (!this.initialized) return;

    this.hurtSynth.triggerAttackRelease(220, "2n");
    this.hurtSynth.frequency.rampTo(40, 0.8);
  }

  public playHealStart() {
    this.resumeContext();
    if (!this.initialized) return;
    this.stopHealDrone();

    const osc = new Tone.Oscillator({ type: "sine", frequency: 220 }).start();
    const filter = new Tone.Filter({ frequency: 440, type: "bandpass", Q: 3.0 });
    const gain = new Tone.Gain(0);

    osc.chain(filter, gain, this.sfxGain);

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

  public playChargeStart() {
    this.resumeContext();
    if (!this.initialized) return;
    this.stopChargeDrone();

    // Restored exact wobbly LFO-modulated Filter logic from custom synth
    const osc = new Tone.Oscillator({ type: "sawtooth", frequency: 220 }).start();
    const filter = new Tone.Filter({ frequency: 450, type: "lowpass", Q: 4.0 });
    const lfo = new Tone.LFO({ frequency: 5.5, min: -360, max: 360, type: "sine" }).start();
    const gain = new Tone.Gain(0.18); // Highly robust charging start gain!

    lfo.connect(filter.frequency);
    lfo.amplitude.setValueAtTime(110 / 360, Tone.now());

    osc.chain(filter, gain, this.sfxGain);

    this.chargeDrone = { osc, filter, lfo, gain };
    this.currentChargeLevel = 0;
  }

  public updateChargeTimer(timer: number) {
    if (!this.initialized || !this.chargeDrone) return;
    const { osc, filter, lfo, gain } = this.chargeDrone;
    const now = Tone.now();

    if (timer < 0.25) {
      const progress = timer / 0.25;
      osc.frequency.setTargetAtTime(220 + progress * 100, now, 0.05);
      filter.frequency.setTargetAtTime(450 + progress * 150, now, 0.05);
      lfo.frequency.setTargetAtTime(6.0, now, 0.05);
      lfo.amplitude.setTargetAtTime(120 / 360, now, 0.05);
      gain.gain.setTargetAtTime(0.25, now, 0.05); // Enhanced Stage 1 charging volume!
    } 
    else if (timer >= 0.25 && timer < 1.12) {
      this.currentChargeLevel = 1;
      const range = (timer - 0.25) / (1.12 - 0.25);
      
      osc.frequency.setTargetAtTime(320 + range * 120, now, 0.06);
      filter.frequency.setTargetAtTime(600 + range * 250, now, 0.06);
      lfo.frequency.setTargetAtTime(6.0 + range * 4.0, now, 0.06);
      lfo.amplitude.setTargetAtTime((120 + range * 120) / 360, now, 0.06);
      gain.gain.setTargetAtTime(0.45, now, 0.05); // Enhanced Stage 2 charging volume!
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
      gain.gain.setTargetAtTime(0.35, now, 0.05); // Enhanced fully charged volume!
    }
  }

  private playChargeCompleteDing() {
    if (!this.initialized) return;
    this.musicArpSynth.triggerAttackRelease("G6", "4n");
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
    this.resumeContext();
    if (!this.initialized) return;

    const chimeNotes = ["C5", "E5", "G5", "C6"];
    const now = Tone.now();

    chimeNotes.forEach((note, idx) => {
      this.musicArpSynth.triggerAttackRelease(note, "4n", now + idx * 0.05);
    });
  }

  public playHealCancel() {
    this.stopHealDrone();
    this.resumeContext();
    if (!this.initialized) return;

    this.hurtSynth.triggerAttackRelease(180, "8n");
  }

  public playSpikeStrike() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("spike_strike", 80)) return;

    this.spikeSynth.triggerAttackRelease(1400, "16n");
    this.spikeSynth.frequency.rampTo(700, 0.12);
  }

  public playLanding() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("landing", 100)) return;

    this.pogoSynth.triggerAttackRelease(160, "8n");
    this.pogoSynth.frequency.rampTo(65, 0.11);

    const noise = new Tone.Noise("white").start();
    const filter = new Tone.Filter({ frequency: 1100, type: "bandpass", Q: 2.0 });
    const env = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.08, sustain: 0, release: 0.08 });
    
    noise.chain(filter, env, this.sfxGain);
    env.triggerAttackRelease(0.08);

    setTimeout(() => {
      try {
        noise.stop();
        noise.disconnect();
        filter.disconnect();
        env.disconnect();

        noise.dispose();
        filter.dispose();
        env.dispose();
      } catch (err) {
        // Safe disposal
      }
    }, 150);
  }

  public playFireballLvl1() {
    this.resumeContext();
    if (!this.initialized) return;

    this.slashSynth.triggerAttackRelease(440, "8n");
    this.slashSynth.frequency.rampTo(160, 0.15);
  }

  public playFireballLvl2() {
    this.resumeContext();
    if (!this.initialized) return;

    this.hurtSynth.triggerAttackRelease(220, "4n");
    this.hurtSynth.frequency.rampTo(80, 0.25);
  }

  public playJump() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("jump", 100)) return;

    this.jumpSynth.triggerAttackRelease(240, "8n");
    this.jumpSynth.frequency.rampTo(580, 0.12);
  }

  public playDash() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("dash", 100)) return;

    this.dashEnv.triggerAttackRelease(0.18);
    this.dashFilter.frequency.setValueAtTime(1400, Tone.now());
    this.dashFilter.frequency.rampTo(500, 0.18);
  }

  public playSlash(direction: "side" | "up" | "down" = "side") {
    this.resumeContext();
    if (!this.initialized) return;

    const now = Tone.now();

    if (direction === "side") {
      if (!this.checkThrottle("slash_side", 80)) return;

      // Pure, high-fidelity non-tonal airy blade swish (no triangle synth pitches)
      const noise = new Tone.Noise("white").start();
      const filter = new Tone.Filter({ frequency: 2200, type: "highpass" });
      const filter2 = new Tone.Filter({ frequency: 1600, type: "bandpass", Q: 1.0 });
      const env = new Tone.AmplitudeEnvelope({ attack: 0.005, decay: 0.15, sustain: 0, release: 0.15 });

      noise.chain(filter, filter2, env, this.sfxGain);
      
      // Sweep highpass down to mimic speed deceleration
      filter.frequency.rampTo(1000, 0.14);
      env.triggerAttackRelease(0.15, now);

      setTimeout(() => {
        try {
          noise.stop();
          noise.disconnect();
          filter.disconnect();
          filter2.disconnect();
          env.disconnect();

          noise.dispose();
          filter.dispose();
          filter2.dispose();
          env.dispose();
        } catch (e) {
          // Safe disposal
        }
      }, 300);
    } else {
      // Overhead or Downward strike: pneumatic "puff" sound
      if (!this.checkThrottle("slash_puff", 100)) return;

      // 1. Lower pitch-drop sweep
      this.pogoSynth.triggerAttackRelease(220, "8n", now);
      this.pogoSynth.frequency.rampTo(90, 0.15);

      // 2. Soft, breathy pink noise pneumatic puff of air
      const noise = new Tone.Noise("pink").start();
      const filter = new Tone.Filter({ frequency: 650, type: "bandpass", Q: 1.2 });
      const env = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.18, sustain: 0, release: 0.18 });

      noise.chain(filter, env, this.sfxGain);
      env.triggerAttackRelease(0.18, now);

      setTimeout(() => {
        try {
          noise.stop();
          noise.disconnect();
          filter.disconnect();
          env.disconnect();

          noise.dispose();
          filter.dispose();
          env.dispose();
        } catch (e) {
          // Safe disposal
        }
      }, 300);
    }
  }

  public playHitConfirm() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("hit_confirm", 40)) return;

    this.hitSynth.triggerAttackRelease("B5", "8n");
  }

  public playPogo() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("pogo", 80)) return;

    this.pogoSynth.triggerAttackRelease(320, "16n");
    this.pogoSynth.frequency.rampTo(140, 0.09);
  }

  public playHurt() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("hurt", 120)) return;

    this.hurtSynth.triggerAttackRelease(180, "8n");
    this.hurtSynth.frequency.rampTo(45, 0.16);
  }

  public playSelectTick() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("select_tick", 30)) return;

    this.dialogueSynthPlayer.triggerAttackRelease(620, "32n");
  }

  public playErrorTick() {
    this.resumeContext();
    if (!this.initialized) return;
    if (!this.checkThrottle("error_tick", 30)) return;

    this.dialogueSynthBoss.triggerAttackRelease(105, "16n");
  }

  public playDialogueTick(speaker: "player" | "boss", char: string) {
    this.resumeContext();
    if (!this.initialized || !char) return;
    if (!this.checkThrottle("dialogue_tick", 35)) return;

    const charCode = char.charCodeAt(0) || 65;
    const now = Tone.now();

    if (speaker === "player") {
      const freq = 240 + (charCode % 6) * 35;
      this.dialogueSynthPlayer.triggerAttackRelease(freq, "32n", now);
    } else {
      const freq = 70 + (charCode % 5) * 12;
      this.dialogueSynthBoss.triggerAttackRelease(freq, "24n", now);
    }
  }

  public fadeOutMusic(duration: number = 1.5) {
    if (!this.initialized || !this.isMusicPlaying) return;
    this.musicGain.volume.rampTo(-120, duration);
    setTimeout(() => {
      this.stopMusic();
      this.updateVolumes();
    }, duration * 1000 + 100);
  }

  public fadeInMusic(duration: number = 0.4) {
    if (!this.initialized || !this.isMusicPlaying) return;
    const config = settingsManager.getAudio();
    const targetDb = config.musicVolume <= 0 ? -120 : Tone.gainToDb(config.musicVolume * 0.30);
    
    this.musicGain.volume.setValueAtTime(-120, Tone.now());
    this.musicGain.volume.rampTo(targetDb, duration);
  }

  public startMusic() {
    this.resumeContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    if (this.initialized) {
      this.bassSeq.start(0);
      this.arpSeq.start(0);
      Tone.getTransport().start();
      this.fadeInMusic(0.4); // Primed, snappy instant fade-in on click
    }
  }

  public stopMusic() {
    if (this.initialized) {
      this.bassSeq.stop();
      this.arpSeq.stop();
      Tone.getTransport().stop();
    }
    this.isMusicPlaying = false;
  }
}

export const soundSynth = new SoundSynth();
