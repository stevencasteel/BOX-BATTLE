import { BaseEntity } from "@/entities/BaseEntity";
import { ObjectPool } from "@/core/ObjectPool";
import { Projectile } from "@/entities/Projectile";

export class Registry {
  public static player: BaseEntity | null = null;
  public static boss: BaseEntity | null = null;
  public static projectilePool: ObjectPool<Projectile> | null = null;
}
