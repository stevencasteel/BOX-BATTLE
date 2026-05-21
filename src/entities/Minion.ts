import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld } from "@/core/Interfaces";
import { MinionBehavior, TurretBehavior, LancerBehavior, FlyerBehavior } from "./MinionBehaviors";
import { eventBroker } from "@/core/eventBroker";

export type MinionType = "TURRET" | "LANCER" | "FLYER";

export class Minion extends BaseEntity {
  public minionType: MinionType;
  public health!: HealthComponent;
  public physics!: PhysicsComponent;
  private behavior: MinionBehavior;

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

  // Spawning and Dissolving transition variables
  public isSpawning: boolean = true;
  public spawnTimer: number = 0.6; // 600ms entrance
  public isDying: boolean = false;
  public dissolveTimer: number = 0.5; // 500ms dissolution

  constructor(id: string, type: MinionType, startPos: { x: number; y: number }, world: IWorld) {
    super(id, world);
    this.minionType = type;
    this.position = { ...startPos };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    
    if (type === "TURRET") {
      this.size = { width: 44, height: 44 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 3,
        invincibilityDuration: 0.15
      });
      this.physics.gravity = 0;
      this.behavior = new TurretBehavior();
    } else if (type === "LANCER") {
      this.size = { width: 40, height: 50 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 4,
        invincibilityDuration: 0.15
      });
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
      this.behavior = new FlyerBehavior();
    }
  }

  public startDeathSequence() {
    this.isDying = true;
    this.dissolveTimer = 0.5;
    this.velocity = { x: 0, y: 0 };
    
    // Publish initial sparkle explosion
    eventBroker.publish("SPAWN_SPARKS", {
      x: this.position.x,
      y: this.position.y,
      angle: Math.random() * Math.PI * 2,
      color: this.minionType === "LANCER" ? "hsl(280, 60%, 55%)" : "hsl(200, 70%, 55%)"
    });
  }

  public update(dt: number) {
    if (this.isDead) return;

    if (this.isSpawning) {
      this.spawnTimer -= dt;
      this.velocity = { x: 0, y: 0 };

      // Spawn converging particles pulling into spawn coordinates
      if (Math.random() < 0.35) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 50;
        eventBroker.publish("SPAWN_SPARKS", {
          x: this.position.x + Math.cos(angle) * dist,
          y: this.position.y + Math.sin(angle) * dist,
          angle: angle + Math.PI, // face inwards
          color: "rgba(34, 197, 94, 0.85)"
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

      // Spawn ascending vapor dissolve particles
      if (Math.random() < 0.4) {
        eventBroker.publish("SPAWN_SPARKS", {
          x: this.position.x + (Math.random() * this.size.width - this.size.width / 2),
          y: this.position.y + (Math.random() * this.size.height - this.size.height / 2),
          angle: -Math.PI / 2 + (Math.random() * 0.4 - 0.2), // float up
          color: this.minionType === "LANCER" ? "hsl(280, 60%, 55%)" : "hsl(200, 70%, 55%)"
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
    const pool = (this.world as any).projectilePool;
    if (!pool) return;

    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return;

    const dirX = dx / mag;
    const dirY = dy / mag;

    pool.get(
      this.position.x + dirX * 30,
      this.position.y + dirY * 30,
      dirX,
      dirY,
      "boss",
      1,
      400,
      5.0,
      (p: any) => this.world.releaseProjectile(p),
      this.world
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

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

    ctx.save();

    if (this.isSpawning) {
      const pct = 1.0 - (this.spawnTimer / 0.6);
      ctx.globalAlpha = pct;
      ctx.translate(this.position.x, this.position.y);
      ctx.scale(pct, pct);
      ctx.translate(-this.position.x, -this.position.y);
    } 
    else if (this.isDying) {
      const pct = this.dissolveTimer / 0.5;
      ctx.globalAlpha = pct;
      ctx.translate(this.position.x, this.position.y);
      ctx.scale(pct, pct);
      ctx.translate(-this.position.x, -this.position.y);
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

    ctx.fillRect(
      this.position.x - this.size.width / 2,
      this.position.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle = "black";
    const faceDirection = this.minionType === "LANCER" ? this.facingDirection : 1;
    ctx.fillRect(
      this.position.x + (faceDirection * 8) - 2,
      this.position.y - 12,
      6,
      4
    );

    ctx.restore();
  }
}
