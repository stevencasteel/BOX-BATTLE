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

export interface ITransform {
  position: Vector2D;
  previousPosition: Vector2D;
  velocity: Vector2D;
  size: { width: number; height: number };
}

export interface IRenderable {
  draw(ctx: CanvasRenderingContext2D, alpha?: number): void;
  visualScale: Vector2D;
  targetVisualScale: Vector2D;
  scaleVelocity: Vector2D;
  rotation: number;
  targetRotation: number;
  rotationVelocity: number;
  squashPivot: "center" | "feet";
}

export interface IAbilityUser {
  hasDoubleJump?: boolean;
  healingCharges?: number;
  facingDirection?: number;
}

export interface IEntity extends ITransform, IRenderable {
  id: string;
  isDead: boolean;
  status: EntityStatus;
  world: IWorld;
  update(dt: number): void;
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
  events: IEventBus;
  audio: IAudioManager;
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

export interface IEventBus {
  subscribe(event: string, callback: (payload: any) => void): () => void;
  publish(event: string, payload: unknown): void;
  publishSpark(x: number, y: number, angle: number, color?: string, radial?: boolean, count?: number, shape?: "spark" | "line", turbulence?: number): void;
  publishDust(x: number, y: number, direction?: "horizontal" | "vertical"): void;
  publishBlast(x: number, y: number, color: string): void;
}

export interface IAudioManager {
  // Reserved for future audio injection into entity layer
}
