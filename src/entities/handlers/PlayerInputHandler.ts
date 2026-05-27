import { Player } from "@/entities/Player";
import { TrigLUT } from "@/core/TrigLUT";
import { UNITS } from "@/core/Units";
import { setVec } from "@/core/VecUtils";

export class PlayerInputHandler {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  public getLastWallNormal(): number {
    return this.player.lastWallNormal;
  }

  public getWasOnWall(): boolean {
    return this.player.wasOnWall;
  }

  public updateWallVisuals(isPressedAgainstWall: boolean, isSliding: boolean) {
    let targetScaleX = 1.0;
    let targetScaleY = 1.0;

    if (isPressedAgainstWall) {
      targetScaleX = 0.91;
      targetScaleY = 1.09;

      if (isSliding) {
        targetScaleX = 0.85;
        targetScaleY = 1.15;

        if (TrigLUT.random() < 0.35) {
          const contactX = this.player.position.x - this.player.lastWallNormal * (this.player.size.width / 2) + (TrigLUT.random() * 8 - 4);
          const contactY = this.player.position.y + (this.player.size.height / 2);
          this.player.world.events.publishSpark(contactX, contactY, this.player.lastWallNormal === 1 ? -0.15 : Math.PI + 0.15, "hsl(45, 100%, 65%)", false, 1);
        }
      }
    }

    setVec(this.player.targetVisualScale, targetScaleX, targetScaleY);
  }

  public updateAirTime(dt: number) {
    if (!this.player.physics.isGrounded) {
      this.player.airtimeDuration += dt;
      this.player.maxFallSpeed = Math.max(this.player.maxFallSpeed, this.player.velocity.y);
    } else {
      if (this.player.airtimeDuration > 0.15) {
        const speedFactor = Math.max(0, (this.player.maxFallSpeed - 120) / 680);
        const factor = Math.min(1.0, 0.3 * speedFactor + 0.7 * speedFactor * speedFactor);
        if (factor > 0.01) {
          setVec(this.player.visualScale, 1.0 + 0.28 * factor, 1.0 - 0.28 * factor);
          setVec(this.player.scaleVelocity, 10 * factor, -18 * factor);
          this.player.velocity.x *= (1.0 - 0.8 * factor);
          this.player.world.events.publishDust(this.player.position.x, this.player.position.y + this.player.size.height / 2);
          this.player.world.events.publish("PLAYER_LANDED", undefined);
        }
      }
      this.player.airtimeDuration = 0;
      this.player.maxFallSpeed = 0;
    }
  }

  public handleWallCling(currentOnWall: boolean) {
    if (!currentOnWall || this.player.wasOnWall || this.player.physics.isGrounded) return;

    setVec(this.player.visualScale, 0.76, 1.24);

    const impactSide = this.player.physics.isOnWallLeft ? -1 : 1;
    const wallX = this.player.position.x + impactSide * (this.player.size.width / 2);

    this.player.world.events.publishDust(wallX, this.player.position.y, "vertical");
    this.player.world.events.publishSpark(wallX, this.player.position.y, impactSide > 0 ? Math.PI : 0, "rgba(255, 255, 255, 0.55)", false, 6);
  }

  public updateCoyoteAndWallTimers(dt: number) {
    if (this.player.physics.isGrounded) {
      this.player.coyoteTimer = 0.15;
      this.player.hasDoubleJump = true;
      this.player.dashComponent.resetDashCharge();
    } else {
      this.player.coyoteTimer -= dt;
    }

    if (this.player.physics.isOnWallLeft) {
      this.player.wallCoyoteTimer = 0.1;
      this.player.lastWallNormal = 1;
      this.player.hasDoubleJump = true;
      this.player.dashComponent.resetDashCharge();
    } else if (this.player.physics.isOnWallRight) {
      this.player.wallCoyoteTimer = 0.1;
      this.player.lastWallNormal = -1;
      this.player.hasDoubleJump = true;
      this.player.dashComponent.resetDashCharge();
    } else {
      this.player.wallCoyoteTimer -= dt;
    }
  }

  public updateMovement(moveAxis: number, dt: number) {
    if (this.player.meleeComponent.attackActive) {
      const friction = 2000.0;
      this.player.velocity.x = Math.sign(this.player.velocity.x) * Math.max(0, Math.abs(this.player.velocity.x) - friction * dt);
    } else {
      const targetSpeed = moveAxis * this.player.moveSpeed;
      let rate = moveAxis !== 0 ? UNITS.PLAYER_ACCEL : UNITS.PLAYER_DECEL;
      if (this.player.recoilTimer > 0) {
        rate = rate * 0.15;
      }
      this.player.velocity.x += (targetSpeed - this.player.velocity.x) * rate * dt;
    }

    if (moveAxis !== 0) {
      this.player.facingDirection = Math.sign(moveAxis);
    }

    if (!this.player.physics.isGrounded && this.player.velocity.y > 0 && this.player.wallCoyoteTimer > 0) {
      if (moveAxis !== 0 && Math.sign(moveAxis) === -this.player.lastWallNormal) {
        this.player.velocity.y = Math.min(this.player.velocity.y, this.player.wallSlideSpeed);
      }
    }
  }

