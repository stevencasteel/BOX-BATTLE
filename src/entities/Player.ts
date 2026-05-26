import { PlayerFxRenderer } from "@/core/effects/PlayerFxRenderer";
import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { InputReceiverComponent } from "@/entities/components/InputReceiverComponent";
import { DashComponent } from "@/entities/components/DashComponent";
import { MeleeComponent } from "@/entities/components/MeleeComponent";
import { FireballComponent } from "@/entities/components/FireballComponent";
import { HealComponent } from "@/entities/components/HealComponent";
import { IWorld } from "@/core/Interfaces";
import { eventBroker } from "@/core/eventBroker";
import { UNITS } from "@/core/Units";

export class Player extends BaseEntity {
  public health!: HealthComponent;
  public physics!: PhysicsComponent;
  public inputReceiver!: InputReceiverComponent;
  public dashComponent!: DashComponent;
  public meleeComponent!: MeleeComponent;
  public fireballComponent!: FireballComponent;
  public healComponent!: HealComponent;

  private readonly moveSpeed: number = UNITS.PLAYER_MOVE_SPEED;
  private readonly jumpForce: number = UNITS.PLAYER_JUMP_FORCE;
  private readonly wallSlideSpeed: number = UNITS.PLAYER_WALL_SLIDE_SPEED;

  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  public hasDoubleJump: boolean = true;

  private wallCoyoteTimer: number = 0;
  private lastWallNormal: number = 0;
  private airtimeDuration: number = 0;

  public determinationCounter: number = 0;
  public healingCharges: number = 0;
  public readonly maxHealingCharges: number = 3;

  public hurtTimer: number = 0;
  public recoilTimer: number = 0;
  private unsubHurt!: () => void;
  private unsubChargeMaxed!: () => void;
  private maxFallSpeed: number = 0;
  private unsubPogo!: () => void;
  private unsubHealComplete!: () => void;
  private unsubHealCancel!: () => void;
  private unsubChargeCancel!: () => void;
  private unsubDamageDealt!: () => void;
  private unsubProjectileFired!: () => void;
  private wasOnWall: boolean = false;

  public doubleJumpDiskTimer: number = 0;
  public doubleJumpDiskPos: { x: number; y: number } = { x: 0, y: 0 };

