import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { InputReceiverComponent } from "@/entities/components/InputReceiverComponent";
import { DashComponent } from "@/entities/components/DashComponent";
import { MeleeComponent } from "@/entities/components/MeleeComponent";
import { FireballComponent } from "@/entities/components/FireballComponent";
import { HealComponent } from "@/entities/components/HealComponent";
import { IWorld, IDamageRecorder } from "@/core/Interfaces";
import { eventBroker } from "@/core/eventBroker";

export class Player extends BaseEntity implements IDamageRecorder {
  public health!: HealthComponent;
  public physics!: PhysicsComponent;
  public inputReceiver!: InputReceiverComponent;
  public dashComponent!: DashComponent;
  public meleeComponent!: MeleeComponent;
  public fireballComponent!: FireballComponent;
  public healComponent!: HealComponent;

  private readonly moveSpeed: number = 450;
  private readonly jumpForce: number = 680;
  private readonly wallSlideSpeed: number = 120;

  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  public hasDoubleJump: boolean = true;
  public facingDirection: number = 1;

  private wallCoyoteTimer: number = 0;
  private lastWallNormal: number = 0;

  public visualScale = { x: 1, y: 1 };
  private airtimeDuration: number = 0;

  public determinationCounter: number = 0;
  public healingCharges: number = 0;
  public readonly maxHealingCharges: number = 3;

  public hurtTimer: number = 0;
  private unsubHurt!: () => void;

