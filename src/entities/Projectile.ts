import { BaseEntity } from "./BaseEntity";
import { IPoolable } from "@/core/ObjectPool";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld, EntityStatus } from "@/core/Interfaces";
import { eventBroker } from "@/core/eventBroker";
import { UNITS } from "@/core/Units";

export class Projectile extends BaseEntity implements IPoolable {
  public isActive: boolean = false;
  public ownerId: "player" | "boss" = "player";
  public damage: number = 1;

  private lifespan: number = 0;
  private onRelease?: (proj: Projectile) => void;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super("projectile", null as any);
    this.size = { width: 14, height: 14 };
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
    onRelease: (proj: Projectile) => void,
    world: IWorld
  ) {
    this.position = { x, y };
    this.previousPosition = { x, y };
    this.velocity = { x: dirX * speed, y: dirY * speed };

    this.ownerId = ownerId;
    this.damage = damage;
    this.lifespan = lifespan;
    this.onRelease = onRelease;
    this.world = world;

    this.isActive = true;
    this.isDead = false;
  }

  public deactivate() {
    this.isActive = false;
    this.isDead = true;
    this.velocity = { x: 0, y: 0 };
  }

  public update(dt: number) {
    if (!this.isActive) return;

    this.lifespan -= dt;
    if (this.lifespan <= 0) {
      this.selfRelease();
      return;
    }

    const dx = this.velocity.x * dt;
    const dy = this.velocity.y * dt;
    const maxStepSize = UNITS.CCD_STEP_LIMIT_PROJECTILE;

    const steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy) / maxStepSize));
    const substepX = dx / steps;
    const substepY = dy / steps;

    for (let i = 0; i < steps; i++) {
      this.position.x += substepX;
      this.position.y += substepY;

      if (this.checkSolidCollisions() || this.checkOnewayCollisions()) {
        this.selfRelease();
        return;
      }

      if (this.checkProjectileClashes()) {
        this.selfRelease();
        return;
      }

      if (this.checkEntityCollisions()) {
        this.selfRelease();
        return;
      }
    }
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
    if (this.ownerId !== "player") return false;

    const pW = this.size.width / 2;
    const pH = this.size.height / 2;

    const activeProjectiles = [...this.world.getProjectiles()];
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
          this.world.releaseProjectile(other);
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
    const targets = [];

    if (this.ownerId === "boss") {
      if (this.world.player && !this.world.player.isDead) {
        targets.push(this.world.player);
      }
    } else {
      if (this.world.boss && !this.world.boss.isDead) {
        targets.push(this.world.boss);
      }
      for (const minion of this.world.minions) {
        if (minion && minion.status === EntityStatus.ACTIVE) {
          targets.push(minion);
        }
      }
    }

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
          targetHealth.takeDamage(this.damage);
          return true;
        }
      }
    }
    return false;
  }

  private selfRelease() {
    eventBroker.publish("SPAWN_BLAST", {
      x: this.position.x,
      y: this.position.y,
      color: this.ownerId === "player" ? "hsl(142, 71%, 58%)" : "hsl(350, 80%, 60%)",
    });
    if (this.onRelease) {
      this.onRelease(this);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (!this.isActive) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
    const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    const angle = Math.atan2(this.velocity.y, this.velocity.x);

    const maxStretchSpeed = 1000;
    const stretchFactor = Math.min(1.5, 1.0 + (speed / maxStretchSpeed) * 0.5);
    const squashFactor = 1 / stretchFactor;

    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.rotate(angle);
    ctx.scale(stretchFactor, squashFactor);

    if (this.ownerId === "player") {
      ctx.fillStyle = "hsl(142, 71%, 58%)";
      ctx.shadowColor = "rgba(34, 197, 94, 0.6)";
    } else {
      ctx.fillStyle = "hsl(350, 80%, 60%)";
      ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
    }

    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, this.size.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
