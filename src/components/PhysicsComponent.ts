import { Component } from "@/entities/Component";
import { BaseEntity } from "@/entities/BaseEntity";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class PhysicsComponent implements Component {
  public owner!: BaseEntity;
  public gravity: number = 1200;
  public isGrounded: boolean = false;
  public isOnWallLeft: boolean = false;
  public isOnWallRight: boolean = false;

  public disablePlatformCollisionTimer: number = 0; // Timer to temporarily bypass one-way platforms

  public static solids: Rectangle[] = [];
  public static hazards: Rectangle[] = [];
  public static onewayPlatforms: Rectangle[] = [];

  public static setSolids(solids: Rectangle[]) {
    PhysicsComponent.solids = solids;
  }

  public static setHazards(hazards: Rectangle[]) {
    PhysicsComponent.hazards = hazards;
  }

  public static setOnewayPlatforms(platforms: Rectangle[]) {
    PhysicsComponent.onewayPlatforms = platforms;
  }

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

    for (const solid of PhysicsComponent.solids) {
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

    // 1. Resolve Solid Blocks (Impassable from all sides)
    for (const solid of PhysicsComponent.solids) {
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

    // 2. Resolve One-Way Drop-Through Platforms (Only block downward movements if standing and timer is not active)
    if (this.disablePlatformCollisionTimer <= 0 && this.owner.velocity.y >= 0) {
      const prevY = this.owner.position.y - this.owner.velocity.y * 0.016; // approximate previous position

      for (const platform of PhysicsComponent.onewayPlatforms) {
        if (this.isOverlapping(this.owner.position.x, this.owner.position.y, platform)) {
          // Only collide if feet were above the platform's top edge in the previous frame
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