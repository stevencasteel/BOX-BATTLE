import { Player } from "@/entities/Player";
import { HazardSystem } from "@/core/systems/HazardSystem";

export class PlayerCombatHandler {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  public updateGravity(isSliding: boolean) {
    const isFalling = !this.player.physics.isGrounded && this.player.velocity.y > 0;
    const isPogoing = this.player.meleeComponent.attackActive && this.player.meleeComponent.attackDirection === "down";
    const isNearJumpApex = !this.player.physics.isGrounded && Math.abs(this.player.velocity.y) < 120;

    if (isSliding) {
      this.player.physics.gravity = 650;
    } else if (isPogoing) {
      this.player.physics.gravity = 1200 * 0.85;
    } else if (isNearJumpApex) {
      this.player.physics.gravity = 1200 * 0.65;
    } else if (isFalling && this.player.inputReceiver.isPressed("MOVE_DOWN")) {
      this.player.physics.gravity = 1200 * 1.4;
    } else {
      this.player.physics.gravity = 1200;
    }
  }

  public handleHurtTimer(dt: number) {
    if (this.player.hurtTimer <= 0) return;

    this.player.hurtTimer -= dt;
    this.player.velocity.y += this.player.physics.gravity * dt;
    const knockbackFriction = 800.0;
    this.player.velocity.x = Math.sign(this.player.velocity.x) * Math.max(0, Math.abs(this.player.velocity.x) - knockbackFriction * dt);
  }

  public handleAttack() {
    if (this.player.inputReceiver.consumeBufferedAction("ATTACK", 100)) {
      this.player.fireballComponent.startCharging();

      if (this.player.meleeComponent.attackCooldownTimer <= 0) {
        if (this.player.inputReceiver.isPressed("MOVE_DOWN") && !this.player.physics.isGrounded) {
          this.player.meleeComponent.triggerAttack("down");
        } else if (this.player.inputReceiver.isPressed("MOVE_UP")) {
          this.player.meleeComponent.triggerAttack("up");
        } else {
          this.player.meleeComponent.triggerAttack("side");
        }
      }
    }

    if (this.player.inputReceiver.isJustReleased("ATTACK")) {
      const dirX = this.player.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
      const dirY = this.player.inputReceiver.isPressed("MOVE_UP")
        ? -1
        : this.player.inputReceiver.isPressed("MOVE_DOWN") && !this.player.physics.isGrounded
          ? 1
          : 0;
      this.player.fireballComponent.releaseCharge(dirX, dirY, this.player.facingDirection);
    }
  }

  public checkHazardContact() {
    if (this.player.health.isInvincible() || this.player.isDead) return;

    if (this.player.healComponent.isHealing) {
      this.player.healComponent.cancelHealing();
    }

    const hit = HazardSystem.checkContact(this.player, this.player.world.physicsWorld);
    if (hit && !this.player.isDead) {
      this.player.physics.isGrounded = false;
    }
  }
}
