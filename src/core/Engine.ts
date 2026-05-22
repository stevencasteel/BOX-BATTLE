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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape: "spark" | "dust" | "ring";
}

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
  private deathTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dialogueTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dialogueStaggerTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dialogueClearTimeoutId: ReturnType<typeof setTimeout> | null = null;

  /* Pause Diagnostics */
  public isPaused: boolean = false;

  private unsubDialogue!: () => void;

  /* Particles Database */
  private particles: Particle[] = [];
  private unsubEvents: (() => void)[] = [];

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

    this.particles = [];

    // Spark Particles Listener
    this.unsubEvents.push(
      eventBroker.subscribe("SPAWN_SPARKS", ({ x, y, angle, color, radial, count }) => {
        const sparkCount = count || 12;
        for (let i = 0; i < sparkCount; i++) {
          const pAngle = radial 
            ? (i / sparkCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2)
            : angle + (Math.random() * 0.9 - 0.45);
          const pSpeed = radial
            ? 100 + Math.random() * 300
            : 160 + Math.random() * 280;
          this.particles.push({
            x,
            y,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed,
            color: color || "hsl(142, 71%, 58%)",
            size: 2.5 + Math.random() * 3.5,
            life: 0.22,
            maxLife: 0.22,
            shape: "spark"
          });
        }
      })
    );

    // Friction Dust Puff Listener
    this.unsubEvents.push(
      eventBroker.subscribe("SPAWN_DUST", ({ x, y }) => {
        const count = 10;
        for (let i = 0; i < count; i++) {
          const dir = i % 2 === 0 ? 1 : -1;
          const pSpeedX = dir * (50 + Math.random() * 110);
          const pSpeedY = -8 - Math.random() * 30;
          this.particles.push({
            x,
            y,
            vx: pSpeedX,
            vy: pSpeedY,
            color: "rgba(255, 255, 255, 0.40)",
            size: 3 + Math.random() * 3,
            life: 0.24,
            maxLife: 0.24,
            shape: "dust"
          });
        }
      })
    );

    // Shockwave Blast Ring Listener
    this.unsubEvents.push(
      eventBroker.subscribe("SPAWN_BLAST", ({ x, y, color }) => {
        this.particles.push({
          x,
          y,
          vx: 0,
          vy: 0,
          color,
          size: 8,
          life: 0.16,
          maxLife: 0.16,
          shape: "ring"
        });
      })
    );

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

    /* Update Particle Coordinates and age Lifespans */
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

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

    /* Render Active Particles */
    for (const p of this.particles) {
      const pct = p.life / p.maxLife;
      this.ctx.save();
      
      if (p.shape === "spark") {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } 
      else if (p.shape === "dust") {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.7);
      } 
      else if (p.shape === "ring") {
        const radius = p.size + (1.0 - pct) * 44;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 10 * pct;
        this.ctx.stroke();
      }
      
      if (this.isPaused) {
      /* Draw semi-transparent overlay */
      this.ctx.fillStyle = "rgba(12, 13, 17, 0.65)";
      this.ctx.fillRect(0, 0, 1250, 1250);

      /* Draw paused diagnostic text */
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 44px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("SIMULATION PAUSED", 625, 600);

      this.ctx.font = "bold 18px monospace";
      this.ctx.fillStyle = "var(--signal-green)";
      this.ctx.fillText("PRESS 'P' TO RESUME RUNTIME STEPPERS", 625, 650);
    }

    this.ctx.restore();
    }
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
    this.unsubEvents.forEach((unsub) => unsub());
    this.unsubEvents = [];
    this.particles = [];
    window.removeEventListener("keydown", this.handlePauseKey);

    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];
  }
}
