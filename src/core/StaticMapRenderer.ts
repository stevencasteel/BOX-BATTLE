import { Rectangle } from "./Interfaces";
import { UNITS } from "@/core/Units";

export class StaticMapRenderer {
  private ctx: CanvasRenderingContext2D;
  private staticCanvas: HTMLCanvasElement;
  private staticCtx: CanvasRenderingContext2D;
  private spikePath: Path2D | null = null;
  private staticCacheBuilt = false;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.staticCanvas = document.createElement("canvas");
    this.staticCanvas.width = UNITS.WORLD_SIZE;
    this.staticCanvas.height = UNITS.WORLD_SIZE;
    const staticCtx = this.staticCanvas.getContext("2d");
    if (!staticCtx) throw new Error("Could not create static canvas context");
    this.staticCtx = staticCtx;
  }

  public buildStaticCache(solids: Rectangle[], hazards: Rectangle[]): void {
    if (this.staticCacheBuilt) return;
    const sctx = this.staticCtx;

    sctx.fillStyle = "#0c0d11";
    sctx.fillRect(0, 0, UNITS.WORLD_SIZE, UNITS.WORLD_SIZE);

    sctx.fillStyle = "#1e1e24";
    for (const solid of solids) {
      sctx.fillRect(solid.x, solid.y, solid.width, solid.height);
      sctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      sctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
    }

    if (hazards.length > 0) {
      this.spikePath = new Path2D();
      for (const hazard of hazards) {
        const spikeWidth = 25;
        const spikeCount = Math.floor(hazard.width / spikeWidth);
        for (let i = 0; i < spikeCount; i++) {
          this.spikePath.moveTo(hazard.x + i * spikeWidth, 1200);
          this.spikePath.lineTo(hazard.x + i * spikeWidth + spikeWidth / 2, 1150);
          this.spikePath.lineTo(hazard.x + i * spikeWidth + spikeWidth, 1200);
        }
      }
    }

    this.staticCacheBuilt = true;
  }

  public renderBackground(): void {
    this.ctx.drawImage(this.staticCanvas, 0, 0);

    if (this.spikePath) {
      this.ctx.fillStyle = "hsl(350, 80%, 60%)";
      this.ctx.fill(this.spikePath);
    }
  }

  public renderOnewayPlatforms(
    onewayPlatforms: Rectangle[],
    springPlatforms: { rect: Rectangle; offsetY: number }[]
  ): void {
    this.ctx.fillStyle = "#2c3e50";
    for (const platform of onewayPlatforms) {
      const sp = springPlatforms.find((s) => s.rect === platform);
      const offsetY = sp ? sp.offsetY : 0;

      this.ctx.save();
      this.ctx.translate(0, offsetY);
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
      this.ctx.restore();
    }
  }

  public resetCache(): void {
    this.staticCacheBuilt = false;
    this.spikePath = null;
  }
}
