import { Particle } from "./Interfaces";
import { eventBroker } from "./eventBroker";

export class ParticleSystem {
  private particles: Particle[] = [];
  private unsubs: (() => void)[] = [];

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    this.unsubs.push(
      eventBroker.subscribe("SPAWN_SPARKS", ({ x, y, angle, color, radial, count }) => {
        const sparkCount = count || 12;
        for (let i = 0; i < sparkCount; i++) {
          const pAngle = radial 
            ? (i / sparkCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2)
            : angle + (Math.random() * 0.9 - 0.45);
          const pSpeed = radial
            ? 100 + Math.random() * 300
            : 160 + Math.random() * 280;
          this.particles.push({
            x,
            y,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed,
            color: color || "hsl(142, 71%, 58%)",
            size: 2.5 + Math.random() * 3.5,
            life: 0.22,
            maxLife: 0.22,
            shape: "spark"
          });
        }
      })
    );

    this.unsubs.push(
      eventBroker.subscribe("SPAWN_DUST", ({ x, y }) => {
        const count = 10;
        for (let i = 0; i < count; i++) {
          const dir = i % 2 === 0 ? 1 : -1;
          const pSpeedX = dir * (50 + Math.random() * 110);
          const pSpeedY = -8 - Math.random() * 30;
          this.particles.push({
            x,
            y,
            vx: pSpeedX,
            vy: pSpeedY,
            color: "rgba(255, 255, 255, 0.40)",
            size: 3 + Math.random() * 3,
            life: 0.24,
            maxLife: 0.24,
            shape: "dust"
          });
        }
      })
    );

    this.unsubs.push(
      eventBroker.subscribe("SPAWN_BLAST", ({ x, y, color }) => {
        this.particles.push({
          x,
          y,
          vx: 0,
          vy: 0,
          color,
          size: 8,
          life: 0.16,
          maxLife: 0.16,
          shape: "ring"
        });
      })
    );
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  public getParticles(): readonly Particle[] {
    return this.particles;
  }

  public cleanup() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
    this.particles = [];
  }
}
