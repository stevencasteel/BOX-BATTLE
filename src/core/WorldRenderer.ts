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

      const isPlayer = !!(world.player && world.player.isDead);
      const primaryColor = isPlayer ? "hsl(142, 71%, 58%)" : "hsl(350, 80%, 60%)";
      const secondaryColor = isPlayer ? "hsl(280, 80%, 65%)" : "hsl(45, 100%, 65%)";
      const shadowColorRGBA = isPlayer ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)";

      // 1. Quantum Voxel Shatter & Gravity Cascade (Time 0.0s to 1.0s)
      if (t < 1.0) {
        const progress = t;
        this.ctx.save();

        const gridCols = 8;
        const gridRows = 8;
        const baseWidth = 60;
        const baseHeight = 60;

        for (let row = 0; row < gridRows; row++) {
          const cascadeDir = isPlayer ? -1 : 1;
          const birthDelay = isPlayer ? (7 - row) * 0.04 : row * 0.04;
          const activeProgress = Math.max(0, progress - birthDelay) / (1.0 - birthDelay);

          if (activeProgress > 0 && activeProgress < 1.0) {
            const opacity = 1.0 - activeProgress;
            const size = (baseWidth / gridCols) * (1.0 - activeProgress * 0.4);

            const startX = px - baseWidth / 2 + (row % 2 === 0 ? 0.3 : -0.3) * (Math.random() * 4 - 2) + (row + 0.5) * (baseWidth / gridCols);
            const startY = py - baseHeight / 2 + (row + 0.5) * (baseHeight / gridRows);

            const angle = Math.atan2(row - (gridRows - 1) / 2, (row % gridCols) - (gridCols - 1) / 2) + (row % 2 === 0 ? 0.2 : -0.2);
            const thrust = activeProgress * 80;
            const gravityOffset = cascadeDir * activeProgress * activeProgress * 140;

            const curX = startX + Math.cos(angle) * thrust + (Math.sin(progress * 15 + row) * 4 * (1.0 - activeProgress));
            const curY = startY + Math.sin(angle) * thrust + gravityOffset;

            this.ctx.fillStyle = (row + (row % gridCols)) % 2 === 0 ? primaryColor : secondaryColor;
            this.ctx.globalAlpha = opacity;
            this.ctx.shadowColor = shadowColorRGBA;
            this.ctx.shadowBlur = 10 * opacity;

            this.ctx.save();
            this.ctx.translate(curX, curY);
            this.ctx.rotate(progress * 4 + row);
            this.ctx.fillRect(-size / 2, -size / 2, size, size);
            this.ctx.restore();
          }
        }

        if (progress >= 0.7) {
          const pinchProgress = (progress - 0.7) / 0.3;
          const flareAlpha = Math.sin(pinchProgress * Math.PI);

          this.ctx.shadowColor = isPlayer ? "rgba(34, 197, 94, 0.95)" : "rgba(239, 68, 68, 0.95)";
          this.ctx.shadowBlur = 35 * flareAlpha;
          this.ctx.fillStyle = "#ffffff";
          this.ctx.globalAlpha = flareAlpha;

          const hLength = Math.max(4, 220 * (1.0 - Math.pow(pinchProgress, 3)));
          const hHeight = Math.max(1, 8 * (1.0 - pinchProgress));
          this.ctx.fillRect(px - hLength / 2, py - hHeight / 2, hLength, hHeight);

          const vHeight = Math.max(4, 220 * (1.0 - Math.pow(pinchProgress, 3)));
          const vWidth = Math.max(1, 8 * (1.0 - pinchProgress));
          this.ctx.fillRect(px - vWidth / 2, py - vHeight / 2, vWidth, vHeight);

          this.ctx.beginPath();
          this.ctx.arc(px, py, Math.max(2, 12 * (1.0 - pinchProgress)), 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      // 2. Detonation White Flash (Time 1.0s to 1.25s)
      const flashT = t - 1.0;
      if (flashT >= 0 && flashT < 0.25) {
        const flashOpacity = Math.max(0, 0.85 * (1 - flashT / 0.25));
        this.ctx.fillStyle = "rgba(255, 255, 255, " + flashOpacity + ")";
        this.ctx.fillRect(0, 0, UNITS.WORLD_SIZE, UNITS.WORLD_SIZE);
      }

      const explodeT = t - 1.0;

      // 3. Supernova Vector Energy Beams & Chromatic Dispersion Shockwaves (Time 1.0s to 2.2s)
      if (explodeT >= 0 && explodeT < 1.2) {
        const explodeProgress = explodeT / 1.2;
        const opacity = Math.max(0, 1.0 - explodeProgress);

        this.ctx.save();

        const rayCount = 14;
        const maxRayLength = 480;
        
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + explodeT * 0.4;
          const currentLength = maxRayLength * Math.sin(explodeProgress * Math.PI * 0.5);
          const rayWidth = 18 * Math.sin(explodeProgress * Math.PI) * (0.8 + 0.4 * (i % 2));

          const p1_angle = angle - (rayWidth / currentLength);
          const p2_angle = angle + (rayWidth / currentLength);

          const x1 = px + Math.cos(p1_angle) * currentLength;
          const y1 = py + Math.sin(p1_angle) * currentLength;
          const x2 = px + Math.cos(p2_angle) * currentLength;
          const y2 = py + Math.sin(p2_angle) * currentLength;

          this.ctx.fillStyle = isPlayer ? "hsla(142, 100%, 65%, " + (opacity * 0.35) + ")" : "hsla(350, 100%, 65%, " + (opacity * 0.35) + ")";
          this.ctx.shadowColor = primaryColor;
          this.ctx.shadowBlur = 20 * opacity;
          this.ctx.beginPath();
          this.ctx.moveTo(px, py);
          this.ctx.lineTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.closePath();
          this.ctx.fill();

          this.ctx.fillStyle = "rgba(255, 255, 255, " + (opacity * 0.75) + ")";
          this.ctx.shadowBlur = 0;
          this.ctx.beginPath();
          this.ctx.moveTo(px, py);
          this.ctx.lineTo(px + Math.cos(angle) * currentLength * 0.8, py + Math.sin(angle) * currentLength * 0.8);
          this.ctx.lineTo(px + Math.cos(angle + 0.01) * currentLength * 0.8, py + Math.sin(angle + 0.01) * currentLength * 0.8);
          this.ctx.closePath();
          this.ctx.fill();
        }

        const ringCount = 3;
        const ringSpeed = 820;
        
        for (let i = 0; i < ringCount; i++) {
          const delay = i * 0.12;
          const ringTime = explodeT - delay;

          if (ringTime > 0 && ringTime < 1.0) {
            const radius = ringTime * ringSpeed;
            const ringOpacity = Math.max(0, 1 - ringTime / 1.0);

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(px - 3, py, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = isPlayer ? "rgba(168, 85, 247, " + (ringOpacity * 0.4) + ")" : "rgba(239, 68, 68, " + (ringOpacity * 0.4) + ")";
            this.ctx.lineWidth = Math.max(1, 10 * (1 - ringTime / 1.0));
            this.ctx.stroke();
            this.ctx.restore();

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(px + 3, py, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = isPlayer ? "rgba(34, 197, 94, " + (ringOpacity * 0.7) + ")" : "rgba(234, 179, 8, " + (ringOpacity * 0.7) + ")";
            this.ctx.lineWidth = Math.max(1, 6 * (1 - ringTime / 1.0));
            this.ctx.stroke();
            this.ctx.restore();

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(px, py, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = "rgba(255, 255, 255, " + (ringOpacity * 0.95) + ")";
            this.ctx.lineWidth = Math.max(1, 3 * (1 - ringTime / 1.0));
            this.ctx.stroke();
            this.ctx.restore();
          }
        }

        const particleCount = 28;
        const particleSpeed = 620;
        const particleLife = 1.0;
        
        if (explodeT < particleLife) {
          const partOpacity = Math.max(0, 1 - explodeT / particleLife);
          this.ctx.save();
          this.ctx.shadowColor = primaryColor;
          this.ctx.shadowBlur = 18 * partOpacity;

          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + (i % 2 === 0 ? explodeT * 0.8 : -explodeT * 0.8);
            const distance = explodeT * particleSpeed * (0.6 + (0.4 * (i % 3)) / 3);
            const x = px + Math.cos(angle) * distance;
            const y = py + Math.sin(angle) * distance;

            this.ctx.fillStyle = primaryColor;
            this.ctx.globalAlpha = partOpacity * 0.8;
            this.ctx.fillRect(x - 5, y - 5, 10, 10);

            this.ctx.fillStyle = "#ffffff";
            this.ctx.globalAlpha = partOpacity;
            this.ctx.fillRect(x - 2, y - 2, 4, 4);
          }
          this.ctx.restore();
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
