import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld, EntityStatus } from "@/core/Interfaces";
import { StateMachine } from "@/core/StateMachine";
import {
  TurretPatrolState,
  LancerPatrolState,
  FlyerPatrolState
} from "./MinionStates";
import { eventBroker } from "@/core/eventBroker";

export type MinionType = "TURRET" | "LANCER" | "FLYER";

export class Minion extends BaseEntity {
  private unsubHurt!: () => void;
  public get status(): EntityStatus {
    if (this.isDead) return EntityStatus.DEAD;
    if (this.isDying) return EntityStatus.DYING;
    if (this.isSpawning) return EntityStatus.SPAWNING;
    return EntityStatus.ACTIVE;
  }

  public minionType: MinionType;
  public health!: HealthComponent;
  public physics!: PhysicsComponent;
  public stateMachine: StateMachine;

  public patrolSpeed: number = 100;
  public stateTimer: number = 0;
  public recoilTimer: number = 0;

  public pointA: { x: number; y: number } = { x: 0, y: 0 };
  public pointB: { x: number; y: number } = { x: 0, y: 0 };
  public flyerTarget: "A" | "B" = "B";

  public shootTimer: number = 0;
  public attackState: "PATROL" | "TELEGRAPH" | "ATTACK" | "COOLDOWN" = "PATROL";
  public volleyCount: number = 0;
  public volleyTimer: number = 0;

  public isSpawning: boolean = true;
  public spawnTimer: number = 1.2;
  public isDying: boolean = false;
  public dissolveTimer: number = 0.5;
  private exhaustTimer: number = 0;

