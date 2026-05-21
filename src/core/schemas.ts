import { Action } from "@/core/InputProvider";

export interface ValidatedSaveSlot {
  wins: number;
  losses: number;
  empty: boolean;
}

export interface ValidatedAudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  masterMuted: boolean;
  sfxMuted: boolean;
  musicMuted: boolean;
}

export interface ValidatedKeyMap {
  MOVE_LEFT: string[];
  MOVE_RIGHT: string[];
  MOVE_UP: string[];
  MOVE_DOWN: string[];
  JUMP: string[];
  ATTACK: string[];
  DASH: string[];
}

export class ConfigurationValidator {
  private static readonly REQUIRED_ACTIONS: Action[] = [
    "MOVE_LEFT",
    "MOVE_RIGHT",
    "MOVE_UP",
    "MOVE_DOWN",
    "JUMP",
    "ATTACK",
    "DASH"
  ];

  public static validateSaveSlot(data: any): ValidatedSaveSlot {
    if (!data || typeof data !== "object") {
      return { wins: 0, losses: 0, empty: true };
    }

    return {
      wins: typeof data.wins === "number" && data.wins >= 0 ? data.wins : 0,
      losses: typeof data.losses === "number" && data.losses >= 0 ? data.losses : 0,
      empty: typeof data.empty === "boolean" ? data.empty : true
    };
  }

  public static validateAudioSettings(data: any, fallback: ValidatedAudioSettings): ValidatedAudioSettings {
    if (!data || typeof data !== "object") {
      return fallback;
    }

    const checkVolume = (val: any, def: number) => {
      return typeof val === "number" && val >= 0 && val <= 1 ? val : def;
    };

    const checkMute = (val: any, def: boolean) => {
      return typeof val === "boolean" ? val : def;
    };

    return {
      masterVolume: checkVolume(data.masterVolume, fallback.masterVolume),
      sfxVolume: checkVolume(data.sfxVolume, fallback.sfxVolume),
      musicVolume: checkVolume(data.musicVolume, fallback.musicVolume),
      masterMuted: checkMute(data.masterMuted, fallback.masterMuted),
      sfxMuted: checkMute(data.sfxMuted, fallback.sfxMuted),
      musicMuted: checkMute(data.musicMuted, fallback.musicMuted)
    };
  }

  public static validateKeyMap(data: any, fallback: ValidatedKeyMap): ValidatedKeyMap {
    if (!data || typeof data !== "object") {
      return fallback;
    }

    const validatedMap = {} as ValidatedKeyMap;

    for (const action of this.REQUIRED_ACTIONS) {
      const keys = data[action];
      if (Array.isArray(keys) && keys.length > 0 && keys.every(k => typeof k === "string")) {
        validatedMap[action] = [...keys];
      } else {
        validatedMap[action] = [...fallback[action]];
      }
    }

    return validatedMap;
  }
}
