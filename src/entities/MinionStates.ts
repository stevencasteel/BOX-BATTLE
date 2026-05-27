import { IState } from "@/core/StateMachine";
import { UNITS } from "@/core/Units";
import { Minion } from "./Minion";
import { setVec, zeroVec } from "@/core/VecUtils";

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
    zeroVec(this.owner.velocity);
  }

  public update(_dt: number): void {
    zeroVec(this.owner.velocity);
    const player = this.owner.world.player;
    const playerValid = player && !player.isDead;

    if (playerValid) {
      const dx = player.position.x - this.owner.position.x;
      const dy = player.position.y - this.owner.position.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 160000 && this.owner.shootTimer <= 0) {
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
    zeroVec(this.owner.velocity);
  }

  public update(_dt: number): void {
    zeroVec(this.owner.velocity);
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
    setVec(this.owner.targetVisualScale, 1.0, 1.0);
  }

  public update(_dt: number): void {
    minionPatrolMovement(this.owner, _dt);

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
    setVec(this.owner.visualScale, 1.18, 0.82);
    setVec(this.owner.targetVisualScale, 1.1, 0.9);
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
    setVec(this.owner.visualScale, 1.26, 0.74);
    setVec(this.owner.targetVisualScale, 1.15, 0.85);
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
    setVec(this.owner.visualScale, 0.85, 1.15);
    setVec(this.owner.targetVisualScale, 1.0, 1.0);
  }

  public update(_dt: number): void {
    this.owner.velocity.x = 0;
    if (this.owner.stateTimer <= 0) {
      this.owner.stateMachine.changeState(new LancerPatrolState(this.owner));
    }
  }

  public exit(): void {}
}

function minionPatrolMovement(minion: Minion, dt: number) {
  const targetSpeed = minion.facingDirection * minion.patrolSpeed;
  const rate = targetSpeed !== 0 ? UNITS.MINION_ACCEL : UNITS.MINION_DECEL;
  minion.velocity.x += (targetSpeed - minion.velocity.x) * rate * dt;
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
    const distSq = dx * dx + dy * dy;

    if (distSq < 25) {
      this.owner.flyerTarget = this.owner.flyerTarget === "A" ? "B" : "A";
    } else {
      const dist = Math.sqrt(distSq);
      const targetVelX = (dx / dist) * this.owner.patrolSpeed;
      const targetVelY = (dy / dist) * this.owner.patrolSpeed;
      this.owner.velocity.x += (targetVelX - this.owner.velocity.x) * UNITS.MINION_ACCEL * _dt;
      this.owner.velocity.y += (targetVelY - this.owner.velocity.y) * UNITS.MINION_ACCEL * _dt;
    }

    const player = this.owner.world.player;
    const playerValid = player && !player.isDead;

    if (playerValid) {
      const dxP = player.position.x - this.owner.position.x;
      const dyP = player.position.y - this.owner.position.y;
      const playerDistSq = dxP * dxP + dyP * dyP;
      if (playerDistSq < 230400 && this.owner.shootTimer <= 0 && this.owner.volleyCount === 0) {
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
    zeroVec(this.owner.velocity);
  }

  public update(_dt: number): void {
    zeroVec(this.owner.velocity);
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
