import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { eventBroker } from "@/core/eventBroker";
import { UNITS } from "@/core/Units";

const healUpdatePayload = { timer: 0 };

export class HealComponent implements IEntityComponent {
  public owner!: BaseEntity;

  public isHealing: boolean = false;
  public healTimer: number = 0;

  private readonly healDuration: number = UNITS.HEAL_DURATION;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public update(dt: number): void {
    if (this.isHealing) {
      this.owner.velocity.x = 0;
      this.healTimer -= dt;
      healUpdatePayload.timer = this.healTimer;
      eventBroker.publish("HEAL_UPDATE", healUpdatePayload);

      const progress = Math.max(0, Math.min(1.0, (this.healDuration - this.healTimer) / this.healDuration));
      const nowTime = performance.now();

      this.owner.visualScale = { 
        x: 1.0 + Math.sin(nowTime * 0.045) * 0.015 * progress, 
        y: 1.0 - Math.sin(nowTime * 0.045) * 0.015 * progress 
      };

      if (Math.random() < 0.2 + progress * 0.4) {
        eventBroker.publish("CAMERA_SHAKE", { amplitude: 0.5 + progress * 3.5, duration: 0.05 });
      }

      if (Math.random() < 0.3 + progress * 0.4) {
        const spawnX = this.owner.position.x + (Math.random() * 32 - 16);
        const spawnY = this.owner.position.y + this.owner.size.height / 2;
        eventBroker.publish("SPAWN_SPARKS", {
          x: spawnX,
          y: spawnY,
          angle: -Math.PI / 2 + (Math.random() * 0.15 - 0.075),
          color: "hsl(280, 85%, 65%)",
          count: 1,
          shape: "line"
        });
      }

      const sparkChance = 0.35 + progress * 0.65;
      if (Math.random() < sparkChance) {
        const spawnX = this.owner.position.x + (Math.random() * 44 - 22);
        const spawnY = this.owner.position.y + this.owner.size.height / 2 - (Math.random() * this.owner.size.height);
        const angle = -Math.PI / 2 + (Math.random() * 0.3 - 0.15);

        eventBroker.publish("SPAWN_SPARKS", {
          x: spawnX,
          y: spawnY,
          angle: angle,
          color: progress >= 0.85 ? "hsl(295, 100%, 80%)" : "hsl(280, 85%, 65%)",
          count: Math.random() < 0.2 ? 2 : 1,
          shape: Math.random() < 0.35 ? "line" : "spark",
          turbulence: 15 + progress * 40
        });
      }

      if (Math.random() < 0.25 + progress * 0.45) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 90 - progress * 55;
        const startX = this.owner.position.x + Math.cos(angle) * radius;
        const startY = this.owner.position.y - 10 + Math.sin(angle) * radius;

        const targetX = this.owner.position.x;
        const targetY = this.owner.position.y - 10;
        const vx = (targetX - startX) * 4.0;
        const vy = (targetY - startY) * 4.0;

        eventBroker.publish("SPAWN_SPARKS", {
          x: startX,
          y: startY,
          angle: Math.atan2(vy, vx),
          color: "hsl(280, 100%, 75%)",
          count: 1,
          shape: "line",
          turbulence: 20
        });
      }

      if (Math.random() < 0.08 + progress * 0.15) {
        eventBroker.publish("SPAWN_DUST", {
          x: this.owner.position.x,
          y: this.owner.position.y + this.owner.size.height / 2,
          direction: "horizontal"
        });
      }

      if (this.healTimer <= 0) {
        this.completeHealing();
      }
    }
  }

  public startHealing(): void {
    this.isHealing = true;
    this.healTimer = this.healDuration;
    eventBroker.publish("HEAL_START", undefined);
  }

  public cancelHealing(): void {
    if (this.isHealing) {
      this.isHealing = false;
      eventBroker.publish("HEAL_CANCEL", undefined);
    }
  }

  private completeHealing(): void {
    this.isHealing = false;
    eventBroker.publish("HEAL_COMPLETE", undefined);
  }
}
