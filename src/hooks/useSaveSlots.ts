import { useState, useEffect } from "react";
import { saveManager, SaveSlotData } from "@/core/SaveManager";
import { soundSynth } from "@/core/SoundSynth";

export function useSaveSlots() {
  const [slots, setSlots] = useState<SaveSlotData[]>([]);
  const [copySourceIndex, setCopySourceIndex] = useState<number>(-1);
  const [isCopyMode, setIsCopyMode] = useState<boolean>(false);
  const [isEraseMode, setIsEraseMode] = useState<boolean>(false);

  const reloadSaveSlots = () => {
    setSlots(saveManager.getSlots());
  };

  useEffect(() => {
    reloadSaveSlots();
  }, []);

  const handleSlotAction = (index: number, onPlay: () => void) => {
    if (isEraseMode) {
      saveManager.eraseSlot(index);
      setIsEraseMode(false);
      soundSynth.playErrorTick();
      reloadSaveSlots();
      return;
    }

    if (isCopyMode) {
      if (copySourceIndex === -1) {
        if (slots[index]?.empty) {
          soundSynth.playErrorTick();
          return;
        }
        setCopySourceIndex(index);
        soundSynth.playSelectTick();
      } else {
        if (index === copySourceIndex) {
          soundSynth.playErrorTick();
          return;
        }
        saveManager.copySlot(copySourceIndex, index);
        setCopySourceIndex(-1);
        setIsCopyMode(false);
        soundSynth.playSelectTick();
        reloadSaveSlots();
      }
      return;
    }

    saveManager.selectSlot(index);
    soundSynth.playHitConfirm();
    onPlay();
  };

  const toggleCopyMode = () => {
    soundSynth.playSelectTick();
    setIsCopyMode(!isCopyMode);
    setCopySourceIndex(-1);
    setIsEraseMode(false);
  };

  const toggleEraseMode = () => {
    soundSynth.playSelectTick();
    setIsEraseMode(!isEraseMode);
    setIsCopyMode(false);
  };

  const resetActions = () => {
    setIsCopyMode(false);
    setIsEraseMode(false);
    setCopySourceIndex(-1);
  };

  return {
    slots,
    copySourceIndex,
    isCopyMode,
    isEraseMode,
    reloadSaveSlots,
    handleSlotAction,
    toggleCopyMode,
    toggleEraseMode,
    resetActions,
  };
}
