import { UNITS } from "@/core/Units";
import { World } from "@/core/World";

const PSEUDO_RANDOM_LUT = Array.from({ length: 128 }, () => Math.random() * 4 - 2);

export class CinematicDeathRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    world: World,
    bossDeathTimer: number,
    bossDeathPos: { x: number; y: number }
  ): void {
    const t = bossDeathTimer;
    const px = bossDeathPos.x;
    const py = bossDeathPos.y;

    const isPlayer = !!(world.player && world.player.isDead);
    const primaryColor = isPlayer ? "hsl(142, 71%, 58%)" : "hsl(350, 80%, 60%)";
    const secondaryColor = isPlayer ? "hsl(280, 80%, 65%)" : "hsl(45, 100%, 65%)";

    ctx.save();

    if (t < 1.0) {
      const progress = t;

      const gridCols = 8;
      const gridRows = 8;
      const baseWidth = 60;
      const baseHeight = 60;

      ctx.globalCompositeOperation = "lighter";

      for (let row = 0; row < gridRows; row++) {
        const cascadeDir = isPlayer ? -1 : 1;
        const birthDelay = isPlayer ? (7 - row) * 0.04 : row * 0.04;
        const activeProgress = Math.max(0, progress - birthDelay) / (1.0 - birthDelay);

        if (activeProgress > 0 && activeProgress < 1.0) {
          const opacity = 1.0 - activeProgress;
          const size = (baseWidth / gridCols) * (1.0 - activeProgress * 0.4);

          const lutIdx = (row * 7) % PSEUDO_RANDOM_LUT.length;
          const offsetVal = PSEUDO_RANDOM_LUT[lutIdx];

          const startX = px - baseWidth / 2 + (row % 2 === 0 ? 0.3 : -0.3) * offsetVal + (row + 0.5) * (baseWidth / gridCols);
          const startY = py - baseHeight / 2 + (row + 0.5) * (baseHeight / gridRows);

          const angle = Math.atan2(row - (gridRows - 1) / 2, (row % gridCols) - (gridCols - 1) / 2) + (row % 2 === 0 ? 0.2 : -0.2);
          const thrust = activeProgress * 80;
          const gravityOffset = cascadeDir * activeProgress * activeProgress * 140;

          const curX = startX + Math.cos(angle) * thrust + (Math.sin(progress * 15 + row) * 4 * (1.0 - activeProgress));
          const curY = startY + Math.sin(angle) * thrust + gravityOffset;

          ctx.fillStyle = (row + (row % gridCols)) % 2 === 0 ? primaryColor : secondaryColor;
          ctx.globalAlpha = opacity;

          ctx.save();
          ctx.translate(curX, curY);
          ctx.rotate(progress * 4 + row);
          ctx.fillRect(-size / 2, -size / 2, size, size);
          ctx.restore();
        }
      }

      if (progress >= 0.7) {
        const pinchProgress = (progress - 0.7) / 0.3;
        const flareAlpha = Math.sin(pinchProgress * Math.PI);

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = flareAlpha;

        const hLength = Math.max(4, 220 * (1.0 - Math.pow(pinchProgress, 3)));
        const hHeight = Math.max(1, 8 * (1.0 - pinchProgress));
        ctx.fillRect(px - hLength / 2, py - hHeight / 2, hLength, hHeight);

        const vHeight = Math.max(4, 220 * (1.0 - Math.pow(pinchProgress, 3)));
        const vWidth = Math.max(1, 8 * (1.0 - pinchProgress));
        ctx.fillRect(px - vWidth / 2, py - vHeight / 2, vWidth, vHeight);

        ctx.beginPath();
        ctx.arc(px, py, Math.max(2, 12 * (1.0 - pinchProgress)), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const flashT = t - 1.0;
    if (flashT >= 0 && flashT < 0.25) {
      const flashOpacity = Math.max(0, 0.85 * (1 - flashT / 0.25));
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = flashOpacity;
      ctx.fillRect(0, 0, UNITS.WORLD_SIZE, UNITS.WORLD_SIZE);
    }

    const explodeT = t - 1.0;

    if (explodeT >= 0 && explodeT < 1.2) {
      const explodeProgress = explodeT / 1.2;
      const opacity = Math.max(0, 1.0 - explodeProgress);

      ctx.globalCompositeOperation = "lighter";

      const rayCount = 14;
      const maxRayLength = 480;
      
      ctx.fillStyle = isPlayer ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
      ctx.globalAlpha = opacity * 0.35;

      ctx.beginPath();
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

        ctx.moveTo(px, py);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
      }
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = opacity * 0.75;
      ctx.beginPath();
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + explodeT * 0.4;
        const currentLength = maxRayLength * Math.sin(explodeProgress * Math.PI * 0.5);
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(angle) * currentLength * 0.8, py + Math.sin(angle) * currentLength * 0.8);
        ctx.lineTo(px + Math.cos(angle + 0.01) * currentLength * 0.8, py + Math.sin(angle + 0.01) * currentLength * 0.8);
        ctx.closePath();
      }
      ctx.fill();

      const ringCount = 3;
      const ringSpeed = 820;
      
      for (let i = 0; i < ringCount; i++) {
        const delay = i * 0.12;
        const ringTime = explodeT - delay;

        if (ringTime > 0 && ringTime < 1.0) {
          const radius = ringTime * ringSpeed;
          const ringOpacity = Math.max(0, 1 - ringTime / 1.0);

          ctx.beginPath();
          ctx.arc(px - 3, py, radius, 0, Math.PI * 2);
          ctx.strokeStyle = isPlayer ? "rgb(168, 85, 247)" : "rgb(239, 68, 68)";
          ctx.lineWidth = Math.max(1, 10 * (1 - ringTime / 1.0));
          ctx.globalAlpha = ringOpacity * 0.4;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px + 3, py, radius, 0, Math.PI * 2);
          ctx.strokeStyle = isPlayer ? "rgb(34, 197, 94)" : "rgb(234, 179, 8)";
          ctx.lineWidth = Math.max(1, 6 * (1 - ringTime / 1.0));
          ctx.globalAlpha = ringOpacity * 0.7;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = Math.max(1, 3 * (1 - ringTime / 1.0));
          ctx.globalAlpha = ringOpacity * 0.95;
          ctx.stroke();
        }
      }

      const particleCount = 28;
      const particleSpeed = 620;
      const particleLife = 1.0;
      
      if (explodeT < particleLife) {
        const partOpacity = Math.max(0, 1 - explodeT / particleLife);
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = partOpacity * 0.8;

        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + (i % 2 === 0 ? explodeT * 0.8 : -explodeT * 0.8);
          const distance = explodeT * particleSpeed * (0.6 + (0.4 * (i % 3)) / 3);
          const x = px + Math.cos(angle) * distance;
          const y = py + Math.sin(angle) * distance;
          ctx.fillRect(x - 5, y - 5, 10, 10);
        }

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = partOpacity;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + (i % 2 === 0 ? explodeT * 0.8 : -explodeT * 0.8);
          const distance = explodeT * particleSpeed * (0.6 + (0.4 * (i % 3)) / 3);
          const x = px + Math.cos(angle) * distance;
          const y = py + Math.sin(angle) * distance;
          ctx.fillRect(x - 2, y - 2, 4, 4);
        }
      }
    }

    ctx.restore();
  }
}
