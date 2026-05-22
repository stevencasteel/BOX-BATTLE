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
import { BaseEntity } from "@/entities/BaseEntity";
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
    this.player.previousPosition = { ...defaultLevelConfig.playerStart };

    this.boss = new Boss("boss-01", this.world);
    this.boss.position = { ...defaultLevelConfig.bossStart };
    this.boss.previousPosition = { ...defaultLevelConfig.bossStart };

    this.world.player = this.player;
    this.world.boss = this.boss;

    this.activeSpawners = defaultLevelConfig.spawners.map(
      (s) => new Spawner(s.type, s.x, s.y, this.world)
    );

    Camera.reset();

    const sessionState = useSessionStore.getState();
    sessionState.setGameResult("PLAYING");

    this.projectState();

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

  public reset() {
    this.isPaused = false;
    this.accumulator = 0;

    Camera.reset();
    this.pool.clear();

    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];
    this.activeSpawners = defaultLevelConfig.spawners.map(
      (s) => new Spawner(s.type, s.x, s.y, this.world)
    );

    this.player.isDead = false;
    this.player.position = { ...defaultLevelConfig.playerStart };
    this.player.previousPosition = { ...defaultLevelConfig.playerStart };
    this.player.velocity = { x: 0, y: 0 };
    this.player.facingDirection = 1;
    this.player.hasDoubleJump = true;
    this.player.determinationCounter = 0;
    this.player.healingCharges = 0;
    this.player.hurtTimer = 0;
    this.player.visualScale = { x: 1, y: 1 };
    
    const pHealth = this.player.getComponent(HealthComponent);
    if (pHealth) {
      pHealth.reset();
    }

    this.player.dashComponent.isDashing = false;
    this.player.dashComponent.dashTimer = 0;
    this.player.dashComponent.dashCooldown = 0;
    this.player.dashComponent.canDash = true;
    this.player.dashComponent.ghosts = [];

    this.player.meleeComponent.attackCooldownTimer = 0;
    this.player.meleeComponent.attackActiveTimer = 0;
    this.player.meleeComponent.attackActive = false;
    this.player.meleeComponent.attackDirection = null;
    this.player.meleeComponent.hasHitEnemyThisSwing = false;

    this.player.fireballComponent.isCharging = false;
    this.player.fireballComponent.chargeTimer = 0;

    this.player.healComponent.isHealing = false;
    this.player.healComponent.healTimer = 0;

    this.boss.isDead = false;
    this.boss.position = { ...defaultLevelConfig.bossStart };
    this.boss.previousPosition = { ...defaultLevelConfig.bossStart };
    this.boss.velocity = { x: 0, y: 0 };
    this.boss.facingDirection = -1;
    this.boss.currentPhase = 1;
    this.boss.patrolSpeed = 200;
    this.boss.lungeSpeed = 1200;

    const bHealth = this.boss.getComponent(HealthComponent);
    if (bHealth) {
      bHealth.reset();
    }
    this.boss.stateMachine.changeState(this.boss.cooldownState);

    this.particleSystem.cleanup();
    this.particleSystem = new ParticleSystem();

    this.battleDirector.cleanup();
    this.battleDirector = new BattleDirector(() => this.stop());

    const sessionState = useSessionStore.getState();
    sessionState.setGameResult("PLAYING");

    this.projectState();
    
    eventBroker.publish("CLEAR_DIALOGUES", undefined);
  }

  private projectState() {
    const pHealth = this.player.getComponent(HealthComponent);
    const bHealth = this.boss.getComponent(HealthComponent);
    
    useGameplayStore.setState({
      playerHP: pHealth ? pHealth.currentHealth : 5,
      bossHP: bHealth ? bHealth.currentHealth : 30,
      healingCharges: this.player.healingCharges,
      determination: this.player.determinationCounter
    });
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
    inputProvider.update();
    if (Camera.hitStopTimer > 0) {
      Camera.update(dt);
      return;
    }

    Camera.update(dt);

    this.battleDirector.update(dt, this.player, this.boss);

    this.player.previousPosition = { ...this.player.position };
    this.boss.previousPosition = { ...this.boss.position };
    for (const minion of this.world.minions) {
      (minion as BaseEntity).previousPosition = { ...minion.position };
    }
    const activeProjectiles = this.pool.getActive();
    for (const proj of activeProjectiles) {
      proj.previousPosition = { ...proj.position };
    }

    if (this.battleDirector.isCinematicActive()) {
      this.player.velocity = { x: 0, y: 0 };
      this.boss.velocity = { x: 0, y: 0 };

      const activeProjectiles = [...this.pool.getActive()];
      for (let i = activeProjectiles.length - 1; i >= 0; i--) {
        activeProjectiles[i].update(dt);
      }
      inputProvider.postUpdate();
      this.projectState();
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

    const activeProjectilesUpdate = [...this.pool.getActive()];
    for (let i = activeProjectilesUpdate.length - 1; i >= 0; i--) {
      activeProjectilesUpdate[i].update(dt);
    }

    inputProvider.postUpdate();

    this.projectState();
  }

  private render() {
    const alpha = this.accumulator / this.fixedTimeStep;
    this.renderer.render(
      this.world,
      this.particleSystem.getParticles(),
      this.solids,
      this.onewayPlatforms,
      this.hazards,
      this.pool,
      this.isPaused,
      this.battleDirector.getDeathVisuals().timer,
      this.battleDirector.getDeathVisuals().pos,
      alpha
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
