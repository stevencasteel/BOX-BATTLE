import { useEffect, useRef } from "react";
import GameLoop from "@/core/GameLoop";
import { PhysicsComponent, Rectangle } from "@/components/PhysicsComponent";
import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { Registry } from "@/core/Registry";
import { HealthComponent } from "@/components/HealthComponent";
import { ObjectPool } from "@/core/ObjectPool";
import { Projectile } from "@/entities/Projectile";
import { Camera } from "@/core/Camera";
import { inputProvider } from "@/core/InputProvider";
import { Spawner } from "@/entities/Spawner";

interface GameArenaProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  playerHP: number;
  bossHP: number;
  gameResult: "PLAYING" | "GAMEOVER" | "VICTORY";
  menuIndex: number;
  setPlayerHP: (hp: number) => void;
  setBossHP: (hp: number) => void;
  setGameResult: (result: "PLAYING" | "GAMEOVER" | "VICTORY") => void;
  triggerDialogue: (speaker: "player" | "boss", text: string) => void;
  navTo: (screen: any) => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function GameArena({
  canvasRef,
  playerHP,
  gameResult,
  menuIndex,
  setPlayerHP,
  setBossHP,
  setGameResult,
  triggerDialogue,
  navTo,
  playHoverTick,
  setMenuIndex,
}: GameArenaProps) {
  
  const solids: Rectangle[] = [
    { x: 0, y: 920, width: 300, height: 80 },
    { x: 300, y: 960, width: 400, height: 40 },
    { x: 700, y: 920, width: 300, height: 80 },
    { x: 0, y: 0, width: 1000, height: 50 },
    { x: 0, y: 0, width: 50, height: 1000 },
    { x: 950, y: 0, width: 50, height: 1000 },
    { x: 300, y: 650, width: 400, height: 40 },
    { x: 50, y: 420, width: 200, height: 40 },
    { x: 750, y: 420, width: 200, height: 40 }
  ];

  const hazards: Rectangle[] = [
    { x: 300, y: 920, width: 400, height: 80 }
  ];

  const hasTriggeredFirstHit = useRef<boolean>(false);
  const hasTriggeredPhase2 = useRef<boolean>(false);
  const hasTriggeredPhase3 = useRef<boolean>(false);
  const isCinematicActive = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    hasTriggeredFirstHit.current = false;
    hasTriggeredPhase2.current = false;
    hasTriggeredPhase3.current = false;
    isCinematicActive.current = false;

    PhysicsComponent.setSolids(solids);
    PhysicsComponent.setHazards(hazards);

    const activeSpawners: Spawner[] = [
      new Spawner("TURRET", 150, 370),   
      new Spawner("TURRET", 850, 370),   
      new Spawner("LANCER", 500, 600),   
      new Spawner("FLYER", 500, 300)     
    ];

    const pool = new ObjectPool(() => new Projectile(), 60);
    Registry.projectilePool = pool;

    const player = new Player("player-01");
    player.position = { x: 150, y: 800 };

    const boss = new Boss("boss-01");
    boss.position = { x: 850, y: 800 };

    Registry.player = player;
    Registry.boss = boss;

    Camera.reset();
    setGameResult("PLAYING");

    const handleUpdate = (dt: number) => {
      if (Camera.hitStopTimer > 0) {
        Camera.update(dt);
        return; 
      }

      Camera.update(dt);

      if (isCinematicActive.current) {
        player.velocity = { x: 0, y: 0 };
        boss.velocity = { x: 0, y: 0 };
        
        const activeProjectiles = [...pool.getActive()];
        for (const proj of activeProjectiles) {
          proj.update(dt);
        }
        inputProvider.postUpdate();
        return;
      }

      player.update(dt);
      boss.update(dt);

      // Update Spawners
      for (const spawner of activeSpawners) {
        spawner.update(dt);
      }

      // Update Minions
      const activeMinions = [...Registry.minions];
      for (const minion of activeMinions) {
        minion.update(dt);

        // Player-Minion contact damage check
        if (!player.isDead && !minion.isDead) {
          const pW = player.size.width / 2;
          const pH = player.size.height / 2;
          const mW = minion.size.width / 2;
          const mH = minion.size.height / 2;

          const isColliding = (
            player.position.x + pW > minion.position.x - mW &&
            player.position.x - pW < minion.position.x + mW &&
            player.position.y + pH > minion.position.y - mH &&
            player.position.y - pH < minion.position.y + mH
          );

          if (isColliding) {
            const playerHealth = player.getComponent(HealthComponent);
            if (playerHealth) {
              const damaged = playerHealth.takeDamage(1);
              if (damaged) {
                const knockbackDir = Math.sign(player.position.x - minion.position.x);
                player.velocity.x = (knockbackDir !== 0 ? knockbackDir : 1) * 450;
                player.velocity.y = -350;
              }
            }
          }
        }
      }

      const activeProjectiles = [...pool.getActive()];
      for (const proj of activeProjectiles) {
        proj.update(dt);
      }

      const pHealth = player.getComponent(HealthComponent);
      const bHealth = boss.getComponent(HealthComponent);

      if (pHealth) setPlayerHP(pHealth.currentHealth);
      if (bHealth) setBossHP(bHealth.currentHealth);

      // Dialogue triggers
      if (bHealth && bHealth.currentHealth < 30 && !hasTriggeredFirstHit.current) {
        hasTriggeredFirstHit.current = true;
        triggerDialogue("player", "I found you. Your control over this chamber ends now!");
      }

      if (bHealth && bHealth.currentHealth <= 21 && !hasTriggeredPhase2.current) {
        hasTriggeredPhase2.current = true;
        triggerDialogue("boss", "Insolent square! Prepare for my rapid volleys!");
      }

      if (bHealth && bHealth.currentHealth <= 12 && !hasTriggeredPhase3.current) {
        hasTriggeredPhase3.current = true;
        triggerDialogue("boss", "Danger! Max charge active! Omni-burst engaged!");
      }

      if (player.isDead) {
        isCinematicActive.current = true;
        triggerDialogue("player", "Power failing... system shutting down...");
        triggerDialogue("boss", "The cage remains ours. Another simulation completed.");
        
        setTimeout(() => {
          setGameResult("GAMEOVER");
          loop.stop();
        }, 3500);
      } else if (boss.isDead) {
        isCinematicActive.current = true;
        triggerDialogue("boss", "How... could a simple opponent... pacify me...");
        triggerDialogue("player", "The chamber has been cleared. Returning to terminal.");
        
        setTimeout(() => {
          setGameResult("VICTORY");
          loop.stop();
        }, 3500);
      }

      inputProvider.postUpdate();
    };

    const handleRender = () => {
      ctx.fillStyle = "#0c0d11"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(Camera.offsetX, Camera.offsetY);

      ctx.fillStyle = "#1e1e24"; 
      for (const solid of solids) {
        ctx.fillRect(solid.x, solid.y, solid.width, solid.height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
      }

      ctx.fillStyle = "hsl(350, 80%, 60%)"; 
      for (const hazard of hazards) {
        const spikeWidth = 25;
        const spikeCount = Math.floor(hazard.width / spikeWidth);
        for (let i = 0; i < spikeCount; i++) {
          ctx.beginPath();
          ctx.moveTo(hazard.x + i * spikeWidth, 960); 
          ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth / 2, 920); 
          ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth, 960); 
          ctx.fill();
        }
      }

      boss.draw(ctx);
      player.draw(ctx);

      // Draw Minions
      const activeMinionsToDraw = Registry.minions;
      for (const minion of activeMinionsToDraw) {
        minion.draw(ctx);
      }

      const activeProjectiles = pool.getActive();
      for (const proj of activeProjectiles) {
        proj.draw(ctx);
      }

      ctx.restore();
    };

    const loop = new GameLoop(handleUpdate, handleRender);
    loop.start();

    return () => {
      loop.cleanup();
      player.teardown();
      boss.teardown();
      pool.clear();
      Camera.reset();
      Registry.player = null;
      Registry.boss = null;
      Registry.projectilePool = null;

      // Clean up active spawners
      for (const spawner of activeSpawners) {
        spawner.cleanup();
      }
      Registry.minions = [];
    };
  }, []);

  return (
    <div className="w-full h-full" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ flexGrow: 1, position: "relative", display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>
        
        <canvas
          ref={canvasRef}
          width={1000}
          height={1000}
          className="crt-scanlines crt-flicker"
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", background: "#0c0d11", display: "block", margin: "auto" }}
        />

        {/* Red Vignette placed AFTER the canvas, forcing it to render on top */}
        <div className={`vignette-overlay ${playerHP === 1 ? "vignette-pulse" : ""}`} />

        {gameResult !== "PLAYING" && (
          <div className="gameover-overlay">
            {gameResult === "GAMEOVER" ? (
              <div className="flex-col-center" style={{ gap: "16px" }}>
                <h1 style={{ fontSize: "2.5rem", color: "#ef4444", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", textShadow: "0 0 15px rgba(239, 68, 68, 0.75)" }}>
                  GAME OVER
                </h1>
                <p style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                  The cabinet connection has been terminated.
                </p>
              </div>
            ) : (
              <div className="flex-col-center" style={{ gap: "16px" }}>
                <h1 style={{ fontSize: "2.5rem", color: "#22c55e", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", textShadow: "0 0 15px rgba(34, 197, 94, 0.75)" }}>
                  VICTORY
                </h1>
                <p style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                  The simulation has been completed.
                </p>
              </div>
            )}

            <div className="flex-row" style={{ gap: "16px", marginTop: "32px" }}>
              <button
                onClick={() => navTo("PLAYING")}
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