import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";
import { SFX_PRESETS } from "../sfxPresetData";
import { SynthFactory } from "./SynthFactory";
import { soundSynth } from "@/core/SoundSynth";
import { IEventBus } from "@/core/Interfaces";

const DORIAN_RATIOS = [1.0000, 1.1225, 1.1892, 1.3348, 1.4983, 1.6818, 1.7818, 2.0000, 2.2449, 2.3784, 2.6697, 2.9966];

export class BossSFX {
  private helper: SFXHelper;
  private eventBus: IEventBus;
  private getComboCounter: () => number;
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

  constructor(ctxManager: AudioContextManager, helper: SFXHelper, eventBus: IEventBus, getComboCounter: () => number) {
    this.helper = helper;
    this.eventBus = eventBus;
    this.getComboCounter = getComboCounter;
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

    this.jumpSynth = SynthFactory.createPannedSynth(presets.telegraph.oscillatorType, presets.telegraph.decay, this.bossPanner, -5, 0.015);
    this.hurtSynth = SynthFactory.createPannedSynth(presets.lunge.oscillatorType, presets.lunge.decay, this.hurtPanner, -5, 0.015);

    this.hitSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.08 },
      harmonicity: 5.1,
      resonance: 4000,
      volume: -7
    }).connect(this.impactPanner);
    this.hitSynth.frequency.value = 440;

    this.spikeSynth = SynthFactory.createPannedSynth(presets.spike_strike.oscillatorType, presets.spike_strike.decay, this.impactPanner);
    this.teleportSynth = SynthFactory.createPannedSynth(presets.minion_spawn.oscillatorType, presets.minion_spawn.decay, this.bossPanner, -5, 0.02);
    this.dialogueSynthPlayer = SynthFactory.createPannedSynth("sine", 0.05, this.impactPanner, -6);
  }

  private setupSubscriptions() {
    this.eventBus.subscribe("BOSS_HURT", ({ currentHealth }) => {
      this.playHitConfirm(soundSynth.getBossX(), "boss-01");
      if (currentHealth <= 0) {
        this.playBossExplosion(soundSynth.getBossX());
      }
    });

    this.eventBus.subscribe("MINION_HURT", ({ id, currentHealth }) => {
      const mX = soundSynth.getMinionX(id);
      this.playHitConfirm(mX, id);
      if (currentHealth <= 0) {
        this.playMinionDeconstruct(mX);
      }
    });

    this.eventBus.subscribe("PLAYER_SPIKED", ({ x }) => {
      this.playSpikeStrike(x);
    });

    this.eventBus.subscribe("BOSS_PHASE_SHIFT", () => {
      this.playBossPhaseShift(soundSynth.getBossX());
    });

    this.eventBus.subscribe("MINION_SPAWNING", () => {
      this.playMinionSpawning();
    });

    this.eventBus.subscribe("MINION_DISSOLVING", () => {
      this.playMinionDeconstruct();
    });

    this.eventBus.subscribe("BOSS_SWIPED", () => {
      this.playBossSwipe(soundSynth.getBossX());
    });

    this.eventBus.subscribe("BOSS_TELEGRAPH", () => {
      this.playBossTelegraph(soundSynth.getBossX());
    });

    this.eventBus.subscribe("BOSS_LUNGED", () => {
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
    this.helper.execute("minion_spawn", 1000, x, this.bossPanner, (now) => {
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
    this.helper.execute("spike_strike", 80, x, this.impactPanner, (now) => {
      const nowPerformance = performance.now();
      if (nowPerformance - this.lastSpikeTime < 2500) {
        this.spikeSequenceCount = this.spikeSequenceCount + 1;
      } else {
        this.spikeSequenceCount = 0;
      }
      this.lastSpikeTime = nowPerformance;

      const scaleIndex = this.spikeSequenceCount % DORIAN_RATIOS.length;
      const octaveMultiplier = Math.pow(2, Math.floor(this.spikeSequenceCount / DORIAN_RATIOS.length));
      const ratio = DORIAN_RATIOS[scaleIndex] * octaveMultiplier;

      const preset = SFX_PRESETS.boss.spike_strike;
      const adjustedFreq = preset.frequency * ratio;
      const adjustedTargetFreq = (preset.targetFrequency || 700) * ratio;

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
    const comboCounter = this.getComboCounter();
    const scaleIndex = comboCounter % DORIAN_RATIOS.length;
    const octaveMultiplier = Math.pow(2, Math.floor(comboCounter / DORIAN_RATIOS.length));
    const ratio = DORIAN_RATIOS[scaleIndex] * octaveMultiplier;
    
    const baseFreq = 523.25;
    const pitchAdjustedFreq = baseFreq * ratio;

    this.helper.execute("hit_confirm", 40, x, this.impactPanner, (now) => {
      this.hitSynth.triggerAttackRelease(preset.metalNote, "16n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(pitchAdjustedFreq, "16n", now + preset.synthDelay);
    });
  }
}
