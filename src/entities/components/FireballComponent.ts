import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { eventBroker } from "@/core/eventBroker";
import { UNITS } from "@/core/Units";

export class FireballComponent implements IEntityComponent {
  public owner!: BaseEntity;

  public isCharging: boolean = false;
  private hasPoppedLvl2: boolean = false;
  private hasPublishedChargeStart: boolean = false;
  public chargeTimer: number = 0;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public update(dt: number): void {
    if (this.isCharging) {
      this.chargeTimer += dt;

      // Introduce a 120ms dead-zone before the charge hum/ratchet begins
      if (this.chargeTimer >= 0.12 && !this.hasPublishedChargeStart) {
        this.hasPublishedChargeStart = true;
        eventBroker.publish("CHARGE_START", undefined);
      }

      if (this.hasPublishedChargeStart) {
        eventBroker.publish("CHARGE_UPDATE", { timer: this.chargeTimer });
      }

      if (this.chargeTimer >= UNITS.CHARGE_LVL2_TIME && !this.hasPoppedLvl2) {
        this.hasPoppedLvl2 = true;
        eventBroker.publish("CHARGE_MAXED", undefined);
      }
    }
  }

  public startCharging(): void {
    this.isCharging = true;
    this.chargeTimer = 0;
    this.hasPoppedLvl2 = false;
    this.hasPublishedChargeStart = false;
  }

  public cancelCharging(): void {
    if (this.isCharging) {
      this.isCharging = false;
      this.chargeTimer = 0;
      this.hasPoppedLvl2 = false;
      if (this.hasPublishedChargeStart) {
        eventBroker.publish("CHARGE_STOP", undefined);
        eventBroker.publish("CHARGE_CANCEL", undefined);
      }
      this.hasPublishedChargeStart = false;
    }
  }

  public releaseCharge(dirX: number, dirY: number, facingDirection: number): void {
    if (!this.isCharging) return;
    this.isCharging = false;
    this.hasPoppedLvl2 = false;

    if (this.hasPublishedChargeStart) {
      eventBroker.publish("CHARGE_STOP", undefined);
    }
    this.hasPublishedChargeStart = false;

    if (this.chargeTimer >= UNITS.CHARGE_LVL1_TIME) {
      this.fire(dirX, dirY, facingDirection);
    } else {
      if (this.chargeTimer >= 0.12) {
        eventBroker.publish("CHARGE_CANCEL", undefined);
      }
    }
  }

  private fire(dirX: number, dirY: number, facingDirection: number): void {
    let finalDirX = dirX;
    const finalDirY = dirY;

    if (finalDirX === 0 && finalDirY === 0) {
      finalDirX = facingDirection;
    }

    const mag = Math.sqrt(finalDirX * finalDirX + finalDirY * finalDirY);
    const normalizedDir = { x: finalDirX / mag, y: finalDirY / mag };

    const isLvl2 = this.chargeTimer >= UNITS.CHARGE_LVL2_TIME;
    const damage = isLvl2 ? UNITS.PLAYER_FIREBALL_DAMAGE_LVL2 : UNITS.PLAYER_FIREBALL_DAMAGE_LVL1;
    const speed = isLvl2 ? 900 : 800;
    const lifespan = isLvl2 ? 3.0 : 2.0;

    const spawnX = this.owner.position.x + normalizedDir.x * 30;
    const spawnY = this.owner.position.y + normalizedDir.y * 30;

    eventBroker.publish("PLAYER_PROJECTILE_FIRED", { level: isLvl2 ? 2 : 1, dirX: normalizedDir.x, dirY: normalizedDir.y });

    const proj = this.owner.world.spawnProjectile(
      spawnX,
      spawnY,
      normalizedDir.x,
      normalizedDir.y,
      "player",
      damage,
      speed,
      lifespan
    );

    if (isLvl2) {
      proj.size = { width: 48, height: 48 };
    } else {
      proj.size = { width: 22, height: 22 };
    }
  }
}
