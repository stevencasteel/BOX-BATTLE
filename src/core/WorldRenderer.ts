import { Player } from "@/entities/Player";
import { Camera } from "./Camera";
import { World } from "./World";
import { Rectangle, Particle } from "./Interfaces";
import { Projectile } from "@/entities/Projectile";
import { ObjectPool } from "./ObjectPool";

export class WorldRenderer {
  private drawPlayerAttackVisual(ctx: CanvasRenderingContext2D, player: Player, alpha: number) {
    const facing = player.facingDirection;
    ctx.lineCap = "round";

    const progress = 1.0 - (player.meleeComponent.attackActiveTimer / 0.09);
    const opacity = Math.max(0, player.meleeComponent.attackActiveTimer / 0.09);

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = player.previousPosition.x + (player.position.x - player.previousPosition.x) * alphaVal;
    const drawY = player.previousPosition.y + (player.position.y - player.previousPosition.y) * alphaVal;

    if (player.attackDirection === "side") {
      const offset = facing * 35;
      const baseStart = -Math.PI / 2;
      const angleLength = Math.PI;
      const currentSweepAngle = angleLength * progress;

      const cx = drawX + offset;
      const cy = drawY;

      ctx.save();
      ctx.lineCap = "butt";

      const trailAngle = currentSweepAngle * 0.75;
      
      ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.45})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        88,
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0 ? baseStart + trailAngle : Math.PI - (baseStart + trailAngle),
        facing < 0
      );
      ctx.stroke();

      ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.30})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        65,
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0 ? baseStart + trailAngle : Math.PI - (baseStart + trailAngle),
        facing < 0
      );
      ctx.stroke();

      const gradient = ctx.createRadialGradient(cx, cy, 25, cx, cy, 95);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.20, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.50, `rgba(132, 239, 158, ${opacity * 0.95})`);
      gradient.addColorStop(0.85, `rgba(34, 197, 94, ${opacity * 0.85})`);
      gradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");

      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20 * opacity;
      
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        95,
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle),
        facing < 0
      );
      ctx.arc(
        cx,
        cy,
        25,
        facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle),
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    else if (player.attackDirection === "up") {
      const cx = drawX;
      const cy = drawY - 35;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      const gradient = ctx.createRadialGradient(cx, cy, currentInnerRadius, cx, cy, currentRadius);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.20, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.50, `rgba(132, 239, 158, ${opacity * 0.95})`);
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
    }
    else if (player.attackDirection === "down") {
      const cx = drawX;
      const cy = drawY + 35;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      const gradient = ctx.createRadialGradient(cx, cy, currentInnerRadius, cx, cy, currentRadius);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.20, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.50, `rgba(132, 239, 158, ${opacity * 0.95})`);
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
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
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
    alpha: number
  ) {
    this.ctx.fillStyle = "#0c0d11";
    this.ctx.fillRect(0, 0, 1250, 1250);

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
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }

    this.ctx.fillStyle = "hsl(350, 80%, 60%)";
    for (const hazard of hazards) {
      const spikeWidth = 25;
      const spikeCount = Math.floor(hazard.width / spikeWidth);
      for (let i = 0; i < spikeCount; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(hazard.x + i * spikeWidth, 1200);
        this.ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth / 2, 1150);
        this.ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth, 1200);
        this.ctx.fill();
      }
    }

    if (world.boss) {
      world.boss.draw(this.ctx, alpha);
    }

    for (const p of particles) {
      const pct = p.life / p.maxLife;
      this.ctx.save();
      
      if (p.shape === "spark") {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } 
      else if (p.shape === "dust") {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.7);
      } 
      else if (p.shape === "ring") {
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

    if (bossDeathTimer >= 0 && bossDeathPos) {
      const t = bossDeathTimer;
      const px = bossDeathPos.x;
      const py = bossDeathPos.y;

      if (t < 0.25) {
        const flashOpacity = Math.max(0, 0.85 * (1 - t / 0.25));
        this.ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        this.ctx.fillRect(0, 0, 1250, 1250);
      }

      const ringCount = 3;
      const speed = 750;
      for (let i = 0; i < ringCount; i++) {
        const delay = i * 0.15;
        const ringTime = t - delay;
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
      if (t < particleLife) {
        const opacity = Math.max(0, 1 - t / particleLife);
        this.ctx.save();
        this.ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        this.ctx.shadowBlur = 15;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + (i % 2 === 0 ? t * 0.5 : -t * 0.5);
          const distance = t * particleSpeed * (0.6 + 0.4 * (i % 3) / 3);
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
      this.ctx.fillRect(0, 0, 1250, 1250);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 44px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("SIMULATION PAUSED", 625, 600);

      this.ctx.font = "bold 18px monospace";
      this.ctx.fillStyle = "var(--signal-green)";
      this.ctx.fillText("PRESS 'P' TO RESUME RUNTIME STEPPERS", 625, 650);
    }

    this.ctx.restore();
  }
}
