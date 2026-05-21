import { Rectangle, IPhysicsWorld } from "./Interfaces";

export class PhysicsWorld implements IPhysicsWorld {
  public solids: Rectangle[] = [];
  public hazards: Rectangle[] = [];
  public onewayPlatforms: Rectangle[] = [];

  constructor(solids: Rectangle[], hazards: Rectangle[], onewayPlatforms: Rectangle[]) {
    this.solids = solids;
    this.hazards = hazards;
    this.onewayPlatforms = onewayPlatforms;
  }

  public isOverlapping(x: number, y: number, width: number, height: number, rects: Rectangle[]): boolean {
    const halfW = width / 2;
    const halfH = height / 2;

    const left = x - halfW;
    const right = x + halfW;
    const top = y - halfH;
    const bottom = y + halfH;

    for (const rect of rects) {
      if (
        right > rect.x &&
        left < rect.x + rect.width &&
        bottom > rect.y &&
        top < rect.y + rect.height
      ) {
        return true;
      }
    }
    return false;
  }
}
