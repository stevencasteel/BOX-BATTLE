import { CinematicDeathRenderer } from "@/core/effects/CinematicDeathRenderer";
import { Player } from "@/entities/Player";
import { Camera } from "./Camera";
import { World } from "./World";
import { Rectangle, Particle } from "./Interfaces";
import { Projectile } from "@/entities/Projectile";
import { ObjectPool } from "./ObjectPool";
import { UNITS } from "@/core/Units";

const colorCache = new Map<string, { h: number; s: number; l: number } | null>();
const lerpCache = new Map<string, string>();

function parseHsl(str: string): { h: number; s: number; l: number } | null {
  if (colorCache.has(str)) {
    return colorCache.get(str)!;
  }
  const regex = /hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/;
  const match = str.match(regex);
  if (!match) {
    colorCache.set(str, null);
    return null;
  }
  const result = {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
  colorCache.set(str, result);
  return result;
}

function lerpHsl(startStr: string, endStr: string, pct: number): string {
  if (!startStr || !endStr) return startStr;
  
  const step = Math.round(pct * 20); // 21 discrete steps are visually indistinguishable from continuous
  const cacheKey = `${startStr}_${endStr}_${step}`;
  
  const cached = lerpCache.get(cacheKey);
  if (cached) return cached;
  
  const c1 = parseHsl(startStr);
  const c2 = parseHsl(endStr);
  if (!c1 || !c2) return startStr;

  const factor = 1 - (step / 20);
  const h = c1.h + (c2.h - c1.h) * factor;
  const s = c1.s + (c2.s - c1.s) * factor;
  const l = c1.l + (c2.l - c1.l) * factor;
  
  const result = `hsl(${h}, ${s}%, ${l}%)`;
  lerpCache.set(cacheKey, result);
  colorCache.set(result, { h, s, l }); // Seed parsed cache for dynamic color
  return result;
}

function getHslaColor(colorStr: string, alpha: number): string {
  const parsed = parseHsl(colorStr);
  if (parsed) {
    return `hsla(${parsed.h}, ${parsed.s}%, ${parsed.l}%, ${alpha})`;
  }
  return colorStr;
}

export class WorldRenderer {
  private ctx: CanvasRenderingContext2D;
  private cachedMeleeGradient: CanvasGradient;
  private staticCanvas: HTMLCanvasElement;
  private staticCtx: CanvasRenderingContext2D;
  private spikePath: Path2D | null = null;
  private staticCacheBuilt = false;

  private attackGradCanvas: HTMLCanvasElement;
  private particleLineGradCanvas: HTMLCanvasElement;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;

    this.cachedMeleeGradient = ctx.createRadialGradient(
      0,
      0,
      UNITS.MELEE_SWEEP_INNER_RADIUS,
      0,
      0,
      UNITS.MELEE_MAX_REACH
    );
    this.cachedMeleeGradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
    this.cachedMeleeGradient.addColorStop(0.2, "rgba(255, 255, 255, 1.0)");
    this.cachedMeleeGradient.addColorStop(0.5, "rgba(132, 239, 158, 0.95)");
    this.cachedMeleeGradient.addColorStop(0.85, "rgba(34, 197, 94, 0.85)");
    this.ctx.fillStyle = this.cachedMeleeGradient;
    this.cachedMeleeGradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");

    this.staticCanvas = document.createElement("canvas");
    this.staticCanvas.width = UNITS.WORLD_SIZE;
    this.staticCanvas.height = UNITS.WORLD_SIZE;
    const staticCtx = this.staticCanvas.getContext("2d");
    if (!staticCtx) throw new Error("Could not create static canvas context");
    this.staticCtx = staticCtx;

    this.attackGradCanvas = document.createElement("canvas");
    this.attackGradCanvas.width = 128;
    this.attackGradCanvas.height = 128;
    const attackCtx = this.attackGradCanvas.getContext("2d")!;
    const attackGrad = attackCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    attackGrad.addColorStop(0.0, "rgba(255, 255, 255, 0)");
    attackGrad.addColorStop(0.2, "rgba(255, 255, 255, 1.0)");
    attackGrad.addColorStop(0.5, "rgba(132, 239, 158, 0.95)");
    attackGrad.addColorStop(0.85, "rgba(34, 197, 94, 0.85)");
    attackGrad.addColorStop(1.0, "rgba(34, 197, 94, 0)");
    attackCtx.fillStyle = attackGrad;
    attackCtx.fillRect(0, 0, 128, 128);

    this.particleLineGradCanvas = document.createElement("canvas");
    this.particleLineGradCanvas.width = 64;
    this.particleLineGradCanvas.height = 1;
    const lineCtx = this.particleLineGradCanvas.getContext("2d")!;
    const lineGrad = lineCtx.createLinearGradient(0, 0, 64, 0);
    lineGrad.addColorStop(0.0, "rgba(255,255,255,0)");
    lineGrad.addColorStop(0.2, "rgba(255,255,255,0.15)");
    lineGrad.addColorStop(0.85, "rgba(255,255,255,0.95)");
    lineGrad.addColorStop(1.0, "rgba(255,255,255,0.3)");
    lineCtx.fillStyle = lineGrad;
    lineCtx.fillRect(0, 0, 64, 1);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.ctx.canvas;
  }

  private buildStaticCache(
    solids: Rectangle[],
    hazards: Rectangle[]
  ) {
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

  private drawPlayerAttackVisual(ctx: CanvasRenderingContext2D, player: Player, alpha: number) {
    const facing = player.facingDirection;
    ctx.lineCap = "round";

    const progress = 1.0 - player.meleeComponent.attackActiveTimer / 0.09;
    const opacity = Math.max(0, player.meleeComponent.attackActiveTimer / 0.09);

    if (opacity <= 0.01) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = player.previousPosition.x + (player.position.x - player.previousPosition.x) * alphaVal;
    const drawY = player.previousPosition.y + (player.position.y - player.previousPosition.y) * alphaVal;

    if (player.attackDirection === "side") {
      const offset = facing * UNITS.MELEE_SIDE_OFFSET;
      const baseStart = -Math.PI / 2;
      const angleLength = Math.PI;
      const currentSweepAngle = angleLength * progress;

      const cx = drawX + offset;
      const cy = drawY;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = this.cachedMeleeGradient;
      const startA = facing > 0 ? baseStart : Math.PI - baseStart;
      const endA = facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle);
      ctx.beginPath();
      ctx.arc(0, 0, UNITS.MELEE_MAX_REACH, startA, endA, facing < 0);
      ctx.arc(0, 0, UNITS.MELEE_SWEEP_INNER_RADIUS, endA, startA, facing > 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (player.attackDirection === "up") {
      const cx = drawX;
      const cy = drawY - UNITS.MELEE_VERTICAL_OFFSET;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(cx, cy);
      const gradScale = currentRadius / 64;
      ctx.scale(gradScale, gradScale);
      ctx.beginPath();
      ctx.arc(0, 0, 64, -Math.PI, 0);
      ctx.arc(0, 0, currentInnerRadius / gradScale, 0, -Math.PI, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(this.attackGradCanvas, -64, -64, 128, 128);
      ctx.restore();
    } else if (player.attackDirection === "down") {
      const cx = drawX;
      const cy = drawY + UNITS.MELEE_VERTICAL_OFFSET;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(cx, cy);
      const gradScale2 = currentRadius / 64;
      ctx.scale(gradScale2, gradScale2);
      ctx.beginPath();
      ctx.arc(0, 0, 64, 0, Math.PI);
      ctx.arc(0, 0, currentInnerRadius / gradScale2, Math.PI, 0, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(this.attackGradCanvas, -64, -64, 128, 128);
      ctx.restore();
    }
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
    this.buildStaticCache(solids, hazards);

    this.ctx.save();
    this.ctx.translate(Camera.offsetX, Camera.offsetY);

    this.ctx.drawImage(this.staticCanvas, 0, 0);

    if (this.spikePath) {
      this.ctx.fillStyle = "hsl(350, 80%, 60%)";
      this.ctx.fill(this.spikePath);
    }

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

    if (world.boss) {
      world.boss.draw(this.ctx, alpha);
    }

    if (world.player) {
      world.player.draw(this.ctx, alpha);
      const player = world.player as Player;
      if (player.attackActive) {
        this.drawPlayerAttackVisual(this.ctx, player, alpha);
      }
    }

    for (const minion of world.minions) {
      minion.draw(this.ctx, alpha);
    }

    const activeProjectiles = projectilePool.getActive();
    for (const proj of activeProjectiles) {
      proj.draw(this.ctx, alpha);
    }

            // Save canvas state exactly once before processing the particle array
        this.ctx.save();
        for (const p of particles) {
          const pct = p.life / p.maxLife;

            if (p.shape === 'spark') {
            const sparkColor = (p.startColor && p.endColor) ? lerpHsl(p.startColor, p.endColor, pct) : p.color;
            this.ctx.fillStyle = getHslaColor(sparkColor, pct);
            this.ctx.globalAlpha = 1.0;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
          } else if (p.shape === 'dust') {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = pct;
            this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.7);
          } else if (p.shape === 'line') {
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            let ux = 1;
            let uy = 0;
            if (speed > 0) {
              ux = p.vx / speed;
              uy = p.vy / speed;
            }
            const x1 = p.x - ux * p.size * 8;
            const y1 = p.y - uy * p.size * 8;
            const x2 = p.x + ux * p.size * 6;
            const y2 = p.y + uy * p.size * 6;

            const lineGrad = this.ctx.createLinearGradient(x1, y1, x2, y2);
            lineGrad.addColorStop(0.0, getHslaColor(p.color, 0));
            lineGrad.addColorStop(0.2, getHslaColor(p.color, pct * 0.15));
            lineGrad.addColorStop(0.85, getHslaColor(p.color, pct * 0.95));
            lineGrad.addColorStop(1.0, getHslaColor(p.color, pct * 0.3));

            this.ctx.strokeStyle = lineGrad;
            this.ctx.lineWidth = p.size;
            this.ctx.lineCap = 'round';
            this.ctx.globalAlpha = 1.0;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
          } else if (p.shape === 'ring') {
            const radius = p.size + (1.0 - pct) * 44;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = p.color;
            this.ctx.globalAlpha = pct;
            this.ctx.lineWidth = 2.5;
            this.ctx.stroke();
          }
        }
        this.ctx.restore();

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
