import { useEffect, useRef, useState } from "react";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";
import { useSaveSlots } from "@/hooks/useSaveSlots";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useGameDialogue } from "@/hooks/useGameDialogue";
import { useGameStore } from "@/store/useGameStore";
import { eventBroker } from "@/core/EventBroker";

import { TitleScreen } from "@/components/menus/TitleScreen";
import { SaveSelectScreen } from "@/components/menus/SaveSelectScreen";
import { SettingsScreen } from "@/components/menus/SettingsScreen";
import { AudioScreen } from "@/components/menus/AudioScreen";
import { ControlsScreen } from "@/components/menus/ControlsScreen";
import { CreditsScreen } from "@/components/menus/CreditsScreen";
import { GameArena } from "@/components/GameArena";

import "./App.css";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentScreen = useGameStore((state) => state.currentScreen);
  const menuIndex = useGameStore((state) => state.menuIndex);
  const playerHP = useGameStore((state) => state.playerHP);
  const bossHP = useGameStore((state) => state.bossHP);
  const gameResult = useGameStore((state) => state.gameResult);
  const retryCount = useGameStore((state) => state.retryCount);
  const isGlitching = useGameStore((state) => state.isGlitching);
  const healingCharges = useGameStore((state) => state.healingCharges);
  const determination = useGameStore((state) => state.determination);

  const navTo = useGameStore((state) => state.navTo);
  const setMenuIndex = useGameStore((state) => state.setMenuIndex);
  const resetGameSession = useGameStore((state) => state.resetGameSession);

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
  const { playerDialogue, bossDialogue, triggerDialogue } = useGameDialogue();

  const [rebindTarget, setRebindTarget] = useState<{ action: Action; index: number } | null>(null);

  const playHoverTick = () => {
    soundSynth.playSelectTick();
  };

  useEffect(() => {
    soundSynth.startMusic();
    reloadSaveSlots();

    const unsubs = [
      eventBroker.subscribe("PLAYER_HURT", ({ currentHealth }) => {
        useGameStore.getState().setPlayerHP(currentHealth);
      }),
      eventBroker.subscribe("PLAYER_HEALED", ({ currentHealth }) => {
        useGameStore.getState().setPlayerHP(currentHealth);
      }),
      eventBroker.subscribe("BOSS_HURT", ({ currentHealth }) => {
        useGameStore.getState().setBossHP(currentHealth);
      }),
      eventBroker.subscribe("HEALING_CHARGES_CHANGED", ({ charges }) => {
        useGameStore.getState().setHealingCharges(charges);
      }),
      eventBroker.subscribe("DETERMINATION_CHANGED", ({ determination: dValue }) => {
        useGameStore.getState().setDetermination(dValue);
      })
    ];

    return () => {
      soundSynth.stopMusic();
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  useEffect(() => {
    if ((currentScreen === "PLAYING" && gameResult === "PLAYING") || rebindTarget !== null) return;

    const handleMenuNavigation = (e: KeyboardEvent) => {
      let maxIndex = 0;

      if (currentScreen === "PLAYING" && gameResult !== "PLAYING") maxIndex = 1;
      else if (currentScreen === "TITLE") maxIndex = 2;
      else if (currentScreen === "SAVE_SELECT") maxIndex = 5;
      else if (currentScreen === "OPTIONS") maxIndex = 2;
      else if (currentScreen === "SOUND") maxIndex = 3;
      else if (currentScreen === "CONTROLS") maxIndex = 7;
      else if (currentScreen === "CREDITS") maxIndex = 0;

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
        triggerMenuSelection();
      } else if (e.key === "Escape" || e.key === "Backspace") {
        e.preventDefault();
        triggerBackNavigation();
      }

      if (currentScreen === "SOUND" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        const direction = e.key === "ArrowRight" ? 0.05 : -0.05;
        if (menuIndex === 0 && !audio.masterMuted) {
          handleVolumeChange("masterVolume", Math.max(0, Math.min(1, audio.masterVolume + direction)));
          soundSynth.playSelectTick();
        } else if (menuIndex === 1 && !audio.sfxMuted) {
          handleVolumeChange("sfxVolume", Math.max(0, Math.min(1, audio.sfxVolume + direction)));
          soundSynth.playSelectTick();
        } else if (menuIndex === 2 && !audio.musicMuted) {
          handleVolumeChange("musicVolume", Math.max(0, Math.min(1, audio.musicVolume + direction)));
          soundSynth.playSelectTick();
        }
      }
    };

    const triggerMenuSelection = () => {
      if (currentScreen === "PLAYING" && gameResult !== "PLAYING") {
        if (menuIndex === 0) {
          resetGameSession();
          navTo("PLAYING");
        } else {
          navTo("TITLE");
        }
        soundSynth.playHitConfirm();
      } else if (currentScreen === "TITLE") {
        if (menuIndex === 0) {
          reloadSaveSlots();
          navTo("SAVE_SELECT");
        } else if (menuIndex === 1) {
          navTo("OPTIONS");
        } else if (menuIndex === 2) {
          navTo("CREDITS");
        }
        soundSynth.playHitConfirm();
      } else if (currentScreen === "SAVE_SELECT") {
        if (menuIndex >= 0 && menuIndex <= 2) {
          handleSlotAction(menuIndex, () => {
            resetGameSession();
            navTo("PLAYING");
          });
        } else if (menuIndex === 3) {
          toggleCopyMode();
        } else if (menuIndex === 4) {
          toggleEraseMode();
        } else if (menuIndex === 5) {
          resetActions();
          navTo("TITLE");
          soundSynth.playErrorTick();
        }
      } else if (currentScreen === "OPTIONS") {
        if (menuIndex === 0) {
          navTo("SOUND");
        } else if (menuIndex === 1) {
          navTo("CONTROLS");
        } else if (menuIndex === 2) {
          navTo("TITLE");
          setMenuIndex(1);
        }
        soundSynth.playHitConfirm();
      } else if (currentScreen === "SOUND") {
        if (menuIndex === 3) {
          navTo("OPTIONS");
          soundSynth.playErrorTick();
        } else {
          if (menuIndex === 0) handleVolumeChange("masterMuted", !audio.masterMuted);
          else if (menuIndex === 1) handleVolumeChange("sfxMuted", !audio.sfxMuted);
          else if (menuIndex === 2) handleVolumeChange("musicMuted", !audio.musicMuted);
          soundSynth.playHitConfirm();
        }
      } else if (currentScreen === "CONTROLS") {
        if (menuIndex === 7) {
          navTo("OPTIONS");
          setMenuIndex(1);
          soundSynth.playErrorTick();
        } else {
          const action = (Object.keys(settingsManager.getKeyMap()) as Action[])[menuIndex];
          soundSynth.playHitConfirm();
          setRebindTarget({ action, index: 0 });
        }
      } else if (currentScreen === "CREDITS") {
        navTo("TITLE");
        soundSynth.playErrorTick();
      }
    };

    const triggerBackNavigation = () => {
      soundSynth.playErrorTick();
      if (currentScreen === "SAVE_SELECT" || currentScreen === "OPTIONS" || currentScreen === "CREDITS") {
        resetActions();
        navTo("TITLE");
      } else if (currentScreen === "SOUND" || currentScreen === "CONTROLS") {
        navTo("OPTIONS");
      }
    };

    window.addEventListener("keydown", handleMenuNavigation);
    return () => {
      window.removeEventListener("keydown", handleMenuNavigation);
    };
  }, [currentScreen, menuIndex, audio, isCopyMode, isEraseMode, copySourceIndex, slots, rebindTarget, gameResult]);

  return (
    <div className="app-wrapper">
      <div className="cabinet-outer">

        <div className="cabinet-status-panel neo-pressed">
          <div className="hud-panel-block" style={{ gap: "4px" }}>
            <span className="hud-panel-title">PLAYER HP</span>
            <div className="flex-row" style={{ gap: "6px", alignItems: "center" }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`led-dot ${currentScreen === "PLAYING" && i < playerHP ? "led-green" : ""}`}
                  style={{ background: currentScreen === "PLAYING" && i < playerHP ? "" : "#07080b", border: "1px solid rgba(0,0,0,0.5)" }}
                />
              ))}
            </div>

            {currentScreen === "PLAYING" && (
              <div className="flex-row" style={{ gap: "10px", marginTop: "4px", alignItems: "center" }}>
                <div className="flex-row" style={{ gap: "4px" }}>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`led-dot ${i < healingCharges ? "led-yellow" : ""}`}
                      style={{ background: i < healingCharges ? "" : "#07080b", border: "1px solid rgba(0,0,0,0.5)", width: "6px", height: "6px" }}
                    />
                  ))}
                </div>
                <div className="flex-row" style={{ gap: "3px" }}>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="led-dot"
                      style={{
                        background: i < determination ? "hsl(280, 80%, 65%)" : "#07080b",
                        boxShadow: i < determination ? "0 0 6px rgba(168, 85, 247, 0.8)" : "none",
                        width: "4px",
                        height: "4px"
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hud-panel-block" style={{ alignItems: "center" }}>
            <span className="hud-panel-title" style={{ color: "#718096" }}>GAME STATUS</span>
            <span style={{ fontSize: "9px", color: currentScreen === "PLAYING" ? "var(--signal-green)" : "#4a5568", textShadow: currentScreen === "PLAYING" ? "0 0 8px var(--signal-green-glow)" : "", fontWeight: "bold" }}>
              {currentScreen === "PLAYING" ? "PLAYING" : "READY"}
            </span>
          </div>

          <div className="hud-panel-block" style={{ alignItems: "flex-end" }}>
            <span className="hud-panel-title hud-panel-title-red">BOSS HP</span>
            <div className="neo-pressed" style={{ width: "160px", height: "10px", borderRadius: "4px", padding: "1px", boxSizing: "border-box", overflow: "hidden" }}>
              <div
                className={currentScreen === "PLAYING" ? "led-red" : ""}
                style={{ height: "100%", borderRadius: "2px", width: currentScreen === "PLAYING" ? `${(bossHP / 30) * 100}%` : "0%", transition: "all 0.15s ease", background: currentScreen === "PLAYING" ? "" : "#07080b" }}
              />
            </div>
          </div>
        </div>

        <div className={`game-viewport-container ${isGlitching ? "filter-chromatic" : ""}`}>
          {currentScreen === "PLAYING" ? (
            <div className="w-full h-full" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ flexGrow: 1, position: "relative", display: "flex" }}>
                <GameArena
                  key={retryCount}
                  canvasRef={canvasRef}
                  triggerDialogue={triggerDialogue}
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
            </div>
          )}
        </div>

        {currentScreen === "PLAYING" && (
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
