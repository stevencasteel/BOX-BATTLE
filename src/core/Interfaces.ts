import { IEntityComponent } from "@/entities/EntityComponent";

export enum EntityStatus {
  SPAWNING = "SPAWNING",
  ACTIVE = "ACTIVE",
  DYING = "DYING",
  DEAD = "DEAD",
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape: "spark" | "dust" | "ring" | "line";
  drag?: number;
  startColor?: string;
  endColor?: string;
}

export interface IAbilityUser {
  hasDoubleJump?: boolean;
  healingCharges?: number;
  facingDirection?: number;
}

export interface IEntity {
  id: string;
  position: Vector2D;
  previousPosition: Vector2D;
  velocity: Vector2D;
  size: { width: number; height: number };
  isDead: boolean;
  status: EntityStatus;
  world: IWorld;
  visualScale?: Vector2D;
  targetVisualScale?: Vector2D;
  scaleVelocity?: Vector2D;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D, alpha?: number): void;
  teardown(): void;
  addComponent<T extends IEntityComponent>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    componentClass: new (...args: any[]) => T,
    component: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dependencies?: Record<string, any>
  ): T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getComponent<T extends IEntityComponent>(componentClass: new (...args: any[]) => T): T | null;
  startDeathSequence?(): void;
  registerDamageDealt?(): void;
}

export interface IProjectile extends IEntity {
  isActive: boolean;
  ownerId: "player" | "boss";
  damage: number;
}

export interface IDamageable {
  takeDamage(amount: number): boolean;
  isInvincible(): boolean;
  isFlashing(): boolean;
  currentHealth: number;
  maxHealth: number;
}

export interface IPhysicsBody {
  isGrounded: boolean;
  isOnWallLeft: boolean;
  isOnWallRight: boolean;
  gravity: number;
}

export interface IPhysicsWorld {
  solids: Rectangle[];
  hazards: Rectangle[];
  onewayPlatforms: Rectangle[];
  isOverlapping(x: number, y: number, width: number, height: number, rects: Rectangle[]): boolean;
  getOverlapCandidates(
    x: number,
    y: number,
    width: number,
    height: number,
    type: "solid" | "platform" | "hazard"
  ): Rectangle[];
}

export interface IWorld {
  player: IEntity | null;
  boss: IEntity | null;
  minions: IEntity[];
  physicsWorld: IPhysicsWorld;
  getProjectiles(): readonly IProjectile[];
  releaseProjectile(proj: IProjectile): void;
  spawnProjectile(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    ownerId: "player" | "boss",
    damage: number,
    speed: number,
    lifespan: number,
    customColor?: string
  ): IProjectile;
}

export interface IDamageRecorder {
  registerDamageDealt(): void;
}
