import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";

export class PlayerSFX {
  private helper: SFXHelper;
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

  constructor(ctxManager: AudioContextManager, helper: SFXHelper) {
    this.helper = helper;
    ctxManager.registerOnInit(() => this.init(ctxManager));
  }

  private init(ctxManager: AudioContextManager) {
    const sfxGain = ctxManager.sfxGain;

    this.playerPanner = new Tone.Panner(0).connect(sfxGain);
    this.hurtPanner = new Tone.Panner(0).connect(sfxGain);

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

    this.hurtSynth = new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.16, sustain: 0, release: 0.16 }
    }).connect(this.hurtPanner);

    this.landingNoise = new Tone.Noise("white");
    this.landingFilter = new Tone.Filter({ frequency: 1100, type: "bandpass", Q: 2.0 });
    this.landingEnv = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.08, sustain: 0, release: 0.08 });
    this.landingNoise.chain(this.landingFilter, this.landingEnv, this.playerPanner);
    this.landingNoise.start();

    this.slashNoiseSide = new Tone.Noise("white");
    this.slashFilterSide = new Tone.Filter({ frequency: 2200, type: "highpass" });
    this.slashFilter2Side = new Tone.Filter({ frequency: 1600, type: "bandpass", Q: 1.0 });
    this.slashEnvSide = new Tone.AmplitudeEnvelope({ attack: 0.005, decay: 0.15, sustain: 0, release: 0.15 });
    this.slashNoiseSide.chain(this.slashFilterSide, this.slashFilter2Side, this.slashEnvSide, this.playerPanner);
    this.slashNoiseSide.start();

    this.slashNoisePuff = new Tone.Noise("pink");
    this.slashFilterPuff = new Tone.Filter({ frequency: 650, type: "bandpass", Q: 1.2 });
    this.slashEnvPuff = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.18, sustain: 0, release: 0.18 });
    this.slashNoisePuff.chain(this.slashFilterPuff, this.slashEnvPuff, this.playerPanner);
    this.slashNoisePuff.start();
  }

  public playDashRecharge(x?: number) {
    this.helper.execute("dash_recharge", 150, x, this.playerPanner, (now) => {
      this.jumpSynth.triggerAttackRelease("A5", "16n", now);
      this.jumpSynth.triggerAttackRelease("E6", "16n", now + 0.04);
    });
  }

  public playHealCancel(x?: number) {
    this.helper.execute("heal_cancel", 0, x, this.playerPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(180, "8n", now);
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
    this.helper.execute("landing", 100, x, this.playerPanner, (now) => {
      this.pogoSynth.triggerAttackRelease(160, "8n", now);
      this.pogoSynth.frequency.rampTo(65, 0.11, now);
      this.landingEnv.triggerAttackRelease(0.08, now);
    });
  }

  public playFireballLvl1(x?: number) {
    this.helper.execute("fireball_lvl1", 0, x, this.playerPanner, (now) => {
      this.slashSynth.triggerAttackRelease(440, "8n", now);
      this.slashSynth.frequency.rampTo(160, 0.15, now);
    });
  }

  public playFireballLvl2(x?: number) {
    this.helper.execute("fireball_lvl2", 0, x, this.playerPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(220, "4n", now);
      this.hurtSynth.frequency.rampTo(80, 0.25, now);
    });
  }

  public playJump(x?: number) {
    this.helper.execute("jump", 100, x, this.playerPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(240, "8n", now);
      this.jumpSynth.frequency.rampTo(580, 0.12, now);
    });
  }

  public playDash(x?: number) {
    this.helper.execute("dash", 100, x, this.playerPanner, (now) => {
      this.dashEnv.triggerAttackRelease(0.18, now);
      this.dashFilter.frequency.setValueAtTime(1400, now);
      this.dashFilter.frequency.rampTo(500, 0.18, now);
    });
  }

  public playSlash(direction: "side" | "up" | "down" = "side", x?: number) {
    if (direction === "side") {
      this.helper.execute("slash_side", 80, x, this.playerPanner, (now) => {
        this.slashFilterSide.frequency.rampTo(1000, 0.14, now);
        this.slashEnvSide.triggerAttackRelease(0.15, now);
      });
    } else {
      this.helper.execute("slash_puff", 100, x, this.playerPanner, (now) => {
        this.pogoSynth.triggerAttackRelease(220, "8n", now);
        this.pogoSynth.frequency.rampTo(90, 0.15, now);
        this.slashEnvPuff.triggerAttackRelease(0.18, now);
      });
    }
  }

  public playPogo(x?: number) {
    this.helper.execute("pogo", 80, x, this.playerPanner, (now) => {
      this.pogoSynth.triggerAttackRelease(320, "16n", now);
      this.pogoSynth.frequency.rampTo(140, 0.09, now);
    });
  }

  public playHurt(x?: number) {
    this.helper.execute("hurt", 120, x, this.hurtPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(180, "8n", now);
      this.hurtSynth.frequency.rampTo(45, 0.16, now);
    });
  }
}
