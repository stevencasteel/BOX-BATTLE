import { useEffect, useRef, useState } from "react";
import { Action, inputProvider } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";
import { useSaveSlots } from "@/hooks/useSaveSlots";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useBootSequence, BootStage } from "@/hooks/useBootSequence";
import { useGameplayStore, useSessionStore } from "@/store/useGameStore";
import { useGameDialogue } from "@/hooks/useGameDialogue";
import { eventBroker } from "@/core/eventBroker";
import { screenConfigs, MenuContext } from "@/core/screenRoutes";

import { TitleScreen } from "@/components/menus/TitleScreen";
import { SaveSelectScreen } from "@/components/menus/SaveSelectScreen";
import { SettingsScreen } from "@/components/menus/SettingsScreen";
import { AudioScreen } from "@/components/menus/AudioScreen";
import { ControlsScreen } from "@/components/menus/ControlsScreen";
import { CreditsScreen } from "@/components/menus/CreditsScreen";
import { SourceViewScreen } from "@/components/menus/SourceViewScreen";
import { GameArena } from "@/components/GameArena";

import "./App.css";

const TouchButton = ({ action, label, style }: { action: Action; label: string; style?: React.CSSProperties }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const handleStart = (e: TouchEvent) => {
      e.preventDefault();
      inputProvider.triggerTouchStart(action);
    };

    const handleEnd = (e: TouchEvent) => {
      e.preventDefault();
      inputProvider.triggerTouchEnd(action);
    };

    el.addEventListener("touchstart", handleStart, { passive: false });
    el.addEventListener("touchend", handleEnd, { passive: false });
    el.addEventListener("touchcancel", handleEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", handleStart);
      el.removeEventListener("touchend", handleEnd);
      el.removeEventListener("touchcancel", handleEnd);
    };
  }, [action]);

  return (
    <button
      ref={buttonRef}
      onMouseDown={(e) => { e.preventDefault(); inputProvider.triggerTouchStart(action); }}
      onMouseUp={(e) => { e.preventDefault(); inputProvider.triggerTouchEnd(action); }}
      onMouseLeave={(e) => { e.preventDefault(); inputProvider.triggerTouchEnd(action); }}
      className="neo-btn"
      style={{
        ...style,
        userSelect: "none",
        touchAction: "none",
        padding: "0",
        borderRadius: "12px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.6)"
      }}
    >
      {label}
    </button>
  );
};

