import { useEffect } from "react";
import { soundSynth } from "@/core/SoundSynth";

export function useFirstGesture(reloadSaveSlots: () => void) {
  useEffect(() => {
    const triggerOnFirstGesture = () => {
      soundSynth.startMusic();
      window.removeEventListener("click", triggerOnFirstGesture);
      window.removeEventListener("touchend", triggerOnFirstGesture);
    };

    window.addEventListener("click", triggerOnFirstGesture);
    window.addEventListener("touchend", triggerOnFirstGesture);

    reloadSaveSlots();

    return () => {
      window.removeEventListener("click", triggerOnFirstGesture);
      window.removeEventListener("touchend", triggerOnFirstGesture);
      soundSynth.stopMusic();
    };
  }, []);
}
