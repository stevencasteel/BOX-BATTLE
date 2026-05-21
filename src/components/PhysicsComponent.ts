import { Component } from "@/entities/Component";
import { BaseEntity } from "@/entities/BaseEntity";
import { Rectangle } from "@/core/Interfaces";

export class PhysicsComponent implements Component {
  public owner!: BaseEntity;
  public gravity: number = 1200;
  public isGrounded: boolean = false;
  public isOnWallLeft: boolean = false;
  public isOnWallRight: boolean = false;

  public disablePlatformCollisionTimer: number = 0;

  public setup(owner: BaseEntity, dependencies?: Record<string, any>): void {
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

    if (!this.isGrounded) {
      this.owner.velocity.y += this.gravity * dt;
    }

    this.isOnWallLeft = false;
    this.isOnWallRight = false;

    this.owner.position.x += this.owner.velocity.x * dt;
    this.resolveCollisionsX();

    this.isGrounded = false;
    this.owner.position.y += this.owner.velocity.y * dt;
    this.resolveCollisionsY();
  }

  private resolveCollisionsX() {
    const ownerHalfW = this.owner.size.width / 2;
    const physicsWorld = this.owner.world.physicsWorld;

    for (const solid of physicsWorld.solids) {
      if (this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
        if (this.owner.velocity.x > 0) {
          this.owner.position.x = solid.x - ownerHalfW;
          this.isOnWallRight = true;
        } else if (this.owner.velocity.x < 0) {
          this.owner.position.x = solid.x + solid.width + ownerHalfW;
          this.isOnWallLeft = true;
        }
        this.owner.velocity.x = 0;
      }
    }
  }

  private resolveCollisionsY() {
    const ownerHalfH = this.owner.size.height / 2;
    const physicsWorld = this.owner.world.physicsWorld;

    for (const solid of physicsWorld.solids) {
      if (this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
        if (this.owner.velocity.y > 0) {
          this.owner.position.y = solid.y - ownerHalfH;
          this.owner.velocity.y = 0;
          this.isGrounded = true;
        } else if (this.owner.velocity.y < 0) {
          this.owner.position.y = solid.y + solid.height + ownerHalfH;
          this.owner.velocity.y = 0;
        }
      }
    }

    if (this.disablePlatformCollisionTimer <= 0 && this.owner.velocity.y >= 0) {
      const prevY = this.owner.position.y - this.owner.velocity.y * 0.016;

      for (const platform of physicsWorld.onewayPlatforms) {
        if (this.isOverlapping(this.owner.position.x, this.owner.position.y, platform)) {
          if (prevY + ownerHalfH - 4 <= platform.y) {
            this.owner.position.y = platform.y - ownerHalfH;
            this.owner.velocity.y = 0;
            this.isGrounded = true;
          }
        }
      }
    }
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
}
