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
import { defaultLevelConfig, LevelConfig } from "@/core/levelData";
import { WorldRenderer } from "@/core/WorldRenderer";
import { ParticleSystem } from "@/core/ParticleSystem";
import { BattleDirector } from "@/core/BattleDirector";
import { UNITS } from "@/core/Units";

export class Engine {
  private ctx: CanvasRenderingContext2D;
  private renderer!: WorldRenderer;

  private loop!: GameLoop;
  private systems!: SimulationSystems;
  private world!: World;
  private battleDirector!: BattleDirector;
  private particleSystem!: ParticleSystem;

  private pool!: ObjectPool<Projectile>;
  private player!: Player;
  private boss!: Boss;
  private activeSpawners: Spawner[] = [];
  private springPlatforms: { rect: Rectangle; offsetY: number; velocityY: number }[] = [];
  private unsubPlatformImpact!: () => void;

  private cachedPlayerHP: number = -1;
  private cachedBossHP: number = -1;
  private cachedHealingCharges: number = -1;
  private cachedDetermination: number = -1;

  public isPaused: boolean = false;
  private accumulator: number = 0;
  private currentScale: number = 1.0;
  private crisisTimer: number = 0;
  private readonly fixedTimeStep: number = 1 / 60;

  private levelConfig: LevelConfig;
  private solids: Rectangle[] = [];
  private onewayPlatforms: Rectangle[] = [];
  private hazards: Rectangle[] = [];

