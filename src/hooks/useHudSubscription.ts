import { useEffect } from "react";
import { useGameplayStore } from "@/store/useGameStore";

export function useHudSubscription() {
  useEffect(() => {
    const unsub = useGameplayStore.subscribe((state) => {
      const { playerHP, bossHP, healingCharges, determination } = state;

      for (let i = 0; i < 5; i++) {
        const isLit = i < playerHP;
        const dotD = document.getElementById("hud-d-php-" + i);
        const dotM = document.getElementById("hud-m-php-" + i);
        if (dotD) {
          if (isLit) dotD.classList.add("led-green");
          else dotD.classList.remove("led-green");
        }
        if (dotM) {
          if (isLit) dotM.classList.add("led-green");
          else dotM.classList.remove("led-green");
        }
      }

      for (let i = 0; i < 3; i++) {
        const isLit = i < healingCharges;
        const dotD = document.getElementById("hud-d-heal-" + i);
        const dotM = document.getElementById("hud-m-heal-" + i);
        if (dotD) {
          if (isLit) dotD.classList.add("led-yellow");
          else dotD.classList.remove("led-yellow");
        }
        if (dotM) {
          if (isLit) dotM.classList.add("led-yellow");
          else dotM.classList.remove("led-yellow");
        }
      }

      const detD = document.getElementById("hud-d-det-bar");
      const detM = document.getElementById("hud-m-det-bar");
      const detWidth = (determination / 5) * 100 + "%";
      if (detD) detD.style.width = detWidth;
      if (detM) detM.style.width = detWidth;

      const bossD = document.getElementById("hud-d-boss-bar");
      const bossM = document.getElementById("hud-m-boss-bar");
      const bossWidth = (bossHP / 30) * 100 + "%";
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
    });
    return unsub;
  }, []);
}
