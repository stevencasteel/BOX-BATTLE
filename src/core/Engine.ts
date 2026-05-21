import GameLoop from "@/core/GameLoop";
import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { Registry } from "@/core/Registry";
import { HealthComponent } from "@/components/HealthComponent";
import { ObjectPool } from "@/core/ObjectPool";
import { Projectile } from "@/entities/Projectile";
import { Camera } from "@/core/Camera";
import { Spawner } from "@/entities/Spawner";
import { inputProvider } from "@/core/InputProvider";
import { useSessionStore, useGameplayStore } from "@/store/useGameStore";
import { World } from "@/core/World";
import { SimulationSystems } from "@/core/SimulationSystems";
import { eventBroker } from "@/core/EventBroker";
import { Rectangle } from "@/core/Interfaces";

export class Engine {
  private ctx: CanvasRenderingContext2D;
  private triggerDialogue: (speaker: "player" | "boss", text: string) => void;

  private loop!: GameLoop;
  private systems!: SimulationSystems;
  private world!: World;
  private pool!: ObjectPool<Projectile>;
  private player!: Player;
  private boss!: Boss;
  private activeSpawners: Spawner[] = [];

  private hasTriggeredFirstHit: boolean = false;
  private hasTriggeredPhase2: boolean = false;
  private hasTriggeredPhase3: boolean = false;
  private isCinematicActive: boolean = false;

  private bossDeathTimer: number = -1;
  private bossDeathPos: { x: number; y: number } | null = null;
  private deathTimeoutId: any = null;

  private unsubDialogue!: () => void;

  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60;

  private readonly solids: Rectangle[] = [
    { x: 0, y: 1150, width: 400, height: 100 },
    { x: 850, y: 1150, width: 400, height: 100 },
    { x: 400, y: 1200, width: 450, height: 50 },
    { x: 0, y: 0, width: 1250, height: 50 },
    { x: 0, y: 0, width: 50, height: 1250 },
    { x: 1200, y: 0, width: 50, height: 1250 },
    { x: 425, y: 800, width: 400, height: 40 }
  ];

  private readonly onewayPlatforms: Rectangle[] = [
    { x: 50, y: 550, width: 300, height: 20 },
    { x: 900, y: 550, width: 300, height: 20 }
  ];

  private readonly hazards: Rectangle[] = [
    { x: 400, y: 1150, width: 450, height: 100 }
  ];

