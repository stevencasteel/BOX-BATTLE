import { useEffect, useRef } from "react";
import { Engine } from "@/core/Engine";
import { useSessionStore, useGameplayStore } from "@/store/useGameStore";

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
  // Store the trigger callback in a mutable ref to prevent recreating 
  // the Engine when the parent dialogue state updates.
  const triggerRef = useRef(triggerDialogue);
  
  useEffect(() => {
    triggerRef.current = triggerDialogue;
  }, [triggerDialogue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pass a stable execution wrapper to the engine
    const engine = new Engine(canvas, (speaker, text) => {
      triggerRef.current(speaker, text);
    });
    engine.start();

    return () => {
      engine.cleanup();
    };
  }, [canvasRef]); // Restrict recreation strictly to canvas attachment/detachment

  const gameResult = useSessionStore((state) => state.gameResult);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const navTo = useSessionStore((state) => state.navTo);
  const setMenuIndex = useSessionStore((state) => state.setMenuIndex);

  const resetGameSession = useGameplayStore((state) => state.resetGameSession);
  const playerHP = useGameplayStore((state) => state.playerHP);

  return (
    <div className="w-full h-full" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ flexGrow: 1, position: "relative", display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>

        <canvas
          ref={canvasRef}
          width={1250}
          height={1250}
          className="crt-scanlines crt-flicker"
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", background: "#0c0d11", display: "block", margin: "auto" }}
        />

        <div className={`vignette-overlay ${playerHP === 1 ? "vignette-pulse" : ""}`} />

        {gameResult !== "PLAYING" && (
          <div className="gameover-overlay">
            {gameResult === "GAMEOVER" ? (
              <div className="flex-col-center" style={{ gap: "16px" }}>
                <h1 style={{ fontSize: "2.5rem", color: "#ef4444", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", textShadow: "0 0 15px rgba(239, 68, 68, 0.75)" }}>
                  GAME OVER
                </h1>
                <p style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                  You were defeated.
                </p>
              </div>
            ) : (
              <div className="flex-col-center" style={{ gap: "16px" }}>
                <h1 style={{ fontSize: "2.5rem", color: "#22c55e", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", textShadow: "0 0 15px rgba(34, 197, 94, 0.75)" }}>
                  VICTORY
                </h1>
                <p style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                  You defeated the boss!
                </p>
              </div>
            )}

            <div className="flex-row" style={{ gap: "16px", marginTop: "32px" }}>
              <button
                onClick={() => {
                  resetGameSession();
                  navTo("PLAYING");
                }}
                onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
                className={`neo-btn ${menuIndex === 0 ? "neo-btn-focused" : ""}`}
              >
                {menuIndex === 0 && <span className="cursor-arrow">▶</span>}
                RETRY
                {menuIndex === 0 && <span className="cursor-arrow">◀</span>}
              </button>
              <button
                onClick={() => navTo("TITLE")}
                onMouseEnter={() => { playHoverTick(); setMenuIndex(1); }}
                className={`neo-btn ${menuIndex === 1 ? "neo-btn-focused" : ""}`}
              >
                {menuIndex === 1 && <span className="cursor-arrow">▶</span>}
                MENU
                {menuIndex === 1 && <span className="cursor-arrow">◀</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
