import { Component } from "@/entities/Component";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IEntity {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: { width: number; height: number };
  isDead: boolean;
  world: IWorld;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  teardown(): void;
  addComponent<T extends Component>(
    componentClass: new (...args: any[]) => T,
    component: T,
    dependencies?: Record<string, any>
  ): T;
  getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | null;
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
}

export interface IWorld {
  player: IEntity | null;
  boss: IEntity | null;
  minions: IEntity[];
  physicsWorld: IPhysicsWorld;
  getProjectiles(): any[];
  releaseProjectile(proj: any): void;
}
