import { AudioContextManager } from "./AudioContextManager";
import { SFXHelper } from "./sfx/SFXHelper";
import { PlayerSFX } from "./sfx/PlayerSFX";
import { BossSFX } from "./sfx/BossSFX";
import { InterfaceSFX } from "./sfx/InterfaceSFX";
import { IEventBus } from "@/core/Interfaces";

export class SFXManager {
  private helper: SFXHelper;
  private playerSFX: PlayerSFX;
  private bossSFX: BossSFX;
  private interfaceSFX: InterfaceSFX;

  constructor(ctxManager: AudioContextManager, eventBus: IEventBus, getComboCounter: () => number) {
    this.helper = new SFXHelper(ctxManager);
    this.playerSFX = new PlayerSFX(ctxManager, this.helper, eventBus, getComboCounter);
    this.bossSFX = new BossSFX(ctxManager, this.helper, eventBus, getComboCounter);
    this.interfaceSFX = new InterfaceSFX(ctxManager, this.helper);
  }

  public playBossTelegraph(x?: number) {
    this.bossSFX.playBossTelegraph(x);
  }
  public playBossLunge(x?: number) {
    this.bossSFX.playBossLunge(x);
  }
  public playDashRecharge(x?: number) {
    this.playerSFX.playDashRecharge(x);
  }
  public playBossSwipe(x?: number) {
    this.bossSFX.playBossSwipe(x);
  }
  public playMinionSpawning(x?: number) {
    this.bossSFX.playMinionSpawning(x);
  }
  public playMinionDeconstruct(x?: number) {
    this.bossSFX.playMinionDeconstruct(x);
  }
  public playBossPhaseShift(x?: number) {
    this.bossSFX.playBossPhaseShift(x);
  }
  public playBossExplosion(x?: number) {
    this.bossSFX.playBossExplosion(x);
  }
  public playPlayerExplosion(x?: number) {
    this.playerSFX.playPlayerExplosion(x);
  }
  public playHealCancel(x?: number) {
    this.playerSFX.playHealCancel(x);
  }
  public playSpikeStrike(x?: number) {
    this.bossSFX.playSpikeStrike(x);
  }
  public playLanding(x?: number) {
    this.playerSFX.playLanding(x);
  }
  public playFireballLvl1(x?: number) {
    this.playerSFX.playFireballLvl1(x);
  }
  public playFireballLvl2(x?: number) {
    this.playerSFX.playFireballLvl2(x);
  }
  public playMenuConfirm() {
    this.interfaceSFX.playMenuConfirm();
  }
  public playMenuBack() {
    this.interfaceSFX.playMenuBack();
  }
  public playJump(x?: number) {
    this.playerSFX.playJump(x);
  }
  public playDash(x?: number) {
    this.playerSFX.playDash(x);
  }
  public playSlash(direction?: "side" | "up" | "down", x?: number) {
    this.playerSFX.playSlash(direction, x);
  }
  public playHitConfirm(x?: number, entityId?: string) {
    this.bossSFX.playHitConfirm(x, entityId);
  }
  public playPogo(x?: number) {
    this.playerSFX.playPogo(x);
  }
  public playHurt(x?: number) {
    this.playerSFX.playHurt(x);
  }
  public playSelectTick() {
    this.interfaceSFX.playSelectTick();
  }
  public playErrorTick() {
    this.interfaceSFX.playErrorTick();
  }
  public playDialogueTick(speaker: "player" | "boss", char: string) {
    this.interfaceSFX.playDialogueTick(speaker, char);
  }
}
