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

  /* Coyote Time (Ledge Jump Grace Period): Grace window to register jump inputs after slipping off solid surfaces */
  private coyoteTimer: number = 0;
  /* Jump Buffering (Pre-ground Landing Inputs): Buffer window to capture pre-landing jump hits */
  private jumpBufferTimer: number = 0;
  public hasDoubleJump: boolean = true;
  public facingDirection: number = 1;

  /* Wall Coyote Time: Grace window to execute wall jumps after slipping off vertical walls */
  private wallCoyoteTimer: number = 0;
  private lastWallNormal: number = 0;

  /* Visual Squash and Stretch (Kinetic Weight): Visual scaling variables for compression on landing and extension on jumps */
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
      this.hurtTimer = 0.15; // Enable knockback input-stun window
      if (this.healComponent.isHealing) {
        this.healComponent.cancelHealing();
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

    /* Visual Squash and Stretch: Smoothly interpolate back to default 1.0 dimension ratios */
    this.visualScale.x += (1 - this.visualScale.x) * 12 * dt;
    this.visualScale.y += (1 - this.visualScale.y) * 12 * dt;

    if (!this.physics.isGrounded) {
      /* Track accumulated airtime to skip vertical squashes on micro-seams or subpixel jitters */
      this.airtimeDuration += dt;
    } else {
      if (this.airtimeDuration > 0.08) {
        /* Compress vertically upon hitting solid ground to represent landing compression */
        this.visualScale = { x: 1.22, y: 0.78 };
        /* Spawn Landing Dust Puff */
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
      }
      this.airtimeDuration = 0;
    }

    const isFalling = !this.physics.isGrounded && this.velocity.y > 0;
    const isPogoing = this.meleeComponent.attackActive && this.meleeComponent.attackDirection === "down";
    const isNearJumpApex = !this.physics.isGrounded && Math.abs(this.velocity.y) < 120;

    if (isPogoing) {
      /* Active Pogo: Slightly dampen gravity to assist mid-air bounce adjustments */
      this.physics.gravity = 1200 * 0.85;
    } else if (isNearJumpApex) {
      /* Apex Gravity Scaling (Jump Peak "Hang Time"): Scale down gravity at the peak of a jump for more air control */
      this.physics.gravity = 1200 * 0.65;
    } else if (isFalling && this.inputReceiver.isPressed("MOVE_DOWN")) {
      /* Fast Fall: Increase downward pull when pressing down */
      this.physics.gravity = 1200 * 1.4;
    } else {
      /* Standard Fall */
      this.physics.gravity = 1200;
    }

    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      // Let physics / gravity resolve
      this.velocity.y += this.physics.gravity * dt;
      // High friction/drag on horizontal velocity during knockback
      const knockbackFriction = 800.0;
      this.velocity.x = Math.sign(this.velocity.x) * Math.max(0, Math.abs(this.velocity.x) - knockbackFriction * dt);
      
      super.update(dt);
      return; // Stun active, cancel all key polling
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
      // Ground the player horizontally during melee slash
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
      /* Visual Squash and Stretch: Flatten horizontally on dash impulse */
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
        /* Visual Squash and Stretch: Stretch vertically on ground jump */
        this.visualScale = { x: 0.82, y: 1.18 };
        /* Spawn Jump Dust Puff */
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
      } else if (this.wallCoyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.velocity.x = this.lastWallNormal * 1650;
        this.wallCoyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.dashComponent.resetDashCharge();
        /* Visual Squash and Stretch: Stretch vertically on wall jump */
        this.visualScale = { x: 0.82, y: 1.18 };
        /* Spawn Wall Slide Dust Puff */
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
      } else if (this.hasDoubleJump) {
        this.velocity.y = -this.jumpForce;
        this.hasDoubleJump = false;
        this.jumpBufferTimer = 0;
        /* Visual Squash and Stretch: Stretch vertically on double jump */
        this.visualScale = { x: 0.82, y: 1.18 };
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

        const damaged = this.health.takeDamage(1);
        if (damaged && !this.isDead) {
          this.velocity.y = -550;
          this.physics.isGrounded = false;
        }
        break;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

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

    /* Render visual squash and stretch calculations on base fill bounds anchored to the ground */
    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;
    const feetY = this.position.y + this.size.height / 2;

    ctx.fillRect(
      this.position.x - vWidth / 2,
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
      ctx.arc(this.position.x, this.position.y, radius1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, radius2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (this.isCharging && this.chargeTimer >= 0.25) {
      const isLvl2 = this.chargeTimer >= 1.12;
      ctx.strokeStyle = isLvl2 ? "white" : "rgba(34, 197, 94, 0.6)";
      ctx.lineWidth = isLvl2 ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(
        this.position.x,
        this.position.y,
        this.size.height * 0.6 + Math.sin(performance.now() * 0.05) * 4,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    if (this.attackActive) {
      this.drawAttackVisual(ctx);
    }
  }

  private drawAttackVisual(ctx: CanvasRenderingContext2D) {
    const facing = this.facingDirection;
    ctx.lineCap = "round";

    /* Swipe & Smear calculations: Compute elapsed progress of the active sword slash */
    const progress = 1.0 - (this.meleeComponent.attackActiveTimer / 0.09);
    const opacity = Math.max(0, this.meleeComponent.attackActiveTimer / 0.09);

    if (this.attackDirection === "side") {
      const offset = facing * 35;
      const baseStart = -Math.PI / 2;
      const angleLength = Math.PI;
      const currentSweepAngle = angleLength * progress;

      const cx = this.position.x + offset;
      const cy = this.position.y;

      ctx.save();
      /* Apply flat lineCap to cleanly terminate lines, eliminating any capsule-shaped endpoints poking out */
      ctx.lineCap = "butt";

      /* Layer 1: Dual Razor-Sharp Trailing Speedlines (Draws sleek, thin speed trails mimicking wind friction) */
      const trailAngle = currentSweepAngle * 0.75;
      
      /* Outer Edge Speedline (Radius 88px, Width 4px) */
      ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.45})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        88,
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0 ? baseStart + trailAngle : Math.PI - (baseStart + trailAngle),
        facing < 0
      );
      ctx.stroke();

      /* Mid-Blade Speedline (Radius 65px, Width 2px) */
      ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.30})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        65,
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0 ? baseStart + trailAngle : Math.PI - (baseStart + trailAngle),
        facing < 0
      );
      ctx.stroke();

      /* Layer 2: Unified, Single-Filled Radial Gradient Wedge (Fuses white-hot core and green blade into one seamless object) */
      const gradient = ctx.createRadialGradient(cx, cy, 25, cx, cy, 95);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");                               // Inner transparent hollow
      gradient.addColorStop(0.20, `rgba(255, 255, 255, ${opacity})`);                      // Intense white-hot core (39px radius)
      gradient.addColorStop(0.50, `rgba(132, 239, 158, ${opacity * 0.95})`);               // Glowing neon-lime transition (60px radius)
      gradient.addColorStop(0.85, `rgba(34, 197, 94, ${opacity * 0.85})`);                // Rich green blade edge (84px radius)
      gradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");                                 // Soft outer fade-out (95px reach)

      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20 * opacity;
      
      ctx.beginPath();
      /* Draw Outer boundary arc (95px reach) */
      ctx.arc(
        cx,
        cy,
        95,
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle),
        facing < 0
      );
      /* Draw Inner boundary arc (25px reach) backward to close path */
      ctx.arc(
        cx,
        cy,
        25,
        facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle),
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    else if (this.attackDirection === "up") {
      /* Upward Splash: The 180-degree overhead canopy expands in radius rather than sweeping angles */
      const cx = this.position.x;
      const cy = this.position.y - 35;

      /* Burst expansion math: Explode radius outward from 30px to 95px over the active window */
      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      const gradient = ctx.createRadialGradient(cx, cy, currentInnerRadius, cx, cy, currentRadius);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.20, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.50, `rgba(132, 239, 158, ${opacity * 0.95})`);
      gradient.addColorStop(0.85, `rgba(34, 197, 94, ${opacity * 0.85})`);
      gradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");

      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20 * opacity;

      ctx.beginPath();
      /* Draw Outer expanding semi-circle pointing straight up (-PI to 0) */
      ctx.arc(cx, cy, currentRadius, -Math.PI, 0);
      /* Draw Inner boundary arc backward to close path */
      ctx.arc(cx, cy, currentInnerRadius, 0, -Math.PI, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    else if (this.attackDirection === "down") {
      /* Downward Splash: The 180-degree pogo thruster expands rapidly downward */
      const cx = this.position.x;
      const cy = this.position.y + 35;

      /* Burst expansion math: Explode radius outward from 30px to 95px over the active window */
      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      const gradient = ctx.createRadialGradient(cx, cy, currentInnerRadius, cx, cy, currentRadius);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.20, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.50, `rgba(132, 239, 158, ${opacity * 0.95})`);
      gradient.addColorStop(0.85, `rgba(34, 197, 94, ${opacity * 0.85})`);
      gradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");

      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20 * opacity;

      ctx.beginPath();
      /* Draw Outer expanding semi-circle pointing straight down (0 to PI) */
      ctx.arc(cx, cy, currentRadius, 0, Math.PI);
      /* Draw Inner boundary arc backward to close path */
      ctx.arc(cx, cy, currentInnerRadius, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  public teardown() {
    this.unsubHurt();
    super.teardown();
  }
}
