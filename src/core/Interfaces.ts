import { Component } from "@/entities/Component";

export interface IEntity {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: { width: number; height: number };
  isDead: boolean;
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
