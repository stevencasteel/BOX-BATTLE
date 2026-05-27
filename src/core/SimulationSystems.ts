import { UNITS } from "@/core/Units";
import { Camera } from "@/core/Camera";
import { TrigLUT } from "@/core/TrigLUT";
import type { IEventBus, IAudioManager, IInputProvider } from "@/core/Interfaces";

export class SimulationSystems {
  private events: IEventBus;
  private audio: IAudioManager;
  private input: IInputProvider;
  private unsubscribes: (() => void)[] = [];

  constructor(events: IEventBus, audio: IAudioManager, input: IInputProvider) {
    this.events = events;
    this.audio = audio;
    this.input = input;
  }

  public setup(getPlayerX: () => number, getBossX: () => number, getMinionX: (id: string) => number): void {
    this.audio.registerCoordinateProviders(getPlayerX, getBossX, getMinionX);

    this.unsubscribes.push(
      this.events.subscribe("PLAYER_HURT", () => {
        const px = getPlayerX();
        const bx = getBossX();
        const dx = px - bx;
        const len = Math.abs(dx);
        const dirX = len > 0 ? dx / len : 1;
        Camera.shake(15, 0.3, dirX, 0);
        Camera.triggerHitStop(0.08);
        this.input.triggerHapticFeedback("medium");
      })
    );

    this.unsubscribes.push(
      this.events.subscribe("BOSS_HURT", ({ currentHealth, sourceX, sourceY }) => {
        const bossX = getBossX();
        const dx = bossX - sourceX;
        const dy = 1000 - sourceY;
        const len = TrigLUT.fastSqrt(dx * dx + dy * dy);
        const dirX = len > 0 ? dx / len : -1;
        const dirY = len > 0 ? dy / len : 0;

        if (currentHealth <= 0) {
          Camera.shake(25, 0.6, dirX, dirY);
          Camera.triggerHitStop(0.15);
          this.input.triggerHapticFeedback("heavy");
        } else {
          Camera.shake(8, 0.15, dirX, dirY);
          Camera.triggerHitStop(0.04);
          this.input.triggerHapticFeedback("light");
        }
      })
    );

    this.unsubscribes.push(
      this.events.subscribe("MINION_HURT", ({ id, currentHealth, sourceX }) => {
        const minionX = getMinionX(id);
        const dx = minionX - sourceX;
        const dirX = dx > 0 ? 1 : dx < 0 ? -1 : 1;

        if (currentHealth <= 0) {
          Camera.shake(4, 0.15, dirX, 0);
          Camera.triggerHitStop(0.03);
          this.input.triggerHapticFeedback("medium");
        } else {
          Camera.shake(2, 0.15, dirX, 0);
          Camera.triggerHitStop(0.01);
          this.input.triggerHapticFeedback("light");
        }
      })
    );

    this.unsubscribes.push(
      this.events.subscribe("PLAYER_POGOED", () => {
        Camera.shake(4, 0.08, 0, 1);
      })
    );

    this.unsubscribes.push(
      this.events.subscribe("PLAYER_DASHED", () => {
        Camera.triggerHitStop(0.035);
        this.input.triggerHapticFeedback("light");
      })
    );

    this.unsubscribes.push(
      this.events.subscribe("CAMERA_SHAKE", ({ amplitude, duration }) => {
        Camera.shake(amplitude, duration);
      })
    );

    this.unsubscribes.push(
      this.events.subscribe("HIT_STOP", ({ duration }) => {
        Camera.triggerHitStop(duration);
      })
    );

    this.unsubscribes.push(
      this.events.subscribe("CHARGE_UPDATE", ({ timer }) => {
        if (timer >= UNITS.CHARGE_LVL2_TIME) {
          if (TrigLUT.random() < 0.16) {
            this.input.triggerHapticFeedback("light");
          }
        } else if (timer >= UNITS.CHARGE_LVL1_TIME) {
          if (TrigLUT.random() < 0.08) {
            this.input.triggerHapticFeedback("light");
          }
        }
      })
    );

    this.unsubscribes.push(
      this.events.subscribe("CHARGE_MAXED", () => {
        this.input.triggerHapticFeedback("medium");
      })
    );

    this.unsubscribes.push(
      this.events.subscribe("PLAYER_SPIKED", () => {
        this.input.triggerHapticFeedback("heavy");
      })
    );
  }

  public teardown(): void {
    this.unsubscribes.forEach((unsub) => unsub());
    this.unsubscribes = [];
    this.audio.stopHealDrone();
    this.audio.stopChargeDrone();
  }
}
