import type { Action } from "@/core/InputProvider";

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  masterMuted: boolean;
  sfxMuted: boolean;
  musicMuted: boolean;
}

export type KeyMap = Record<Action, string[]>;

export type InputPreset = "DEFAULT_1" | "DEFAULT_2" | "CUSTOM";

class SettingsManager {
  private readonly configKey = "box_battle_config";

  private audioSettings: AudioSettings = {
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    masterMuted: false,
    sfxMuted: false,
    musicMuted: false,
  };

  private currentPreset: InputPreset = "DEFAULT_1";

  private customKeyMap: KeyMap = {
    MOVE_LEFT: ["ArrowLeft", "KeyA"],
    MOVE_RIGHT: ["ArrowRight", "KeyD"],
    MOVE_UP: ["ArrowUp", "KeyW"],
    MOVE_DOWN: ["ArrowDown", "KeyS"],
    JUMP: ["Space", "KeyX"],
    ATTACK: ["KeyC"],
    DASH: ["KeyZ"],
  };

  private presetDefault1: KeyMap = {
    MOVE_LEFT: ["ArrowLeft", "KeyA"],
    MOVE_RIGHT: ["ArrowRight", "KeyD"],
    MOVE_UP: ["ArrowUp", "KeyW"],
    MOVE_DOWN: ["ArrowDown", "KeyS"],
    JUMP: ["Space", "KeyX"],
    ATTACK: ["KeyC"],
    DASH: ["KeyZ"],
  };

  private presetDefault2: KeyMap = {
    MOVE_LEFT: ["KeyA"],
    MOVE_RIGHT: ["KeyD"],
    MOVE_UP: ["KeyW"],
    MOVE_DOWN: ["KeyS"],
    JUMP: ["Period"],
    ATTACK: ["Comma"],
    DASH: ["Slash"],
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const saved = localStorage.getItem(this.configKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.audio) this.audioSettings = { ...this.audioSettings, ...parsed.audio };
        if (parsed.preset) this.currentPreset = parsed.preset;
        if (parsed.customKeyMap) this.customKeyMap = { ...this.customKeyMap, ...parsed.customKeyMap };
      } catch (e) {
        console.warn("Could not read settings from disk. Restoring defaults.", e);
      }
    }
  }

  public saveSettings() {
    const config = {
      audio: this.audioSettings,
      preset: this.currentPreset,
      customKeyMap: this.customKeyMap,
    };
    localStorage.setItem(this.configKey, JSON.stringify(config));
  }

  public getAudio(): AudioSettings {
    return this.audioSettings;
  }

  public setAudio(audio: Partial<AudioSettings>) {
    this.audioSettings = { ...this.audioSettings, ...audio };
    this.saveSettings();
  }

  public getCurrentPreset(): InputPreset {
    return this.currentPreset;
  }

  public setPreset(preset: InputPreset) {
    this.currentPreset = preset;
    this.saveSettings();
  }

  public getKeyMap(): KeyMap {
    if (this.currentPreset === "DEFAULT_1") return this.presetDefault1;
    if (this.currentPreset === "DEFAULT_2") return this.presetDefault2;
    return this.customKeyMap;
  }

  public remapKey(action: Action, index: number, newCode: string) {
    this.currentPreset = "CUSTOM";
    if (!this.customKeyMap[action]) {
      this.customKeyMap[action] = [];
    }
    this.customKeyMap[action][index] = newCode;
    this.saveSettings();
  }
}

export const settingsManager = new SettingsManager();
