import { create } from "zustand";
import { soundSynth } from "@/core/SoundSynth";
import { UNITS } from "@/core/Units";

export type ScreenState =
  | "TITLE"
  | "SAVE_SELECT"
  | "OPTIONS"
  | "SOUND"
  | "CONTROLS"
  | "CREDITS"
  | "SOURCE_VIEW"
  | "PLAYING";
export type GameResultState = "PLAYING" | "GAMEOVER" | "VICTORY";

const SCREEN_DEPTHS: Record<ScreenState, number> = {
  TITLE: 0,
  SAVE_SELECT: 1,
  OPTIONS: 1,
  CREDITS: 1,
  SOURCE_VIEW: 1,
  SOUND: 2,
  CONTROLS: 2,
  PLAYING: 2,
};

interface SessionState {
  currentScreen: ScreenState;
  menuIndex: number;
  gameResult: GameResultState;
  retryCount: number;
  transitionActive: "SHUTDOWN" | "POWER_ON" | "NONE";
  navTo: (screen: ScreenState) => void;
  setMenuIndex: (index: number) => void;
  setGameResult: (result: GameResultState) => void;
  incrementRetry: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentScreen: "TITLE",
  menuIndex: 0,
  gameResult: "PLAYING",
  retryCount: 0,
  transitionActive: "NONE",
  navTo: (screen) => {
    const current = get().currentScreen;
    if (current === screen && screen !== "PLAYING") return;

    if (soundSynth.initialized) {
      const currentDepth = SCREEN_DEPTHS[current] ?? 0;
      const targetDepth = SCREEN_DEPTHS[screen] ?? 0;

      if (targetDepth < currentDepth) {
        soundSynth.playMenuBack();
      } else {
        soundSynth.playMenuConfirm();
      }
    }

    const needsTransition = screen === "PLAYING" || current === "PLAYING";

    if (needsTransition) {
      set({ transitionActive: "SHUTDOWN" });
      setTimeout(() => {
        set((state) => ({
          currentScreen: screen,
          menuIndex: 0,
          gameResult: "PLAYING",
          retryCount: screen === "PLAYING" ? state.retryCount + 1 : state.retryCount,
          transitionActive: "POWER_ON",
        }));

        setTimeout(() => {
          set({ transitionActive: "NONE" });
        }, 400);
      }, 450);
    } else {
      set({
        currentScreen: screen,
        menuIndex: 0,
        gameResult: "PLAYING",
        transitionActive: "NONE",
      });
    }
  },
  setMenuIndex: (index) => set({ menuIndex: index }),
  setGameResult: (result) => set({ gameResult: result }),
  incrementRetry: () => set((state) => ({ retryCount: state.retryCount + 1 })),
}));

interface GameplayState {
  playerHP: number;
  bossHP: number;
  healingCharges: number;
  determination: number;
  isGlitching: boolean;
  bossDeathCoordinates: { x: number; y: number } | null;
  setPlayerHP: (hp: number) => void;
  setBossHP: (hp: number) => void;
  setHealingCharges: (charges: number) => void;
  setDetermination: (determination: number) => void;
  triggerGlitch: (duration?: number) => void;
  triggerBossDefeat: (x: number, y: number) => void;
  resetGameSession: () => void;
  comboCounter: number;
  incrementCombo: () => void;
  resetCombo: () => void;
}

export const useGameplayStore = create<GameplayState>((set, get) => ({
  playerHP: UNITS.PLAYER_MAX_HP,
  bossHP: UNITS.BOSS_MAX_HP,
  healingCharges: 0,
  determination: 0,
  isGlitching: false,
  bossDeathCoordinates: null,
  comboCounter: 0,
  incrementCombo: () => set((state) => ({ comboCounter: state.comboCounter + 1 })),
  resetCombo: () => set({ comboCounter: 0 }),
  setPlayerHP: (hp) => {
    const current = get().playerHP;
    if (hp !== current) {
      set({ playerHP: hp });
      if (hp < current) {
        get().triggerGlitch(150);
        get().resetCombo();
      }
    }
  },
  setBossHP: (hp) => {
    if (hp !== get().bossHP) {
      set({ bossHP: hp });
    }
  },
  setHealingCharges: (charges) => {
    if (charges !== get().healingCharges) {
      set({ healingCharges: charges });
    }
  },
  setDetermination: (det) => {
    if (det !== get().determination) {
      set({ determination: det });
    }
  },
  triggerGlitch: (duration = 150) => {
    set({ isGlitching: true });
    setTimeout(() => {
      set({ isGlitching: false });
    }, duration);
  },
  triggerBossDefeat: (x, y) => {
    set({ bossDeathCoordinates: { x, y } });
  },
  resetGameSession: () => {
    set({
      playerHP: UNITS.PLAYER_MAX_HP,
      bossHP: UNITS.BOSS_MAX_HP,
      healingCharges: 0,
      determination: 0,
      isGlitching: false,
      bossDeathCoordinates: null,
      comboCounter: 0,
    });
  },
}));
