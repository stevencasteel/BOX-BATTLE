import GameLoop from "@/core/GameLoop";
import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { soundSynth } from "@/core/SoundSynth";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { ObjectPool } from "@/core/ObjectPool";
import { Projectile } from "@/entities/Projectile";
import { Camera } from "@/core/Camera";
import { Spawner } from "@/entities/Spawner";
import { inputProvider } from "@/core/InputProvider";
import { useSessionStore, useGameplayStore } from "@/store/useGameStore";
import { World } from "@/core/World";
import { SimulationSystems } from "@/core/SimulationSystems";
import { eventBroker } from "@/core/eventBroker";
import { Rectangle, EntityStatus } from "@/core/Interfaces";
import { defaultLevelConfig } from "@/core/levelData";
import { WorldRenderer } from "@/core/WorldRenderer";
import { ParticleSystem } from "@/core/ParticleSystem";
import { BattleDirector } from "@/core/BattleDirector";

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
  private renderer!: WorldRenderer;

  private battleDirector!: BattleDirector;

  public isPaused: boolean = false;

  private unsubDialogue!: () => void;

  private particleSystem!: ParticleSystem;

  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60;

  private readonly solids: Rectangle[] = defaultLevelConfig.solids;
  private readonly onewayPlatforms: Rectangle[] = defaultLevelConfig.onewayPlatforms;
  private readonly hazards: Rectangle[] = defaultLevelConfig.hazards;

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
    this.systems.setup(
      () => this.player.position.x,
      () => this.boss.position.x,
      (id) => this.world.minions.find(m => m.id === id)?.position.x ?? 625
    );

    this.world = new World(this.solids, this.hazards, this.onewayPlatforms);
    this.renderer = new WorldRenderer(this.ctx);

    this.pool = new ObjectPool(() => new Projectile(), 60);
    this.world.projectilePool = this.pool;

    this.player = new Player("player-01", this.world);
    this.player.position = { ...defaultLevelConfig.playerStart };

    this.boss = new Boss("boss-01", this.world);
    this.boss.position = { ...defaultLevelConfig.bossStart };

    this.world.player = this.player;
    this.world.boss = this.boss;

    this.activeSpawners = defaultLevelConfig.spawners.map(
      (s) => new Spawner(s.type, s.x, s.y, this.world)
    );

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

    window.addEventListener("keydown", this.handlePauseKey);

    this.particleSystem = new ParticleSystem();
    this.battleDirector = new BattleDirector(() => this.stop());

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

  private handlePauseKey = (e: KeyboardEvent) => {
    if (e.code === "KeyP") {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        soundSynth.playErrorTick();
        soundSynth.clearAllSlides();
      } else {
        soundSynth.playHitConfirm();
      }
    }
  };

  private update(dt: number) {
    if (this.isPaused) {
      return;
    }
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

    this.battleDirector.update(dt, this.player, this.boss);

    if (this.battleDirector.isCinematicActive()) {
      this.player.velocity = { x: 0, y: 0 };
      this.boss.velocity = { x: 0, y: 0 };

      const activeProjectiles = [...this.pool.getActive()];
      for (let i = activeProjectiles.length - 1; i >= 0; i--) {
        activeProjectiles[i].update(dt);
      }
      inputProvider.postUpdate();
      return;
    }

    this.particleSystem.update(dt);

    this.player.update(dt);
    this.boss.update(dt);

    for (const spawner of this.activeSpawners) {
      spawner.update(dt);
    }

    for (let i = this.world.minions.length - 1; i >= 0; i--) {
      const minion = this.world.minions[i];
      minion.update(dt);

      const isMinionHazardous = minion.status === EntityStatus.ACTIVE;
      if (!this.player.isDead && isMinionHazardous) {
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

    const activeProjectiles = [...this.pool.getActive()];
    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
      activeProjectiles[i].update(dt);
    }



    inputProvider.postUpdate();
  }

  private render() {
    this.renderer.render(
      this.world,
      this.particleSystem.getParticles(),
      this.solids,
      this.onewayPlatforms,
      this.hazards,
      this.pool,
      this.isPaused,
      this.battleDirector.getDeathVisuals().timer,
      this.battleDirector.getDeathVisuals().pos
    );
  }

  public cleanup() {
    this.battleDirector.cleanup();
    this.loop.cleanup();
    this.player.teardown();
    this.boss.teardown();
    this.pool.clear();
    Camera.reset();
    this.systems.teardown();
    this.unsubDialogue();
    this.particleSystem.cleanup();
    window.removeEventListener("keydown", this.handlePauseKey);

    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];
  }
}
