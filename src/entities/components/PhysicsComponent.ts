import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { Rectangle } from "@/core/Interfaces";

export interface PhysicsComponentOptions {
  gravity?: number;
}

export class PhysicsComponent implements IEntityComponent {
  public owner!: BaseEntity;
  public gravity: number = 1200;
  public isGrounded: boolean = false;
  public isOnWallLeft: boolean = false;
  public isOnWallRight: boolean = false;

  public disablePlatformCollisionTimer: number = 0;

  public setup(owner: BaseEntity, dependencies?: PhysicsComponentOptions): void {
    this.owner = owner;
    if (dependencies) {
      if (dependencies.gravity !== undefined) {
        this.gravity = dependencies.gravity;
      }
    }
  }

  public update(dt: number): void {
    if (this.disablePlatformCollisionTimer > 0) {
      this.disablePlatformCollisionTimer -= dt;
    }

    this.isGrounded = false;
    const physicsWorld = this.owner.world.physicsWorld;
    
    if (!this.isGrounded) {
      this.owner.velocity.y += this.gravity * dt;
    }

    this.isOnWallLeft = false;
    this.isOnWallRight = false;

    const maxStepSize = 6;
    const dx = this.owner.velocity.x * dt;
    const dy = this.owner.velocity.y * dt;

    const stepsX = Math.max(1, Math.ceil(Math.abs(dx) / maxStepSize));
    const stepsY = Math.max(1, Math.ceil(Math.abs(dy) / maxStepSize));

    const substepX = dx / stepsX;
    const substepY = dy / stepsY;

    for (let i = 0; i < stepsX; i++) {
      this.owner.position.x += substepX;
      if (this.resolveCollisionsX()) {
        break;
      }
    }

    for (let i = 0; i < stepsY; i++) {
      this.owner.position.y += substepY;
      if (this.resolveCollisionsY()) {
        break;
      }
    }

    this.isGrounded = false;
    if (this.owner.velocity.y >= 0) {
      const solidCandidates = physicsWorld.getOverlapCandidates(
        this.owner.position.x,
        this.owner.position.y + 1,
        this.owner.size.width + 12,
        this.owner.size.height + 12,
        "solid"
      );
      for (const solid of solidCandidates) {
        if (this.isOverlapping(this.owner.position.x, this.owner.position.y + 1, solid)) {
          this.isGrounded = true;
          break;
        }
      }
      if (!this.isGrounded && this.disablePlatformCollisionTimer <= 0) {
        const platformCandidates = physicsWorld.getOverlapCandidates(
          this.owner.position.x,
          this.owner.position.y + 1,
          this.owner.size.width + 12,
          this.owner.size.height + 12,
          "platform"
        );
        for (const platform of platformCandidates) {
          if (this.isOverlapping(this.owner.position.x, this.owner.position.y + 1, platform)) {
            this.isGrounded = true;
            break;
          }
        }
      }
    }
  }

  private resolveCollisionsX(): boolean {
    const ownerHalfW = this.owner.size.width / 2;
    const physicsWorld = this.owner.world.physicsWorld;
    let collided = false;

    const solidCandidates = physicsWorld.getOverlapCandidates(
      this.owner.position.x,
      this.owner.position.y,
      this.owner.size.width + 12,
      this.owner.size.height + 12,
      "solid"
    );

    for (const solid of solidCandidates) {
      if (this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
        if (this.owner.velocity.x > 0) {
          this.owner.position.x = solid.x - ownerHalfW;
          this.isOnWallRight = true;
        } else if (this.owner.velocity.x < 0) {
          this.owner.position.x = solid.x + solid.width + ownerHalfW;
          this.isOnWallLeft = true;
        }
        this.owner.velocity.x = 0;
        collided = true;
      }
    }
    return collided;
  }

  private resolveCollisionsY(): boolean {
    const ownerHalfH = this.owner.size.height / 2;
    const ownerHalfW = this.owner.size.width / 2;
    const physicsWorld = this.owner.world.physicsWorld;
    let collided = false;

    const solidCandidates = physicsWorld.getOverlapCandidates(
      this.owner.position.x,
      this.owner.position.y,
      this.owner.size.width + 24,
      this.owner.size.height + 24,
      "solid"
    );

    for (const solid of solidCandidates) {
      if (this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
        if (this.owner.velocity.y >= 0) {
          this.owner.position.y = solid.y - ownerHalfH;
          this.owner.velocity.y = 0;
          this.isGrounded = true;
          collided = true;
        } else if (this.owner.velocity.y < 0) {
          const overlapRight = (this.owner.position.x + ownerHalfW) - solid.x;
          const overlapLeft = (solid.x + solid.width) - (this.owner.position.x - ownerHalfW);

          const nudgeThreshold = 6;

          if (overlapRight > 0 && overlapRight <= nudgeThreshold) {
            this.owner.position.x -= overlapRight;
            if (!this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
              continue;
            }
            this.owner.position.x += overlapRight;
          } 
          else if (overlapLeft > 0 && overlapLeft <= nudgeThreshold) {
            this.owner.position.x += overlapLeft;
            if (!this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
              continue;
            }
            this.owner.position.x -= overlapLeft;
          }

          this.owner.position.y = solid.y + solid.height + ownerHalfH;
          this.owner.velocity.y = 0;
          collided = true;
        }
      }
    }

    if (this.disablePlatformCollisionTimer <= 0 && this.owner.velocity.y >= 0) {
      const prevY = this.owner.position.y - this.owner.velocity.y * 0.016;

      const platformCandidates = physicsWorld.getOverlapCandidates(
        this.owner.position.x,
        this.owner.position.y,
        this.owner.size.width + 12,
        this.owner.size.height + 12,
        "platform"
      );

      for (const platform of platformCandidates) {
        if (this.isOverlapping(this.owner.position.x, this.owner.position.y, platform)) {
          if (prevY + ownerHalfH - 4 <= platform.y) {
            this.owner.position.y = platform.y - ownerHalfH;
            this.owner.velocity.y = 0;
            this.isGrounded = true;
            collided = true;
          }
        }
      }
    }

    return collided;
  }

  private isOverlapping(x: number, y: number, rect: Rectangle): boolean {
    const halfW = this.owner.size.width / 2;
    const halfH = this.owner.size.height / 2;

    const left = x - halfW;
    const right = x + halfW;
    const top = y - halfH;
    const bottom = y + halfH;

    return (
      right > rect.x &&
      left < rect.x + rect.width &&
      bottom > rect.y &&
      top < rect.y + rect.height
    );
  }

  public teardown(): void {
    // Standard cleanup
  }
}