  constructor(id: string, type: MinionType, startPos: { x: number; y: number }, world: IWorld) {
    super(id, world);
    this.minionType = type;
    this.position = { ...startPos };
    this.previousPosition = { ...startPos };

    this.visualScale = { x: 0.1, y: 0.1 };
    this.targetVisualScale = { x: 1.0, y: 1.0 };
    this.scaleVelocity = { x: 15.0, y: 15.0 };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.stateMachine = new StateMachine();

    if (type === "TURRET") {
      this.size = { width: 44, height: 44 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 5,
        invincibilityDuration: 0.15,
      });
      this.physics.gravity = 0;
      this.squashPivot = "feet";
      this.stateMachine.changeState(new TurretPatrolState(this));
    } else if (type === "LANCER") {
      this.size = { width: 40, height: 50 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 6,
        invincibilityDuration: 0.15,
      });
      this.squashPivot = "feet";
      this.stateMachine.changeState(new LancerPatrolState(this));
    } else {
      this.size = { width: 36, height: 36 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 3,
        invincibilityDuration: 0.15,
      });
      this.physics.gravity = 0;

      this.pointA = { ...startPos };
      this.pointB = { x: startPos.x, y: startPos.y - 180 };
      this.squashPivot = "center";
      this.stateMachine.changeState(new FlyerPatrolState(this));
    }
    eventBroker.publish("MINION_SPAWNING", undefined);

    this.unsubHurt = eventBroker.subscribe("MINION_HURT", ({ id, sourceX, sourceY, intensity }) => {
      if (id === this.id) {
        this.handleHurtReaction(sourceX, sourceY, intensity);
      }
    });
  }

  public startDeathSequence() {
    eventBroker.publish("MINION_DISSOLVING", undefined);
    this.isDying = true;
    this.dissolveTimer = 0.5;
    this.velocity = { x: 0, y: 0 };

    const mColor =
      this.minionType === "LANCER"
        ? "hsl(280, 70%, 65%)"
        : this.minionType === "FLYER"
          ? "hsl(200, 80%, 65%)"
          : "hsl(215, 20%, 65%)";

    eventBroker.publish("SPAWN_SPARKS", {
      x: this.position.x,
      y: this.position.y,
      angle: 0,
      color: mColor,
      radial: true,
      count: 24,
    });

    eventBroker.publish("SPAWN_BLAST", {
      x: this.position.x,
      y: this.position.y,
      color: mColor,
    });
  }

  public update(dt: number) {
    if (this.isDead) return;

    if (this.isSpawning) {
      this.spawnTimer -= dt;
      this.velocity = { x: 0, y: 0 };

      const mColor =
        this.minionType === "LANCER"
          ? "hsl(280, 70%, 65%)"
          : this.minionType === "FLYER"
            ? "hsl(200, 80%, 65%)"
            : "hsl(215, 20%, 65%)";

      if (Math.random() < 0.5) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 30;
        eventBroker.publish("SPAWN_SPARKS", {
          x: this.position.x + Math.cos(angle) * dist,
          y: this.position.y + Math.sin(angle) * dist,
          angle: angle + Math.PI,
          color: mColor,
        });
      }

      if (this.spawnTimer <= 0) {
        this.isSpawning = false;
      }
      super.update(dt);
      return;
    }

    if (this.isDying) {
      this.dissolveTimer -= dt;
      this.velocity = { x: 0, y: 0 };

      const mColor =
        this.minionType === "LANCER"
          ? "hsl(280, 70%, 65%)"
          : this.minionType === "FLYER"
            ? "hsl(200, 80%, 65%)"
            : "hsl(215, 20%, 65%)";

      if (Math.random() < 0.6) {
        eventBroker.publish("SPAWN_SPARKS", {
          x: this.position.x + (Math.random() * this.size.width - this.size.width / 2),
          y: this.position.y + (Math.random() * this.size.height - this.size.height / 2),
          angle: -Math.PI / 2 + (Math.random() * 0.4 - 0.2),
          color: mColor,
        });
      }

      if (this.dissolveTimer <= 0) {
        this.isDead = true;
      }
      super.update(dt);
      return;
    }

    this.stateTimer -= dt;
    this.shootTimer -= dt;

    if (this.recoilTimer > 0) {
      this.recoilTimer -= dt;
      const friction = 2.5;
      this.velocity.x += (0 - this.velocity.x) * friction * dt;
    } else {
      this.stateMachine.update(dt);
    }

    if (this.minionType === "LANCER" && this.attackState === "ATTACK") {
      this.targetRotation = this.facingDirection * 0.21;
    } else if (this.attackState === "TELEGRAPH" && !this.isDying) {
      this.targetRotation = 0;
      this.rotation = Math.sin(performance.now() * 0.055) * 0.25;
      this.rotationVelocity = 0;
    } else {
      this.targetRotation = Math.sign(this.velocity.x) * 0.12;
      if (this.attackState === "PATROL" && !this.isDying && !this.isSpawning) {
        this.targetRotation += Math.sin(performance.now() * 0.008 + this.position.x) * 0.04;
      }
    }

    this.exhaustTimer -= dt;
    if (this.exhaustTimer <= 0) {
      const isTelegraph = this.attackState === "TELEGRAPH";
      
      if (this.minionType === "FLYER") {
        this.exhaustTimer = isTelegraph ? 0.04 : 0.08;
        const sparkColor = isTelegraph ? "hsl(45, 100%, 60%)" : "hsl(200, 80%, 65%)";
        eventBroker.publish("SPAWN_SPARKS", {
          x: this.position.x,
          y: this.position.y + this.size.height / 2,
          angle: Math.PI / 2,
          color: sparkColor,
          count: isTelegraph ? 6 : 2
        });
      } else if (this.minionType === "LANCER") {
        if (Math.abs(this.velocity.x) > 0 && this.physics.isGrounded) {
          this.exhaustTimer = isTelegraph ? 0.05 : 0.15;
          const scrapeColor = isTelegraph ? "hsl(45, 100%, 60%)" : "rgba(255, 255, 255, 0.4)";
          eventBroker.publish("SPAWN_SPARKS", {
            x: this.position.x - this.facingDirection * (this.size.width / 2),
            y: this.position.y + this.size.height / 2,
            angle: Math.atan2(0.5, -this.facingDirection) + (Math.random() * 0.3 - 0.15),
            color: scrapeColor,
            count: isTelegraph ? 3 : 1
          });
        }
      } else if (this.minionType === "TURRET") {
        if (isTelegraph) {
          this.exhaustTimer = 0.06;
          eventBroker.publish("SPAWN_SPARKS", {
            x: this.position.x + (Math.random() * 16 - 8),
            y: this.position.y - this.size.height / 2,
            angle: -Math.PI / 2 + (Math.random() * 0.2 - 0.1),
            color: "hsl(0, 100%, 65%)",
            count: 2
          });
        }
      }
    }

    this.checkHazardContact();

    super.update(dt);
  }

  public fireSingleShotAtPlayer(player: { position: { x: number; y: number } }) {
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return;

    const dirX = dx / mag;
    const dirY = dy / mag;

    this.world.spawnProjectile(
      this.position.x + dirX * 30,
      this.position.y + dirY * 30,
      dirX,
      dirY,
      "boss",
      1,
      400,
      5.0
    );
  }

  private checkHazardContact() {
    if (this.health.isInvincible() || this.isDead || this.isSpawning || this.isDying) return;

    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;

    for (const hazard of this.world.physicsWorld.hazards) {
      const isHit =
        this.position.x + halfW > hazard.x &&
        this.position.x - halfW < hazard.x + hazard.width &&
        this.position.y + halfH > hazard.y &&
        this.position.y - halfH < hazard.y + hazard.height;

      if (isHit && this.velocity.y >= 0) {
        eventBroker.publish("PLAYER_SPIKED", { x: this.position.x });
        const damaged = this.health.takeDamage(1);
        if (damaged && !this.isDead) {
          if (this.minionType !== "TURRET" && !this.isDying) {
            this.velocity.y = -550;
            this.physics.isGrounded = false;
          }
          this.visualScale = { x: 0.5, y: 1.5 };
          this.scaleVelocity = { x: 10.0, y: -15.0 };
        }
        break;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (this.isDead) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
    const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

    const nowTime = performance.now();
    const backCage: { x1: number; y1: number; x2: number; y2: number; color: string; width: number }[] = [];
    const frontCage: { x1: number; y1: number; x2: number; y2: number; color: string; width: number }[] = [];

    const totalSpawnTime = 1.2;
    const elapsedTime = totalSpawnTime - this.spawnTimer;
    const spawnPct = Math.max(0, Math.min(1.0, elapsedTime / totalSpawnTime));

    ctx.save();

    if (this.isSpawning) {
      const secondHalfProgress = spawnPct <= 0.5 ? 0 : (spawnPct - 0.5) / 0.5;

      const firstHalfProgress = spawnPct <= 0.5 ? spawnPct / 0.5 : 1.0;
      const accordionScale = 1.0 - Math.pow(1.0 - firstHalfProgress, 3) * Math.cos(firstHalfProgress * 3.5 * Math.PI);
      
      const staticFlicker = Math.random() < 0.04 ? 0.45 : 1.0;
      const cageAlpha = spawnPct <= 0.5 ? 0.85 * staticFlicker : (1.0 - secondHalfProgress) * 0.85 * staticFlicker;

      const mColor =
        this.minionType === "LANCER"
          ? `hsla(280, 85%, 65%, ${cageAlpha})`
          : this.minionType === "FLYER"
            ? `hsla(200, 85%, 65%, ${cageAlpha})`
            : `hsla(142, 80%, 65%, ${cageAlpha})`;

      const H = this.size.height;
      const W = this.size.width;
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

          const x1 = R * Math.cos(theta1);
          const y1 = -h + R * Math.sin(theta1) * 0.28;

          const x2 = R * Math.cos(theta2);
          const y2 = -h + R * Math.sin(theta2) * 0.28;

          const midAngle = (theta1 + theta2) / 2;
          const isBehind = Math.sin(midAngle) < 0;

          const segment = { x1, y1, x2, y2, color: mColor, width: 1.5 };
          if (isBehind) {
            backCage.push(segment);
          } else {
            frontCage.push(segment);
          }
        }
      }

      const strutAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
      for (const angle of strutAngles) {
        const theta = angle + rotation;
        const x = R * Math.cos(theta);
        const yBottom = -hBottom + R * Math.sin(theta) * 0.28;
        const yTop = -hTop + R * Math.sin(theta) * 0.28;

        const isBehind = Math.sin(theta) < 0;
        const segment = { x1: x, y1: yBottom, x2: x, y2: yTop, color: mColor, width: 2.0 };
        if (isBehind) {
          backCage.push(segment);
        } else {
          frontCage.push(segment);
        }
      }
    }

    const feetY = drawY + this.size.height / 2;
    ctx.translate(drawX, feetY);
    ctx.rotate(this.rotation);

    const drawCageSegments = (segments: typeof backCage) => {
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

    if (this.isSpawning) {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      drawCageSegments(backCage);
      ctx.restore();
    }

    ctx.save();

    if (this.isSpawning) {
      const secondHalfProgress = spawnPct <= 0.5 ? 0 : (spawnPct - 0.5) / 0.5;
      ctx.globalAlpha = secondHalfProgress;
    } else if (this.isDying) {
      const pct = this.dissolveTimer / 0.5;
      ctx.globalAlpha = pct;
      ctx.translate(0, -this.size.height / 2);
      ctx.scale(pct, pct);
      ctx.translate(0, this.size.height / 2);
    }

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      if (this.minionType === "TURRET") {
        ctx.fillStyle = "#718096";
      } else if (this.minionType === "LANCER") {
        ctx.fillStyle = "hsl(280, 60%, 55%)";
      } else if (this.minionType === "FLYER") {
        ctx.fillStyle = "hsl(200, 70%, 55%)";
      }
    }

    if (this.attackState === "TELEGRAPH" && !this.isDying) {
      ctx.fillStyle = "hsl(45, 100%, 50%)";
      ctx.shadowColor = "rgba(234, 179, 8, 0.8)";
      ctx.shadowBlur = 14;
    }

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;
    const localY = this.squashPivot === "feet" ? -this.size.height / 2 : 0;

    ctx.fillRect(-vWidth / 2, -vHeight, vWidth, vHeight);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "black";
    const faceDirection = this.minionType === "LANCER" ? this.facingDirection : 1;
    ctx.fillRect(faceDirection * 8 - 2, localY - 12, 6, 4);
    ctx.restore();

    if (this.isSpawning) {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      drawCageSegments(frontCage);
      ctx.restore();
    }

    ctx.restore();
  }

  public handleHurtReaction(sourceX: number, sourceY: number, intensity: number) {
    if (this.isDead || this.isDying || this.isSpawning) return;

    const dx = this.position.x - sourceX;
    const dy = this.position.y - sourceY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const dirX = dx !== 0 ? dx / dist : -this.facingDirection;

    this.velocity.x = dirX * 320 * intensity;
    this.velocity.y = Math.min(this.velocity.y, -340 * intensity);
    this.physics.isGrounded = false;

    this.visualScale = { x: 1.0 - 0.2 * intensity, y: 1.0 + 0.4 * intensity };
    this.scaleVelocity = { x: 10.0 * intensity, y: -20.0 * intensity };

    const rotImpulse = -Math.sign(dirX) * 18.0 * intensity;
    this.applyAngularImpulse(rotImpulse);

    this.recoilTimer = 0.35 * intensity;
  }

  public teardown() {
    if (this.unsubHurt) {
      this.unsubHurt();
    }
    super.teardown();
  }
}
