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
import { useGameStore } from "@/store/useGameStore";

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

  const solids: Rectangle[] = [
    { x: 0, y: 1150, width: 400, height: 100 },
    { x: 850, y: 1150, width: 400, height: 100 },
    { x: 400, y: 1200, width: 450, height: 50 },
    { x: 0, y: 0, width: 1250, height: 50 },
    { x: 0, y: 0, width: 50, height: 1250 },
    { x: 1200, y: 0, width: 50, height: 1250 },
    { x: 425, y: 800, width: 400, height: 40 }
  ];

  const onewayPlatforms: Rectangle[] = [
    { x: 50, y: 550, width: 300, height: 20 },
    { x: 900, y: 550, width: 300, height: 20 }
  ];

  const hazards: Rectangle[] = [
    { x: 400, y: 1150, width: 450, height: 100 }
  ];

  const hasTriggeredFirstHit = useRef<boolean>(false);
  const hasTriggeredPhase2 = useRef<boolean>(false);
  const hasTriggeredPhase3 = useRef<boolean>(false);
  const isCinematicActive = useRef<boolean>(false);

  const bossDeathTimer = useRef<number>(-1);
  const bossDeathPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    hasTriggeredFirstHit.current = false;
    hasTriggeredPhase2.current = false;
    hasTriggeredPhase3.current = false;
    isCinematicActive.current = false;
    bossDeathTimer.current = -1;
    bossDeathPos.current = null;

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
    
    const state = useGameStore.getState();
    state.setGameResult("PLAYING");

    const handleUpdate = (dt: number) => {
      if (Camera.hitStopTimer > 0) {
        Camera.update(dt);
        return;
      }

      Camera.update(dt);

      if (bossDeathTimer.current >= 0) {
        bossDeathTimer.current += dt;
      }

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

      if (pHealth) state.setPlayerHP(pHealth.currentHealth);
      if (bHealth) state.setBossHP(bHealth.currentHealth);

      if (player.healingCharges !== state.healingCharges) {
        state.setHealingCharges(player.healingCharges);
      }
      if (player.determinationCounter !== state.determination) {
        state.setDetermination(player.determinationCounter);
      }

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

      if (player.isDead) {
        isCinematicActive.current = true;
        setTimeout(() => {
          state.setGameResult("GAMEOVER");
          loop.stop();
          triggerDialogue("player", "No... I can't go on...");
          triggerDialogue("boss", "You fought well... but I am victorious.");
        }, 3500);
      } else if (boss.isDead) {
        isCinematicActive.current = true;
        bossDeathTimer.current = 0;
        bossDeathPos.current = { x: boss.position.x, y: boss.position.y };

        Camera.shake(30, 1.8);

        setTimeout(() => {
          state.setGameResult("VICTORY");
          loop.stop();
          triggerDialogue("boss", "No... How could I lose this fight...");
          triggerDialogue("player", "It is over. The area is secure.");
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

      if (bossDeathTimer.current >= 0 && bossDeathPos.current) {
        const t = bossDeathTimer.current;
        const px = bossDeathPos.current.x;
        const py = bossDeathPos.current.y;

        if (t < 0.25) {
          const flashOpacity = Math.max(0, 0.85 * (1 - t / 0.25));
          ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const ringCount = 3;
        const speed = 750;
        for (let i = 0; i < ringCount; i++) {
          const delay = i * 0.15;
          const ringTime = t - delay;
          if (ringTime > 0 && ringTime < 1.2) {
            const radius = ringTime * speed;
            const opacity = Math.max(0, 1 - ringTime / 1.2);

            ctx.save();
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.85})`;
            ctx.lineWidth = Math.max(1, 14 * (1 - ringTime / 1.2));
            ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
            ctx.shadowBlur = 30 * (1 - ringTime / 1.2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
            ctx.lineWidth = Math.max(1, 4 * (1 - ringTime / 1.2));
            ctx.shadowBlur = 0;
            ctx.stroke();
            ctx.restore();
          }
        }

        const particleCount = 24;
        const particleSpeed = 550;
        const particleLife = 1.0;
        if (t < particleLife) {
          const opacity = Math.max(0, 1 - t / particleLife);
          ctx.save();
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          ctx.shadowBlur = 15;
          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + (i % 2 === 0 ? t * 0.5 : -t * 0.5);
            const distance = t * particleSpeed * (0.6 + 0.4 * (i % 3) / 3);
            const x = px + Math.cos(angle) * distance;
            const y = py + Math.sin(angle) * distance;

            ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
            ctx.fillRect(x - 4, y - 4, 8, 8);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fillRect(x - 2, y - 2, 4, 4);
          }
          ctx.restore();
        }
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

  const gameResult = useGameStore((state) => state.gameResult);
  const menuIndex = useGameStore((state) => state.menuIndex);
  const navTo = useGameStore((state) => state.navTo);
  const resetGameSession = useGameStore((state) => state.resetGameSession);
  const setMenuIndex = useGameStore((state) => state.setMenuIndex);
  const playerHP = useGameStore((state) => state.playerHP);

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
