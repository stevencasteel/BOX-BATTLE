import { BaseEntity } from "@/entities/BaseEntity";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IPhysicsWorld } from "@/core/Interfaces";
import { UNITS } from "@/core/Units";
import { setVec } from "@/core/VecUtils";

export class HazardSystem {
  public static checkContact(entity: BaseEntity, physicsWorld: IPhysicsWorld, damage: number = UNITS.HAZARD_SPIKE_DAMAGE): boolean {
    const health = entity.getComponent(HealthComponent);
    if (!health || health.isInvincible() || entity.isDead) return false;

    const halfW = entity.size.width / 2;
    const halfH = entity.size.height / 2;

    for (const hazard of physicsWorld.hazards) {
      const isHit =
        entity.position.x + halfW > hazard.x &&
        entity.position.x - halfW < hazard.x + hazard.width &&
        entity.position.y + halfH > hazard.y &&
        entity.position.y - halfH < hazard.y + hazard.height;

      if (isHit && entity.velocity.y >= 0) {
        entity.world.events.publish("PLAYER_SPIKED", { x: entity.position.x });
        const damaged = health.takeDamage(damage);
        if (damaged && !entity.isDead) {
          entity.velocity.y = -550;
          setVec(entity.visualScale, 0.5, 1.5);
          setVec(entity.scaleVelocity, 10.0, -15.0);
        }
        return true;
      }
    }

    return false;
  }
}
