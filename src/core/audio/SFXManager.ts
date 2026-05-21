import * as Tone from "tone";
import { AudioContextManager } from "./AudioContextManager";

export class SFXManager {
  private ctxManager: AudioContextManager;
  private lastTriggerTimes: Record<string, number> = {};

  private jumpSynth!: Tone.Synth;
  private slashSynth!: Tone.Synth;
  private pogoSynth!: Tone.Synth;
  private dashNoise!: Tone.Noise;
  private dashFilter!: Tone.Filter;
  private dashEnv!: Tone.AmplitudeEnvelope;
  private hitSynth!: Tone.MetalSynth;
  private hurtSynth!: Tone.MonoSynth;
  private spikeSynth!: Tone.Synth;
  private teleportSynth!: Tone.Synth;
  private dialogueSynthPlayer!: Tone.Synth;
  private dialogueSynthBoss!: Tone.Synth;

  constructor(ctxManager: AudioContextManager) {
    this.ctxManager = ctxManager;
    this.ctxManager.registerOnInit(() => this.init());
  }

  private init() {
    const sfxGain = this.ctxManager.sfxGain;

    this.jumpSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.12 }
    }).connect(sfxGain);

    this.slashSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.12 }
    }).connect(sfxGain);

    this.pogoSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(sfxGain);

    this.dashNoise = new Tone.Noise("white");
    this.dashFilter = new Tone.Filter({ frequency: 1400, type: "bandpass", Q: 2.5 });
    this.dashEnv = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.18,
      sustain: 0,
      release: 0.18
    });
    this.dashNoise.chain(this.dashFilter, this.dashEnv, sfxGain);
    this.dashNoise.start();

    this.hitSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.08 },
      harmonicity: 5.1,
      resonance: 4000
    }).connect(sfxGain);
    this.hitSynth.frequency.value = 440;

    this.hurtSynth = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      filter: { Q: 2.0, type: "lowpass", frequency: 280 },
      envelope: { attack: 0.01, decay: 0.16, sustain: 0, release: 0.16 },
      filterEnvelope: { attack: 0.01, decay: 0.16, sustain: 0, release: 0.16, baseFrequency: 280, octaves: -2 }
    }).connect(sfxGain);

    this.spikeSynth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.12 }
    }).connect(sfxGain);

    this.teleportSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.3 }
    }).connect(sfxGain);

    this.dialogueSynthPlayer = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 }
    }).connect(sfxGain);

    this.dialogueSynthBoss = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.07, sustain: 0, release: 0.07 }
    }).connect(sfxGain);
  }

  private checkThrottle(key: string, limitMs: number): boolean {
    const now = performance.now();
    const last = this.lastTriggerTimes[key] || 0;
    if (now - last < limitMs) {
      return false;
    }
    this.lastTriggerTimes[key] = now;
    return true;
  }

  public playBossTelegraph() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("boss_telegraph", 150)) return;

    const now = Tone.now();
    this.jumpSynth.triggerAttackRelease(320, "8n", now);
    this.jumpSynth.frequency.rampTo(680, 0.35);
  }

  public playBossLunge() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("boss_lunge", 200)) return;

    const now = Tone.now();
    this.hurtSynth.triggerAttackRelease(120, "2n", now);
    this.hurtSynth.frequency.rampTo(40, 0.45);
  }

  public playDashRecharge() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("dash_recharge", 150)) return;

    const now = Tone.now();
    this.jumpSynth.triggerAttackRelease("A5", "16n", now);
    this.jumpSynth.triggerAttackRelease("E6", "16n", now + 0.04);
  }

  public playBossSwipe() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("boss_swipe", 150)) return;

    this.hurtSynth.triggerAttackRelease(180, "8n");
    this.hurtSynth.frequency.rampTo(50, 0.22);
  }

  public playMinionSpawning() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("minion_spawn", 100)) return;

    this.teleportSynth.triggerAttackRelease(180, "4n");
    this.teleportSynth.frequency.rampTo(720, 0.3);
  }

  public playMinionDeconstruct() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("minion_deconstruct", 100)) return;

    this.hurtSynth.triggerAttackRelease(280, "4n");
    this.hurtSynth.frequency.rampTo(60, 0.28);
  }

  public playBossPhaseShift() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;

    this.hurtSynth.triggerAttackRelease(80, "2n");
    this.hurtSynth.frequency.rampTo(320, 0.8);
  }

  public playBossExplosion() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;

    const now = Tone.now();
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.25;
      this.hurtSynth.triggerAttackRelease(140 - i * 20, "4n", now + delay);
      this.hurtSynth.frequency.rampTo(40, 0.35);
    }
  }

  public playPlayerExplosion() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;

    this.hurtSynth.triggerAttackRelease(220, "2n");
    this.hurtSynth.frequency.rampTo(40, 0.8);
  }

  public playHealCancel() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;

    this.hurtSynth.triggerAttackRelease(180, "8n");
  }

  public playSpikeStrike() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("spike_strike", 80)) return;

    this.spikeSynth.triggerAttackRelease(1400, "16n");
    this.spikeSynth.frequency.rampTo(700, 0.12);
  }

  public playLanding() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("landing", 100)) return;

    this.pogoSynth.triggerAttackRelease(160, "8n");
    this.pogoSynth.frequency.rampTo(65, 0.11);

    const sfxGain = this.ctxManager.sfxGain;
    const noise = new Tone.Noise("white").start();
    const filter = new Tone.Filter({ frequency: 1100, type: "bandpass", Q: 2.0 });
    const env = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.08, sustain: 0, release: 0.08 });
    
    noise.chain(filter, env, sfxGain);
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
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;

    this.slashSynth.triggerAttackRelease(440, "8n");
    this.slashSynth.frequency.rampTo(160, 0.15);
  }

  public playFireballLvl2() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;

    this.hurtSynth.triggerAttackRelease(220, "4n");
    this.hurtSynth.frequency.rampTo(80, 0.25);
  }

  public playJump() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("jump", 100)) return;

    this.jumpSynth.triggerAttackRelease(240, "8n");
    this.jumpSynth.frequency.rampTo(580, 0.12);
  }

  public playDash() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("dash", 100)) return;

    this.dashEnv.triggerAttackRelease(0.18);
    this.dashFilter.frequency.setValueAtTime(1400, Tone.now());
    this.dashFilter.frequency.rampTo(500, 0.18);
  }

  public playSlash(direction: "side" | "up" | "down" = "side") {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;

    const now = Tone.now();
    const sfxGain = this.ctxManager.sfxGain;

    if (direction === "side") {
      if (!this.checkThrottle("slash_side", 80)) return;

      const noise = new Tone.Noise("white").start();
      const filter = new Tone.Filter({ frequency: 2200, type: "highpass" });
      const filter2 = new Tone.Filter({ frequency: 1600, type: "bandpass", Q: 1.0 });
      const env = new Tone.AmplitudeEnvelope({ attack: 0.005, decay: 0.15, sustain: 0, release: 0.15 });

      noise.chain(filter, filter2, env, sfxGain);
      
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
      if (!this.checkThrottle("slash_puff", 100)) return;

      this.pogoSynth.triggerAttackRelease(220, "8n", now);
      this.pogoSynth.frequency.rampTo(90, 0.15);

      const noise = new Tone.Noise("pink").start();
      const filter = new Tone.Filter({ frequency: 650, type: "bandpass", Q: 1.2 });
      const env = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.18, sustain: 0, release: 0.18 });

      noise.chain(filter, env, sfxGain);
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
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("hit_confirm", 40)) return;

    this.hitSynth.triggerAttackRelease("B5", "8n");
  }

  public playPogo() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("pogo", 80)) return;

    this.pogoSynth.triggerAttackRelease(320, "16n");
    this.pogoSynth.frequency.rampTo(140, 0.09);
  }

  public playHurt() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("hurt", 120)) return;

    this.hurtSynth.triggerAttackRelease(180, "8n");
    this.hurtSynth.frequency.rampTo(45, 0.16);
  }

  public playSelectTick() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("select_tick", 30)) return;

    this.dialogueSynthPlayer.triggerAttackRelease(620, "32n");
  }

  public playErrorTick() {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;
    if (!this.checkThrottle("error_tick", 30)) return;

    this.dialogueSynthBoss.triggerAttackRelease(105, "16n");
  }

  public playDialogueTick(speaker: "player" | "boss", char: string) {
    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized || !char) return;
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
}
