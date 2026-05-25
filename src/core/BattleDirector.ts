import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { eventBroker } from "@/core/eventBroker";
import { soundSynth } from "@/core/SoundSynth";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { useSessionStore } from "@/store/useGameStore";

interface CinematicEvent {
  triggerTime: number;
  fired: boolean;
  action: () => void;
}

export class BattleDirector {
  private hasTriggeredFirstHit = false;
  private hasTriggeredPhase2 = false;
  private hasTriggeredPhase3 = false;
  private cinematicActive = false;

  private bossDeathTimer = -1;
  private bossDeathPos: { x: number; y: number } | null = null;

  private cinematicTimeline = 0;
  private cinematicQueue: CinematicEvent[] = [];

  private onBattleEnd: () => void;

  constructor(onBattleEnd: () => void) {
    this.onBattleEnd = onBattleEnd;
  }

  public isCinematicActive(): boolean {
    return this.cinematicActive;
  }

  public getDeathVisuals() {
    return {
      timer: this.bossDeathTimer,
      pos: this.bossDeathPos,
    };
  }

  public update(dt: number, player: Player, boss: Boss) {
    if (this.bossDeathTimer >= 0) {
      this.bossDeathTimer += dt;
    }

    if (this.cinematicActive) {
      this.updateCinematicTimeline(dt);
      return;
    }

    const bHealth = boss.getComponent(HealthComponent);
    if (bHealth) {
      if (bHealth.currentHealth < 38 && !this.hasTriggeredFirstHit) {
        this.hasTriggeredFirstHit = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "I found you. This battle ends now!" });
      }

      if (bHealth.currentHealth <= 27 && !this.hasTriggeredPhase2) {
        this.hasTriggeredPhase2 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "You won't beat me! Watch out for my rapid fire!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }

      if (bHealth.currentHealth <= 15 && !this.hasTriggeredPhase3) {
        this.hasTriggeredPhase3 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "This is my final stand! Prepare yourself!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }
    }

    const sessionState = useSessionStore.getState();

    if (player.isDead && !this.cinematicActive) {
      this.startCinematicSequence(
        player.position,
        () => {
          soundSynth.playPlayerExplosion();
        },
        [
          {
            triggerTime: 2.0,
            fired: false,
            action: () => {
              sessionState.setGameResult("GAMEOVER");
            },
          },
          {
            triggerTime: 2.5,
            fired: false,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "No... I can't go on..." });
            },
          },
          {
            triggerTime: 3.8,
            fired: false,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", {
                speaker: "boss",
                text: "You fought well... but I am victorious.",
              });
            },
          },
          {
            triggerTime: 7.2,
            fired: false,
            action: () => {
              eventBroker.publish("CLEAR_DIALOGUES", undefined);
              this.onBattleEnd();
            },
          },
        ]
      );
    } else if (boss.isDead && !this.cinematicActive) {
      this.startCinematicSequence(
        boss.position,
        () => {
          soundSynth.playBossExplosion();
        },
        [
          {
            triggerTime: 2.0,
            fired: false,
            action: () => {
              sessionState.setGameResult("VICTORY");
            },
          },
          {
            triggerTime: 2.5,
            fired: false,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", {
                speaker: "boss",
                text: "No... How could I lose this fight...",
              });
            },
          },
          {
            triggerTime: 4.8,
            fired: false,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "It is over. The area is secure." });
            },
          },
          {
            triggerTime: 7.2,
            fired: false,
            action: () => {
              eventBroker.publish("CLEAR_DIALOGUES", undefined);
              this.onBattleEnd();
            },
          },
        ]
      );
    }
  }

  private startCinematicSequence(
    pos: { x: number; y: number },
    initialExplosion: () => void,
    events: CinematicEvent[]
  ) {
    this.cinematicActive = true;
    eventBroker.publish("CLEAR_DIALOGUES", undefined);
    soundSynth.clearAllSlides();
    soundSynth.stopChargeDrone();
    soundSynth.stopHealDrone();
    initialExplosion();

    this.bossDeathTimer = 0;
    this.bossDeathPos = { x: pos.x, y: pos.y };

    eventBroker.publish("CAMERA_SHAKE", { amplitude: 30, duration: 1.8 });

    this.cinematicTimeline = 0;
    this.cinematicQueue = events;
  }

  private updateCinematicTimeline(dt: number) {
    this.cinematicTimeline += dt;

    for (const event of this.cinematicQueue) {
      if (!event.fired && this.cinematicTimeline >= event.triggerTime) {
        event.action();
        event.fired = true;
      }
    }
  }

  public cleanup() {
    this.cinematicQueue = [];
    this.cinematicTimeline = 0;
    this.bossDeathTimer = -1;
    this.bossDeathPos = null;
    this.cinematicActive = false;
  }
}
