import { useEffect } from "react";
import { soundSynth } from "@/core/SoundSynth";

export function useMusicLifecycle(isPlayingScreen: boolean) {
  useEffect(() => {
    if (isPlayingScreen) {
      soundSynth.stopMusic();
    } else {
      soundSynth.setCabinetMuffle(true);
      if (soundSynth.hasUserGestured) {
        soundSynth.startMusic();
      }
    }
  }, [isPlayingScreen]);
}
