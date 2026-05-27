import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { eventBroker } from "@/core/eventBroker";
import { soundSynth } from "@/core/SoundSynth";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { useSessionStore } from "@/store/useGameStore";
import { UNITS } from "@/core/Units";
import { saveManager } from "@/core/SaveManager";
import { CinematicSystem } from "@/core/CinematicSystem";

export class BattleDirector {
  private hasTriggeredFirstHit = false;
  private hasTriggeredPhase2 = false;
  private hasTriggeredPhase3 = false;
  private cinematic: CinematicSystem;
  private onBattleEnd: () => void;

  constructor(onBattleEnd: () => void) {
    this.onBattleEnd = onBattleEnd;
    this.cinematic = new CinematicSystem();
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
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "I found you. This battle ends now!" });
      }

      if (bHealth.currentHealth <= phase2Threshold && !this.hasTriggeredPhase2) {
        this.hasTriggeredPhase2 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "You won't beat me! Watch out for my rapid fire!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }

      if (bHealth.currentHealth <= phase3Threshold && !this.hasTriggeredPhase3) {
        this.hasTriggeredPhase3 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "This is my final stand! Prepare yourself!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }
    }

    const sessionState = useSessionStore.getState();

    if (player.isDead && !this.cinematic.isActive()) {
      this.cinematic.startSequence(
        player.position,
        () => {
          soundSynth.playPlayerExplosion();
        },
        [
          {
            triggerTime: 2.0,
            action: () => {
              sessionState.setGameResult("GAMEOVER");
              saveManager.recordLoss();
            },
          },
          {
            triggerTime: 2.5,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "No... I can't go on..." });
            },
          },
          {
            triggerTime: 3.8,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", {
                speaker: "boss",
                text: "You fought well... but I am victorious.",
              });
            },
          },
          {
            triggerTime: 7.2,
            action: () => {
              eventBroker.publish("CLEAR_DIALOGUES", undefined);
              this.onBattleEnd();
            },
          },
        ]
      );
    } else if (boss.isDead && !this.cinematic.isActive()) {
      this.cinematic.startSequence(
        boss.position,
        () => {
          soundSynth.playBossExplosion();
        },
        [
          {
            triggerTime: 2.0,
            action: () => {
              sessionState.setGameResult("VICTORY");
              saveManager.recordWin();
            },
          },
          {
            triggerTime: 2.5,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", {
                speaker: "boss",
                text: "No... How could I lose this fight...",
              });
            },
          },
          {
            triggerTime: 4.8,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "It is over. The area is secure." });
            },
          },
          {
            triggerTime: 7.2,
            action: () => {
              eventBroker.publish("CLEAR_DIALOGUES", undefined);
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
