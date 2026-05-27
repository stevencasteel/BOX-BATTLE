import { HealthComponent } from "@/entities/components/HealthComponent";
import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { UNITS } from "@/core/Units";
import type { IEventBus } from "@/core/Interfaces";

export class StateProjectionSystem {
  private cachedPlayerHP: number = -1;
  private cachedBossHP: number = -1;
  private cachedHealingCharges: number = -1;
  private cachedDetermination: number = -1;
  private crisisTimer: number = 0;
  private events: IEventBus;

  constructor(events: IEventBus) {
    this.events = events;
  }

  public getCrisisTimer(): number {
    return this.crisisTimer;
  }

  public resetCrisisTimer(): void {
    this.crisisTimer = 0;
  }

  public tickCrisisTimer(dt: number): void {
    if (this.crisisTimer > 0) {
      this.crisisTimer -= dt;
    }
  }

  public setCrisisTimer(value: number): void {
    this.crisisTimer = value;
  }

  public project(player: Player, boss: Boss): void {
    const pHealth = player.getComponent(HealthComponent);
    const bHealth = boss.getComponent(HealthComponent);

    const nextPlayerHP = pHealth ? pHealth.currentHealth : UNITS.PLAYER_MAX_HP;
    const nextBossHP = bHealth ? bHealth.currentHealth : UNITS.BOSS_MAX_HP;
    const nextHealingCharges = player.healingCharges;
    const nextDetermination = player.determinationCounter;

    if (
      nextPlayerHP !== this.cachedPlayerHP ||
      nextBossHP !== this.cachedBossHP ||
      nextHealingCharges !== this.cachedHealingCharges ||
      nextDetermination !== this.cachedDetermination
    ) {
      if (nextPlayerHP === 1 && this.cachedPlayerHP > 1) {
        this.crisisTimer = 0.45;
      }

      this.cachedPlayerHP = nextPlayerHP;
      this.cachedBossHP = nextBossHP;
      this.cachedHealingCharges = nextHealingCharges;
      this.cachedDetermination = nextDetermination;

      this.events.publish("STATE_PROJECTED", {
        playerHP: nextPlayerHP,
        bossHP: nextBossHP,
        healingCharges: nextHealingCharges,
        determination: nextDetermination,
      });
    }
  }

  public reset(): void {
    this.cachedPlayerHP = -1;
    this.cachedBossHP = -1;
    this.cachedHealingCharges = -1;
    this.cachedDetermination = -1;
    this.crisisTimer = 0;
  }
}
