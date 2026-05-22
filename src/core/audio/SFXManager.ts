import * as Tone from "tone";
import { AudioContextManager } from "./AudioContextManager";

export class SFXManager {
  private ctxManager: AudioContextManager;
  private lastTriggerTimes: Record<string, number> = {};

  private playerPanner!: Tone.Panner;
  private bossPanner!: Tone.Panner;
  private impactPanner!: Tone.Panner;
  private hurtPanner!: Tone.Panner;
  private playerDialoguePanner!: Tone.Panner;
  private bossDialoguePanner!: Tone.Panner;

  private jumpSynth!: Tone.Synth;
  private slashSynth!: Tone.Synth;
  private pogoSynth!: Tone.Synth;
  private dashNoise!: Tone.Noise;
  private dashFilter!: Tone.Filter;
  private dashEnv!: Tone.AmplitudeEnvelope;
  private hitSynth!: Tone.MetalSynth;
  private hurtSynth!: Tone.Synth;
  private spikeSynth!: Tone.Synth;
  private teleportSynth!: Tone.Synth;
  private dialogueSynthPlayer!: Tone.Synth;
  private dialogueSynthBoss!: Tone.Synth;

  /* Statically-allocated, leak-free noise pipelines */
  private landingNoise!: Tone.Noise;
  private landingFilter!: Tone.Filter;
  private landingEnv!: Tone.AmplitudeEnvelope;

  private slashNoiseSide!: Tone.Noise;
  private slashFilterSide!: Tone.Filter;
  private slashFilter2Side!: Tone.Filter;
  private slashEnvSide!: Tone.AmplitudeEnvelope;

  private slashNoisePuff!: Tone.Noise;
  private slashFilterPuff!: Tone.Filter;
  private slashEnvPuff!: Tone.AmplitudeEnvelope;

  constructor(ctxManager: AudioContextManager) {
    this.ctxManager = ctxManager;
    this.ctxManager.registerOnInit(() => this.init());
  }

