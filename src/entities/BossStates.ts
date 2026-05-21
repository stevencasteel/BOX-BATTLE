import { IState } from "@/core/StateMachine";
import { Boss } from "./Boss";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { eventBroker } from "@/core/eventBroker";

export abstract class BossState implements IState {
  protected owner: Boss;

  constructor(owner: Boss) {
    this.owner = owner;
  }

  public abstract enter(): void;
  public abstract update(dt: number): void;
  public abstract exit(): void;
}

export class BossCooldownState extends BossState {
  private duration: number = 2.0;
  private overrideDuration: number = -1;

  constructor(owner: Boss) {
    super(owner);
  }

  public setDuration(customDuration: number) {
    this.overrideDuration = customDuration;
  }

  public enter(): void {
    this.owner.velocity.x = 0;
    if (this.overrideDuration > 0) {
      this.duration = this.overrideDuration;
      this.overrideDuration = -1;
    } else {
      this.duration = this.owner.currentPhase === 3 ? 1.5 : 2.5;
    }
  }

  public update(dt: number): void {
    this.duration -= dt;
    if (this.duration <= 0) {
      this.owner.stateMachine.changeState(this.owner.patrolState);
    }
  }

  public exit(): void {}
}

export class BossPatrolState extends BossState {
  private duration: number = 2.0;

  public enter(): void {
    this.duration = this.owner.currentPhase === 3 ? 1.5 : 2.5;
  }

  public update(dt: number): void {
    this.duration -= dt;
    const physics = this.owner.getComponent(PhysicsComponent);
    
    this.owner.velocity.x = this.owner.facingDirection * this.owner.patrolSpeed;

    if (physics) {
      if (physics.isOnWallLeft) {
        this.owner.facingDirection = 1;
      } else if (physics.isOnWallRight) {
        this.owner.facingDirection = -1;
      }
    }

    const player = this.owner.world.player;
    if (player && !player.isDead) {
      const distance = Math.abs(player.position.x - this.owner.position.x);
      const distanceY = Math.abs(player.position.y - this.owner.position.y);
      if (distance < 120 && distanceY < 60) {
        this.owner.stateMachine.changeState(this.owner.meleeState);
        return;
      }
    }

    if (this.duration <= 0) {
      this.owner.stateMachine.changeState(this.owner.attackState);
    }
  }

  public exit(): void {
    this.owner.velocity.x = 0;
  }
}

export class BossMeleeState extends BossState {
  private duration: number = 0.5;

  public enter(): void {
    this.owner.velocity.x = 0;
    this.duration = 0.5;
    eventBroker.publish("BOSS_SWIPED", undefined);
  }

  public update(dt: number): void {
    this.duration -= dt;
    if (this.duration <= 0) {
      this.owner.cooldownState.setDuration(1.0);
      this.owner.stateMachine.changeState(this.owner.cooldownState);
    }
  }

  public exit(): void {}
}

export class BossAttackState extends BossState {
  private attackType: "SINGLE_SHOT" | "VOLLEY" | "OMNI_BURST" = "SINGLE_SHOT";
  private durationTimer: number = 0;
  private volleyCount: number = 0;
  private volleyTimer: number = 0;

  public enter(): void {
    const phase = this.owner.currentPhase;
    this.owner.velocity.x = 0;

    if (phase === 1) {
      if (Math.random() < 0.6) {
        this.attackType = "SINGLE_SHOT";
        this.durationTimer = 0.5;
        this.owner.fireSingleShotAtPlayer();
      } else {
        this.owner.stateMachine.changeState(this.owner.telegraphState);
      }
    } else if (phase === 2) {
      if (Math.random() < 0.5) {
        this.attackType = "VOLLEY";
        this.volleyCount = 3;
        this.volleyTimer = 0;
        this.durationTimer = 1.0;
      } else {
        this.owner.stateMachine.changeState(this.owner.telegraphState);
      }
    } else {
      const r = Math.random();
      if (r < 0.33) {
        this.attackType = "VOLLEY";
        this.volleyCount = 5;
        this.volleyTimer = 0;
        this.durationTimer = 1.2;
      } else if (r < 0.66) {
        this.attackType = "OMNI_BURST";
        this.owner.fireRadialOmniBurst();
        this.durationTimer = 0.8;
      } else {
        this.owner.stateMachine.changeState(this.owner.telegraphState);
      }
    }
  }

  public update(dt: number): void {
    this.durationTimer -= dt;

    if (this.attackType === "VOLLEY" && this.volleyCount > 0) {
      this.volleyTimer -= dt;
      if (this.volleyTimer <= 0) {
        this.owner.fireSingleShotAtPlayer();
        this.volleyCount--;
        this.volleyTimer = 0.2;
      }
    }

    if (this.durationTimer <= 0) {
      let cooldown = 1.5;
      if (this.attackType === "VOLLEY") cooldown = 2.5;
      else if (this.attackType === "OMNI_BURST") cooldown = 3.5;

      this.owner.cooldownState.setDuration(cooldown);
      this.owner.stateMachine.changeState(this.owner.cooldownState);
    }
  }

  public exit(): void {}
}

export class BossTelegraphState extends BossState {
  private duration: number = 0.8;

  public enter(): void {
    this.owner.velocity.x = 0;
    this.duration = this.owner.currentPhase === 3 ? 0.4 : 0.8;
    eventBroker.publish("BOSS_TELEGRAPH", undefined);
  }

  public update(dt: number): void {
    this.duration -= dt;
    if (this.duration <= 0) {
      this.owner.stateMachine.changeState(this.owner.lungeState);
    }
  }

  public exit(): void {
    const player = this.owner.world.player;
    if (player) {
      const dir = Math.sign(player.position.x - this.owner.position.x);
      this.owner.facingDirection = dir !== 0 ? dir : this.owner.facingDirection;
    }
  }
}

export class BossLungeState extends BossState {
  private duration: number = 0.5;

  public enter(): void {
    this.duration = 0.5;
    eventBroker.publish("BOSS_LUNGED", undefined);
  }

  public update(dt: number): void {
    this.duration -= dt;
    this.owner.velocity.x = this.owner.facingDirection * this.owner.lungeSpeed;

    const physics = this.owner.getComponent(PhysicsComponent);
    const hitWall = physics ? (physics.isOnWallLeft || physics.isOnWallRight) : false;

    if (this.duration <= 0 || hitWall) {
      this.owner.stateMachine.changeState(this.owner.cooldownState);
    }
  }

  public exit(): void {
    this.owner.velocity.x = 0;
  }
}

export class BossDeadState extends BossState {
  public enter(): void {
    this.owner.velocity.x = 0;
    this.owner.velocity.y = 0;
  }

  public update(_dt: number): void {}
  public exit(): void {}
}
