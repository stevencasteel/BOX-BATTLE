import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { Rectangle } from "@/core/Interfaces";
import { UNITS } from "@/core/Units";
import { eventBroker } from "@/core/eventBroker";

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

  private readonly maxStepSize: number = UNITS.CCD_STEP_LIMIT_DEFAULT;
  private readonly cornerNudgeThreshold: number = UNITS.CORNER_NUDGE_MAX_OVERLAP;
  private readonly groundDetectionOffset: number = UNITS.GROUND_DETECTION_OFFSET;
  private readonly frameDurationEstimate: number = UNITS.CANONICAL_DELTA_TIME;

  public setup(owner: BaseEntity, dependencies?: PhysicsComponentOptions): void {
    this.owner = owner;
    if (dependencies) {
      if (dependencies.gravity !== undefined) {
        this.gravity = dependencies.gravity;
      }
    }
  }

  public update(dt: number): void {
    this.decayDisablePlatformTimer(dt);
    this.applyGravity(dt);
    this.executeSplitAxisMovement(dt);
    this.evaluateGroundedStatus();
  }

  private decayDisablePlatformTimer(dt: number): void {
    if (this.disablePlatformCollisionTimer > 0) {
      this.disablePlatformCollisionTimer -= dt;
    }
  }

  private applyGravity(dt: number): void {
    if (!this.isGrounded) {
      this.owner.velocity.y += this.gravity * dt;
    }
  }

  private executeSplitAxisMovement(dt: number): void {
    this.isOnWallLeft = false;
    this.isOnWallRight = false;

    const deltaX = this.owner.velocity.x * dt;
    const deltaY = this.owner.velocity.y * dt;

    const stepsX = Math.max(1, Math.ceil(Math.abs(deltaX) / this.maxStepSize));
    const stepsY = Math.max(1, Math.ceil(Math.abs(deltaY) / this.maxStepSize));

    const substepX = deltaX / stepsX;
    const substepY = deltaY / stepsY;

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
  }

  private resolveCollisionsX(): boolean {
    const ownerHalfWidth = this.owner.size.width / 2;
    const physicsWorld = this.owner.world.physicsWorld;
    let hasCollided = false;

    const solidCandidates = physicsWorld.getOverlapCandidates(
      this.owner.position.x,
      this.owner.position.y,
      this.owner.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
      this.owner.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
      "solid"
    );

    for (const solid of solidCandidates) {
      if (this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
        if (this.owner.velocity.x > 0) {
          this.owner.position.x = solid.x - ownerHalfWidth;
          this.isOnWallRight = true;
        } else if (this.owner.velocity.x < 0) {
          this.owner.position.x = solid.x + solid.width + ownerHalfWidth;
          this.isOnWallLeft = true;
        }
        this.owner.velocity.x = 0;
        hasCollided = true;
      }
    }
    return hasCollided;
  }

  private resolveCollisionsY(): boolean {
    const ownerHalfHeight = this.owner.size.height / 2;
    const ownerHalfWidth = this.owner.size.width / 2;
    const physicsWorld = this.owner.world.physicsWorld;
    let hasCollided = false;

    const solidCandidates = physicsWorld.getOverlapCandidates(
      this.owner.position.x,
      this.owner.position.y,
      this.owner.size.width + UNITS.BROAD_PHASE_PADDING_LARGE,
      this.owner.size.height + UNITS.BROAD_PHASE_PADDING_LARGE,
      "solid"
    );

    for (const solid of solidCandidates) {
      if (this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
        if (this.owner.velocity.y >= 0) {
          this.owner.position.y = solid.y - ownerHalfHeight;
          this.owner.velocity.y = 0;
          this.isGrounded = true;
          hasCollided = true;
        } else if (this.owner.velocity.y < 0) {
          const overlapRight = this.owner.position.x + ownerHalfWidth - solid.x;
          const overlapLeft = solid.x + solid.width - (this.owner.position.x - ownerHalfWidth);

          if (overlapRight > 0 && overlapRight <= this.cornerNudgeThreshold) {
            this.owner.position.x -= overlapRight;
            if (!this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
              continue;
            }
            this.owner.position.x += overlapRight;
          } else if (overlapLeft > 0 && overlapLeft <= this.cornerNudgeThreshold) {
            this.owner.position.x += overlapLeft;
            if (!this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
              continue;
            }
            this.owner.position.x -= overlapLeft;
          }

          this.owner.position.y = solid.y + solid.height + ownerHalfHeight;
          this.owner.velocity.y = 0;
          hasCollided = true;
        }
      }
    }

    if (this.disablePlatformCollisionTimer <= 0 && this.owner.velocity.y >= 0) {
      const previousY = this.owner.position.y - this.owner.velocity.y * this.frameDurationEstimate;

      const platformCandidates = physicsWorld.getOverlapCandidates(
        this.owner.position.x,
        this.owner.position.y,
        this.owner.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
        this.owner.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
        "platform"
      );

      for (const platform of platformCandidates) {
        if (this.isOverlapping(this.owner.position.x, this.owner.position.y, platform)) {
          if (previousY + ownerHalfHeight - 4 <= platform.y) {
            const landingVelY = this.owner.velocity.y;
            const massMultiplier = this.owner.id === "boss-01" ? 2.5 : 1.0;
            this.owner.position.y = platform.y - ownerHalfHeight;
            this.owner.velocity.y = 0;
            this.isGrounded = true;
            hasCollided = true;

            eventBroker.publish("PLATFORM_IMPACT", { platform, velocityY: landingVelY, massMultiplier });
          }
        }
      }
    }

    return hasCollided;
  }

  private evaluateGroundedStatus(): void {
    this.isGrounded = false;
    const physicsWorld = this.owner.world.physicsWorld;
    const testPosY = this.owner.position.y + this.groundDetectionOffset;

    if (this.owner.velocity.y >= 0) {
      const solidCandidates = physicsWorld.getOverlapCandidates(
        this.owner.position.x,
        testPosY,
        this.owner.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
        this.owner.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
        "solid"
      );
      for (const solid of solidCandidates) {
        if (this.isOverlapping(this.owner.position.x, testPosY, solid)) {
          this.isGrounded = true;
          break;
        }
      }

      if (!this.isGrounded && this.disablePlatformCollisionTimer <= 0) {
        const platformCandidates = physicsWorld.getOverlapCandidates(
          this.owner.position.x,
          testPosY,
          this.owner.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
          this.owner.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
          "platform"
        );
        for (const platform of platformCandidates) {
          if (this.isOverlapping(this.owner.position.x, testPosY, platform)) {
            this.isGrounded = true;
            break;
          }
        }
      }
    }
  }

  private isOverlapping(x: number, y: number, rect: Rectangle): boolean {
    const halfWidth = this.owner.size.width / 2;
    const halfHeight = this.owner.size.height / 2;

    const left = x - halfWidth;
    const right = x + halfWidth;
    const top = y - halfHeight;
    const bottom = y + halfHeight;

    return right > rect.x && left < rect.x + rect.width && bottom > rect.y && top < rect.y + rect.height;
  }

  public teardown(): void {
    // Reserved for cleanup
  }
}
