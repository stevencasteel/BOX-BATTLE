import { useEffect, useRef, useState } from "react";
import { Action } from "@/core/InputProvider";
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

  const { audio, handleVolumeChange } = useAudioSettings();
  const { playerDialogue, bossDialogue, triggerDialogue, resetDialogues } = useGameDialogue();

  const [rebindTarget, setRebindTarget] = useState<{ action: Action; index: number } | null>(null);

  const isFullHeightScreen = currentScreen === "SOURCE_VIEW";

  useEffect(() => {
    soundSynth.setCabinetMuffle(currentScreen !== "PLAYING");
  }, [currentScreen]);

  const playHoverTick = () => {
    soundSynth.playSelectTick();
  };

  useEffect(() => {
    soundSynth.startMusic();
    reloadSaveSlots();
    return () => {
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
    if ((currentScreen === "PLAYING" && gameResult === "PLAYING") || currentScreen === "SOURCE_VIEW" || rebindTarget !== null) return;

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
        setRebindTarget,
        gameResult
      };

      const maxIndex = config.getMaxIndex(context);
      const isHorizontalEndScreen = currentScreen === "PLAYING" && gameResult !== "PLAYING";

      if (e.key === "ArrowDown" || e.key === "KeyS" || (isHorizontalEndScreen && (e.key === "ArrowRight" || e.key === "KeyD"))) {
        e.preventDefault();
        soundSynth.playSelectTick();
        setMenuIndex((menuIndex + 1) % (maxIndex + 1));
      } else if (e.key === "ArrowUp" || e.key === "KeyW" || (isHorizontalEndScreen && (e.key === "ArrowLeft" || e.key === "KeyA"))) {
        e.preventDefault();
        soundSynth.playSelectTick();
        setMenuIndex((menuIndex - 1 + (maxIndex + 1)) % (maxIndex + 1));
      } else if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault();
        config.onSelect(context);
      } else if (e.key === "Escape" || e.key === "Backspace") {
        e.preventDefault();
        if (config.onBack) {
          soundSynth.playErrorTick();
          config.onBack(context);
        }
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (config.onHorizontal) {
          e.preventDefault();
          const direction = e.key === "ArrowRight" ? 1 : -1;
          config.onHorizontal(direction, context);
        }
      }
    };

    window.addEventListener("keydown", handleMenuNavigation);
    return () => {
      window.removeEventListener("keydown", handleMenuNavigation);
    };
  }, [currentScreen, menuIndex, audio, isCopyMode, isEraseMode, copySourceIndex, slots, rebindTarget, gameResult]);

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
        className="cabinet-outer"
        style={isFullHeightScreen ? {
          width: "96vw",
          height: "95vh",
          maxWidth: "1600px",
          maxHeight: "1080px"
        } : undefined}
      >

        {/* 1. HUD Panel - hidden in full-height screens */}
        {!isFullHeightScreen && (
          <div className="cabinet-status-panel neo-pressed">
            <div className="hud-panel-block" style={{ gap: "4px" }}>
              <span className="hud-panel-title">PLAYER HP</span>
              <div className="flex-row" style={{ gap: "6px", alignItems: "center" }}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`led-dot ${currentScreen === "PLAYING" && i < playerHP ? "led-green" : ""}`}
                    style={{
                      background: currentScreen === "PLAYING" && i < playerHP ? "" : "#07080b",
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
                      className={`led-dot ${currentScreen === "PLAYING" && i < healingCharges ? "led-yellow" : ""}`}
                      style={{
                        background: currentScreen === "PLAYING" && i < healingCharges ? "" : "#07080b",
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
                    width: currentScreen === "PLAYING" ? `${(determination / 5) * 100}%` : "0%",
                    transition: "width 0.15s ease",
                    background: "hsl(280, 80%, 65%)",
                    boxShadow: "0 0 4px rgba(168, 85, 247, 0.8)"
                  }} />
                </div>
              </div>
            </div>

            <div className="hud-panel-block" style={{ alignItems: "center", justifyContent: "center" }}>
              {currentScreen === "PLAYING" ? (
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
                  className={currentScreen === "PLAYING" ? "led-red" : ""}
                  style={{
                    height: "100%",
                    borderRadius: "2px",
                    width: currentScreen === "PLAYING" ? `${(bossHP / 30) * 100}%` : "0%",
                    transition: "all 0.15s ease",
                    background: currentScreen === "PLAYING" ? "" : "#07080b"
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Main Viewport Container */}
        <div className="game-viewport-container" ref={viewportRef}>
          {currentScreen === "PLAYING" ? (
            <div className="w-full h-full" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ flexGrow: 1, position: "relative", display: "flex" }}>
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

        {/* 3. Dialogue Console - hidden in full-height screens */}
        {!isFullHeightScreen && (
          <div className="dialogue-console">
            <div className={`dialogue-box-left neo-pressed ${playerDialogue.active ? "dialogue-active-green" : "dialogue-inactive"}`}>
              <div className={`portrait-square led-green ${playerDialogue.isTyping ? "portrait-rumble" : ""}`} style={{ background: playerDialogue.active ? "" : "#07080b" }} />
              <div className="dialogue-text-container">
                <div className="dialogue-speaker-label">PLAYER</div>
                <div className="dialogue-body-text">{playerDialogue.active ? playerDialogue.displayed : "[ NO SIGNAL ]"}</div>
              </div>
            </div>

            <div className={`dialogue-box-right neo-pressed ${bossDialogue.active ? "dialogue-active-red" : "dialogue-inactive"}`}>
              <div className="dialogue-text-container" style={{ textAlign: "right" }}>
                <div className="dialogue-speaker-label" style={{ color: "var(--signal-red)" }}>BOSS</div>
                <div className="dialogue-body-text">{bossDialogue.active ? bossDialogue.displayed : "[ NO SIGNAL ]"}</div>
              </div>
              <div className={`portrait-square led-red ${bossDialogue.isTyping ? "portrait-rumble" : ""}`} style={{ background: bossDialogue.active ? "" : "#07080b" }} />
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
