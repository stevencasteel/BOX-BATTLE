import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { eventBroker } from "@/core/eventBroker";
import { EntityStatus, IEntity } from "@/core/Interfaces";
import { DashComponent } from "@/entities/components/DashComponent";
import { UNITS } from "@/core/Units";

export interface IMeleeCapable extends IEntity {
  facingDirection: number;
  hasDoubleJump: boolean;
  registerDamageDealt?(): void;
}

export class MeleeComponent implements IEntityComponent {
  public owner!: IMeleeCapable;

  // High-frequency timing registers
  public attackCooldownTimer: number = 0;
  public attackActiveTimer: number = 0;
  public attackActive: boolean = false;
  public attackDirection: "side" | "up" | "down" | null = null;
  public hasHitEnemyThisSwing: boolean = false;

  // Balancing & Reach parameters
  private readonly pogoForce: number = 450;
  private readonly meleeRangeLimit: number = UNITS.MELEE_MAX_REACH;
  private readonly closeRangeThreshold: number = UNITS.MELEE_CLOSE_RANGE_THRESHOLD;
  private readonly sideReachOffset: number = UNITS.MELEE_SIDE_OFFSET;
  private readonly verticalReachOffset: number = UNITS.MELEE_VERTICAL_OFFSET;

  public setup(owner: BaseEntity): void {
    this.owner = owner as unknown as IMeleeCapable;
  }

  public update(dt: number): void {
    this.decayAttackTimers(dt);

    // Evaluate active swing intersections if we have not registered contact yet
    if (this.attackActive && !this.hasHitEnemyThisSwing) {
      if (this.attackDirection === "down") {
        this.checkPogoAttack();
      } else {
        this.checkMeleeAttackContact();
      }
    }
  }

  private decayAttackTimers(dt: number): void {
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= dt;
    if (this.attackActiveTimer > 0) this.attackActiveTimer -= dt;

    if (this.attackActive && this.attackActiveTimer <= 0) {
      this.attackActive = false;
      this.attackDirection = null;
    }
  }

  public triggerAttack(direction: "side" | "up" | "down"): void {
    this.attackActive = true;
    this.attackActiveTimer = 0.09;
    this.attackCooldownTimer = 0.15;
    this.hasHitEnemyThisSwing = false;
    this.attackDirection = direction;

    eventBroker.publish("PLAYER_ATTACKED", { direction });
  }

  /**
   * Main intersection bridge for horizontal (side) and vertical-upward swipes.
   */
  private checkMeleeAttackContact(): void {
    this.swipeEnemies();
    this.swipeIncomingProjectiles();
  }

