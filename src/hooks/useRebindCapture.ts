import { useEffect } from "react";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";

export function useRebindCapture(
  rebindTarget: { action: Action; index: number } | null,
  setRebindTarget: (target: null) => void,
  reloadSaveSlots: () => void
) {
  useEffect(() => {
    if (!rebindTarget) return;

    const handleRebindCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      soundSynth.playHitConfirm();
      settingsManager.remapKey(rebindTarget.action, rebindTarget.index, e.code);
      setRebindTarget(null);
      reloadSaveSlots();
    };

    window.addEventListener("keydown", handleRebindCapture);
    return () => {
      window.removeEventListener("keydown", handleRebindCapture);
    };
  }, [rebindTarget, setRebindTarget, reloadSaveSlots]);
}
