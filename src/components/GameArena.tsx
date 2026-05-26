import "./GameArena.css";
import { useEffect, useRef, useState } from "react";
import { Engine } from "@/core/Engine";
import { useSessionStore, useGameplayStore } from "@/store/useGameStore";
import { eventBroker } from "@/core/eventBroker";
import { soundSynth } from "@/core/SoundSynth";
import { saveManager } from "@/core/SaveManager";
import { Trophy, Skull, RotateCcw, Home, BarChart2 } from "lucide-react";

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

    const updateVignette = (hp: number) => {
      const overlay = canvas.parentElement?.querySelector(".vignette-overlay") as HTMLDivElement | null;
      if (overlay) {
        if (hp === 1) {
          overlay.classList.add("vignette-pulse");
        } else {
          overlay.classList.remove("vignette-pulse");
        }
      }
    };

    const unsubHurt = eventBroker.subscribe("PLAYER_HURT", ({ currentHealth }) => {
      updateVignette(currentHealth);
    });
    const unsubHealed = eventBroker.subscribe("PLAYER_HEALED", ({ currentHealth }) => {
      updateVignette(currentHealth);
    });

    const initialHP = useGameplayStore.getState().playerHP;
    updateVignette(initialHP);

    return () => {
      unsubHurt();
      unsubHealed();
      engine.cleanup();
      engineRef.current = null;
    };
  }, []);

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
      const slotIdx = saveManager.getCurrentSlotIndex();
      const slot = slotIdx !== -1 ? saveManager.getSlot(slotIdx) : null;
      const targetWins = slot ? slot.wins : 0;
      const targetLosses = slot ? slot.losses : 0;

      let currentW = 0;
      let currentL = 0;

      const winTimer = setInterval(() => {
        if (currentW < targetWins) {
          currentW++;
          setDisplayWins(currentW);
          soundSynth.playSelectTick();
        } else {
          clearInterval(winTimer);
          
          const lossTimer = setInterval(() => {
            if (currentL < targetLosses) {
              currentL++;
              setDisplayLosses(currentL);
              soundSynth.playSelectTick();
            } else {
              clearInterval(lossTimer);
              setStagger(4);
              soundSynth.playDashRecharge();
            }
          }, 120);
        }
      }, 120);
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
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
            <div className="gameover-overlay" style={{ opacity: 1, transition: "opacity 0.4s ease" }}>
              <div
                className={`gameover-box neo-elevated ${gameResult === "GAMEOVER" ? "defeat-border" : "victory-border"}`}
                style={{
                  transform: stagger >= 2 ? "scale(1)" : "scale(0.92)",
                  opacity: stagger >= 2 ? 1 : 0.8,
                }}
              >
                {stagger >= 2 && (
                  <>
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
                  </>
                )}

                {stagger >= 3 && (
                  <div className="stat-card-anim gameover-stat-card">
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
                  </div>
                )}

                <div className="gameover-divider" />

                <div
                  className="gameover-btn-container button-reveal-anim"
                  style={{
                    opacity: stagger >= 4 ? 1 : 0,
                    transform: stagger >= 4 ? "translateY(0)" : "translateY(15px)",
                    transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  }}
                >
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
