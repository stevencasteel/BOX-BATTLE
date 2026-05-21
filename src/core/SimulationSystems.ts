import { eventBroker } from "@/core/EventBroker";
import { Camera } from "@/core/Camera";
import { soundSynth } from "@/core/SoundSynth";

export class SimulationSystems {
  private unsubscribes: (() => void)[] = [];

  public setup(): void {
    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_HURT", () => {
        soundSynth.playHurt();
        Camera.shake(15, 0.3);
        Camera.triggerHitStop(0.08);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_HURT", ({ currentHealth }) => {
        soundSynth.playHitConfirm();
        if (currentHealth <= 0) {
          Camera.shake(25, 0.6);
          Camera.triggerHitStop(0.15);
        } else {
          Camera.shake(8, 0.15);
          Camera.triggerHitStop(0.04);
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("MINION_HURT", ({ currentHealth }) => {
        soundSynth.playHitConfirm();
        if (currentHealth <= 0) {
          Camera.shake(4, 0.15);
          Camera.triggerHitStop(0.03);
        } else {
          Camera.shake(2, 0.08);
          Camera.triggerHitStop(0.01);
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_JUMPED", () => {
        soundSynth.playJump();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_DASHED", () => {
        soundSynth.playDash();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_POGOED", () => {
        soundSynth.playPogo();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_ATTACKED", () => {
        soundSynth.playSlash();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_PROJECTILE_FIRED", ({ level }) => {
        if (level === 2) {
          soundSynth.playDash();
        } else {
          soundSynth.playJump();
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CAMERA_SHAKE", ({ amplitude, duration }) => {
        Camera.shake(amplitude, duration);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("HIT_STOP", ({ duration }) => {
        Camera.triggerHitStop(duration);
      })
    );
  }

  public teardown(): void {
    this.unsubscribes.forEach((unsub) => unsub());
    this.unsubscribes = [];
  }
}
