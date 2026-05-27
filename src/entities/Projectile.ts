import { BaseEntity } from "./BaseEntity";
import { IPoolable } from "@/core/ObjectPool";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld } from "@/core/Interfaces";
import { UNITS } from "@/core/Units";
import { TrigLUT } from "@/core/TrigLUT";
import { setVec, zeroVec } from "@/core/VecUtils";
import {
  IProjectileStrategy,
  playerProjectileStrategy,
  bossProjectileStrategy,
} from "./ProjectileStrategy";

const TRAIL_RING_SIZE = 16;

export class Projectile extends BaseEntity implements IPoolable {
  public isActive = false;
  public ownerId: "player" | "boss" = "player";
  public damage = 1;
  public customColor: string | null = null;

  private strategy!: IProjectileStrategy;
  private lifespan = 0;

  private trailRing: { x: number; y: number }[] = [];
  private trailHead = 0;
  private trailCount = 0;

  constructor() {
    super("projectile", null as unknown as IWorld);
    this.size = { width: 14, height: 14 };
    this.trailRing = Array.from({ length: TRAIL_RING_SIZE }, () => ({ x: 0, y: 0 }));
  }

  public activate(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    ownerId: "player" | "boss",
    damage: number,
    speed: number,
    lifespan: number,
    world: IWorld,
    customColor?: string
  ) {
    setVec(this.position, x, y);
    setVec(this.previousPosition, x, y);
    setVec(this.velocity, dirX * speed, dirY * speed);

    this.ownerId = ownerId;
    this.damage = damage;
    this.lifespan = lifespan;
    this.world = world;
    this.customColor = customColor || null;

    this.strategy = ownerId === "player" ? playerProjectileStrategy : bossProjectileStrategy;

    this.isActive = true;
    this.isDead = false;
    this.trailHead = 0;
    this.trailCount = 0;
  }

  public deactivate() {
    this.isActive = false;
    this.isDead = true;
    zeroVec(this.velocity);
    this.trailCount = 0;
  }

  public update(dt: number): boolean {
    if (!this.isActive) return false;

    this.lifespan -= dt;
    if (this.lifespan <= 0) {
      this.releaseEffects();
      this.isActive = false;
      this.isDead = true;
      return true;
    }

    this.trailRing[this.trailHead].x = this.position.x;
    this.trailRing[this.trailHead].y = this.position.y;
    this.trailHead = (this.trailHead + 1) % TRAIL_RING_SIZE;
    const maxTrailLen = this.damage >= 3 ? 8 : 3;
    if (this.trailCount < TRAIL_RING_SIZE) this.trailCount++;
    if (this.trailCount > maxTrailLen) this.trailCount = maxTrailLen;

    this.strategy.updateSparks(this.world.events, this.position.x, this.position.y, this.velocity.x, this.velocity.y, this.damage);

    const dx = this.velocity.x * dt;
    const dy = this.velocity.y * dt;
    const maxStepSize = UNITS.CCD_STEP_LIMIT_PROJECTILE;
    const steps = Math.max(1, Math.ceil(TrigLUT.fastSqrt(dx * dx + dy * dy) / maxStepSize));
    const substepX = dx / steps;
    const substepY = dy / steps;

    for (let i = 0; i < steps; i++) {
      this.position.x += substepX;
      this.position.y += substepY;

      if (this.checkSolidCollisions() || this.checkOnewayCollisions()) {
        this.releaseEffects();
        this.isActive = false;
        this.isDead = true;
        return true;
      }

      if (this.checkProjectileClashes()) {
        this.releaseEffects();
        this.isActive = false;
        this.isDead = true;
        return true;
      }

      if (this.checkEntityCollisions()) {
        this.releaseEffects();
        this.isActive = false;
        this.isDead = true;
        return true;
      }
    }

    return false;
  }

  private checkSolidCollisions(): boolean {
    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;
    const physicsWorld = this.world.physicsWorld;

    const solidCandidates = physicsWorld.getOverlapCandidates(
      this.position.x,
      this.position.y,
      this.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
      this.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
      "solid"
    );

    for (const solid of solidCandidates) {
      const isHit =
        this.position.x + halfW > solid.x &&
        this.position.x - halfW < solid.x + solid.width &&
        this.position.y + halfH > solid.y &&
        this.position.y - halfH < solid.y + solid.height;

      if (isHit) {
        return true;
      }
    }
    return false;
  }

