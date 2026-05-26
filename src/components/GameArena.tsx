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

  // Staggered state sequence: 0 (Hidden), 1 (Fading Base), 2 (Header Pop & Sound), 3 (Tallying Stats), 4 (Buttons Visible)
  const [stagger, setStagger] = useState(0);
  const [displayWins, setDisplayWins] = useState(0);
  const [displayLosses, setDisplayLosses] = useState(0);

  // Grouped selector bindings
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

  // Staggered animation triggers on game conclusion
  useEffect(() => {
    if (gameResult === "PLAYING") {
      queueMicrotask(() => {
        setStagger(0);
        setDisplayWins(0);
        setDisplayLosses(0);
      });
      return;
    }

    // Step 1: Base panel entry
    const t1 = setTimeout(() => {
      setStagger(1);
      soundSynth.playMenuConfirm();
    }, 200);

    // Step 2: Primary banner pop & screen shake
    const t2 = setTimeout(() => {
      setStagger(2);
      eventBroker.publish("CAMERA_SHAKE", { amplitude: 10, duration: 0.2 });
      if (gameResult === "VICTORY") {
        soundSynth.playHealComplete();
      } else {
        soundSynth.playHealCancel();
      }
    }, 750);

    // Step 3: Run stat ticks count-up
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
              
              // Step 4: Display retry buttons smoothly
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
                className="gameover-box neo-elevated"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px",
                  borderRadius: "20px",
                  border:
                    gameResult === "GAMEOVER"
                      ? "2px solid rgba(239, 68, 68, 0.35)"
                      : "2px solid rgba(34, 197, 94, 0.35)",
                  boxShadow:
                    gameResult === "GAMEOVER"
                      ? "0 0 30px rgba(239, 68, 68, 0.15), inset 0 0 20px rgba(239, 68, 68, 0.1)"
                      : "0 0 30px rgba(34, 197, 94, 0.15), inset 0 0 20px rgba(34, 197, 94, 0.1)",
                  background: "rgba(12, 14, 18, 0.96)",
                  maxWidth: "440px",
                  width: "85%",
                  boxSizing: "border-box",
                  textAlign: "center",
                  transform: stagger >= 2 ? "scale(1)" : "scale(0.92)",
                  opacity: stagger >= 2 ? 1 : 0.8,
                  transition: "transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1.15), opacity 0.3s ease",
                }}
              >
                {stagger >= 2 && (
                  <>
                    {gameResult === "GAMEOVER" ? (
                      <div className="flex-col-center">
                        <Skull
                          size={64}
                          className="defeat-icon-anim"
                          style={{
                            color: "var(--signal-red)",
                            marginBottom: "16px",
                          }}
                        />
                        <h1
                          className="defeat-title-anim"
                          style={{
                            fontSize: "2.6rem",
                            margin: 0,
                            color: "var(--signal-red)",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.22em",
                            lineHeight: "1.1",
                          }}
                        >
                          DEFEATED
                        </h1>
                      </div>
                    ) : (
                      <div className="flex-col-center">
                        <Trophy
                          size={64}
                          className="victory-icon-anim"
                          style={{
                            color: "var(--signal-green)",
                            marginBottom: "16px",
                          }}
                        />
                        <h1
                          className="victory-title-anim"
                          style={{
                            fontSize: "2.6rem",
                            margin: 0,
                            color: "var(--signal-green)",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.22em",
                            lineHeight: "1.1",
                          }}
                        >
                          VICTORY
                        </h1>
                      </div>
                    )}
                  </>
                )}

                {/* Save Stats Tally */}
                {stagger >= 3 && (
                  <div
                    className="stat-card-anim"
                    style={{
                      width: "100%",
                      marginTop: "24px",
                      padding: "16px 20px",
                      background: "rgba(7, 8, 11, 0.6)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "#718096" }}>
                      <BarChart2 size={14} />
                      <span style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                        SAVE SLOT PERFORMANCE
                      </span>
                    </div>
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#4a5568", fontWeight: "bold", letterSpacing: "0.1em" }}>TOTAL WINS</span>
                      <span style={{ fontSize: "18px", color: "var(--signal-green)", fontWeight: "bold", fontFamily: "monospace" }}>
                        {displayWins}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#4a5568", fontWeight: "bold", letterSpacing: "0.1em" }}>TOTAL LOSSES</span>
                      <span style={{ fontSize: "18px", color: "var(--signal-red)", fontWeight: "bold", fontFamily: "monospace" }}>
                        {displayLosses}
                      </span>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    height: "1px",
                    width: "60px",
                    background: "rgba(255,255,255,0.08)",
                    margin: "24px 0",
                  }}
                />

                {/* Navigation Buttons */}
                <div
                  className="flex-row button-reveal-anim"
                  style={{
                    gap: "16px",
                    width: "100%",
                    justifyContent: "center",
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
                    className={`neo-btn ${menuIndex === 0 ? "neo-btn-focused" : ""}`}
                    style={{
                      flex: 1,
                      padding: "16px 20px",
                      fontSize: "14px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      ...(gameResult === "GAMEOVER" && menuIndex === 0
                        ? {
                            color: "var(--signal-red)",
                            borderColor: "rgba(239, 68, 68, 0.25)",
                            textShadow: "0 0 8px var(--signal-red-glow)",
                          }
                        : {}),
                    }}
                  >
                    <span
                      className="cursor-arrow"
                      style={{
                        marginRight: "2px",
                        visibility: menuIndex === 0 ? "visible" : "hidden",
                        color: gameResult === "GAMEOVER" ? "var(--signal-red)" : undefined,
                      }}
                    >
                      ▶
                    </span>
                    <RotateCcw size={16} style={{ flexShrink: 0 }} />
                    RETRY
                    <span
                      className="cursor-arrow"
                      style={{
                        marginLeft: "2px",
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
                    className={`neo-btn ${menuIndex === 1 ? "neo-btn-focused" : ""}`}
                    style={{
                      flex: 1,
                      padding: "16px 20px",
                      fontSize: "14px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      ...(gameResult === "GAMEOVER" && menuIndex === 1
                        ? {
                            color: "var(--signal-red)",
                            borderColor: "rgba(239, 68, 68, 0.25)",
                            textShadow: "0 0 8px var(--signal-red-glow)",
                          }
                        : {}),
                    }}
                  >
                    <span
                      className="cursor-arrow"
                      style={{
                        marginRight: "2px",
                        visibility: menuIndex === 1 ? "visible" : "hidden",
                        color: gameResult === "GAMEOVER" ? "var(--signal-red)" : undefined,
                      }}
                    >
                      ▶
                    </span>
                    <Home size={16} style={{ flexShrink: 0 }} />
                    MENU
                    <span
                      className="cursor-arrow"
                      style={{
                        marginLeft: "2px",
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
