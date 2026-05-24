import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";
import { SFX_PRESETS } from "../sfxPresetData";

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

    const presets = SFX_PRESETS.boss;

    this.jumpSynth = new Tone.Synth({
      oscillator: { type: presets.telegraph.oscillatorType },
      envelope: { attack: 0.01, decay: presets.telegraph.decay, sustain: 0, release: presets.telegraph.decay },
    }).connect(this.bossPanner);

    this.hurtSynth = new Tone.Synth({
      oscillator: { type: presets.lunge.oscillatorType },
      envelope: { attack: 0.01, decay: presets.lunge.decay, sustain: 0, release: presets.lunge.decay },
    }).connect(this.hurtPanner);

    this.hitSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.08 },
      harmonicity: 5.1,
      resonance: 4000,
    }).connect(this.impactPanner);
    this.hitSynth.frequency.value = 440;

    this.spikeSynth = new Tone.Synth({
      oscillator: { type: presets.spike_strike.oscillatorType },
      envelope: { attack: 0.005, decay: presets.spike_strike.decay, sustain: 0, release: presets.spike_strike.decay },
    }).connect(this.impactPanner);

    this.teleportSynth = new Tone.Synth({
      oscillator: { type: presets.minion_spawn.oscillatorType },
      envelope: { attack: 0.05, decay: presets.minion_spawn.decay, sustain: 0, release: presets.minion_spawn.decay },
    }).connect(this.bossPanner);

    this.dialogueSynthPlayer = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 },
    }).connect(this.impactPanner);
  }

  public playBossTelegraph(x?: number) {
    const preset = SFX_PRESETS.boss.telegraph;
    this.helper.execute("boss_telegraph", 150, x, this.bossPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(preset.frequency, "8n", now);
      this.jumpSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playBossLunge(x?: number) {
    const preset = SFX_PRESETS.boss.lunge;
    this.helper.execute("boss_lunge", 200, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "2n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playBossSwipe(x?: number) {
    const preset = SFX_PRESETS.boss.swipe;
    this.helper.execute("boss_swipe", 150, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "8n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playMinionSpawning(x?: number) {
    const preset = SFX_PRESETS.boss.minion_spawn;
    this.helper.execute("minion_spawn", 100, x, this.bossPanner, (now) => {
      this.teleportSynth.triggerAttackRelease(preset.frequency, "4n", now);
      this.teleportSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playMinionDeconstruct(x?: number) {
    const preset = SFX_PRESETS.boss.minion_deconstruct;
    this.helper.execute("minion_deconstruct", 100, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "4n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playBossPhaseShift(x?: number) {
    const preset = SFX_PRESETS.boss.phase_shift;
    this.helper.execute("boss_phase_shift", 0, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "2n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
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
    const preset = SFX_PRESETS.boss.spike_strike;
    this.helper.execute("spike_strike", 80, x, this.impactPanner, (now) => {
      this.spikeSynth.triggerAttackRelease(preset.frequency, "16n", now);
      this.spikeSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playHitConfirm(x?: number) {
    const preset = SFX_PRESETS.boss.hit_confirm;
    this.helper.execute("hit_confirm", 40, x, this.impactPanner, (now) => {
      this.hitSynth.triggerAttackRelease(preset.metalNote, "16n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(preset.synthFreq, "16n", now + preset.synthDelay);
    });
  }
}
