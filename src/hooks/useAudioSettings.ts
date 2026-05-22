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

  const resetSettings = () => {
    const defaulted: AudioSettings = {
      masterVolume: 1.0,
      sfxVolume: 1.0,
      musicVolume: 1.0,
      masterMuted: false,
      sfxMuted: false,
      musicMuted: false,
    };
    setAudio(defaulted);
    settingsManager.setAudio(defaulted);
    soundSynth.updateVolumes();
    soundSynth.playHitConfirm();
  };

  return {
    audio,
    handleVolumeChange,
    resetSettings,
  };
}
