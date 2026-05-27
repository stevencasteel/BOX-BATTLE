import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { eventBroker } from "@/core/eventBroker";
import { EntityStatus } from "@/core/Interfaces";
import { UNITS } from "@/core/Units";

export class MeleeComponent implements IEntityComponent {
  public owner!: BaseEntity;

  public attackCooldownTimer: number = 0;
  private targetsScratchpad: BaseEntity[] = [];
  public attackActiveTimer: number = 0;
  public attackActive: boolean = false;
  public attackDirection: "side" | "up" | "down" | null = null;
  public hasHitEnemyThisSwing: boolean = false;

  private readonly pogoForce: number = 450;
  private readonly meleeRangeLimit: number = UNITS.MELEE_MAX_REACH;
  private readonly closeRangeThreshold: number = UNITS.MELEE_CLOSE_RANGE_THRESHOLD;
  private readonly sideReachOffset: number = UNITS.MELEE_SIDE_OFFSET;
  private readonly verticalReachOffset: number = UNITS.MELEE_VERTICAL_OFFSET;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public update(dt: number): void {
    this.decayAttackTimers(dt);

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

    const entity = this.owner;
    if (entity.visualScale && entity.scaleVelocity) {
      if (direction === "side") {
        entity.visualScale.y = 0.94;
        entity.visualScale.x = 1.06;
        entity.scaleVelocity.x = this.owner.facingDirection * 4;
        entity.scaleVelocity.y = 1.5;
      } else if (direction === "up") {
        entity.visualScale.y = 1.08;
        entity.visualScale.x = 0.92;
        entity.scaleVelocity.y = -5;
        entity.scaleVelocity.x = 1.5;
      } else if (direction === "down") {
        entity.visualScale.y = 1.08;
        entity.visualScale.x = 0.92;
        entity.scaleVelocity.y = 5;
        entity.scaleVelocity.x = 1.5;
      }
    }

    eventBroker.publish("PLAYER_ATTACKED", { direction });
  }

  private checkMeleeAttackContact(): void {
    this.swipeEnemies();
    this.swipeIncomingProjectiles();
  }

