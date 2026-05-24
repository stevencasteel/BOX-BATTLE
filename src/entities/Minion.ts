import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld, EntityStatus } from "@/core/Interfaces";
import { IMinionBehavior, TurretBehavior, LancerBehavior, FlyerBehavior } from "./MinionBehaviors";
import { eventBroker } from "@/core/eventBroker";

export type MinionType = "TURRET" | "LANCER" | "FLYER";

export class Minion extends BaseEntity {
  public get status(): EntityStatus {
    if (this.isDead) return EntityStatus.DEAD;
    if (this.isDying) return EntityStatus.DYING;
    if (this.isSpawning) return EntityStatus.SPAWNING;
    return EntityStatus.ACTIVE;
  }

  public minionType: MinionType;
  public health!: HealthComponent;
  public physics!: PhysicsComponent;
  private behavior: IMinionBehavior;

  public patrolSpeed: number = 100;
  public facingDirection: number = 1;
  public stateTimer: number = 0;
  
  public pointA: { x: number; y: number } = { x: 0, y: 0 };
  public pointB: { x: number; y: number } = { x: 0, y: 0 };
  public flyerTarget: "A" | "B" = "B";

  public shootTimer: number = 0;
  public attackState: "PATROL" | "TELEGRAPH" | "ATTACK" | "COOLDOWN" = "PATROL";
  public volleyCount: number = 0;
  public volleyTimer: number = 0;

  public isSpawning: boolean = true;
  public spawnTimer: number = 0.6;
  public isDying: boolean = false;
  public dissolveTimer: number = 0.5;

