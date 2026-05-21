import { useEffect, useRef, useState } from "react";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";
import { useSaveSlots } from "@/hooks/useSaveSlots";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useBootSequence, BootStage } from "@/hooks/useBootSequence";
import { useGameplayStore, useSessionStore } from "@/store/useGameStore";
import { eventBroker } from "@/core/eventBroker";
import { screenConfigs, MenuContext } from "@/core/screenRoutes";

import { TitleScreen } from "@/components/menus/TitleScreen";
import { SaveSelectScreen } from "@/components/menus/SaveSelectScreen";
import { SettingsScreen } from "@/components/menus/SettingsScreen";
import { AudioScreen } from "@/components/menus/AudioScreen";
import { ControlsScreen } from "@/components/menus/ControlsScreen";
import { CreditsScreen } from "@/components/menus/CreditsScreen";
import { GameArena } from "@/components/GameArena";

import "./App.css";

export default function App() {
  const bootStage = useBootSequence();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusPanelRef = useRef<HTMLDivElement>(null);
  const dialogueConsoleRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const playerDialogueTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerDialogueCleanupRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bossDialogueTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bossDialogueCleanupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentScreen = useSessionStore((state) => state.currentScreen);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const gameResult = useSessionStore((state) => state.gameResult);
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

  const { audio, handleVolumeChange } = useAudioSettings();

  const [rebindTarget, setRebindTarget] = useState<{ action: Action; index: number } | null>(null);

  useEffect(() => {
    soundSynth.setCabinetMuffle(currentScreen !== "PLAYING");
  }, [currentScreen]);

  const playHoverTick = () => {
    soundSynth.playSelectTick();
  };

  useEffect(() => {
    soundSynth.startMusic();
    reloadSaveSlots();

    const updatePlayerHP = (hp: number) => {
      const dots = statusPanelRef.current?.querySelectorAll("[data-hp-dot]");
      if (!dots) return;
      dots.forEach((dot, i) => {
        const elem = dot as HTMLElement;
        if (i < hp) {
          elem.className = "led-dot led-green";
          elem.style.background = "";
        } else {
          elem.className = "led-dot";
          elem.style.background = "#07080b";
        }
      });
    };

    const updateHealCharges = (charges: number) => {
      const dots = statusPanelRef.current?.querySelectorAll("[data-heal-dot]");
      if (!dots) return;
      dots.forEach((dot, i) => {
        const elem = dot as HTMLElement;
        if (i < charges) {
          elem.className = "led-dot led-yellow";
          elem.style.background = "";
        } else {
          elem.className = "led-dot";
          elem.style.background = "#07080b";
        }
      });
    };

    const updateDetermination = (det: number) => {
      const dots = statusPanelRef.current?.querySelectorAll("[data-det-dot]");
      if (!dots) return;
      dots.forEach((dot, i) => {
        const elem = dot as HTMLElement;
        if (i < det) {
          elem.className = "led-dot";
          elem.style.background = "hsl(280, 80%, 65%)";
          elem.style.boxShadow = "0 0 6px rgba(168, 85, 247, 0.8)";
        } else {
          elem.className = "led-dot";
          elem.style.background = "#07080b";
          elem.style.boxShadow = "none";
        }
      });
    };

    const updateBossHP = (hp: number) => {
      const bar = statusPanelRef.current?.querySelector("[data-boss-bar]") as HTMLElement | null;
      if (!bar) return;
      const pct = (hp / 30) * 100;
      bar.className = "led-red";
      bar.style.width = pct + "%";
      bar.style.background = "";
    };

    const updateGameStatus = (status: string) => {
      const label = statusPanelRef.current?.querySelector("[data-game-status]") as HTMLElement | null;
      if (!label) return;
      label.textContent = status;
      label.style.color = status === "PLAYING" ? "var(--signal-green)" : "#4a5568";
      label.style.textShadow = status === "PLAYING" ? "0 0 8px var(--signal-green-glow)" : "";
    };



    const animateDialogue = (speaker: "player" | "boss", text: string) => {
      const box = dialogueConsoleRef.current?.querySelector(
        speaker === "player" ? "[data-player-dialogue]" : "[data-boss-dialogue]"
      ) as HTMLElement | null;
      const textElem = dialogueConsoleRef.current?.querySelector(
        speaker === "player" ? "[data-player-text]" : "[data-boss-text]"
      ) as HTMLElement | null;
      const portrait = dialogueConsoleRef.current?.querySelector(
        speaker === "player" ? "[data-player-portrait]" : "[data-boss-portrait]"
      ) as HTMLElement | null;

      if (!box || !textElem || !portrait) return;

      if (speaker === "player") {
        if (playerDialogueTimeoutRef.current) clearInterval(playerDialogueTimeoutRef.current);
        if (playerDialogueCleanupRef.current) clearTimeout(playerDialogueCleanupRef.current);
      } else {
        if (bossDialogueTimeoutRef.current) clearInterval(bossDialogueTimeoutRef.current);
        if (bossDialogueCleanupRef.current) clearTimeout(bossDialogueCleanupRef.current);
      }

      box.className =
        speaker === "player"
          ? "dialogue-box-left neo-pressed dialogue-active-green"
          : "dialogue-box-right neo-pressed dialogue-active-red";
      portrait.className =
        speaker === "player"
          ? "portrait-square led-green portrait-rumble"
          : "portrait-square led-red portrait-rumble";
      portrait.style.background = "";

      let idx = 0;
      textElem.textContent = "";

      const intervalTime = speaker === "player" ? 45 : 55;
      const timer = setInterval(() => {
        if (idx < text.length) {
          const char = text[idx];
          textElem.textContent += char;
          soundSynth.playDialogueTick(speaker, char);
          idx++;
        } else {
          clearInterval(timer);
          portrait.className =
            speaker === "player" ? "portrait-square led-green" : "portrait-square led-red";

          const cleanupTimer = setTimeout(() => {
            box.className =
              speaker === "player"
                ? "dialogue-box-left neo-pressed dialogue-inactive"
                : "dialogue-box-right neo-pressed dialogue-inactive";
            portrait.style.background = "#07080b";
            textElem.textContent = "[ NO SIGNAL ]";
          }, 3000);

          if (speaker === "player") {
            playerDialogueCleanupRef.current = cleanupTimer;
          } else {
            bossDialogueCleanupRef.current = cleanupTimer;
          }
        }
      }, intervalTime);

      if (speaker === "player") {
        playerDialogueTimeoutRef.current = timer;
      } else {
        bossDialogueTimeoutRef.current = timer;
      }
    };

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
        updatePlayerHP(currentHealth);
      }),
      eventBroker.subscribe("PLAYER_HEALED", ({ currentHealth }) => {
        updatePlayerHP(currentHealth);
      }),
      eventBroker.subscribe("BOSS_HURT", ({ currentHealth }) => {
        updateBossHP(currentHealth);
      }),
      eventBroker.subscribe("HEALING_CHARGES_CHANGED", ({ charges }) => {
        updateHealCharges(charges);
      }),
      eventBroker.subscribe("DETERMINATION_CHANGED", ({ determination: dValue }) => {
        updateDetermination(dValue);
      }),
      eventBroker.subscribe("DIALOGUE_TRIGGERED", ({ speaker, text }) => {
        animateDialogue(speaker, text);
      })
    ];

    if (currentScreen === "PLAYING") {
      const initialGameplay = useGameplayStore.getState();
      updatePlayerHP(initialGameplay.playerHP);
      updateBossHP(initialGameplay.bossHP);
      updateHealCharges(initialGameplay.healingCharges);
      updateDetermination(initialGameplay.determination);
      updateGameStatus("PLAYING");
    } else {
      updatePlayerHP(0);
      updateBossHP(0);
      updateHealCharges(0);
      updateDetermination(0);
      updateGameStatus("READY");
    }

    return () => {
      soundSynth.stopMusic();
      unsubGameplay();
      unsubs.forEach((unsub) => unsub());
      if (playerDialogueTimeoutRef.current) clearInterval(playerDialogueTimeoutRef.current);
      if (playerDialogueCleanupRef.current) clearTimeout(playerDialogueCleanupRef.current);
      if (bossDialogueTimeoutRef.current) clearInterval(bossDialogueTimeoutRef.current);
      if (bossDialogueCleanupRef.current) clearTimeout(bossDialogueCleanupRef.current);

      // Thorough dialogue console element release
      const pBox = dialogueConsoleRef.current?.querySelector("[data-player-dialogue]") as HTMLElement | null;
      const pText = dialogueConsoleRef.current?.querySelector("[data-player-text]") as HTMLElement | null;
      const pPortrait = dialogueConsoleRef.current?.querySelector("[data-player-portrait]") as HTMLElement | null;
      const bBox = dialogueConsoleRef.current?.querySelector("[data-boss-dialogue]") as HTMLElement | null;
      const bText = dialogueConsoleRef.current?.querySelector("[data-boss-text]") as HTMLElement | null;
      const bPortrait = dialogueConsoleRef.current?.querySelector("[data-boss-portrait]") as HTMLElement | null;

      if (pBox) pBox.className = "dialogue-box-left neo-pressed dialogue-inactive";
      if (pText) pText.textContent = "[ NO SIGNAL ]";
      if (pPortrait) {
        pPortrait.className = "portrait-square led-green";
        pPortrait.style.background = "#07080b";
      }

      if (bBox) bBox.className = "dialogue-box-right neo-pressed dialogue-inactive";
      if (bText) bText.textContent = "[ NO SIGNAL ]";
      if (bPortrait) {
        bPortrait.className = "portrait-square led-red";
        bPortrait.style.background = "#07080b";
      }
    };
  }, [currentScreen]);

  useEffect(() => {
    if (gameResult !== "PLAYING") {
      if (playerDialogueTimeoutRef.current) clearInterval(playerDialogueTimeoutRef.current);
      if (playerDialogueCleanupRef.current) clearTimeout(playerDialogueCleanupRef.current);
      if (bossDialogueTimeoutRef.current) clearInterval(bossDialogueTimeoutRef.current);
      if (bossDialogueCleanupRef.current) clearTimeout(bossDialogueCleanupRef.current);

      const pBox = dialogueConsoleRef.current?.querySelector("[data-player-dialogue]") as HTMLElement | null;
      const pText = dialogueConsoleRef.current?.querySelector("[data-player-text]") as HTMLElement | null;
      const pPortrait = dialogueConsoleRef.current?.querySelector("[data-player-portrait]") as HTMLElement | null;
      const bBox = dialogueConsoleRef.current?.querySelector("[data-boss-dialogue]") as HTMLElement | null;
      const bText = dialogueConsoleRef.current?.querySelector("[data-boss-text]") as HTMLElement | null;
      const bPortrait = dialogueConsoleRef.current?.querySelector("[data-boss-portrait]") as HTMLElement | null;

      if (pBox) pBox.className = "dialogue-box-left neo-pressed dialogue-inactive";
      if (pText) pText.textContent = "[ NO SIGNAL ]";
      if (pPortrait) {
        pPortrait.className = "portrait-square led-green";
        pPortrait.style.background = "#07080b";
      }

      if (bBox) bBox.className = "dialogue-box-right neo-pressed dialogue-inactive";
      if (bText) bText.textContent = "[ NO SIGNAL ]";
      if (bPortrait) {
        bPortrait.className = "portrait-square led-red";
        bPortrait.style.background = "#07080b";
      }
    }
  }, [gameResult]);

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
    if ((currentScreen === "PLAYING" && gameResult === "PLAYING") || rebindTarget !== null) return;

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
      <div className="cabinet-outer">

        <div className="cabinet-status-panel neo-pressed" ref={statusPanelRef}>
          <div className="hud-panel-block" style={{ gap: "4px" }}>
            <span className="hud-panel-title">PLAYER HP</span>
            <div className="flex-row" style={{ gap: "6px", alignItems: "center" }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  data-hp-dot={i}
                  className="led-dot"
                  style={{ background: "#07080b", border: "1px solid rgba(0,0,0,0.5)" }}
                />
              ))}
            </div>

            <div className="flex-row" style={{ gap: "10px", marginTop: "4px", alignItems: "center" }}>
              <div className="flex-row" style={{ gap: "4px" }}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    data-heal-dot={i}
                    className="led-dot"
                    style={{ background: "#07080b", border: "1px solid rgba(0,0,0,0.5)", width: "6px", height: "6px" }}
                  />
                ))}
              </div>
              <div className="flex-row" style={{ gap: "3px" }}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    data-det-dot={i}
                    className="led-dot"
                    style={{
                      background: "#07080b",
                      width: "4px",
                      height: "4px"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hud-panel-block" style={{ alignItems: "center" }}>
            <span className="hud-panel-title" style={{ color: "#718096" }}>GAME STATUS</span>
            <span data-game-status style={{ fontSize: "9px", color: "#4a5568", fontWeight: "bold" }}>
              READY
            </span>
          </div>

          <div className="hud-panel-block" style={{ alignItems: "flex-end" }}>
            <span className="hud-panel-title hud-panel-title-red">BOSS HP</span>
            <div className="neo-pressed" style={{ width: "160px", height: "10px", borderRadius: "4px", padding: "1px", boxSizing: "border-box", overflow: "hidden" }}>
              <div
                data-boss-bar
                style={{ height: "100%", borderRadius: "2px", width: "0%", transition: "all 0.15s ease", background: "#07080b" }}
              />
            </div>
          </div>
        </div>

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

        <div className="dialogue-console" ref={dialogueConsoleRef}>
          <div data-player-dialogue className="dialogue-box-left neo-pressed dialogue-inactive">
            <div data-player-portrait className="portrait-square led-green" style={{ background: "#07080b" }} />
            <div className="dialogue-text-container">
              <div className="dialogue-speaker-label">PLAYER</div>
              <div data-player-text className="dialogue-body-text">[ NO SIGNAL ]</div>
            </div>
          </div>

          <div data-boss-dialogue className="dialogue-box-right neo-pressed dialogue-inactive">
            <div className="dialogue-text-container" style={{ textAlign: "right" }}>
              <div className="dialogue-speaker-label" style={{ color: "var(--signal-red)" }}>BOSS</div>
              <div data-boss-text className="dialogue-body-text">[ NO SIGNAL ]</div>
            </div>
            <div data-boss-portrait className="portrait-square led-red" style={{ background: "#07080b" }} />
          </div>
        </div>

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