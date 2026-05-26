import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";
import { SFX_PRESETS } from "../sfxPresetData";
import { eventBroker } from "@/core/eventBroker";
import { soundSynth } from "@/core/SoundSynth";

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

  private entityComboMap = new Map<string, { lastHitTime: number; hitSequenceCount: number }>();

  private lastSpikeTime = 0;
  private spikeSequenceCount = 0;

  constructor(ctxManager: AudioContextManager, helper: SFXHelper) {
    this.helper = helper;
    ctxManager.registerOnInit(() => {
      this.init(ctxManager);
      this.setupSubscriptions();
    });
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

  private setupSubscriptions() {
    eventBroker.subscribe("BOSS_HURT", ({ currentHealth }) => {
      this.playHitConfirm(soundSynth.getBossX(), "boss-01");
      if (currentHealth <= 0) {
        this.playBossExplosion(soundSynth.getBossX());
      }
    });

    eventBroker.subscribe("MINION_HURT", ({ id, currentHealth }) => {
      const mX = soundSynth.getMinionX(id);
      this.playHitConfirm(mX, id);
      if (currentHealth <= 0) {
        this.playMinionDeconstruct(mX);
      }
    });

    eventBroker.subscribe("PLAYER_SPIKED", () => {
      this.playSpikeStrike(soundSynth.getPlayerX());
    });

    eventBroker.subscribe("BOSS_PHASE_SHIFT", () => {
      this.playBossPhaseShift(soundSynth.getBossX());
    });

    eventBroker.subscribe("MINION_SPAWNING", () => {
      this.playMinionSpawning();
    });

    eventBroker.subscribe("MINION_DISSOLVING", () => {
      this.playMinionDeconstruct();
    });

    eventBroker.subscribe("BOSS_SWIPED", () => {
      this.playBossSwipe(soundSynth.getBossX());
    });

    eventBroker.subscribe("BOSS_TELEGRAPH", () => {
      this.playBossTelegraph(soundSynth.getBossX());
    });

    eventBroker.subscribe("BOSS_LUNGED", () => {
      this.playBossLunge(soundSynth.getBossX());
    });
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
    const nowPerformance = performance.now();
    if (nowPerformance - this.lastSpikeTime < 2500) {
      this.spikeSequenceCount = this.spikeSequenceCount + 1;
    } else {
      this.spikeSequenceCount = 0;
    }
    this.lastSpikeTime = nowPerformance;

    const preset = SFX_PRESETS.boss.spike_strike;
    const comboMultiplier = 1.0 + this.spikeSequenceCount * 0.15;
    const adjustedFreq = preset.frequency * comboMultiplier;
    const adjustedTargetFreq = (preset.targetFrequency || 700) * comboMultiplier;

    this.helper.execute("spike_strike", 80, x, this.impactPanner, (now) => {
      this.spikeSynth.triggerAttackRelease(adjustedFreq, "16n", now);
      this.spikeSynth.frequency.rampTo(adjustedTargetFreq, preset.rampDuration, now);
    });
  }

  public playHitConfirm(x?: number, entityId?: string) {
    const nowPerformance = performance.now();
    const targetId = entityId || "unknown";

    let combo = this.entityComboMap.get(targetId);
    if (!combo) {
      combo = { lastHitTime: 0, hitSequenceCount: 0 };
    }

    if (nowPerformance - combo.lastHitTime < 1500) {
      combo.hitSequenceCount = combo.hitSequenceCount + 1;
    } else {
      combo.hitSequenceCount = 0;
    }
    combo.lastHitTime = nowPerformance;
    this.entityComboMap.set(targetId, combo);

    const preset = SFX_PRESETS.boss.hit_confirm;
    const comboMultiplier = 1.0 + combo.hitSequenceCount * 0.12;
    const pitchAdjustedFreq = preset.synthFreq * comboMultiplier;

    this.helper.execute("hit_confirm", 40, x, this.impactPanner, (now) => {
      this.hitSynth.triggerAttackRelease(preset.metalNote, "16n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(pitchAdjustedFreq, "16n", now + preset.synthDelay);
    });
  }
}
