import { Component } from "@/entities/Component";
import { BaseEntity } from "@/entities/BaseEntity";
import { soundSynth } from "@/core/SoundSynth";

export class HealthComponent implements Component {
  public owner!: BaseEntity;
  public maxHealth: number = 5;
  public currentHealth: number = 5;
  
  public invincibilityDuration: number = 0.15;
  private invincibilityTimer: number = 0;
  
  public hitFlashTimer: number = 0;
  public hitFlashDuration: number = 0.12;

  public setup(owner: BaseEntity, dependencies?: Record<string, any>): void {
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

  public takeDamage(amount: number): boolean {
    if (this.invincibilityTimer > 0 || this.owner.isDead) {
      return false;
    }

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.invincibilityTimer = this.invincibilityDuration;
    this.hitFlashTimer = this.hitFlashDuration;

    // Trigger procedural sounds depending on who took damage
    if (this.owner.id === "player-01") {
      soundSynth.playHurt();
    } else {
      soundSynth.playHitConfirm();
    }

    if (this.currentHealth <= 0) {
      this.owner.isDead = true;
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
