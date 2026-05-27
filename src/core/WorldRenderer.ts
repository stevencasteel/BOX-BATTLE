import { CinematicDeathRenderer } from "@/core/effects/CinematicDeathRenderer";
import { Camera } from "./Camera";
import { World } from "./World";
import { Rectangle, Particle } from "./Interfaces";
import { Projectile } from "@/entities/Projectile";
import { ObjectPool } from "./ObjectPool";
import { UNITS } from "@/core/Units";
import { StaticMapRenderer } from "@/core/StaticMapRenderer";
import { EntityRenderer } from "@/core/EntityRenderer";
import { ParticleRenderer } from "@/core/ParticleRenderer";

export class WorldRenderer {
  private ctx: CanvasRenderingContext2D;
  private staticMap: StaticMapRenderer;
  private entityRenderer: EntityRenderer;
  private particleRenderer: ParticleRenderer;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.staticMap = new StaticMapRenderer(ctx);
    this.entityRenderer = new EntityRenderer(ctx);
    this.particleRenderer = new ParticleRenderer(ctx);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.ctx.canvas;
  }

  public render(
    world: World,
    particles: readonly Particle[],
    solids: Rectangle[],
    onewayPlatforms: Rectangle[],
    hazards: Rectangle[],
    projectilePool: ObjectPool<Projectile>,
    isPaused: boolean,
    bossDeathTimer: number,
    bossDeathPos: { x: number; y: number } | null,
    springPlatforms: { rect: Rectangle; offsetY: number }[],
    alpha: number
  ) {
    this.staticMap.buildStaticCache(solids, hazards);

    this.ctx.save();
    this.ctx.translate(Camera.offsetX, Camera.offsetY);

    this.staticMap.renderBackground();
    this.staticMap.renderOnewayPlatforms(onewayPlatforms, springPlatforms);

    this.entityRenderer.renderEntities(world, projectilePool, alpha);
    this.particleRenderer.renderParticles(particles);

    if (bossDeathTimer >= 0 && bossDeathPos) {
      CinematicDeathRenderer.render(this.ctx, world, bossDeathTimer, bossDeathPos);
    }

    if (isPaused) {
      this.ctx.fillStyle = "rgba(12, 13, 17, 0.65)";
      this.ctx.fillRect(0, 0, UNITS.WORLD_SIZE, UNITS.WORLD_SIZE);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 44px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("SIMULATION PAUSED", UNITS.WORLD_HALF_SIZE, 600);

      this.ctx.font = "bold 18px monospace";
      this.ctx.fillStyle = "var(--signal-green)";
      this.ctx.fillText("PRESS 'P' TO RESUME RUNTIME STEPPERS", UNITS.WORLD_HALF_SIZE, 650);
    }

    this.ctx.restore();
  }
}
