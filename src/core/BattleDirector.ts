import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import type { IEventBus, IAudioManager } from "@/core/Interfaces";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { UNITS } from "@/core/Units";
import { CinematicSystem } from "@/core/CinematicSystem";

export class BattleDirector {
  private events: IEventBus;
  private audio: IAudioManager;
  private hasTriggeredFirstHit = false;
  private hasTriggeredPhase2 = false;
  private hasTriggeredPhase3 = false;
  private cinematic: CinematicSystem;
  private onBattleEnd: () => void;

  constructor(events: IEventBus, audio: IAudioManager, onBattleEnd: () => void) {
    this.events = events;
    this.audio = audio;
    this.onBattleEnd = onBattleEnd;
    this.cinematic = new CinematicSystem(events, audio);
  }

  public isCinematicActive(): boolean {
    return this.cinematic.isActive();
  }

  public getDeathVisuals() {
    return {
      timer: this.cinematic.getDeathTimer(),
      pos: this.cinematic.getDeathPos(),
    };
  }

  public update(dt: number, player: Player, boss: Boss) {
    this.cinematic.update(dt);

    if (this.cinematic.isActive()) {
      return;
    }

    const bHealth = boss.getComponent(HealthComponent);
    if (bHealth) {
      const phase2Threshold = Math.floor(UNITS.BOSS_MAX_HP * UNITS.BOSS_PHASE_2_HP_PCT);
      const phase3Threshold = Math.floor(UNITS.BOSS_MAX_HP * UNITS.BOSS_PHASE_3_HP_PCT);

      if (bHealth.currentHealth < UNITS.BOSS_MAX_HP && !this.hasTriggeredFirstHit) {
        this.hasTriggeredFirstHit = true;
        this.events.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "I found you. This battle ends now!" });
      }

      if (bHealth.currentHealth <= phase2Threshold && !this.hasTriggeredPhase2) {
        this.hasTriggeredPhase2 = true;
        this.events.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "You won't beat me! Watch out for my rapid fire!",
        });
        this.events.publish("BOSS_PHASE_SHIFT", undefined);
      }

      if (bHealth.currentHealth <= phase3Threshold && !this.hasTriggeredPhase3) {
        this.hasTriggeredPhase3 = true;
        this.events.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "This is my final stand! Prepare yourself!",
        });
        this.events.publish("BOSS_PHASE_SHIFT", undefined);
      }
    }

    if (player.isDead && !this.cinematic.isActive()) {
      this.cinematic.startSequence(
        player.position,
        () => {
          this.audio.playPlayerExplosion();
        },
        [
          {
            triggerTime: 2.0,
            action: () => {
              this.events.publish("GAME_OVER", undefined);
              this.events.publish("RECORD_LOSS", undefined);
            },
          },
          {
            triggerTime: 2.5,
            action: () => {
              this.events.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "No... I can't go on..." });
            },
          },
          {
            triggerTime: 3.8,
            action: () => {
              this.events.publish("DIALOGUE_TRIGGERED", {
                speaker: "boss",
                text: "You fought well... but I am victorious.",
              });
            },
          },
          {
            triggerTime: 7.2,
            action: () => {
              this.events.publish("CLEAR_DIALOGUES", undefined);
              this.onBattleEnd();
            },
          },
        ]
      );
    } else if (boss.isDead && !this.cinematic.isActive()) {
      this.cinematic.startSequence(
        boss.position,
        () => {
          this.audio.playBossExplosion();
        },
        [
          {
            triggerTime: 2.0,
            action: () => {
              this.events.publish("VICTORY", undefined);
              this.events.publish("RECORD_WIN", undefined);
            },
          },
          {
            triggerTime: 2.5,
            action: () => {
              this.events.publish("DIALOGUE_TRIGGERED", {
                speaker: "boss",
                text: "No... How could I lose this fight...",
              });
            },
          },
          {
            triggerTime: 4.8,
            action: () => {
              this.events.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "It is over. The area is secure." });
            },
          },
          {
            triggerTime: 7.2,
            action: () => {
              this.events.publish("CLEAR_DIALOGUES", undefined);
              this.onBattleEnd();
            },
          },
        ]
      );
    }
  }

  public cleanup() {
    this.cinematic.cleanup();
  }
}