  public handleDash() {
    if (
      !this.player.inputReceiver.consumeBufferedAction("DASH", 100) ||
      !this.player.dashComponent.canDash ||
      this.player.dashComponent.dashCooldown > 0
    ) {
      return;
    }

    let dirX = this.player.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
    let dirY = 0;
    if (this.player.inputReceiver.isPressed("MOVE_UP")) {
      dirY = -1;
    } else if (this.player.inputReceiver.isPressed("MOVE_DOWN")) {
      dirY = 1;
    }

    if (dirX === 0 && dirY === 0) {
      dirX = this.player.facingDirection;
    }

    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    const normX = dirX / len;
    const normY = dirY / len;

    this.player.dashComponent.triggerDash(normX, normY);
    setVec(this.player.visualScale, 1.25, 0.75);
  }

  public handleJump(dt: number) {
    if (!this.player.inputReceiver.consumeBufferedAction("JUMP", 100)) {
      this.player.jumpBufferTimer -= dt;
      return;
    }

    this.player.jumpBufferTimer = 0.1;
    this.resolveJump();
  }

  private resolveJump() {
    if (this.player.inputReceiver.isPressed("MOVE_DOWN") && this.isStandingOnOneway()) {
      this.player.physics.disablePlatformCollisionTimer = 0.25;
      this.player.position.y += 12;
      this.player.velocity.y = 180;
      this.player.physics.isGrounded = false;
      this.player.jumpBufferTimer = 0;
      this.player.world.events.publish("PLAYER_DROPPED", undefined);
    } else if (
      this.player.inputReceiver.isPressed("MOVE_DOWN") &&
      this.player.physics.isGrounded &&
      this.player.healingCharges > 0 &&
      this.player.health.currentHealth < this.player.health.maxHealth
    ) {
      this.player.healComponent.startHealing();
      this.player.jumpBufferTimer = 0;
    } else if (this.player.coyoteTimer > 0) {
      this.performJump();
    } else if (this.player.wallCoyoteTimer > 0) {
      this.player.velocity.y = -this.player.jumpForce;
      this.player.velocity.x = this.player.lastWallNormal * 1650;
      this.player.coyoteTimer = 0;
      this.player.wallCoyoteTimer = 0;
      this.player.jumpBufferTimer = 0;
      setVec(this.player.visualScale, 0.82, 1.18);
      this.player.dashComponent.resetDashCharge();

      const wallX = this.player.position.x - this.player.lastWallNormal * (this.player.size.width / 2);
      this.player.world.events.publishDust(wallX, this.player.position.y, "vertical");
      this.player.world.events.publish("PLAYER_JUMPED", undefined);
    } else if (this.player.hasDoubleJump) {
      this.player.velocity.y = -this.player.jumpForce;
      this.player.hasDoubleJump = false;
      this.player.jumpBufferTimer = 0;
      setVec(this.player.visualScale, 0.82, 1.18);

      this.player.doubleJumpDiskTimer = 0.22;
      setVec(this.player.doubleJumpDiskPos, this.player.position.x, this.player.position.y + this.player.size.height / 2);

      this.player.world.events.publish("PLAYER_JUMPED", undefined);
    }
  }

  private performJump() {
    this.player.velocity.y = -this.player.jumpForce;
    this.player.coyoteTimer = 0;
    this.player.jumpBufferTimer = 0;
    setVec(this.player.visualScale, 0.82, 1.18);
    this.player.world.events.publishDust(this.player.position.x, this.player.position.y + this.player.size.height / 2);
    this.player.world.events.publish("PLAYER_JUMPED", undefined);
  }

  public handleJumpRelease() {
    if (this.player.inputReceiver.isJustReleased("JUMP") && this.player.velocity.y < 0) {
      this.player.velocity.y *= 0.4;
    }
  }

  private isStandingOnOneway(): boolean {
    const ownerHalfH = this.player.size.height / 2;
    const feetY = this.player.position.y + ownerHalfH;
    const halfW = this.player.size.width / 2;

    for (const platform of this.player.world.physicsWorld.onewayPlatforms) {
      if (this.player.position.x + halfW > platform.x && this.player.position.x - halfW < platform.x + platform.width) {
        if (Math.abs(feetY - platform.y) <= 12) {
          return true;
        }
      }
    }
    return false;
  }
}
