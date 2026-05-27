import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { InputReceiverComponent } from "@/entities/components/InputReceiverComponent";
import { DashComponent } from "@/entities/components/DashComponent";
import { MeleeComponent } from "@/entities/components/MeleeComponent";
import { FireballComponent } from "@/entities/components/FireballComponent";
import { HealComponent } from "@/entities/components/HealComponent";
import { IWorld } from "@/core/Interfaces";
import { eventBroker } from "@/core/eventBroker";
import { UNITS } from "@/core/Units";
import { setVec, zeroVec } from "@/core/VecUtils";
import { PlayerInputHandler } from "@/entities/handlers/PlayerInputHandler";
import { PlayerCombatHandler } from "@/entities/handlers/PlayerCombatHandler";
import { PlayerVisuals } from "@/entities/handlers/PlayerVisuals";

export class Player extends BaseEntity {
  public health!: HealthComponent;
  declare public physics: PhysicsComponent;
  public inputReceiver!: InputReceiverComponent;
  public dashComponent!: DashComponent;
  public meleeComponent!: MeleeComponent;
  public fireballComponent!: FireballComponent;
  public healComponent!: HealComponent;

  public readonly moveSpeed: number = UNITS.PLAYER_MOVE_SPEED;
  public readonly jumpForce: number = UNITS.PLAYER_JUMP_FORCE;
  public readonly wallSlideSpeed: number = UNITS.PLAYER_WALL_SLIDE_SPEED;

  public coyoteTimer: number = 0;
  public jumpBufferTimer: number = 0;
  public hasDoubleJump: boolean = true;

  public wallCoyoteTimer: number = 0;
  public lastWallNormal: number = 0;
  public airtimeDuration: number = 0;

  public determinationCounter: number = 0;
  public healingCharges: number = 0;
  public readonly maxHealingCharges: number = 3;

  public hurtTimer: number = 0;
  public recoilTimer: number = 0;
  public maxFallSpeed: number = 0;
  public wasOnWall: boolean = false;

  public doubleJumpDiskTimer: number = 0;
  public doubleJumpDiskPos: { x: number; y: number } = { x: 0, y: 0 };

  public inputHandler: PlayerInputHandler;
  public combatHandler: PlayerCombatHandler;
  public visuals: PlayerVisuals;

  private unsubHurt!: () => void;
  private unsubChargeMaxed!: () => void;
  private unsubPogo!: () => void;
  private unsubHealComplete!: () => void;
  private unsubHealCancel!: () => void;
  private unsubChargeCancel!: () => void;
  private unsubDamageDealt!: () => void;
  private unsubProjectileFired!: () => void;

