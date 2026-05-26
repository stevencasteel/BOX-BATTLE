import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";
import { SFX_PRESETS } from "../sfxPresetData";

export class InterfaceSFX {
  private helper: SFXHelper;
  private playerDialoguePanner!: Tone.Panner;
  private bossDialoguePanner!: Tone.Panner;

  private dialogueSynthPlayer!: Tone.PolySynth;
  private dialogueSynthBoss!: Tone.PolySynth;
  private menuSynth!: Tone.Synth;

  constructor(ctxManager: AudioContextManager, helper: SFXHelper) {
    this.helper = helper;
    ctxManager.registerOnInit(() => this.init(ctxManager));
  }

  private init(ctxManager: AudioContextManager) {
    const sfxGain = ctxManager.sfxGain;

    this.playerDialoguePanner = new Tone.Panner(-0.35).connect(sfxGain);
    this.bossDialoguePanner = new Tone.Panner(0.35).connect(sfxGain);

    this.dialogueSynthPlayer = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 },
    }).connect(this.playerDialoguePanner);

    this.dialogueSynthBoss = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.07, sustain: 0, release: 0.07 },
    }).connect(this.bossDialoguePanner);

    this.menuSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.15 },
    }).connect(this.playerDialoguePanner);

    this.dialogueSynthPlayer.maxPolyphony = 16;
    this.dialogueSynthBoss.maxPolyphony = 16;
  }

  public playSelectTick() {
    const preset = SFX_PRESETS.interface.select_tick;
    this.helper.execute("select_tick", 30, undefined, undefined, (now) => {
      this.dialogueSynthPlayer.triggerAttackRelease(preset.note1, "32n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(preset.note2, "32n", now + preset.delay);
    });
  }

  public playErrorTick() {
    const preset = SFX_PRESETS.interface.error_tick;
    this.helper.execute("error_tick", 30, undefined, undefined, (now) => {
      this.dialogueSynthBoss.triggerAttackRelease(preset.note1, "16n", now);
      this.dialogueSynthBoss.triggerAttackRelease(preset.note2, "16n", now + preset.delay);
    });
  }

  public playMenuConfirm() {
    const preset = SFX_PRESETS.interface.menu_confirm;
    this.helper.execute("menu_confirm", 80, undefined, undefined, (now) => {
      this.menuSynth.triggerAttackRelease(preset.startFreq, "16n", now);
      this.menuSynth.frequency.setValueAtTime(preset.startFreq, now);
      this.menuSynth.frequency.rampTo(preset.targetFreq, preset.duration, now);
    });
  }

  public playMenuBack() {
    const preset = SFX_PRESETS.interface.menu_back;
    this.helper.execute("menu_back", 80, undefined, undefined, (now) => {
      this.menuSynth.triggerAttackRelease(preset.startFreq, "16n", now);
      this.menuSynth.frequency.setValueAtTime(preset.startFreq, now);
      this.menuSynth.frequency.rampTo(preset.targetFreq, preset.duration, now);
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
