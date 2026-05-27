import * as Tone from "tone";

export class SynthFactory {
  public static createSynth(oscillatorType: string, decay: number, volume: number = -5, attack: number = 0.012): Tone.Synth {
    return new Tone.Synth({
      oscillator: { type: oscillatorType as any },
      envelope: { attack, decay, sustain: 0, release: decay },
      volume,
    });
  }

  public static createPannedSynth(
    oscillatorType: string,
    decay: number,
    panner: Tone.Panner,
    volume: number = -5,
    attack: number = 0.012
  ): Tone.Synth {
    return SynthFactory.createSynth(oscillatorType, decay, volume, attack).connect(panner);
  }
}
