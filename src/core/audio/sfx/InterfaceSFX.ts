import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";

export class InterfaceSFX {
  private helper: SFXHelper;
  private playerDialoguePanner!: Tone.Panner;
  private bossDialoguePanner!: Tone.Panner;

  private dialogueSynthPlayer!: Tone.Synth;
  private dialogueSynthBoss!: Tone.Synth;

  constructor(ctxManager: AudioContextManager, helper: SFXHelper) {
    this.helper = helper;
    ctxManager.registerOnInit(() => this.init(ctxManager));
  }

  private init(ctxManager: AudioContextManager) {
    const sfxGain = ctxManager.sfxGain;

    this.playerDialoguePanner = new Tone.Panner(-0.35).connect(sfxGain);
    this.bossDialoguePanner = new Tone.Panner(0.35).connect(sfxGain);

    this.dialogueSynthPlayer = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 }
    }).connect(this.playerDialoguePanner);

    this.dialogueSynthBoss = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.07, sustain: 0, release: 0.07 }
    }).connect(this.bossDialoguePanner);
  }

  public playSelectTick() {
    this.helper.execute("select_tick", 30, undefined, undefined, (now) => {
      this.dialogueSynthPlayer.triggerAttackRelease(950, "32n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(1400, "32n", now + 0.025);
    });
  }

  public playErrorTick() {
    this.helper.execute("error_tick", 30, undefined, undefined, (now) => {
      this.dialogueSynthBoss.triggerAttackRelease(260, "16n", now);
      this.dialogueSynthBoss.triggerAttackRelease(160, "16n", now + 0.05);
    });
  }

  public playDialogueTick(speaker: "player" | "boss", char: string) {
    if (!char) return;
    this.helper.execute("dialogue_tick", 35, undefined, undefined, (now) => {
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
