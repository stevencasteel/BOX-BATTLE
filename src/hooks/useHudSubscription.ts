import { useEffect } from "react";
import { useGameplayStore, useSessionStore } from "@/store/useGameStore";
import { soundSynth } from "@/core/SoundSynth";
import { UNITS } from "@/core/Units";

export function useHudSubscription() {
  useEffect(() => {
    let lastHP = -1;
    let lastHealCharges = -1;
    let lastDet = -1;
    let lastBHP = -1;
    let lastResult = "PLAYING";

    const updateHUD = () => {
      const { playerHP, bossHP, healingCharges, determination } = useGameplayStore.getState();
      const { gameResult } = useSessionStore.getState();

      const isGameOver = gameResult !== "PLAYING";

      const activeHP = isGameOver ? 0 : playerHP;
      const activeHealCharges = isGameOver ? 0 : healingCharges;
      const activeDet = isGameOver ? 0 : determination;
      const activeBHP = isGameOver ? 0 : bossHP;

      if (activeHP !== lastHP || isGameOver !== (lastResult !== "PLAYING")) {
        const tookDamage = activeHP < lastHP && lastHP !== -1 && !isGameOver;
        const healed = activeHP > lastHP && lastHP !== -1 && !isGameOver;

        if (soundSynth.initialized) {
          soundSynth.setLowHPStatus(activeHP === 1 && !isGameOver);
        }

        const groupD = document.getElementById("hud-d-hp-group");
        const groupM = document.getElementById("hud-m-hp-group");
        
        if (activeHP === 1 && !isGameOver) {
          groupD?.classList.add("hud-stress-shiver");
          groupM?.classList.add("hud-stress-shiver");
        } else {
          groupD?.classList.remove("hud-stress-shiver");
          groupM?.classList.remove("hud-stress-shiver");
        }

        for (let i = 0; i < UNITS.PLAYER_MAX_HP; i++) {
          const isLit = i < activeHP;
          const dotD = document.getElementById("hud-d-php-" + i);
          const dotM = document.getElementById("hud-m-php-" + i);

          if (dotD) {
            const wasLit = dotD.classList.contains("led-green");
            if (isLit) {
              dotD.classList.add("led-green");
              if (tookDamage) {
                dotD.classList.remove("led-spring-impact");
                void dotD.offsetWidth;
                dotD.classList.add("led-spring-impact");
              } else if (healed) {
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
        lastHP = activeHP;
      }

      if (activeHealCharges !== lastHealCharges) {
        const gainedCharge = activeHealCharges > lastHealCharges && lastHealCharges !== -1;

        for (let i = 0; i < 3; i++) {
          const isLit = i < activeHealCharges;
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

            if (activeHealCharges === 3) {
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

            if (activeHealCharges === 3) {
              dotM.classList.add("led-overflow-wobble");
            } else {
              dotM.classList.remove("led-overflow-wobble");
            }
          }
        }
        lastHealCharges = activeHealCharges;
      }

      if (activeDet !== lastDet) {
        const detD = document.getElementById("hud-d-det-bar");
        const detM = document.getElementById("hud-m-det-bar");
        const detWidth = (activeDet / 5) * 100 + "%";
        if (detD) detD.style.width = detWidth;
        if (detM) detM.style.width = detWidth;
        lastDet = activeDet;
      }

      if (activeBHP !== lastBHP) {
        const bossD = document.getElementById("hud-d-boss-bar");
        const bossM = document.getElementById("hud-m-boss-bar");
        const bossWidth = (activeBHP / UNITS.BOSS_MAX_HP) * 100 + "%";
        if (bossD) {
          bossD.style.width = bossWidth;
          if (activeBHP > 0) bossD.classList.add("led-red");
          else bossD.classList.remove("led-red");
        }
        if (bossM) {
          bossM.style.width = bossWidth;
          if (activeBHP > 0) bossM.classList.add("led-red");
          else bossM.classList.remove("led-red");
        }
        lastBHP = activeBHP;
      }

      lastResult = gameResult;
    };

    const unsubGameplay = useGameplayStore.subscribe(() => {
      updateHUD();
    });

    const unsubSession = useSessionStore.subscribe(() => {
      updateHUD();
    });

    updateHUD();

    return () => {
      unsubGameplay();
      unsubSession();
    };
  }, []);
}
