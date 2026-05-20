import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/components/PhysicsComponent";
import { HealthComponent } from "@/components/HealthComponent";
import { Registry } from "@/core/Registry";
import { soundSynth } from "@/core/SoundSynth";
import { Projectile } from "@/entities/Projectile";

export type BossState = "COOLDOWN" | "PATROL" | "TELEGRAPH" | "LUNGE" | "DEAD";

export class Boss extends BaseEntity {
  public health!: HealthComponent;
  private physics!: PhysicsComponent;

  private patrolSpeed: number = 200;
  private lungeSpeed: number = 1200;
  
  public state: BossState = "COOLDOWN";
  private stateTimer: number = 1.0;
  private facingDirection: number = -1;
  private currentPhase: number = 1;

  private shootTimer: number = 0;
  private volleyCount: number = 0;
  private volleyTimer: number = 0;

  constructor(id: string) {
    super(id);
    this.size = { width: 60, height: 60 };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 30,
      invincibilityDuration: 0.1
    });
  }

  public update(dt: number) {
    if (this.isDead) {
      this.state = "DEAD";
      this.velocity.x = 0;
      super.update(dt);
      return;
    }

    this.evaluatePhaseShifts();
    this.trackPlayer();

    this.stateTimer -= dt;
    this.shootTimer -= dt;

    if (this.shootTimer <= 0) {
      this.triggerRangedAttack();
    }

    if (this.volleyCount > 0) {
      this.volleyTimer -= dt;
      if (this.volleyTimer <= 0) {
        this.fireSingleShotAtPlayer();
        this.volleyCount--;
        this.volleyTimer = 0.2; 
      }
    }

    switch (this.state) {
      case "COOLDOWN":
        this.velocity.x = 0;
        if (this.stateTimer <= 0) {
          this.state = "PATROL";
          this.stateTimer = this.currentPhase === 3 ? 1.5 : 2.5; 
        }
        break;

      case "PATROL":
        this.velocity.x = this.facingDirection * this.patrolSpeed;
        
        if (this.physics.isOnWallLeft) {
          this.facingDirection = 1;
        } else if (this.physics.isOnWallRight) {
          this.facingDirection = -1;
        }

        if (this.stateTimer <= 0) {
          this.state = "TELEGRAPH";
          this.stateTimer = this.currentPhase === 3 ? 0.4 : 0.8; 
          this.velocity.x = 0;
        }
        break;

      case "TELEGRAPH":
        this.velocity.x = 0;
        if (this.stateTimer <= 0) {
          this.state = "LUNGE";
          this.stateTimer = 0.5; 
          
          const player = Registry.player;
          if (player) {
            const dir = Math.sign(player.position.x - this.position.x);
            this.facingDirection = dir !== 0 ? dir : this.facingDirection;
          }
        }
        break;

      case "LUNGE":
        this.velocity.x = this.facingDirection * this.lungeSpeed;
        
        if (this.stateTimer <= 0 || this.physics.isOnWallLeft || this.physics.isOnWallRight) {
          this.state = "COOLDOWN";
          this.stateTimer = this.currentPhase === 3 ? 0.5 : 1.2;
        }
        break;
    }

    this.checkPlayerContact();

    super.update(dt);
  }

  private triggerRangedAttack() {
    if (this.state === "TELEGRAPH" || this.state === "LUNGE") {
      this.shootTimer = 0.5; 
      return;
    }

    if (this.currentPhase === 1) {
      this.fireSingleShotAtPlayer();
      this.shootTimer = 2.0;
    } else if (this.currentPhase === 2) {
      this.volleyCount = 3;
      this.volleyTimer = 0;
      this.shootTimer = 2.5;
    } else if (this.currentPhase === 3) {
      this.fireRadialOmniBurst();
      this.shootTimer = 3.0;
    }
  }

  private fireSingleShotAtPlayer() {
    const player = Registry.player;
    if (!player || !Registry.projectilePool || player.isDead) return;

    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return;

    const dirX = dx / mag;
    const dirY = dy / mag;

    Registry.projectilePool.get(
      this.position.x + dirX * 40,
      this.position.y + dirY * 40,
      dirX,
      dirY,
      "boss",
      1,
      250, 
      10.0, 
      (p: Projectile) => Registry.projectilePool?.release(p)
    );

    soundSynth.playSlash(); 
  }

  private fireRadialOmniBurst() {
    if (!Registry.projectilePool) return;

    const projectileCount = 8;
    const angleStep = (Math.PI * 2) / projectileCount;

    for (let i = 0; i < projectileCount; i++) {
      const angle = i * angleStep;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      Registry.projectilePool.get(
        this.position.x + dirX * 40,
        this.position.y + dirY * 40,
        dirX,
        dirY,
        "boss",
        1,
        280, 
        4.0,
        (p: Projectile) => Registry.projectilePool?.release(p)
      );
    }

    soundSynth.playDash(); 
  }

  private evaluatePhaseShifts() {
    const hpRatio = this.health.currentHealth / this.health.maxHealth;
    
    if (hpRatio <= 0.4 && this.currentPhase < 3) {
      this.currentPhase = 3;
      this.patrolSpeed = 350; 
      this.lungeSpeed = 1400; 
    } else if (hpRatio <= 0.7 && this.currentPhase < 2) {
      this.currentPhase = 2;
      this.patrolSpeed = 260;
    }
  }

  private trackPlayer() {
    const player = Registry.player;
    if (player && this.state !== "LUNGE") {
      const dirToPlayer = Math.sign(player.position.x - this.position.x);
      if (dirToPlayer !== 0) {
        this.facingDirection = dirToPlayer;
      }
    }
  }

  private checkPlayerContact() {
    const player = Registry.player;
    if (!player || player.isDead) return;

    const playerHalfW = player.size.width / 2;
    const playerHalfH = player.size.height / 2;
    const bossHalfW = this.size.width / 2;
    const bossHalfH = this.size.height / 2;

    const isColliding = (
      this.position.x + bossHalfW > player.position.x - playerHalfW &&
      this.position.x - bossHalfW < player.position.x + playerHalfW &&
      this.position.y + bossHalfH > player.position.y - playerHalfH &&
      this.position.y - bossHalfH < player.position.y + playerHalfH
    );

    if (isColliding) {
      const playerHealth = player.getComponent(HealthComponent);
      if (playerHealth) {
        const damageAmount = this.state === "LUNGE" ? 2 : 1;
        const damaged = playerHealth.takeDamage(damageAmount);
        
        if (damaged) {
          const knockbackDir = Math.sign(player.position.x - this.position.x);
          player.velocity.x = (knockbackDir !== 0 ? knockbackDir : 1) * 500;
          player.velocity.y = -400;
        }
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "hsl(350, 80%, 60%)"; 
    }

    if (this.currentPhase === 3) {
      ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
      ctx.shadowBlur = 25;
    } else if (this.state === "TELEGRAPH") {
      ctx.fillStyle = "hsl(45, 100%, 50%)"; 
      ctx.shadowColor = "rgba(234, 179, 8, 0.6)";
      ctx.shadowBlur = 15;
    }

    ctx.fillRect(
      this.position.x - this.size.width / 2,
      this.position.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );

    ctx.shadowBlur = 0;
  }
}
