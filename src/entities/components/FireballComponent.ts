import { EntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { eventBroker } from "@/core/EventBroker";

export class FireballComponent implements EntityComponent {
  public owner!: BaseEntity;
  
  public isCharging: boolean = false;
  public chargeTimer: number = 0;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public update(dt: number): void {
    if (this.isCharging) {
      this.chargeTimer += dt;
    }
  }

  public startCharging(): void {
    this.isCharging = true;
    this.chargeTimer = 0;
  }

  public releaseCharge(dirX: number, dirY: number, facingDirection: number): void {
    if (!this.isCharging) return;
    this.isCharging = false;

    if (this.chargeTimer >= 0.35) {
      this.fire(dirX, dirY, facingDirection);
    }
  }

  private fire(dirX: number, dirY: number, facingDirection: number): void {
    let finalDirX = dirX;
    let finalDirY = dirY;

    if (finalDirX === 0 && finalDirY === 0) {
      finalDirX = facingDirection;
    }

    const mag = Math.sqrt(finalDirX * finalDirX + finalDirY * finalDirY);
    const normalizedDir = { x: finalDirX / mag, y: finalDirY / mag };

    const isLvl2 = this.chargeTimer >= 1.12;
    const damage = isLvl2 ? 3 : 1;
    const speed = isLvl2 ? 900 : 800;
    const lifespan = isLvl2 ? 3.0 : 2.0;

    const spawnX = this.owner.position.x + normalizedDir.x * 30;
    const spawnY = this.owner.position.y + normalizedDir.y * 30;

    eventBroker.publish("PLAYER_PROJECTILE_FIRED", { level: isLvl2 ? 2 : 1 });

    const pool = (this.owner.world as any).projectilePool;
    if (pool) {
      const proj = pool.get(
        spawnX,
        spawnY,
        normalizedDir.x,
        normalizedDir.y,
        "player",
        damage,
        speed,
        lifespan,
        (p: any) => this.owner.world.releaseProjectile(p),
        this.owner.world
      );

      if (isLvl2) {
        proj.size = { width: 28, height: 28 };
      } else {
        proj.size = { width: 14, height: 14 };
      }
    }
  }
}
