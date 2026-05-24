import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { eventBroker } from "@/core/eventBroker";
import { IEntity } from "@/core/Interfaces";

export interface IHealCapable extends IEntity {
  healingCharges: number;
}

export class HealComponent implements IEntityComponent {
  public owner!: IHealCapable;

  public isHealing: boolean = false;
  public healTimer: number = 0;

  private readonly healDuration: number = 2.0;

  public setup(owner: BaseEntity): void {
    this.owner = owner as unknown as IHealCapable;
  }

  public update(dt: number): void {
    if (this.isHealing) {
      this.owner.velocity.x = 0;
      this.healTimer -= dt;

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

    this.owner.healingCharges = Math.max(0, this.owner.healingCharges - 1);
    eventBroker.publish("HEALING_CHARGES_CHANGED", { charges: this.owner.healingCharges });

    const health = this.owner.getComponent(HealthComponent);
    if (health) {
      health.currentHealth = Math.min(health.maxHealth, health.currentHealth + 1);
      eventBroker.publish("PLAYER_HEALED", {
        amount: 1,
        currentHealth: health.currentHealth,
        maxHealth: health.maxHealth,
      });
    }
    eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
    eventBroker.publish("HEAL_COMPLETE", undefined);
  }
}
