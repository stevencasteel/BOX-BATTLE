import { UNITS } from "@/core/Units";

interface SegmentBuffer {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

interface ChargeSegmentBuffer {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

const MAX_SEGMENTS = 256;

const healBackBuffer: SegmentBuffer[] = Array.from({ length: MAX_SEGMENTS }, () => ({ x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0 }));
const healFrontBuffer: SegmentBuffer[] = Array.from({ length: MAX_SEGMENTS }, () => ({ x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0 }));

const chargeBackBuffer: ChargeSegmentBuffer[] = Array.from({ length: MAX_SEGMENTS }, () => ({ x1: 0, y1: 0, x2: 0, y2: 0, color: "", width: 0 }));
const chargeFrontBuffer: ChargeSegmentBuffer[] = Array.from({ length: MAX_SEGMENTS }, () => ({ x1: 0, y1: 0, x2: 0, y2: 0, color: "", width: 0 }));

const ORBITS = [
  { psi: 0.1, phi: 0.38, speed: 0.005 },
  { psi: Math.PI / 4, phi: 0.52, speed: -0.004 },
  { psi: -Math.PI / 4, phi: 0.52, speed: 0.003 }
];

const ACTIVE_RINGS_LVL2 = [
  { orbitIndex: 0, color: "rgba(234, 179, 8, 0.85)" },
  { orbitIndex: 1, color: "rgba(134, 212, 51, 0.85)" },
  { orbitIndex: 2, color: "rgba(34, 197, 94, 0.95)" }
];

const ACTIVE_RINGS_LVL1 = [
  { orbitIndex: 0, color: "rgba(234, 179, 8, 0.65)" },
  { orbitIndex: 2, color: "rgba(34, 197, 94, 0.75)" }
];

export class PlayerFxRenderer {
  public static prepareHealSegments(
    nowTime: number,
    progress: number,
    outCounts: { back: number; front: number }
  ): void {
    const segmentsCount = 120;
    const loops = 4.0;
    const maxAngle = loops * Math.PI * 2;
    const rotationOffset = nowTime * 0.008;
    const coilHeight = progress * 84;

    let backIdx = 0;
    let frontIdx = 0;

    for (let i = 0; i < segmentsCount; i++) {
      const t1 = i / segmentsCount;
      const t2 = (i + 1) / segmentsCount;

      const angle1 = t1 * maxAngle + rotationOffset;
      const angle2 = t2 * maxAngle + rotationOffset;

      const r1 = (42 * (1 - t1 * 0.3)) + Math.sin(nowTime * 0.03 + t1 * 8) * 2;
      const r2 = (42 * (1 - t2 * 0.3)) + Math.sin(nowTime * 0.03 + t2 * 8) * 2;

      const x1 = r1 * Math.cos(angle1);
      const y1 = -t1 * coilHeight + r1 * Math.sin(angle1) * 0.28;

      const x2 = r2 * Math.cos(angle2);
      const y2 = -t2 * coilHeight + r2 * Math.sin(angle2) * 0.28;

      const midAngle = (angle1 + angle2) / 2;
      const isBehind = Math.sin(midAngle) < 0;

      const segmentAlpha = (1.0 - t1 * 0.25) * progress;

      if (isBehind) {
        if (backIdx < MAX_SEGMENTS) {
          const seg = healBackBuffer[backIdx];
          seg.x1 = x1;
          seg.y1 = y1;
          seg.x2 = x2;
          seg.y2 = y2;
          seg.alpha = segmentAlpha;
          backIdx++;
        }
      } else {
        if (frontIdx < MAX_SEGMENTS) {
          const seg = healFrontBuffer[frontIdx];
          seg.x1 = x1;
          seg.y1 = y1;
          seg.x2 = x2;
          seg.y2 = y2;
          seg.alpha = segmentAlpha;
          frontIdx++;
        }
      }
    }

    outCounts.back = backIdx;
    outCounts.front = frontIdx;
  }

