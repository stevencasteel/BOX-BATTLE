import { Player } from "@/entities/Player";
import { PlayerFxRenderer } from "@/core/effects/PlayerFxRenderer";
import { UNITS } from "@/core/Units";
import { setVec } from "@/core/VecUtils";
import { TrigLUT } from "@/core/TrigLUT";

const AURA_COLORS = [
  'hsla(280, 90%, 25%, 0.35)',
  'hsla(285, 95%, 45%, 0.55)',
  'hsla(290, 100%, 75%, 0.8)',
  'hsla(0, 0%, 100%, 0.95)'
];

export class PlayerVisuals {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  public updateRotation() {
    if (this.player.isCharging) return;

    setVec(this.player.targetVisualScale, 1.0, 1.0);
    if (!this.player.physics.isGrounded) {
      this.player.targetRotation = Math.sign(this.player.velocity.x) * Math.min(0.08, (Math.abs(this.player.velocity.x) / 1000) * 0.08);
    } else {
      const moveAxis = this.player.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
      this.player.targetRotation = moveAxis * 0.12;
    }
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (this.player.isDead) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.player.previousPosition.x + (this.player.position.x - this.player.previousPosition.x) * alphaVal;
    const drawY = this.player.previousPosition.y + (this.player.position.y - this.player.previousPosition.y) * alphaVal;

    for (const ghost of this.player.dashComponent.ghosts) {
      ctx.fillStyle = `hsla(142, 71%, 58%, ${ghost.opacity})`;
      const gWidth = this.player.size.width * this.player.visualScale.x;
      const gHeight = this.player.size.height * this.player.visualScale.y;
      const gFeetY = ghost.y + this.player.size.height / 2;
      ctx.fillRect(ghost.x - gWidth / 2, gFeetY - gHeight, gWidth, gHeight);
    }

