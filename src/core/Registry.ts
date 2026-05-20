import { ObjectPool } from "@/core/ObjectPool";
import { Projectile } from "@/entities/Projectile";

export class Registry {
  public static player: any = null;
  public static boss: any = null;
  public static projectilePool: ObjectPool<Projectile> | null = null;
  public static minions: any[] = [];
}