  private swipeEnemies(): void {
    const targets = this.gatherAwaitingTargets();
    const facing = this.owner.facingDirection;

    for (const target of targets) {
      let isWithinSwingArc = false;
      let distanceToTarget = 0;

      if (this.attackDirection === "side") {
        const centerReachX = this.owner.position.x + facing * this.sideReachOffset;
        const centerReachY = this.owner.position.y;

        distanceToTarget = this.calculateDistSq(target.position.x, target.position.y, centerReachX, centerReachY);

        const reachLimit = this.meleeRangeLimit + target.size.width / 2;
        const withinReach = distanceToTarget <= reachLimit * reachLimit;
        const withinDirection =
          (facing > 0 && target.position.x >= centerReachX - 25) ||
          (facing < 0 && target.position.x <= centerReachX + 25);

        if (withinReach && withinDirection) {
          isWithinSwingArc = true;
        }
      } else if (this.attackDirection === "up") {
        const centerReachX = this.owner.position.x;
        const centerReachY = this.owner.position.y - this.verticalReachOffset;

        distanceToTarget = this.calculateDistSq(target.position.x, target.position.y, centerReachX, centerReachY);

        const reachVertLimit = this.meleeRangeLimit + target.size.height / 2;
        const withinReach = distanceToTarget <= reachVertLimit * reachVertLimit;
        const withinDirection = target.position.y <= centerReachY + 25;

        if (withinReach && withinDirection) {
          isWithinSwingArc = true;
        }
      }

      if (isWithinSwingArc) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          const isCloseRange = distanceToTarget <= this.closeRangeThreshold * this.closeRangeThreshold;
          const damageAmount = isCloseRange ? UNITS.PLAYER_MELEE_DAMAGE_CLOSE : UNITS.PLAYER_MELEE_DAMAGE_BASE;

          const registeredDamage = health.takeDamage(
            damageAmount,
            this.owner.position.x,
            this.owner.position.y
          );
          if (registeredDamage) {
            this.hasHitEnemyThisSwing = true;
            eventBroker.publish("DETERMINATION_CHANGED", { determination: 1 }); // Trigger determination increment

            // Apply blade resistance pushback recoil to the player
            const recoilForce = isCloseRange ? 200 : 90;
            this.owner.velocity.x = -facing * recoilForce;
            if (this.owner.getComponent(HealthComponent)?.owner.world.physicsWorld) {
              const isGrounded = this.owner.velocity.y === 0 || this.owner.physics?.isGrounded;
              if (!isGrounded) {
                this.owner.velocity.y = Math.min(this.owner.velocity.y, -120);
              }
            }
            if (this.owner.recoilTimer !== undefined) {
              this.owner.recoilTimer = 0.15;
            }

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

  private swipeIncomingProjectiles(): void {
    const facing = this.owner.facingDirection;
    const activeProjectiles = this.owner.world.getProjectiles();

    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
      const proj = activeProjectiles[i];
      if (proj.isActive && proj.ownerId === "boss") {
        let isDeflected = false;

        if (this.attackDirection === "side") {
          const centerReachX = this.owner.position.x + facing * this.sideReachOffset;
          const centerReachY = this.owner.position.y;
          const distSq = this.calculateDistSq(proj.position.x, proj.position.y, centerReachX, centerReachY);

          const projReachLimit = this.meleeRangeLimit + proj.size.width / 2;
          const withinReach = distSq <= projReachLimit * projReachLimit;
          const withinDirection =
            (facing > 0 && proj.position.x >= centerReachX - 25) ||
            (facing < 0 && proj.position.x <= centerReachX + 25);

          if (withinReach && withinDirection) {
            isDeflected = true;
          }
        } else if (this.attackDirection === "up") {
          const centerReachX = this.owner.position.x;
          const centerReachY = this.owner.position.y - this.verticalReachOffset;
          const distSqUp = this.calculateDistSq(proj.position.x, proj.position.y, centerReachX, centerReachY);

          const projReachLimitUp = this.meleeRangeLimit + proj.size.height / 2;
          const withinReach = distSqUp <= projReachLimitUp * projReachLimitUp;
          const withinDirection = proj.position.y <= centerReachY + 25;

          if (withinReach && withinDirection) {
            isDeflected = true;
          }
        }

        if (isDeflected) {
          this.owner.world.releaseProjectile(proj);
          this.hasHitEnemyThisSwing = true;
          eventBroker.publish("DETERMINATION_CHANGED", { determination: 1 });
          eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
        }
      }
    }
  }

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
          health.takeDamage(UNITS.PLAYER_MELEE_DAMAGE_BASE);
          eventBroker.publish("DETERMINATION_CHANGED", { determination: 1 });
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
          eventBroker.publish("DETERMINATION_CHANGED", { determination: 1 });
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

  private applyPogoRebound(): void {
    this.owner.velocity.y = -this.pogoForce;
    this.owner.position.y -= 2;
    this.hasHitEnemyThisSwing = true;
    eventBroker.publish("PLAYER_POGOED", undefined);
  }

  private gatherAwaitingTargets(): readonly BaseEntity[] {
    this.targetsScratchpad.length = 0;
    if (this.owner.world.boss && !this.owner.world.boss.isDead) {
      this.targetsScratchpad.push(this.owner.world.boss as BaseEntity);
    }
    const minions = this.owner.world.minions;
    for (let i = 0; i < minions.length; i++) {
      const minion = minions[i];
      if (minion && minion.status === EntityStatus.ACTIVE) {
        this.targetsScratchpad.push(minion as BaseEntity);
      }
    }
    return this.targetsScratchpad;
  }

  private calculateDistSq(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
  }
}