  constructor(canvas: HTMLCanvasElement, levelConfig: LevelConfig = defaultLevelConfig) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not construct 2D context.");
    }
    this.ctx = context;
    this.levelConfig = levelConfig;

    this.solids = this.levelConfig.solids;
    this.onewayPlatforms = this.levelConfig.onewayPlatforms;
    this.hazards = this.levelConfig.hazards;

    this.init();
  }

  private init() {
    this.systems = new SimulationSystems();
    this.systems.setup(
      () => this.player.position.x,
      () => this.boss.position.x,
      (id) => this.world.minions.find((m) => m.id === id)?.position.x ?? 625
    );

    this.world = new World(this.solids, this.hazards, this.onewayPlatforms);
    this.renderer = new WorldRenderer(this.ctx);

    this.pool = new ObjectPool(() => new Projectile(), 60);
    this.world.projectilePool = this.pool;

    this.player = new Player("player-01", this.world);
    this.player.position = { ...this.levelConfig.playerStart };
    this.player.previousPosition = { ...this.levelConfig.playerStart };

    this.boss = new Boss("boss-01", this.world);
    this.boss.position = { ...this.levelConfig.bossStart };
    this.boss.previousPosition = { ...this.levelConfig.bossStart };

    this.world.player = this.player;
    this.world.boss = this.boss;

    this.activeSpawners = this.levelConfig.spawners.map((s) => new Spawner(s.type, s.x, s.y, this.world));

    Camera.reset();

    const sessionState = useSessionStore.getState();
    sessionState.setGameResult("PLAYING");

    this.projectState();

    this.particleSystem = new ParticleSystem();
    this.battleDirector = new BattleDirector(() => {});

    this.springPlatforms = this.levelConfig.onewayPlatforms.map((rect) => ({
      rect,
      offsetY: 0,
      velocityY: 0,
    }));

    this.unsubPlatformImpact = eventBroker.subscribe("PLATFORM_IMPACT", ({ platform, velocityY, massMultiplier }) => {
      const sp = this.springPlatforms.find((s) => s.rect === platform);
      if (sp) {
        sp.velocityY += velocityY * massMultiplier * 0.25;
      }
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

  public reset() {
    this.isPaused = false;
    this.accumulator = 0;
    Camera.reset();
    this.pool.clear();

    const overlay = this.ctx.canvas.parentElement?.querySelector(".vignette-overlay") as HTMLDivElement | null;
    if (overlay) {
      overlay.classList.remove("vignette-pulse");
    }

    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];
    this.activeSpawners = this.levelConfig.spawners.map((s) => new Spawner(s.type, s.x, s.y, this.world));

    this.resetEntity(this.player, this.levelConfig.playerStart, 1);
    this.resetEntity(this.boss, this.levelConfig.bossStart, -1);
    this.boss.currentPhase = 1;
    this.boss.patrolSpeed = 200;
    this.boss.lungeSpeed = 1200;
    this.boss.stateMachine.changeState(this.boss.cooldownState);

    this.particleSystem.cleanup();
    this.particleSystem = new ParticleSystem();

    for (const sp of this.springPlatforms) {
      sp.offsetY = 0;
      sp.velocityY = 0;
    }

    this.battleDirector.cleanup();
    this.battleDirector = new BattleDirector(() => {});

    const sessionState = useSessionStore.getState();
    sessionState.setGameResult("PLAYING");

    this.projectState();
    eventBroker.publish("CLEAR_DIALOGUES", undefined);

    this.render();
    requestAnimationFrame(() => {
      this.start();
    });
  }

  private resetEntity(entity: Player | Boss, startPos: { x: number; y: number }, facing: number) {
    entity.isDead = false;
    entity.position = { ...startPos };
    entity.previousPosition = { ...startPos };
    entity.velocity = { x: 0, y: 0 };
    entity.facingDirection = facing;

    if (entity instanceof Player) {
      entity.hasDoubleJump = true;
      entity.determinationCounter = 0;
      entity.healingCharges = 0;
      entity.hurtTimer = 0;
      entity.recoilTimer = 0;
      entity.visualScale = { x: 1, y: 1 };

      entity.dashComponent.isDashing = false;
      entity.dashComponent.dashTimer = 0;
      entity.dashComponent.dashCooldown = 0;
      entity.dashComponent.canDash = true;
      entity.dashComponent.ghosts = [];

      entity.meleeComponent.attackCooldownTimer = 0;
      entity.meleeComponent.attackActiveTimer = 0;
      entity.meleeComponent.attackActive = false;
      entity.meleeComponent.attackDirection = null;
      entity.meleeComponent.hasHitEnemyThisSwing = false;

      entity.fireballComponent.isCharging = false;
      entity.fireballComponent.chargeTimer = 0;

      entity.healComponent.isHealing = false;
      entity.healComponent.healTimer = 0;
    }

    const health = entity.getComponent(HealthComponent);
    if (health) {
      health.reset();
    }
  }

  private projectState() {
    const pHealth = this.player.getComponent(HealthComponent);
    const bHealth = this.boss.getComponent(HealthComponent);

    const nextPlayerHP = pHealth ? pHealth.currentHealth : UNITS.PLAYER_MAX_HP;
    const nextBossHP = bHealth ? bHealth.currentHealth : UNITS.BOSS_MAX_HP;
    const nextHealingCharges = this.player.healingCharges;
    const nextDetermination = this.player.determinationCounter;

    if (
      nextPlayerHP !== this.cachedPlayerHP ||
      nextBossHP !== this.cachedBossHP ||
      nextHealingCharges !== this.cachedHealingCharges ||
      nextDetermination !== this.cachedDetermination
    ) {
      // Trigger temporary slomo surge only on the exact frame the player transitions to 1 HP
      if (nextPlayerHP === 1 && this.cachedPlayerHP > 1) {
        this.crisisTimer = 0.45;
      }

      this.cachedPlayerHP = nextPlayerHP;
      this.cachedBossHP = nextBossHP;
      this.cachedHealingCharges = nextHealingCharges;
      this.cachedDetermination = nextDetermination;

      useGameplayStore.setState({
        playerHP: nextPlayerHP,
        bossHP: nextBossHP,
        healingCharges: nextHealingCharges,
        determination: nextDetermination,
      });
    }
  }

  private update(dt: number) {
    if (this.isPaused) {
      inputProvider.update();
      if (inputProvider.isPauseJustPressed()) {
        this.isPaused = false;
        soundSynth.playHitConfirm();
      }
      inputProvider.postUpdate();
      return;
    }

    // Decrement the crisis adrenaline slow-motion timer
    if (this.crisisTimer > 0) {
      this.crisisTimer -= dt;
    }

    // Smoothly scale simulation time based on the active adrenaline surge timer
    const targetScale = this.crisisTimer > 0 ? 0.45 : 1.0;
    this.currentScale += (targetScale - this.currentScale) * 6.0 * dt;

    this.accumulator += dt * this.currentScale;
    if (this.accumulator > 0.25) {
      this.accumulator = 0.25;
    }

    while (this.accumulator >= this.fixedTimeStep) {
      this.fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }
  }

  private cachePreIntegrationPositions() {
    this.player.previousPosition = { ...this.player.position };
    this.boss.previousPosition = { ...this.boss.position };
    for (const minion of this.world.minions) {
      (minion as BaseEntity).previousPosition = { ...minion.position };
    }
    for (const proj of this.pool.getActive()) {
      proj.previousPosition = { ...proj.position };
    }
  }

  private handleCinematicUpdate(dt: number) {
    this.player.velocity = { x: 0, y: 0 };
    this.boss.velocity = { x: 0, y: 0 };

    const activeProjectiles = this.pool.getActive();
    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
      if (activeProjectiles[i].update(dt)) {
        this.pool.releaseAt(i);
      }
    }
    inputProvider.postUpdate();
    this.projectState();
  }

  private handleMinionCollisions() {
    for (let i = this.world.minions.length - 1; i >= 0; i--) {
      const minion = this.world.minions[i];
      minion.update(this.fixedTimeStep);

      if (this.player.isDead || minion.status !== EntityStatus.ACTIVE) continue;

      const pW = this.player.size.width / 2;
      const pH = this.player.size.height / 2;
      const mW = minion.size.width / 2;
      const mH = minion.size.height / 2;

      const isColliding =
        this.player.position.x + pW > minion.position.x - mW &&
        this.player.position.x - pW < minion.position.x + mW &&
        this.player.position.y + pH > minion.position.y - mH &&
        this.player.position.y - pH < minion.position.y + mH;

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

  private fixedUpdate(dt: number) {
    inputProvider.update();
    if (inputProvider.isPauseJustPressed()) {
      this.isPaused = true;
      soundSynth.playErrorTick();
      soundSynth.clearAllSlides();
      inputProvider.postUpdate();
      return;
    }
    if (Camera.hitStopTimer > 0) {
      Camera.update(dt);
      return;
    }

    Camera.update(dt);

    const K = 320;
    const D = 14;
    for (const sp of this.springPlatforms) {
      const force = -K * sp.offsetY - D * sp.velocityY;
      sp.velocityY += force * dt;
      sp.offsetY += sp.velocityY * dt;
    }

    this.battleDirector.update(dt, this.player, this.boss);

    this.cachePreIntegrationPositions();

    if (this.battleDirector.isCinematicActive()) {
      this.handleCinematicUpdate(dt);
      return;
    }

    this.particleSystem.update(dt);

    this.player.update(dt);
    this.boss.update(dt);

    for (const spawner of this.activeSpawners) {
      spawner.update(dt);
    }

    this.handleMinionCollisions();

    const activeProjectiles = this.pool.getActive();
    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
      if (activeProjectiles[i].update(dt)) {
        this.pool.releaseAt(i);
      }
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
      this.springPlatforms,
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
    this.particleSystem.cleanup();

    if (this.unsubPlatformImpact) {
      this.unsubPlatformImpact();
    }

    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];
  }
}
