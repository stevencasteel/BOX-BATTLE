import { create } from "zustand";

export type ScreenState = "TITLE" | "SAVE_SELECT" | "OPTIONS" | "SOUND" | "CONTROLS" | "CREDITS" | "SOURCE_VIEW" | "PLAYING";
export type GameResultState = "PLAYING" | "GAMEOVER" | "VICTORY";

interface SessionState {
  currentScreen: ScreenState;
  menuIndex: number;
  gameResult: GameResultState;
  retryCount: number;
  navTo: (screen: ScreenState) => void;
  setMenuIndex: (index: number) => void;
  setGameResult: (result: GameResultState) => void;
  incrementRetry: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentScreen: "TITLE",
  menuIndex: 0,
  gameResult: "PLAYING",
  retryCount: 0,
  navTo: (screen) => {
    set((state) => ({
      currentScreen: screen,
      menuIndex: 0,
      gameResult: "PLAYING",
      retryCount: screen === "PLAYING" ? state.retryCount + 1 : state.retryCount,
    }));
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
}

export const useGameplayStore = create<GameplayState>((set, get) => ({
  playerHP: 5,
  bossHP: 30,
  healingCharges: 0,
  determination: 0,
  isGlitching: false,
  bossDeathCoordinates: null,
  setPlayerHP: (hp) => {
    const current = get().playerHP;
    if (hp !== current) {
      set({ playerHP: hp });
      if (hp < current) {
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
      playerHP: 5,
      bossHP: 30,
      healingCharges: 0,
      determination: 0,
      isGlitching: false,
      bossDeathCoordinates: null,
    });
  },
}));
