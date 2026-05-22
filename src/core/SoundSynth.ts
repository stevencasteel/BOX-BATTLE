import { AudioContextManager } from "./audio/AudioContextManager";
import { SFXManager } from "./audio/SFXManager";
import { MusicSequencer } from "./audio/MusicSequencer";
import { DroneManager } from "./audio/DroneManager";

class SoundSynth {
  private ctxManager: AudioContextManager;
  private sfx: SFXManager;
  private music: MusicSequencer;
  private drones: DroneManager;

  constructor() {
    this.ctxManager = new AudioContextManager();
    this.sfx = new SFXManager(this.ctxManager);
    this.music = new MusicSequencer(this.ctxManager);
    this.drones = new DroneManager(this.ctxManager, this.music);
  }

  public get hasUserGestured(): boolean {
    return this.ctxManager.hasUserGestured;
  }

  public get initialized(): boolean {
    return this.ctxManager.initialized;
  }

  public resumeContext(force?: boolean): void {
    this.ctxManager.resumeContext(force);
  }

  public updateVolumes(): void {
    this.ctxManager.updateVolumes();
  }

  public setCabinetMuffle(active: boolean): void {
    this.ctxManager.setCabinetMuffle(active);
  }

  public playBossTelegraph(x?: number): void {
    this.sfx.playBossTelegraph(x);
  }

  public playBossLunge(x?: number): void {
    this.sfx.playBossLunge(x);
  }

  public playDashRecharge(x?: number): void {
    this.sfx.playDashRecharge(x);
  }

  public playBossSwipe(x?: number): void {
    this.sfx.playBossSwipe(x);
  }

  public playMinionSpawning(x?: number): void {
    this.sfx.playMinionSpawning(x);
  }

  public playMinionDeconstruct(x?: number): void {
    this.sfx.playMinionDeconstruct(x);
  }

  public playBossPhaseShift(x?: number): void {
    this.sfx.playBossPhaseShift(x);
  }

  public playBossExplosion(x?: number): void {
    this.sfx.playBossExplosion(x);
  }

  public playPlayerExplosion(x?: number): void {
    this.sfx.playPlayerExplosion(x);
  }

  public playHealCancel(x?: number): void {
    this.sfx.playHealCancel(x);
  }

  public playSpikeStrike(x?: number): void {
    this.sfx.playSpikeStrike(x);
  }

  public playLanding(x?: number): void {
    this.sfx.playLanding(x);
  }

  public playFireballLvl1(x?: number): void {
    this.sfx.playFireballLvl1(x);
  }

  public playFireballLvl2(x?: number): void {
    this.sfx.playFireballLvl2(x);
  }

  public playMenuConfirm(): void {
    this.sfx.playMenuConfirm();
  }

  public playMenuBack(): void {
    this.sfx.playMenuBack();
  }

  public playJump(x?: number): void {
    this.sfx.playJump(x);
  }

  public playDash(x?: number): void {
    this.sfx.playDash(x);
  }

  public playSlash(direction?: "side" | "up" | "down", x?: number): void {
    this.sfx.playSlash(direction, x);
  }

  public playHitConfirm(x?: number): void {
    this.sfx.playHitConfirm(x);
  }

  public playPogo(x?: number): void {
    this.sfx.playPogo(x);
  }

  public playHurt(x?: number): void {
    this.sfx.playHurt(x);
  }

  public playSelectTick(): void {
    this.sfx.playSelectTick();
  }

  public playErrorTick(): void {
    this.sfx.playErrorTick();
  }

  public playDialogueTick(speaker: "player" | "boss", char: string): void {
    this.sfx.playDialogueTick(speaker, char);
  }

  public fadeOutMusic(duration?: number): void {
    this.music.fadeOutMusic(duration);
  }

  public fadeInMusic(duration?: number): void {
    this.music.fadeInMusic(duration);
  }

  public startMusic(): void {
    this.music.startMusic();
  }

  public stopMusic(): void {
    this.music.stopMusic();
  }

  public clearAllSlides(): void {
    // Deprecated
  }

  public playHealStart(x?: number): void {
    this.drones.playHealStart(x);
  }

  public stopHealDrone(): void {
    this.drones.stopHealDrone();
  }

  public playChargeStart(x?: number): void {
    this.drones.playChargeStart(x);
  }

  public updateChargeTimer(timer: number): void {
    this.drones.updateChargeTimer(timer);
  }

  public stopChargeDrone(): void {
    this.drones.stopChargeDrone();
  }

  public playHealComplete(): void {
    this.drones.playHealComplete();
  }
}

export const soundSynth = new SoundSynth();
