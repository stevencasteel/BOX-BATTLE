import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/components/PhysicsComponent";
import { HealthComponent } from "@/components/HealthComponent";
import { inputProvider } from "@/core/InputProvider";
import { eventBroker } from "@/core/EventBroker";
import { IWorld, Rectangle } from "@/core/Interfaces";

interface GhostFrame {
  x: number;
  y: number;
  opacity: number;
}

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

  private chargeTimer: number = 0;
  private isCharging: boolean = false;

  private ghosts: GhostFrame[] = [];
  private ghostSpawnTimer: number = 0;

  public determinationCounter: number = 0;
  public healingCharges: number = 0;
  public isHealing: boolean = false;
  private healTimer: number = 0;
  private readonly maxHealingCharges: number = 3;
  private readonly healDuration: number = 2.0;

  constructor(id: string, world: IWorld) {
    super(id, world);
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

    for (const ghost of this.ghosts) {
      ghost.opacity -= dt * 5.0;
    }
    this.ghosts = this.ghosts.filter((g) => g.opacity > 0);

    if (this.attackActive && this.attackActiveTimer <= 0) {
      this.attackActive = false;
      this.attackDirection = null;
    }

    if (this.isHealing) {
      this.velocity.x = 0;
      this.healTimer -= dt;

      if (!inputProvider.isPressed("MOVE_DOWN") || !inputProvider.isPressed("JUMP")) {
        this.isHealing = false;
      }

      if (this.healTimer <= 0) {
        this.isHealing = false;
        this.healingCharges = Math.max(0, this.healingCharges - 1);
        this.health.currentHealth = Math.min(this.health.maxHealth, this.health.currentHealth + 1);
        eventBroker.publish("PLAYER_HEALED", {
          amount: 1,
          currentHealth: this.health.currentHealth,
          maxHealth: this.health.maxHealth
        });
        eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
      }

      super.update(dt);
      return;
    }

    if (this.isDashing) {
      this.dashTimer -= dt;
      this.velocity.x = this.dashDirection * this.dashSpeed;
      this.velocity.y = 0;

      this.ghostSpawnTimer -= dt;
      if (this.ghostSpawnTimer <= 0) {
        this.ghosts.push({
          x: this.position.x,
          y: this.position.y,
          opacity: 0.6
        });
        this.ghostSpawnTimer = 0.025;
      }

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
      this.ghostSpawnTimer = 0;
      eventBroker.publish("PLAYER_DASHED", { direction: this.dashDirection });

      super.update(dt);
      return;
    }

    if (inputProvider.isJustPressed("JUMP")) {
      this.jumpBufferTimer = 0.1;
    } else {
      this.jumpBufferTimer -= dt;
    }

    if (this.jumpBufferTimer > 0) {
      if (inputProvider.isPressed("MOVE_DOWN") && this.physics.isGrounded && this.isStandingOnOneway()) {
        const physics = this.getComponent(PhysicsComponent);
        if (physics) {
          physics.disablePlatformCollisionTimer = 0.25;
        }
        this.position.y += 12;
        this.physics.isGrounded = false;
        this.jumpBufferTimer = 0;
        eventBroker.publish("PLAYER_JUMPED", undefined);
      }
      else if (inputProvider.isPressed("MOVE_DOWN") && this.physics.isGrounded && this.healingCharges > 0 && this.health.currentHealth < this.health.maxHealth) {
        this.isHealing = true;
        this.healTimer = this.healDuration;
        this.jumpBufferTimer = 0;
        eventBroker.publish("PLAYER_JUMPED", undefined);
      }
      else if (this.coyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        eventBroker.publish("PLAYER_JUMPED", undefined);
      } else if (this.wallCoyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.velocity.x = this.lastWallNormal * 1650;
        this.wallCoyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.canDash = true;
        eventBroker.publish("PLAYER_JUMPED", undefined);
      } else if (this.hasDoubleJump) {
        this.velocity.y = -this.jumpForce;
        this.hasDoubleJump = false;
        this.jumpBufferTimer = 0;
        eventBroker.publish("PLAYER_JUMPED", undefined);
      }
    }

    if (inputProvider.isJustReleased("JUMP") && this.velocity.y < 0) {
      this.velocity.y *= 0.4;
    }

    if (inputProvider.isJustPressed("ATTACK")) {
      this.isCharging = true;
      this.chargeTimer = 0;

      if (this.attackCooldownTimer <= 0) {
        this.attackActive = true;
        this.attackActiveTimer = 0.1;
        this.attackCooldownTimer = 0.15;
        this.hasHitEnemyThisSwing = false;

        if (inputProvider.isPressed("MOVE_DOWN") && !this.physics.isGrounded) {
          this.attackDirection = "down";
          this.checkPogoAttack();
        } else if (inputProvider.isPressed("MOVE_UP")) {
          this.attackDirection = "up";
          eventBroker.publish("PLAYER_ATTACKED", { direction: "up" });
        } else {
          this.attackDirection = "side";
          eventBroker.publish("PLAYER_ATTACKED", { direction: "side" });
        }
      }
    }

    if (this.isCharging && inputProvider.isPressed("ATTACK")) {
      this.chargeTimer += dt;
    }

    if (inputProvider.isJustReleased("ATTACK")) {
      if (this.isCharging) {
        this.isCharging = false;

        if (this.chargeTimer >= 0.35 && this.attackCooldownTimer <= 0) {
          this.fireFireball();
        }
      }
    }

    if (this.attackActive && !this.hasHitEnemyThisSwing && this.attackDirection !== "down") {
      this.checkMeleeAttackContact();
    }

    this.checkHazardContact();

    super.update(dt);
  }

  private isStandingOnOneway(): boolean {
    const ownerHalfH = this.size.height / 2;
    const feetY = this.position.y + ownerHalfH;

    for (const platform of this.world.physicsWorld.onewayPlatforms) {
      if (this.position.x + 10 > platform.x && this.position.x - 10 < platform.x + platform.width) {
        if (Math.abs(feetY - platform.y) <= 6) {
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
    }
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
        if (this.isHealing) {
          this.isHealing = false;
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

  private fireFireball() {
    this.attackCooldownTimer = 0.12;

    let dirX = inputProvider.getAxis("MOVE_LEFT", "MOVE_RIGHT");
    let dirY = 0;

    if (inputProvider.isPressed("MOVE_UP")) {
      dirY = -1;
    } else if (inputProvider.isPressed("MOVE_DOWN") && !this.physics.isGrounded) {
      dirY = 1;
    }

    if (dirX === 0 && dirY === 0) {
      dirX = this.facingDirection;
    }

    const mag = Math.sqrt(dirX * dirX + dirY * dirY);
    const normalizedDir = { x: dirX / mag, y: dirY / mag };

    const isLvl2 = this.chargeTimer >= 1.12;
    const damage = isLvl2 ? 3 : 1;
    const speed = isLvl2 ? 900 : 800;
    const lifespan = isLvl2 ? 3.0 : 2.0;

    const spawnX = this.position.x + normalizedDir.x * 30;
    const spawnY = this.position.y + normalizedDir.y * 30;

    eventBroker.publish("PLAYER_PROJECTILE_FIRED", { level: isLvl2 ? 2 : 1 });

    const pool = (this.world as any).projectilePool;
    if (pool) {
      const proj = pool.get(
        spawnX,
        spawnY,
        normalizedDir.x,
        normalizedDir.y,
        "player",
        damage,
        speed,
        lifespan,
        (p: any) => this.world.releaseProjectile(p),
        this.world
      );

      if (isLvl2) {
        proj.size = { width: 28, height: 28 };
      } else {
        proj.size = { width: 14, height: 14 };
      }
    }
  }

  private checkMeleeAttackContact() {
    const targets = [];
    if (this.world.boss && !this.world.boss.isDead) targets.push(this.world.boss);
    for (const minion of this.world.minions) {
      if (minion && !minion.isDead) targets.push(minion);
    }

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

    for (const target of targets) {
      const halfW = target.size.width / 2;
      const halfH = target.size.height / 2;

      const isHit = (
        attackHitbox.x + attackHitbox.width > target.position.x - halfW &&
        attackHitbox.x < target.position.x + halfW &&
        attackHitbox.y + attackHitbox.height > target.position.y - halfH &&
        attackHitbox.y < target.position.y + halfH
      );

      if (isHit) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          const dx = target.position.x - this.position.x;
          const dy = target.position.y - this.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const isCloseRange = distance <= 90;
          const damage = isCloseRange ? 5 : 1;

          const damaged = health.takeDamage(damage);
          if (damaged) {
            this.hasHitEnemyThisSwing = true;
            this.registerDamageDealt();

            if (isCloseRange) {
              eventBroker.publish("CAMERA_SHAKE", { amplitude: 6, duration: 0.12 });
            }
          }
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

    const targets = [];
    if (this.world.boss && !this.world.boss.isDead) targets.push(this.world.boss);
    for (const minion of this.world.minions) {
      if (minion && !minion.isDead) targets.push(minion);
    }

    for (const target of targets) {
      const halfW = target.size.width / 2;
      const halfH = target.size.height / 2;

      const isHit = (
        pogoHitbox.x + pogoHitbox.width > target.position.x - halfW &&
        pogoHitbox.x < target.position.x + halfW &&
        pogoHitbox.y + pogoHitbox.height > target.position.y - halfH &&
        pogoHitbox.y < target.position.y + halfH
      );

      if (isHit) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          health.takeDamage(1);
          this.registerDamageDealt();
        }

        this.velocity.y = -this.pogoForce;
        this.position.y -= 2;
        this.hasDoubleJump = true;
        this.canDash = true;
        eventBroker.publish("PLAYER_POGOED", undefined);
        return;
      }
    }

    const activeProjectiles = this.world.getProjectiles();
    for (const proj of activeProjectiles) {
      if (proj.isActive && proj.ownerId === "boss") {
        const pW = proj.size.width / 2;
        const pH = proj.size.height / 2;

        const isHit = (
          pogoHitbox.x + pogoHitbox.width > proj.position.x - pW &&
          pogoHitbox.x < proj.position.x + pW &&
          pogoHitbox.y + pogoHitbox.height > proj.position.y - pH &&
          pogoHitbox.y < proj.position.y + pH
        );

        if (isHit) {
          this.world.releaseProjectile(proj);
          this.registerDamageDealt();

          this.velocity.y = -this.pogoForce;
          this.position.y -= 2;
          this.hasDoubleJump = true;
          this.canDash = true;
          eventBroker.publish("PLAYER_POGOED", undefined);
          return;
        }
      }
    }

    const surfaces = [...this.world.physicsWorld.solids, ...this.world.physicsWorld.onewayPlatforms];
    for (const solid of surfaces) {
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
        eventBroker.publish("PLAYER_POGOED", undefined);
        break;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

    for (const ghost of this.ghosts) {
      ctx.fillStyle = `hsla(142, 71%, 58%, ${ghost.opacity})`;
      ctx.fillRect(
        ghost.x - this.size.width / 2,
        ghost.y - this.size.height / 2,
        this.size.width,
        this.size.height
      );
    }

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

    if (this.attackDirection === "side") {
      const offset = facing * 50;

      ctx.strokeStyle = "rgba(34, 197, 94, 0.45)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(
        this.position.x + offset / 2,
        this.position.y,
        65,
        facing > 0 ? -Math.PI / 3 : Math.PI - Math.PI / 3,
        facing > 0 ? Math.PI / 3 : Math.PI + Math.PI / 3
      );
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(
        this.position.x + offset / 3,
        this.position.y,
        32,
        facing > 0 ? -Math.PI / 2.5 : Math.PI - Math.PI / 2.5,
        facing > 0 ? Math.PI / 2.5 : Math.PI + Math.PI / 2.5
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    else if (this.attackDirection === "up") {
      ctx.strokeStyle = "rgba(34, 197, 94, 0.45)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(
        this.position.x,
        this.position.y - 35,
        65,
        -Math.PI * 0.8,
        -Math.PI * 0.2
      );
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(
        this.position.x,
        this.position.y - 25,
        32,
        -Math.PI * 0.75,
        -Math.PI * 0.25
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    else if (this.attackDirection === "down") {
      ctx.strokeStyle = "rgba(34, 197, 94, 0.45)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(
        this.position.x,
        this.position.y + 35,
        65,
        Math.PI * 0.2,
        Math.PI * 0.8
      );
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(
        this.position.x,
        this.position.y + 25,
        32,
        Math.PI * 0.25,
        Math.PI * 0.75
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
}
