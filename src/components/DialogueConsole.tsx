import { DialogueState } from "@/hooks/useGameDialogue";

interface DialogueConsoleProps {
  playerDialogue: DialogueState;
  bossDialogue: DialogueState;
  isTouchDevice: boolean;
}

export function DialogueConsole({ playerDialogue, bossDialogue, isTouchDevice }: DialogueConsoleProps) {
  const mobileClass = isTouchDevice ? "is-mobile" : "";
  return (
    <div className={`dialogue-console ${mobileClass}`}>
      <div
        className={`dialogue-box-left neo-pressed ${playerDialogue.active ? "dialogue-active-green" : "dialogue-inactive"} ${mobileClass}`}
      >
        <div
          className={`portrait-square led-green ${playerDialogue.isTyping ? "portrait-rumble" : ""} ${mobileClass}`}
          style={{
            background: playerDialogue.active ? "" : "#07080b",
          }}
        />
        <div className="dialogue-text-container">
          <div className={`dialogue-speaker-label ${mobileClass}`}>
            PLAYER
          </div>
          <div className={`dialogue-body-text ${mobileClass}`}>
            {playerDialogue.active ? playerDialogue.displayed : "[ NO SIGNAL ]"}
          </div>
        </div>
      </div>

      <div
        className={`dialogue-box-right neo-pressed ${bossDialogue.active ? "dialogue-active-red" : "dialogue-inactive"} ${mobileClass}`}
      >
        <div className="dialogue-text-container" style={{ textAlign: "right" }}>
          <div
            className={`dialogue-speaker-label ${mobileClass}`}
            style={{ color: "var(--signal-red)" }}
          >
            BOSS
          </div>
          <div className={`dialogue-body-text ${mobileClass}`}>
            {bossDialogue.active ? bossDialogue.displayed : "[ NO SIGNAL ]"}
          </div>
        </div>
        <div
          className={`portrait-square led-red ${bossDialogue.isTyping ? "portrait-rumble" : ""} ${mobileClass}`}
          style={{
            background: bossDialogue.active ? "" : "#07080b",
          }}
        />
      </div>
    </div>
  );
}