  constructor(
    canvas: HTMLCanvasElement,
    triggerDialogue: (speaker: "player" | "boss", text: string) => void
  ) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not construct 2D context.");
    }
    this.ctx = context;
    this.triggerDialogue = triggerDialogue;

    this.init();
  }

  private init() {
    this.systems = new SimulationSystems();
    this.systems.setup();

    this.world = new World(this.solids, this.hazards, this.onewayPlatforms);

    this.pool = new ObjectPool(() => new Projectile(), 60);
    this.world.projectilePool = this.pool;
    Registry.projectilePool = this.pool;

    this.player = new Player("player-01", this.world);
    this.player.position = { x: 150, y: 1000 };

    this.boss = new Boss("boss-01", this.world);
    this.boss.position = { x: 1050, y: 1000 };

    this.world.player = this.player;
    this.world.boss = this.boss;
    Registry.player = this.player;
    Registry.boss = this.boss;

    this.activeSpawners = [
      new Spawner("TURRET", 175, 490, this.world),
      new Spawner("TURRET", 1075, 490, this.world),
      new Spawner("LANCER", 625, 740, this.world),
      new Spawner("FLYER", 625, 400, this.world)
    ];

    Camera.reset();

    const sessionState = useSessionStore.getState();
    const gameplayState = useGameplayStore.getState();
    sessionState.setGameResult("PLAYING");

    const pHealth = this.player.getComponent(HealthComponent);
    const bHealth = this.boss.getComponent(HealthComponent);
    if (pHealth) gameplayState.setPlayerHP(pHealth.currentHealth);
    if (bHealth) gameplayState.setBossHP(bHealth.currentHealth);
    gameplayState.setHealingCharges(this.player.healingCharges);
    gameplayState.setDetermination(this.player.determinationCounter);

    this.unsubDialogue = eventBroker.subscribe("DIALOGUE_TRIGGERED", ({ speaker, text }) => {
      this.triggerDialogue(speaker, text);
    });

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );
  }

  public start() {
    this.loop.start();
  }

  public stop() {
    this.loop.stop();
  }

    private update(dt: number) {
    this.accumulator += dt;
    if (this.accumulator > 0.25) {
      this.accumulator = 0.25;
    }

    while (this.accumulator >= this.fixedTimeStep) {
      this.fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }
  }

  private fixedUpdate(dt: number) {
    if (Camera.hitStopTimer > 0) {
      Camera.update(dt);
      return;
    }

    Camera.update(dt);

    if (this.bossDeathTimer >= 0) {
      this.bossDeathTimer += dt;
    }

    if (this.isCinematicActive) {
      this.player.velocity = { x: 0, y: 0 };
      this.boss.velocity = { x: 0, y: 0 };

      const activeProjectiles = this.pool.getActive();
      for (let i = activeProjectiles.length - 1; i >= 0; i--) {
        activeProjectiles[i].update(dt);
      }
      inputProvider.postUpdate();
      return;
    }

    this.player.update(dt);
    this.boss.update(dt);

    for (const spawner of this.activeSpawners) {
      spawner.update(dt);
    }

    for (let i = this.world.minions.length - 1; i >= 0; i--) {
      const minion = this.world.minions[i];
      minion.update(dt);

      if (!this.player.isDead && !minion.isDead) {
        const pW = this.player.size.width / 2;
        const pH = this.player.size.height / 2;
        const mW = minion.size.width / 2;
        const mH = minion.size.height / 2;

        const isColliding = (
          this.player.position.x + pW > minion.position.x - mW &&
          this.player.position.x - pW < minion.position.x + mW &&
          this.player.position.y + pH > minion.position.y - mH &&
          this.player.position.y - pH < minion.position.y + mH
        );

        if (isColliding) {
          const playerHealth = this.player.getComponent(HealthComponent);
          if (playerHealth) {
            const damaged = playerHealth.takeDamage(1);
            if (damaged) {
              const knockbackDir = Math.sign(this.player.position.x - minion.position.x);
              this.player.velocity.x = (knockbackDir !== 0 ? knockbackDir : 1) * 450;
              this.player.velocity.y = -350;
            }
          }
        }
      }
    }

    const activeProjectiles = this.pool.getActive();
    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
      activeProjectiles[i].update(dt);
    }

    const bHealth = this.boss.getComponent(HealthComponent);
    if (bHealth && bHealth.currentHealth < 30 && !this.hasTriggeredFirstHit) {
      this.hasTriggeredFirstHit = true;
      eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "I found you. This battle ends now!" });
    }

    if (bHealth && bHealth.currentHealth <= 21 && !this.hasTriggeredPhase2) {
      this.hasTriggeredPhase2 = true;
      eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "You won't beat me! Watch out for my rapid fire!" });
    }

    if (bHealth && bHealth.currentHealth <= 12 && !this.hasTriggeredPhase3) {
      this.hasTriggeredPhase3 = true;
      eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "This is my final stand! Prepare yourself!" });
    }

    const sessionState = useSessionStore.getState();
    if (this.player.isDead && !this.isCinematicActive) {
      this.isCinematicActive = true;
      this.bossDeathTimer = 0;
      this.bossDeathPos = { x: this.player.position.x, y: this.player.position.y };

      eventBroker.publish("CAMERA_SHAKE", { amplitude: 30, duration: 1.8 });

      this.deathTimeoutId = setTimeout(() => {
        sessionState.setGameResult("GAMEOVER");
        this.stop();
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "No... I can't go on..." });
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "You fought well... but I am victorious." });
      }, 3500);
    } else if (this.boss.isDead && !this.isCinematicActive) {
      this.isCinematicActive = true;
      this.bossDeathTimer = 0;
      this.bossDeathPos = { x: this.boss.position.x, y: this.boss.position.y };

      eventBroker.publish("CAMERA_SHAKE", { amplitude: 30, duration: 1.8 });

      this.deathTimeoutId = setTimeout(() => {
        sessionState.setGameResult("VICTORY");
        this.stop();
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "No... How could I lose this fight..." });
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "It is over. The area is secure." });
      }, 3500);
    }

    inputProvider.postUpdate();
  }

  private render() {
    this.ctx.fillStyle = "#0c0d11";
    this.ctx.fillRect(0, 0, 1250, 1250);

    this.ctx.save();
    this.ctx.translate(Camera.offsetX, Camera.offsetY);

    this.ctx.fillStyle = "#1e1e24";
    for (const solid of this.solids) {
      this.ctx.fillRect(solid.x, solid.y, solid.width, solid.height);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      this.ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
    }

    this.ctx.fillStyle = "#2c3e50";
    for (const platform of this.onewayPlatforms) {
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }

    this.ctx.fillStyle = "hsl(350, 80%, 60%)";
    for (const hazard of this.hazards) {
      const spikeWidth = 25;
      const spikeCount = Math.floor(hazard.width / spikeWidth);
      for (let i = 0; i < spikeCount; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(hazard.x + i * spikeWidth, 1200);
        this.ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth / 2, 1150);
        this.ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth, 1200);
        this.ctx.fill();
      }
    }

    this.boss.draw(this.ctx);
    this.player.draw(this.ctx);

    const activeMinionsToDraw = this.world.minions;
    for (const minion of activeMinionsToDraw) {
      minion.draw(this.ctx);
    }

    const activeProjectiles = this.pool.getActive();
    for (const proj of activeProjectiles) {
      proj.draw(this.ctx);
    }

    if (this.bossDeathTimer >= 0 && this.bossDeathPos) {
      const t = this.bossDeathTimer;
      const px = this.bossDeathPos.x;
      const py = this.bossDeathPos.y;

      if (t < 0.25) {
        const flashOpacity = Math.max(0, 0.85 * (1 - t / 0.25));
        this.ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        this.ctx.fillRect(0, 0, 1250, 1250);
      }

      const ringCount = 3;
      const speed = 750;
      for (let i = 0; i < ringCount; i++) {
        const delay = i * 0.15;
        const ringTime = t - delay;
        if (ringTime > 0 && ringTime < 1.2) {
          const radius = ringTime * speed;
          const opacity = Math.max(0, 1 - ringTime / 1.2);

          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(px, py, radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.85})`;
          this.ctx.lineWidth = Math.max(1, 14 * (1 - ringTime / 1.2));
          this.ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
          this.ctx.shadowBlur = 30 * (1 - ringTime / 1.2);
          this.ctx.stroke();

          this.ctx.beginPath();
          this.ctx.arc(px, py, radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
          this.ctx.lineWidth = Math.max(1, 4 * (1 - ringTime / 1.2));
          this.ctx.shadowBlur = 0;
          this.ctx.stroke();
          this.ctx.restore();
        }
      }

      const particleCount = 24;
      const particleSpeed = 550;
      const particleLife = 1.0;
      if (t < particleLife) {
        const opacity = Math.max(0, 1 - t / particleLife);
        this.ctx.save();
        this.ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        this.ctx.shadowBlur = 15;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + (i % 2 === 0 ? t * 0.5 : -t * 0.5);
          const distance = t * particleSpeed * (0.6 + 0.4 * (i % 3) / 3);
          const x = px + Math.cos(angle) * distance;
          const y = py + Math.sin(angle) * distance;

          this.ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
          this.ctx.fillRect(x - 4, y - 4, 8, 8);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        this.ctx.restore();
      }
    }

    this.ctx.restore();
  }

  public cleanup() {
    if (this.deathTimeoutId !== null) {
      clearTimeout(this.deathTimeoutId);
      this.deathTimeoutId = null;
    }
    this.loop.cleanup();
    this.player.teardown();
    this.boss.teardown();
    this.pool.clear();
    Camera.reset();
    this.systems.teardown();
    this.unsubDialogue();
    Registry.player = null;
    Registry.boss = null;
    Registry.projectilePool = null;

    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];
    Registry.minions = [];
  }
}
