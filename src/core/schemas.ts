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

  public static validateSaveSlot(data: unknown): ValidatedSaveSlot {
    if (!data || typeof data !== "object") {
      return { wins: 0, losses: 0, empty: true };
    }

    const obj = data as Record<string, unknown>;

    return {
      wins: typeof obj.wins === "number" && obj.wins >= 0 ? obj.wins : 0,
      losses: typeof obj.losses === "number" && obj.losses >= 0 ? obj.losses : 0,
      empty: typeof obj.empty === "boolean" ? obj.empty : true
    };
  }

  public static validateAudioSettings(data: unknown, fallback: ValidatedAudioSettings): ValidatedAudioSettings {
    if (!data || typeof data !== "object") {
      return fallback;
    }

    const obj = data as Record<string, unknown>;

    const checkVolume = (val: unknown, def: number) => {
      return typeof val === "number" && val >= 0 && val <= 1 ? val : def;
    };

    const checkMute = (val: unknown, def: boolean) => {
      return typeof val === "boolean" ? val : def;
    };

    return {
      masterVolume: checkVolume(obj.masterVolume, fallback.masterVolume),
      sfxVolume: checkVolume(obj.sfxVolume, fallback.sfxVolume),
      musicVolume: checkVolume(obj.musicVolume, fallback.musicVolume),
      masterMuted: checkMute(obj.masterMuted, fallback.masterMuted),
      sfxMuted: checkMute(obj.sfxMuted, fallback.sfxMuted),
      musicMuted: checkMute(obj.musicMuted, fallback.musicMuted)
    };
  }

  public static validateKeyMap(data: unknown, fallback: ValidatedKeyMap): ValidatedKeyMap {
    if (!data || typeof data !== "object") {
      return fallback;
    }

    const obj = data as Record<string, unknown>;
    const validatedMap = {} as ValidatedKeyMap;

    for (const action of this.REQUIRED_ACTIONS) {
      const keys = obj[action];
      if (Array.isArray(keys) && keys.length > 0 && keys.every(k => typeof k === "string")) {
        validatedMap[action] = [...keys] as string[];
      } else {
        validatedMap[action] = [...fallback[action]];
      }
    }

    return validatedMap;
  }
}
