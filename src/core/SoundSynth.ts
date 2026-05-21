import { AudioContextManager } from "./audio/AudioContextManager";
import { SFXManager } from "./audio/SFXManager";
import { MusicSequencer } from "./audio/MusicSequencer";
import { FrictionSlideManager } from "./audio/FrictionSlideManager";
import { DroneManager } from "./audio/DroneManager";

class SoundSynth {
  private ctxManager: AudioContextManager;
  private sfx: SFXManager;
  private music: MusicSequencer;
  private friction: FrictionSlideManager;
  private drones: DroneManager;

  constructor() {
    this.ctxManager = new AudioContextManager();
    this.sfx = new SFXManager(this.ctxManager);
    this.music = new MusicSequencer(this.ctxManager);
    this.friction = new FrictionSlideManager(this.ctxManager);
    this.drones = new DroneManager(this.ctxManager, this.music);
  }

  public get hasUserGestured(): boolean {
    return this.ctxManager.hasUserGestured;
  }

  public get initialized(): boolean {
    return this.ctxManager.initialized;
  }

  public resumeContext(): void {
    this.ctxManager.resumeContext();
  }

  public updateVolumes(): void {
    this.ctxManager.updateVolumes();
  }

  public setCabinetMuffle(active: boolean): void {
    this.ctxManager.setCabinetMuffle(active);
  }

  public playBossTelegraph(): void {
    this.sfx.playBossTelegraph();
  }

  public playBossLunge(): void {
    this.sfx.playBossLunge();
  }

  public playDashRecharge(): void {
    this.sfx.playDashRecharge();
  }

  public playBossSwipe(): void {
    this.sfx.playBossSwipe();
  }

  public playMinionSpawning(): void {
    this.sfx.playMinionSpawning();
  }

  public playMinionDeconstruct(): void {
    this.sfx.playMinionDeconstruct();
  }

  public playBossPhaseShift(): void {
    this.sfx.playBossPhaseShift();
  }

  public playBossExplosion(): void {
    this.sfx.playBossExplosion();
  }

  public playPlayerExplosion(): void {
    this.sfx.playPlayerExplosion();
  }

  public playHealCancel(): void {
    this.sfx.playHealCancel();
  }

  public playSpikeStrike(): void {
    this.sfx.playSpikeStrike();
  }

  public playLanding(): void {
    this.sfx.playLanding();
  }

  public playFireballLvl1(): void {
    this.sfx.playFireballLvl1();
  }

  public playFireballLvl2(): void {
    this.sfx.playFireballLvl2();
  }

  public playJump(): void {
    this.sfx.playJump();
  }

  public playDash(): void {
    this.sfx.playDash();
  }

  public playSlash(direction?: "side" | "up" | "down"): void {
    this.sfx.playSlash(direction);
  }

  public playHitConfirm(): void {
    this.sfx.playHitConfirm();
  }

  public playPogo(): void {
    this.sfx.playPogo();
  }

  public playHurt(): void {
    this.sfx.playHurt();
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

  public handleEntitySlide(id: string, width: number, height: number, speed: number, shouldSlide: boolean): void {
    this.friction.handleEntitySlide(id, width, height, speed, shouldSlide);
  }

  public clearAllSlides(): void {
    this.friction.clearAllSlides();
  }

  public playHealStart(): void {
    this.drones.playHealStart();
  }

  public stopHealDrone(): void {
    this.drones.stopHealDrone();
  }

  public playChargeStart(): void {
    this.drones.playChargeStart();
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
