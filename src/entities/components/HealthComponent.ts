import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { EntityStatus } from "@/core/Interfaces";

export interface HealthComponentOptions {
  maxHealth?: number;
  invincibilityDuration?: number;
}

export class HealthComponent implements IEntityComponent {
  public owner!: BaseEntity;
  public maxHealth: number = 5;
  public currentHealth: number = 5;

  public invincibilityDuration: number = 0.15;
  private invincibilityTimer: number = 0;

  public hitFlashTimer: number = 0;
  public hitFlashDuration: number = 0.12;

  public setup(owner: BaseEntity, dependencies?: HealthComponentOptions): void {
    this.owner = owner;
    if (dependencies) {
      if (dependencies.maxHealth !== undefined) {
        this.maxHealth = dependencies.maxHealth;
        this.currentHealth = dependencies.maxHealth;
      }
      if (dependencies.invincibilityDuration !== undefined) {
        this.invincibilityDuration = dependencies.invincibilityDuration;
      }
    }
  }

  public update(dt: number): void {
    if (this.invincibilityTimer > 0) this.invincibilityTimer -= dt;
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
  }

  public reset(): void {
    this.currentHealth = this.maxHealth;
    this.invincibilityTimer = 0;
    this.hitFlashTimer = 0;
  }

  public takeDamage(amount: number, sourceX: number = 0, sourceY: number = 0, intensity: number = 1): boolean {
    const isDying = this.owner.status === EntityStatus.DYING;
    const isSpawning = this.owner.status === EntityStatus.SPAWNING;
    if (this.invincibilityTimer > 0 || this.owner.isDead || isDying || isSpawning) {
      return false;
    }

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.invincibilityTimer = this.invincibilityDuration;
    this.hitFlashTimer = this.hitFlashDuration;

    if (this.owner.id === "player-01") {
      this.owner.world.events.publish("PLAYER_HURT", {
        amount,
        currentHealth: this.currentHealth,
        maxHealth: this.maxHealth,
      });
    } else if (this.owner.id === "boss-01") {
      this.owner.world.events.publish("BOSS_HURT", {
        amount,
        currentHealth: this.currentHealth,
        maxHealth: this.maxHealth,
        sourceX,
        sourceY,
        intensity,
      });
    } else if (this.owner.id.startsWith("minion-")) {
      this.owner.world.events.publish("MINION_HURT", {
        id: this.owner.id,
        amount,
        currentHealth: this.currentHealth,
        maxHealth: this.maxHealth,
        sourceX,
        sourceY,
        intensity,
      });
    }

    if (this.currentHealth <= 0) {
      if (this.owner.startDeathSequence) {
        this.owner.startDeathSequence();
      } else {
        this.owner.isDead = true;
      }
    }

    return true;
  }

  public isInvincible(): boolean {
    return this.invincibilityTimer > 0;
  }

  public isFlashing(): boolean {
    return this.hitFlashTimer > 0;
  }
}
