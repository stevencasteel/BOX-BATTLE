import { create } from "zustand";

export type ScreenState = "TITLE" | "SAVE_SELECT" | "OPTIONS" | "SOUND" | "CONTROLS" | "CREDITS" | "PLAYING";
export type GameResultState = "PLAYING" | "GAMEOVER" | "VICTORY";

interface GameState {
  currentScreen: ScreenState;
  menuIndex: number;
  playerHP: number;
  bossHP: number;
  healingCharges: number;
  determination: number;
  gameResult: GameResultState;
  retryCount: number;
  isGlitching: boolean;
  bossDeathCoordinates: { x: number; y: number } | null;

  navTo: (screen: ScreenState) => void;
  setMenuIndex: (index: number) => void;
  setPlayerHP: (hp: number) => void;
  setBossHP: (hp: number) => void;
  setHealingCharges: (charges: number) => void;
  setDetermination: (determination: number) => void;
  setGameResult: (result: GameResultState) => void;
  triggerGlitch: (duration?: number) => void;
  triggerBossDefeat: (x: number, y: number) => void;
  resetGameSession: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentScreen: "TITLE",
  menuIndex: 0,
  playerHP: 5,
  bossHP: 30,
  healingCharges: 0,
  determination: 0,
  gameResult: "PLAYING",
  retryCount: 0,
  isGlitching: false,
  bossDeathCoordinates: null,

  navTo: (screen) => {
    set((state) => ({
      currentScreen: screen,
      menuIndex: 0,
      isGlitching: false,
      bossDeathCoordinates: null,
      retryCount: screen === "PLAYING" ? state.retryCount + 1 : state.retryCount,
    }));
  },

  setMenuIndex: (index) => set({ menuIndex: index }),

  setPlayerHP: (hp) => {
    const current = get().playerHP;
    if (hp !== current) {
      set({ playerHP: hp });
      if (hp < current && get().currentScreen === "PLAYING") {
        get().triggerGlitch(150);
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

  setDetermination: (determination) => {
    if (determination !== get().determination) {
      set({ determination });
    }
  },

  setGameResult: (result) => {
    if (result !== get().gameResult) {
      set({ gameResult: result });
    }
  },

  triggerGlitch: (duration = 150) => {
    set({ isGlitching: true });
    setTimeout(() => {
      set({ isGlitching: false });
    }, duration);
  },

  triggerBossDefeat: (x, y) => {
    set({
      bossDeathCoordinates: { x, y }
    });
  },

  resetGameSession: () => {
    set({
      playerHP: 5,
      bossHP: 30,
      healingCharges: 0,
      determination: 0,
      gameResult: "PLAYING",
      isGlitching: false,
      bossDeathCoordinates: null,
    });
  },
}));
