import { eventBroker } from "@/core/eventBroker";
import { UNITS } from "@/core/Units";
import { Camera } from "@/core/Camera";
import { soundSynth } from "@/core/SoundSynth";
import { inputProvider } from "@/core/InputProvider";

export class SimulationSystems {
  private unsubscribes: (() => void)[] = [];

  public setup(getPlayerX: () => number, getBossX: () => number, getMinionX: (id: string) => number): void {
    soundSynth.registerCoordinateProviders(getPlayerX, getBossX, getMinionX);

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_HURT", () => {
        Camera.shake(15, 0.3);
        Camera.triggerHitStop(0.08);
        inputProvider.triggerHapticFeedback("medium");
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_HURT", ({ currentHealth }) => {
        if (currentHealth <= 0) {
          Camera.shake(25, 0.6);
          Camera.triggerHitStop(0.15);
          inputProvider.triggerHapticFeedback("heavy");
        } else {
          Camera.shake(8, 0.15);
          Camera.triggerHitStop(0.04);
          inputProvider.triggerHapticFeedback("light");
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("MINION_HURT", ({ currentHealth }) => {
        if (currentHealth <= 0) {
          Camera.shake(4, 0.15);
          Camera.triggerHitStop(0.03);
          inputProvider.triggerHapticFeedback("medium");
        } else {
          Camera.shake(2, 0.08);
          Camera.triggerHitStop(0.01);
          inputProvider.triggerHapticFeedback("light");
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_DASHED", () => {
        Camera.triggerHitStop(0.035);
        inputProvider.triggerHapticFeedback("light");
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

    this.unsubscribes.push(
      eventBroker.subscribe("CHARGE_UPDATE", ({ timer }) => {
        if (timer >= UNITS.CHARGE_LVL2_TIME) {
          if (Math.random() < 0.16) {
            inputProvider.triggerHapticFeedback("light");
          }
        } else if (timer >= UNITS.CHARGE_LVL1_TIME) {
          if (Math.random() < 0.08) {
            inputProvider.triggerHapticFeedback("light");
          }
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CHARGE_MAXED", () => {
        inputProvider.triggerHapticFeedback("medium");
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_SPIKED", () => {
        inputProvider.triggerHapticFeedback("heavy");
      })
    );
  }

  public teardown(): void {
    this.unsubscribes.forEach((unsub) => unsub());
    this.unsubscribes = [];
    soundSynth.stopHealDrone();
    soundSynth.stopChargeDrone();
  }
}
