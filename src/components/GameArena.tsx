import { useEffect, useState, useRef } from "react";
import { Engine } from "@/core/Engine";
import { useSessionStore, useGameplayStore } from "@/store/useGameStore";
import { eventBroker } from "@/core/eventBroker";
import { CanvasResizer } from "@/core/CanvasResizer";

interface GameArenaProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  triggerDialogue: (speaker: "player" | "boss", text: string) => void;
  playHoverTick: () => void;
}

export function GameArena({
  canvasRef,
  triggerDialogue,
  playHoverTick,
}: GameArenaProps) {
  const triggerRef = useRef(triggerDialogue);
  
  const [isMobileDevice] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(pointer: coarse)").matches;
    }
    return false;
  });

  useEffect(() => {
    triggerRef.current = triggerDialogue;
  }, [triggerDialogue]);

  useEffect(() => {
    const updateVignette = (hp: number) => {
      const overlay = canvasRef.current?.parentElement?.querySelector(".vignette-overlay") as HTMLDivElement | null;
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
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const resizer = new CanvasResizer(canvas, 1250, 1250);

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
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, (speaker, text) => {
      triggerRef.current(speaker, text);
    });
    engine.start();

    return () => {
      engine.cleanup();
    };
  }, [canvasRef]);

  const gameResult = useSessionStore((state) => state.gameResult);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const navTo = useSessionStore((state) => state.navTo);
  const setMenuIndex = useSessionStore((state) => state.setMenuIndex);

  const resetGameSession = useGameplayStore((state) => state.resetGameSession);

  return (
    <div className="w-full h-full" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ flexGrow: 1, position: "relative", display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>

        <div style={{
          position: "relative",
          margin: isMobileDevice ? "0 auto" : "auto auto 0 auto",
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
            ref={canvasRef}
            width={1250}
            height={1250}
            className="crt-scanlines crt-flicker"
            style={{ 
              width: "100%",
              height: "100%",
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
