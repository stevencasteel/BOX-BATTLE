import * as Tone from "tone";
import { AudioContextManager } from "./AudioContextManager";

interface FrictionVoice {
  source: Tone.Noise;
  filter: Tone.Filter;
  gain: Tone.Gain;
}

export class FrictionSlideManager {
  private ctxManager: AudioContextManager;
  private activeSlides: Map<string, FrictionVoice> = new Map();

  constructor(ctxManager: AudioContextManager) {
    this.ctxManager = ctxManager;
  }

  public handleEntitySlide(id: string, width: number, height: number, speed: number, shouldSlide: boolean) {
    if (!shouldSlide) {
      this.stopFrictionSlide(id);
      return;
    }

    this.ctxManager.resumeContext();
    if (!this.ctxManager.initialized) return;

    let voice = this.activeSlides.get(id);

    if (!voice) {
      const volume = width * height;
      const sizeFactor = Math.max(0.6, Math.min(1.8, 3200 / volume));
      const baseFreq = 800 * sizeFactor;

      const source = new Tone.Noise("brown");
      const filter = new Tone.Filter({ frequency: baseFreq, type: "lowpass" });
      const gain = new Tone.Gain(0);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctxManager.sfxGain);

      source.start(Tone.now());

      voice = { source, filter, gain };
      this.activeSlides.set(id, voice);
    }

    const maxSpeed = 450;
    const ratio = Math.min(1.0, speed / maxSpeed);
    const targetGain = ratio * 0.22;

    voice.gain.gain.rampTo(targetGain, 0.05);

    const volume = width * height;
    const sizeFactor = Math.max(0.6, Math.min(1.8, 3200 / volume));
    const baseFreq = 800 * sizeFactor;
    const targetCutoff = baseFreq * 0.4 + ratio * baseFreq * 0.8;

    voice.filter.frequency.rampTo(targetCutoff, 0.05);
  }

  private stopFrictionSlide(id: string) {
    const voice = this.activeSlides.get(id);
    if (!voice) return;

    const now = Tone.now();
    voice.gain.gain.setValueAtTime(0, now);

    const source = voice.source;
    const filter = voice.filter;
    const gain = voice.gain;

    setTimeout(() => {
      try {
        source.stop();
        source.disconnect();
        filter.disconnect();
        gain.disconnect();

        source.dispose();
        filter.dispose();
        gain.dispose();
      } catch (err) {
        // Safe disposal
      }
    }, 80);

    this.activeSlides.delete(id);
  }

  public clearAllSlides() {
    const ids = Array.from(this.activeSlides.keys());
    for (const id of ids) {
      this.stopFrictionSlide(id);
    }
  }
}
