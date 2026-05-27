import { Player } from "@/entities/Player";
import { Projectile } from "@/entities/Projectile";
import { ObjectPool } from "./ObjectPool";
import { UNITS } from "@/core/Units";
import { World } from "./World";

export class EntityRenderer {
  private ctx: CanvasRenderingContext2D;
  private cachedMeleeGradient: CanvasGradient;
  private attackGradCanvas: HTMLCanvasElement;

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
  }

  public renderEntities(world: World, projectilePool: ObjectPool<Projectile>, alpha: number): void {
    if (world.boss) {
      world.boss.draw(this.ctx, alpha);
    }

    if (world.player) {
      world.player.draw(this.ctx, alpha);
      const player = world.player as Player;
      if (player.attackActive) {
        this.drawPlayerAttackVisual(player, alpha);
      }
    }

    for (const minion of world.minions) {
      minion.draw(this.ctx, alpha);
    }

    const activeProjectiles = projectilePool.getActive();
    for (const proj of activeProjectiles) {
      proj.draw(this.ctx, alpha);
    }
  }

  private drawPlayerAttackVisual(player: Player, alpha: number): void {
    const facing = player.facingDirection;
    this.ctx.lineCap = "round";

    const progress = 1.0 - player.meleeComponent.attackActiveTimer / 0.09;
    const opacity = Math.max(0, player.meleeComponent.attackActiveTimer / 0.09);

    if (opacity <= 0.01) return;

    const drawX = player.previousPosition.x + (player.position.x - player.previousPosition.x) * alpha;
    const drawY = player.previousPosition.y + (player.position.y - player.previousPosition.y) * alpha;

    if (player.attackDirection === "side") {
      const offset = facing * UNITS.MELEE_SIDE_OFFSET;
      const baseStart = -Math.PI / 2;
      const angleLength = Math.PI;
      const currentSweepAngle = angleLength * progress;

      const cx = drawX + offset;
      const cy = drawY;

      this.ctx.save();
      this.ctx.translate(cx, cy);

      const dynamicMeleeGradient = this.ctx.createRadialGradient(
        0,
        0,
        UNITS.MELEE_SWEEP_INNER_RADIUS,
        0,
        0,
        UNITS.MELEE_MAX_REACH
      );
      dynamicMeleeGradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      dynamicMeleeGradient.addColorStop(0.2, "rgba(255, 255, 255, 1.0)");
      dynamicMeleeGradient.addColorStop(0.5, "rgba(132, 239, 158, 0.95)");
      dynamicMeleeGradient.addColorStop(0.85, "rgba(34, 197, 94, 0.85)");
      dynamicMeleeGradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");

      this.ctx.globalAlpha = opacity;
      this.ctx.fillStyle = dynamicMeleeGradient;
      const startA = facing > 0 ? baseStart : Math.PI - baseStart;
      const endA = facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, UNITS.MELEE_MAX_REACH, startA, endA, facing < 0);
      this.ctx.arc(0, 0, UNITS.MELEE_SWEEP_INNER_RADIUS, endA, startA, facing > 0);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    } else if (player.attackDirection === "up") {
      const cx = drawX;
      const cy = drawY - UNITS.MELEE_VERTICAL_OFFSET;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      this.ctx.save();
      this.ctx.globalAlpha = opacity;
      this.ctx.translate(cx, cy);
      const gradScale = currentRadius / 64;
      this.ctx.scale(gradScale, gradScale);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 64, -Math.PI, 0);
      this.ctx.arc(0, 0, currentInnerRadius / gradScale, 0, -Math.PI, true);
      this.ctx.closePath();
      this.ctx.clip();
      this.ctx.drawImage(this.attackGradCanvas, -64, -64, 128, 128);
      this.ctx.restore();
    } else if (player.attackDirection === "down") {
      const cx = drawX;
      const cy = drawY + UNITS.MELEE_VERTICAL_OFFSET;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      this.ctx.save();
      this.ctx.globalAlpha = opacity;
      this.ctx.translate(cx, cy);
      const gradScale2 = currentRadius / 64;
      this.ctx.scale(gradScale2, gradScale2);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 64, 0, Math.PI);
      this.ctx.arc(0, 0, currentInnerRadius / gradScale2, Math.PI, 0, true);
      this.ctx.closePath();
      this.ctx.clip();
      this.ctx.drawImage(this.attackGradCanvas, -64, -64, 128, 128);
      this.ctx.restore();
    }
  }
}
