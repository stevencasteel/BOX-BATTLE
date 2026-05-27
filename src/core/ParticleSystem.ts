import { Particle } from "./Interfaces";
import { ObjectPool, IPoolable } from "./ObjectPool";
import { eventBroker } from "./eventBroker";

export class PoolableParticle implements Particle, IPoolable {
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public color = "";
  public size = 0;
  public life = 0;
  public maxLife = 0;
  public shape: "spark" | "dust" | "ring" | "line" = "spark";
  public drag = 1.0;
  public startColor = "";
  public endColor = "";
  public isActive = false;
  public turbulence = 0;

  public activate(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    life: number,
    shape: "spark" | "dust" | "ring" | "line",
    drag: number = 1.0,
    startColor: string = "",
    endColor: string = "",
    turbulence: number = 0
  ) {
    this.turbulence = turbulence;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.shape = shape;
    this.drag = drag;
    this.startColor = startColor || color;
    this.endColor = endColor || color;
    this.isActive = true;
  }

  public deactivate() {
    this.isActive = false;
    this.drag = 1.0;
    this.startColor = "";
    this.endColor = "";
    this.turbulence = 0;
  }
}

export class ParticleSystem {
  private pool: ObjectPool<PoolableParticle>;
  private unsubs: (() => void)[] = [];

  constructor() {
    this.pool = new ObjectPool(() => new PoolableParticle(), 200);
    this.setupListeners();
  }

  private setupListeners() {
    this.unsubs.push(
      eventBroker.subscribe("SPAWN_SPARKS", ({ x, y, angle, color, radial, count, turbulence, shape }) => {
        const sparkCount = count || 12;
        for (let i = 0; i < sparkCount; i++) {
          const pAngle = radial
            ? (i / sparkCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2)
            : angle + (Math.random() * 0.9 - 0.45);
          const pSpeed = radial ? 100 + Math.random() * 300 : 160 + Math.random() * 280;

          const vx = Math.cos(pAngle) * pSpeed;
          const vy = Math.sin(pAngle) * pSpeed;
          const pColor = color || "hsl(142, 71%, 58%)";
          const size = 2.5 + Math.random() * 3.5;
          const life = 0.22;

          const drag = 0.94;
          let sCol = pColor;
          let eCol = pColor;
          if (pColor.includes("350") || pColor.includes("red") || pColor.includes("280")) {
            sCol = "hsl(45, 100%, 75%)";
            eCol = "hsl(350, 80%, 40%)";
          } else if (pColor.includes("142") || pColor.includes("green")) {
            sCol = "hsl(120, 100%, 80%)";
            eCol = "hsl(142, 100%, 30%)";
          }

          this.pool.get(x, y, vx, vy, pColor, size, life, shape || "spark", drag, sCol, eCol, turbulence || 0);
        }
      })
    );

    this.unsubs.push(
      eventBroker.subscribe("SPAWN_DUST", ({ x, y, direction }) => {
        const count = 14;
        const isVertical = direction === "vertical";
        for (let i = 0; i < count; i++) {
          const dir = i % 2 === 0 ? 1 : -1;
          
          const pSpeedX = isVertical
            ? -dir * (4 + Math.random() * 10)
            : dir * (125 + Math.random() * 160);

          const pSpeedY = isVertical
            ? dir * (125 + Math.random() * 160)
            : -4 - Math.random() * 10;

          const size = 3.5 + Math.random() * 3.5;
          const life = 0.35;
          const drag = 0.88;

          this.pool.get(x, y, pSpeedX, pSpeedY, "rgba(255, 255, 255, 0.35)", size, life, "dust", drag);
        }
      })
    );

    this.unsubs.push(
      eventBroker.subscribe("SPAWN_BLAST", ({ x, y, color }) => {
        this.pool.get(x, y, 0, 0, color, 8, 0.16, "ring");
      })
    );
  }

  public update(dt: number) {
    const active = this.pool.getActive();
    for (let i = active.length - 1; i >= 0; i--) {
      const p = active[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.pool.releaseAt(i);
        continue;
      }
      if (p.drag !== 1.0) {
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
      }
      if (p.turbulence > 0) {
        const wave = Math.sin(p.life * 22 + p.x * 0.02) * p.turbulence;
        p.x += wave * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  public getParticles(): readonly Particle[] {
    return this.pool.getActive();
  }

  public cleanup() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
    this.pool.clear();
  }
}
