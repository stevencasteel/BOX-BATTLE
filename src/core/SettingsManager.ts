import type { Action } from "@/core/InputProvider";
import { ConfigurationValidator } from "./schemas";

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
        if (parsed.audio) {
          this.audioSettings = ConfigurationValidator.validateAudioSettings(parsed.audio, this.audioSettings);
        }
        if (parsed.preset === "DEFAULT_1" || parsed.preset === "DEFAULT_2" || parsed.preset === "CUSTOM") {
          this.currentPreset = parsed.preset;
        }
        if (parsed.customKeyMap) {
          this.customKeyMap = ConfigurationValidator.validateKeyMap(parsed.customKeyMap, this.customKeyMap);
        }
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
    const lead = this.currentPreset === "DEFAULT_2" ? this.presetDefault2 : this.presetDefault1;
    const follow = this.currentPreset === "DEFAULT_2" ? this.presetDefault1 : this.presetDefault2;

    const merged: KeyMap = {
      MOVE_LEFT: [...new Set([...lead.MOVE_LEFT, ...follow.MOVE_LEFT])],
      MOVE_RIGHT: [...new Set([...lead.MOVE_RIGHT, ...follow.MOVE_RIGHT])],
      MOVE_UP: [...new Set([...lead.MOVE_UP, ...follow.MOVE_UP])],
      MOVE_DOWN: [...new Set([...lead.MOVE_DOWN, ...follow.MOVE_DOWN])],
      JUMP: [...new Set([...lead.JUMP, ...follow.JUMP])],
      ATTACK: [...new Set([...lead.ATTACK, ...follow.ATTACK])],
      DASH: [...new Set([...lead.DASH, ...follow.DASH])],
    };

    if (this.currentPreset === "CUSTOM") {
      for (const action of Object.keys(merged) as Action[]) {
        merged[action] = [...new Set([...(this.customKeyMap[action] || []), ...merged[action]])];
      }
    }

    return merged;
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
