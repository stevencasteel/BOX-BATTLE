import { Boss } from "@/entities/Boss";

export class BossVisuals {
  static draw(ctx: CanvasRenderingContext2D, boss: Boss, alpha: number): void {
    if (boss.isDead) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = boss.previousPosition.x + (boss.position.x - boss.previousPosition.x) * alphaVal;
    const drawY = boss.previousPosition.y + (boss.position.y - boss.previousPosition.y) * alphaVal;

    const activeState = boss.activeStateName;

    ctx.save();
    if (boss.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else if (activeState === "TELEGRAPH") {
      ctx.fillStyle = "hsl(45, 100%, 50%)";
      ctx.shadowColor = "rgba(234, 179, 8, 0.8)";
      ctx.shadowBlur = 20;
    } else {
      ctx.fillStyle = "hsl(350, 80%, 60%)";
      if (boss.currentPhase === 3) {
        ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
        ctx.shadowBlur = 25;
      }
    }

    const vWidth = boss.size.width * boss.visualScale.x;
    const vHeight = boss.size.height * boss.visualScale.y;
    const feetY = drawY + boss.size.height / 2;

    ctx.translate(drawX, feetY);
    ctx.rotate(boss.rotation);
    ctx.fillRect(-vWidth / 2, -vHeight, vWidth, vHeight);

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
