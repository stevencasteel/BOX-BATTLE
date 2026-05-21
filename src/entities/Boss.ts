import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/components/PhysicsComponent";
import { HealthComponent } from "@/components/HealthComponent";
import { IWorld } from "@/core/Interfaces";
import { StateMachine } from "@/core/StateMachine";
import { 
  BossCooldownState, 
  BossPatrolState, 
  BossMeleeState, 
  BossAttackState, 
  BossTelegraphState, 
  BossLungeState, 
  BossDeadState 
} from "./BossStates";

export class Boss extends BaseEntity {
  public health!: HealthComponent;
  public physics!: PhysicsComponent;
  public stateMachine: StateMachine;
  public cooldownState!: BossCooldownState;
  public patrolState!: BossPatrolState;
  public meleeState!: BossMeleeState;
  public attackState!: BossAttackState;
  public telegraphState!: BossTelegraphState;
  public lungeState!: BossLungeState;
  public deadState!: BossDeadState;

  public patrolSpeed: number = 200;
  public lungeSpeed: number = 1200;
  
  public facingDirection: number = -1;
  public currentPhase: number = 1;

  constructor(id: string, world: IWorld) {
    super(id, world);
    this.size = { width: 60, height: 60 };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 30,
      invincibilityDuration: 0.25 
    });

    this.cooldownState = new BossCooldownState(this);
    this.patrolState = new BossPatrolState(this);
    this.meleeState = new BossMeleeState(this);
    this.attackState = new BossAttackState(this);
    this.telegraphState = new BossTelegraphState(this);
    this.lungeState = new BossLungeState(this);
    this.deadState = new BossDeadState(this);

    this.stateMachine = new StateMachine();
    this.stateMachine.changeState(this.cooldownState);
  }

  public update(dt: number) {
    if (this.isDead) {
      if (!(this.stateMachine.getCurrentState() instanceof BossDeadState)) {
        this.stateMachine.changeState(this.deadState);
      }
      super.update(dt);
      return;
    }

    this.evaluatePhaseShifts();
    this.trackPlayer();

    this.stateMachine.update(dt);

    this.checkPlayerContact();
    this.checkHazardContact();

    super.update(dt);
  }

  public get activeStateName(): string {
    const active = this.stateMachine.getCurrentState();
    if (!active) return "UNKNOWN";
    return active.constructor.name.replace("Boss", "").replace("State", "").toUpperCase();
  }

  public fireSingleShotAtPlayer() {
    const player = this.world.player;
    const pool = (this.world as any).projectilePool;
    if (!player || !pool || player.isDead) return;

    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return;

    const dirX = dx / mag;
    const dirY = dy / mag;

    pool.get(
      this.position.x + dirX * 40,
      this.position.y + dirY * 40,
      dirX,
      dirY,
      "boss",
      1,
      250, 
      10.0, 
      (p: any) => this.world.releaseProjectile(p),
      this.world
    );
  }

  public fireRadialOmniBurst() {
    const pool = (this.world as any).projectilePool;
    if (!pool) return;

    const projectileCount = 8;
    const angleStep = (Math.PI * 2) / projectileCount;

    for (let i = 0; i < projectileCount; i++) {
      const angle = i * angleStep;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      pool.get(
        this.position.x + dirX * 40,
        this.position.y + dirY * 40,
        dirX,
        dirY,
        "boss",
        1,
        280, 
        4.0,
        (p: any) => this.world.releaseProjectile(p),
        this.world
      );
    }
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
    const player = this.world.player;
    const activeState = this.activeStateName;
    if (player && activeState !== "LUNGE") {
      const dirToPlayer = Math.sign(player.position.x - this.position.x);
      if (dirToPlayer !== 0) {
        this.facingDirection = dirToPlayer;
      }
    }
  }

  private checkPlayerContact() {
    const player = this.world.player;
    const activeState = this.activeStateName;
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
        const damageAmount = (activeState === "LUNGE" || activeState === "MELEE") ? 2 : 1;
        const damaged = playerHealth.takeDamage(damageAmount);
        
        if (damaged) {
          const knockbackDir = Math.sign(player.position.x - this.position.x);
          player.velocity.x = (knockbackDir !== 0 ? knockbackDir : 1) * 500;
          player.velocity.y = -400;
        }
      }
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

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "hsl(350, 80%, 60%)"; 
    }

    const activeState = this.activeStateName;
    if (this.currentPhase === 3) {
      ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
      ctx.shadowBlur = 25;
    } else if (activeState === "TELEGRAPH") {
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
