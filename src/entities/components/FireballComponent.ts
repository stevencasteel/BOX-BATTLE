import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { eventBroker } from "@/core/eventBroker";
import { TrigLUT } from "@/core/TrigLUT";
import { UNITS } from "@/core/Units";

const chargeUpdatePayload = { timer: 0 };

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

      if (this.chargeTimer >= 0.12 && !this.hasPublishedChargeStart) {
        this.hasPublishedChargeStart = true;
        eventBroker.publish("CHARGE_START", undefined);
      }

      if (this.hasPublishedChargeStart) {
        chargeUpdatePayload.timer = this.chargeTimer;
        eventBroker.publish("CHARGE_UPDATE", chargeUpdatePayload);
      }

      if (this.chargeTimer >= UNITS.CHARGE_LVL2_TIME && !this.hasPoppedLvl2) {
        this.hasPoppedLvl2 = true;
        eventBroker.publish("CHARGE_MAXED", undefined);
      }

      const progress = Math.max(0, Math.min(1.0, this.chargeTimer / UNITS.CHARGE_LVL2_TIME));
      const isLvl2 = this.chargeTimer >= UNITS.CHARGE_LVL2_TIME;
      const nowTime = performance.now();

      const pulse = TrigLUT.sin(nowTime * 0.045) * 0.03 * progress;
      const shiverX = (TrigLUT.random() * 0.012 - 0.006) * progress;
      const shiverY = (TrigLUT.random() * 0.012 - 0.006) * progress;

      this.owner.targetVisualScale.x = 1.0 - pulse + shiverX;
      this.owner.targetVisualScale.y = 1.0 + pulse + shiverY;
      this.owner.rotation = TrigLUT.sin(nowTime * 0.09) * 0.02 * progress;

      if (TrigLUT.random() < 0.3 + progress * 0.5) {
        const angle = TrigLUT.random() * Math.PI * 2;
        const radius = 80 - progress * 50;
        const startX = this.owner.position.x + TrigLUT.cos(angle) * radius;
        const startY = this.owner.position.y - 12 + TrigLUT.sin(angle) * radius;

        const targetX = this.owner.position.x;
        const targetY = this.owner.position.y - 12;
        const vx = (targetX - startX) * 3.5;
        const vy = (targetY - startY) * 3.5;

        eventBroker.publishSpark(startX, startY, TrigLUT.atan2(vy, vx), isLvl2 ? "hsl(45, 100%, 65%)" : "hsl(142, 71%, 58%)", false, 1, "line", 20);
      }

      if (isLvl2 && TrigLUT.random() < 0.12) {
        const angle = TrigLUT.random() * Math.PI * 2;
        const radius = 60;
        const startX = this.owner.position.x + TrigLUT.cos(angle) * radius;
        const startY = this.owner.position.y - 12 + TrigLUT.sin(angle) * radius;

        eventBroker.publishSpark(startX, startY, angle + Math.PI, "hsl(190, 100%, 85%)", false, 3, "line", 45);
        eventBroker.publish("CAMERA_SHAKE", { amplitude: 2.5, duration: 0.08 });
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

    const mag = TrigLUT.fastSqrt(finalDirX * finalDirX + finalDirY * finalDirY);
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
