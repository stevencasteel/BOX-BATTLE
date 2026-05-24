import { Minion } from "./Minion";

export interface IMinionBehavior {
  update(minion: Minion, dt: number): void;
}

export class TurretBehavior implements IMinionBehavior {
  public update(minion: Minion, _dt: number): void {
    minion.velocity = { x: 0, y: 0 };
    const player = minion.world.player;
    const playerValid = player && !player.isDead;

    if (minion.attackState === "PATROL") {
      if (playerValid) {
        const dx = player.position.x - minion.position.x;
        const dy = player.position.y - minion.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400 && minion.shootTimer <= 0) {
          minion.attackState = "TELEGRAPH";
          minion.stateTimer = 0.5; 
        }
      }
    }
    else if (minion.attackState === "TELEGRAPH") {
      if (minion.stateTimer <= 0) {
        if (playerValid) {
          minion.fireSingleShotAtPlayer(player);
        }
        minion.shootTimer = 2.5; 
        minion.attackState = "PATROL";
      }
    }
  }
}

export class LancerBehavior implements IMinionBehavior {
  public update(minion: Minion, _dt: number): void {
    const player = minion.world.player;
    const playerValid = player && !player.isDead;

    if (minion.attackState === "PATROL") {
      minion.velocity.x = minion.facingDirection * minion.patrolSpeed;
      
      const physics = minion.physics;
      if (physics.isOnWallLeft) minion.facingDirection = 1;
      else if (physics.isOnWallRight) minion.facingDirection = -1;

      if (playerValid) {
        const distY = Math.abs(player.position.y - minion.position.y);
        const distX = player.position.x - minion.position.x;
        
        if (distY < 40 && Math.abs(distX) < 110 && Math.sign(distX) === minion.facingDirection) {
          minion.attackState = "TELEGRAPH";
          minion.stateTimer = 0.4;
          minion.velocity.x = 0;
          minion.visualScale = { x: 1.18, y: 0.82 };
          minion.targetVisualScale = { x: 1.1, y: 0.9 };
        }
      }
    } 
    else if (minion.attackState === "TELEGRAPH") {
      minion.velocity.x = 0;
      if (minion.stateTimer <= 0) {
        minion.attackState = "ATTACK";
        minion.stateTimer = 0.2;
        minion.velocity.x = minion.facingDirection * 400;
        minion.visualScale = { x: 1.26, y: 0.74 };
        minion.targetVisualScale = { x: 1.15, y: 0.85 };
      }
    } 
    else if (minion.attackState === "ATTACK") {
      const physics = minion.physics;
      if (minion.stateTimer <= 0 || physics.isOnWallLeft || physics.isOnWallRight) {
        minion.attackState = "COOLDOWN";
        minion.stateTimer = 1.2;
        minion.velocity.x = 0;
        minion.visualScale = { x: 0.85, y: 1.15 };
        minion.targetVisualScale = { x: 1.0, y: 1.0 };
      }
    } 
    else if (minion.attackState === "COOLDOWN") {
      minion.velocity.x = 0;
      if (minion.stateTimer <= 0) {
        minion.attackState = "PATROL";
        minion.targetVisualScale = { x: 1.0, y: 1.0 };
      }
    }
  }
}

export class FlyerBehavior implements IMinionBehavior {
  public update(minion: Minion, dt: number): void {
    const player = minion.world.player;
    const playerValid = player && !player.isDead;

    // Organic breathing wave pulsation
    const cycle = performance.now() * 0.006;
    minion.targetVisualScale.x = 1.0 + Math.sin(cycle) * 0.06;
    minion.targetVisualScale.y = 1.0 - Math.sin(cycle) * 0.06;

    if (minion.attackState === "PATROL") {
      const targetPos = minion.flyerTarget === "A" ? minion.pointA : minion.pointB;
      const dx = targetPos.x - minion.position.x;
      const dy = targetPos.y - minion.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        minion.flyerTarget = minion.flyerTarget === "A" ? "B" : "A";
      } else {
        minion.velocity.x = (dx / dist) * minion.patrolSpeed;
        minion.velocity.y = (dy / dist) * minion.patrolSpeed;
      }

      if (playerValid) {
        const dxP = player.position.x - minion.position.x;
        const dyP = player.position.y - minion.position.y;
        const playerDist = Math.sqrt(dxP * dxP + dyP * dyP);
        if (playerDist < 480 && minion.shootTimer <= 0 && minion.volleyCount === 0) {
          minion.attackState = "TELEGRAPH";
          minion.stateTimer = 0.6; 
          minion.velocity = { x: 0, y: 0 }; 
        }
      }
    }
    else if (minion.attackState === "TELEGRAPH") {
      minion.velocity = { x: 0, y: 0 };
      if (minion.stateTimer <= 0) {
        minion.attackState = "ATTACK";
        minion.volleyCount = 3;
        minion.volleyTimer = 0;
        minion.shootTimer = 3.5; 
      }
    }
    else if (minion.attackState === "ATTACK") {
      minion.velocity = { x: minion.velocity.x * 0.9, y: minion.velocity.y * 0.9 };

      if (minion.volleyCount > 0) {
        minion.volleyTimer -= dt;
        if (minion.volleyTimer <= 0 && playerValid) {
          minion.fireSingleShotAtPlayer(player);
          minion.volleyCount--;
          minion.volleyTimer = 0.18;
        }
      }

      if (minion.volleyCount === 0) {
        minion.attackState = "PATROL";
      }
    }
  }
}
