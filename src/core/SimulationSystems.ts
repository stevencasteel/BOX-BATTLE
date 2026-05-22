import { eventBroker } from "@/core/eventBroker";
import { Camera } from "@/core/Camera";
import { soundSynth } from "@/core/SoundSynth";

export class SimulationSystems {
  private unsubscribes: (() => void)[] = [];

  private getPlayerX!: () => number;
  private getBossX!: () => number;
  private getMinionX!: (id: string) => number;

  public setup(
    getPlayerX: () => number,
    getBossX: () => number,
    getMinionX: (id: string) => number
  ): void {
    this.getPlayerX = getPlayerX;
    this.getBossX = getBossX;
    this.getMinionX = getMinionX;

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_HURT", () => {
        soundSynth.playHurt(this.getPlayerX());
        Camera.shake(15, 0.3);
        Camera.triggerHitStop(0.08);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_HURT", ({ currentHealth }) => {
        soundSynth.playHitConfirm(this.getBossX());
        if (currentHealth <= 0) {
          Camera.shake(25, 0.6);
          Camera.triggerHitStop(0.15);
        } else {
          Camera.shake(8, 0.15);
          Camera.triggerHitStop(0.04);
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("MINION_HURT", ({ id, currentHealth }) => {
        const mX = this.getMinionX(id);
        soundSynth.playHitConfirm(mX);
        if (currentHealth <= 0) {
          Camera.shake(4, 0.15);
          Camera.triggerHitStop(0.03);
        } else {
          Camera.shake(2, 0.08);
          Camera.triggerHitStop(0.01);
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_JUMPED", () => {
        soundSynth.playJump(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_DASHED", () => {
        soundSynth.playDash(this.getPlayerX());
        Camera.triggerHitStop(0.035);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_POGOED", () => {
        soundSynth.playPogo(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_ATTACKED", ({ direction }) => {
        soundSynth.playSlash(direction, this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_PROJECTILE_FIRED", ({ level }) => {
        if (level === 2) {
          soundSynth.playFireballLvl2(this.getPlayerX());
        } else {
          soundSynth.playFireballLvl1(this.getPlayerX());
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CAMERA_SHAKE", ({ amplitude, duration }) => {
        Camera.shake(amplitude, duration);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("HIT_STOP", ({ duration }) => {
        Camera.triggerHitStop(duration);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_LANDED", () => {
        soundSynth.playLanding(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("HEAL_START", () => {
        soundSynth.playHealStart(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("HEAL_CANCEL", () => {
        soundSynth.playHealCancel(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("HEAL_COMPLETE", () => {
        soundSynth.playHealComplete();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_SPIKED", () => {
        soundSynth.playSpikeStrike(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_PHASE_SHIFT", () => {
        soundSynth.playBossPhaseShift(this.getBossX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("MINION_SPAWNING", () => {
        soundSynth.playMinionSpawning();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("MINION_DISSOLVING", () => {
        soundSynth.playMinionDeconstruct();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_DASH_RECHARGED", () => {
        soundSynth.playDashRecharge(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_SWIPED", () => {
        soundSynth.playBossSwipe(this.getBossX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_TELEGRAPH", () => {
        soundSynth.playBossTelegraph(this.getBossX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_LUNGED", () => {
        soundSynth.playBossLunge(this.getBossX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CHARGE_START", () => {
        soundSynth.playChargeStart(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CHARGE_UPDATE", ({ timer }) => {
        soundSynth.updateChargeTimer(timer);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CHARGE_STOP", () => {
        soundSynth.stopChargeDrone();
      })
    );
  }

  public teardown(): void {
    this.unsubscribes.forEach((unsub) => unsub());
    this.unsubscribes = [];
    soundSynth.stopHealDrone();
    soundSynth.stopChargeDrone();
  }
}
