import "./GameArena.css";
import { useEffect, useRef, useState } from "react";
import { Engine } from "@/core/Engine";
import { useSessionStore, useGameplayStore } from "@/store/useGameStore";
import { eventBroker } from "@/core/eventBroker";
import { CanvasResizer } from "@/core/CanvasResizer";

interface GameArenaProps {
  triggerDialogue: (speaker: "player" | "boss", text: string) => void;
  playHoverTick: () => void;
}

export function GameArena({
  triggerDialogue,
  playHoverTick,
}: GameArenaProps) {
  const triggerRef = useRef(triggerDialogue);
  const engineRef = useRef<Engine | null>(null);
  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    triggerRef.current = triggerDialogue;
  }, [triggerDialogue]);

  useEffect(() => {
    if (!canvasNode) return;

    const updateVignette = (hp: number) => {
      const overlay = canvasNode.parentElement?.querySelector(".vignette-overlay") as HTMLDivElement | null;
      if (overlay) {
        if (hp === 1) {
          overlay.classList.add("vignette-pulse");
        } else {
          overlay.classList.remove("vignette-pulse");
        }
      }
    };

    const unsubHurt = eventBroker.subscribe("PLAYER_HURT", ({ currentHealth }: { currentHealth: number }) => {
      updateVignette(currentHealth);
    });
    const unsubHealed = eventBroker.subscribe("PLAYER_HEALED", ({ currentHealth }: { currentHealth: number }) => {
      updateVignette(currentHealth);
    });

    const initialHP = useGameplayStore.getState().playerHP;
    updateVignette(initialHP);

    return () => {
      unsubHurt();
      unsubHealed();
    };
  }, [canvasNode]);

  useEffect(() => {
    if (!canvasNode) return;
    const container = canvasNode.parentElement;
    if (!container) return;

    const resizer = new CanvasResizer(canvasNode, 1250, 1250);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        resizer.resize(width, height);
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [canvasNode]);

  useEffect(() => {
    if (!canvasNode) return;

    const engine = new Engine(canvasNode, (speaker, text) => {
      triggerRef.current(speaker, text);
    });
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.cleanup();
      engineRef.current = null;
    };
  }, [canvasNode]);

  const gameResult = useSessionStore((state) => state.gameResult);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const navTo = useSessionStore((state) => state.navTo);
  const setMenuIndex = useSessionStore((state) => state.setMenuIndex);
  const retryCount = useSessionStore((state) => state.retryCount);
  const currentScreen = useSessionStore((state) => state.currentScreen);

  const initialRetryCountRef = useRef(retryCount);

  useEffect(() => {
    if (currentScreen === "PLAYING" && retryCount > initialRetryCountRef.current) {
      engineRef.current?.reset();
    }
  }, [retryCount, currentScreen]);

  const resetGameSession = useGameplayStore((state) => state.resetGameSession);

  return (
    <div className="w-full" style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
      <div style={{ flexGrow: 1, position: "relative", display: "flex", width: "100%", overflow: "hidden", minHeight: 0 }}>

        <div style={{
          position: "relative",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: "1/1",
          width: "100%",
          height: "100%"
        }}>
          <canvas
            ref={setCanvasNode}
            width={1250}
            height={1250}
            className="crt-scanlines crt-flicker"
            style={{ 
              background: "#0c0d11", 
              display: "block"
            }}
          />

          <div className="vignette-overlay" />

          {gameResult !== "PLAYING" && (
            <div className="gameover-overlay">
              <div className="gameover-box neo-elevated" style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                borderRadius: "20px",
                border: gameResult === "GAMEOVER" ? "2px solid rgba(239, 68, 68, 0.35)" : "2px solid rgba(34, 197, 94, 0.35)",
                boxShadow: gameResult === "GAMEOVER" 
                  ? "0 0 30px rgba(239, 68, 68, 0.15), inset 0 0 20px rgba(239, 68, 68, 0.1)" 
                  : "0 0 30px rgba(34, 197, 94, 0.15), inset 0 0 20px rgba(34, 197, 94, 0.1)",
                background: "rgba(12, 14, 18, 0.95)",
                maxWidth: "440px",
                width: "85%",
                boxSizing: "border-box",
                textAlign: "center"
              }}>

                {gameResult === "GAMEOVER" ? (
                  <div className="flex-col-center">
                    <h1 style={{ 
                      fontSize: "2.6rem", 
                      margin: 0, 
                      color: "var(--signal-red)", 
                      fontWeight: 900, 
                      textTransform: "uppercase", 
                      letterSpacing: "0.22em", 
                      textShadow: "0 0 15px var(--signal-red-glow)",
                      lineHeight: "1.1"
                    }}>
                      DEFEATED
                    </h1>
                  </div>
                ) : (
                  <div className="flex-col-center">
                    <h1 style={{ 
                      fontSize: "2.6rem", 
                      margin: 0, 
                      color: "var(--signal-green)", 
                      fontWeight: 900, 
                      textTransform: "uppercase", 
                      letterSpacing: "0.22em", 
                      textShadow: "0 0 15px var(--signal-green-glow)",
                      lineHeight: "1.1"
                    }}>
                      VICTORY
                    </h1>
                  </div>
                )}

                <div style={{
                  height: "1px",
                  width: "60px",
                  background: "rgba(255,255,255,0.08)",
                  margin: "24px 0"
                }} />

                <div className="flex-row" style={{ gap: "16px", width: "100%", justifyContent: "center" }}>
                  <button
                    onClick={() => {
                      resetGameSession();
                      navTo("PLAYING");
                    }}
                    onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
                    className={`neo-btn ${menuIndex === 0 ? "neo-btn-focused" : ""}`}
                    style={{ flex: 1, padding: "16px 20px", fontSize: "14px", borderRadius: "10px" }}
                  >
                    <span className="cursor-arrow" style={{ marginRight: "6px", visibility: menuIndex === 0 ? "visible" : "hidden" }}>▶</span>
                    RETRY
                    <span className="cursor-arrow" style={{ marginLeft: "6px", visibility: menuIndex === 0 ? "visible" : "hidden" }}>◀</span>
                  </button>
                  <button
                    onClick={() => navTo("TITLE")}
                    onMouseEnter={() => { playHoverTick(); setMenuIndex(1); }}
                    className={`neo-btn ${menuIndex === 1 ? "neo-btn-focused" : ""}`}
                    style={{ flex: 1, padding: "16px 20px", fontSize: "14px", borderRadius: "10px" }}
                  >
                    <span className="cursor-arrow" style={{ marginRight: "6px", visibility: menuIndex === 1 ? "visible" : "hidden" }}>▶</span>
                    MENU
                    <span className="cursor-arrow" style={{ marginLeft: "6px", visibility: menuIndex === 1 ? "visible" : "hidden" }}>◀</span>
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
