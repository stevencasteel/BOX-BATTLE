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

  private hasTriggeredFirstHit: boolean = false;
  private hasTriggeredPhase2: boolean = false;
  private hasTriggeredPhase3: boolean = false;
  private isCinematicActive: boolean = false;

  private bossDeathTimer: number = -1;
  private bossDeathPos: { x: number; y: number } | null = null;
  private deathTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dialogueTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dialogueStaggerTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dialogueClearTimeoutId: ReturnType<typeof setTimeout> | null = null;

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

    if (this.bossDeathTimer >= 0) {
      this.bossDeathTimer += dt;
    }

    if (this.isCinematicActive) {
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

    const bHealth = this.boss.getComponent(HealthComponent);
    if (bHealth && bHealth.currentHealth < 30 && !this.hasTriggeredFirstHit) {
      this.hasTriggeredFirstHit = true;
      eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "I found you. This battle ends now!" });
    }

    if (bHealth && bHealth.currentHealth <= 21 && !this.hasTriggeredPhase2) {
      this.hasTriggeredPhase2 = true;
      eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "You won't beat me! Watch out for my rapid fire!" });
      eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
    }

    if (bHealth && bHealth.currentHealth <= 12 && !this.hasTriggeredPhase3) {
      this.hasTriggeredPhase3 = true;
      eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "This is my final stand! Prepare yourself!" });
      eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
    }

    const sessionState = useSessionStore.getState();
    if (this.player.isDead && !this.isCinematicActive) {
      this.isCinematicActive = true;
      eventBroker.publish("CLEAR_DIALOGUES", undefined);
      soundSynth.clearAllSlides();
      soundSynth.stopChargeDrone();
      soundSynth.stopHealDrone();
      soundSynth.playPlayerExplosion();
      this.bossDeathTimer = 0;
      this.bossDeathPos = { x: this.player.position.x, y: this.player.position.y };

      eventBroker.publish("CAMERA_SHAKE", { amplitude: 30, duration: 1.8 });

      this.deathTimeoutId = setTimeout(() => {
        sessionState.setGameResult("GAMEOVER");
        this.stop();
        this.dialogueTimeoutId = setTimeout(() => {
          eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "No... I can't go on..." });
        }, 500);
        this.dialogueStaggerTimeoutId = setTimeout(() => {
          eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "You fought well... but I am victorious." });
        }, 1800);
        this.dialogueClearTimeoutId = setTimeout(() => {
          eventBroker.publish("CLEAR_DIALOGUES", undefined);
        }, 5200);
      }, 2000);
    } else if (this.boss.isDead && !this.isCinematicActive) {
      this.isCinematicActive = true;
      eventBroker.publish("CLEAR_DIALOGUES", undefined);
      soundSynth.clearAllSlides();
      soundSynth.stopChargeDrone();
      soundSynth.stopHealDrone();
      soundSynth.playBossExplosion();
      this.bossDeathTimer = 0;
      this.bossDeathPos = { x: this.boss.position.x, y: this.boss.position.y };

      eventBroker.publish("CAMERA_SHAKE", { amplitude: 30, duration: 1.8 });

      this.deathTimeoutId = setTimeout(() => {
        sessionState.setGameResult("VICTORY");
        this.stop();
        this.dialogueTimeoutId = setTimeout(() => {
          
          eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "boss", text: "No... How could I lose this fight..." });
        }, 500);
        this.dialogueStaggerTimeoutId = setTimeout(() => {
          eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "It is over. The area is secure." });
        }, 2800);
        this.dialogueClearTimeoutId = setTimeout(() => {
          eventBroker.publish("CLEAR_DIALOGUES", undefined);
        }, 5200);
      }, 2000);
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
      this.bossDeathTimer,
      this.bossDeathPos
    );
  }

  public cleanup() {
    if (this.deathTimeoutId !== null) {
      clearTimeout(this.deathTimeoutId);
      this.deathTimeoutId = null;
    }
    if (this.dialogueTimeoutId !== null) {
      clearTimeout(this.dialogueTimeoutId);
      this.dialogueTimeoutId = null;
    }
    if (this.dialogueStaggerTimeoutId !== null) {
      clearTimeout(this.dialogueStaggerTimeoutId);
      this.dialogueStaggerTimeoutId = null;
    }
    if (this.dialogueClearTimeoutId !== null) {
      clearTimeout(this.dialogueClearTimeoutId);
      this.dialogueClearTimeoutId = null;
    }
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
