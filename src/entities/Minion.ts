import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/components/PhysicsComponent";
import { HealthComponent } from "@/components/HealthComponent";
import { Registry } from "@/core/Registry";
import { soundSynth } from "@/core/SoundSynth";

export type MinionType = "TURRET" | "LANCER" | "FLYER";

export class Minion extends BaseEntity {
  public minionType: MinionType;
  public health!: HealthComponent;
  private physics!: PhysicsComponent;

  // AI & Movement variables
  private patrolSpeed: number = 100;
  private facingDirection: number = 1;
  private stateTimer: number = 0;
  
  // Patrol limits for Flyer
  private pointA: { x: number; y: number } = { x: 0, y: 0 };
  private pointB: { x: number; y: number } = { x: 0, y: 0 };
  private flyerTarget: "A" | "B" = "B";

  // Shooting & Attack States
  private shootTimer: number = 0;
  private attackState: "PATROL" | "TELEGRAPH" | "ATTACK" | "COOLDOWN" = "PATROL";
  private volleyCount: number = 0;
  private volleyTimer: number = 0;

  constructor(id: string, type: MinionType, startPos: { x: number; y: number }) {
    super(id);
    this.minionType = type;
    this.position = { ...startPos };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    
    // Configure separate behaviors and stats
    if (type === "TURRET") {
      this.size = { width: 44, height: 44 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 3,
        invincibilityDuration: 0.15
      });
      // Gravity disabled for static ground turrets
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
      this.physics.gravity = 0; // Flying minion defies gravity
      
      // Establish patrol path
      this.pointA = { ...startPos };
      this.pointB = { x: startPos.x, y: startPos.y - 180 }; // Fly vertically
    }
  }

  public update(dt: number) {
    if (this.isDead) return;

    this.stateTimer -= dt;
    this.shootTimer -= dt;

    const player = Registry.player;
    const playerValid = player && !player.isDead;

    // Type-Specific AI State Machine
    if (this.minionType === "TURRET") {
      this.velocity = { x: 0, y: 0 };
      
      if (playerValid) {
        const dist = this.getDistanceToPlayer(player);
        if (dist < 400 && this.shootTimer <= 0) {
          this.shootTimer = 2.5; // Cooldown
          this.fireSingleShotAtPlayer(player);
        }
      }
    } 
    else if (this.minionType === "LANCER") {
      if (this.attackState === "PATROL") {
        this.velocity.x = this.facingDirection * this.patrolSpeed;
        
        // Reverse patrol directions on walls
        if (this.physics.isOnWallLeft) this.facingDirection = 1;
        else if (this.physics.isOnWallRight) this.facingDirection = -1;

        // Check melee proximity trigger
        if (playerValid) {
          const distY = Math.abs(player.position.y - this.position.y);
          const distX = player.position.x - this.position.x;
          
          if (distY < 40 && Math.abs(distX) < 110 && Math.sign(distX) === this.facingDirection) {
            this.attackState = "TELEGRAPH";
            this.stateTimer = 0.4; // Wind up telegraph
            this.velocity.x = 0;
            soundSynth.playSelectTick();
          }
        }
      } 
      else if (this.attackState === "TELEGRAPH") {
        this.velocity.x = 0;
        if (this.stateTimer <= 0) {
          this.attackState = "ATTACK";
          this.stateTimer = 0.2; // Attack duration
          this.velocity.x = this.facingDirection * 400; // Thrust forward
          soundSynth.playSlash();
        }
      } 
      else if (this.attackState === "ATTACK") {
        // Melee hit registration is handled by overlap checks in the GameArena loop
        if (this.stateTimer <= 0 || this.physics.isOnWallLeft || this.physics.isOnWallRight) {
          this.attackState = "COOLDOWN";
          this.stateTimer = 1.2; // Recovery cooldown
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
      // 1. Hover Patrol between points A and B
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

      // 2. Ranged Volley
      if (playerValid) {
        const playerDist = this.getDistanceToPlayer(player);
        if (playerDist < 480 && this.shootTimer <= 0 && this.volleyCount === 0) {
          this.volleyCount = 3;
          this.volleyTimer = 0;
          this.shootTimer = 3.5; // Volley cooldown
        }
      }

      // Handle rapid fire burst
      if (this.volleyCount > 0) {
        this.volleyTimer -= dt;
        if (this.volleyTimer <= 0 && playerValid) {
          this.fireSingleShotAtPlayer(player);
          this.volleyCount--;
          this.volleyTimer = 0.18; // Gap between rapid shots
        }
      }
    }

    super.update(dt);
  }

  private getDistanceToPlayer(player: any): number {
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private fireSingleShotAtPlayer(player: any) {
    if (!Registry.projectilePool) return;

    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return;

    const dirX = dx / mag;
    const dirY = dy / mag;

    Registry.projectilePool.get(
      this.position.x + dirX * 30,
      this.position.y + dirY * 30,
      dirX,
      dirY,
      "boss", // Minion projectiles behave as boss assets (harm the player)
      1,      // 1 damage standard
      400,    // speed
      5.0,    // lifespan
      (p: any) => Registry.projectilePool?.release(p)
    );

    soundSynth.playJump();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      if (this.minionType === "TURRET") {
        ctx.fillStyle = "#718096"; // Steel Grey turret
      } else if (this.minionType === "LANCER") {
        ctx.fillStyle = "hsl(280, 60%, 55%)"; // Purple Lancer
      } else if (this.minionType === "FLYER") {
        ctx.fillStyle = "hsl(200, 70%, 55%)"; // Light Blue Flyer
      }
    }

    // Apply indicators for active telegraph frames
    if (this.minionType === "LANCER" && this.attackState === "TELEGRAPH") {
      ctx.fillStyle = "hsl(45, 100%, 50%)"; // Yellow warning indicator
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

    // Draw simple visor/face details
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