  private checkOnewayCollisions(): boolean {
    if (this.velocity.y < 0) return false;

    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;
    const prevY = this.position.y - this.velocity.y * UNITS.CANONICAL_DELTA_TIME;
    const physicsWorld = this.world.physicsWorld;

    const platformCandidates = physicsWorld.getOverlapCandidates(
      this.position.x,
      this.position.y,
      this.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
      this.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
      "platform"
    );

    for (const platform of platformCandidates) {
      const isHit =
        this.position.x + halfW > platform.x &&
        this.position.x - halfW < platform.x + platform.width &&
        this.position.y + halfH > platform.y &&
        this.position.y - halfH < platform.y + platform.height;

      if (isHit) {
        if (prevY + halfH - 4 <= platform.y) {
          return true;
        }
      }
    }
    return false;
  }

  private checkProjectileClashes(): boolean {
    if (!this.strategy.shouldCheckClashes()) return false;

    const pW = this.size.width / 2;
    const pH = this.size.height / 2;

    const activeProjectiles = this.world.getProjectiles();
    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
      const other = activeProjectiles[i];
      if (other && other.isActive && other.ownerId === "boss") {
        const oW = other.size.width / 2;
        const oH = other.size.height / 2;

        const isColliding =
          this.position.x + pW > other.position.x - oW &&
          this.position.x - pW < other.position.x + oW &&
          this.position.y + pH > other.position.y - oH &&
          this.position.y - pH < other.position.y + oH;

        if (isColliding) {
          const incomingDamage = other.damage || 1;
          (other as Projectile).deactivate();
          this.damage -= incomingDamage;
          if (this.damage <= 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private checkEntityCollisions(): boolean {
    const targets = this.strategy.getTargets(this.world);

    const pW = this.size.width / 2;
    const pH = this.size.height / 2;

    for (const target of targets) {
      const tW = target.size.width / 2;
      const tH = target.size.height / 2;

      const isColliding =
        this.position.x + pW > target.position.x - tW &&
        this.position.x - pW < target.position.x + tW &&
        this.position.y + pH > target.position.y - tH &&
        this.position.y - pH < target.position.y + tH;

      if (isColliding) {
        const targetHealth = target.getComponent(HealthComponent);
        if (targetHealth) {
          const projIntensity = this.strategy.getProjIntensity(this.damage);
          targetHealth.takeDamage(this.damage, this.position.x, this.position.y, projIntensity);
          return true;
        }
      }
    }
    return false;
  }

  private releaseEffects() {
    const blastColor = this.strategy.getBlastColor(this.damage, this.customColor);
    const angle = TrigLUT.atan2(this.velocity.y, this.velocity.x) + Math.PI;

    this.world.events.publishBlast(this.position.x, this.position.y, blastColor);

    const sparkCount = this.strategy.getSparkCount(this.damage);
    const turbulence = this.strategy.getSparkTurbulence(this.damage);
    this.world.events.publishSpark(this.position.x, this.position.y, angle, blastColor, false, sparkCount, "line", turbulence);
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (!this.isActive) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
    const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

    if (this.trailCount > 1) {
      ctx.save();
      const oldestIdx = this.trailCount < TRAIL_RING_SIZE ? 0 : this.trailHead;
      const oldest = this.trailRing[oldestIdx];

      this.strategy.drawTrail(ctx, {
        drawX,
        drawY,
        oldestX: oldest.x,
        oldestY: oldest.y,
        trail: this.trailRing,
        trailHead: this.trailHead,
        trailCount: this.trailCount,
        trailRingSize: TRAIL_RING_SIZE,
        damage: this.damage,
        customColor: this.customColor,
        projWidth: this.size.width,
      });

      ctx.restore();
    }

    const speed = TrigLUT.fastSqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    const angle = TrigLUT.atan2(this.velocity.y, this.velocity.x);

    const maxStretchSpeed = 1000;
    const stretchFactor = Math.min(1.5, 1.0 + (speed / maxStretchSpeed) * 0.5);
    const squashFactor = 1 / stretchFactor;

    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.rotate(angle);
    ctx.scale(stretchFactor, squashFactor);

    this.strategy.drawBody(ctx, {
      width: this.size.width,
      height: this.size.height,
      damage: this.damage,
      customColor: this.customColor,
    });

    ctx.restore();
  }
}
