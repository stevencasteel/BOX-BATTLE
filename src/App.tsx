import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { useSaveSlots } from "@/hooks/useSaveSlots";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useBootSequence, BootStage } from "@/hooks/useBootSequence";
import { useGameplayStore, useSessionStore, SCREEN_DEPTHS } from "@/store/useGameStore";
import { useGameDialogue } from "@/hooks/useGameDialogue";
import { useMenuKeyboardNavigation } from "@/hooks/useMenuKeyboardNavigation";

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
  const gameResult = useSessionStore((state) => state.gameResult);
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

  const prevScreenRef = useRef(currentScreen);
  useEffect(() => {
    const prev = prevScreenRef.current;
    if (prev !== currentScreen) {
      if (soundSynth.initialized) {
        const currentDepth = SCREEN_DEPTHS[prev] ?? 0;
        const targetDepth = SCREEN_DEPTHS[currentScreen] ?? 0;
        if (targetDepth < currentDepth) {
          soundSynth.playMenuBack();
        } else {
          soundSynth.playMenuConfirm();
        }
      }
      prevScreenRef.current = currentScreen;
    }
  }, [currentScreen]);

  useEffect(() => {
    if (!isPlayingScreen) {
      resetDialogues();
    }
  }, [isPlayingScreen, resetDialogues]);

  useMenuKeyboardNavigation(menuCtxRef, setRebindTarget, currentScreen, gameResult, rebindTarget);

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
          <div style={{ position: "relative", flexGrow: 1, display: "flex", minHeight: 0 }}>
            <GameArena playHoverTick={playHoverTick} />

            {!isPlayingScreen && (
              <div className="screen-inner" style={{ position: "absolute", inset: 0, zIndex: 10 }}>
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
