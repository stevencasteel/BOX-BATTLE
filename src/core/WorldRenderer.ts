import { Player } from "@/entities/Player";
import { Camera } from "./Camera";
import { World } from "./World";
import { Rectangle, Particle } from "./Interfaces";
import { Projectile } from "@/entities/Projectile";
import { ObjectPool } from "./ObjectPool";
import { UNITS } from "@/core/Units";

const colorCache = new Map<string, { h: number; s: number; l: number } | null>();

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
  const c1 = parseHsl(startStr);
  const c2 = parseHsl(endStr);
  if (!c1 || !c2) return startStr;

  const factor = 1 - pct;
  const h = c1.h + (c2.h - c1.h) * factor;
  const s = c1.s + (c2.s - c1.s) * factor;
  const l = c1.l + (c2.l - c1.l) * factor;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function convertToHsla(colorStr: string, alpha: number): string {
  if (colorStr.startsWith("hsl(")) {
    return colorStr.replace("hsl(", "hsla(").replace(")", ", " + alpha + ")");
  }
  return colorStr;
}

export class WorldRenderer {
  private ctx: CanvasRenderingContext2D;
  private cachedMeleeGradient: CanvasGradient;

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
    this.cachedMeleeGradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");
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
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(
        0,
        0,
        UNITS.MELEE_MAX_REACH,
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle),
        facing < 0
      );
      ctx.arc(
        0,
        0,
        UNITS.MELEE_SWEEP_INNER_RADIUS,
        facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle),
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (player.attackDirection === "up") {
      const cx = drawX;
      const cy = drawY - UNITS.MELEE_VERTICAL_OFFSET;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      const gradient = ctx.createRadialGradient(cx, cy, currentInnerRadius, cx, cy, currentRadius);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.2, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(132, 239, 158, ${opacity * 0.95})`);
      gradient.addColorStop(0.85, `rgba(34, 197, 94, ${opacity * 0.85})`);
      gradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");

      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20 * opacity;

      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, -Math.PI, 0);
      ctx.arc(cx, cy, currentInnerRadius, 0, -Math.PI, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (player.attackDirection === "down") {
      const cx = drawX;
      const cy = drawY + UNITS.MELEE_VERTICAL_OFFSET;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      const gradient = ctx.createRadialGradient(cx, cy, currentInnerRadius, cx, cy, currentRadius);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.2, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(132, 239, 158, ${opacity * 0.95})`);
      gradient.addColorStop(0.85, `rgba(34, 197, 94, ${opacity * 0.85})`);
      gradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");

      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20 * opacity;

      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI);
      ctx.arc(cx, cy, currentInnerRadius, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
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
    this.ctx.fillStyle = "#0c0d11";
    this.ctx.fillRect(0, 0, UNITS.WORLD_SIZE, UNITS.WORLD_SIZE);

    this.ctx.save();
    this.ctx.translate(Camera.offsetX, Camera.offsetY);

    this.ctx.fillStyle = "#1e1e24";
    for (const solid of solids) {
      this.ctx.fillRect(solid.x, solid.y, solid.width, solid.height);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      this.ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
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

    this.ctx.fillStyle = "hsl(350, 80%, 60%)";
    this.ctx.beginPath();
    for (const hazard of hazards) {
      const spikeWidth = 25;
      const spikeCount = Math.floor(hazard.width / spikeWidth);
      for (let i = 0; i < spikeCount; i++) {
        this.ctx.moveTo(hazard.x + i * spikeWidth, 1200);
        this.ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth / 2, 1150);
        this.ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth, 1200);
      }
    }
    this.ctx.fill();

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

    for (const p of particles) {
      const pct = p.life / p.maxLife;
      this.ctx.save();

      if (p.shape === 'spark') {
        const sparkColor = (p.startColor && p.endColor) ? lerpHsl(p.startColor, p.endColor, pct) : p.color;
        const radialGrad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5);
        radialGrad.addColorStop(0.0, convertToHsla(sparkColor, pct));
        radialGrad.addColorStop(0.3, convertToHsla(sparkColor, pct * 0.5));
        radialGrad.addColorStop(1.0, convertToHsla(sparkColor, 0));
        this.ctx.fillStyle = radialGrad;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'dust') {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.7);
      } else if (p.shape === 'line') {
        const angle = Math.atan2(p.vy, p.vx);
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(angle);
        
        const lineGrad = this.ctx.createLinearGradient(-p.size * 8, 0, p.size * 6, 0);
        lineGrad.addColorStop(0.0, convertToHsla(p.color, 0));
        lineGrad.addColorStop(0.2, convertToHsla(p.color, pct * 0.15));
        lineGrad.addColorStop(0.85, convertToHsla(p.color, pct * 0.95));
        lineGrad.addColorStop(1.0, convertToHsla(p.color, pct * 0.3));
        
        this.ctx.strokeStyle = lineGrad;
        this.ctx.lineWidth = p.size;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(-p.size * 8, 0);
        this.ctx.lineTo(p.size * 6, 0);
        this.ctx.stroke();
        this.ctx.restore();
      } else if (p.shape === 'ring') {
        const radius = p.size + (1.0 - pct) * 44;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 10 * pct;
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    if (bossDeathTimer >= 0 && bossDeathPos) {
      const t = bossDeathTimer;
      const px = bossDeathPos.x;
      const py = bossDeathPos.y;

      if (t < 1.0) {
        const implodeProgress = t;
        const scale = Math.max(0, 1.0 - Math.pow(implodeProgress, 3));
        const radius = 135 * scale;
        const opacity = 1.0 - implodeProgress;

        if (radius > 1) {
          const rotationY = t * 2.5;
          const rotationX = t * 1.2;

          this.ctx.save();
          this.ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.85})`;
          this.ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
          this.ctx.shadowBlur = 20 * (1.0 - implodeProgress);
          this.ctx.lineWidth = 1.5;

          this.ctx.beginPath();

          const latitudes = [-Math.PI / 4, 0, Math.PI / 4];
          const segments = 24;
          const step = (Math.PI * 2) / segments;

          for (let lIdx = 0; lIdx < latitudes.length; lIdx++) {
            const lat = latitudes[lIdx];
            const ringR = radius * Math.cos(lat);
            const ringY = radius * Math.sin(lat);

            for (let i = 0; i < segments; i++) {
              const theta1 = i * step + rotationY;
              const theta2 = (i + 1) * step + rotationY;

              const x1_0 = ringR * Math.cos(theta1);
              const z1_0 = ringR * Math.sin(theta1);
              const y1_0 = ringY;

              const x1 = x1_0;
              const y1 = y1_0 * Math.cos(rotationX) - z1_0 * Math.sin(rotationX);

              const x2_0 = ringR * Math.cos(theta2);
              const z2_0 = ringR * Math.sin(theta2);
              const y2_0 = ringY;

              const x2 = x2_0;
              const y2 = y2_0 * Math.cos(rotationX) - z2_0 * Math.sin(rotationX);

              this.ctx.moveTo(px + x1, py + y1 * 0.7);
              this.ctx.lineTo(px + x2, py + y2 * 0.7);
            }
          }

          const longitudes = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
          for (let loIdx = 0; loIdx < longitudes.length; loIdx++) {
            const long = longitudes[loIdx];
            for (let i = 0; i < segments; i++) {
              const theta1 = i * step + rotationX;
              const theta2 = (i + 1) * step + rotationX;

              const x1_0 = radius * Math.cos(theta1) * Math.cos(long);
              const y1_0 = radius * Math.sin(theta1);
              const z1_0 = radius * Math.cos(theta1) * Math.sin(long);

              const x1 = x1_0 * Math.cos(rotationY) + z1_0 * Math.sin(rotationY);
              const y1 = y1_0;

              const x2_0 = radius * Math.cos(theta2) * Math.cos(long);
              const y2_0 = radius * Math.sin(theta2);
              const z2_0 = radius * Math.cos(theta2) * Math.sin(long);

              const x2 = x2_0 * Math.cos(rotationY) + z2_0 * Math.sin(rotationY);
              const y2 = y2_0;

              this.ctx.moveTo(px + x1, py + y1 * 0.7);
              this.ctx.lineTo(px + x2, py + y2 * 0.7);
            }
          }

          this.ctx.stroke();
          this.ctx.restore();
        }
      }

      const flashT = t - 1.0;
      if (flashT >= 0 && flashT < 0.25) {
        const flashOpacity = Math.max(0, 0.85 * (1 - flashT / 0.25));
        this.ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        this.ctx.fillRect(0, 0, UNITS.WORLD_SIZE, UNITS.WORLD_SIZE);
      }

      const ringCount = 3;
      const speed = 750;
      for (let i = 0; i < ringCount; i++) {
        const delay = i * 0.15;
        const ringTime = t - 1.0 - delay;
        if (ringTime > 0 && ringTime < 1.2) {
          const radius = ringTime * speed;
          const opacity = Math.max(0, 1 - ringTime / 1.2);

          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(px, py, radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.85})`;
          this.ctx.lineWidth = Math.max(1, 14 * (1 - ringTime / 1.2));
          this.ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
          this.ctx.shadowBlur = 30 * (1 - ringTime / 1.2);
          this.ctx.stroke();

          this.ctx.beginPath();
          this.ctx.arc(px, py, radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
          this.ctx.lineWidth = Math.max(1, 4 * (1 - ringTime / 1.2));
          this.ctx.shadowBlur = 0;
          this.ctx.stroke();
          this.ctx.restore();
        }
      }

      const particleCount = 24;
      const particleSpeed = 550;
      const particleLife = 1.0;
      const explodeT = t - 1.0;
      if (explodeT >= 0 && explodeT < particleLife) {
        const opacity = Math.max(0, 1 - explodeT / particleLife);
        this.ctx.save();
        this.ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        this.ctx.shadowBlur = 15;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + (i % 2 === 0 ? explodeT * 0.5 : -explodeT * 0.5);
          const distance = explodeT * particleSpeed * (0.6 + (0.4 * (i % 3)) / 3);
          const x = px + Math.cos(angle) * distance;
          const y = py + Math.sin(angle) * distance;

          this.ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
          this.ctx.fillRect(x - 4, y - 4, 8, 8);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        this.ctx.restore();
      }
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
