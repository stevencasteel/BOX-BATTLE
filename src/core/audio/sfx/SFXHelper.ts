import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";

export class SFXHelper {
  private lastTriggerTimes: Record<string, number> = {};

  constructor(private ctxManager: AudioContextManager) {}

  public execute(
    key: string,
    throttleMs: number,
    x: number | undefined,
    panner: Tone.Panner | undefined,
    callback: (now: number) => void
  ): void {
    try {
      if (!this.ctxManager.initialized) return;
      if (!this.checkThrottle(key, throttleMs)) return;

      const now = Tone.now();
      if (x !== undefined && panner) {
        panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), now);
      }

      callback(now);
    } catch (e) {
      // Safe global exception boundary
    }
  }

  private checkThrottle(key: string, limitMs: number): boolean {
    const now = performance.now();
    const last = this.lastTriggerTimes[key] || 0;
    if (now - last < limitMs) {
      return false;
    }
    this.lastTriggerTimes[key] = now;
    return true;
  }
}
