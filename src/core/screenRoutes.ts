import { ScreenState } from "@/store/useGameStore";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager, AudioSettings } from "@/core/SettingsManager";

export interface MenuContext {
  navTo: (screen: ScreenState) => void;
  menuIndex: number;
  setMenuIndex: (index: number) => void;
  reloadSaveSlots: () => void;
  resetGameSession: () => void;
  handleSlotAction: (index: number, onPlay: () => void) => void;
  toggleCopyMode: () => void;
  toggleEraseMode: () => void;
  resetActions: () => void;
  audio: AudioSettings;
  handleVolumeChange: (field: keyof AudioSettings, value: number | boolean) => void;
  resetSettings?: () => void;
  setRebindTarget: (target: { action: Action; index: number } | null) => void;
  gameResult: string;
}

export interface ScreenConfig {
  getMaxIndex(context: MenuContext): number;
  onSelect(context: MenuContext): void;
  onBack?(context: MenuContext): void;
  onHorizontal?(direction: number, context: MenuContext): void;
}

export const screenConfigs: Record<string, ScreenConfig> = {
  TITLE: {
    getMaxIndex: () => 3,
    onSelect: ({ menuIndex, navTo, reloadSaveSlots }) => {
      if (menuIndex === 0) {
        reloadSaveSlots();
        navTo("SAVE_SELECT");
      } else if (menuIndex === 1) {
        navTo("OPTIONS");
      } else if (menuIndex === 2) {
        navTo("CREDITS");
      } else if (menuIndex === 3) {
        navTo("SOURCE_VIEW");
      }
    }
  },
  PLAYING: {
    getMaxIndex: ({ gameResult }) => (gameResult !== "PLAYING" ? 1 : 0),
    onSelect: ({ menuIndex, gameResult, resetGameSession, navTo }) => {
      if (gameResult !== "PLAYING") {
        if (menuIndex === 0) {
          resetGameSession();
          navTo("PLAYING");
        } else {
          navTo("TITLE");
        }
      }
    }
  },
  SAVE_SELECT: {
    getMaxIndex: () => 5,
    onSelect: ({ menuIndex, handleSlotAction, navTo, resetGameSession, toggleCopyMode, toggleEraseMode, resetActions }) => {
      if (menuIndex >= 0 && menuIndex <= 2) {
        handleSlotAction(menuIndex, () => {
          resetGameSession();
          navTo("PLAYING");
        });
      } else if (menuIndex === 3) {
        toggleCopyMode();
      } else if (menuIndex === 4) {
        toggleEraseMode();
      } else if (menuIndex === 5) {
        resetActions();
        navTo("TITLE");
      }
    },
    onBack: ({ resetActions, navTo }) => {
      resetActions();
      navTo("TITLE");
    }
  },
  OPTIONS: {
    getMaxIndex: () => 2,
    onSelect: ({ menuIndex, navTo, setMenuIndex }) => {
      if (menuIndex === 0) {
        navTo("SOUND");
      } else if (menuIndex === 1) {
        navTo("CONTROLS");
      } else if (menuIndex === 2) {
        navTo("TITLE");
        setMenuIndex(1);
      }
    },
    onBack: ({ resetActions, navTo }) => {
      resetActions();
      navTo("TITLE");
    }
  },
  SOUND: {
    getMaxIndex: () => 4,
    onSelect: ({ menuIndex, navTo, resetSettings }) => {
      if (menuIndex === 3) {
        resetSettings?.();
      } else if (menuIndex === 4) {
        navTo("OPTIONS");
      }
    },
    onHorizontal: (direction, { menuIndex, audio, handleVolumeChange }) => {
      const delta = direction * 0.05;
      if (menuIndex === 0 && !audio.masterMuted) {
        handleVolumeChange("masterVolume", Math.max(0, Math.min(1, audio.masterVolume + delta)));
        soundSynth.playSelectTick();
      } else if (menuIndex === 1 && !audio.sfxMuted) {
        handleVolumeChange("sfxVolume", Math.max(0, Math.min(1, audio.sfxVolume + delta)));
        soundSynth.playSelectTick();
      } else if (menuIndex === 2 && !audio.musicMuted) {
        handleVolumeChange("musicVolume", Math.max(0, Math.min(1, audio.musicVolume + delta)));
        soundSynth.playSelectTick();
      }
    },
    onBack: ({ navTo }) => {
      navTo("OPTIONS");
    }
  },
  CONTROLS: {
    getMaxIndex: () => {
      const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
      return isTouch ? 0 : 10;
    },
    onSelect: ({ menuIndex, navTo, setMenuIndex, setRebindTarget, reloadSaveSlots }) => {
      const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
      if (isTouch) {
        navTo("OPTIONS");
        setMenuIndex(1);
        return;
      }
      if (menuIndex === 0) {
        settingsManager.setPreset("DEFAULT_1");
        soundSynth.playHitConfirm();
        reloadSaveSlots();
      } else if (menuIndex === 1) {
        settingsManager.setPreset("DEFAULT_2");
        soundSynth.playHitConfirm();
        reloadSaveSlots();
      } else if (menuIndex === 2) {
        settingsManager.setPreset("CUSTOM");
        soundSynth.playHitConfirm();
        reloadSaveSlots();
      } else if (menuIndex === 10) {
        navTo("OPTIONS");
        setMenuIndex(1);
      } else {
        const actionIndex = menuIndex - 3;
        const action = (Object.keys(settingsManager.getKeyMap()) as Action[])[actionIndex];
        soundSynth.playHitConfirm();
        setRebindTarget({ action, index: 0 });
      }
    },
    onBack: ({ navTo }) => {
      navTo("OPTIONS");
    }
  },
  CREDITS: {
    getMaxIndex: () => 0,
    onSelect: ({ navTo }) => {
      navTo("TITLE");
    },
    onBack: ({ navTo }) => {
      navTo("TITLE");
    }
  }
};
