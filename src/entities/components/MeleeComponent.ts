import { EntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { eventBroker } from "@/core/EventBroker";
import { Rectangle } from "@/core/Interfaces";

export class MeleeComponent implements EntityComponent {
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

    if (this.attackActive && !this.hasHitEnemyThisSwing && this.attackDirection !== "down") {
      this.checkMeleeAttackContact();
    }
  }

  public triggerAttack(direction: "side" | "up" | "down"): void {
    this.attackActive = true;
    this.attackActiveTimer = 0.1;
    this.attackCooldownTimer = 0.15;
    this.hasHitEnemyThisSwing = false;
    this.attackDirection = direction;

    if (direction === "down") {
      this.checkPogoAttack();
    } else {
      eventBroker.publish("PLAYER_ATTACKED", { direction });
    }
  }

  private checkMeleeAttackContact() {
    const targets: BaseEntity[] = [];
    if (this.owner.world.boss && !this.owner.world.boss.isDead) {
      targets.push(this.owner.world.boss as BaseEntity);
    }
    for (const minion of this.owner.world.minions) {
      if (minion && !minion.isDead) {
        targets.push(minion as BaseEntity);
      }
    }

    let attackHitbox: Rectangle;
    const facing = (this.owner as any).facingDirection ?? 1;

    if (this.attackDirection === "up") {
      attackHitbox = {
        x: this.owner.position.x - 30,
        y: this.owner.position.y - 77.5,
        width: 60,
        height: 75
      };
    } else {
      const offset = facing * 40;
      attackHitbox = {
        x: this.owner.position.x + offset - 50,
        y: this.owner.position.y - 40,
        width: 100,
        height: 80
      };
    }

    for (const target of targets) {
      const halfW = target.size.width / 2;
      const halfH = target.size.height / 2;

      const isHit = (
        attackHitbox.x + attackHitbox.width > target.position.x - halfW &&
        attackHitbox.x < target.position.x + halfW &&
        attackHitbox.y + attackHitbox.height > target.position.y - halfH &&
        attackHitbox.y < target.position.y + halfH
      );

      if (isHit) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          const dx = target.position.x - this.owner.position.x;
          const dy = target.position.y - this.owner.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const isCloseRange = distance <= 90;
          const damage = isCloseRange ? 5 : 1;

          const damaged = health.takeDamage(damage);
          if (damaged) {
            this.hasHitEnemyThisSwing = true;
            (this.owner as any).registerDamageDealt?.();

            if (isCloseRange) {
              eventBroker.publish("CAMERA_SHAKE", { amplitude: 6, duration: 0.12 });
            }
          }
        }
      }
    }

    const activeProjectiles = this.owner.world.getProjectiles();
    for (const proj of activeProjectiles) {
      if (proj.isActive && proj.ownerId === "boss") {
        const pW = proj.size.width / 2;
        const pH = proj.size.height / 2;

        const isHit = (
          attackHitbox.x + attackHitbox.width > proj.position.x - pW &&
          attackHitbox.x < proj.position.x + pW &&
          attackHitbox.y + attackHitbox.height > proj.position.y - pH &&
          attackHitbox.y < proj.position.y + pH
        );

        if (isHit) {
          this.owner.world.releaseProjectile(proj);
          this.hasHitEnemyThisSwing = true;
          (this.owner as any).registerDamageDealt?.();
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
      if (minion && !minion.isDead) {
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
          (this.owner as any).registerDamageDealt?.();
        }

        this.owner.velocity.y = -this.pogoForce;
        this.owner.position.y -= 2;
        
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
          (this.owner as any).registerDamageDealt?.();

          this.owner.velocity.y = -this.pogoForce;
          this.owner.position.y -= 2;
          
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
