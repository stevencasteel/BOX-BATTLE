import { BaseEntity } from "./BaseEntity";
import { Poolable } from "@/core/ObjectPool";
import { PhysicsComponent } from "@/components/PhysicsComponent";
import { HealthComponent } from "@/components/HealthComponent";
import { Registry } from "@/core/Registry";
import { soundSynth } from "@/core/SoundSynth";

export class Projectile extends BaseEntity implements Poolable {
  public isActive: boolean = false;
  public ownerId: "player" | "boss" = "player";
  public damage: number = 1;
  
  private lifespan: number = 0;
  private onRelease?: (proj: Projectile) => void;

  constructor() {
    super("projectile");
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
    onRelease: (proj: Projectile) => void
  ) {
    this.position = { x, y };
    this.velocity = { x: dirX * speed, y: dirY * speed };
    
    this.ownerId = ownerId;
    this.damage = damage;
    this.lifespan = lifespan;
    this.onRelease = onRelease;
    
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

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    this.lifespan -= dt;
    if (this.lifespan <= 0) {
      this.selfRelease();
      return;
    }

    if (this.checkSolidCollisions()) {
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

  private checkSolidCollisions(): boolean {
    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;

    for (const solid of PhysicsComponent.solids) {
      const isHit = (
        this.position.x + halfW > solid.x &&
        this.position.x - halfW < solid.x + solid.width &&
        this.position.y + halfH > solid.y &&
        this.position.y - halfH < solid.y + solid.height
      );

      if (isHit) {
        return true;
      }
    }
    return false;
  }

  private checkProjectileClashes(): boolean {
    if (this.ownerId !== "player" || !Registry.projectilePool) return false;

    const pW = this.size.width / 2;
    const pH = this.size.height / 2;

    for (const other of Registry.projectilePool.getActive()) {
      if (other.isActive && other.ownerId === "boss") {
        const oW = other.size.width / 2;
        const oH = other.size.height / 2;

        const isColliding = (
          this.position.x + pW > other.position.x - oW &&
          this.position.x - pW < other.position.x + oW &&
          this.position.y + pH > other.position.y - oH &&
          this.position.y - pH < other.position.y + oH
        );

        if (isColliding) {
          Registry.projectilePool.release(other);
          soundSynth.playHitConfirm();
          return true; 
        }
      }
    }
    return false;
  }

  private checkEntityCollisions(): boolean {
    const target = this.ownerId === "player" ? Registry.boss : Registry.player;
    if (!target || target.isDead) return false;

    const pW = this.size.width / 2;
    const pH = this.size.height / 2;
    const tW = target.size.width / 2;
    const tH = target.size.height / 2;

    const isColliding = (
      this.position.x + pW > target.position.x - tW &&
      this.position.x - pW < target.position.x + tW &&
      this.position.y + pH > target.position.y - tH &&
      this.position.y - pH < target.position.y + tH
    );

    if (isColliding) {
      const targetHealth = target.getComponent(HealthComponent);
      if (targetHealth) {
        targetHealth.takeDamage(this.damage);
        return true;
      }
    }
    return false;
  }

  private selfRelease() {
    if (this.onRelease) {
      this.onRelease(this);
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (!this.isActive) return;

    if (this.ownerId === "player") {
      ctx.fillStyle = "hsl(142, 71%, 58%)";
      ctx.shadowColor = "rgba(34, 197, 94, 0.6)";
    } else {
      ctx.fillStyle = "hsl(350, 80%, 60%)";
      ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
    }

    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
