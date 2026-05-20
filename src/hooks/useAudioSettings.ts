import { useState } from "react";
import { settingsManager, AudioSettings } from "@/core/SettingsManager";
import { soundSynth } from "@/core/SoundSynth";

export function useAudioSettings() {
  const [audio, setAudio] = useState<AudioSettings>({ ...settingsManager.getAudio() });

  const handleVolumeChange = (field: keyof AudioSettings, value: number | boolean) => {
    const updated = { ...audio, [field]: value };
    setAudio(updated);
    settingsManager.setAudio(updated);
    soundSynth.updateVolumes();
  };

  return {
    audio,
    handleVolumeChange,
  };
}