  constructor(id: string, type: MinionType, startPos: { x: number; y: number }, world: IWorld) {
    super(id, world);
    this.minionType = type;
    this.position = { ...startPos };
    this.previousPosition = { ...startPos };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    
    if (type === "TURRET") {
      this.size = { width: 44, height: 44 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 3,
        invincibilityDuration: 0.15
      });
      this.physics.gravity = 0;
      this.squashPivot = "feet";
      this.behavior = new TurretBehavior();
    } else if (type === "LANCER") {
      this.size = { width: 40, height: 50 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 4,
        invincibilityDuration: 0.15
      });
      this.squashPivot = "feet";
      this.behavior = new LancerBehavior();
    } else {
      this.size = { width: 36, height: 36 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 2,
        invincibilityDuration: 0.15
      });
      this.physics.gravity = 0;
      
      this.pointA = { ...startPos };
      this.pointB = { x: startPos.x, y: startPos.y - 180 };
      this.squashPivot = "center";
      this.behavior = new FlyerBehavior();
    }
    eventBroker.publish("MINION_SPAWNING", undefined);
  }

  public startDeathSequence() {
    eventBroker.publish("MINION_DISSOLVING", undefined);
    this.isDying = true;
    this.dissolveTimer = 0.5;
    this.velocity = { x: 0, y: 0 };
    
    const mColor = this.minionType === "LANCER" 
      ? "hsl(280, 70%, 65%)" 
      : (this.minionType === "FLYER" ? "hsl(200, 80%, 65%)" : "hsl(215, 20%, 65%)");

    eventBroker.publish("SPAWN_SPARKS", {
      x: this.position.x,
      y: this.position.y,
      angle: 0,
      color: mColor,
      radial: true,
      count: 24
    });

    eventBroker.publish("SPAWN_BLAST", {
      x: this.position.x,
      y: this.position.y,
      color: mColor
    });
  }

  public update(dt: number) {
    if (this.isDead) return;

    if (this.isSpawning) {
      this.spawnTimer -= dt;
      this.velocity = { x: 0, y: 0 };

      const mColor = this.minionType === "LANCER" 
        ? "hsl(280, 70%, 65%)" 
        : (this.minionType === "FLYER" ? "hsl(200, 80%, 65%)" : "hsl(215, 20%, 65%)");

      if (Math.random() < 0.5) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 30;
        eventBroker.publish("SPAWN_SPARKS", {
          x: this.position.x + Math.cos(angle) * dist,
          y: this.position.y + Math.sin(angle) * dist,
          angle: angle + Math.PI,
          color: mColor
        });
      }

      if (this.spawnTimer <= 0) {
        this.isSpawning = false;
      }
      super.update(dt);
      return;
    }

    if (this.isDying) {
      this.dissolveTimer -= dt;
      this.velocity = { x: 0, y: 0 };

      const mColor = this.minionType === "LANCER" 
        ? "hsl(280, 70%, 65%)" 
        : (this.minionType === "FLYER" ? "hsl(200, 80%, 65%)" : "hsl(215, 20%, 65%)");

      if (Math.random() < 0.6) {
        eventBroker.publish("SPAWN_SPARKS", {
          x: this.position.x + (Math.random() * this.size.width - this.size.width / 2),
          y: this.position.y + (Math.random() * this.size.height - this.size.height / 2),
          angle: -Math.PI / 2 + (Math.random() * 0.4 - 0.2),
          color: mColor
        });
      }

      if (this.dissolveTimer <= 0) {
        this.isDead = true;
      }
      super.update(dt);
      return;
    }

    this.stateTimer -= dt;
    this.shootTimer -= dt;

    this.behavior.update(this, dt);

    this.checkHazardContact();

    super.update(dt);
  }

  public fireSingleShotAtPlayer(player: any) {
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return;

    const dirX = dx / mag;
    const dirY = dy / mag;

    this.world.spawnProjectile(
      this.position.x + dirX * 30,
      this.position.y + dirY * 30,
      dirX,
      dirY,
      "boss",
      1,
      400,
      5.0
    );
  }

  private checkHazardContact() {
    if (this.health.isInvincible() || this.isDead || this.isSpawning || this.isDying) return;

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
        eventBroker.publish("PLAYER_SPIKED", undefined);
        const damaged = this.health.takeDamage(1);
        if (damaged && !this.isDead) {
          if (this.minionType !== "TURRET" && !this.isDying) {
            this.velocity.y = -550;
            this.physics.isGrounded = false;
          }
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

    ctx.save();

    if (this.isSpawning) {
      const pct = 1.0 - (this.spawnTimer / 0.6);
      ctx.globalAlpha = pct;
      ctx.translate(drawX, drawY);
      ctx.scale(pct, pct);
      ctx.translate(-drawX, -drawY);
    } 
    else if (this.isDying) {
      const pct = this.dissolveTimer / 0.5;
      ctx.globalAlpha = pct;
      ctx.translate(drawX, drawY);
      ctx.scale(pct, pct);
      ctx.translate(-drawX, -drawY);
    }

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      if (this.minionType === "TURRET") {
        ctx.fillStyle = "#718096";
      } else if (this.minionType === "LANCER") {
        ctx.fillStyle = "hsl(280, 60%, 55%)";
      } else if (this.minionType === "FLYER") {
        ctx.fillStyle = "hsl(200, 70%, 55%)";
      }
    }

    if (this.attackState === "TELEGRAPH" && !this.isDying) {
      ctx.fillStyle = "hsl(45, 100%, 50%)";
      ctx.shadowColor = "rgba(234, 179, 8, 0.8)";
      ctx.shadowBlur = 14;
    }

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;

    if (this.squashPivot === "feet") {
      const feetY = drawY + this.size.height / 2;
      ctx.fillRect(
        drawX - vWidth / 2,
        feetY - vHeight,
        vWidth,
        vHeight
      );
    } else {
      ctx.fillRect(
        drawX - vWidth / 2,
        drawY - vHeight / 2,
        vWidth,
        vHeight
      );
    }

    ctx.shadowBlur = 0;

    ctx.fillStyle = "black";
    const faceDirection = this.minionType === "LANCER" ? this.facingDirection : 1;
    ctx.fillRect(
      drawX + (faceDirection * 8) - 2,
      drawY - 12,
      6,
      4
    );

    ctx.restore();
  }
}
