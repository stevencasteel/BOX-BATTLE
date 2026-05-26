import { useEffect } from "react";
import { useGameplayStore } from "@/store/useGameStore";
import { soundSynth } from "@/core/SoundSynth";
import { UNITS } from "@/core/Units";

// Keep track of player health changes across update ticks
export function useHudSubscription() {
  useEffect(() => {
    let lastHP = -1;
    let lastHealCharges = -1;
    let lastDet = -1;
    let lastBHP = -1;

    const unsub = useGameplayStore.subscribe((state) => {
      const { playerHP, bossHP, healingCharges, determination } = state;

      // 1. Player HP updates
      if (playerHP !== lastHP) {
        const tookDamage = playerHP < lastHP && lastHP !== -1;

        if (soundSynth.initialized) {
          soundSynth.setLowHPStatus(playerHP === 1);
        }

        for (let i = 0; i < UNITS.PLAYER_MAX_HP; i++) {
          const isLit = i < playerHP;
          const dotD = document.getElementById("hud-d-php-" + i);
          const dotM = document.getElementById("hud-m-php-" + i);

          if (dotD) {
            const wasLit = dotD.classList.contains("led-green");
            if (isLit) {
              dotD.classList.add("led-green");
              if (tookDamage) {
                dotD.classList.add("led-shaking");
                setTimeout(() => dotD.classList.remove("led-shaking"), 350);
              }
            } else {
              dotD.classList.remove("led-green");
              if (wasLit && tookDamage) {
                dotD.classList.add("led-shaking-die");
                setTimeout(() => dotD.classList.remove("led-shaking-die"), 450);
              }
            }
          }

          if (dotM) {
            const wasLit = dotM.classList.contains("led-green");
            if (isLit) {
              dotM.classList.add("led-green");
              if (tookDamage) {
                dotM.classList.add("led-shaking");
                setTimeout(() => dotM.classList.remove("led-shaking"), 350);
              }
            } else {
              dotM.classList.remove("led-green");
              if (wasLit && tookDamage) {
                dotM.classList.add("led-shaking-die");
                setTimeout(() => dotM.classList.remove("led-shaking-die"), 450);
              }
            }
          }
        }
        lastHP = playerHP;
      }

      // 2. Healing Charges updates
      if (healingCharges !== lastHealCharges) {
        for (let i = 0; i < 3; i++) {
          const isLit = i < healingCharges;
          const dotD = document.getElementById("hud-d-heal-" + i);
          const dotM = document.getElementById("hud-m-heal-" + i);
          if (dotD) {
            const wasLit = dotD.classList.contains("led-yellow");
            if (isLit) {
              dotD.classList.add("led-yellow");
              if (!wasLit) {
                dotD.classList.add("led-pop");
                setTimeout(() => dotD.classList.remove("led-pop"), 300);
              }
            } else {
              dotD.classList.remove("led-yellow");
            }

            if (healingCharges === 3) {
              dotD.classList.add("led-overflow-wobble");
            } else {
              dotD.classList.remove("led-overflow-wobble");
            }
          }
          if (dotM) {
            const wasLit = dotM.classList.contains("led-yellow");
            if (isLit) {
              dotM.classList.add("led-yellow");
              if (!wasLit) {
                dotM.classList.add("led-pop");
                setTimeout(() => dotM.classList.remove("led-pop"), 300);
              }
            } else {
              dotM.classList.remove("led-yellow");
            }

            if (healingCharges === 3) {
              dotM.classList.add("led-overflow-wobble");
            } else {
              dotM.classList.remove("led-overflow-wobble");
            }
          }
        }
        lastHealCharges = healingCharges;
      }

      // 3. Determination updates
      if (determination !== lastDet) {
        const detD = document.getElementById("hud-d-det-bar");
        const detM = document.getElementById("hud-m-det-bar");
        const detWidth = (determination / 5) * 100 + "%";
        if (detD) detD.style.width = detWidth;
        if (detM) detM.style.width = detWidth;
        lastDet = determination;
      }

      // 4. Boss HP updates
      if (bossHP !== lastBHP) {
        const bossD = document.getElementById("hud-d-boss-bar");
        const bossM = document.getElementById("hud-m-boss-bar");
        const bossWidth = (bossHP / UNITS.BOSS_MAX_HP) * 100 + "%";
        if (bossD) {
          bossD.style.width = bossWidth;
          if (bossHP > 0) bossD.classList.add("led-red");
          else bossD.classList.remove("led-red");
        }
        if (bossM) {
          bossM.style.width = bossWidth;
          if (bossHP > 0) bossM.classList.add("led-red");
          else bossM.classList.remove("led-red");
        }
        lastBHP = bossHP;
      }
    });
    return unsub;
  }, []);
}