  constructor(id: string, world: IWorld) {
    super(id, world);
    this.size = { width: 40, height: 80 };
    this.squashPivot = "center";

    this.position = { x: 0, y: 0 };
    this.previousPosition = { x: 0, y: 0 };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: UNITS.PLAYER_MAX_HP,
      invincibilityDuration: 1.5,
    });

    this.inputReceiver = this.addComponent(InputReceiverComponent, new InputReceiverComponent());
    this.dashComponent = this.addComponent(DashComponent, new DashComponent());
    this.meleeComponent = this.addComponent(MeleeComponent, new MeleeComponent());
    this.fireballComponent = this.addComponent(FireballComponent, new FireballComponent());
    this.healComponent = this.addComponent(HealComponent, new HealComponent());

    this.setupSubscribers();
  }

  public get isDashing(): boolean {
    return this.dashComponent.isDashing;
  }
  public get canDash(): boolean {
    return this.dashComponent.canDash;
  }
  public get isHealing(): boolean {
    return this.healComponent.isHealing;
  }
  public get isCharging(): boolean {
    return this.fireballComponent.isCharging;
  }
  public get chargeTimer(): number {
    return this.fireballComponent.chargeTimer;
  }
  public get attackActive(): boolean {
    return this.meleeComponent.attackActive;
  }
  public get attackDirection(): "side" | "up" | "down" | null {
    return this.meleeComponent.attackDirection;
  }

  private setupSubscribers() {
    this.unsubHurt = eventBroker.subscribe("PLAYER_HURT", () => {
      this.hurtTimer = 0.15;
      if (this.healComponent.isHealing) {
        this.healComponent.cancelHealing();
      }
      if (this.fireballComponent.isCharging) {
        this.fireballComponent.cancelCharging();
      }
    });

    this.unsubPogo = eventBroker.subscribe("PLAYER_POGOED", () => {
      this.hasDoubleJump = true;
      this.dashComponent.resetDashCharge();
    });

    this.unsubHealCancel = eventBroker.subscribe("HEAL_CANCEL", () => {
      eventBroker.publish("SPAWN_SPARKS", {
        x: this.position.x,
        y: this.position.y,
        angle: 0,
        color: "hsl(280, 80%, 65%)",
        radial: true,
        count: 18,
      });
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 4, duration: 0.15 });
    });

    this.unsubChargeCancel = eventBroker.subscribe("CHARGE_CANCEL", () => {
      eventBroker.publish("SPAWN_SPARKS", {
        x: this.position.x,
        y: this.position.y - 12,
        angle: 0,
        color: "hsl(142, 71%, 58%)",
        radial: true,
        count: 14,
      });
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 2, duration: 0.1 });
    });

    this.unsubHealComplete = eventBroker.subscribe("HEAL_COMPLETE", () => {
      this.healingCharges = Math.max(0, this.healingCharges - 1);
      eventBroker.publish("HEALING_CHARGES_CHANGED", { charges: this.healingCharges });

      const health = this.getComponent(HealthComponent);
      if (health) {
        health.currentHealth = Math.min(health.maxHealth, health.currentHealth + 1);
        eventBroker.publish("PLAYER_HEALED", {
          amount: 1,
          currentHealth: health.currentHealth,
          maxHealth: health.maxHealth,
        });
      }

      eventBroker.publish("SPAWN_BLAST", {
        x: this.position.x,
        y: this.position.y,
        color: "hsl(280, 100%, 75%)",
      });
      
      eventBroker.publish("SPAWN_BLAST", {
        x: this.position.x,
        y: this.position.y,
        color: "hsl(142, 71%, 58%)",
      });

      eventBroker.publish("SPAWN_SPARKS", {
        x: this.position.x,
        y: this.position.y,
        angle: 0,
        color: "hsl(285, 100%, 80%)",
        radial: true,
        count: 32,
        shape: "line",
        turbulence: 30
      });

      eventBroker.publish("SPAWN_SPARKS", {
        x: this.position.x,
        y: this.position.y,
        angle: 0,
        color: "hsl(142, 100%, 80%)",
        radial: true,
        count: 20,
        shape: "spark",
      });

      this.visualScale = { x: 0.90, y: 1.10 };
      this.scaleVelocity = { x: 6.0, y: -12.0 };
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 10, duration: 0.35 });
    });

    this.unsubChargeMaxed = eventBroker.subscribe("CHARGE_MAXED", () => {
      this.visualScale = { x: 1.10, y: 0.90 };
      this.scaleVelocity = { x: -10.0, y: 10.0 };
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 4, duration: 0.12 });
    });

    this.unsubDamageDealt = eventBroker.subscribe("DETERMINATION_CHANGED", () => {
      if (this.healingCharges >= this.maxHealingCharges) return;

      this.determinationCounter++;
      if (this.determinationCounter >= 5) {
        this.determinationCounter = 0;
        this.healingCharges = Math.min(this.maxHealingCharges, this.healingCharges + 1);
        eventBroker.publish("HEALING_CHARGES_CHANGED", { charges: this.healingCharges });
      }
    });

    this.unsubProjectileFired = eventBroker.subscribe("PLAYER_PROJECTILE_FIRED", ({ level, dirX, dirY }) => {
      const isLvl2 = level === 2;
      const recoilForce = isLvl2 ? 320 : 130;
      const baseLift = isLvl2 ? 150 : 70;
      const tiltForce = isLvl2 ? 14.0 : 6.0;

      this.physics.isGrounded = false;
      this.recoilTimer = isLvl2 ? 0.35 : 0.22;

      this.velocity.x -= dirX * recoilForce;
      this.velocity.y -= (baseLift + dirY * recoilForce);

      this.applyAngularImpulse(-dirX * tiltForce);

      const sqX = isLvl2 ? 0.90 : 0.96;
      const sqY = isLvl2 ? 1.10 : 1.04;
      this.visualScale = { x: sqX, y: sqY };
      this.scaleVelocity = { x: (isLvl2 ? 16 : 8), y: (isLvl2 ? -16 : -8) };

      const muzzleX = this.position.x + dirX * 30;
      const muzzleY = this.position.y + dirY * 30;

      eventBroker.publish("SPAWN_BLAST", {
        x: muzzleX,
        y: muzzleY,
        color: isLvl2 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)"
      });

      eventBroker.publish("SPAWN_SPARKS", {
        x: muzzleX,
        y: muzzleY,
        angle: Math.atan2(dirY, dirX),
        color: isLvl2 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)",
        radial: false,
        count: isLvl2 ? 16 : 8,
        shape: "line"
      });
    });
  }

  public update(dt: number) {
    if (this.isDead) {
      super.update(dt);
      return;
    }

    const moveAxis = this.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
    const currentOnWall = this.physics.isOnWallLeft || this.physics.isOnWallRight;
    const isPressedAgainstWall = currentOnWall && moveAxis !== 0 && Math.sign(moveAxis) === -this.lastWallNormal;
    const isSliding =
      !this.physics.isGrounded && this.velocity.y > 0 && this.wallCoyoteTimer > 0 && isPressedAgainstWall;

    this.updateWallVisuals(isPressedAgainstWall, isSliding);
    this.updateAirTime(dt);
    this.updateGravity(isSliding);
    this.handleHurtTimer(dt);

    if (this.recoilTimer > 0) {
      this.recoilTimer -= dt;
    }

    if (this.doubleJumpDiskTimer > 0) {
      this.doubleJumpDiskTimer -= dt;
    }

    if (!this.isCharging) {
      this.targetVisualScale = { x: 1.0, y: 1.0 };
      if (!this.physics.isGrounded) {
        this.targetRotation = Math.sign(this.velocity.x) * Math.min(0.08, (Math.abs(this.velocity.x) / 1000) * 0.08);
      } else {
        const moveAxis = this.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
        this.targetRotation = moveAxis * 0.12;
      }
    }

    if (this.hurtTimer > 0) {
      super.update(dt);
      return;
    }

    super.update(dt);

    this.handleWallCling(currentOnWall);
    this.wasOnWall = currentOnWall;

    if (this.healComponent.isHealing) {
      if (!this.inputReceiver.isPressed("MOVE_DOWN") || !this.inputReceiver.isPressed("JUMP")) {
        this.healComponent.cancelHealing();
      }
      return;
    }

    if (this.dashComponent.isDashing) {
      return;
    }

    this.updateCoyoteAndWallTimers(dt);
    this.updateMovement(moveAxis, dt);
    this.handleDash();

    if (this.dashComponent.isDashing) {
      super.update(dt);
      return;
    }

    this.handleJump(dt);
    this.handleJumpRelease();
    this.handleAttack();
    this.checkHazardContact();
  }

  private updateWallVisuals(isPressedAgainstWall: boolean, isSliding: boolean) {
    let targetScaleX = 1.0;
    let targetScaleY = 1.0;

    if (isPressedAgainstWall) {
      targetScaleX = 0.91;
      targetScaleY = 1.09;

      if (isSliding) {
        targetScaleX = 0.85;
        targetScaleY = 1.15;

        if (Math.random() < 0.35) {
          const contactX = this.position.x - this.lastWallNormal * (this.size.width / 2) + (Math.random() * 8 - 4);
          const contactY = this.position.y + (this.size.height / 2);
          eventBroker.publish("SPAWN_SPARKS", {
            x: contactX,
            y: contactY,
            angle: this.lastWallNormal === 1 ? -0.15 : Math.PI + 0.15,
            color: "hsl(45, 100%, 65%)",
            count: 1,
          });
        }
      }
    }

    this.targetVisualScale = { x: targetScaleX, y: targetScaleY };
  }

  private updateAirTime(dt: number) {
    if (!this.physics.isGrounded) {
      this.airtimeDuration += dt;
      this.maxFallSpeed = Math.max(this.maxFallSpeed, this.velocity.y);
    } else {
      if (this.airtimeDuration > 0.15) {
        const speedFactor = Math.max(0, (this.maxFallSpeed - 120) / 680);
        const factor = Math.min(1.0, 0.3 * speedFactor + 0.7 * speedFactor * speedFactor);
        if (factor > 0.01) {
          this.visualScale = { x: 1.0 + 0.28 * factor, y: 1.0 - 0.28 * factor };
          this.scaleVelocity = { x: 10 * factor, y: -18 * factor };
          this.velocity.x *= (1.0 - 0.8 * factor);
          eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
          eventBroker.publish("PLAYER_LANDED", undefined);
        }
      }
      this.airtimeDuration = 0;
      this.maxFallSpeed = 0;
    }
  }

  private updateGravity(isSliding: boolean) {
    const isFalling = !this.physics.isGrounded && this.velocity.y > 0;
    const isPogoing = this.meleeComponent.attackActive && this.meleeComponent.attackDirection === "down";
    const isNearJumpApex = !this.physics.isGrounded && Math.abs(this.velocity.y) < 120;

    if (isSliding) {
      this.physics.gravity = 650;
    } else if (isPogoing) {
      this.physics.gravity = 1200 * 0.85;
    } else if (isNearJumpApex) {
      this.physics.gravity = 1200 * 0.65;
    } else if (isFalling && this.inputReceiver.isPressed("MOVE_DOWN")) {
      this.physics.gravity = 1200 * 1.4;
    } else {
      this.physics.gravity = 1200;
    }
  }

  private handleHurtTimer(dt: number) {
    if (this.hurtTimer <= 0) return;

    this.hurtTimer -= dt;
    this.velocity.y += this.physics.gravity * dt;
    const knockbackFriction = 800.0;
    this.velocity.x = Math.sign(this.velocity.x) * Math.max(0, Math.abs(this.velocity.x) - knockbackFriction * dt);
  }

  private handleWallCling(currentOnWall: boolean) {
    if (!currentOnWall || this.wasOnWall || this.physics.isGrounded) return;

    this.visualScale = { x: 0.76, y: 1.24 };

    const impactSide = this.physics.isOnWallLeft ? -1 : 1;
    const wallX = this.position.x + impactSide * (this.size.width / 2);
    
    eventBroker.publish("SPAWN_DUST", { x: wallX, y: this.position.y, direction: "vertical" });
    eventBroker.publish("SPAWN_SPARKS", {
      x: wallX,
      y: this.position.y,
      angle: impactSide > 0 ? Math.PI : 0,
      color: "rgba(255, 255, 255, 0.55)",
      count: 6,
    });
  }

  private updateCoyoteAndWallTimers(dt: number) {
    if (this.physics.isGrounded) {
      this.coyoteTimer = 0.15;
      this.hasDoubleJump = true;
      this.dashComponent.resetDashCharge();
    } else {
      this.coyoteTimer -= dt;
    }

    if (this.physics.isOnWallLeft) {
      this.wallCoyoteTimer = 0.1;
      this.lastWallNormal = 1;
      this.hasDoubleJump = true;
      this.dashComponent.resetDashCharge();
    } else if (this.physics.isOnWallRight) {
      this.wallCoyoteTimer = 0.1;
      this.lastWallNormal = -1;
      this.hasDoubleJump = true;
      this.dashComponent.resetDashCharge();
    } else {
      this.wallCoyoteTimer -= dt;
    }
  }

  private updateMovement(moveAxis: number, dt: number) {
    if (this.meleeComponent.attackActive) {
      const friction = 2000.0;
      this.velocity.x = Math.sign(this.velocity.x) * Math.max(0, Math.abs(this.velocity.x) - friction * dt);
    } else {
      const targetSpeed = moveAxis * this.moveSpeed;
      let rate = moveAxis !== 0 ? UNITS.PLAYER_ACCEL : UNITS.PLAYER_DECEL;
      if (this.recoilTimer > 0) {
        rate = rate * 0.15;
      }
      this.velocity.x += (targetSpeed - this.velocity.x) * rate * dt;
    }

    if (moveAxis !== 0) {
      this.facingDirection = Math.sign(moveAxis);
    }

    if (!this.physics.isGrounded && this.velocity.y > 0 && this.wallCoyoteTimer > 0) {
      if (moveAxis !== 0 && Math.sign(moveAxis) === -this.lastWallNormal) {
        this.velocity.y = Math.min(this.velocity.y, this.wallSlideSpeed);
      }
    }
  }

  private handleDash() {
    if (
      !this.inputReceiver.consumeBufferedAction("DASH", 100) ||
      !this.dashComponent.canDash ||
      this.dashComponent.dashCooldown > 0
    ) {
      return;
    }

    let dirX = this.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
    let dirY = 0;
    if (this.inputReceiver.isPressed("MOVE_UP")) {
      dirY = -1;
    } else if (this.inputReceiver.isPressed("MOVE_DOWN")) {
      dirY = 1;
    }

    if (dirX === 0 && dirY === 0) {
      dirX = this.facingDirection;
    }

    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    const normX = dirX / len;
    const normY = dirY / len;

    this.dashComponent.triggerDash(normX, normY);
    this.visualScale = { x: 1.25, y: 0.75 };
  }

  private handleJump(dt: number) {
    if (!this.inputReceiver.consumeBufferedAction("JUMP", 100)) {
      this.jumpBufferTimer -= dt;
      return;
    }

    this.jumpBufferTimer = 0.1;
    this.resolveJump();
  }

  private resolveJump() {
    if (this.inputReceiver.isPressed("MOVE_DOWN") && this.isStandingOnOneway()) {
      this.physics.disablePlatformCollisionTimer = 0.25;
      this.position.y += 12;
      this.velocity.y = 180;
      this.physics.isGrounded = false;
      this.jumpBufferTimer = 0;
    } else if (
      this.inputReceiver.isPressed("MOVE_DOWN") &&
      this.physics.isGrounded &&
      this.healingCharges > 0 &&
      this.health.currentHealth < this.health.maxHealth
    ) {
      this.healComponent.startHealing();
      this.jumpBufferTimer = 0;
    } else if (this.coyoteTimer > 0) {
      this.performJump();
    } else if (this.wallCoyoteTimer > 0) {
      this.velocity.y = -this.jumpForce;
      this.velocity.x = this.lastWallNormal * 1650;
      this.coyoteTimer = 0;
      this.wallCoyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.visualScale = { x: 0.82, y: 1.18 };
      this.dashComponent.resetDashCharge();

          const wallX = this.position.x - this.lastWallNormal * (this.size.width / 2);
          eventBroker.publish("SPAWN_DUST", { x: wallX, y: this.position.y, direction: "vertical" });
          eventBroker.publish("PLAYER_JUMPED", undefined);
        } else if (this.hasDoubleJump) {
          this.velocity.y = -this.jumpForce;
          this.hasDoubleJump = false;
          this.jumpBufferTimer = 0;
          this.visualScale = { x: 0.82, y: 1.18 };

          this.doubleJumpDiskTimer = 0.22;
          this.doubleJumpDiskPos = { x: this.position.x, y: this.position.y + this.size.height / 2 };

          eventBroker.publish("PLAYER_JUMPED", undefined);
        }
      }

      private performJump() {
        this.velocity.y = -this.jumpForce;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.visualScale = { x: 0.82, y: 1.18 };
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
        eventBroker.publish("PLAYER_JUMPED", undefined);
      }

      private handleJumpRelease() {
        if (this.inputReceiver.isJustReleased("JUMP") && this.velocity.y < 0) {
          this.velocity.y *= 0.4;
        }
      }

      private handleAttack() {
        if (this.inputReceiver.consumeBufferedAction("ATTACK", 100)) {
          this.fireballComponent.startCharging();

          if (this.meleeComponent.attackCooldownTimer <= 0) {
            if (this.inputReceiver.isPressed("MOVE_DOWN") && !this.physics.isGrounded) {
              this.meleeComponent.triggerAttack("down");
            } else if (this.inputReceiver.isPressed("MOVE_UP")) {
              this.meleeComponent.triggerAttack("up");
            } else {
              this.meleeComponent.triggerAttack("side");
            }
          }
        }

        if (this.inputReceiver.isJustReleased("ATTACK")) {
          const dirX = this.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
          const dirY = this.inputReceiver.isPressed("MOVE_UP")
            ? -1
            : this.inputReceiver.isPressed("MOVE_DOWN") && !this.physics.isGrounded
              ? 1
              : 0;
          this.fireballComponent.releaseCharge(dirX, dirY, this.facingDirection);
        }
      }

      private isStandingOnOneway(): boolean {
        const ownerHalfH = this.size.height / 2;
        const feetY = this.position.y + ownerHalfH;
        const halfW = this.size.width / 2;

        for (const platform of this.world.physicsWorld.onewayPlatforms) {
          if (this.position.x + halfW > platform.x && this.position.x - halfW < platform.x + platform.width) {
            if (Math.abs(feetY - platform.y) <= 12) {
              return true;
            }
          }
        }
        return false;
      }

      private checkHazardContact() {
        if (this.health.isInvincible() || this.isDead) return;

        const halfW = this.size.width / 2;
        const halfH = this.size.height / 2;

        for (const hazard of this.world.physicsWorld.hazards) {
          const isHit =
            this.position.x + halfW > hazard.x &&
            this.position.x - halfW < hazard.x + hazard.width &&
            this.position.y + halfH > hazard.y &&
            this.position.y - halfH < hazard.y + hazard.height;

          if (isHit && this.velocity.y >= 0) {
            if (this.healComponent.isHealing) {
              this.healComponent.cancelHealing();
            }

            eventBroker.publish("PLAYER_SPIKED", { x: this.position.x });
            const damaged = this.health.takeDamage(UNITS.HAZARD_SPIKE_DAMAGE);
            if (damaged && !this.isDead) {
              this.velocity.y = -550;
              this.physics.isGrounded = false;
              this.visualScale = { x: 0.5, y: 1.5 };
              this.scaleVelocity = { x: 10.0, y: -15.0 };
            }
            break;
          }
        }
      }

      public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
        if (this.isDead) return;

        const alphaVal = alpha !== undefined ? alpha : 1.0;
        const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
        const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

        for (const ghost of this.dashComponent.ghosts) {
          ctx.fillStyle = `hsla(142, 71%, 58%, ${ghost.opacity})`;
          const gWidth = this.size.width * this.visualScale.x;
          const gHeight = this.size.height * this.visualScale.y;
          const gFeetY = ghost.y + this.size.height / 2;
          ctx.fillRect(ghost.x - gWidth / 2, gFeetY - gHeight, gWidth, gHeight);
        }

        if (this.doubleJumpDiskTimer > 0) {
          const p = 1.0 - this.doubleJumpDiskTimer / 0.22;
          const alphaDisk = (1.0 - p) * 0.8;
          const radius = 18 + p * 44;

          ctx.save();
          ctx.translate(this.doubleJumpDiskPos.x, this.doubleJumpDiskPos.y);

          ctx.strokeStyle = `hsla(142, 71%, 58%, ${alphaDisk})`;
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.ellipse(0, 0, radius, radius * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = `hsla(142, 100%, 80%, ${alphaDisk * 0.5})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 0.6, radius * 0.6 * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }

        const vWidth = this.size.width * this.visualScale.x;
        const vHeight = this.size.height * this.visualScale.y;
        const feetY = drawY + this.size.height / 2;

        const nowTime = performance.now();
        const healCounts = { back: 0, front: 0 };
        const chargeCounts = { back: 0, front: 0 };

        if (this.isHealing) {
          const progress = Math.max(0, Math.min(1.0, (UNITS.HEAL_DURATION - this.healComponent.healTimer) / UNITS.HEAL_DURATION));
          PlayerFxRenderer.prepareHealSegments(nowTime, progress, healCounts);
        }

        if (this.isCharging) {
          PlayerFxRenderer.prepareChargeSegments(nowTime, this.chargeTimer, this.size.height, chargeCounts);
        }

        ctx.save();
        ctx.translate(drawX, feetY);
        ctx.rotate(this.rotation);

        if (this.isHealing) {
          ctx.save();
          ctx.lineWidth = 3.5;
          ctx.lineCap = "round";
          const progress = Math.max(0, Math.min(1.0, (UNITS.HEAL_DURATION - this.healComponent.healTimer) / UNITS.HEAL_DURATION));
          PlayerFxRenderer.renderHealBuffer(ctx, true, healCounts.back, progress);
          ctx.restore();
        }

        if (this.isCharging) {
          ctx.save();
          ctx.lineCap = "round";
          PlayerFxRenderer.renderChargeBuffer(ctx, true, chargeCounts.back);
          ctx.restore();
        }

        if (this.health.isFlashing()) {
          ctx.fillStyle = "white";
        } else {
          ctx.fillStyle = "hsl(142, 71%, 58%)";
        }

        ctx.fillRect(-vWidth / 2, -vHeight, vWidth, vHeight);

        const localCenterX = 0;
        const localCenterY = -this.size.height / 2;

        if (this.isHealing) {
          ctx.save();
          const progress = Math.max(0, Math.min(1.0, (UNITS.HEAL_DURATION - this.healComponent.healTimer) / UNITS.HEAL_DURATION));
          const baseW = this.size.width * (1.15 + progress * 0.75);
          const baseH = this.size.height * (1.1 + progress * 0.55);

          const auraColors = [
            'hsla(280, 90%, 25%, 0.35)',
            'hsla(285, 95%, 45%, 0.55)',
            'hsla(290, 100%, 75%, 0.8)',
            'hsla(0, 0%, 100%, 0.95)'
          ];

          ctx.globalCompositeOperation = "lighter";

          auraColors.forEach((color, layerIdx) => {
            ctx.fillStyle = color;
            ctx.beginPath();

            const scaleFactor = 1.0 - layerIdx * 0.22;
            const width = baseW * scaleFactor;
            const height = baseH * scaleFactor;

            const bottomY = 0;
            const topY = -height;

            ctx.moveTo(-width / 2, bottomY);

            const leftSteps = 8;
            for (let j = 1; j <= leftSteps; j++) {
              const t = j / leftSteps;
              const currentY = bottomY - height * t;
              const angle = nowTime * 0.055 + j * 2.3 + layerIdx * 1.5;
              const spikeDist = (12 + progress * 16) * (1 - t * 0.5) * Math.sin(angle);
              const currentX = -width / 2 * (1 - t) + spikeDist;
              ctx.lineTo(currentX, currentY);
            }

            ctx.lineTo(0, topY);

            const rightSteps = 8;
            for (let j = rightSteps - 1; j >= 0; j--) {
              const t = j / rightSteps;
              const currentY = bottomY - height * t;
              const angle = nowTime * 0.055 + j * 2.3 + layerIdx * 1.5 + Math.PI;
              const spikeDist = (12 + progress * 16) * (1 - t * 0.5) * Math.sin(angle);
              const currentX = width / 2 * (1 - t) + spikeDist;
              ctx.lineTo(currentX, currentY);
            }

            ctx.lineTo(width / 2, bottomY);
            ctx.closePath();
            ctx.fill();
          });

          ctx.restore();

          ctx.save();
          ctx.lineWidth = 3.5;
          ctx.lineCap = "round";
          PlayerFxRenderer.renderHealBuffer(ctx, false, healCounts.front, progress);
          ctx.restore();
        }

        if (this.isCharging) {
          const chargeProgress = Math.max(0, Math.min(1.0, this.chargeTimer / UNITS.CHARGE_LVL2_TIME));
          const isLvl2 = this.chargeTimer >= UNITS.CHARGE_LVL2_TIME;

          ctx.save();
          ctx.globalCompositeOperation = "lighter";

          const coreRadius = (8 + chargeProgress * 14);
          const coreGrad = ctx.createRadialGradient(
            localCenterX, localCenterY, 0,
            localCenterX, localCenterY, coreRadius
          );
          coreGrad.addColorStop(0.0, '#ffffff');
          coreGrad.addColorStop(0.3, isLvl2 ? 'hsl(45, 100%, 75%)' : 'hsl(142, 100%, 80%)');
          coreGrad.addColorStop(1.0, 'rgba(255,255,255,0)');
          
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(localCenterX, localCenterY, coreRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          ctx.lineCap = "round";
          PlayerFxRenderer.renderChargeBuffer(ctx, false, chargeCounts.front);
          ctx.restore();

          if (chargeProgress > 0.5) {
            const dischargeCount = isLvl2 ? 3 : 1;
            ctx.strokeStyle = isLvl2 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(132, 239, 158, 0.8)';
            ctx.lineWidth = isLvl2 ? 1.5 : 1.0;
            
            for (let d = 0; d < dischargeCount; d++) {
              if (Math.random() < 0.35) {
                const startAngle = Math.random() * Math.PI * 2;
                const rMax = (this.size.height * 0.35) + 20 * chargeProgress;
                
                ctx.beginPath();
                const cx = localCenterX + Math.cos(startAngle) * rMax;
                const cy = localCenterY + Math.sin(startAngle) * rMax;
                ctx.moveTo(cx, cy);

                const steps = 3;
                for (let s = 1; s <= steps; s++) {
                  const t = s / steps;
                  const nextAngle = startAngle + (Math.random() * 0.6 - 0.3);
                  const nextRadius = rMax * (1.0 - t);
                  const targetX = localCenterX + Math.cos(nextAngle) * nextRadius;
                  const targetY = localCenterY + Math.sin(nextAngle) * nextRadius;
                  
                  ctx.lineTo(targetX, targetY);
                }
                ctx.stroke();
              }
            }
          }

          ctx.restore();
        }

        ctx.restore();
      }

      public teardown() {
        this.unsubHurt();
        this.unsubPogo();
        this.unsubHealComplete();
        this.unsubHealCancel();
        this.unsubChargeMaxed();
        this.unsubChargeCancel();
        this.unsubDamageDealt();
        if (this.unsubProjectileFired) {
          this.unsubProjectileFired();
        }
        super.teardown();
      }
    }