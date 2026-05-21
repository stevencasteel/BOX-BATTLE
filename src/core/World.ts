import { IWorld, IEntity, IPhysicsWorld, IProjectile } from "./Interfaces";
import { PhysicsWorld } from "./PhysicsWorld";
import { ObjectPool } from "./ObjectPool";
import { Projectile } from "@/entities/Projectile";

export class World implements IWorld {
  public player: IEntity | null = null;
  public boss: IEntity | null = null;
  public minions: IEntity[] = [];
  public physicsWorld: IPhysicsWorld;
  public projectilePool: ObjectPool<Projectile> | null = null;

  constructor(solids: any[], hazards: any[], onewayPlatforms: any[]) {
    this.physicsWorld = new PhysicsWorld(solids, hazards, onewayPlatforms);
  }

  public getProjectiles(): IProjectile[] {
    if (!this.projectilePool) return [];
    return this.projectilePool.getActive() as any[] as IProjectile[];
  }

  public releaseProjectile(proj: IProjectile): void {
    if (this.projectilePool) {
      this.projectilePool.release(proj as any);
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
    lifespan: number
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
      (p: any) => this.releaseProjectile(p),
      this
    ) as any as IProjectile;
  }
}
