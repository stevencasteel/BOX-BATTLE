import { Particle } from "./Interfaces";

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

  const step = Math.round(pct * 20);
  const cacheKey = `${startStr}_${endStr}_${step}`;

  const cached = lerpCache.get(cacheKey);
  if (cached) return cached;

  const c1 = parseHsl(startStr);
  const c2 = parseHsl(endStr);
  if (!c1 || !c2) return startStr;

  const factor = 1 - step / 20;
  const h = c1.h + (c2.h - c1.h) * factor;
  const s = c1.s + (c2.s - c1.s) * factor;
  const l = c1.l + (c2.l - c1.l) * factor;

  const result = `hsl(${h}, ${s}%, ${l}%)`;
  lerpCache.set(cacheKey, result);
  colorCache.set(result, { h, s, l });
  return result;
}

function getHslaColor(colorStr: string, alpha: number): string {
  const parsed = parseHsl(colorStr);
  if (parsed) {
    return `hsla(${parsed.h}, ${parsed.s}%, ${parsed.l}%, ${alpha})`;
  }
  return colorStr;
}

export class ParticleRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public renderParticles(particles: readonly Particle[]): void {
    this.ctx.save();
    for (const p of particles) {
      const pct = p.life / p.maxLife;

      if (p.shape === "spark") {
        const sparkColor = p.startColor && p.endColor ? lerpHsl(p.startColor, p.endColor, pct) : p.color;
        this.ctx.fillStyle = getHslaColor(sparkColor, pct);
        this.ctx.globalAlpha = 1.0;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === "dust") {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.7);
      } else if (p.shape === "line") {
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
        this.ctx.lineCap = "round";
        this.ctx.globalAlpha = 1.0;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      } else if (p.shape === "ring") {
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
  }
}
