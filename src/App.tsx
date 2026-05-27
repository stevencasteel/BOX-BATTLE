import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { isConfirmKey, isBackKey } from "@/core/menuNavigation";
import { useSaveSlots } from "@/hooks/useSaveSlots";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useBootSequence, BootStage } from "@/hooks/useBootSequence";
import { useGameplayStore, useSessionStore } from "@/store/useGameStore";
import { useGameDialogue } from "@/hooks/useGameDialogue";
import { screenConfigs, MenuContext } from "@/core/screenRoutes";

import { TitleScreen } from "@/components/menus/TitleScreen";
import { SaveSelectScreen } from "@/components/menus/SaveSelectScreen";
import { SettingsScreen } from "@/components/menus/SettingsScreen";
import { AudioScreen } from "@/components/menus/AudioScreen";
import { ControlsScreen } from "@/components/menus/ControlsScreen";
import { CreditsScreen } from "@/components/menus/CreditsScreen";
const SourceViewScreen = lazy(() =>
  import("@/components/menus/SourceViewScreen").then((m) => ({ default: m.SourceViewScreen }))
);
import { GameArena } from "@/components/GameArena";
import { HudPanel } from "@/components/HudPanel";
import { DialogueConsole } from "@/components/DialogueConsole";
import { TouchOverlay } from "@/components/TouchOverlay";
import { ChromaticAberrationFilter } from "@/components/ChromaticAberrationFilter";
import { Cursor } from "@/components/cursor/Cursor";
import { useMusicLifecycle } from "@/hooks/useMusicLifecycle";
import { useFirstGesture } from "@/hooks/useFirstGesture";
import { useEngineSubscriptions } from "@/hooks/useEngineSubscriptions";
import { useRebindCapture } from "@/hooks/useRebindCapture";

import "./App.css";
import "./styles/neomorphism.css";
import "./components/GameArena.css";

