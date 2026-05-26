import { IWorld, IEntity, IPhysicsWorld, IProjectile, Rectangle } from "./Interfaces";
import { PhysicsWorld } from "./PhysicsWorld";
import { ObjectPool } from "./ObjectPool";
import { Projectile } from "@/entities/Projectile";

export class World implements IWorld {
  public player: IEntity | null = null;
  public boss: IEntity | null = null;
  public minions: IEntity[] = [];
  public physicsWorld: IPhysicsWorld;
  public projectilePool: ObjectPool<Projectile> | null = null;

  constructor(solids: Rectangle[], hazards: Rectangle[], onewayPlatforms: Rectangle[]) {
    this.physicsWorld = new PhysicsWorld(solids, hazards, onewayPlatforms);
  }

  public getProjectiles(): readonly IProjectile[] {
    if (!this.projectilePool) return [];
    return this.projectilePool.getActive();
  }

  public releaseProjectile(proj: IProjectile): void {
    if (this.projectilePool) {
      this.projectilePool.release(proj as Projectile);
    }
  }

  public spawnProjectile(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    ownerId: "player" | "boss",
    damage: number,
    speed: number,
    lifespan: number,
    customColor?: string
  ): IProjectile {
    if (!this.projectilePool) {
      throw new Error("Projectile pool not initialized on World.");
    }
    return this.projectilePool.get(
      x,
      y,
      dirX,
      dirY,
      ownerId,
      damage,
      speed,
      lifespan,
      (p: Projectile) => this.releaseProjectile(p),
      this,
      customColor
    );
  }
}
