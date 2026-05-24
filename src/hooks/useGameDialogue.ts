import { useState, useEffect, useCallback } from "react";
import { soundSynth } from "@/core/SoundSynth";

export interface DialogueState {
  text: string;
  displayed: string;
  active: boolean;
  isTyping: boolean;
}

export function useGameDialogue() {
  const [playerDialogue, setPlayerDialogue] = useState<DialogueState>({
    text: "",
    displayed: "",
    active: false,
    isTyping: false,
  });
  const [bossDialogue, setBossDialogue] = useState<DialogueState>({
    text: "",
    displayed: "",
    active: false,
    isTyping: false,
  });

  useEffect(() => {
    if (!playerDialogue.text || !playerDialogue.active) return;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < playerDialogue.text.length) {
        const char = playerDialogue.text[idx];
        setPlayerDialogue((prev) => ({
          ...prev,
          displayed: playerDialogue.text.substring(0, idx + 1),
        }));
        soundSynth.playDialogueTick("player", char);
        idx++;
      } else {
        setPlayerDialogue((prev) => ({ ...prev, isTyping: false }));
        clearInterval(interval);

        setTimeout(() => {
          setPlayerDialogue((prev) => ({ ...prev, active: false }));
        }, 3000);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [playerDialogue.text, playerDialogue.active]);

  useEffect(() => {
    if (!bossDialogue.text || !bossDialogue.active) return;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < bossDialogue.text.length) {
        const char = bossDialogue.text[idx];
        setBossDialogue((prev) => ({
          ...prev,
          displayed: bossDialogue.text.substring(0, idx + 1),
        }));
        soundSynth.playDialogueTick("boss", char);
        idx++;
      } else {
        setBossDialogue((prev) => ({ ...prev, isTyping: false }));
        clearInterval(interval);

        setTimeout(() => {
          setBossDialogue((prev) => ({ ...prev, active: false }));
        }, 3000);
      }
    }, 55);

    return () => clearInterval(interval);
  }, [bossDialogue.text, bossDialogue.active]);

  const triggerDialogue = useCallback((speaker: "player" | "boss", text: string) => {
    if (speaker === "player") {
      setPlayerDialogue({ text, displayed: "", active: true, isTyping: true });
    } else {
      setBossDialogue({ text, displayed: "", active: true, isTyping: true });
    }
  }, []);

  const resetDialogues = useCallback(() => {
    setPlayerDialogue({ text: "", displayed: "", active: false, isTyping: false });
    setBossDialogue({ text: "", displayed: "", active: false, isTyping: false });
  }, []);

  return {
    playerDialogue,
    bossDialogue,
    triggerDialogue,
    resetDialogues,
  };
}
