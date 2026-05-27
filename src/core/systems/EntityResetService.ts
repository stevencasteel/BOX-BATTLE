import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { setVec, zeroVec } from "@/core/VecUtils";

type Vector2 = { x: number; y: number };

export class EntityResetService {
  public resetPlayer(player: Player, startPos: Vector2, facing: number): void {
    player.isDead = false;
    setVec(player.position, startPos.x, startPos.y);
    setVec(player.previousPosition, startPos.x, startPos.y);
    zeroVec(player.velocity);
    player.facingDirection = facing;

    player.hasDoubleJump = true;
    player.determinationCounter = 0;
    player.healingCharges = 0;
    player.hurtTimer = 0;
    player.recoilTimer = 0;
    player.visualScale = { x: 1, y: 1 };

    player.dashComponent.isDashing = false;
    player.dashComponent.dashTimer = 0;
    player.dashComponent.dashCooldown = 0;
    player.dashComponent.canDash = true;
    player.dashComponent.ghosts = [];

    player.meleeComponent.attackCooldownTimer = 0;
    player.meleeComponent.attackActiveTimer = 0;
    player.meleeComponent.attackActive = false;
    player.meleeComponent.attackDirection = null;
    player.meleeComponent.hasHitEnemyThisSwing = false;

    player.fireballComponent.isCharging = false;
    player.fireballComponent.chargeTimer = 0;

    player.healComponent.isHealing = false;
    player.healComponent.healTimer = 0;

    const health = player.getComponent(HealthComponent);
    if (health) health.reset();
  }

  public resetBoss(boss: Boss, startPos: Vector2, facing: number): void {
    boss.isDead = false;
    setVec(boss.position, startPos.x, startPos.y);
    setVec(boss.previousPosition, startPos.x, startPos.y);
    zeroVec(boss.velocity);
    boss.facingDirection = facing;

    const health = boss.getComponent(HealthComponent);
    if (health) health.reset();
  }
}