  constructor(id: string, world: IWorld) {
    super(id, world);
    this.size = { width: 40, height: 80 };
    this.squashPivot = "center";

    zeroVec(this.position);
    zeroVec(this.previousPosition);

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: UNITS.PLAYER_MAX_HP,
      invincibilityDuration: 1.5,
    });

    this.inputReceiver = this.addComponent(InputReceiverComponent, new InputReceiverComponent());
    this.dashComponent = this.addComponent(DashComponent, new DashComponent());
    this.meleeComponent = this.addComponent(MeleeComponent, new MeleeComponent());
    this.fireballComponent = this.addComponent(FireballComponent, new FireballComponent());
    this.healComponent = this.addComponent(HealComponent, new HealComponent());

    this.inputHandler = new PlayerInputHandler(this);
    this.combatHandler = new PlayerCombatHandler(this);
    this.visuals = new PlayerVisuals(this);

    this.setupSubscribers();
  }

  public get isDashing(): boolean {
    return this.dashComponent.isDashing;
  }
  public get canDash(): boolean {
    return this.dashComponent.canDash;
  }
  public get isHealing(): boolean {
    return this.healComponent.isHealing;
  }
  public get isCharging(): boolean {
    return this.fireballComponent.isCharging;
  }
  public get chargeTimer(): number {
    return this.fireballComponent.chargeTimer;
  }
  public get attackActive(): boolean {
    return this.meleeComponent.attackActive;
  }
  public get attackDirection(): "side" | "up" | "down" | null {
    return this.meleeComponent.attackDirection;
  }

  private setupSubscribers() {
    this.unsubHurt = eventBroker.subscribe("PLAYER_HURT", () => {
      this.hurtTimer = 0.15;
      if (this.healComponent.isHealing) {
        this.healComponent.cancelHealing();
      }
      if (this.fireballComponent.isCharging) {
        this.fireballComponent.cancelCharging();
      }
    });

    this.unsubPogo = eventBroker.subscribe("PLAYER_POGOED", () => {
      this.hasDoubleJump = true;
      this.dashComponent.resetDashCharge();
    });

    this.unsubHealCancel = eventBroker.subscribe("HEAL_CANCEL", () => {
      eventBroker.publish("SPAWN_SPARKS", {
        x: this.position.x,
        y: this.position.y,
        angle: 0,
        color: "hsl(280, 80%, 65%)",
        radial: true,
        count: 18,
      });
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 4, duration: 0.15 });
    });

    this.unsubChargeCancel = eventBroker.subscribe("CHARGE_CANCEL", () => {
      eventBroker.publish("SPAWN_SPARKS", {
        x: this.position.x,
        y: this.position.y - 12,
        angle: 0,
        color: "hsl(142, 71%, 58%)",
        radial: true,
        count: 14,
      });
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 2, duration: 0.1 });
    });

    this.unsubHealComplete = eventBroker.subscribe("HEAL_COMPLETE", () => {
      this.healingCharges = Math.max(0, this.healingCharges - 1);
      eventBroker.publish("HEALING_CHARGES_CHANGED", { charges: this.healingCharges });

      const health = this.getComponent(HealthComponent);
      if (health) {
        health.currentHealth = Math.min(health.maxHealth, health.currentHealth + 1);
        eventBroker.publish("PLAYER_HEALED", {
          amount: 1,
          currentHealth: health.currentHealth,
          maxHealth: health.maxHealth,
        });
      }

      eventBroker.publish("SPAWN_BLAST", {
        x: this.position.x,
        y: this.position.y,
        color: "hsl(280, 100%, 75%)",
      });

      eventBroker.publish("SPAWN_BLAST", {
        x: this.position.x,
        y: this.position.y,
        color: "hsl(142, 71%, 58%)",
      });

      eventBroker.publish("SPAWN_SPARKS", {
        x: this.position.x,
        y: this.position.y,
        angle: 0,
        color: "hsl(285, 100%, 80%)",
        radial: true,
        count: 32,
        shape: "line",
        turbulence: 30
      });

      eventBroker.publish("SPAWN_SPARKS", {
        x: this.position.x,
        y: this.position.y,
        angle: 0,
        color: "hsl(142, 100%, 80%)",
        radial: true,
        count: 20,
        shape: "spark",
      });

      setVec(this.visualScale, 0.90, 1.10);
      setVec(this.scaleVelocity, 6.0, -12.0);
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 10, duration: 0.35 });
    });

    this.unsubChargeMaxed = eventBroker.subscribe("CHARGE_MAXED", () => {
      setVec(this.visualScale, 1.10, 0.90);
      setVec(this.scaleVelocity, -10.0, 10.0);
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 4, duration: 0.12 });
    });

    this.unsubDamageDealt = eventBroker.subscribe("DETERMINATION_CHANGED", () => {
      if (this.healingCharges >= this.maxHealingCharges) return;

      this.determinationCounter++;
      if (this.determinationCounter >= 5) {
        this.determinationCounter = 0;
        this.healingCharges = Math.min(this.maxHealingCharges, this.healingCharges + 1);
        eventBroker.publish("HEALING_CHARGES_CHANGED", { charges: this.healingCharges });
      }
    });

    this.unsubProjectileFired = eventBroker.subscribe("PLAYER_PROJECTILE_FIRED", ({ level, dirX, dirY }) => {
      const isLvl2 = level === 2;
      const recoilForce = isLvl2 ? 320 : 130;
      const baseLift = isLvl2 ? 150 : 70;
      const tiltForce = isLvl2 ? 14.0 : 6.0;

      this.physics.isGrounded = false;
      this.recoilTimer = isLvl2 ? 0.35 : 0.22;

      this.velocity.x -= dirX * recoilForce;
      this.velocity.y -= (baseLift + dirY * recoilForce);

      this.applyAngularImpulse(-dirX * tiltForce);

      const sqX = isLvl2 ? 0.90 : 0.96;
      const sqY = isLvl2 ? 1.10 : 1.04;
      setVec(this.visualScale, sqX, sqY);
      setVec(this.scaleVelocity, (isLvl2 ? 16 : 8), (isLvl2 ? -16 : -8));

      const muzzleX = this.position.x + dirX * 30;
      const muzzleY = this.position.y + dirY * 30;

      eventBroker.publish("SPAWN_BLAST", {
        x: muzzleX,
        y: muzzleY,
        color: isLvl2 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)"
      });

      eventBroker.publish("SPAWN_SPARKS", {
        x: muzzleX,
        y: muzzleY,
        angle: Math.atan2(dirY, dirX),
        color: isLvl2 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)",
        radial: false,
        count: isLvl2 ? 16 : 8,
        shape: "line"
      });
    });
  }

  public update(dt: number) {
    if (this.isDead) {
      super.update(dt);
      return;
    }

    const moveAxis = this.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
    const currentOnWall = this.physics.isOnWallLeft || this.physics.isOnWallRight;
    const isPressedAgainstWall = currentOnWall && moveAxis !== 0 && Math.sign(moveAxis) === -this.lastWallNormal;
    const isSliding =
      !this.physics.isGrounded && this.velocity.y > 0 && this.wallCoyoteTimer > 0 && isPressedAgainstWall;

    this.inputHandler.updateWallVisuals(isPressedAgainstWall, isSliding);
    this.inputHandler.updateAirTime(dt);
    this.combatHandler.updateGravity(isSliding);
    this.combatHandler.handleHurtTimer(dt);

    if (this.recoilTimer > 0) {
      this.recoilTimer -= dt;
    }

    if (this.doubleJumpDiskTimer > 0) {
      this.doubleJumpDiskTimer -= dt;
    }

    if (!this.isCharging) {
      this.visuals.updateRotation();
    }

    if (this.hurtTimer > 0) {
      super.update(dt);
      return;
    }

    super.update(dt);

    this.inputHandler.handleWallCling(currentOnWall);
    this.wasOnWall = currentOnWall;

    if (this.healComponent.isHealing) {
      if (!this.inputReceiver.isPressed("MOVE_DOWN") || !this.inputReceiver.isPressed("JUMP")) {
        this.healComponent.cancelHealing();
      }
      return;
    }

    if (this.dashComponent.isDashing) {
      return;
    }

    this.inputHandler.updateCoyoteAndWallTimers(dt);
    this.inputHandler.updateMovement(moveAxis, dt);
    this.inputHandler.handleDash();

    if (this.dashComponent.isDashing) {
      super.update(dt);
      return;
    }

    this.inputHandler.handleJump(dt);
    this.inputHandler.handleJumpRelease();
    this.combatHandler.handleAttack();
    this.combatHandler.checkHazardContact();
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    this.visuals.draw(ctx, alpha);
  }

  public teardown() {
    this.unsubHurt();
    this.unsubPogo();
    this.unsubHealComplete();
    this.unsubHealCancel();
    this.unsubChargeMaxed();
    this.unsubChargeCancel();
    this.unsubDamageDealt();
    if (this.unsubProjectileFired) {
      this.unsubProjectileFired();
    }
    super.teardown();
  }
}
