import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/components/PhysicsComponent";
import { HealthComponent } from "@/components/HealthComponent";
import { IWorld } from "@/core/Interfaces";

export type MinionType = "TURRET" | "LANCER" | "FLYER";

export class Minion extends BaseEntity {
  public minionType: MinionType;
  public health!: HealthComponent;
  private physics!: PhysicsComponent;

  private patrolSpeed: number = 100;
  private facingDirection: number = 1;
  private stateTimer: number = 0;
  
  private pointA: { x: number; y: number } = { x: 0, y: 0 };
  private pointB: { x: number; y: number } = { x: 0, y: 0 };
  private flyerTarget: "A" | "B" = "B";

  private shootTimer: number = 0;
  private attackState: "PATROL" | "TELEGRAPH" | "ATTACK" | "COOLDOWN" = "PATROL";
  private volleyCount: number = 0;
  private volleyTimer: number = 0;

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
    } else if (type === "LANCER") {
      this.size = { width: 40, height: 50 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 4,
        invincibilityDuration: 0.15
      });
    } else if (type === "FLYER") {
      this.size = { width: 36, height: 36 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 2,
        invincibilityDuration: 0.15
      });
      this.physics.gravity = 0;
      
      this.pointA = { ...startPos };
      this.pointB = { x: startPos.x, y: startPos.y - 180 };
    }
  }

  public update(dt: number) {
    if (this.isDead) return;

    this.stateTimer -= dt;
    this.shootTimer -= dt;

    const player = this.world.player;
    const playerValid = player && !player.isDead;

    if (this.minionType === "TURRET") {
      this.velocity = { x: 0, y: 0 };
      
      if (playerValid) {
        const dist = this.getDistanceToPlayer(player);
        if (dist < 400 && this.shootTimer <= 0) {
          this.shootTimer = 2.5;
          this.fireSingleShotAtPlayer(player);
        }
      }
    } 
    else if (this.minionType === "LANCER") {
      if (this.attackState === "PATROL") {
        this.velocity.x = this.facingDirection * this.patrolSpeed;
        
        if (this.physics.isOnWallLeft) this.facingDirection = 1;
        else if (this.physics.isOnWallRight) this.facingDirection = -1;

        if (playerValid) {
          const distY = Math.abs(player.position.y - this.position.y);
          const distX = player.position.x - this.position.x;
          
          if (distY < 40 && Math.abs(distX) < 110 && Math.sign(distX) === this.facingDirection) {
            this.attackState = "TELEGRAPH";
            this.stateTimer = 0.4;
            this.velocity.x = 0;
          }
        }
      } 
      else if (this.attackState === "TELEGRAPH") {
        this.velocity.x = 0;
        if (this.stateTimer <= 0) {
          this.attackState = "ATTACK";
          this.stateTimer = 0.2;
          this.velocity.x = this.facingDirection * 400;
        }
      } 
      else if (this.attackState === "ATTACK") {
        if (this.stateTimer <= 0 || this.physics.isOnWallLeft || this.physics.isOnWallRight) {
          this.attackState = "COOLDOWN";
          this.stateTimer = 1.2;
          this.velocity.x = 0;
        }
      } 
      else if (this.attackState === "COOLDOWN") {
        this.velocity.x = 0;
        if (this.stateTimer <= 0) {
          this.attackState = "PATROL";
        }
      }
    } 
    else if (this.minionType === "FLYER") {
      const targetPos = this.flyerTarget === "A" ? this.pointA : this.pointB;
      const dx = targetPos.x - this.position.x;
      const dy = targetPos.y - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        this.flyerTarget = this.flyerTarget === "A" ? "B" : "A";
      } else {
        this.velocity.x = (dx / dist) * this.patrolSpeed;
        this.velocity.y = (dy / dist) * this.patrolSpeed;
      }

      if (playerValid) {
        const playerDist = this.getDistanceToPlayer(player);
        if (playerDist < 480 && this.shootTimer <= 0 && this.volleyCount === 0) {
          this.volleyCount = 3;
          this.volleyTimer = 0;
          this.shootTimer = 3.5;
        }
      }

      if (this.volleyCount > 0) {
        this.volleyTimer -= dt;
        if (this.volleyTimer <= 0 && playerValid) {
          this.fireSingleShotAtPlayer(player);
          this.volleyCount--;
          this.volleyTimer = 0.18;
        }
      }
    }

    this.checkHazardContact();

    super.update(dt);
  }

  private getDistanceToPlayer(player: any): number {
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private fireSingleShotAtPlayer(player: any) {
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
