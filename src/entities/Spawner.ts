import { BaseMinion, MinionType } from "./BaseMinion";
import { TurretMinion } from "./TurretMinion";
import { LancerMinion } from "./LancerMinion";
import { FlyerMinion } from "./FlyerMinion";
import { IWorld } from "@/core/Interfaces";

export class Spawner {
  public position: { x: number; y: number };
  public spawnType: MinionType;
  public world: IWorld;

  private activeMinion: BaseMinion | null = null;
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
        const idx = this.world.minions.indexOf(this.activeMinion);
        if (idx !== -1) {
          const last = this.world.minions[this.world.minions.length - 1];
          this.world.minions[idx] = last;
          this.world.minions.pop();
        }
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
    let minion: BaseMinion;
    switch (this.spawnType) {
      case "TURRET":
        minion = new TurretMinion(minionId, this.position, this.world);
        break;
      case "LANCER":
        minion = new LancerMinion(minionId, this.position, this.world);
        break;
      case "FLYER":
        minion = new FlyerMinion(minionId, this.position, this.world);
        break;
    }
    this.activeMinion = minion;
    this.world.minions.push(minion);
  }

  public cleanup() {
    if (this.activeMinion) {
      this.activeMinion.teardown();
      const idx = this.world.minions.indexOf(this.activeMinion);
      if (idx !== -1) {
        const last = this.world.minions[this.world.minions.length - 1];
        this.world.minions[idx] = last;
        this.world.minions.pop();
      }
      this.activeMinion = null;
    }
  }
}
