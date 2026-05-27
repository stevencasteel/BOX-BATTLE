import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld } from "@/core/Interfaces";
import { StateMachine } from "@/core/StateMachine";
import { UNITS } from "@/core/Units";
import { setVec, zeroVec } from "@/core/VecUtils";
import {
  BossCooldownState,
  BossPatrolState,
  BossMeleeState,
  BossAttackState,
  BossTelegraphState,
  BossLungeState,
  BossDeadState,
} from "./BossStates";

export class Boss extends BaseEntity {
  private unsubHurt!: () => void;
  public health!: HealthComponent;
  declare public physics: PhysicsComponent;
  public stateMachine: StateMachine;
  public cooldownState!: BossCooldownState;
  public patrolState!: BossPatrolState;
  public meleeState!: BossMeleeState;
  public attackState!: BossAttackState;
  public telegraphState!: BossTelegraphState;
  public lungeState!: BossLungeState;
  public deadState!: BossDeadState;

  public patrolSpeed: number = UNITS.BOSS_PATROL_SPEED_BASE;
  public lungeSpeed: number = UNITS.BOSS_LUNGE_SPEED_BASE;

  public facingDirection: number = -1;
  public currentPhase: number = 1;

  constructor(id: string, world: IWorld) {
    super(id, world);
    this.size = { width: 60, height: 60 };
    this.squashPivot = "feet";

    zeroVec(this.position);
    zeroVec(this.previousPosition);

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: UNITS.BOSS_MAX_HP,
      invincibilityDuration: 0.25,
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

    this.unsubHurt = this.world.events.subscribe("BOSS_HURT", ({ sourceX, sourceY, intensity }) => {
      this.handleHurtReaction(sourceX, sourceY, intensity);
    });
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

    // Standard Boss target rotation lean driven by movement velocity
    if (this.physics.isGrounded) {
      this.targetRotation = Math.sign(this.velocity.x) * 0.1;
    } else {
      this.targetRotation = Math.sign(this.velocity.x) * Math.min(0.08, (Math.abs(this.velocity.x) / 1000) * 0.08);
    }

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
    if (!player || player.isDead) return;

    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return;

    const dirX = dx / mag;
    const dirY = dy / mag;

    this.world.spawnProjectile(
      this.position.x + dirX * 40,
      this.position.y + dirY * 40,
      dirX,
      dirY,
      "boss",
      1,
      250,
      10.0
    );
  }

  public fireRadialOmniBurst() {
    const projectileCount = 8;
    const angleStep = (Math.PI * 2) / projectileCount;

    for (let i = 0; i < projectileCount; i++) {
      const angle = i * angleStep;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      this.world.spawnProjectile(
        this.position.x + dirX * 40,
        this.position.y + dirY * 40,
        dirX,
        dirY,
        "boss",
        1,
        280,
        4.0
      );
    }
  }

  private evaluatePhaseShifts() {
    const hpRatio = this.health.currentHealth / this.health.maxHealth;

    if (hpRatio <= UNITS.BOSS_PHASE_3_HP_PCT && this.currentPhase < 3) {
      this.currentPhase = 3;
      this.patrolSpeed = UNITS.BOSS_PATROL_SPEED_BASE * 1.75;
      this.lungeSpeed = UNITS.BOSS_LUNGE_SPEED_BASE * 1.15;
    } else if (hpRatio <= UNITS.BOSS_PHASE_2_HP_PCT && this.currentPhase < 2) {
      this.currentPhase = 2;
      this.patrolSpeed = UNITS.BOSS_PATROL_SPEED_BASE * 1.3;
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

    const isColliding =
      this.position.x + bossHalfW > player.position.x - playerHalfW &&
      this.position.x - bossHalfW < player.position.x + playerHalfW &&
      this.position.y + bossHalfH > player.position.y - playerHalfH &&
      this.position.y - bossHalfH < player.position.y + playerHalfH;

    if (isColliding) {
      const playerHealth = player.getComponent(HealthComponent);
      if (playerHealth) {
        const damageAmount = activeState === "LUNGE" || activeState === "MELEE" ? UNITS.BOSS_LUNGE_DAMAGE : UNITS.ENEMY_CONTACT_DAMAGE;
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
      const isHit =
        this.position.x + halfW > hazard.x &&
        this.position.x - halfW < hazard.x + hazard.width &&
        this.position.y + halfH > hazard.y &&
        this.position.y - halfH < hazard.y + hazard.height;

      if (isHit && this.velocity.y >= 0) {
        this.world.events.publish("PLAYER_SPIKED", { x: this.position.x });
        const damaged = this.health.takeDamage(UNITS.HAZARD_SPIKE_DAMAGE);
        if (damaged && !this.isDead) {
          this.velocity.y = -550;
          this.physics.isGrounded = false;
          // Springy, elastic visual stretch launcher
          setVec(this.visualScale, 0.5, 1.5);
          setVec(this.scaleVelocity, 10.0, -15.0);
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

    const activeState = this.activeStateName;

    ctx.save();
    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else if (activeState === "TELEGRAPH") {
      ctx.fillStyle = "hsl(45, 100%, 50%)";
      ctx.shadowColor = "rgba(234, 179, 8, 0.8)";
      ctx.shadowBlur = 20;
    } else {
      ctx.fillStyle = "hsl(350, 80%, 60%)";
      if (this.currentPhase === 3) {
        ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
        ctx.shadowBlur = 25;
      }
    }

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;
    const feetY = drawY + this.size.height / 2;

    // Apply feet rotation centered transform matrix
    ctx.translate(drawX, feetY);
    ctx.rotate(this.rotation);
    ctx.fillRect(-vWidth / 2, -vHeight, vWidth, vHeight);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  public handleHurtReaction(sourceX: number, sourceY: number, intensity: number) {
    if (this.isDead) return;

    const dx = this.position.x - sourceX;
    const dy = this.position.y - sourceY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const dirX = dx !== 0 ? dx / dist : -this.facingDirection;

    // Overriding velocities directly to create a satisfying pop upward similar to the spike hazard response
    this.velocity.x = dirX * 240 * intensity;
    this.velocity.y = Math.min(this.velocity.y, -280 * intensity);
    this.physics.isGrounded = false;

    // Stretch vertically to visually sell the launch momentum
    setVec(this.visualScale, 1.0 - 0.15 * intensity, 1.0 + 0.3 * intensity);
    setVec(this.scaleVelocity, 8.0 * intensity, -16.0 * intensity);

    const rotImpulse = -Math.sign(dirX) * 12.0 * intensity;
    this.applyAngularImpulse(rotImpulse);
  }

  public teardown() {
    if (this.unsubHurt) {
      this.unsubHurt();
    }
    super.teardown();
  }
}