    if (this.player.doubleJumpDiskTimer > 0) {
      const p = 1.0 - this.player.doubleJumpDiskTimer / 0.22;
      const alphaDisk = (1.0 - p) * 0.8;
      const radius = 18 + p * 44;

      ctx.save();
      ctx.translate(this.player.doubleJumpDiskPos.x, this.player.doubleJumpDiskPos.y);

      ctx.strokeStyle = `hsla(142, 71%, 58%, ${alphaDisk})`;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `hsla(142, 100%, 80%, ${alphaDisk * 0.5})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.6, radius * 0.6 * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    const vWidth = this.player.size.width * this.player.visualScale.x;
    const vHeight = this.player.size.height * this.player.visualScale.y;
    const feetY = drawY + this.player.size.height / 2;

    const nowTime = performance.now();
    const healCounts = { back: 0, front: 0 };
    const chargeCounts = { back: 0, front: 0 };

    if (this.player.isHealing) {
      const progress = Math.max(0, Math.min(1.0, (UNITS.HEAL_DURATION - this.player.healComponent.healTimer) / UNITS.HEAL_DURATION));
      PlayerFxRenderer.prepareHealSegments(nowTime, progress, healCounts);
    }

    if (this.player.isCharging) {
      PlayerFxRenderer.prepareChargeSegments(nowTime, this.player.chargeTimer, this.player.size.height, chargeCounts);
    }

    ctx.save();
    ctx.translate(drawX, feetY);
    ctx.rotate(this.player.rotation);

    if (this.player.isHealing) {
      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      const progress = Math.max(0, Math.min(1.0, (UNITS.HEAL_DURATION - this.player.healComponent.healTimer) / UNITS.HEAL_DURATION));
      PlayerFxRenderer.renderHealBuffer(ctx, true, healCounts.back, progress);
      ctx.restore();
    }

    if (this.player.isCharging) {
      ctx.save();
      ctx.lineCap = "round";
      PlayerFxRenderer.renderChargeBuffer(ctx, true, chargeCounts.back);
      ctx.restore();
    }

    if (this.player.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "hsl(142, 71%, 58%)";
    }

    ctx.fillRect(-vWidth / 2, -vHeight, vWidth, vHeight);

    const localCenterX = 0;
    const localCenterY = -this.player.size.height / 2;

    if (this.player.isHealing) {
      ctx.save();
      const progress = Math.max(0, Math.min(1.0, (UNITS.HEAL_DURATION - this.player.healComponent.healTimer) / UNITS.HEAL_DURATION));
      const baseW = this.player.size.width * (1.15 + progress * 0.75);
      const baseH = this.player.size.height * (1.1 + progress * 0.55);

      ctx.globalCompositeOperation = "lighter";

      AURA_COLORS.forEach((color, layerIdx) => {
        ctx.fillStyle = color;
        ctx.beginPath();

        const scaleFactor = 1.0 - layerIdx * 0.22;
        const width = baseW * scaleFactor;
        const height = baseH * scaleFactor;

        const bottomY = 0;
        const topY = -height;

        ctx.moveTo(-width / 2, bottomY);

        const leftSteps = 8;
        for (let j = 1; j <= leftSteps; j++) {
          const t = j / leftSteps;
          const currentY = bottomY - height * t;
          const angle = nowTime * 0.055 + j * 2.3 + layerIdx * 1.5;
          const spikeDist = (12 + progress * 16) * (1 - t * 0.5) * TrigLUT.sin(angle);
          const currentX = -width / 2 * (1 - t) + spikeDist;
          ctx.lineTo(currentX, currentY);
        }

        ctx.lineTo(0, topY);

        const rightSteps = 8;
        for (let j = rightSteps - 1; j >= 0; j--) {
          const t = j / rightSteps;
          const currentY = bottomY - height * t;
          const angle = nowTime * 0.055 + j * 2.3 + layerIdx * 1.5 + Math.PI;
          const spikeDist = (12 + progress * 16) * (1 - t * 0.5) * TrigLUT.sin(angle);
          const currentX = width / 2 * (1 - t) + spikeDist;
          ctx.lineTo(currentX, currentY);
        }

        ctx.lineTo(width / 2, bottomY);
        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();

      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      PlayerFxRenderer.renderHealBuffer(ctx, false, healCounts.front, progress);
      ctx.restore();
    }

    if (this.player.isCharging) {
      const chargeProgress = Math.max(0, Math.min(1.0, this.player.chargeTimer / UNITS.CHARGE_LVL2_TIME));
      const isLvl2 = this.player.chargeTimer >= UNITS.CHARGE_LVL2_TIME;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const coreRadius = (8 + chargeProgress * 14);
      const coreGrad = ctx.createRadialGradient(
        localCenterX, localCenterY, 0,
        localCenterX, localCenterY, coreRadius
      );
      coreGrad.addColorStop(0.0, '#ffffff');
      coreGrad.addColorStop(0.3, isLvl2 ? 'hsl(45, 100%, 75%)' : 'hsl(142, 100%, 80%)');
      coreGrad.addColorStop(1.0, 'rgba(255,255,255,0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(localCenterX, localCenterY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.lineCap = "round";
      PlayerFxRenderer.renderChargeBuffer(ctx, false, chargeCounts.front);
      ctx.restore();

      if (chargeProgress > 0.5) {
        const dischargeCount = isLvl2 ? 3 : 1;
        ctx.strokeStyle = isLvl2 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(132, 239, 158, 0.8)';
        ctx.lineWidth = isLvl2 ? 1.5 : 1.0;

        for (let d = 0; d < dischargeCount; d++) {
          if (Math.random() < 0.35) {
            const startAngle = Math.random() * Math.PI * 2;
            const rMax = (this.player.size.height * 0.35) + 20 * chargeProgress;

            ctx.beginPath();
            const cx = localCenterX + TrigLUT.cos(startAngle) * rMax;
            const cy = localCenterY + TrigLUT.sin(startAngle) * rMax;
            ctx.moveTo(cx, cy);

            const steps = 3;
            for (let s = 1; s <= steps; s++) {
              const t = s / steps;
              const nextAngle = startAngle + (Math.random() * 0.6 - 0.3);
              const nextRadius = rMax * (1.0 - t);
              const targetX = localCenterX + TrigLUT.cos(nextAngle) * nextRadius;
              const targetY = localCenterY + TrigLUT.sin(nextAngle) * nextRadius;

              ctx.lineTo(targetX, targetY);
            }
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
