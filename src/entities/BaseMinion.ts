import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld, EntityStatus } from "@/core/Interfaces";
import { StateMachine } from "@/core/StateMachine";
import { IState } from "@/core/StateMachine";
import { HazardSystem } from "@/core/systems/HazardSystem";
import { setVec, zeroVec } from "@/core/VecUtils";
import { TrigLUT } from "@/core/TrigLUT";

export type MinionType = "TURRET" | "LANCER" | "FLYER";

export abstract class BaseMinion extends BaseEntity {
  private unsubHurt!: () => void;
  public get status(): EntityStatus {
    if (this.isDead) return EntityStatus.DEAD;
    if (this.isDying) return EntityStatus.DYING;
    if (this.isSpawning) return EntityStatus.SPAWNING;
    return EntityStatus.ACTIVE;
  }

  public health!: HealthComponent;
  declare public physics: PhysicsComponent;
  public stateMachine: StateMachine;

  public patrolSpeed: number = 100;
  public stateTimer: number = 0;
  public recoilTimer: number = 0;

  public pointA: { x: number; y: number } = { x: 0, y: 0 };
  public pointB: { x: number; y: number } = { x: 0, y: 0 };
  public flyerTarget: "A" | "B" = "B";

  public shootTimer: number = 0;
  public attackState: "PATROL" | "TELEGRAPH" | "ATTACK" | "COOLDOWN" = "PATROL";
  public volleyCount: number = 0;
  public volleyTimer: number = 0;

  public isSpawning: boolean = true;
  public spawnTimer: number = 1.2;
  public isDying: boolean = false;
  public dissolveTimer: number = 0.5;
  protected exhaustTimer: number = 0;

  protected bodyColorValue: string = "#718096";
  protected cageColorValue: string = "hsla(142,80%,65%,";
  protected dissolveColorValue: string = "hsl(215,20%,65%)";
  protected canFallIntoHazards: boolean = true;

  constructor(id: string, startPos: { x: number; y: number }, world: IWorld) {
    super(id, world);
    this.position = { ...startPos };
    this.previousPosition = { ...startPos };

    setVec(this.visualScale, 0.1, 0.1);
    setVec(this.targetVisualScale, 1.0, 1.0);
    setVec(this.scaleVelocity, 15.0, 15.0);

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.stateMachine = new StateMachine();

    this.world.events.publish("MINION_SPAWNING", undefined);

    this.unsubHurt = this.world.events.subscribe("MINION_HURT", ({ id, sourceX, sourceY, intensity }) => {
      if (id === this.id) {
        this.handleHurtReaction(sourceX, sourceY, intensity);
      }
    });
  }

  protected initState(state: IState) {
    this.stateMachine.changeState(state);
  }

  public abstract get minionColor(): string;

  public startDeathSequence() {
    this.world.events.publish("MINION_DISSOLVING", undefined);
    this.isDying = true;
    this.dissolveTimer = 0.5;
    zeroVec(this.velocity);

    this.world.events.publishSpark(this.position.x, this.position.y, 0, this.dissolveColorValue, true, 24);
    this.world.events.publishBlast(this.position.x, this.position.y, this.dissolveColorValue);
  }

  public update(dt: number) {
    if (this.isDead) return;

    if (this.isSpawning) {
      this.spawnTimer -= dt;
      zeroVec(this.velocity);

      if (TrigLUT.random() < 0.5) {
        const angle = TrigLUT.random() * Math.PI * 2;
        const dist = 40 + TrigLUT.random() * 30;
        this.world.events.publishSpark(
          this.position.x + TrigLUT.cos(angle) * dist,
          this.position.y + TrigLUT.sin(angle) * dist,
          angle + Math.PI,
          this.dissolveColorValue
        );
      }

      if (this.spawnTimer <= 0) {
        this.isSpawning = false;
      }
      super.update(dt);
      return;
    }

    if (this.isDying) {
      this.dissolveTimer -= dt;
      zeroVec(this.velocity);

      if (TrigLUT.random() < 0.6) {
        this.world.events.publishSpark(
          this.position.x + (TrigLUT.random() * this.size.width - this.size.width / 2),
          this.position.y + (TrigLUT.random() * this.size.height - this.size.height / 2),
          -Math.PI / 2 + (TrigLUT.random() * 0.4 - 0.2),
          this.dissolveColorValue
        );
      }

      if (this.dissolveTimer <= 0) {
        this.isDead = true;
      }
      super.update(dt);
      return;
    }

    this.stateTimer -= dt;
    this.shootTimer -= dt;

    if (this.recoilTimer > 0) {
      this.recoilTimer -= dt;
      const friction = 2.5;
      this.velocity.x += (0 - this.velocity.x) * friction * dt;
    } else {
      this.stateMachine.update(dt);
    }

    if (this.attackState === "TELEGRAPH" && !this.isDying) {
      this.targetRotation = 0;
      this.rotation = TrigLUT.sin(performance.now() * 0.055) * 0.25;
      this.rotationVelocity = 0;
    } else {
      this.updateNonTelegraphRotation();
    }

    this.exhaustTimer -= dt;
    if (this.exhaustTimer <= 0) {
      this.updateExhaust();
    }

    this.checkHazardContact();

    super.update(dt);
  }

  protected updateNonTelegraphRotation(): void {
    this.targetRotation = Math.sign(this.velocity.x) * 0.12;
    if (this.attackState === "PATROL" && !this.isDying && !this.isSpawning) {
      this.targetRotation += TrigLUT.sin(performance.now() * 0.008 + this.position.x) * 0.04;
    }
  }

  protected abstract updateExhaust(): void;

  protected emitExhaustSpark(angle: number, color: string, count: number = 1) {
    this.exhaustTimer = 0.08;
    this.world.events.publishSpark(
      this.position.x,
      this.position.y + this.size.height / 2,
      angle,
      color,
      false,
      count
    );
  }

  public fireSingleShotAtPlayer(player: { position: { x: number; y: number } }) {
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = TrigLUT.fastSqrt(dx * dx + dy * dy);
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
      5.0,
      this.minionColor
    );
  }

  private checkHazardContact() {
    if (this.health.isInvincible() || this.isDead || this.isSpawning || this.isDying) return;

    const hit = HazardSystem.checkContact(this, this.world.physicsWorld);
    if (hit && !this.isDead) {
      if (this.canFallIntoHazards && !this.isDying) {
        this.physics.isGrounded = false;
      }
    }
  }

  public handleHurtReaction(sourceX: number, sourceY: number, intensity: number) {
    if (this.isDead || this.isDying || this.isSpawning) return;

    const dx = this.position.x - sourceX;
    const dy = this.position.y - sourceY;
    const dist = TrigLUT.fastSqrt(dx * dx + dy * dy);
    const dirX = dx !== 0 ? dx / dist : -this.facingDirection;

    this.velocity.x = dirX * 320 * intensity;
    this.velocity.y = Math.min(this.velocity.y, -340 * intensity);
    this.physics.isGrounded = false;

    setVec(this.visualScale, 1.0 - 0.2 * intensity, 1.0 + 0.4 * intensity);
    setVec(this.scaleVelocity, 10.0 * intensity, -20.0 * intensity);

    const rotImpulse = -Math.sign(dirX) * 18.0 * intensity;
    this.applyAngularImpulse(rotImpulse);

    this.recoilTimer = 0.35 * intensity;
  }

  public teardown() {
    if (this.unsubHurt) {
      this.unsubHurt();
    }
    super.teardown();
  }
}