export default function App() {
  const bootStage = useBootSequence();
  const viewportRef = useRef<HTMLDivElement>(null);

  const currentScreen = useSessionStore((state) => state.currentScreen);
  const transitionActive = useSessionStore((state) => state.transitionActive);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const retryCount = useSessionStore((state) => state.retryCount);

  const navTo = useSessionStore((state) => state.navTo);
  const setMenuIndex = useSessionStore((state) => state.setMenuIndex);
  const resetGameSession = useGameplayStore((state) => state.resetGameSession);

  const {
    slots,
    copySourceIndex,
    isCopyMode,
    isEraseMode,
    reloadSaveSlots,
    handleSlotAction,
    toggleCopyMode,
    toggleEraseMode,
    resetActions,
  } = useSaveSlots();

  const { audio, handleVolumeChange, resetSettings } = useAudioSettings();
  const { playerDialogue, bossDialogue, triggerDialogue, resetDialogues } = useGameDialogue();

  const [rebindTarget, setRebindTarget] = useState<{ action: Action; index: number } | null>(null);

  const [isTouchDevice] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(pointer: coarse)").matches;
    }
    return false;
  });

  const isFullHeightScreen = currentScreen === "SOURCE_VIEW";
  const isPlayingScreen = currentScreen === "PLAYING";

  useMusicLifecycle(isPlayingScreen);
  useFirstGesture(reloadSaveSlots);
  useEngineSubscriptions(viewportRef, triggerDialogue, resetDialogues);
  useRebindCapture(rebindTarget, setRebindTarget, reloadSaveSlots);

  const playHoverTick = () => {
    soundSynth.playSelectTick();
  };

  const menuCtxRef = useRef({
    navTo, setMenuIndex, reloadSaveSlots, resetGameSession,
    handleSlotAction, toggleCopyMode, toggleEraseMode, resetActions,
    audio, handleVolumeChange, resetSettings,
  });

  useEffect(() => {
    menuCtxRef.current = {
      navTo, setMenuIndex, reloadSaveSlots, resetGameSession,
      handleSlotAction, toggleCopyMode, toggleEraseMode, resetActions,
      audio, handleVolumeChange, resetSettings,
    };
  });

  useEffect(() => {
    if (!isPlayingScreen) {
      resetDialogues();
    }
  }, [isPlayingScreen, resetDialogues]);

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
  }, [currentScreen, rebindTarget]);

  if (bootStage === BootStage.NONE) {
    return (
      <div className="app-wrapper">
        <div className="cabinet-outer" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ color: "#718096", fontSize: "11px", letterSpacing: "0.2em" }}>BOOTING SYSTEM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <div
        className={`cabinet-outer ${isFullHeightScreen ? "cabinet-wide-source" : ""} ${isTouchDevice ? "cabinet-mobile" : ""}`}
      >
        {!isFullHeightScreen && (
          <HudPanel
            key={`${currentScreen}-${retryCount}`}
            isTouchDevice={isTouchDevice}
            isPlayingScreen={isPlayingScreen}
          />
        )}

        <div
          className={`game-viewport-container ${isPlayingScreen ? "viewport-playing" : "viewport-menu"} ${transitionActive === "SHUTDOWN" ? "crt-transition-active" : ""} ${transitionActive === "POWER_ON" ? "crt-power-on-active" : ""} ${isTouchDevice ? "viewport-mobile" : ""}`}
          ref={viewportRef}
        >
          {isPlayingScreen ? (
            <div className="w-full" style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
              <div style={{ flexGrow: 1, position: "relative", display: "flex", minHeight: 0 }}>
                <GameArena playHoverTick={playHoverTick} />
              </div>
            </div>
          ) : (
            <div className="screen-inner">
              {currentScreen === "TITLE" && (
                <TitleScreen
                  menuIndex={menuIndex}
                  onPlay={() => {
                    reloadSaveSlots();
                    navTo("SAVE_SELECT");
                  }}
                  onSettings={() => {
                    navTo("OPTIONS");
                  }}
                  onCredits={() => {
                    navTo("CREDITS");
                  }}
                  onSource={() => {
                    navTo("SOURCE_VIEW");
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                />
              )}

              {currentScreen === "SAVE_SELECT" && (
                <SaveSelectScreen
                  slots={slots}
                  menuIndex={menuIndex}
                  isCopyMode={isCopyMode}
                  copySourceIndex={copySourceIndex}
                  isEraseMode={isEraseMode}
                  handleSlotSelect={(idx) => handleSlotAction(idx, () => navTo("PLAYING"))}
                  toggleCopyMode={toggleCopyMode}
                  toggleEraseMode={toggleEraseMode}
                  onBack={() => {
                    resetActions();
                    navTo("TITLE");
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                />
              )}

              {currentScreen === "OPTIONS" && (
                <SettingsScreen
                  menuIndex={menuIndex}
                  onAudio={() => {
                    navTo("SOUND");
                  }}
                  onControls={() => {
                    navTo("CONTROLS");
                  }}
                  onBack={() => {
                    navTo("TITLE");
                    setMenuIndex(1);
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                />
              )}

              {currentScreen === "SOUND" && (
                <AudioScreen
                  audio={audio}
                  menuIndex={menuIndex}
                  handleVolumeChange={handleVolumeChange}
                  resetSettings={resetSettings}
                  onBack={() => {
                    navTo("OPTIONS");
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                />
              )}

              {currentScreen === "CONTROLS" && (
                <ControlsScreen
                  menuIndex={menuIndex}
                  rebindTarget={rebindTarget}
                  onBack={() => {
                    navTo("OPTIONS");
                    setMenuIndex(1);
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                  setRebindTarget={setRebindTarget}
                  reloadSaveSlots={reloadSaveSlots}
                />
              )}

              {currentScreen === "CREDITS" && (
                <CreditsScreen
                  onBack={() => {
                    navTo("TITLE");
                    setMenuIndex(2);
                  }}
                />
              )}

              {currentScreen === "SOURCE_VIEW" && (
                <Suspense
                  fallback={
                    <div
                      className="flex-col-center h-full w-full"
                      style={{ gap: "12px", background: "var(--void-bg)", justifyContent: "center" }}
                    >
                      <div
                        className="led-dot led-green"
                        style={{ width: "16px", height: "16px", animation: "crt-pulse 1s infinite alternate" }}
                      />
                      <span
                        style={{
                          color: "#718096",
                          fontSize: "11px",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                        }}
                      >
                        COMPILING SOURCE ARCHIVE...
                      </span>
                    </div>
                  }
                >
                  <SourceViewScreen
                    onBack={() => {
                      navTo("TITLE");
                      setMenuIndex(3);
                    }}
                  />
                </Suspense>
              )}
            </div>
          )}
        </div>

        {!isFullHeightScreen && (
          <DialogueConsole playerDialogue={playerDialogue} bossDialogue={bossDialogue} isTouchDevice={isTouchDevice} />
        )}

        {isPlayingScreen && isTouchDevice && <TouchOverlay />}
      </div>

      <ChromaticAberrationFilter />
      <Cursor />
    </div>
  );
}
