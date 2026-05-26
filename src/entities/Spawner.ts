import { Minion, MinionType } from "./Minion";
import { IWorld } from "@/core/Interfaces";

export class Spawner {
  public position: { x: number; y: number };
  public spawnType: MinionType;
  public world: IWorld;

  private activeMinion: Minion | null = null;
  private respawnTimer: number = 0;
  private readonly respawnDelay: number = 5.0;

  constructor(type: MinionType, x: number, y: number, world: IWorld) {
    this.spawnType = type;
    this.position = { x, y };
    this.world = world;
    this.spawnMinion();
  }

  public update(dt: number) {
    if (this.activeMinion) {
      if (this.activeMinion.isDead) {
        this.world.minions = this.world.minions.filter((m) => m !== this.activeMinion);
        this.activeMinion = null;
        this.respawnTimer = this.respawnDelay;
      }
    } else {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.spawnMinion();
      }
    }
  }

  private spawnMinion() {
    const minionId = `minion-${this.spawnType}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const minion = new Minion(minionId, this.spawnType, this.position, this.world);
    this.activeMinion = minion;
    this.world.minions.push(minion);
  }

  public cleanup() {
    if (this.activeMinion) {
      this.activeMinion.teardown();
      this.world.minions = this.world.minions.filter((m) => m !== this.activeMinion);
      this.activeMinion = null;
    }
  }
}
