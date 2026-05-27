import { Rectangle } from "@/core/Interfaces";
import { MinionType } from "@/entities/BaseMinion";

export interface SpawnerConfig {
  type: MinionType;
  x: number;
  y: number;
}

export interface LevelConfig {
  solids: Rectangle[];
  onewayPlatforms: Rectangle[];
  hazards: Rectangle[];
  spawners: SpawnerConfig[];
  playerStart: { x: number; y: number };
  bossStart: { x: number; y: number };
}

export const defaultLevelConfig: LevelConfig = {
  solids: [
    { x: 0, y: 1150, width: 400, height: 100 },
    { x: 850, y: 1150, width: 400, height: 100 },
    { x: 400, y: 1200, width: 450, height: 50 },
    { x: 0, y: 0, width: 1250, height: 50 },
    { x: 0, y: 0, width: 50, height: 1250 },
    { x: 1200, y: 0, width: 50, height: 1250 },
    { x: 425, y: 800, width: 400, height: 40 },
  ],
  onewayPlatforms: [
    { x: 50, y: 550, width: 300, height: 20 },
    { x: 900, y: 550, width: 300, height: 20 },
  ],
  hazards: [{ x: 400, y: 1150, width: 450, height: 100 }],
  spawners: [
    { type: "TURRET", x: 175, y: 490 },
    { type: "TURRET", x: 1075, y: 490 },
    { type: "LANCER", x: 625, y: 740 },
    { type: "FLYER", x: 625, y: 400 },
  ],
  playerStart: { x: 150, y: 1000 },
  bossStart: { x: 1050, y: 1000 },
};

export class LevelLoader {
  public static parse(jsonString: string): LevelConfig {
    try {
      const parsed = JSON.parse(jsonString);
      if (
        parsed &&
        Array.isArray(parsed.solids) &&
        Array.isArray(parsed.onewayPlatforms) &&
        Array.isArray(parsed.hazards) &&
        Array.isArray(parsed.spawners) &&
        parsed.playerStart &&
        parsed.bossStart
      ) {
        return parsed as LevelConfig;
      }
    } catch (e) {
      console.error("Failed to parse dynamic LevelConfig:", e);
    }
    return defaultLevelConfig;
  }

  public static stringify(config: LevelConfig): string {
    return JSON.stringify(config, null, 2);
  }
}
