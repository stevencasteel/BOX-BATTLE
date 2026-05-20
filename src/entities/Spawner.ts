import { Minion, MinionType } from "./Minion";
import { Registry } from "@/core/Registry";

export class Spawner {
  public position: { x: number; y: number };
  public spawnType: MinionType;
  
  private activeMinion: Minion | null = null;
  private respawnTimer: number = 0;
  private readonly respawnDelay: number = 5.0; // 5 seconds respawn delay

  constructor(type: MinionType, x: number, y: number) {
    this.spawnType = type;
    this.position = { x, y };
    this.spawnMinion();
  }

  public update(dt: number) {
    if (this.activeMinion) {
      if (this.activeMinion.isDead) {
        // Unregister from Registry and initiate respawn timer
        Registry.minions = Registry.minions.filter((m) => m !== this.activeMinion);
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
    const minionId = `minion-${this.spawnType}-${Date.now()}`;
    const minion = new Minion(minionId, this.spawnType, this.position);
    this.activeMinion = minion;
    Registry.minions.push(minion);
  }

  public cleanup() {
    if (this.activeMinion) {
      this.activeMinion.teardown();
      Registry.minions = Registry.minions.filter((m) => m !== this.activeMinion);
      this.activeMinion = null;
    }
  }
}
