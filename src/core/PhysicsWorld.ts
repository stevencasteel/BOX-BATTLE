import { Rectangle, IPhysicsWorld } from "./Interfaces";
import { UNITS } from "@/core/Units";

export class PhysicsWorld implements IPhysicsWorld {
  public solids: Rectangle[] = [];
  public hazards: Rectangle[] = [];
  public onewayPlatforms: Rectangle[] = [];

  private static readonly CELL_SIZE = UNITS.SPATIAL_GRID_CELL_SIZE;
  private solidGrid: Map<number, Rectangle[]> = new Map();
  private platformGrid: Map<number, Rectangle[]> = new Map();
  private hazardGrid: Map<number, Rectangle[]> = new Map();

  private reuseSet = new Set<Rectangle>();
  private reuseResult: Rectangle[] = [];

  constructor(solids: Rectangle[], hazards: Rectangle[], onewayPlatforms: Rectangle[]) {
    this.solids = solids;
    this.hazards = hazards;
    this.onewayPlatforms = onewayPlatforms;

    this.indexGeometry(this.solids, this.solidGrid);
    this.indexGeometry(this.onewayPlatforms, this.platformGrid);
    this.indexGeometry(this.hazards, this.hazardGrid);
  }

  private indexGeometry(rects: Rectangle[], grid: Map<number, Rectangle[]>) {
    for (const rect of rects) {
      const startX = Math.floor(rect.x / PhysicsWorld.CELL_SIZE);
      const endX = Math.floor((rect.x + rect.width) / PhysicsWorld.CELL_SIZE);
      const startY = Math.floor(rect.y / PhysicsWorld.CELL_SIZE);
      const endY = Math.floor((rect.y + rect.height) / PhysicsWorld.CELL_SIZE);

      for (let cx = startX; cx <= endX; cx++) {
        for (let cy = startY; cy <= endY; cy++) {
          const key = (cy << 16) | cx;
          if (!grid.has(key)) {
            grid.set(key, []);
          }
          grid.get(key)!.push(rect);
        }
      }
    }
  }

  public getOverlapCandidates(
    x: number,
    y: number,
    width: number,
    height: number,
    type: "solid" | "platform" | "hazard"
  ): Rectangle[] {
    const grid = type === "solid" ? this.solidGrid : type === "platform" ? this.platformGrid : this.hazardGrid;
    const fallback = type === "solid" ? this.solids : type === "platform" ? this.onewayPlatforms : this.hazards;

    const halfW = width / 2;
    const halfH = height / 2;
    const left = x - halfW;
    const right = x + halfW;
    const top = y - halfH;
    const bottom = y + halfH;

    const startX = Math.floor(left / PhysicsWorld.CELL_SIZE);
    const endX = Math.floor(right / PhysicsWorld.CELL_SIZE);
    const startY = Math.floor(top / PhysicsWorld.CELL_SIZE);
    const endY = Math.floor(bottom / PhysicsWorld.CELL_SIZE);

    this.reuseSet.clear();
    this.reuseResult.length = 0;

    for (let cx = startX; cx <= endX; cx++) {
      for (let cy = startY; cy <= endY; cy++) {
        const key = (cy << 16) | cx;
        const cellCandidates = grid.get(key);
        if (cellCandidates) {
          for (const candidate of cellCandidates) {
            if (!this.reuseSet.has(candidate)) {
              this.reuseSet.add(candidate);
              this.reuseResult.push(candidate);
            }
          }
        }
      }
    }

    if (this.reuseResult.length === 0) {
      return fallback;
    }

    return this.reuseResult;
  }

  public isOverlapping(x: number, y: number, width: number, height: number, rects: Rectangle[]): boolean {
    const halfW = width / 2;
    const halfH = height / 2;

    const left = x - halfW;
    const right = x + halfW;
    const top = y - halfH;
    const bottom = y + halfH;

    for (const rect of rects) {
      if (right > rect.x && left < rect.x + rect.width && bottom > rect.y && top < rect.y + rect.height) {
        return true;
      }
    }
    return false;
  }
}
