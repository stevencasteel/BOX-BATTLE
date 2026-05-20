import { useEffect, useRef, useState } from "react";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";
import { useSaveSlots } from "@/hooks/useSaveSlots";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useGameDialogue } from "@/hooks/useGameDialogue";

// Standalone Screens
import { TitleScreen } from "@/components/menus/TitleScreen";
import { SaveSelectScreen } from "@/components/menus/SaveSelectScreen";
import { SettingsScreen } from "@/components/menus/SettingsScreen";
import { AudioScreen } from "@/components/menus/AudioScreen";
import { ControlsScreen } from "@/components/menus/ControlsScreen";
import { CreditsScreen } from "@/components/menus/CreditsScreen";
import { GameArena } from "@/components/GameArena";

import "./App.css";

type ScreenState = "TITLE" | "SAVE_SELECT" | "OPTIONS" | "SOUND" | "CONTROLS" | "CREDITS" | "PLAYING";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("TITLE");
  const [menuIndex, setMenuIndex] = useState<number>(0);
  
  const [playerHP, setPlayerHP] = useState(5);
  const [bossHP, setBossHP] = useState(30);
  const [gameResult, setGameResult] = useState<"PLAYING" | "GAMEOVER" | "VICTORY">("PLAYING");

  // Save Matrix stats
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
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);

  // Dynamic HUD registers for healing
  const [healingCharges, setHealingCharges] = useState<number>(0);
  const [determination, setDetermination] = useState<number>(0);

  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => {
      setIsGlitching(false);
    }, 150);
  };

  const navTo = (screen: ScreenState) => {
    soundSynth.playSelectTick();
    if (screen === "PLAYING") {
      setRetryCount((prev) => prev + 1);
    }
    setCurrentScreen(screen);
    setMenuIndex(0);
    resetActions();
    resetDialogues();
  };

  const playHoverTick = () => {
    soundSynth.playSelectTick();
  };

  // Trigger chromatic glitch on damage
  useEffect(() => {
    if (playerHP < 5 && currentScreen === "PLAYING") {
      triggerGlitch();
    }
  }, [playerHP]);

  useEffect(() => {
    soundSynth.startMusic();
    reloadSaveSlots();
    return () => {
      soundSynth.stopMusic();
    };
  }, []);

  // Centralized Menu Navigation Listeners
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
        setMenuIndex((prev) => (prev + 1) % (maxIndex + 1));
      } else if (e.key === "ArrowUp" || e.key === "KeyW" || (isHorizontalEndScreen && (e.key === "ArrowLeft" || e.key === "KeyA"))) {
        e.preventDefault();
        soundSynth.playSelectTick();
        setMenuIndex((prev) => (prev - 1 + (maxIndex + 1)) % (maxIndex + 1));
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
          navTo("PLAYING");
        } else {
          navTo("TITLE");
        }
        soundSynth.playHitConfirm();
      } else if (currentScreen === "TITLE") {
        if (menuIndex === 0) {
          reloadSaveSlots();
          setCurrentScreen("SAVE_SELECT");
          setMenuIndex(0);
        } else if (menuIndex === 1) {
          setCurrentScreen("OPTIONS");
          setMenuIndex(0);
        } else if (menuIndex === 2) {
          setCurrentScreen("CREDITS");
          setMenuIndex(0);
        }
        soundSynth.playHitConfirm();
      } else if (currentScreen === "SAVE_SELECT") {
        if (menuIndex >= 0 && menuIndex <= 2) {
          handleSlotAction(menuIndex, () => navTo("PLAYING"));
        } else if (menuIndex === 3) {
          toggleCopyMode();
        } else if (menuIndex === 4) {
          toggleEraseMode();
        } else if (menuIndex === 5) {
          resetActions();
          setCurrentScreen("TITLE");
          setMenuIndex(0);
          soundSynth.playErrorTick();
        }
      } else if (currentScreen === "OPTIONS") {
        if (menuIndex === 0) {
          setCurrentScreen("SOUND");
          setMenuIndex(0);
        } else if (menuIndex === 1) {
          setCurrentScreen("CONTROLS");
          setMenuIndex(0);
        } else if (menuIndex === 2) {
          setCurrentScreen("TITLE");
          setMenuIndex(1);
        }
        soundSynth.playHitConfirm();
      } else if (currentScreen === "SOUND") {
        if (menuIndex === 3) {
          setCurrentScreen("OPTIONS");
          setMenuIndex(0);
          soundSynth.playErrorTick();
        } else {
          if (menuIndex === 0) handleVolumeChange("masterMuted", !audio.masterMuted);
          else if (menuIndex === 1) handleVolumeChange("sfxMuted", !audio.sfxMuted);
          else if (menuIndex === 2) handleVolumeChange("musicMuted", !audio.musicMuted);
          soundSynth.playHitConfirm();
        }
      } else if (currentScreen === "CONTROLS") {
        if (menuIndex === 7) {
          setCurrentScreen("OPTIONS");
          setMenuIndex(1);
          soundSynth.playErrorTick();
        } else {
          const action = (Object.keys(settingsManager.getKeyMap()) as Action[])[menuIndex];
          soundSynth.playHitConfirm();
          setRebindTarget({ action, index: 0 });
        }
      } else if (currentScreen === "CREDITS") {
        setCurrentScreen("TITLE");
        setMenuIndex(2);
        soundSynth.playErrorTick();
      }
    };

    const triggerBackNavigation = () => {
      soundSynth.playErrorTick();
      if (currentScreen === "SAVE_SELECT" || currentScreen === "OPTIONS" || currentScreen === "CREDITS") {
        resetActions();
        setCurrentScreen("TITLE");
        setMenuIndex(0);
      } else if (currentScreen === "SOUND" || currentScreen === "CONTROLS") {
        setCurrentScreen("OPTIONS");
        setMenuIndex(0);
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
        
        {/* Status Panel (Health HUD) situated above gameplay arena */}
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
            
            {/* Real-time Sub-HUD for Healing Charges (glowing purple LEDs) and Determination (fraction dots) */}
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

        {/* Dynamic Viewport Container */}
        <div className={`game-viewport-container ${isGlitching ? "filter-chromatic" : ""}`}>
          {currentScreen === "PLAYING" ? (
            <GameArena
              key={retryCount}
              canvasRef={canvasRef}
              playerHP={playerHP}
              bossHP={bossHP}
              gameResult={gameResult}
              menuIndex={menuIndex}
              setPlayerHP={setPlayerHP}
              setBossHP={setBossHP}
              setGameResult={setGameResult}
              triggerDialogue={triggerDialogue}
              navTo={navTo}
              playHoverTick={playHoverTick}
              setMenuIndex={setMenuIndex}
              setHealingCharges={setHealingCharges}
              setDetermination={setDetermination}
            />
          ) : (
            <div className="screen-inner">
              {currentScreen === "TITLE" && (
                <TitleScreen
                  menuIndex={menuIndex}
                  onPlay={() => {
                    reloadSaveSlots();
                    setCurrentScreen("SAVE_SELECT");
                    setMenuIndex(0);
                  }}
                  onSettings={() => {
                    setCurrentScreen("OPTIONS");
                    setMenuIndex(0);
                  }}
                  onCredits={() => {
                    setCurrentScreen("CREDITS");
                    setMenuIndex(0);
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
                    setCurrentScreen("TITLE");
                    setMenuIndex(0);
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                />
              )}

              {currentScreen === "OPTIONS" && (
                <SettingsScreen
                  menuIndex={menuIndex}
                  onAudio={() => {
                    setCurrentScreen("SOUND");
                    setMenuIndex(0);
                  }}
                  onControls={() => {
                    setCurrentScreen("CONTROLS");
                    setMenuIndex(0);
                  }}
                  onBack={() => {
                    setCurrentScreen("TITLE");
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
                    setCurrentScreen("OPTIONS");
                    setMenuIndex(0);
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
                    setCurrentScreen("OPTIONS");
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
                    setCurrentScreen("TITLE");
                    setMenuIndex(2);
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Dialogue Console (Sits completely outside/below playing arena) */}
        {currentScreen === "PLAYING" && (
          <div className="dialogue-console">
            {/* Player Dialogue Box (Left) */}
            <div className={`dialogue-box-left neo-pressed ${playerDialogue.active ? "dialogue-active-green" : "dialogue-inactive"}`}>
              <div className={`portrait-square led-green ${playerDialogue.isTyping ? "portrait-rumble" : ""}`} style={{ background: playerDialogue.active ? "" : "#07080b" }} />
              <div className="dialogue-text-container">
                <div className="dialogue-speaker-label">PLAYER</div>
                <div className="dialogue-body-text">{playerDialogue.active ? playerDialogue.displayed : "[ NO SIGNAL ]"}</div>
              </div>
            </div>

            {/* Boss Dialogue Box (Right) */}
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

      {/* Hardware-accelerated split-channel Chromatic Aberration filter */}
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