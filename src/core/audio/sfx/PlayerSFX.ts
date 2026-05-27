import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";
import { SFX_PRESETS } from "../sfxPresetData";
import { SynthFactory } from "./SynthFactory";
import { soundSynth } from "@/core/SoundSynth";
import { IEventBus } from "@/core/Interfaces";

const DORIAN_RATIOS = [1.0000, 1.1225, 1.1892, 1.3348, 1.4983, 1.6818, 1.7818, 2.0000, 2.2449, 2.3784, 2.6697, 2.9966];

export class PlayerSFX {
  private helper: SFXHelper;
  private eventBus: IEventBus;
  private getComboCounter: () => number;
  private playerPanner!: Tone.Panner;
  private hurtPanner!: Tone.Panner;

  private jumpSynth!: Tone.Synth;
  private slashSynth!: Tone.Synth;
  private pogoSynth!: Tone.Synth;
  private dashNoise!: Tone.Noise;
  private dashFilter!: Tone.Filter;
  private dashEnv!: Tone.AmplitudeEnvelope;
  private hurtSynth!: Tone.Synth;

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

    this.playerPanner = new Tone.Panner(0).connect(sfxGain);
    this.hurtPanner = new Tone.Panner(0).connect(sfxGain);

    const presets = SFX_PRESETS.player;

    this.jumpSynth = SynthFactory.createPannedSynth(presets.jump.oscillatorType, presets.jump.decay, this.playerPanner);
    this.slashSynth = SynthFactory.createPannedSynth(presets.fireball_lvl1.oscillatorType, presets.fireball_lvl1.decay, this.playerPanner);
    this.pogoSynth = SynthFactory.createPannedSynth(presets.pogo.oscillatorType, presets.pogo.decay, this.playerPanner);