  /**
   * Evaluates and applies swipe damage to valid boss and minion targets within range.
   */
  private swipeEnemies(): void {
    const targets = this.gatherAwaitingTargets();
    const facing = this.owner.facingDirection;

    for (const target of targets) {
      let isWithinSwingArc = false;
      let distanceToTarget = 0;

      if (this.attackDirection === "side") {
        const centerReachX = this.owner.position.x + facing * this.sideReachOffset;
        const centerReachY = this.owner.position.y;

        distanceToTarget = this.calculateDistance(target.position.x, target.position.y, centerReachX, centerReachY);

        const withinReach = distanceToTarget <= this.meleeRangeLimit + target.size.width / 2;
        const withinDirection =
          (facing > 0 && target.position.x >= centerReachX - 25) ||
          (facing < 0 && target.position.x <= centerReachX + 25);

        if (withinReach && withinDirection) {
          isWithinSwingArc = true;
        }
      } else if (this.attackDirection === "up") {
        const centerReachX = this.owner.position.x;
        const centerReachY = this.owner.position.y - this.verticalReachOffset;

        distanceToTarget = this.calculateDistance(target.position.x, target.position.y, centerReachX, centerReachY);

        const withinReach = distanceToTarget <= this.meleeRangeLimit + target.size.height / 2;
        const withinDirection = target.position.y <= centerReachY + 25;

        if (withinReach && withinDirection) {
          isWithinSwingArc = true;
        }
      }

      if (isWithinSwingArc) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          const isCloseRange = distanceToTarget <= this.closeRangeThreshold;
          const damageAmount = isCloseRange ? 5 : 1;

          const registeredDamage = health.takeDamage(damageAmount);
          if (registeredDamage) {
            this.hasHitEnemyThisSwing = true;
            this.owner.registerDamageDealt?.();

            if (isCloseRange) {
              eventBroker.publish("CAMERA_SHAKE", { amplitude: 8, duration: 0.15 });
            }
            eventBroker.publish("SPAWN_SPARKS", {
              x: target.position.x,
              y: target.position.y,
              angle: facing > 0 ? 0 : Math.PI,
              color: "hsl(142, 71%, 58%)",
            });
          }
        }
      }
    }
  }

  /**
   * Evaluates and releases/deflects incoming hostile projectiles within swipe reach.
   */
  private swipeIncomingProjectiles(): void {
    const facing = this.owner.facingDirection;
    const activeProjectiles = [...this.owner.world.getProjectiles()];

    for (const proj of activeProjectiles) {
      if (proj.isActive && proj.ownerId === "boss") {
        let isDeflected = false;

        if (this.attackDirection === "side") {
          const centerReachX = this.owner.position.x + facing * this.sideReachOffset;
          const centerReachY = this.owner.position.y;
          const distance = this.calculateDistance(proj.position.x, proj.position.y, centerReachX, centerReachY);

          const withinReach = distance <= this.meleeRangeLimit + proj.size.width / 2;
          const withinDirection =
            (facing > 0 && proj.position.x >= centerReachX - 25) ||
            (facing < 0 && proj.position.x <= centerReachX + 25);

          if (withinReach && withinDirection) {
            isDeflected = true;
          }
        } else if (this.attackDirection === "up") {
          const centerReachX = this.owner.position.x;
          const centerReachY = this.owner.position.y - this.verticalReachOffset;
          const distance = this.calculateDistance(proj.position.x, proj.position.y, centerReachX, centerReachY);

          const withinReach = distance <= this.meleeRangeLimit + proj.size.height / 2;
          const withinDirection = proj.position.y <= centerReachY + 25;

          if (withinReach && withinDirection) {
            isDeflected = true;
          }
        }

        if (isDeflected) {
          this.owner.world.releaseProjectile(proj);
          this.hasHitEnemyThisSwing = true;
          this.owner.registerDamageDealt?.();
          eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
        }
      }
    }
  }

  /**
   * Main intersection bridge for downward pogo hits against enemies, projectiles, and solid ground.
   */
  private checkPogoAttack(): void {
    const pogoHitbox = {
      x: this.owner.position.x + UNITS.POGO_HITBOX_X_OFFSET,
      y: this.owner.position.y + UNITS.POGO_HITBOX_Y_OFFSET,
      width: UNITS.POGO_HITBOX_WIDTH,
      height: UNITS.POGO_HITBOX_HEIGHT,
    };

    if (this.pogoEnemies(pogoHitbox)) return;
    if (this.pogoIncomingProjectiles(pogoHitbox)) return;
    this.pogoEnvironmentSurfaces(pogoHitbox);
  }

  private pogoEnemies(pogoBox: { x: number; y: number; width: number; height: number }): boolean {
    const targets = this.gatherAwaitingTargets();

    for (const target of targets) {
      const halfW = target.size.width / 2;
      const halfH = target.size.height / 2;

      const isColliding =
        pogoBox.x + pogoBox.width > target.position.x - halfW &&
        pogoBox.x < target.position.x + halfW &&
        pogoBox.y + pogoBox.height > target.position.y - halfH &&
        pogoBox.y < target.position.y + halfH;

      if (isColliding) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          health.takeDamage(1);
          this.owner.registerDamageDealt?.();
        }

        this.applyPogoRebound();
        return true;
      }
    }
    return false;
  }

  private pogoIncomingProjectiles(pogoBox: { x: number; y: number; width: number; height: number }): boolean {
    const activeProjectiles = this.owner.world.getProjectiles();

    for (const proj of activeProjectiles) {
      if (proj.isActive && proj.ownerId === "boss") {
        const pW = proj.size.width / 2;
        const pH = proj.size.height / 2;

        const isColliding =
          pogoBox.x + pogoBox.width > proj.position.x - pW &&
          pogoBox.x < proj.position.x + pW &&
          pogoBox.y + pogoBox.height > proj.position.y - pH &&
          pogoBox.y < proj.position.y + pH;

        if (isColliding) {
          this.owner.world.releaseProjectile(proj);
          this.owner.registerDamageDealt?.();
          this.applyPogoRebound();
          return true;
        }
      }
    }
    return false;
  }

  private pogoEnvironmentSurfaces(pogoBox: { x: number; y: number; width: number; height: number }): void {
    const surfaces = [
      ...this.owner.world.physicsWorld.solids,
      ...this.owner.world.physicsWorld.onewayPlatforms,
      ...this.owner.world.physicsWorld.hazards,
    ];

    for (const solid of surfaces) {
      const isColliding =
        pogoBox.x + pogoBox.width > solid.x &&
        pogoBox.x < solid.x + solid.width &&
        pogoBox.y + pogoBox.height > solid.y &&
        pogoBox.y < solid.y + solid.height;

      if (isColliding) {
        this.applyPogoRebound();
        break;
      }
    }
  }

  /**
   * Calculates vertical push force upon landing a successful downward strike,
   * restoring the double-jump and dash registers.
   */
  private applyPogoRebound(): void {
    this.owner.velocity.y = -this.pogoForce;
    this.owner.position.y -= 2;
    this.hasHitEnemyThisSwing = true;
    this.owner.hasDoubleJump = true;

    const dash = this.owner.getComponent(DashComponent);
    if (dash) {
      dash.resetDashCharge();
    }

    eventBroker.publish("PLAYER_POGOED", undefined);
  }

  private gatherAwaitingTargets(): BaseEntity[] {
    const targets: BaseEntity[] = [];
    if (this.owner.world.boss && !this.owner.world.boss.isDead) {
      targets.push(this.owner.world.boss as BaseEntity);
    }
    for (const minion of this.owner.world.minions) {
      if (minion && minion.status === EntityStatus.ACTIVE) {
        targets.push(minion as BaseEntity);
      }
    }
    return targets;
  }

  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
