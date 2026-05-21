import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/components/PhysicsComponent";
import { HealthComponent } from "@/components/HealthComponent";
import { IWorld } from "@/core/Interfaces";
import { MinionBehavior, TurretBehavior, LancerBehavior, FlyerBehavior } from "./MinionBehaviors";

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

  public update(dt: number) {
    if (this.isDead) return;

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
    const dy = player.position.y - minionClamp(this.position.y);
    function minionClamp(val: number) { return val; }
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
        const damaged = this.health.takeDamage(1);
        if (damaged && !this.isDead) {
          if (this.minionType !== "TURRET") {
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

    if (this.minionType === "LANCER" && this.attackState === "TELEGRAPH") {
      ctx.fillStyle = "hsl(45, 100%, 50%)";
      ctx.shadowColor = "rgba(234, 179, 8, 0.6)";
      ctx.shadowBlur = 10;
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
  }
}
