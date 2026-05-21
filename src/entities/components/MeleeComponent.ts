import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { eventBroker } from "@/core/eventBroker";
import { IDamageRecorder, EntityStatus } from "@/core/Interfaces";


export class MeleeComponent implements IEntityComponent {
  public owner!: BaseEntity;
  
  public attackCooldownTimer: number = 0;
  public attackActiveTimer: number = 0;
  public attackActive: boolean = false;
  public attackDirection: "side" | "up" | "down" | null = null;
  public hasHitEnemyThisSwing: boolean = false;

  private readonly pogoForce: number = 450;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public update(dt: number): void {
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= dt;
    if (this.attackActiveTimer > 0) this.attackActiveTimer -= dt;

    if (this.attackActive && this.attackActiveTimer <= 0) {
      this.attackActive = false;
      this.attackDirection = null;
    }

    if (this.attackActive && !this.hasHitEnemyThisSwing) {
      if (this.attackDirection === "down") {
        this.checkPogoAttack();
      } else {
        this.checkMeleeAttackContact();
      }
    }
  }

  public triggerAttack(direction: "side" | "up" | "down"): void {
    this.attackActive = true;
    this.attackActiveTimer = 0.09;
    this.attackCooldownTimer = 0.15;
    this.hasHitEnemyThisSwing = false;
    this.attackDirection = direction;

    eventBroker.publish("PLAYER_ATTACKED", { direction });
  }

