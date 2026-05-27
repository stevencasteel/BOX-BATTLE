import { BaseEntity } from "./BaseEntity";
import { IPoolable } from "@/core/ObjectPool";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld, EntityStatus } from "@/core/Interfaces";
import { UNITS } from "@/core/Units";
import { TrigLUT } from "@/core/TrigLUT";
import { setVec, zeroVec } from "@/core/VecUtils";

const TRAIL_RING_SIZE = 16;

export class Projectile extends BaseEntity implements IPoolable {
  public isActive = false;
  public ownerId: "player" | "boss" = "player";
  public damage = 1;
  public customColor: string | null = null;

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

    const isLvl2 = this.damage >= 3;
    const sparkChance = isLvl2 ? 0.35 : 0.08;
    if (this.ownerId === "player" && TrigLUT.random() < sparkChance) {
      const angle = TrigLUT.atan2(this.velocity.y, this.velocity.x) + Math.PI + (TrigLUT.random() * 0.4 - 0.2);
      this.world.events.publishSpark(this.position.x, this.position.y, angle, isLvl2 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)", false, 1, "line");
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
    if (this.ownerId !== "player") return false;

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
          const projIntensity = this.ownerId === "player" ? (this.damage >= 3 ? 1.6 : 0.6) : 1.0;
          targetHealth.takeDamage(this.damage, this.position.x, this.position.y, projIntensity);
          return true;
        }
      }
    }
    return false;
  }

  private releaseEffects() {
    const isPlayer = this.ownerId === "player";
    const blastColor = isPlayer ? (this.damage >= 3 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)") : (this.customColor || "hsl(350, 80%, 60%)");
    const angle = TrigLUT.atan2(this.velocity.y, this.velocity.x) + Math.PI;

    this.world.events.publishBlast(this.position.x, this.position.y, blastColor);

    const sparkCount = isPlayer ? (this.damage >= 3 ? 18 : 4) : 8;
    const turbulence = isPlayer && this.damage >= 3 ? 20 : 5;
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
      const iterateTrail = (moveFirst: boolean, cb: (pt: { x: number; y: number }) => void) => {
        for (let j = 0; j < this.trailCount; j++) {
          const idx = (this.trailHead - 1 - j + TRAIL_RING_SIZE) % TRAIL_RING_SIZE;
          const pt = this.trailRing[idx];
          if (j === 0 && moveFirst) {
            cb(pt);
          } else {
            cb(pt);
          }
        }
      };

      if (this.ownerId === "player") {
        const isLvl2 = this.damage >= 3;

        if (isLvl2) {
          const outerGrad = ctx.createLinearGradient(drawX, drawY, oldest.x, oldest.y);
          outerGrad.addColorStop(0.0, "rgba(234, 179, 8, 0.45)");
          outerGrad.addColorStop(0.4, "rgba(34, 197, 94, 0.35)");
          outerGrad.addColorStop(1.0, "rgba(34, 197, 94, 0.0)");

          ctx.strokeStyle = outerGrad;
          ctx.lineWidth = this.size.width * 1.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.shadowColor = "rgba(34, 197, 94, 0.6)";
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.moveTo(drawX, drawY);
          iterateTrail(false, (pt) => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();

          const innerGrad = ctx.createLinearGradient(drawX, drawY, oldest.x, oldest.y);
          innerGrad.addColorStop(0.0, "rgba(255, 255, 255, 0.95)");
          innerGrad.addColorStop(0.4, "rgba(234, 179, 8, 0.6)");
          innerGrad.addColorStop(1.0, "rgba(34, 197, 94, 0.0)");

          ctx.strokeStyle = innerGrad;
          ctx.lineWidth = this.size.width * 0.45;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(drawX, drawY);
          iterateTrail(false, (pt) => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
        } else {
          const mainColor = "rgba(34, 197, 94, ";
          const outerGrad = ctx.createLinearGradient(drawX, drawY, oldest.x, oldest.y);
          outerGrad.addColorStop(0.0, mainColor + "0.35)");
          outerGrad.addColorStop(1.0, mainColor + "0.0)");
          ctx.strokeStyle = outerGrad;
          ctx.lineWidth = this.size.width * 1.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.shadowColor = "rgba(34, 197, 94, 0.6)";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(drawX, drawY);
          iterateTrail(false, (pt) => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();

          const innerGrad = ctx.createLinearGradient(drawX, drawY, oldest.x, oldest.y);
          innerGrad.addColorStop(0.0, "rgba(255, 255, 255, 0.95)");
          innerGrad.addColorStop(1.0, mainColor + "0.0)");
          ctx.strokeStyle = innerGrad;
          ctx.lineWidth = this.size.width * 0.45;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(drawX, drawY);
          iterateTrail(false, (pt) => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
        }
      } else {
        const trailColor = this.customColor || "hsl(350, 80%, 60%)";
          const alphaColor0 = trailColor.startsWith("hsl") 
            ? trailColor.replace("hsl", "hsla").replace(")", ", 0.45)") 
            : "rgba(239, 68, 68, 0.45)";
          const alphaColor1 = trailColor.startsWith("hsl") 
            ? trailColor.replace("hsl", "hsla").replace(")", ", 0.0)") 
            : "rgba(239, 68, 68, 0.0)";
          const shadowCol = trailColor.startsWith("hsl") 
            ? trailColor.replace("hsl", "hsla").replace(")", ", 0.5)") 
            : "rgba(239, 68, 68, 0.5)";

          const grad = ctx.createLinearGradient(drawX, drawY, oldest.x, oldest.y);
          grad.addColorStop(0.0, alphaColor0);
          grad.addColorStop(1.0, alphaColor1);
          ctx.strokeStyle = grad;
          ctx.shadowColor = shadowCol;
        ctx.lineWidth = this.size.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(drawX, drawY);
        iterateTrail(false, (pt) => ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
      }
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

    if (this.ownerId === "player") {
      const isLvl2 = this.damage >= 3;
      const radius = this.size.width / 2;

      if (isLvl2) {
        ctx.shadowColor = "rgba(34, 197, 94, 0.8)";
        ctx.shadowBlur = 24;

        const radialGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        radialGrad.addColorStop(0.0, "hsl(45, 100%, 65%)");
        radialGrad.addColorStop(0.65, "hsl(45, 100%, 65%)");
        radialGrad.addColorStop(1.0, "hsl(142, 71%, 58%)");

        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.45, radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.85, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.85, Math.PI * 0.75, Math.PI * 1.25);
        ctx.stroke();
      } else {
        ctx.shadowColor = "rgba(34, 197, 94, 0.75)";
        ctx.shadowBlur = 14;

        ctx.fillStyle = "hsl(142, 71%, 58%)";
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const bodyColor = this.customColor || "hsl(350, 80%, 60%)";
          const shadowCol = bodyColor.startsWith("hsl") 
            ? bodyColor.replace("hsl", "hsla").replace(")", ", 0.6)") 
            : "rgba(239, 68, 68, 0.6)";

          ctx.fillStyle = bodyColor;
          ctx.shadowColor = shadowCol;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, this.size.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
