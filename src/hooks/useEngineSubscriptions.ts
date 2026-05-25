import { useEffect, useRef } from "react";
import { eventBroker } from "@/core/eventBroker";
import { useGameplayStore } from "@/store/useGameStore";

export function useEngineSubscriptions(
  viewportRef: React.RefObject<HTMLDivElement | null>,
  triggerDialogue: (speaker: "player" | "boss", text: string) => void,
  resetDialogues: () => void
) {
  const triggerRef = useRef(triggerDialogue);
  const resetRef = useRef(resetDialogues);

  useEffect(() => {
    triggerRef.current = triggerDialogue;
    resetRef.current = resetDialogues;
  });

  useEffect(() => {
    const unsubGameplay = useGameplayStore.subscribe((state) => {
      const viewport = viewportRef.current;
      if (viewport) {
        if (state.isGlitching) {
          viewport.classList.add("filter-chromatic");
        } else {
          viewport.classList.remove("filter-chromatic");
        }
      }
    });

    const unsubs = [
      eventBroker.subscribe("DIALOGUE_TRIGGERED", ({ speaker, text }) => {
        triggerRef.current(speaker, text);
      }),
      eventBroker.subscribe("CLEAR_DIALOGUES", () => {
        resetRef.current();
      }),
    ];

    return () => {
      unsubGameplay();
      unsubs.forEach((unsub) => unsub());
    };
  }, [viewportRef]);
}