  constructor(id: string, world: IWorld) {
    super(id, world);
    this.size = { width: 40, height: 80 };

    this.position = { x: 0, y: 0 };
    this.previousPosition = { x: 0, y: 0 };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 5,
      invincibilityDuration: 1.5
    });

    this.inputReceiver = this.addComponent(InputReceiverComponent, new InputReceiverComponent());
    this.dashComponent = this.addComponent(DashComponent, new DashComponent());
    this.meleeComponent = this.addComponent(MeleeComponent, new MeleeComponent());
    this.fireballComponent = this.addComponent(FireballComponent, new FireballComponent());
    this.healComponent = this.addComponent(HealComponent, new HealComponent());

    this.unsubHurt = eventBroker.subscribe("PLAYER_HURT", () => {
      this.hurtTimer = 0.15;
      if (this.healComponent.isHealing) {
        this.healComponent.cancelHealing();
      }
      if (this.fireballComponent.isCharging) {
        this.fireballComponent.cancelCharging();
      }
    });
  }

  public get isDashing(): boolean { return this.dashComponent.isDashing; }
  public get canDash(): boolean { return this.dashComponent.canDash; }
  public get isHealing(): boolean { return this.healComponent.isHealing; }
  public get isCharging(): boolean { return this.fireballComponent.isCharging; }
  public get chargeTimer(): number { return this.fireballComponent.chargeTimer; }
  public get attackActive(): boolean { return this.meleeComponent.attackActive; }
  public get attackDirection(): "side" | "up" | "down" | null { return this.meleeComponent.attackDirection; }

  public update(dt: number) {
    if (this.isDead) {
      super.update(dt);
      return;
    }

    this.visualScale.x += (1 - this.visualScale.x) * 12 * dt;
    this.visualScale.y += (1 - this.visualScale.y) * 12 * dt;

    if (!this.physics.isGrounded) {
      this.airtimeDuration += dt;
    } else {
      if (this.airtimeDuration > 0.08) {
        this.visualScale = { x: 1.22, y: 0.78 };
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
        eventBroker.publish("PLAYER_LANDED", undefined);
      }
      this.airtimeDuration = 0;
    }

    const isFalling = !this.physics.isGrounded && this.velocity.y > 0;
    const isPogoing = this.meleeComponent.attackActive && this.meleeComponent.attackDirection === "down";
    const isNearJumpApex = !this.physics.isGrounded && Math.abs(this.velocity.y) < 120;

    if (isPogoing) {
      this.physics.gravity = 1200 * 0.85;
    } else if (isNearJumpApex) {
      this.physics.gravity = 1200 * 0.65;
    } else if (isFalling && this.inputReceiver.isPressed("MOVE_DOWN")) {
      this.physics.gravity = 1200 * 1.4;
    } else {
      this.physics.gravity = 1200;
    }

    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      this.velocity.y += this.physics.gravity * dt;
      const knockbackFriction = 800.0;
      this.velocity.x = Math.sign(this.velocity.x) * Math.max(0, Math.abs(this.velocity.x) - knockbackFriction * dt);
      
      super.update(dt);
      return;
    }

    super.update(dt);

    if (this.healComponent.isHealing) {
      if (!this.inputReceiver.isPressed("MOVE_DOWN") || !this.inputReceiver.isPressed("JUMP")) {
        this.healComponent.cancelHealing();
      }
      return;
    }

    if (this.dashComponent.isDashing) {
      return;
    }

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

    const moveAxis = this.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
    
    if (this.meleeComponent.attackActive) {
      const friction = 2000.0;
      this.velocity.x = Math.sign(this.velocity.x) * Math.max(0, Math.abs(this.velocity.x) - friction * dt);
    } else {
      this.velocity.x = moveAxis * this.moveSpeed;
    }

    if (moveAxis !== 0) {
      this.facingDirection = Math.sign(moveAxis);
    }

    if (!this.physics.isGrounded && this.velocity.y > 0 && this.wallCoyoteTimer > 0) {
      if (moveAxis !== 0 && Math.sign(moveAxis) === -this.lastWallNormal) {
        this.velocity.y = Math.min(this.velocity.y, this.wallSlideSpeed);
      }
    }

    if (this.inputReceiver.consumeBufferedAction("DASH", 100) && this.dashComponent.canDash && this.dashComponent.dashCooldown <= 0) {
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
      super.update(dt);
      return;
    }

    if (this.inputReceiver.consumeBufferedAction("JUMP", 100)) {
      this.jumpBufferTimer = 0.1;
    } else {
      this.jumpBufferTimer -= dt;
    }

    if (this.jumpBufferTimer > 0) {
      if (this.inputReceiver.isPressed("MOVE_DOWN") && this.isStandingOnOneway()) {
        this.physics.disablePlatformCollisionTimer = 0.25;
        this.position.y += 12;
        this.velocity.y = 180;
        this.physics.isGrounded = false;
        this.jumpBufferTimer = 0;
      }
      else if (this.inputReceiver.isPressed("MOVE_DOWN") && this.physics.isGrounded && this.healingCharges > 0 && this.health.currentHealth < this.health.maxHealth) {
        this.healComponent.startHealing();
        this.jumpBufferTimer = 0;
      }
      else if (this.coyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.visualScale = { x: 0.82, y: 1.18 };
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
        eventBroker.publish("PLAYER_JUMPED", undefined);
      } else if (this.wallCoyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.velocity.x = this.lastWallNormal * 1650;
        this.wallCoyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.dashComponent.resetDashCharge();
        this.visualScale = { x: 0.82, y: 1.18 };
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
        eventBroker.publish("PLAYER_JUMPED", undefined);
      } else if (this.hasDoubleJump) {
        this.velocity.y = -this.jumpForce;
        this.hasDoubleJump = false;
        this.jumpBufferTimer = 0;
        this.visualScale = { x: 0.82, y: 1.18 };
        eventBroker.publish("PLAYER_JUMPED", undefined);
      }
    }

    if (this.inputReceiver.isJustReleased("JUMP") && this.velocity.y < 0) {
      this.velocity.y *= 0.4;
    }

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
      const dirY = this.inputReceiver.isPressed("MOVE_UP") ? -1 : (this.inputReceiver.isPressed("MOVE_DOWN") && !this.physics.isGrounded ? 1 : 0);
      this.fireballComponent.releaseCharge(dirX, dirY, this.facingDirection);
    }

    this.checkHazardContact();
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

  public registerDamageDealt() {
    if (this.healingCharges >= this.maxHealingCharges) return;

    this.determinationCounter++;
    if (this.determinationCounter >= 5) {
      this.determinationCounter = 0;
      this.healingCharges = Math.min(this.maxHealingCharges, this.healingCharges + 1);
      eventBroker.publish("HEALING_CHARGES_CHANGED", { charges: this.healingCharges });
    }
    eventBroker.publish("DETERMINATION_CHANGED", { determination: this.determinationCounter });
  }

  private checkHazardContact() {
    if (this.health.isInvincible() || this.isDead) return;

    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;

    for (const hazard of this.world.physicsWorld.hazards) {
      const isHit = (
        this.position.x + halfW > hazard.x &&
        this.position.x - halfW < hazard.x + hazard.width &&
        this.position.y + halfH > hazard.y &&
        this.position.y - halfH < hazard.y + hazard.height
      );

      if (isHit) {
        if (this.healComponent.isHealing) {
          this.healComponent.cancelHealing();
        }

        eventBroker.publish("PLAYER_SPIKED", undefined);
        const damaged = this.health.takeDamage(1);
        if (damaged && !this.isDead) {
          this.velocity.y = -550;
          this.physics.isGrounded = false;
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
      ctx.fillRect(
        ghost.x - gWidth / 2,
        gFeetY - gHeight,
        gWidth,
        gHeight
      );
    }

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "hsl(142, 71%, 58%)";
    }

    ctx.shadowColor = "rgba(34, 197, 94, 0.4)";
    ctx.shadowBlur = this.isDashing ? 25 : 15;

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;
    const feetY = drawY + this.size.height / 2;

    ctx.fillRect(
      drawX - vWidth / 2,
      feetY - vHeight,
      vWidth,
      vHeight
    );

    ctx.shadowBlur = 0;

    if (this.isHealing) {
      const cycle = performance.now() * 0.008;
      ctx.strokeStyle = "hsl(280, 80%, 65%)";
      ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;
      ctx.beginPath();

      const radius1 = 44 + Math.sin(cycle) * 8;
      const radius2 = 28 + Math.cos(cycle * 1.5) * 6;
      ctx.arc(drawX, drawY, radius1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(drawX, drawY, radius2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (this.isCharging && this.chargeTimer >= 0.25) {
      const isLvl2 = this.chargeTimer >= 1.12;
      ctx.strokeStyle = isLvl2 ? "white" : "rgba(34, 197, 94, 0.6)";
      ctx.lineWidth = isLvl2 ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(
        drawX,
        drawY,
        this.size.height * 0.6 + Math.sin(performance.now() * 0.05) * 4,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  public teardown() {
    this.unsubHurt();
    super.teardown();
  }
}