  private checkMeleeAttackContact() {
    const targets: BaseEntity[] = [];
    if (this.owner.world.boss && !this.owner.world.boss.isDead) {
      targets.push(this.owner.world.boss as BaseEntity);
    }
    for (const minion of this.owner.world.minions) {
      if (minion && minion.status === EntityStatus.ACTIVE) {
        targets.push(minion as BaseEntity);
      }
    }

    const facing = (this.owner as any).facingDirection ?? 1;

    for (const target of targets) {
      let isHit = false;
      let distance = 0;

      if (this.attackDirection === "side") {
        /* Side Slash Sweep (Circular radial segment check matching visual arc) */
        const cx = this.owner.position.x + (facing * 35);
        const cy = this.owner.position.y;
        
        const dx = target.position.x - cx;
        const dy = target.position.y - cy;
        distance = Math.sqrt(dx * dx + dy * dy);

        const withinReach = distance <= 95 + (target.size.width / 2);
        const withinDirection = (facing > 0 && target.position.x >= cx - 25) || (facing < 0 && target.position.x <= cx + 25);

        if (withinReach && withinDirection) {
          isHit = true;
        }
      } else if (this.attackDirection === "up") {
        /* Up Slash Sweep (Circular radial segment check matching visual arc) */
        const cx = this.owner.position.x;
        const cy = this.owner.position.y - 35;

        const dx = target.position.x - cx;
        const dy = target.position.y - cy;
        distance = Math.sqrt(dx * dx + dy * dy);

        const withinReach = distance <= 95 + (target.size.height / 2);
        const withinDirection = target.position.y <= cy + 25;

        if (withinReach && withinDirection) {
          isHit = true;
        }
      }

      if (isHit) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          const isCloseRange = distance <= 75;
          const damage = isCloseRange ? 5 : 1;

          const damaged = health.takeDamage(damage);
          if (damaged) {
            this.hasHitEnemyThisSwing = true;
            const recorder = this.owner as unknown as IDamageRecorder;
            if (recorder.registerDamageDealt) {
              recorder.registerDamageDealt();
            }

            if (isCloseRange) {
              eventBroker.publish("CAMERA_SHAKE", { amplitude: 8, duration: 0.15 });
            }
            eventBroker.publish("SPAWN_SPARKS" as any, {
              x: target.position.x,
              y: target.position.y,
              angle: facing > 0 ? 0 : Math.PI,
              color: "hsl(142, 71%, 58%)"
            });
          }
        }
      }
    }

    const activeProjectiles = [...this.owner.world.getProjectiles()];
    for (const proj of activeProjectiles) {
      if (proj.isActive && proj.ownerId === "boss") {
        let isHit = false;

        if (this.attackDirection === "side") {
          const cx = this.owner.position.x + (facing * 35);
          const cy = this.owner.position.y;
          const dx = proj.position.x - cx;
          const dy = proj.position.y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const withinReach = distance <= 95 + (proj.size.width / 2);
          const withinDirection = (facing > 0 && proj.position.x >= cx - 25) || (facing < 0 && proj.position.x <= cx + 25);

          if (withinReach && withinDirection) {
            isHit = true;
          }
        } else if (this.attackDirection === "up") {
          const cx = this.owner.position.x;
          const cy = this.owner.position.y - 35;
          const dx = proj.position.x - cx;
          const dy = proj.position.y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const withinReach = distance <= 95 + (proj.size.height / 2);
          const withinDirection = proj.position.y <= cy + 25;

          if (withinReach && withinDirection) {
            isHit = true;
          }
        }

        if (isHit) {
          this.owner.world.releaseProjectile(proj);
          this.hasHitEnemyThisSwing = true;
          const recorder = this.owner as unknown as IDamageRecorder;
          if (recorder.registerDamageDealt) {
            recorder.registerDamageDealt();
          }
          eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
        }
      }
    }
  }

  public checkPogoAttack() {
    const pogoHitbox = {
      x: this.owner.position.x - 45,
      y: this.owner.position.y + 40,
      width: 90,
      height: 44.5
    };

    const targets: BaseEntity[] = [];
    if (this.owner.world.boss && !this.owner.world.boss.isDead) {
      targets.push(this.owner.world.boss as BaseEntity);
    }
    for (const minion of this.owner.world.minions) {
      if (minion && minion.status === EntityStatus.ACTIVE) {
        targets.push(minion as BaseEntity);
      }
    }

    for (const target of targets) {
      const halfW = target.size.width / 2;
      const halfH = target.size.height / 2;

      const isHit = (
        pogoHitbox.x + pogoHitbox.width > target.position.x - halfW &&
        pogoHitbox.x < target.position.x + halfW &&
        pogoHitbox.y + pogoHitbox.height > target.position.y - halfH &&
        pogoHitbox.y < target.position.y + halfH
      );

      if (isHit) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          health.takeDamage(1);
          const recorder = this.owner as unknown as IDamageRecorder;
          if (recorder.registerDamageDealt) {
            recorder.registerDamageDealt();
          }
        }

        this.owner.velocity.y = -this.pogoForce;
        this.owner.position.y -= 2;
        this.hasHitEnemyThisSwing = true;
        this.hasHitEnemyThisSwing = true;
        
        const player = this.owner as any;
        player.hasDoubleJump = true;
        if (player.dashComponent) {
          player.dashComponent.resetDashCharge();
        }
        
        eventBroker.publish("PLAYER_POGOED", undefined);
        return;
      }
    }

    const activeProjectiles = this.owner.world.getProjectiles();
    for (const proj of activeProjectiles) {
      if (proj.isActive && proj.ownerId === "boss") {
        const pW = proj.size.width / 2;
        const pH = proj.size.height / 2;

        const isHit = (
          pogoHitbox.x + pogoHitbox.width > proj.position.x - pW &&
          pogoHitbox.x < proj.position.x + pW &&
          pogoHitbox.y + pogoHitbox.height > proj.position.y - pH &&
          pogoHitbox.y < proj.position.y + pH
        );

        if (isHit) {
          this.owner.world.releaseProjectile(proj);
          const recorder = this.owner as unknown as IDamageRecorder;
          if (recorder.registerDamageDealt) {
            recorder.registerDamageDealt();
          }

          this.owner.velocity.y = -this.pogoForce;
          this.owner.position.y -= 2;
          this.hasHitEnemyThisSwing = true;
          
          const player = this.owner as any;
          player.hasDoubleJump = true;
          if (player.dashComponent) {
            player.dashComponent.resetDashCharge();
          }
          
          eventBroker.publish("PLAYER_POGOED", undefined);
          return;
        }
      }
    }

    const surfaces = [
      ...this.owner.world.physicsWorld.solids, 
      ...this.owner.world.physicsWorld.onewayPlatforms,
      ...this.owner.world.physicsWorld.hazards
    ];
    
    for (const solid of surfaces) {
      const isHit = (
        pogoHitbox.x + pogoHitbox.width > solid.x &&
        pogoHitbox.x < solid.x + solid.width &&
        pogoHitbox.y + pogoHitbox.height > solid.y &&
        pogoHitbox.y < solid.y + solid.height
      );

      if (isHit) {
        this.owner.velocity.y = -this.pogoForce;
        this.owner.position.y -= 2;
        
        const player = this.owner as any;
        player.hasDoubleJump = true;
        if (player.dashComponent) {
          player.dashComponent.resetDashCharge();
        }
        
        eventBroker.publish("PLAYER_POGOED", undefined);
        break;
      }
    }
  }
}
