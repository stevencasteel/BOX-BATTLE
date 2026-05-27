import { create } from "zustand";
import { Action } from "@/core/InputProvider";

interface TutorialState {
  tutorialStep: number;
  calibratedKeys: Record<Action, boolean>;
  setTutorialStep: (step: number) => void;
  calibrateKey: (action: Action) => void;
  resetTutorial: () => void;
}

export const useTutorialStore = create<TutorialState>((set) => ({
  tutorialStep: 0,
  calibratedKeys: {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false,
  },
  setTutorialStep: (step) => set({ tutorialStep: step }),
  calibrateKey: (action) =>
    set((state) => ({
      calibratedKeys: {
        ...state.calibratedKeys,
        [action]: true,
      },
    })),
  resetTutorial: () =>
    set({
      tutorialStep: 0,
      calibratedKeys: {
        MOVE_LEFT: false,
        MOVE_RIGHT: false,
        MOVE_UP: false,
        MOVE_DOWN: false,
        JUMP: false,
        ATTACK: false,
        DASH: false,
      },
    }),
}));
