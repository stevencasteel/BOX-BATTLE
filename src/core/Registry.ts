import { ObjectPool } from "@/core/ObjectPool";
import { Projectile } from "@/entities/Projectile";
import { IEntity } from "@/core/Interfaces";

export class Registry {
  public static player: IEntity | null = null;
  public static boss: IEntity | null = null;
  public static projectilePool: ObjectPool<Projectile> | null = null;
  public static minions: IEntity[] = [];
}