  private init() {
    try {
      const sfxGain = this.ctxManager.sfxGain;

      this.playerPanner = new Tone.Panner(0).connect(sfxGain);
      this.bossPanner = new Tone.Panner(0).connect(sfxGain);
      this.impactPanner = new Tone.Panner(0).connect(sfxGain);
      this.hurtPanner = new Tone.Panner(0).connect(sfxGain);
      this.playerDialoguePanner = new Tone.Panner(-0.35).connect(sfxGain);
      this.bossDialoguePanner = new Tone.Panner(0.35).connect(sfxGain);

      this.jumpSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.12 }
      }).connect(this.playerPanner);

      this.slashSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.12 }
      }).connect(this.playerPanner);

      this.pogoSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
      }).connect(this.playerPanner);

      this.dashNoise = new Tone.Noise("white");
      this.dashFilter = new Tone.Filter({ frequency: 1400, type: "bandpass", Q: 2.5 });
      this.dashEnv = new Tone.AmplitudeEnvelope({
        attack: 0.01,
        decay: 0.18,
        sustain: 0,
        release: 0.18
      });
      this.dashNoise.chain(this.dashFilter, this.dashEnv, this.playerPanner);
      this.dashNoise.start();

      this.hitSynth = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.08, release: 0.08 },
        harmonicity: 5.1,
        resonance: 4000
      }).connect(this.impactPanner);
      this.hitSynth.frequency.value = 440;

      this.hurtSynth = new Tone.Synth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.01, decay: 0.16, sustain: 0, release: 0.16 }
      }).connect(this.hurtPanner);

      this.spikeSynth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.12 }
      }).connect(this.impactPanner);

      this.teleportSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.3 }
      }).connect(this.bossPanner);

      this.dialogueSynthPlayer = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 }
      }).connect(this.playerDialoguePanner);

      this.dialogueSynthBoss = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.07, sustain: 0, release: 0.07 }
      }).connect(this.bossDialoguePanner);

      /* Pre-allocated, zero-leak landing noise configuration */
      this.landingNoise = new Tone.Noise("white");
      this.landingFilter = new Tone.Filter({ frequency: 1100, type: "bandpass", Q: 2.0 });
      this.landingEnv = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.08, sustain: 0, release: 0.08 });
      this.landingNoise.chain(this.landingFilter, this.landingEnv, this.playerPanner);
      this.landingNoise.start();

      /* Pre-allocated, zero-leak side slash noise configuration */
      this.slashNoiseSide = new Tone.Noise("white");
      this.slashFilterSide = new Tone.Filter({ frequency: 2200, type: "highpass" });
      this.slashFilter2Side = new Tone.Filter({ frequency: 1600, type: "bandpass", Q: 1.0 });
      this.slashEnvSide = new Tone.AmplitudeEnvelope({ attack: 0.005, decay: 0.15, sustain: 0, release: 0.15 });
      this.slashNoiseSide.chain(this.slashFilterSide, this.slashFilter2Side, this.slashEnvSide, this.playerPanner);
      this.slashNoiseSide.start();

      /* Pre-allocated, zero-leak overhead/down slash noise configuration */
      this.slashNoisePuff = new Tone.Noise("pink");
      this.slashFilterPuff = new Tone.Filter({ frequency: 650, type: "bandpass", Q: 1.2 });
      this.slashEnvPuff = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.18, sustain: 0, release: 0.18 });
      this.slashNoisePuff.chain(this.slashFilterPuff, this.slashEnvPuff, this.playerPanner);
      this.slashNoisePuff.start();

    } catch (e) {
      console.warn("SFXManager failed to initialize synthetics:", e);
    }
  }

  /* Central unified play/pan execution logic wrapping safety and throttling constraints */
  private execute(
    key: string,
    throttleMs: number,
    x: number | undefined,
    panner: Tone.Panner | undefined,
    callback: (now: number) => void
  ): void {
    try {
      this.ctxManager.resumeContext();
      if (!this.ctxManager.initialized) return;
      if (!this.checkThrottle(key, throttleMs)) return;

      const now = Tone.now();
      if (x !== undefined && panner) {
        panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), now);
      }

      callback(now);
    } catch (e) {
      // Safe global exception boundary
    }
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

  public playBossTelegraph(x?: number) {
    this.execute("boss_telegraph", 150, x, this.bossPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(320, "8n", now);
      this.jumpSynth.frequency.rampTo(680, 0.35, now);
    });
  }

  public playBossLunge(x?: number) {
    this.execute("boss_lunge", 200, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(120, "2n", now);
      this.hurtSynth.frequency.rampTo(40, 0.45, now);
    });
  }

  public playDashRecharge(x?: number) {
    this.execute("dash_recharge", 150, x, this.playerPanner, (now) => {
      this.jumpSynth.triggerAttackRelease("A5", "16n", now);
      this.jumpSynth.triggerAttackRelease("E6", "16n", now + 0.04);
    });
  }

  public playBossSwipe(x?: number) {
    this.execute("boss_swipe", 150, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(180, "8n", now);
      this.hurtSynth.frequency.rampTo(50, 0.22, now);
    });
  }

  public playMinionSpawning(x?: number) {
    this.execute("minion_spawn", 100, x, this.bossPanner, (now) => {
      this.teleportSynth.triggerAttackRelease(180, "4n", now);
      this.teleportSynth.frequency.rampTo(720, 0.3, now);
    });
  }

  public playMinionDeconstruct(x?: number) {
    this.execute("minion_deconstruct", 100, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(280, "4n", now);
      this.hurtSynth.frequency.rampTo(60, 0.28, now);
    });
  }

  public playBossPhaseShift(x?: number) {
    this.execute("boss_phase_shift", 0, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(80, "2n", now);
      this.hurtSynth.frequency.rampTo(320, 0.8, now);
    });
  }

  public playBossExplosion(x?: number) {
    this.execute("boss_explosion", 0, x, this.bossPanner, (now) => {
      for (let i = 0; i < 3; i++) {
        const delay = i * 0.25;
        this.hurtSynth.triggerAttackRelease(140 - i * 20, "4n", now + delay);
        this.hurtSynth.frequency.rampTo(40, 0.35, now + delay);
      }
    });
  }

  public playPlayerExplosion(x?: number) {
    this.execute("player_explosion", 0, x, this.playerPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(220, "2n", now);
      this.hurtSynth.frequency.rampTo(40, 0.8, now);
    });
  }

  public playHealCancel(x?: number) {
    this.execute("heal_cancel", 0, x, this.playerPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(180, "8n", now);
    });
  }

  public playSpikeStrike(x?: number) {
    this.execute("spike_strike", 80, x, this.impactPanner, (now) => {
      this.spikeSynth.triggerAttackRelease(1400, "16n", now);
      this.spikeSynth.frequency.rampTo(700, 0.12, now);
    });
  }

  public playLanding(x?: number) {
    this.execute("landing", 100, x, this.playerPanner, (now) => {
      this.pogoSynth.triggerAttackRelease(160, "8n", now);
      this.pogoSynth.frequency.rampTo(65, 0.11, now);
      this.landingEnv.triggerAttackRelease(0.08, now);
    });
  }

  public playFireballLvl1(x?: number) {
    this.execute("fireball_lvl1", 0, x, this.playerPanner, (now) => {
      this.slashSynth.triggerAttackRelease(440, "8n", now);
      this.slashSynth.frequency.rampTo(160, 0.15, now);
    });
  }

  public playFireballLvl2(x?: number) {
    this.execute("fireball_lvl2", 0, x, this.playerPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(220, "4n", now);
      this.hurtSynth.frequency.rampTo(80, 0.25, now);
    });
  }

  public playJump(x?: number) {
    this.execute("jump", 100, x, this.playerPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(240, "8n", now);
      this.jumpSynth.frequency.rampTo(580, 0.12, now);
    });
  }

  public playDash(x?: number) {
    this.execute("dash", 100, x, this.playerPanner, (now) => {
      this.dashEnv.triggerAttackRelease(0.18, now);
      this.dashFilter.frequency.setValueAtTime(1400, now);
      this.dashFilter.frequency.rampTo(500, 0.18, now);
    });
  }

  public playSlash(direction: "side" | "up" | "down" = "side", x?: number) {
    if (direction === "side") {
      this.execute("slash_side", 80, x, this.playerPanner, (now) => {
        this.slashFilterSide.frequency.rampTo(1000, 0.14, now);
        this.slashEnvSide.triggerAttackRelease(0.15, now);
      });
    } else {
      this.execute("slash_puff", 100, x, this.playerPanner, (now) => {
        this.pogoSynth.triggerAttackRelease(220, "8n", now);
        this.pogoSynth.frequency.rampTo(90, 0.15, now);
        this.slashEnvPuff.triggerAttackRelease(0.18, now);
      });
    }
  }

  public playHitConfirm(x?: number) {
    this.execute("hit_confirm", 40, x, this.impactPanner, (now) => {
      this.hitSynth.triggerAttackRelease("C6", "16n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(880, "16n", now + 0.04);
    });
  }

  public playPogo(x?: number) {
    this.execute("pogo", 80, x, this.playerPanner, (now) => {
      this.pogoSynth.triggerAttackRelease(320, "16n", now);
      this.pogoSynth.frequency.rampTo(140, 0.09, now);
    });
  }

  public playHurt(x?: number) {
    this.execute("hurt", 120, x, this.hurtPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(180, "8n", now);
      this.hurtSynth.frequency.rampTo(45, 0.16, now);
    });
  }

  public playSelectTick() {
    this.execute("select_tick", 30, undefined, undefined, (now) => {
      this.dialogueSynthPlayer.triggerAttackRelease(950, "32n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(1400, "32n", now + 0.025);
    });
  }

  public playErrorTick() {
    this.execute("error_tick", 30, undefined, undefined, (now) => {
      this.dialogueSynthBoss.triggerAttackRelease(260, "16n", now);
      this.dialogueSynthBoss.triggerAttackRelease(160, "16n", now + 0.05);
    });
  }

  public playDialogueTick(speaker: "player" | "boss", char: string) {
    if (!char) return;
    this.execute("dialogue_tick", 35, undefined, undefined, (now) => {
      if (speaker === "player") {
        const freq = 240 + (char.charCodeAt(0) % 6) * 35;
        this.dialogueSynthPlayer.triggerAttackRelease(freq, "32n", now);
      } else {
        const freq = 70 + (char.charCodeAt(0) % 5) * 12;
        this.dialogueSynthBoss.triggerAttackRelease(freq, "24n", now);
      }
    });
  }
}
