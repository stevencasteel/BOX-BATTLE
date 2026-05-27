import "./GameArena.css";
import { useEffect, useRef, useState } from "react";
import { Engine } from "@/core/Engine";
import { useSessionStore, useGameplayStore } from "@/store/useGameStore";
import { eventBroker } from "@/core/eventBroker";
import { soundSynth } from "@/core/SoundSynth";
import { saveManager } from "@/core/SaveManager";
import { Trophy, Skull, RotateCcw, Home, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GameArenaProps {
  triggerDialogue?: (speaker: "player" | "boss", text: string) => void;
  playHoverTick: () => void;
}

export function GameArena({ playHoverTick }: GameArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);

  const [stagger, setStagger] = useState(0);
  const [displayWins, setDisplayWins] = useState(0);
  const [displayLosses, setDisplayLosses] = useState(0);

  const currentScreen = useSessionStore((state) => state.currentScreen);
  const gameResult = useSessionStore((state) => state.gameResult);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const navTo = useSessionStore((state) => state.navTo);
  const setMenuIndex = useSessionStore((state) => state.setMenuIndex);
  const retryCount = useSessionStore((state) => state.retryCount);
  const resetGameSession = useGameplayStore((state) => state.resetGameSession);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas);
    engineRef.current = engine;
    engine.start();

    const vignette = canvas.parentElement?.querySelector(".vignette-overlay") as HTMLDivElement | null;

    const updateVignette = (hp: number) => {
      const isGameOver = useSessionStore.getState().gameResult !== "PLAYING";
      if (vignette) {
        if (hp === 1 && !isGameOver) {
          vignette.classList.add("vignette-pulse");
        } else {
          vignette.classList.remove("vignette-pulse");
        }
      }
    };

    const unsubHurt = eventBroker.subscribe("PLAYER_HURT", ({ currentHealth }) => {
      updateVignette(currentHealth);
    });
    const unsubHealed = eventBroker.subscribe("PLAYER_HEALED", ({ currentHealth }) => {
      updateVignette(currentHealth);
    });

    const unsubSession = useSessionStore.subscribe((state) => {
      if (state.gameResult !== "PLAYING") {
        updateVignette(0);
      } else {
        updateVignette(useGameplayStore.getState().playerHP);
      }
    });

    const initialHP = useGameplayStore.getState().playerHP;
    updateVignette(initialHP);

    return () => {
      unsubHurt();
      unsubHealed();
      unsubSession();
      engine.cleanup();
      engineRef.current = null;
    };
  }, []);

  const tickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (gameResult === "PLAYING") {
      queueMicrotask(() => {
        setStagger(0);
        setDisplayWins(0);
        setDisplayLosses(0);
      });
      return;
    }

    const t1 = setTimeout(() => {
      setStagger(1);
      soundSynth.playMenuConfirm();
    }, 200);

    const t2 = setTimeout(() => {
      setStagger(2);
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 10, duration: 0.2 });
      if (gameResult === "VICTORY") {
        soundSynth.playHealComplete();
      } else {
        soundSynth.playHealCancel();
      }
    }, 750);

    const t3 = setTimeout(() => {
      setStagger(3);

      const startTickTimeout = setTimeout(() => {
        const slotIdx = saveManager.getCurrentSlotIndex();
        const slot = slotIdx !== -1 ? saveManager.getSlot(slotIdx) : null;
        const targetWins = slot ? slot.wins : 0;
        const targetLosses = slot ? slot.losses : 0;

        let currentW = 0;
        let currentL = 0;

        const getDelay = (current: number, target: number) => {
          if (target <= 1) return 180;
          const progress = current / target;
          const minDelay = 25;
          const maxDelay = 260;
          return minDelay + (maxDelay - minDelay) * Math.pow(progress, 2);
        };

        const tickWins = () => {
          if (currentW < targetWins) {
            const delay = getDelay(currentW, targetWins);
            currentW++;
            setDisplayWins(currentW);
            soundSynth.playSelectTick();
            tickTimeoutRef.current = setTimeout(tickWins, delay);
          } else {
            tickTimeoutRef.current = setTimeout(tickLosses, 150);
          }
        };

        const tickLosses = () => {
          if (currentL < targetLosses) {
            const delay = getDelay(currentL, targetLosses);
            currentL++;
            setDisplayLosses(currentL);
            soundSynth.playSelectTick();
            tickTimeoutRef.current = setTimeout(tickLosses, delay);
          } else {
            setStagger(4);
            soundSynth.playDashRecharge();
          }
        };

        if (targetWins > 0) {
          tickWins();
        } else {
          tickLosses();
        }
      }, 900);

      tickTimeoutRef.current = startTickTimeout;
    }, 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
      }
    };
  }, [gameResult]);

  const initialRetryCountRef = useRef(retryCount);

  useEffect(() => {
    if (currentScreen === "PLAYING" && retryCount > initialRetryCountRef.current) {
      engineRef.current?.reset();
    }
  }, [retryCount, currentScreen]);

  return (
    <div className="w-full" style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
      <div
        style={{ flexGrow: 1, position: "relative", display: "flex", width: "100%", overflow: "hidden", minHeight: 0 }}
      >
        <div
          style={{
            position: "relative",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "100%",
            maxHeight: "100%",
            aspectRatio: "1/1",
            width: "100%",
            height: "100%",
          }}
        >
          <canvas
            ref={canvasRef}
            width={1250}
            height={1250}
            className="crt-scanlines crt-flicker"
            style={{
              background: "#0c0d11",
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />

          <div className="vignette-overlay" />

          {gameResult !== "PLAYING" && stagger >= 1 && (
            <div className="gameover-overlay">
              <AnimatePresence>
                <motion.div
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`gameover-box neo-elevated ${gameResult === "GAMEOVER" ? "defeat-border" : "victory-border"}`}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                  <AnimatePresence mode="wait">
                    {stagger >= 2 && (
                      <motion.div
                        key="title-section"
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="flex-col-center"
                      >
                        {gameResult === "GAMEOVER" ? (
                          <div className="flex-col-center">
                            <Skull
                              size={64}
                              className="defeat-icon-anim gameover-icon"
                              style={{ color: "var(--signal-red)" }}
                            />
                            <h1 className="defeat-title-anim" style={{ color: "var(--signal-red)" }}>
                              DEFEATED
                            </h1>
                          </div>
                        ) : (
                          <div className="flex-col-center">
                            <Trophy
                              size={64}
                              className="victory-icon-anim gameover-icon"
                              style={{ color: "var(--signal-green)" }}
                            />
                            <h1 className="victory-title-anim" style={{ color: "var(--signal-green)" }}>
                              VICTORY
                            </h1>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {stagger >= 3 && (
                      <motion.div
                        key="stats-section"
                        initial={{ opacity: 0, height: 0, y: 15 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 24 }}
                        className="stat-card-anim gameover-stat-card w-full"
                        style={{ overflow: "hidden" }}
                      >
                        <div className="gameover-stat-title-row">
                          <BarChart2 size={14} />
                          <span className="gameover-stat-title">
                            SAVE SLOT PERFORMANCE
                          </span>
                        </div>
                        <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", width: "100%" }} />
                        <div className="gameover-stat-row">
                          <span className="gameover-stat-label">TOTAL WINS</span>
                          <span className="gameover-stat-value gameover-stat-win">{displayWins}</span>
                        </div>
                        <div className="gameover-stat-row">
                          <span className="gameover-stat-label">TOTAL LOSSES</span>
                          <span className="gameover-stat-value gameover-stat-loss">{displayLosses}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {stagger >= 3 && (
                      <motion.div
                        key="buttons-section"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.3 }}
                        style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
                      >
                        <div className="gameover-divider" />

                        <div className="gameover-btn-container">
                          <button
                            onClick={() => {
                              resetGameSession();
                              navTo("PLAYING");
                            }}
                            onMouseEnter={() => {
                              playHoverTick();
                              setMenuIndex(0);
                            }}
                            className={`neo-btn gameover-btn ${menuIndex === 0 ? "neo-btn-focused" : ""}`}
                            style={
                              gameResult === "GAMEOVER" && menuIndex === 0
                                ? {
                                    color: "var(--signal-red)",
                                    borderColor: "rgba(239, 68, 68, 0.25)",
                                    textShadow: "0 0 8px var(--signal-red-glow)",
                                  }
                                : {}
                            }
                          >
                            <span
                              className="gameover-inline-arrow"
                              style={{
                                marginRight: "6px",
                                visibility: menuIndex === 0 ? "visible" : "hidden",
                                color: gameResult === "GAMEOVER" ? "var(--signal-red)" : undefined,
                              }}
                            >
                              ▶
                            </span>
                            <RotateCcw size={16} style={{ flexShrink: 0 }} />
                            RETRY
                            <span
                              className="gameover-inline-arrow"
                              style={{
                                marginLeft: "6px",
                                visibility: menuIndex === 0 ? "visible" : "hidden",
                                color: gameResult === "GAMEOVER" ? "var(--signal-red)" : undefined,
                              }}
                            >
                              ◀
                            </span>
                          </button>
                          <button
                            onClick={() => navTo("TITLE")}
                            onMouseEnter={() => {
                              playHoverTick();
                              setMenuIndex(1);
                            }}
                            className={`neo-btn gameover-btn ${menuIndex === 1 ? "neo-btn-focused" : ""}`}
                            style={
                              gameResult === "GAMEOVER" && menuIndex === 1
                                ? {
                                    color: "var(--signal-red)",
                                    borderColor: "rgba(239, 68, 68, 0.25)",
                                    textShadow: "0 0 8px var(--signal-red-glow)",
                                  }
                                : {}
                            }
                          >
                            <span
                              className="gameover-inline-arrow"
                              style={{
                                marginRight: "6px",
                                visibility: menuIndex === 1 ? "visible" : "hidden",
                                color: gameResult === "GAMEOVER" ? "var(--signal-red)" : undefined,
                              }}
                            >
                              ▶
                            </span>
                            <Home size={16} style={{ flexShrink: 0 }} />
                            MENU
                            <span
                              className="gameover-inline-arrow"
                              style={{
                                marginLeft: "6px",
                                visibility: menuIndex === 1 ? "visible" : "hidden",
                                color: gameResult === "GAMEOVER" ? "var(--signal-red)" : undefined,
                              }}
                            >
                              ◀
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
