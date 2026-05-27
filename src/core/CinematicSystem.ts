import { eventBroker } from "@/core/eventBroker";
import { soundSynth } from "@/core/SoundSynth";

interface CinematicEvent {
  triggerTime: number;
  fired: boolean;
  action: () => void;
}

export class CinematicSystem {
  private cinematicActive = false;
  private bossDeathTimer = -1;
  private bossDeathPos: { x: number; y: number } | null = null;
  private cinematicTimeline = 0;
  private cinematicQueue: CinematicEvent[] = [];

  public isActive(): boolean {
    return this.cinematicActive;
  }

  public getDeathTimer(): number {
    return this.bossDeathTimer;
  }

  public getDeathPos(): { x: number; y: number } | null {
    return this.bossDeathPos;
  }

  public update(dt: number): void {
    if (this.bossDeathTimer >= 0) {
      this.bossDeathTimer += dt;
    }
    if (this.cinematicActive) {
      this.cinematicTimeline += dt;
      for (const evt of this.cinematicQueue) {
        if (!evt.fired && this.cinematicTimeline >= evt.triggerTime) {
          evt.action();
          evt.fired = true;
        }
      }
    }
  }

  public startSequence(pos: { x: number; y: number }, initialExplosion: () => void, events: { triggerTime: number; action: () => void }[]): void {
    this.cinematicActive = true;
    eventBroker.publish("CLEAR_DIALOGUES", undefined);
    soundSynth.stopChargeDrone();
    soundSynth.stopHealDrone();
    initialExplosion();

    this.bossDeathTimer = 0;
    this.bossDeathPos = { x: pos.x, y: pos.y };

    eventBroker.publish("CAMERA_SHAKE", { amplitude: 30, duration: 1.8 });

    this.cinematicTimeline = 0;
    this.cinematicQueue = events.map((e) => ({ ...e, fired: false }));
  }

  public cleanup(): void {
    this.cinematicQueue = [];
    this.cinematicTimeline = 0;
    this.bossDeathTimer = -1;
    this.bossDeathPos = null;
    this.cinematicActive = false;
  }
}
