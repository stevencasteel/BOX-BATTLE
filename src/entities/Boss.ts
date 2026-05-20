import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/components/PhysicsComponent";
import { HealthComponent } from "@/components/HealthComponent";
import { Registry } from "@/core/Registry";

export type BossState = "COOLDOWN" | "PATROL" | "TELEGRAPH" | "LUNGE" | "DEAD";

export class Boss extends BaseEntity {
  public health!: HealthComponent;
  private physics!: PhysicsComponent;

  // Configuration Speed & Tuning
  private patrolSpeed: number = 200;
  private lungeSpeed: number = 1200;
  
  // State Machine Timers
  public state: BossState = "COOLDOWN";
  private stateTimer: number = 1.0;
  private facingDirection: number = -1;
  private currentPhase: number = 1;

  constructor(id: string) {
    super(id);
    this.size = { width: 60, height: 60 };

    // Register active components
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

    // 1. Process Phase Shifts based on HP thresholds (70% and 40%)
    this.evaluatePhaseShifts();

    // 2. Track Player Direction
    this.trackPlayer();

    // 3. Process State Timers
    this.stateTimer -= dt;

    // 4. State Updates
    switch (this.state) {
      case "COOLDOWN":
        this.velocity.x = 0;
        if (this.stateTimer <= 0) {
          this.state = "PATROL";
          this.stateTimer = this.currentPhase === 3 ? 1.5 : 2.5; // Patrol duration
        }
        break;

      case "PATROL":
        // Move back and forth
        this.velocity.x = this.facingDirection * this.patrolSpeed;
        
        // Turn around on wall hit
        if (this.physics.isOnWallLeft) {
          this.facingDirection = 1;
        } else if (this.physics.isOnWallRight) {
          this.facingDirection = -1;
        }

        // Randomly check if we want to lunge at the player
        if (this.stateTimer <= 0) {
          this.state = "TELEGRAPH";
          // Phase 3 rage reduces preparation latency
          this.stateTimer = this.currentPhase === 3 ? 0.4 : 0.8; 
          this.velocity.x = 0;
        }
        break;

      case "TELEGRAPH":
        this.velocity.x = 0;
        if (this.stateTimer <= 0) {
          this.state = "LUNGE";
          this.stateTimer = 0.5; // Lunge duration
          
          // Set direction towards player at the exact moment of lunge
          const player = Registry.player;
          if (player) {
            const dir = Math.sign(player.position.x - this.position.x);
            this.facingDirection = dir !== 0 ? dir : this.facingDirection;
          }
        }
        break;

      case "LUNGE":
        // Charge with high velocity
        this.velocity.x = this.facingDirection * this.lungeSpeed;
        
        if (this.stateTimer <= 0 || this.physics.isOnWallLeft || this.physics.isOnWallRight) {
          this.state = "COOLDOWN";
          // Phase 3 reduces post-attack recovery down-time
          this.stateTimer = this.currentPhase === 3 ? 0.5 : 1.2;
        }
        break;
    }

    // Apply Contact Damage to Player on Touch
    this.checkPlayerContact();

    super.update(dt);
  }

  private evaluatePhaseShifts() {
    const hpRatio = this.health.currentHealth / this.health.maxHealth;
    
    if (hpRatio <= 0.4 && this.currentPhase < 3) {
      this.currentPhase = 3;
      this.patrolSpeed = 350; // Accelerate base patrol rate
      this.lungeSpeed = 1400; // Intenisify lunge speeds
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
        // Slowly update facing to follow player when in neutral/cooldown states
        this.facingDirection = dirToPlayer;
      }
    }
  }

  private checkPlayerContact() {
    const player = Registry.player;
    if (!player || player.isDead) return;

    // AABB overlapping check between Boss and Player bounding boxes
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
          // Push player away from contact point (Knockback recoil)
          const knockbackDir = Math.sign(player.position.x - this.position.x);
          player.velocity.x = (knockbackDir !== 0 ? knockbackDir : 1) * 500;
          player.velocity.y = -400;
        }
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

    // Hit-Flash Tint Layering
    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "hsl(350, 80%, 60%)"; // Base Salmon Red
    }

    // Phase 3 Rage Glow Accent
    if (this.currentPhase === 3) {
      ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
      ctx.shadowBlur = 25;
    } else if (this.state === "TELEGRAPH") {
      ctx.fillStyle = "hsl(45, 100%, 50%)"; // Warning Gold
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
