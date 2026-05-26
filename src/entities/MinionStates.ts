import { IState } from "@/core/StateMachine";
import { Minion } from "./Minion";

export abstract class MinionState implements IState {
  protected owner: Minion;

  constructor(owner: Minion) {
    this.owner = owner;
  }

  public abstract enter(): void;
  public abstract update(dt: number): void;
  public abstract exit(): void;
}

export class TurretPatrolState extends MinionState {
  public enter(): void {
    this.owner.attackState = "PATROL";
    this.owner.velocity = { x: 0, y: 0 };
  }

  public update(_dt: number): void {
    this.owner.velocity = { x: 0, y: 0 };
    const player = this.owner.world.player;
    const playerValid = player && !player.isDead;

    if (playerValid) {
      const dx = player.position.x - this.owner.position.x;
      const dy = player.position.y - this.owner.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 400 && this.owner.shootTimer <= 0) {
        this.owner.stateMachine.changeState(new TurretTelegraphState(this.owner));
      }
    }
  }

  public exit(): void {}
}

export class TurretTelegraphState extends MinionState {
  public enter(): void {
    this.owner.attackState = "TELEGRAPH";
    this.owner.stateTimer = 0.5;
    this.owner.velocity = { x: 0, y: 0 };
  }

  public update(_dt: number): void {
    this.owner.velocity = { x: 0, y: 0 };
    if (this.owner.stateTimer <= 0) {
      const player = this.owner.world.player;
      if (player && !player.isDead) {
        this.owner.fireSingleShotAtPlayer(player);
      }
      this.owner.shootTimer = 2.5;
      this.owner.stateMachine.changeState(new TurretPatrolState(this.owner));
    }
  }

  public exit(): void {}
}

export class LancerPatrolState extends MinionState {
  public enter(): void {
    this.owner.attackState = "PATROL";
    this.owner.targetVisualScale = { x: 1.0, y: 1.0 };
  }

  public update(_dt: number): void {
    minionPatrolMovement(this.owner);

    const player = this.owner.world.player;
    const playerValid = player && !player.isDead;

    if (playerValid) {
      const distY = Math.abs(player.position.y - this.owner.position.y);
      const distX = player.position.x - this.owner.position.x;

      if (distY < 40 && Math.abs(distX) < 110 && Math.sign(distX) === this.owner.facingDirection) {
        this.owner.stateMachine.changeState(new LancerTelegraphState(this.owner));
      }
    }
  }

  public exit(): void {}
}

export class LancerTelegraphState extends MinionState {
  public enter(): void {
    this.owner.attackState = "TELEGRAPH";
    this.owner.stateTimer = 0.4;
    this.owner.velocity.x = 0;
    this.owner.visualScale = { x: 1.18, y: 0.82 };
    this.owner.targetVisualScale = { x: 1.1, y: 0.9 };
  }

  public update(_dt: number): void {
    this.owner.velocity.x = 0;
    if (this.owner.stateTimer <= 0) {
      this.owner.stateMachine.changeState(new LancerAttackState(this.owner));
    }
  }

  public exit(): void {}
}

export class LancerAttackState extends MinionState {
  public enter(): void {
    this.owner.attackState = "ATTACK";
    this.owner.stateTimer = 0.2;
    this.owner.velocity.x = this.owner.facingDirection * 400;
    this.owner.visualScale = { x: 1.26, y: 0.74 };
    this.owner.targetVisualScale = { x: 1.15, y: 0.85 };
  }

  public update(_dt: number): void {
    this.owner.velocity.x = this.owner.facingDirection * 400;
    const physics = this.owner.physics;
    const hitWall = physics ? physics.isOnWallLeft || physics.isOnWallRight : false;

    if (this.owner.stateTimer <= 0 || hitWall) {
      this.owner.stateMachine.changeState(new LancerCooldownState(this.owner));
    }
  }

  public exit(): void {}
}

export class LancerCooldownState extends MinionState {
  public enter(): void {
    this.owner.attackState = "COOLDOWN";
    this.owner.stateTimer = 1.2;
    this.owner.velocity.x = 0;
    this.owner.visualScale = { x: 0.85, y: 1.15 };
    this.owner.targetVisualScale = { x: 1.0, y: 1.0 };
  }

  public update(_dt: number): void {
    this.owner.velocity.x = 0;
    if (this.owner.stateTimer <= 0) {
      this.owner.stateMachine.changeState(new LancerPatrolState(this.owner));
    }
  }

  public exit(): void {}
}

function minionPatrolMovement(minion: Minion) {
  minion.velocity.x = minion.facingDirection * minion.patrolSpeed;
  const physics = minion.physics;
  if (physics) {
    if (physics.isOnWallLeft) minion.facingDirection = 1;
    else if (physics.isOnWallRight) minion.facingDirection = -1;
  }
}

export class FlyerPatrolState extends MinionState {
  public enter(): void {
    this.owner.attackState = "PATROL";
  }

  public update(_dt: number): void {
    const targetPos = this.owner.flyerTarget === "A" ? this.owner.pointA : this.owner.pointB;
    const dx = targetPos.x - this.owner.position.x;
    const dy = targetPos.y - this.owner.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.owner.flyerTarget = this.owner.flyerTarget === "A" ? "B" : "A";
    } else {
      this.owner.velocity.x = (dx / dist) * this.owner.patrolSpeed;
      this.owner.velocity.y = (dy / dist) * this.owner.patrolSpeed;
    }

    const player = this.owner.world.player;
    const playerValid = player && !player.isDead;

    if (playerValid) {
      const dxP = player.position.x - this.owner.position.x;
      const dyP = player.position.y - this.owner.position.y;
      const playerDist = Math.sqrt(dxP * dxP + dyP * dyP);
      if (playerDist < 480 && this.owner.shootTimer <= 0 && this.owner.volleyCount === 0) {
        this.owner.stateMachine.changeState(new FlyerTelegraphState(this.owner));
      }
    }
  }

  public exit(): void {}
}

export class FlyerTelegraphState extends MinionState {
  public enter(): void {
    this.owner.attackState = "TELEGRAPH";
    this.owner.stateTimer = 0.6;
    this.owner.velocity = { x: 0, y: 0 };
  }

  public update(_dt: number): void {
    this.owner.velocity = { x: 0, y: 0 };
    if (this.owner.stateTimer <= 0) {
      this.owner.stateMachine.changeState(new FlyerAttackState(this.owner));
    }
  }

  public exit(): void {}
}

export class FlyerAttackState extends MinionState {
  public enter(): void {
    this.owner.attackState = "ATTACK";
    this.owner.volleyCount = 3;
    this.owner.volleyTimer = 0;
    this.owner.shootTimer = 3.5;
  }

  public update(dt: number): void {
    this.owner.velocity = { x: this.owner.velocity.x * 0.9, y: this.owner.velocity.y * 0.9 };
    const player = this.owner.world.player;
    const playerValid = player && !player.isDead;

    if (this.owner.volleyCount > 0) {
      this.owner.volleyTimer -= dt;
      if (this.owner.volleyTimer <= 0 && playerValid) {
        this.owner.fireSingleShotAtPlayer(player);
        this.owner.volleyCount--;
        this.owner.volleyTimer = 0.18;
      }
    }

    if (this.owner.volleyCount === 0) {
      this.owner.stateMachine.changeState(new FlyerPatrolState(this.owner));
    }
  }

  public exit(): void {}
}
