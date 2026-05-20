import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent, Rectangle } from "@/components/PhysicsComponent";
import { HealthComponent } from "@/components/HealthComponent";
import { inputProvider } from "@/core/InputProvider";
import { Registry } from "@/core/Registry";
import { soundSynth } from "@/core/SoundSynth";

export class Player extends BaseEntity {
  public health!: HealthComponent;
  private physics!: PhysicsComponent;
  
  private moveSpeed: number = 450;
  private jumpForce: number = 680;
  private wallSlideSpeed: number = 120;
  private dashSpeed: number = 1400;
  private pogoForce: number = 450;

  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private hasDoubleJump: boolean = true;
  private facingDirection: number = 1;

  private wallCoyoteTimer: number = 0;
  private lastWallNormal: number = 0;

  private isDashing: boolean = false;
  private dashTimer: number = 0;
  private dashCooldown: number = 0;
  private canDash: boolean = true;
  private dashDirection: number = 1;

  private attackCooldownTimer: number = 0;
  private attackActiveTimer: number = 0;
  private attackActive: boolean = false;
  private attackDirection: "side" | "up" | "down" | null = null;
  private hasHitEnemyThisSwing: boolean = false;

  constructor(id: string) {
    super(id);
    this.size = { width: 40, height: 80 }; 
    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 5,
      invincibilityDuration: 1.5 
    });
  }

  public update(dt: number) {
    if (this.isDead) {
      super.update(dt);
      return;
    }

    this.dashCooldown -= dt;
    this.attackCooldownTimer -= dt;
    this.attackActiveTimer -= dt;

    if (this.attackActive && this.attackActiveTimer <= 0) {
      this.attackActive = false;
      this.attackDirection = null;
    }

    if (this.isDashing) {
      this.dashTimer -= dt;
      this.velocity.x = this.dashDirection * this.dashSpeed;
      this.velocity.y = 0;

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.velocity.x *= 0.5; 
      }

      super.update(dt);
      return;
    }

    if (this.physics.isGrounded) {
      this.coyoteTimer = 0.1;
      this.hasDoubleJump = true;
      this.canDash = true;
    } else {
      this.coyoteTimer -= dt;
    }

    if (this.physics.isOnWallLeft) {
      this.wallCoyoteTimer = 0.05;
      this.lastWallNormal = 1; 
      this.hasDoubleJump = true;
      this.canDash = true;
    } else if (this.physics.isOnWallRight) {
      this.wallCoyoteTimer = 0.05;
      this.lastWallNormal = -1; 
      this.hasDoubleJump = true;
      this.canDash = true;
    } else {
      this.wallCoyoteTimer -= dt;
    }

    const moveAxis = inputProvider.getAxis("MOVE_LEFT", "MOVE_RIGHT");
    this.velocity.x = moveAxis * this.moveSpeed;

    if (moveAxis !== 0) {
      this.facingDirection = Math.sign(moveAxis);
    }

    if (!this.physics.isGrounded && this.velocity.y > 0 && this.wallCoyoteTimer > 0) {
      if (moveAxis !== 0 && Math.sign(moveAxis) === -this.lastWallNormal) {
        this.velocity.y = Math.min(this.velocity.y, this.wallSlideSpeed);
      }
    }

    if (inputProvider.isJustPressed("DASH") && this.canDash && this.dashCooldown <= 0) {
      this.isDashing = true;
      this.dashTimer = 0.15;
      this.dashCooldown = 0.5;
      this.canDash = false;
      this.dashDirection = moveAxis !== 0 ? Math.sign(moveAxis) : this.facingDirection;
      this.velocity.y = 0;
      soundSynth.playDash();
      
      super.update(dt);
      return;
    }

    if (inputProvider.isJustPressed("JUMP")) {
      this.jumpBufferTimer = 0.1;
    } else {
      this.jumpBufferTimer -= dt;
    }

    if (this.jumpBufferTimer > 0) {
      if (this.coyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        soundSynth.playJump();
      } else if (this.wallCoyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.velocity.x = this.lastWallNormal * 1650; 
        this.wallCoyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.canDash = true;
        soundSynth.playJump();
      } else if (this.hasDoubleJump) {
        this.velocity.y = -this.jumpForce;
        this.hasDoubleJump = false;
        this.jumpBufferTimer = 0;
        soundSynth.playJump();
      }
    }

    if (inputProvider.isJustReleased("JUMP") && this.velocity.y < 0) {
      this.velocity.y *= 0.4;
    }

    if (inputProvider.isJustPressed("ATTACK") && this.attackCooldownTimer <= 0) {
      this.attackActive = true;
      this.attackActiveTimer = 0.1; 
      this.attackCooldownTimer = 0.12; 
      this.hasHitEnemyThisSwing = false;

      if (inputProvider.isPressed("MOVE_DOWN") && !this.physics.isGrounded) {
        this.attackDirection = "down";
        this.checkPogoAttack();
      } else if (inputProvider.isPressed("MOVE_UP")) {
        this.attackDirection = "up";
        soundSynth.playSlash();
      } else {
        this.attackDirection = "side";
        soundSynth.playSlash();
      }
    }

    if (this.attackActive && !this.hasHitEnemyThisSwing && this.attackDirection !== "down") {
      this.checkMeleeAttackContact();
    }

    super.update(dt);
  }

  private checkMeleeAttackContact() {
    const boss = Registry.boss;
    if (!boss || boss.isDead) return;

    let attackHitbox: Rectangle;
    if (this.attackDirection === "up") {
      attackHitbox = {
        x: this.position.x - 30,
        y: this.position.y - 77.5,
        width: 60,
        height: 75
      };
    } else {
      const offset = this.facingDirection * 40;
      attackHitbox = {
        x: this.position.x + offset - 50,
        y: this.position.y - 40,
        width: 100,
        height: 80
      };
    }

    const bossHalfW = boss.size.width / 2;
    const bossHalfH = boss.size.height / 2;

    const isHit = (
      attackHitbox.x + attackHitbox.width > boss.position.x - bossHalfW &&
      attackHitbox.x < boss.position.x + bossHalfW &&
      attackHitbox.y + attackHitbox.height > boss.position.y - bossHalfH &&
      attackHitbox.y < boss.position.y + bossHalfH
    );

    if (isHit) {
      const bossHealth = boss.getComponent(HealthComponent);
      if (bossHealth) {
        const damaged = bossHealth.takeDamage(1);
        if (damaged) {
          this.hasHitEnemyThisSwing = true;
        }
      }
    }
  }

  private checkPogoAttack() {
    const pogoHitbox = {
      x: this.position.x - 45,
      y: this.position.y + 40, 
      width: 90,
      height: 44.5
    };

    const boss = Registry.boss;
    if (boss && !boss.isDead) {
      const bossHalfW = boss.size.width / 2;
      const bossHalfH = boss.size.height / 2;

      const isHit = (
        pogoHitbox.x + pogoHitbox.width > boss.position.x - bossHalfW &&
        pogoHitbox.x < boss.position.x + bossHalfW &&
        pogoHitbox.y + pogoHitbox.height > boss.position.y - bossHalfH &&
        pogoHitbox.y < boss.position.y + bossHalfH
      );

      if (isHit) {
        const bossHealth = boss.getComponent(HealthComponent);
        if (bossHealth) {
          bossHealth.takeDamage(1);
        }

        this.velocity.y = -this.pogoForce;
        this.position.y -= 2; 
        this.hasDoubleJump = true;
        this.canDash = true;
        soundSynth.playPogo();
        return; 
      }
    }

    for (const solid of PhysicsComponent.solids) {
      const isHit = (
        pogoHitbox.x + pogoHitbox.width > solid.x &&
        pogoHitbox.x < solid.x + solid.width &&
        pogoHitbox.y + pogoHitbox.height > solid.y &&
        pogoHitbox.y < solid.y + solid.height
      );

      if (isHit) {
        this.velocity.y = -this.pogoForce;
        this.position.y -= 2; 
        this.hasDoubleJump = true;
        this.canDash = true;
        soundSynth.playPogo();
        break;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "hsl(142, 71%, 58%)"; 
    }

    ctx.shadowColor = "rgba(34, 197, 94, 0.4)";
    ctx.shadowBlur = this.isDashing ? 25 : 15;
    
    ctx.fillRect(
      this.position.x - this.size.width / 2,
      this.position.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );

    ctx.shadowBlur = 0;

    if (this.attackActive) {
      this.drawAttackVisual(ctx);
    }
  }

  private drawAttackVisual(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "rgba(34, 197, 94, 0.8)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    ctx.beginPath();
    if (this.attackDirection === "side") {
      const offset = this.facingDirection * 60;
      ctx.arc(
        this.position.x + offset / 2,
        this.position.y,
        45,
        this.facingDirection > 0 ? -Math.PI / 3 : Math.PI - Math.PI / 3,
        this.facingDirection > 0 ? Math.PI / 3 : Math.PI + Math.PI / 3
      );
    } else if (this.attackDirection === "up") {
      ctx.arc(
        this.position.x,
        this.position.y - 40,
        45,
        -Math.PI * 0.8,
        -Math.PI * 0.2
      );
    } else if (this.attackDirection === "down") {
      ctx.arc(
        this.position.x,
        this.position.y + 40,
        45,
        Math.PI * 0.2,
        Math.PI * 0.8
      );
    }
    ctx.stroke();
  }
}
