import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { eventBroker } from "@/core/eventBroker";
import { UNITS } from "@/core/Units";

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
