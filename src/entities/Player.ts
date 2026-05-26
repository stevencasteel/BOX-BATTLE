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
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
    });

    this.unsubChargeMaxed = eventBroker.subscribe("CHARGE_MAXED", () => {
      this.visualScale = { x: 1.55, y: 0.45 }; // Extreme squished visual pop
      this.scaleVelocity = { x: -35.0, y: 35.0 }; // Fast, rubbery spring rebound
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 6, duration: 0.15 });
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
      const kbForce = level === 2 ? 160 : 55;
      const tiltForce = level === 2 ? 6.0 : 2.5;

      this.applyKineticImpulse(-dirX * kbForce, -dirY * kbForce);
      this.applyAngularImpulse(-dirX * tiltForce);

      const sqX = level === 2 ? 0.94 : 0.98;
      const sqY = level === 2 ? 1.06 : 1.02;
      this.visualScale = { x: sqX, y: sqY };
      this.scaleVelocity = { x: (level === 2 ? 12 : 5), y: (level === 2 ? -12 : -5) };

      // Spawn muzzle blast sparks and dust ring at projectile launch coordinate
      const muzzleX = this.position.x + dirX * 30;
      const muzzleY = this.position.y + dirY * 30;

      eventBroker.publish("SPAWN_BLAST", {
        x: muzzleX,
        y: muzzleY,
        color: level === 2 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)"
      });

      eventBroker.publish("SPAWN_SPARKS", {
        x: muzzleX,
        y: muzzleY,
        angle: Math.atan2(dirY, dirX),
        color: level === 2 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)",
        radial: false,
        count: level === 2 ? 16 : 8,
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

    let targetRotation = 0;
    if (this.physics.isGrounded && !this.meleeComponent.attackActive && !this.healComponent.isHealing) {
      targetRotation = moveAxis * 0.12;
    } else if (!this.physics.isGrounded && !this.meleeComponent.attackActive) {
      targetRotation = Math.sign(this.velocity.x) * Math.min(0.08, (Math.abs(this.velocity.x) / 1000) * 0.08);
    }

    this.targetRotation = targetRotation;

if (this.isCharging) {
      const progress = Math.max(0, Math.min(1.0, this.chargeTimer / UNITS.CHARGE_LVL2_TIME));
      const isLvl2 = this.chargeTimer >= UNITS.CHARGE_LVL2_TIME;

      const time = performance.now();
      const pulse = Math.sin(time * 0.045) * 0.06 * progress;
      const shiverX = (Math.random() * 0.03 - 0.015) * progress;
      const shiverY = (Math.random() * 0.03 - 0.015) * progress;

      this.targetVisualScale = { 
        x: 1.0 - pulse + shiverX, 
        y: 1.0 + pulse + shiverY 
      };
      this.rotation = Math.sin(time * 0.09) * 0.04 * progress;

      // Swirling vortex accretion kii particles
      if (Math.random() < 0.3 + progress * 0.5) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 80 - progress * 50;
        const startX = this.position.x + Math.cos(angle) * radius;
        const startY = this.position.y - 12 + Math.sin(angle) * radius;

        const targetX = this.position.x;
        const targetY = this.position.y - 12;
        const vx = (targetX - startX) * 3.5;
        const vy = (targetY - startY) * 3.5;

        eventBroker.publish("SPAWN_SPARKS", {
          x: startX,
          y: startY,
          angle: Math.atan2(vy, vx),
          color: isLvl2 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)",
          count: 1,
          shape: "line",
          turbulence: 20
        });
      }

      // High-tension golden electric lightning line discharges arcing into core
      if (isLvl2 && Math.random() < 0.12) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 60;
        const startX = this.position.x + Math.cos(angle) * radius;
        const startY = this.position.y - 12 + Math.sin(angle) * radius;

        eventBroker.publish("SPAWN_SPARKS", {
          x: startX,
          y: startY,
          angle: angle + Math.PI,
          color: "hsl(190, 100%, 85%)",
          count: 3,
          shape: "line",
          turbulence: 45
        });
        eventBroker.publish("CAMERA_SHAKE", { amplitude: 2.5, duration: 0.08 });
      }
    } else {
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
        return;
      }

      this.velocity.x = 0;
      const now = performance.now();
      const progress = Math.max(0, Math.min(1.0, (UNITS.HEAL_DURATION - this.healComponent.healTimer) / UNITS.HEAL_DURATION));

      this.visualScale = { 
        x: 1.0 + Math.sin(now * 0.045) * 0.04 * progress, 
        y: 1.0 - Math.sin(now * 0.045) * 0.04 * progress 
      };

      // Spawning rising lightning and aura flare particles
      const sparkChance = 0.35 + progress * 0.65;
      if (Math.random() < sparkChance) {
        const spawnX = this.position.x + (Math.random() * 44 - 22);
        const spawnY = this.position.y + this.size.height / 2 - (Math.random() * this.size.height);
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

      // Vortex-style inward pulling kii accretion sparks
      if (Math.random() < 0.25 + progress * 0.45) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 90 - progress * 55;
        const startX = this.position.x + Math.cos(angle) * radius;
        const startY = this.position.y - 10 + Math.sin(angle) * radius;

        const targetX = this.position.x;
        const targetY = this.position.y - 10;
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

      // Pressure ground-dust emissions
      if (Math.random() < 0.08 + progress * 0.15) {
        eventBroker.publish("SPAWN_DUST", {
          x: this.position.x,
          y: this.position.y + this.size.height / 2,
          direction: "horizontal"
        });
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
      this.physics.gravity = 650; // Provide steady gravity friction to slide smoothly rather than sticking vertically
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
    
    // Spawn vertical wall dust puffs on impact alongside sparks
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
      const rate = moveAxis !== 0 ? UNITS.PLAYER_ACCEL : UNITS.PLAYER_DECEL;
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

      // Trigger Symmetrical vertical dust puffs up/down along the wall contact surface
      const wallX = this.position.x - this.lastWallNormal * (this.size.width / 2);
      eventBroker.publish("SPAWN_DUST", { x: wallX, y: this.position.y, direction: "vertical" });
      eventBroker.publish("PLAYER_JUMPED", undefined);
    } else if (this.hasDoubleJump) {
      this.velocity.y = -this.jumpForce;
      this.hasDoubleJump = false;
      this.jumpBufferTimer = 0;
      this.visualScale = { x: 0.82, y: 1.18 };
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

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;
    const feetY = drawY + this.size.height / 2;

    ctx.save();
    ctx.translate(drawX, feetY);
    ctx.rotate(this.rotation);

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "hsl(142, 71%, 58%)";
    }

    ctx.shadowColor = "rgba(34, 197, 94, 0.4)";
    ctx.shadowBlur = this.isDashing ? 25 : 15;

    ctx.fillRect(-vWidth / 2, -vHeight, vWidth, vHeight);
    ctx.shadowBlur = 0;

    const localCenterX = 0;
    const localCenterY = -this.size.height / 2;

    if (this.isHealing) {
      const nowTime = performance.now();
      const progress = Math.max(0, Math.min(1.0, (UNITS.HEAL_DURATION - this.healComponent.healTimer) / UNITS.HEAL_DURATION));

      ctx.save();
      ctx.shadowColor = "rgba(168, 85, 247, 0.95)";
      ctx.shadowBlur = 20 + progress * 20;

      const baseW = this.size.width * (1.1 + progress * 0.6);
      const baseH = this.size.height * (1.05 + progress * 0.4);

      const flameLayers = [
        { color: "hsla(280, 85%, 35%, 0.4)", waveSpeed: 0.03, heightScale: 1.0 },
        { color: "hsla(285, 90%, 55%, 0.6)", waveSpeed: 0.045, heightScale: 0.85 },
        { color: "hsla(290, 100%, 75%, 0.8)", waveSpeed: 0.06, heightScale: 0.7 }
      ];

      flameLayers.forEach((layer) => {
        ctx.fillStyle = layer.color;
        ctx.beginPath();

        const leftX = -baseW / 2;
        const rightX = baseW / 2;
        const bottomY = 0;

        ctx.moveTo(leftX, bottomY);

        const segments = 10;
        for (let j = 1; j <= segments; j++) {
          const t = j / segments;
          const currentY = -baseH * t * layer.heightScale;
          const wiggleAmp = (10 + progress * 14) * (1 - t * 0.6);
          const wiggle = Math.sin(nowTime * layer.waveSpeed + j * 1.5) * wiggleAmp;
          const currentX = leftX + (rightX - leftX) * t * 0.1 + wiggle;
          ctx.lineTo(currentX, currentY);
        }

        for (let j = segments; j >= 0; j--) {
          const t = j / segments;
          const currentY = -baseH * t * layer.heightScale;
          const wiggleAmp = (10 + progress * 14) * (1 - t * 0.6);
          const wiggle = Math.sin(nowTime * layer.waveSpeed + j * 1.5 + Math.PI) * wiggleAmp;
          const currentX = rightX - (rightX - leftX) * t * 0.1 + wiggle;
          ctx.lineTo(currentX, currentY);
        }

        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();

      // Ground crack concentric ellipse
      ctx.save();
      ctx.strokeStyle = "hsl(280, 85%, 65%)";
      ctx.lineWidth = 1.5 + progress * 2.5;
      ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
      ctx.shadowBlur = 10;

      const ringCycle = (nowTime * 0.005) % 1.0;
      const ringRadius = (this.size.width * 1.1) + ringCycle * 60;
      const ringOpacity = Math.max(0, 1.0 - ringCycle);

      ctx.globalAlpha = ringOpacity;
      ctx.beginPath();
      ctx.ellipse(localCenterX, 0, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Body trembling shudder
      const tremble = (Math.random() * 2 - 1) * (1.0 + progress * 4.5);
      ctx.translate(tremble, tremble);
    }

if (this.isCharging) {
      const nowTime = performance.now();
      const progress = Math.max(0, Math.min(1.0, this.chargeTimer / UNITS.CHARGE_LVL2_TIME));
      const isLvl2 = this.chargeTimer >= UNITS.CHARGE_LVL2_TIME;

      ctx.save();
      const glowColor = isLvl2 
        ? "rgba(234, 179, 8, 0.9)" 
        : `rgba(34, 197, 94, ${0.4 + progress * 0.5})`;
      
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 15 + progress * 20;

      const shieldCount = isLvl2 ? 3 : 2;
      for (let s = 0; s < shieldCount; s++) {
        const rotationSpeed = (s % 2 === 0 ? 1 : -1) * 0.003 * nowTime;
        const pulse = Math.sin(nowTime * 0.02 + s * 2) * 6 * progress;
        const baseRadius = (this.size.height * 0.35) + s * 14 * progress + pulse;

        ctx.strokeStyle = isLvl2 
          ? (s === 2 ? "rgba(255, 255, 255, 0.95)" : "rgba(234, 179, 8, 0.8)") 
          : "rgba(34, 197, 94, 0.65)";
        ctx.lineWidth = isLvl2 ? (s === 2 ? 3 : 1.5) : 1.0;

        ctx.beginPath();
        const segments = 12;
        const step = (Math.PI * 2) / segments;
        for (let i = 0; i <= segments; i++) {
          const angle = i * step + rotationSpeed;
          const noise = (Math.sin(angle * 6 + nowTime * 0.05) * 4) * progress;
          const rx = localCenterX + Math.cos(angle) * (baseRadius + noise);
          const ry = localCenterY + Math.sin(angle) * (baseRadius + noise);

          if (i === 0) {
            ctx.moveTo(rx, ry);
          } else {
            ctx.lineTo(rx, ry);
          }
        }
        ctx.closePath();
        ctx.stroke();
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
