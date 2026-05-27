import { IEntityComponent } from "@/entities/EntityComponent";

export type GameEventMap = {
  PLAYER_HURT: { amount: number; currentHealth: number; maxHealth: number };
  BOSS_HURT: { amount: number; currentHealth: number; maxHealth: number; sourceX: number; sourceY: number; intensity: number };
  MINION_HURT: { id: string; amount: number; currentHealth: number; maxHealth: number; sourceX: number; sourceY: number; intensity: number };
  PLAYER_HEALED: { amount: number; currentHealth: number; maxHealth: number };
  PLAYER_JUMPED: void;
  PLAYER_DASHED: { direction: number };
  PLAYER_POGOED: void;
  PLAYER_ATTACKED: { direction: "side" | "up" | "down" };
  PLAYER_PROJECTILE_FIRED: { level: 1 | 2; dirX: number; dirY: number };
  HEALING_CHARGES_CHANGED: { charges: number };
  DETERMINATION_CHANGED: { determination: number };
  DIALOGUE_TRIGGERED: { speaker: "player" | "boss"; text: string };
  CAMERA_SHAKE: { amplitude: number; duration: number };
  HIT_STOP: { duration: number };
  BOSS_DEFEATED: { x: number; y: number };
  GAME_OVER: void;
  VICTORY: void;
  CLEAR_DIALOGUES: void;
  SPAWN_SPARKS: { x: number; y: number; angle: number; color?: string; radial?: boolean; count?: number; turbulence?: number; shape?: "spark" | "line" };
  SPAWN_DUST: { x: number; y: number; direction?: "horizontal" | "vertical" };
  SPAWN_BLAST: { x: number; y: number; color: string };
  PLAYER_DROPPED: void;
  PLAYER_LANDED: void;
  HEAL_START: void;
  HEAL_CANCEL: void;
  HEAL_UPDATE: { timer: number };
  HEAL_COMPLETE: void;
  PLAYER_SPIKED: { x: number };
  BOSS_PHASE_SHIFT: void;
  MINION_SPAWNING: void;
  MINION_DISSOLVING: void;
  PLAYER_DASH_RECHARGED: void;
  BOSS_SWIPED: void;
  BOSS_TELEGRAPH: void;
  BOSS_LUNGED: void;
  CHARGE_START: void;
  CHARGE_UPDATE: { timer: number };
  CHARGE_STOP: void;
  CHARGE_MAXED: void;
  CHARGE_CANCEL: void;
  REQUEST_RETRY: void;
  REQUEST_MENU: void;
  PLATFORM_IMPACT: { platform: Rectangle; velocityY: number; massMultiplier: number };
};

export type EventCallback<T> = (payload: T) => void;

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

export interface ISpringVisuals {
  visualScale: Vector2D;
  targetVisualScale: Vector2D;
  scaleVelocity: Vector2D;
  rotation: number;
  targetRotation: number;
  rotationVelocity: number;
  squashPivot: "center" | "feet";
}

export interface IRenderable {
  draw(ctx: CanvasRenderingContext2D, alpha?: number): void;
}

export interface IAbilityUser {
  hasDoubleJump?: boolean;
  healingCharges?: number;
  facingDirection?: number;
}

export interface IEntity extends ITransform {
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

export interface IEventPublisher {
  publish(event: string, payload: unknown): void;
  publishSpark(
    x: number,
    y: number,
    angle: number,
    color?: string,
    radial?: boolean,
    count?: number,
    shape?: "spark" | "line",
    turbulence?: number
  ): void;
  publishDust(x: number, y: number, direction?: "horizontal" | "vertical"): void;
  publishBlast(x: number, y: number, color: string): void;
}

export interface IEntityFactory {
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

export interface IWorld extends IEntityFactory {
  player: IEntity | null;
  boss: IEntity | null;
  minions: IEntity[];
  physicsWorld: IPhysicsWorld;
  events: IEventBus;
  audio: IAudioManager;
  input: IInputProvider;
}

export interface IDamageRecorder {
  registerDamageDealt(): void;
}

export interface IEventBus {
  subscribe<K extends string>(event: K, callback: (payload: K extends keyof GameEventMap ? GameEventMap[K] : unknown) => void): () => void;
  publish<K extends string>(event: K, payload: K extends keyof GameEventMap ? GameEventMap[K] : unknown): void;
  publishSpark(x: number, y: number, angle: number, color?: string, radial?: boolean, count?: number, shape?: "spark" | "line", turbulence?: number): void;
  publishDust(x: number, y: number, direction?: "horizontal" | "vertical"): void;
  publishBlast(x: number, y: number, color: string): void;
}

export interface IAudioManager {
  registerCoordinateProviders(getPlayerX: () => number, getBossX: () => number, getMinionX: (id: string) => number): void;
  stopHealDrone(): void;
  stopChargeDrone(): void;
  playHitConfirm(): void;
  playErrorTick(): void;
  playPlayerExplosion(): void;
  playBossExplosion(): void;
  playDashRecharge(): void;
  playBossTelegraph(): void;
  playBossLunge(): void;
  playBossSwipe(): void;
  playMenuConfirm(): void;
  playMenuBack(): void;
  playSelectTick(): void;
}

export type Action = "MOVE_LEFT" | "MOVE_RIGHT" | "MOVE_UP" | "MOVE_DOWN" | "JUMP" | "ATTACK" | "DASH";

export interface IInputProvider {
  update(): void;
  postUpdate(): void;
  isPauseJustPressed(): boolean;
  triggerHapticFeedback(strength: "light" | "medium" | "heavy"): void;
  isPressed(action: Action): boolean;
  isJustPressed(action: Action): boolean;
  cleanup(): void;
}
