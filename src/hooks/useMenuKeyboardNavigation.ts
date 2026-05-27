import { useEffect } from "react";
import type { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { isConfirmKey, isBackKey } from "@/core/menuNavigation";
import { useSessionStore } from "@/store/useGameStore";
import type { ScreenState } from "@/store/useGameStore";
import { screenConfigs, MenuContext } from "@/core/screenRoutes";
import type { AudioSettings } from "@/core/SettingsManager";

interface MenuCtxValues {
  navTo: (screen: ScreenState) => void;
  setMenuIndex: (index: number) => void;
  reloadSaveSlots: () => void;
  resetGameSession: () => void;
  handleSlotAction: (index: number, onPlay: () => void) => void;
  toggleCopyMode: () => void;
  toggleEraseMode: () => void;
  resetActions: () => void;
  audio: AudioSettings;
  handleVolumeChange: (field: keyof AudioSettings, value: number | boolean) => void;
  resetSettings: () => void;
}

export function useMenuKeyboardNavigation(
  menuCtxRef: React.MutableRefObject<MenuCtxValues>,
  setRebindTarget: (target: { action: Action; index: number } | null) => void,
  currentScreen: string,
  gameResult: string,
  rebindTarget: { action: Action; index: number } | null,
) {
  useEffect(() => {
    const cs = useSessionStore.getState();
    if ((cs.currentScreen === "PLAYING" && cs.gameResult === "PLAYING") || cs.currentScreen === "SOURCE_VIEW" || rebindTarget !== null)
      return;

    const handleMenuNavigation = (e: KeyboardEvent) => {
      const state = useSessionStore.getState();
      const ctx = menuCtxRef.current;
      const config = screenConfigs[state.currentScreen];
      if (!config) return;

      const context: MenuContext = {
        navTo: ctx.navTo,
        menuIndex: state.menuIndex,
        setMenuIndex: ctx.setMenuIndex,
        reloadSaveSlots: ctx.reloadSaveSlots,
        resetGameSession: ctx.resetGameSession,
        handleSlotAction: ctx.handleSlotAction,
        toggleCopyMode: ctx.toggleCopyMode,
        toggleEraseMode: ctx.toggleEraseMode,
        resetActions: ctx.resetActions,
        audio: ctx.audio,
        handleVolumeChange: ctx.handleVolumeChange,
        resetSettings: ctx.resetSettings,
        setRebindTarget,
        gameResult: state.gameResult,
      };

      const maxIndex = config.getMaxIndex(context);
      const isHorizontalEndScreen = state.currentScreen === "PLAYING" && state.gameResult !== "PLAYING";
      const isSoundSliderZone = state.currentScreen === "SOUND" && state.menuIndex < 3;

      const isMoveForward =
        e.key === "ArrowDown" ||
        e.code === "KeyS" ||
        (isHorizontalEndScreen && (e.key === "ArrowRight" || e.code === "KeyD")) ||
        (!isSoundSliderZone && !isHorizontalEndScreen && (e.key === "ArrowRight" || e.code === "KeyD"));

      const isMoveBackward =
        e.key === "ArrowUp" ||
        e.code === "KeyW" ||
        (isHorizontalEndScreen && (e.key === "ArrowLeft" || e.code === "KeyA")) ||
        (!isSoundSliderZone && !isHorizontalEndScreen && (e.key === "ArrowLeft" || e.code === "KeyA"));

      if (isMoveForward) {
        e.preventDefault();
        soundSynth.playSelectTick();
        ctx.setMenuIndex((state.menuIndex + 1) % (maxIndex + 1));
      } else if (isMoveBackward) {
        e.preventDefault();
        soundSynth.playSelectTick();
        ctx.setMenuIndex((state.menuIndex - 1 + (maxIndex + 1)) % (maxIndex + 1));
      } else if (isConfirmKey(e)) {
        e.preventDefault();
        config.onSelect(context);
      } else if (isBackKey(e)) {
        e.preventDefault();
        if (config.onBack) {
          config.onBack(context);
        }
      }

      if (
        isSoundSliderZone &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.code === "KeyA" || e.code === "KeyD")
      ) {
        if (config.onHorizontal) {
          e.preventDefault();
          const direction = e.key === "ArrowRight" || e.code === "KeyD" ? 1 : -1;
          config.onHorizontal(direction, context);
        }
      }
    };

    window.addEventListener("keydown", handleMenuNavigation);
    return () => {
      window.removeEventListener("keydown", handleMenuNavigation);
    };
  }, [currentScreen, rebindTarget, gameResult, menuCtxRef, setRebindTarget]);
}
