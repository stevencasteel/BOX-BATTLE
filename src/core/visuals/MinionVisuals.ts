import { TrigLUT } from "@/core/TrigLUT";
import { BaseMinion } from "@/entities/BaseMinion";

interface CageSegment { x1: number; y1: number; x2: number; y2: number; color: string; width: number; }
const backCageScratch: CageSegment[] = [];
const frontCageScratch: CageSegment[] = [];

export class MinionVisuals {
  static draw(ctx: CanvasRenderingContext2D, minion: BaseMinion, alpha: number): void {
    if (minion.isDead) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = minion.previousPosition.x + (minion.position.x - minion.previousPosition.x) * alphaVal;
    const drawY = minion.previousPosition.y + (minion.position.y - minion.previousPosition.y) * alphaVal;

    const nowTime = performance.now();
    backCageScratch.length = 0;
    frontCageScratch.length = 0;

    const totalSpawnTime = 1.2;
    const elapsedTime = totalSpawnTime - minion.spawnTimer;
    const spawnPct = Math.max(0, Math.min(1.0, elapsedTime / totalSpawnTime));

    ctx.save();

    if (minion.isSpawning) {
      const secondHalfProgress = spawnPct <= 0.5 ? 0 : (spawnPct - 0.5) / 0.5;

      const firstHalfProgress = spawnPct <= 0.5 ? spawnPct / 0.5 : 1.0;
      const t = 1.0 - firstHalfProgress;
      const accordionScale = 1.0 - t * t * t * TrigLUT.cos(firstHalfProgress * 3.5 * Math.PI);

      const staticFlicker = TrigLUT.random() < 0.04 ? 0.45 : 1.0;
      const cageAlpha = spawnPct <= 0.5 ? 0.85 * staticFlicker : (1.0 - secondHalfProgress) * 0.85 * staticFlicker;

      const mColor = minion["cageColorValue"] + `${cageAlpha})`;

      const H = minion.size.height;
      const W = minion.size.width;
      const R = W * 0.72;

      const rotation = nowTime * 0.005;
      const hMid = H / 2;

      const hBottom = hMid - hMid * accordionScale;
      const hMiddle = hMid;
      const hTop = hMid + hMid * accordionScale;

      const ringHeights = [hBottom, hMiddle, hTop];
      const segments = 24;
      const step = (Math.PI * 2) / segments;

      for (let rIdx = 0; rIdx < ringHeights.length; rIdx++) {
        const h = ringHeights[rIdx];
        const dir = rIdx % 2 === 0 ? 1 : -1;
        const ringRotation = rotation * dir;

        for (let i = 0; i < segments; i++) {
          const theta1 = i * step + ringRotation;
          const theta2 = (i + 1) * step + ringRotation;

          const x1 = R * TrigLUT.cos(theta1);
          const y1 = -h + R * TrigLUT.sin(theta1) * 0.28;

          const x2 = R * TrigLUT.cos(theta2);
          const y2 = -h + R * TrigLUT.sin(theta2) * 0.28;

          const midAngle = (theta1 + theta2) / 2;
          const isBehind = TrigLUT.sin(midAngle) < 0;

          const segment = { x1, y1, x2, y2, color: mColor, width: 1.5 };
          if (isBehind) {
            backCageScratch.push(segment);
          } else {
            frontCageScratch.push(segment);
          }
        }
      }

      const strutAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
      for (const angle of strutAngles) {
        const theta = angle + rotation;
        const x = R * TrigLUT.cos(theta);
        const yBottom = -hBottom + R * TrigLUT.sin(theta) * 0.28;
        const yTop = -hTop + R * TrigLUT.sin(theta) * 0.28;

        const isBehind = TrigLUT.sin(theta) < 0;
        const segment = { x1: x, y1: yBottom, x2: x, y2: yTop, color: mColor, width: 2.0 };
        if (isBehind) {
          backCageScratch.push(segment);
        } else {
          frontCageScratch.push(segment);
        }
      }
    }

    const feetY = drawY + minion.size.height / 2;
    ctx.translate(drawX, feetY);
    ctx.rotate(minion.rotation);

    const drawCageSegments = (segments: CageSegment[]) => {
      for (let s = 0; s < segments.length; s++) {
        const seg = segments[s];
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = seg.width;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }
    };

    if (minion.isSpawning) {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      drawCageSegments(backCageScratch);
      ctx.restore();
    }

    ctx.save();

    if (minion.isSpawning) {
      const secondHalfProgress = spawnPct <= 0.5 ? 0 : (spawnPct - 0.5) / 0.5;
      ctx.globalAlpha = secondHalfProgress;
    } else if (minion.isDying) {
      const pct = minion.dissolveTimer / 0.5;
      ctx.globalAlpha = pct;
      ctx.translate(0, -minion.size.height / 2);
      ctx.scale(pct, pct);
      ctx.translate(0, minion.size.height / 2);
    }

    if (minion.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = minion["bodyColorValue"];
    }

    if (minion.attackState === "TELEGRAPH" && !minion.isDying) {
      ctx.fillStyle = "hsl(45, 100%, 50%)";
      ctx.shadowColor = "rgba(234, 179, 8, 0.8)";
      ctx.shadowBlur = 14;
    }

    const vWidth = minion.size.width * minion.visualScale.x;
    const vHeight = minion.size.height * minion.visualScale.y;
    const localY = minion.squashPivot === "feet" ? -minion.size.height / 2 : 0;

    ctx.fillRect(-vWidth / 2, -vHeight, vWidth, vHeight);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "black";
    ctx.fillRect(minion.facingDirection * 8 - 2, localY - 12, 6, 4);
    ctx.restore();

    if (minion.isSpawning) {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      drawCageSegments(frontCageScratch);
      ctx.restore();
    }

    ctx.restore();
  }
}
