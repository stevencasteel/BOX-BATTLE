import { IWorld, IEntity, IPhysicsWorld } from "./Interfaces";
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

  public getProjectiles(): any[] {
    if (!this.projectilePool) return [];
    return this.projectilePool.getActive() as any[];
  }

  public releaseProjectile(proj: any): void {
    if (this.projectilePool) {
      this.projectilePool.release(proj);
    }
  }
}