  public static renderHealBuffer(ctx: CanvasRenderingContext2D, isBehind: boolean, count: number): void {
    const buffer = isBehind ? healBackBuffer : healFrontBuffer;
    for (let s = 0; s < count; s++) {
      const seg = buffer[s];
      ctx.strokeStyle = `hsla(280, 100%, 75%, ${seg.alpha})`;
      ctx.shadowColor = `hsla(280, 100%, 75%, ${seg.alpha * 0.95})`;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
  }

  public static prepareChargeSegments(
    nowTime: number,
    chargeTimer: number,
    playerHeight: number,
    outCounts: { back: number; front: number }
  ): void {
    const chargeProgress = Math.max(0, Math.min(1.0, chargeTimer / UNITS.CHARGE_LVL2_TIME));
    const isLvl2 = chargeTimer >= UNITS.CHARGE_LVL2_TIME;

    const baseRadius = (playerHeight * 0.35) + chargeProgress * 10;
    const localCenterX = 0;
    const localCenterY = -playerHeight / 2;

    const activeRings = isLvl2 ? ACTIVE_RINGS_LVL2 : ACTIVE_RINGS_LVL1;

    let backIdx = 0;
    let frontIdx = 0;

    for (let s = 0; s < activeRings.length; s++) {
      const ringConfig = activeRings[s];
      const orbit = ORBITS[ringConfig.orbitIndex];
      const segments = 32;
      const step = (Math.PI * 2) / segments;
      const rotationSpeed = orbit.speed * nowTime;
      const ringColor = ringConfig.color;

      const lineWidth = isLvl2 ? (s === 2 ? 2.5 : 1.5) : 1.2;

      for (let i = 0; i < segments; i++) {
        const theta1 = i * step + rotationSpeed;
        const theta2 = (i + 1) * step + rotationSpeed;

        const noise1 = Math.sin(theta1 * 5 + nowTime * 0.04) * 3 * chargeProgress;
        const noise2 = Math.sin(theta2 * 5 + nowTime * 0.04) * 3 * chargeProgress;

        const r1 = baseRadius + noise1 + s * 12 * chargeProgress;
        const r2 = baseRadius + noise2 + s * 12 * chargeProgress;

        const x0_1 = r1 * Math.cos(theta1);
        const y0_1 = r1 * Math.sin(theta1);
        
        const x1_1 = x0_1 * Math.cos(orbit.psi);
        const y1_1 = y0_1;
        const z1_1 = -x0_1 * Math.sin(orbit.psi);

        const x2_1 = x1_1;
        const y2_1 = y1_1 * Math.cos(orbit.phi) - z1_1 * Math.sin(orbit.phi);
        const z2_1 = y1_1 * Math.sin(orbit.phi) + z1_1 * Math.cos(orbit.phi);

        const x0_2 = r2 * Math.cos(theta2);
        const y0_2 = r2 * Math.sin(theta2);

        const x1_2 = x0_2 * Math.cos(orbit.psi);
        const y1_2 = y0_2;
        const z1_2 = -x0_2 * Math.sin(orbit.psi);

        const x2_2 = x1_2;
        const y2_2 = y1_2 * Math.cos(orbit.phi) - z1_2 * Math.sin(orbit.phi);
        const z2_2 = y1_2 * Math.sin(orbit.phi) + z1_2 * Math.cos(orbit.phi);

        const p1_x = localCenterX + x2_1;
        const p1_y = localCenterY + y2_1;
        const p1_z = z2_1;

        const p2_x = localCenterX + x2_2;
        const p2_y = localCenterY + y2_2;
        const p2_z = z2_2;

        const midZ = (p1_z + p2_z) / 2;

        if (midZ < 0) {
          if (backIdx < MAX_SEGMENTS) {
            const seg = chargeBackBuffer[backIdx];
            seg.x1 = p1_x;
            seg.y1 = p1_y;
            seg.x2 = p2_x;
            seg.y2 = p2_y;
            seg.color = ringColor;
            seg.width = lineWidth;
            backIdx++;
          }
        } else {
          if (frontIdx < MAX_SEGMENTS) {
            const seg = chargeFrontBuffer[frontIdx];
            seg.x1 = p1_x;
            seg.y1 = p1_y;
            seg.x2 = p2_x;
            seg.y2 = p2_y;
            seg.color = ringColor;
            seg.width = lineWidth;
            frontIdx++;
          }
        }
      }
    }

    outCounts.back = backIdx;
    outCounts.front = frontIdx;
  }

  public static renderChargeBuffer(ctx: CanvasRenderingContext2D, isBehind: boolean, count: number): void {
    const buffer = isBehind ? chargeBackBuffer : chargeFrontBuffer;
    for (let s = 0; s < count; s++) {
      const seg = buffer[s];
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = seg.width;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
  }
}
