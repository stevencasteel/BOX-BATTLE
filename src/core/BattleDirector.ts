import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { eventBroker } from "@/core/eventBroker";
import { soundSynth } from "@/core/SoundSynth";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { useSessionStore } from "@/store/useGameStore";

export class BattleDirector {
  private hasTriggeredFirstHit = false;
  private hasTriggeredPhase2 = false;
  private hasTriggeredPhase3 = false;
  private cinematicActive = false;

  private bossDeathTimer = -1;
  private bossDeathPos: { x: number; y: number } | null = null;

  private deathTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dialogueTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dialogueStaggerTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dialogueClearTimeoutId: ReturnType<typeof setTimeout> | null = null;

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
      pos: this.bossDeathPos
    };
  }

  public update(dt: number, player: Player, boss: Boss) {
    // 1. Always increment the death timer first if active, even during cinematic returns
    if (this.bossDeathTimer >= 0) {
      this.bossDeathTimer += dt;
    }

    if (this.cinematicActive) {
      return;
    }

    // 2. High-level story progression thresholds
    const bHealth = boss.getComponent(HealthComponent);
    if (bHealth) {
      if (bHealth.currentHealth < 30 && !this.hasTriggeredFirstHit) {
        this.hasTriggeredFirstHit = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "I found you. This battle ends now!" });
      }

      if (bHealth.currentHealth <= 21 && !this.hasTriggeredPhase2) {
        this.hasTriggeredPhase2 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "You won't beat me! Watch out for my rapid fire!" });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }

      if (bHealth.currentHealth <= 12 && !this.hasTriggeredPhase3) {
        this.hasTriggeredPhase3 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "This is my final stand! Prepare yourself!" });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }
    }

    // 3. Battle end evaluations
    const sessionState = useSessionStore.getState();

    if (player.isDead && !this.cinematicActive) {
      this.cinematicActive = true;
      eventBroker.publish("CLEAR_DIALOGUES", undefined);
      soundSynth.clearAllSlides();
      soundSynth.stopChargeDrone();
      soundSynth.stopHealDrone();
      soundSynth.playPlayerExplosion();
      this.bossDeathTimer = 0;
      this.bossDeathPos = { x: player.position.x, y: player.position.y };

      eventBroker.publish("CAMERA_SHAKE", { amplitude: 30, duration: 1.8 });

      this.deathTimeoutId = setTimeout(() => {
        sessionState.setGameResult("GAMEOVER");
        this.onBattleEnd();
        this.dialogueTimeoutId = setTimeout(() => {
          eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "No... I can't go on..." });
        }, 500);
        this.dialogueStaggerTimeoutId = setTimeout(() => {
          eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "You fought well... but I am victorious." });
        }, 1800);
        this.dialogueClearTimeoutId = setTimeout(() => {
          eventBroker.publish("CLEAR_DIALOGUES", undefined);
        }, 5200);
      }, 2000);
    } 
    else if (boss.isDead && !this.cinematicActive) {
      this.cinematicActive = true;
      eventBroker.publish("CLEAR_DIALOGUES", undefined);
      soundSynth.clearAllSlides();
      soundSynth.stopChargeDrone();
      soundSynth.stopHealDrone();
      soundSynth.playBossExplosion();
      this.bossDeathTimer = 0;
      this.bossDeathPos = { x: boss.position.x, y: boss.position.y };

      eventBroker.publish("CAMERA_SHAKE", { amplitude: 30, duration: 1.8 });

      this.deathTimeoutId = setTimeout(() => {
        sessionState.setGameResult("VICTORY");
        this.onBattleEnd();
        this.dialogueTimeoutId = setTimeout(() => {
          eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "No... How could I lose this fight..." });
        }, 500);
        this.dialogueStaggerTimeoutId = setTimeout(() => {
          eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "It is over. The area is secure." });
        }, 2800);
        this.dialogueClearTimeoutId = setTimeout(() => {
          eventBroker.publish("CLEAR_DIALOGUES", undefined);
        }, 5200);
      }, 2000);
    }
  }

  public cleanup() {
    if (this.deathTimeoutId !== null) clearTimeout(this.deathTimeoutId);
    if (this.dialogueTimeoutId !== null) clearTimeout(this.dialogueTimeoutId);
    if (this.dialogueStaggerTimeoutId !== null) clearTimeout(this.dialogueStaggerTimeoutId);
    if (this.dialogueClearTimeoutId !== null) clearTimeout(this.dialogueClearTimeoutId);

    this.deathTimeoutId = null;
    this.dialogueTimeoutId = null;
    this.dialogueStaggerTimeoutId = null;
    this.dialogueClearTimeoutId = null;

    this.bossDeathTimer = -1;
    this.bossDeathPos = null;
    this.cinematicActive = false;
  }
}
