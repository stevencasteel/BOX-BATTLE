import { BaseMinion } from "./BaseMinion";
import { HealthComponent, DamagePayload } from "@/entities/components/HealthComponent";
import { IWorld } from "@/core/Interfaces";
import { TurretPatrolState } from "./MinionStates";
import { TrigLUT } from "@/core/TrigLUT";

export class TurretMinion extends BaseMinion {
  constructor(id: string, startPos: { x: number; y: number }, world: IWorld) {
    super(id, startPos, world);
    this.size = { width: 44, height: 44 };
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 5,
      invincibilityDuration: 0.15,
      onDamaged: ({ amount, currentHealth, maxHealth, sourceX, sourceY, intensity }: DamagePayload) => {
        this.world.events.publish("MINION_HURT", { id: this.id, amount, currentHealth, maxHealth, sourceX, sourceY, intensity });
      },
    });
    this.physics.gravity = 0;
    this.squashPivot = "feet";
    this.canFallIntoHazards = false;
    this.bodyColorValue = "#718096";
    this.cageColorValue = "hsla(142,80%,65%,";
    this.dissolveColorValue = "hsl(215,20%,65%)";
    this.initState(new TurretPatrolState(this));
  }

  get minionColor(): string {
    return "hsl(215, 20%, 65%)";
  }

  protected updateExhaust(): void {
    if (this.attackState === "TELEGRAPH") {
      this.exhaustTimer = 0.06;
      this.world.events.publishSpark(
        this.position.x + (TrigLUT.random() * 16 - 8),
        this.position.y - this.size.height / 2,
        -Math.PI / 2 + (TrigLUT.random() * 0.2 - 0.1),
        "hsl(0, 100%, 65%)",
        false,
        2
      );
    }
  }
}
