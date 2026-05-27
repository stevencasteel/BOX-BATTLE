import { BaseMinion } from "./BaseMinion";
import { HealthComponent, DamagePayload } from "@/entities/components/HealthComponent";
import { IWorld } from "@/core/Interfaces";
import { LancerPatrolState } from "./MinionStates";
import { TrigLUT } from "@/core/TrigLUT";

export class LancerMinion extends BaseMinion {
  constructor(id: string, startPos: { x: number; y: number }, world: IWorld) {
    super(id, startPos, world);
    this.size = { width: 40, height: 50 };
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 6,
      invincibilityDuration: 0.15,
      onDamaged: ({ amount, currentHealth, maxHealth, sourceX, sourceY, intensity }: DamagePayload) => {
        this.world.events.publish("MINION_HURT", { id: this.id, amount, currentHealth, maxHealth, sourceX, sourceY, intensity });
      },
    });
    this.squashPivot = "feet";
    this.bodyColorValue = "hsl(280, 60%, 55%)";
    this.cageColorValue = "hsla(280,85%,65%,";
    this.dissolveColorValue = "hsl(280,70%,65%)";
    this.initState(new LancerPatrolState(this));
  }

  get minionColor(): string {
    return "hsl(280, 60%, 55%)";
  }

  protected updateNonTelegraphRotation(): void {
    if (this.attackState === "ATTACK") {
      this.targetRotation = this.facingDirection * 0.21;
      return;
    }
    super.updateNonTelegraphRotation();
  }

  protected updateExhaust(): void {
    if (Math.abs(this.velocity.x) > 0 && this.physics.isGrounded) {
      const isTelegraph = this.attackState === "TELEGRAPH";
      this.exhaustTimer = isTelegraph ? 0.05 : 0.15;
      const scrapeColor = isTelegraph ? "hsl(45, 100%, 60%)" : "rgba(255, 255, 255, 0.4)";
      this.world.events.publishSpark(
        this.position.x - this.facingDirection * (this.size.width / 2),
        this.position.y + this.size.height / 2,
        TrigLUT.atan2(0.5, -this.facingDirection) + (TrigLUT.random() * 0.3 - 0.15),
        scrapeColor,
        false,
        isTelegraph ? 3 : 1
      );
    }
  }
}
