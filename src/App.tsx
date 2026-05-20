import { useEffect, useRef, useState } from "react";
import GameLoop from "@/core/GameLoop";
import { inputProvider } from "@/core/InputProvider";
import { PhysicsComponent, Rectangle } from "@/components/PhysicsComponent";
import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { Registry } from "@/core/Registry";
import { HealthComponent } from "@/components/HealthComponent";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [playerHP, setPlayerHP] = useState(5);
  const [bossHP, setBossHP] = useState(30);
  const [gameResult, setGameResult] = useState<"PLAYING" | "GAMEOVER" | "VICTORY">("PLAYING");

  const solids: Rectangle[] = [
    { x: 0, y: 920, width: 1000, height: 80 },
    { x: 0, y: 0, width: 1000, height: 50 },
    { x: 0, y: 0, width: 50, height: 1000 },
    { x: 950, y: 0, width: 50, height: 1000 },
    { x: 300, y: 650, width: 400, height: 40 },
    { x: 50, y: 420, width: 250, height: 40 },
    { x: 700, y: 420, width: 250, height: 40 }
  ];

  const restartGame = () => {
    window.location.reload();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    PhysicsComponent.setSolids(solids);

    const player = new Player("player-01");
    player.position = { x: 200, y: 800 };

    const boss = new Boss("boss-01");
    boss.position = { x: 800, y: 800 };

    Registry.player = player;
    Registry.boss = boss;

    const handleUpdate = (dt: number) => {
      player.update(dt);
      boss.update(dt);

      const pHealth = player.getComponent(HealthComponent);
      const bHealth = boss.getComponent(HealthComponent);

      if (pHealth) setPlayerHP(pHealth.currentHealth);
      if (bHealth) setBossHP(bHealth.currentHealth);

      if (player.isDead) {
        setGameResult("GAMEOVER");
      } else if (boss.isDead) {
        setGameResult("VICTORY");
      }

      inputProvider.postUpdate();
    };

    const handleRender = () => {
      ctx.fillStyle = "#0c0d11"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#1e1e24"; 
      for (const solid of solids) {
        ctx.fillRect(solid.x, solid.y, solid.width, solid.height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
      }

      boss.draw(ctx);
      player.draw(ctx);
    };

    const loop = new GameLoop(handleUpdate, handleRender);
    loop.start();

    return () => {
      loop.cleanup();
      player.teardown();
      boss.teardown();
      Registry.player = null;
      Registry.boss = null;
    };
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#050505] p-4 select-none relative">
      <div className="relative rounded-2xl border border-white/5 bg-[#0c0d11] p-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.95)] max-h-[85vh] max-w-[85vh] aspect-square">
        <canvas
          ref={canvasRef}
          width={1000}
          height={1000}
          className="rounded-xl block w-full h-full object-contain"
        />

        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col gap-1 bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg pointer-events-auto">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Player HP</span>
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-sm border ${
                      i < playerHP
                        ? "bg-green-500 border-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                        : "bg-void border-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg w-48 sm:w-64 pointer-events-auto">
              <div className="flex justify-between w-full text-[10px] font-mono uppercase tracking-widest">
                <span className="text-red-400 font-bold">Ruler Box</span>
                <span className="text-muted">{bossHP}/30</span>
              </div>
              <div className="w-full h-2 bg-void border border-white/10 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-150 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                  style={{ width: `${(bossHP / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {gameResult !== "PLAYING" && (
            <div className="absolute inset-0 bg-void/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-6 pointer-events-auto z-50">
              {gameResult === "GAMEOVER" ? (
                <div className="text-center space-y-4">
                  <h1 className="text-3xl md:text-5xl font-mono font-bold uppercase tracking-widest text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
                    Transmission Lost
                  </h1>
                  <p className="text-xs font-mono text-muted uppercase tracking-widest">
                    The cabinet connection has been terminated.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <h1 className="text-3xl md:text-5xl font-mono font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-blue-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.7)]">
                    Ruler Decimated
                  </h1>
                  <p className="text-xs font-mono text-muted uppercase tracking-widest">
                    The square room has been pacified successfully.
                  </p>
                </div>
              )}

              <button
                onClick={restartGame}
                className="mt-8 font-mono font-bold text-xs uppercase tracking-widest border border-white/10 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white cursor-none"
              >
                [ Restart Simulation ]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