export default function App() {
  const bootStage = useBootSequence();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const currentScreen = useSessionStore((state) => state.currentScreen);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const gameResult = useSessionStore((state) => state.gameResult);
  const retryCount = useSessionStore((state) => state.retryCount);

  const navTo = useSessionStore((state) => state.navTo);
  const setMenuIndex = useSessionStore((state) => state.setMenuIndex);
  const resetGameSession = useGameplayStore((state) => state.resetGameSession);

  const playerHP = useGameplayStore((state) => state.playerHP);
  const bossHP = useGameplayStore((state) => state.bossHP);
  const healingCharges = useGameplayStore((state) => state.healingCharges);
  const determination = useGameplayStore((state) => state.determination);

  const setPlayerHP = useGameplayStore((state) => state.setPlayerHP);
  const setBossHP = useGameplayStore((state) => state.setBossHP);
  const setHealingCharges = useGameplayStore((state) => state.setHealingCharges);
  const setDetermination = useGameplayStore((state) => state.setDetermination);

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

  useEffect(() => {
    if (isPlayingScreen) {
      soundSynth.stopMusic();
    } else {
      soundSynth.setCabinetMuffle(true);
      if (soundSynth.hasUserGestured) {
        soundSynth.startMusic();
      }
    }
  }, [isPlayingScreen, currentScreen]);

  const playHoverTick = () => {
    soundSynth.playSelectTick();
  };

  useEffect(() => {
    const triggerOnFirstGesture = () => {
      soundSynth.startMusic();
      window.removeEventListener("click", triggerOnFirstGesture);
      window.removeEventListener("touchend", triggerOnFirstGesture);
    };

    window.addEventListener("click", triggerOnFirstGesture);
    window.addEventListener("touchend", triggerOnFirstGesture);

    reloadSaveSlots();

    return () => {
      window.removeEventListener("click", triggerOnFirstGesture);
      window.removeEventListener("touchend", triggerOnFirstGesture);
      soundSynth.stopMusic();
    };
  }, []);

  useEffect(() => {
    const unsubGameplay = useGameplayStore.subscribe((state) => {
      const viewport = viewportRef.current;
      if (viewport) {
        if (state.isGlitching) {
          viewport.classList.add("filter-chromatic");
        } else {
          viewport.classList.remove("filter-chromatic");
        }
      }
    });

    const unsubs = [
      eventBroker.subscribe("PLAYER_HURT", ({ currentHealth }) => {
        setPlayerHP(currentHealth);
      }),
      eventBroker.subscribe("PLAYER_HEALED", ({ currentHealth }) => {
        setPlayerHP(currentHealth);
      }),
      eventBroker.subscribe("BOSS_HURT", ({ currentHealth }) => {
        setBossHP(currentHealth);
      }),
      eventBroker.subscribe("HEALING_CHARGES_CHANGED", ({ charges }) => {
        setHealingCharges(charges);
      }),
      eventBroker.subscribe("DETERMINATION_CHANGED", ({ determination: detValue }) => {
        setDetermination(detValue);
      }),
      eventBroker.subscribe("DIALOGUE_TRIGGERED", ({ speaker, text }) => {
        triggerDialogue(speaker, text);
      }),
      eventBroker.subscribe("CLEAR_DIALOGUES", () => {
        resetDialogues();
      })
    ];

    return () => {
      unsubGameplay();
      unsubs.forEach((unsub) => unsub());
    };
  }, [
    triggerDialogue, 
    resetDialogues, 
    setPlayerHP, 
    setBossHP, 
    setHealingCharges, 
    setDetermination
  ]);

  useEffect(() => {
    if (gameResult !== "PLAYING") {
      resetDialogues();
    }
  }, [gameResult, resetDialogues]);

  useEffect(() => {
    if (!rebindTarget) return;
    const handleRebindCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      soundSynth.playHitConfirm();
      settingsManager.remapKey(rebindTarget.action, rebindTarget.index, e.code);
      setRebindTarget(null);
      reloadSaveSlots();
    };
    window.addEventListener("keydown", handleRebindCapture);
    return () => {
      window.removeEventListener("keydown", handleRebindCapture);
    };
  }, [rebindTarget]);

  useEffect(() => {
    if ((isPlayingScreen && gameResult === "PLAYING") || currentScreen === "SOURCE_VIEW" || rebindTarget !== null) return;

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
        gameResult
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
          soundSynth.playErrorTick();
          config.onBack(context);
        }
      }

      if (isSoundSliderZone && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "KeyA" || e.key === "KeyD")) {
        if (config.onHorizontal) {
          e.preventDefault();
          const direction = (e.key === "ArrowRight" || e.key === "KeyD") ? 1 : -1;
          config.onHorizontal(direction, context);
        }
      }
    };

    window.addEventListener("keydown", handleMenuNavigation);
    return () => {
      window.removeEventListener("keydown", handleMenuNavigation);
    };
  }, [currentScreen, menuIndex, audio, isCopyMode, isEraseMode, copySourceIndex, slots, rebindTarget, gameResult, isPlayingScreen]);

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
      <div className={`cabinet-outer ${isFullHeightScreen ? "cabinet-full-height" : ""}`} style={isTouchDevice ? {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "10px",
        height: "100vh"
      } : undefined}>

        {!isFullHeightScreen && (
          isTouchDevice ? (
            <div className="cabinet-status-panel neo-pressed" style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 12px",
              height: "36px",
              marginBottom: "4px",
              boxSizing: "border-box",
              flexShrink: 0,
              borderRadius: "8px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "10px", color: "var(--signal-green)", fontWeight: "bold" }}>HP</span>
                <div className="flex-row" style={{ gap: "3px" }}>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`led-dot ${isPlayingScreen && i < playerHP ? "led-green" : ""}`}
                      style={{
                        width: "8px",
                        height: "8px",
                        background: isPlayingScreen && i < playerHP ? "" : "#07080b",
                        border: "1px solid rgba(0,0,0,0.5)"
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "2px", marginLeft: "2px" }}>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`led-dot ${isPlayingScreen && i < healingCharges ? "led-yellow" : ""}`}
                      style={{
                        width: "4px",
                        height: "4px",
                        background: isPlayingScreen && i < healingCharges ? "" : "#07080b"
                      }}
                    />
                  ))}
                </div>
                <div className="neo-pressed" style={{
                  width: "36px",
                  height: "6px",
                  borderRadius: "3px",
                  padding: "1px",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  background: "#07080b",
                  marginLeft: "4px",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <div style={{
                    height: "100%",
                    borderRadius: "1.5px",
                    width: isPlayingScreen ? `${(determination / 5) * 100}%` : "0%",
                    transition: "width 0.15s ease",
                    background: "hsl(280, 80%, 65%)",
                    boxShadow: "0 0 4px rgba(168, 85, 247, 0.8)"
                  }} />
                </div>
              </div>
              <span style={{ fontSize: "9px", color: "#718096", fontWeight: "bold", letterSpacing: "0.1em" }}>BOX BATTLE</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px", color: "var(--signal-red)", fontWeight: "bold" }}>BOSS</span>
                <div className="neo-pressed" style={{ width: "80px", height: "8px", borderRadius: "3px", padding: "1px", boxSizing: "border-box", overflow: "hidden" }}>
                  <div
                    className="led-red"
                    style={{
                      height: "100%",
                      borderRadius: "1.5px",
                      width: isPlayingScreen ? `${(bossHP / 30) * 100}%` : "0%",
                      transition: "all 0.15s ease"
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="cabinet-status-panel neo-pressed">
              <div className="hud-panel-block" style={{ gap: "4px" }}>
                <span className="hud-panel-title">PLAYER HP</span>
                <div className="flex-row" style={{ gap: "6px", alignItems: "center" }}>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`led-dot ${isPlayingScreen && i < playerHP ? "led-green" : ""}`}
                      style={{
                        background: isPlayingScreen && i < playerHP ? "" : "#07080b",
                        border: "1px solid rgba(0,0,0,0.5)"
                      }}
                    />
                  ))}
                </div>

                <div className="flex-row" style={{ gap: "12px", marginTop: "6px", alignItems: "center" }}>
                  <div className="flex-row" style={{ gap: "4px" }}>
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`led-dot ${isPlayingScreen && i < healingCharges ? "led-yellow" : ""}`}
                        style={{
                          background: isPlayingScreen && i < healingCharges ? "" : "#07080b",
                          border: "1px solid rgba(0,0,0,0.5)",
                          width: "6px",
                          height: "6px"
                        }}
                      />
                    ))}
                  </div>
                  <div className="neo-pressed" style={{
                    width: "54px",
                    height: "6px",
                    borderRadius: "3px",
                    padding: "1px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    background: "#07080b"
                  }}>
                    <div style={{
                      height: "100%",
                      borderRadius: "2px",
                      width: isPlayingScreen ? `${(determination / 5) * 100}%` : "0%",
                      transition: "width 0.15s ease",
                      background: "hsl(280, 80%, 65%)",
                      boxShadow: "0 0 4px rgba(168, 85, 247, 0.8)"
                    }} />
                  </div>
                </div>
              </div>

              <div className="hud-panel-block" style={{ alignItems: "center", justifyContent: "center" }}>
                {isPlayingScreen ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    border: "1px solid rgba(255, 255, 255, 0.03)",
                    background: "rgba(7, 8, 11, 0.85)",
                    padding: "8px 22px",
                    borderRadius: "8px",
                    boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.01), 0 4px 12px rgba(0, 0, 0, 0.75)"
                  }}>
                    <div style={{ width: "6px", height: "6px", background: "rgba(34, 197, 94, 0.45)", boxShadow: "0 0 6px rgba(34, 197, 94, 0.35)" }} />
                    <span style={{
                      fontSize: "16px",
                      color: "rgba(34, 197, 94, 0.8)",
                      fontWeight: 900,
                      letterSpacing: "0.3em",
                      textShadow: "0 0 8px rgba(34, 197, 94, 0.35)",
                      textTransform: "uppercase",
                      lineHeight: "1"
                    }}>
                      BOX BATTLE
                    </span>
                    <div style={{ width: "6px", height: "6px", background: "rgba(34, 197, 94, 0.45)", boxShadow: "0 0 6px rgba(34, 197, 94, 0.35)" }} />
                  </div>
                ) : null}
              </div>

              <div className="hud-panel-block" style={{ alignItems: "flex-end" }}>
                <span className="hud-panel-title hud-panel-title-red">BOSS HP</span>
                <div className="neo-pressed" style={{ width: "160px", height: "10px", borderRadius: "4px", padding: "1px", boxSizing: "border-box", overflow: "hidden" }}>
                  <div
                    className={isPlayingScreen ? "led-red" : ""}
                    style={{
                      height: "100%",
                      borderRadius: "2px",
                      width: isPlayingScreen ? `${(bossHP / 30) * 100}%` : "0%",
                      transition: "all 0.15s ease",
                      background: isPlayingScreen ? "" : "#07080b"
                    }}
                  />
                </div>
              </div>
            </div>
          )
        )}

        <div className="game-viewport-container" ref={viewportRef} style={isTouchDevice ? (isPlayingScreen ? {
          flexGrow: 0,
          flexShrink: 0,
          width: "100%",
          aspectRatio: "1/1",
          maxHeight: "calc(100vh - 250px)",
          height: "auto"
        } : {
          flexGrow: 1,
          width: "100%",
          height: "100%"
        }) : undefined}>
          {isPlayingScreen ? (
            <div className="w-full" style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
              <div style={{ flexGrow: 1, position: "relative", display: "flex", minHeight: 0 }}>
                <GameArena
                  key={retryCount}
                  canvasRef={canvasRef}
                  triggerDialogue={() => {}}
                  playHoverTick={playHoverTick}
                />
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
                <SourceViewScreen
                  onBack={() => {
                    navTo("TITLE");
                    setMenuIndex(3);
                  }}
                />
              )}
            </div>
          )}
        </div>

        {!isFullHeightScreen && (
          <div className="dialogue-console" style={isTouchDevice ? {
            height: "54px",
            marginTop: "0px",
            gap: "4px",
            padding: "0",
            flexShrink: 0
          } : undefined}>
            <div className={`dialogue-box-left neo-pressed ${playerDialogue.active ? "dialogue-active-green" : "dialogue-inactive"}`} style={isTouchDevice ? {
              padding: "4px 8px",
              gap: "8px",
              borderRadius: "6px",
              height: "100%"
            } : undefined}>
              <div className={`portrait-square led-green ${playerDialogue.isTyping ? "portrait-rumble" : ""}`} style={{
                background: playerDialogue.active ? "" : "#07080b",
                width: isTouchDevice ? "32px" : "64px",
                height: isTouchDevice ? "32px" : "64px"
              }} />
              <div className="dialogue-text-container">
                <div className="dialogue-speaker-label" style={isTouchDevice ? { fontSize: "10px" } : undefined}>PLAYER</div>
                <div className="dialogue-body-text" style={isTouchDevice ? { fontSize: "10px", lineHeight: "1.2" } : undefined}>{playerDialogue.active ? playerDialogue.displayed : "[ NO SIGNAL ]"}</div>
              </div>
            </div>

            <div className={`dialogue-box-right neo-pressed ${bossDialogue.active ? "dialogue-active-red" : "dialogue-inactive"}`} style={isTouchDevice ? {
              padding: "4px 8px",
              gap: "8px",
              borderRadius: "6px",
              height: "100%"
            } : undefined}>
              <div className="dialogue-text-container" style={{ textAlign: "right" }}>
                <div className="dialogue-speaker-label" style={isTouchDevice ? { fontSize: "10px", color: "var(--signal-red)" } : { color: "var(--signal-red)" }}>BOSS</div>
                <div className="dialogue-body-text" style={isTouchDevice ? { fontSize: "10px", lineHeight: "1.2" } : undefined}>{bossDialogue.active ? bossDialogue.displayed : "[ NO SIGNAL ]"}</div>
              </div>
              <div className={`portrait-square led-red ${bossDialogue.isTyping ? "portrait-rumble" : ""}`} style={{
                background: bossDialogue.active ? "" : "#07080b",
                width: isTouchDevice ? "32px" : "64px",
                height: isTouchDevice ? "32px" : "64px"
              }} />
            </div>
          </div>
        )}

        {/* Custom Ergonomic Touch Overlay for Mobile Game Arena Controls */}
        {isPlayingScreen && isTouchDevice && (
          <div style={{
            display: "flex",
            width: "100%",
            gap: "8px",
            background: "#0c0e12",
            boxSizing: "border-box",
            flexGrow: 1,
            height: "0px",
            paddingTop: "6px"
          }}>
            {/* Left Hand: Movement Panel (flex: 1.3) */}
            <div style={{
              flex: 1.3,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "6px",
              height: "100%"
            }}>
              <TouchButton action="MOVE_LEFT" label="◀" style={{ height: "100%", fontSize: "24px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", height: "100%" }}>
                <TouchButton action="MOVE_UP" label="▲" style={{ flex: 1, fontSize: "20px" }} />
                <TouchButton action="MOVE_DOWN" label="▼" style={{ flex: 1, fontSize: "20px" }} />
              </div>
              <TouchButton action="MOVE_RIGHT" label="▶" style={{ height: "100%", fontSize: "24px" }} />
            </div>

            {/* Right Hand: Action Panel (flex: 1) */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              height: "100%"
            }}>
              <TouchButton action="DASH" label="DASH" style={{ flex: 1, fontSize: "14px", borderColor: "var(--signal-yellow)", color: "var(--signal-yellow)" }} />
              <div style={{ display: "flex", gap: "6px", flex: 1.2 }}>
                <TouchButton action="ATTACK" label="ATK" style={{ flex: 1, fontSize: "14px", borderColor: "var(--signal-red)", color: "var(--signal-red)" }} />
                <TouchButton action="JUMP" label="JMP" style={{ flex: 1, fontSize: "14px", borderColor: "var(--signal-green)", color: "var(--signal-green)" }} />
              </div>
            </div>
          </div>
        )}

      </div>

      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
        <defs>
          <filter id="chromatic-aberration">
            <feOffset dx="6" dy="0" in="SourceGraphic" result="red" />
            <feOffset dx="-6" dy="0" in="SourceGraphic" result="blue" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" in="red" result="red-only" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" in="SourceGraphic" result="green-only" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" in="blue" result="blue-only" />
            <feBlend mode="screen" in="red-only" in2="green-only" result="rg" />
            <feBlend mode="screen" in="rg" in2="blue-only" />
          </filter>
        </defs>
      </svg>

    </div>
  );
}
