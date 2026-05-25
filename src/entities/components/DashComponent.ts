import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { eventBroker } from "@/core/eventBroker";
import { UNITS } from "@/core/Units";

export interface GhostFrame {
  x: number;
  y: number;
  opacity: number;
}

export class DashComponent implements IEntityComponent {
  public owner!: BaseEntity;

  public isDashing: boolean = false;
  public dashTimer: number = 0;
  public dashCooldown: number = 0;
  public canDash: boolean = true;
  public dashDirectionX: number = 1;
  public dashDirectionY: number = 0;
  public ghosts: GhostFrame[] = [];
  public ghostSpawnTimer: number = 0;

  private readonly dashSpeed: number = UNITS.PLAYER_DASH_SPEED;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public update(dt: number): void {
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }

    for (const ghost of this.ghosts) {
      ghost.opacity -= dt * 5.0;
    }
    this.ghosts = this.ghosts.filter((g) => g.opacity > 0);

    if (this.isDashing) {
      this.dashTimer -= dt;
      this.owner.velocity.x = this.dashDirectionX * this.dashSpeed;
      this.owner.velocity.y = this.dashDirectionY * this.dashSpeed;

      this.ghostSpawnTimer -= dt;
      if (this.ghostSpawnTimer <= 0) {
        this.ghosts.push({
          x: this.owner.position.x,
          y: this.owner.position.y,
          opacity: 0.6,
        });
        this.ghostSpawnTimer = 0.025;
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        if (this.dashDirectionX !== 0) this.owner.velocity.x *= 0.5;
        if (this.dashDirectionY !== 0) this.owner.velocity.y = 0;
      }
    }
  }

  public triggerDash(directionX: number, directionY: number): void {
    this.isDashing = true;
    this.dashTimer = UNITS.DASH_DURATION;
    this.dashCooldown = UNITS.DASH_COOLDOWN;
    this.canDash = false;
    this.dashDirectionX = directionX;
    this.dashDirectionY = directionY;
    this.ghostSpawnTimer = 0;
    eventBroker.publish("PLAYER_DASHED", { direction: directionX });
  }

  public resetDashCharge(): void {
    if (!this.canDash) {
      this.canDash = true;
      eventBroker.publish("PLAYER_DASH_RECHARGED", undefined);
    }
  }
}