    this.dashNoise = new Tone.Noise({ type: "white", volume: -7 });
    this.dashFilter = new Tone.Filter({ frequency: presets.dash.noiseFreq, type: "bandpass", Q: presets.dash.noiseQ });
    this.dashEnv = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: presets.dash.noiseDecay,
      sustain: 0,
      release: presets.dash.noiseDecay,
    });
    this.dashNoise.chain(this.dashFilter, this.dashEnv, this.playerPanner);
    this.dashNoise.start();

    this.hurtSynth = SynthFactory.createPannedSynth(presets.hurt.oscillatorType, presets.hurt.decay, this.hurtPanner);

    this.landingNoise = new Tone.Noise({ type: "white", volume: -7 });
    this.landingFilter = new Tone.Filter({
      frequency: presets.landing.noiseFreq,
      type: "bandpass",
      Q: presets.landing.noiseQ,
    });
    this.landingEnv = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: presets.landing.noiseDecay,
      sustain: 0,
      release: presets.landing.noiseDecay,
    });
    this.landingNoise.chain(this.landingFilter, this.landingEnv, this.playerPanner);
    this.landingNoise.start();

    this.slashNoiseSide = new Tone.Noise({ type: "white", volume: -7 });
    this.slashFilterSide = new Tone.Filter({ frequency: presets.slash_side.noiseFreq, type: "highpass" });
    this.slashFilter2Side = new Tone.Filter({ frequency: 1600, type: "bandpass", Q: 1.0 });
    this.slashEnvSide = new Tone.AmplitudeEnvelope({
      attack: 0.005,
      decay: presets.slash_side.noiseDecay,
      sustain: 0,
      release: presets.slash_side.noiseDecay,
    });
    this.slashNoiseSide.chain(this.slashFilterSide, this.slashFilter2Side, this.slashEnvSide, this.playerPanner);
    this.slashNoiseSide.start();

    this.slashNoisePuff = new Tone.Noise({ type: "pink", volume: -7 });
    this.slashFilterPuff = new Tone.Filter({
      frequency: presets.slash_puff.noiseFreq,
      type: "bandpass",
      Q: presets.slash_puff.noiseQ,
    });
    this.slashEnvPuff = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: presets.slash_puff.noiseDecay,
      sustain: 0,
      release: presets.slash_puff.noiseDecay,
    });
    this.slashNoisePuff.chain(this.slashFilterPuff, this.slashEnvPuff, this.playerPanner);
    this.slashNoisePuff.start();
  }

  private setupSubscriptions() {
    this.eventBus.subscribe("PLAYER_HURT", () => {
      this.playHurt(soundSynth.getPlayerX());
    });

    this.eventBus.subscribe("PLAYER_JUMPED", () => {
      this.playJump(soundSynth.getPlayerX());
    });

    this.eventBus.subscribe("PLAYER_DASHED", () => {
      this.playDash(soundSynth.getPlayerX());
    });

    this.eventBus.subscribe("PLAYER_POGOED", () => {
      this.playPogo(soundSynth.getPlayerX());
    });

    this.eventBus.subscribe("PLAYER_ATTACKED", ({ direction }) => {
      this.playSlash(direction, soundSynth.getPlayerX());
    });

    this.eventBus.subscribe("PLAYER_PROJECTILE_FIRED", ({ level }) => {
      if (level === 2) {
        this.playFireballLvl2(soundSynth.getPlayerX());
      } else {
        this.playFireballLvl1(soundSynth.getPlayerX());
      }
    });

    this.eventBus.subscribe("PLAYER_LANDED", () => {
      this.playLanding(soundSynth.getPlayerX());
    });

    this.eventBus.subscribe("HEAL_UPDATE", ({ timer }) => {
      soundSynth.updateHealTimer(timer);
    });

    this.eventBus.subscribe("HEAL_START", () => {
      soundSynth.playHealStart(soundSynth.getPlayerX());
    });

    this.eventBus.subscribe("HEAL_CANCEL", () => {
      this.playHealCancel(soundSynth.getPlayerX());
      soundSynth.stopHealDrone();
    });

    this.eventBus.subscribe("HEAL_COMPLETE", () => {
      soundSynth.playHealComplete();
    });

    this.eventBus.subscribe("PLAYER_DASH_RECHARGED", () => {
      this.playDashRecharge(soundSynth.getPlayerX());
    });

    this.eventBus.subscribe("CHARGE_START", () => {
      soundSynth.playChargeStart(soundSynth.getPlayerX());
    });

    this.eventBus.subscribe("CHARGE_UPDATE", ({ timer }) => {
      soundSynth.updateChargeTimer(timer);
    });

    this.eventBus.subscribe("CHARGE_STOP", () => {
      soundSynth.stopChargeDrone();
    });
  }

  public playDashRecharge(x?: number) {
    const preset = SFX_PRESETS.player.dash_recharge;
    this.helper.execute("dash_recharge", 150, x, this.playerPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(preset.lowNote, "16n", now);
      this.jumpSynth.triggerAttackRelease(preset.highNote, "16n", now + 0.04);
    });
  }

  public playHealCancel(x?: number) {
    const preset = SFX_PRESETS.player.heal_cancel;
    this.helper.execute("heal_cancel", 0, x, this.playerPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "8n", now);
    });
  }

  public playPlayerExplosion(x?: number) {
    this.helper.execute("player_explosion", 0, x, this.playerPanner, (now) => {
      for (let i = 0; i < 3; i++) {
        const delay = i * 0.25;
        this.hurtSynth.triggerAttackRelease(180 - i * 30, "4n", now + delay);
        this.hurtSynth.frequency.rampTo(40, 0.35, now + delay);
      }
    });
  }

  public playLanding(x?: number) {
    const preset = SFX_PRESETS.player.landing;
    this.helper.execute("landing", 100, x, this.playerPanner, (now) => {
      this.pogoSynth.triggerAttackRelease(preset.synthFreq, "8n", now);
      this.pogoSynth.frequency.rampTo(preset.synthTargetFreq, preset.synthDuration, now);
      this.landingEnv.triggerAttackRelease(preset.noiseDecay, now);
    });
  }

  public playFireballLvl1(x?: number) {
    const preset = SFX_PRESETS.player.fireball_lvl1;
    const comboCounter = this.getComboCounter();
    const scaleIndex = comboCounter % DORIAN_RATIOS.length;
    const octaveMultiplier = Math.pow(2, Math.floor(comboCounter / DORIAN_RATIOS.length));
    const ratio = DORIAN_RATIOS[scaleIndex] * octaveMultiplier;

    this.helper.execute("fireball_lvl1", 0, x, this.playerPanner, (now) => {
      const baseFreq = preset.frequency * ratio;
      const targetFreq = preset.targetFrequency * ratio;
      this.slashSynth.triggerAttackRelease(baseFreq, "8n", now);
      this.slashSynth.frequency.rampTo(targetFreq, preset.rampDuration, now);
    });
  }

  public playFireballLvl2(x?: number) {
    const preset = SFX_PRESETS.player.fireball_lvl2;
    this.helper.execute("fireball_lvl2", 0, x, this.playerPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "4n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playJump(x?: number) {
    const preset = SFX_PRESETS.player.jump;
    this.helper.execute("jump", 100, x, this.playerPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(preset.frequency, "8n", now);
      this.jumpSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playDash(x?: number) {
    const preset = SFX_PRESETS.player.dash;
    this.helper.execute("dash", 100, x, this.playerPanner, (now) => {
      this.dashEnv.triggerAttackRelease(preset.noiseDecay, now);
      this.dashFilter.frequency.setValueAtTime(preset.noiseFreq, now);
      this.dashFilter.frequency.rampTo(preset.noiseTargetFreq, preset.noiseDuration, now);
    });
  }

  public playSlash(direction: "side" | "up" | "down" = "side", x?: number) {
    if (direction === "side") {
      const preset = SFX_PRESETS.player.slash_side;
      this.helper.execute("slash_side", 80, x, this.playerPanner, (now) => {
        this.slashFilterSide.frequency.rampTo(preset.noiseTargetFreq, preset.noiseDuration, now);
        this.slashEnvSide.triggerAttackRelease(preset.noiseDecay, now);
      });
    } else {
      const preset = SFX_PRESETS.player.slash_puff;
      this.helper.execute("slash_puff", 100, x, this.playerPanner, (now) => {
        this.pogoSynth.triggerAttackRelease(preset.synthFreq, "8n", now);
        this.pogoSynth.frequency.rampTo(preset.synthTargetFreq, preset.synthDuration, now);
        this.slashEnvPuff.triggerAttackRelease(preset.noiseDecay, now);
      });
    }
  }

  public playPogo(x?: number) {
    const preset = SFX_PRESETS.player.pogo;
    const comboCounter = this.getComboCounter();
    const scaleIndex = comboCounter % DORIAN_RATIOS.length;
    const octaveMultiplier = Math.pow(2, Math.floor(comboCounter / DORIAN_RATIOS.length));
    const ratio = DORIAN_RATIOS[scaleIndex] * octaveMultiplier;

    this.helper.execute("pogo", 80, x, this.playerPanner, (now) => {
      const baseFreq = preset.frequency * ratio;
      const targetFreq = preset.targetFrequency * ratio;
      this.pogoSynth.triggerAttackRelease(baseFreq, "16n", now);
      this.pogoSynth.frequency.rampTo(targetFreq, preset.rampDuration, now);
    });
  }

  public playHurt(x?: number) {
    const preset = SFX_PRESETS.player.hurt;
    this.helper.execute("hurt", 120, x, this.hurtPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "8n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }
}
