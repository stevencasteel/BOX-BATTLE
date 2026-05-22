import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";

export class BossSFX {
  private helper: SFXHelper;
  private bossPanner!: Tone.Panner;
  private impactPanner!: Tone.Panner;
  private hurtPanner!: Tone.Panner;

  private jumpSynth!: Tone.Synth;
  private hurtSynth!: Tone.Synth;
  private hitSynth!: Tone.MetalSynth;
  private spikeSynth!: Tone.Synth;
  private teleportSynth!: Tone.Synth;
  private dialogueSynthPlayer!: Tone.Synth;

  constructor(ctxManager: AudioContextManager, helper: SFXHelper) {
    this.helper = helper;
    ctxManager.registerOnInit(() => this.init(ctxManager));
  }

  private init(ctxManager: AudioContextManager) {
    const sfxGain = ctxManager.sfxGain;

    this.bossPanner = new Tone.Panner(0).connect(sfxGain);
    this.impactPanner = new Tone.Panner(0).connect(sfxGain);
    this.hurtPanner = new Tone.Panner(0).connect(sfxGain);

    this.jumpSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.12 }
    }).connect(this.bossPanner);

    this.hurtSynth = new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.16, sustain: 0, release: 0.16 }
    }).connect(this.hurtPanner);

    this.hitSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.08 },
      harmonicity: 5.1,
      resonance: 4000
    }).connect(this.impactPanner);
    this.hitSynth.frequency.value = 440;

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
    }).connect(this.impactPanner);
  }

  public playBossTelegraph(x?: number) {
    this.helper.execute("boss_telegraph", 150, x, this.bossPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(320, "8n", now);
      this.jumpSynth.frequency.rampTo(680, 0.35, now);
    });
  }

  public playBossLunge(x?: number) {
    this.helper.execute("boss_lunge", 200, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(120, "2n", now);
      this.hurtSynth.frequency.rampTo(40, 0.45, now);
    });
  }

  public playBossSwipe(x?: number) {
    this.helper.execute("boss_swipe", 150, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(180, "8n", now);
      this.hurtSynth.frequency.rampTo(50, 0.22, now);
    });
  }

  public playMinionSpawning(x?: number) {
    this.helper.execute("minion_spawn", 100, x, this.bossPanner, (now) => {
      this.teleportSynth.triggerAttackRelease(180, "4n", now);
      this.teleportSynth.frequency.rampTo(720, 0.3, now);
    });
  }

  public playMinionDeconstruct(x?: number) {
    this.helper.execute("minion_deconstruct", 100, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(280, "4n", now);
      this.hurtSynth.frequency.rampTo(60, 0.28, now);
    });
  }

  public playBossPhaseShift(x?: number) {
    this.helper.execute("boss_phase_shift", 0, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(80, "2n", now);
      this.hurtSynth.frequency.rampTo(320, 0.8, now);
    });
  }

  public playBossExplosion(x?: number) {
    this.helper.execute("boss_explosion", 0, x, this.bossPanner, (now) => {
      for (let i = 0; i < 3; i++) {
        const delay = i * 0.25;
        this.hurtSynth.triggerAttackRelease(140 - i * 20, "4n", now + delay);
        this.hurtSynth.frequency.rampTo(40, 0.35, now + delay);
      }
    });
  }

  public playSpikeStrike(x?: number) {
    this.helper.execute("spike_strike", 80, x, this.impactPanner, (now) => {
      this.spikeSynth.triggerAttackRelease(1400, "16n", now);
      this.spikeSynth.frequency.rampTo(700, 0.12, now);
    });
  }

  public playHitConfirm(x?: number) {
    this.helper.execute("hit_confirm", 40, x, this.impactPanner, (now) => {
      this.hitSynth.triggerAttackRelease("C6", "16n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(880, "16n", now + 0.04);
    });
  }
}
