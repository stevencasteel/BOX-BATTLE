import { IState } from "@/core/StateMachine";
import { Boss } from "./Boss";
import { PhysicsComponent } from "@/components/PhysicsComponent";

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
  public enter(): void {
    this.owner.velocity.x = 0;
    this.owner.stateTimer = this.owner.currentPhase === 3 ? 1.5 : 2.5;
  }

  public update(dt: number): void {
    this.owner.stateTimer -= dt;
    if (this.owner.stateTimer <= 0) {
      this.owner.stateMachine.changeState(new BossPatrolState(this.owner));
    }
  }

  public exit(): void {}
}

export class BossPatrolState extends BossState {
  public enter(): void {
    this.owner.stateTimer = this.owner.currentPhase === 3 ? 1.5 : 2.5;
  }

  public update(dt: number): void {
    this.owner.stateTimer -= dt;
    const physics = this.owner.getComponent(PhysicsComponent);
    
    this.owner.velocity.x = this.owner.facingDirection * this.owner.patrolSpeed;

    if (physics) {
      if (physics.isOnWallLeft) {
        this.owner.facingDirection = 1;
      } else if (physics.isOnWallRight) {
        this.owner.facingDirection = -1;
      }
    }

    if (this.owner.stateTimer <= 0) {
      this.owner.stateMachine.changeState(new BossTelegraphState(this.owner));
    }
  }

  public exit(): void {
    this.owner.velocity.x = 0;
  }
}

export class BossTelegraphState extends BossState {
  public enter(): void {
    this.owner.velocity.x = 0;
    this.owner.stateTimer = this.owner.currentPhase === 3 ? 0.4 : 0.8;
  }

  public update(dt: number): void {
    this.owner.stateTimer -= dt;
    if (this.owner.stateTimer <= 0) {
      this.owner.stateMachine.changeState(new BossLungeState(this.owner));
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
  public enter(): void {
    this.owner.stateTimer = 0.5;
  }

  public update(dt: number): void {
    this.owner.stateTimer -= dt;
    this.owner.velocity.x = this.owner.facingDirection * this.owner.lungeSpeed;

    const physics = this.owner.getComponent(PhysicsComponent);
    const hitWall = physics ? (physics.isOnWallLeft || physics.isOnWallRight) : false;

    if (this.owner.stateTimer <= 0 || hitWall) {
      this.owner.stateMachine.changeState(new BossCooldownState(this.owner));
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
