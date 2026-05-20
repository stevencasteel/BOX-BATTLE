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
import { Spawner } from "@/entities/Spawner";
import { inputProvider } from "@/core/InputProvider";

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
  setHealingCharges?: (charges: number) => void;
  setDetermination?: (count: number) => void;
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
  setHealingCharges,
  setDetermination,
}: GameArenaProps) {

  const solids: Rectangle[] = [
    // Outer Border Blocks
    { x: 0, y: 1150, width: 400, height: 100 },  // Left Ground
    { x: 850, y: 1150, width: 400, height: 100 }, // Right Ground
    { x: 400, y: 1200, width: 450, height: 50 },  // Pit Floor
    { x: 0, y: 0, width: 1250, height: 50 },      // Ceiling
    { x: 0, y: 0, width: 50, height: 1250 },      // Left Wall
    { x: 1200, y: 0, width: 50, height: 1250 },   // Right Wall

    // Middle Floating solid block
    { x: 425, y: 800, width: 400, height: 40 }
  ];

  const onewayPlatforms: Rectangle[] = [
    { x: 50, y: 550, width: 300, height: 20 },   // Left middle perch
    { x: 900, y: 550, width: 300, height: 20 }   // Right middle perch
  ];

  const hazards: Rectangle[] = [
    { x: 400, y: 1150, width: 450, height: 100 }
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
    PhysicsComponent.setOnewayPlatforms(onewayPlatforms);

    const activeSpawners: Spawner[] = [
      new Spawner("TURRET", 175, 490),
      new Spawner("TURRET", 1075, 490),
      new Spawner("LANCER", 625, 740),
      new Spawner("FLYER", 625, 400)
    ];

    const pool = new ObjectPool(() => new Projectile(), 60);
    Registry.projectilePool = pool;

    const player = new Player("player-01");
    player.position = { x: 150, y: 1000 };

    const boss = new Boss("boss-01");
    boss.position = { x: 1050, y: 1000 };

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

      for (const spawner of activeSpawners) {
        spawner.update(dt);
      }

      const activeMinions = [...Registry.minions];
      for (const minion of activeMinions) {
        minion.update(dt);

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

      if (setHealingCharges) setHealingCharges(player.healingCharges);
      if (setDetermination) setDetermination(player.determinationCounter);

      // Plain Dialogue prompts
      if (bHealth && bHealth.currentHealth < 30 && !hasTriggeredFirstHit.current) {
        hasTriggeredFirstHit.current = true;
        triggerDialogue("player", "I found you. This battle ends now!");
      }

      if (bHealth && bHealth.currentHealth <= 21 && !hasTriggeredPhase2.current) {
        hasTriggeredPhase2.current = true;
        triggerDialogue("boss", "You won't beat me! Watch out for my rapid fire!");
      }

      if (bHealth && bHealth.currentHealth <= 12 && !hasTriggeredPhase3.current) {
        hasTriggeredPhase3.current = true;
        triggerDialogue("boss", "This is my final stand! Prepare yourself!");
      }

      // Final defeat sequence triggers
      if (player.isDead) {
        isCinematicActive.current = true;
        triggerDialogue("player", "No... I can't go on...");
        triggerDialogue("boss", "You fought well... but I am victorious.");

        setTimeout(() => {
          setGameResult("GAMEOVER");
          loop.stop();
        }, 3500);
      } else if (boss.isDead) {
        isCinematicActive.current = true;

        const parentEl = canvas.parentElement;
        if (parentEl) {
          const xPercent = (boss.position.x / 1250) * 100;
          const yPercent = (boss.position.y / 1250) * 100;

          const customEvent = new CustomEvent("boss-shockwave", { detail: { x: xPercent, y: yPercent } });
          window.dispatchEvent(customEvent);
        }

        triggerDialogue("boss", "No... How could I lose this fight...");
        triggerDialogue("player", "It is over. The area is secure.");

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

      ctx.fillStyle = "#2c3e50";
      for (const platform of onewayPlatforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
      }

      ctx.fillStyle = "hsl(350, 80%, 60%)";
      for (const hazard of hazards) {
        const spikeWidth = 25;
        const spikeCount = Math.floor(hazard.width / spikeWidth);
        for (let i = 0; i < spikeCount; i++) {
          ctx.beginPath();
          ctx.moveTo(hazard.x + i * spikeWidth, 1200);
          ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth / 2, 1150);
          ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth, 1200);
          ctx.fill();
        }
      }

      boss.draw(ctx);
      player.draw(ctx);

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