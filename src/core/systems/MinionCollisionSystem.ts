import { Player } from "@/entities/Player";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { EntityStatus, IWorld } from "@/core/Interfaces";

export class MinionCollisionSystem {
  public update(minions: IWorld["minions"], player: Player, dt: number): void {
    for (let i = minions.length - 1; i >= 0; i--) {
      const minion = minions[i];
      minion.update(dt);

      if (player.isDead || minion.status !== EntityStatus.ACTIVE) continue;

      const pW = player.size.width / 2;
      const pH = player.size.height / 2;
      const mW = minion.size.width / 2;
      const mH = minion.size.height / 2;

      const isColliding =
        player.position.x + pW > minion.position.x - mW &&
        player.position.x - pW < minion.position.x + mW &&
        player.position.y + pH > minion.position.y - mH &&
        player.position.y - pH < minion.position.y + mH;

      if (isColliding) {
        const playerHealth = player.getComponent(HealthComponent);
        if (playerHealth) {
          const damaged = playerHealth.takeDamage(1);
          if (damaged) {
            const knockbackDir = Math.sign(player.position.x - minion.position.x);
            player.velocity.x = (knockbackDir !== 0 ? knockbackDir : 1) * 450;
            player.velocity.y = -350;
          }
        }
      }
    }
  }
}
