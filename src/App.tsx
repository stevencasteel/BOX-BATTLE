import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";
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
import { useHudSubscription } from "@/hooks/useHudSubscription";
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

  useHudSubscription();

  const currentScreen = useSessionStore((state) => state.currentScreen);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const gameResult = useSessionStore((state) => state.gameResult);

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

  useEffect(() => {
    if (!isPlayingScreen) {
      resetDialogues();
    }
  }, [isPlayingScreen, resetDialogues]);

  useEffect(() => {
    if ((isPlayingScreen && gameResult === "PLAYING") || currentScreen === "SOURCE_VIEW" || rebindTarget !== null)
      return;

    const handleMenuNavigation = (e: KeyboardEvent) => {
      const config = screenConfigs[currentScreen];
      if (!config) return;

      const context: MenuContext = {
        navTo,
        menuIndex,
        setMenuIndex,
        reloadSaveSlots,
        resetGameSession,
        handleSlotAction,
        toggleCopyMode,
        toggleEraseMode,
        resetActions,
        audio,
        handleVolumeChange,
        resetSettings,
        setRebindTarget,
        gameResult,
      };

      const maxIndex = config.getMaxIndex(context);
      const isHorizontalEndScreen = isPlayingScreen && gameResult !== "PLAYING";

      const keyMap = settingsManager.getKeyMap();
      const jumpKeys = keyMap["JUMP"] || [];
      const attackKeys = keyMap["ATTACK"] || [];
      const dashKeys = keyMap["DASH"] || [];

      const isConfirmKey =
        e.key === "Enter" ||
        e.key === " " ||
        e.code === "Space" ||
        jumpKeys.includes(e.code) ||
        jumpKeys.includes(e.key);

      const isBackKey =
        e.key === "Escape" ||
        e.key === "Backspace" ||
        attackKeys.includes(e.code) ||
        attackKeys.includes(e.key) ||
        dashKeys.includes(e.code) ||
        dashKeys.includes(e.key);

      const isSoundSliderZone = currentScreen === "SOUND" && menuIndex < 3;

      const isMoveForward =
        e.key === "ArrowDown" ||
        e.key === "KeyS" ||
        (isHorizontalEndScreen && (e.key === "ArrowRight" || e.key === "KeyD")) ||
        (!isSoundSliderZone && !isHorizontalEndScreen && (e.key === "ArrowRight" || e.key === "KeyD"));

      const isMoveBackward =
        e.key === "ArrowUp" ||
        e.key === "KeyW" ||
        (isHorizontalEndScreen && (e.key === "ArrowLeft" || e.key === "KeyA")) ||
        (!isSoundSliderZone && !isHorizontalEndScreen && (e.key === "ArrowLeft" || e.key === "KeyA"));

      if (isMoveForward) {
        e.preventDefault();
        soundSynth.playSelectTick();
        setMenuIndex((menuIndex + 1) % (maxIndex + 1));
      } else if (isMoveBackward) {
        e.preventDefault();
        soundSynth.playSelectTick();
        setMenuIndex((menuIndex - 1 + (maxIndex + 1)) % (maxIndex + 1));
      } else if (isConfirmKey) {
        e.preventDefault();
        config.onSelect(context);
      } else if (isBackKey) {
        e.preventDefault();
        if (config.onBack) {
          config.onBack(context);
        }
      }

      if (
        isSoundSliderZone &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "KeyA" || e.key === "KeyD")
      ) {
        if (config.onHorizontal) {
          e.preventDefault();
          const direction = e.key === "ArrowRight" || e.key === "KeyD" ? 1 : -1;
          config.onHorizontal(direction, context);
        }
      }
    };

    window.addEventListener("keydown", handleMenuNavigation);
    return () => {
      window.removeEventListener("keydown", handleMenuNavigation);
    };
  }, [
    currentScreen,
    menuIndex,
    audio,
    isCopyMode,
    isEraseMode,
    copySourceIndex,
    slots,
    rebindTarget,
    gameResult,
    isPlayingScreen,
  ]);

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
        className={`cabinet-outer ${isFullHeightScreen ? "cabinet-wide-source" : ""}`}
        style={
          isTouchDevice
            ? {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "10px",
                height: "100vh",
              }
            : undefined
        }
      >
        {!isFullHeightScreen && <HudPanel isTouchDevice={isTouchDevice} isPlayingScreen={isPlayingScreen} />}

        <div
          className={`game-viewport-container ${isPlayingScreen ? "viewport-playing" : "viewport-menu"}`}
          ref={viewportRef}
          style={
            isTouchDevice
              ? isPlayingScreen
                ? {
                    flexGrow: 0,
                    flexShrink: 0,
                    width: "100%",
                    aspectRatio: "1/1",
                    maxHeight: "calc(100vh - 250px)",
                    height: "auto",
                  }
                : {
                    flexGrow: 1,
                    width: "100%",
                    height: "0px",
                    aspectRatio: "auto",
                  }
              : undefined
          }
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
          <DialogueConsole
            playerDialogue={playerDialogue}
            bossDialogue={bossDialogue}
            isTouchDevice={isTouchDevice}
          />
        )}

        {isPlayingScreen && isTouchDevice && <TouchOverlay />}
      </div>

      <ChromaticAberrationFilter />
    </div>
  );
}
