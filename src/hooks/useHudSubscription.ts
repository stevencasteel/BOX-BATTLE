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
        const healed = playerHP > lastHP && lastHP !== -1;

        if (soundSynth.initialized) {
          soundSynth.setLowHPStatus(playerHP === 1);
        }

        const groupD = document.getElementById("hud-d-hp-group");
        const groupM = document.getElementById("hud-m-hp-group");
        
        if (playerHP === 1) {
          groupD?.classList.add("hud-stress-shiver");
          groupM?.classList.add("hud-stress-shiver");
        } else {
          groupD?.classList.remove("hud-stress-shiver");
          groupM?.classList.remove("hud-stress-shiver");
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
                // Subtle spring-shudder only on the remaining lit health squares
                dotD.classList.remove("led-spring-impact");
                void dotD.offsetWidth;
                dotD.classList.add("led-spring-impact");
              } else if (healed) {
                // Elastic recovery pop on the newly healed squares
                dotD.classList.remove("led-elastic-spring");
                void dotD.offsetWidth;
                dotD.classList.add("led-elastic-spring");
              }
            } else {
              dotD.classList.remove("led-green");
              dotD.classList.remove("led-spring-impact");
              dotD.classList.remove("led-elastic-spring");
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
                dotM.classList.remove("led-spring-impact");
                void dotM.offsetWidth;
                dotM.classList.add("led-spring-impact");
              } else if (healed) {
                dotM.classList.remove("led-elastic-spring");
                void dotM.offsetWidth;
                dotM.classList.add("led-elastic-spring");
              }
            } else {
              dotM.classList.remove("led-green");
              dotM.classList.remove("led-spring-impact");
              dotM.classList.remove("led-elastic-spring");
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
        const gainedCharge = healingCharges > lastHealCharges && lastHealCharges !== -1;

        for (let i = 0; i < 3; i++) {
          const isLit = i < healingCharges;
          const dotD = document.getElementById("hud-d-heal-" + i);
          const dotM = document.getElementById("hud-m-heal-" + i);
          if (dotD) {
            const wasLit = dotD.classList.contains("led-yellow");
            if (isLit) {
              dotD.classList.add("led-yellow");
              if (!wasLit && gainedCharge) {
                dotD.classList.remove("led-elastic-spring");
                void dotD.offsetWidth;
                dotD.classList.add("led-elastic-spring");
              }
            } else {
              dotD.classList.remove("led-yellow");
              dotD.classList.remove("led-elastic-spring");
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
              if (!wasLit && gainedCharge) {
                dotM.classList.remove("led-elastic-spring");
                void dotM.offsetWidth;
                dotM.classList.add("led-elastic-spring");
              }
            } else {
              dotM.classList.remove("led-yellow");
              dotM.classList.remove("led-elastic-spring");
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