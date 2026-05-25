import { DialogueState } from "@/hooks/useGameDialogue";

interface DialogueConsoleProps {
  playerDialogue: DialogueState;
  bossDialogue: DialogueState;
  isTouchDevice: boolean;
}

export function DialogueConsole({ playerDialogue, bossDialogue, isTouchDevice }: DialogueConsoleProps) {
  return (
    <div
      className="dialogue-console"
      style={
        isTouchDevice
          ? {
              height: "54px",
              marginTop: "0px",
              gap: "4px",
              padding: "0",
              flexShrink: 0,
            }
          : undefined
      }
    >
      <div
        className={`dialogue-box-left neo-pressed ${playerDialogue.active ? "dialogue-active-green" : "dialogue-inactive"}`}
        style={
          isTouchDevice
            ? {
                padding: "4px 8px",
                gap: "8px",
                borderRadius: "6px",
                height: "100%",
              }
            : undefined
        }
      >
        <div
          className={`portrait-square led-green ${playerDialogue.isTyping ? "portrait-rumble" : ""}`}
          style={{
            background: playerDialogue.active ? "" : "#07080b",
            width: isTouchDevice ? "32px" : "64px",
            height: isTouchDevice ? "32px" : "64px",
          }}
        />
        <div className="dialogue-text-container">
          <div className="dialogue-speaker-label" style={isTouchDevice ? { fontSize: "10px" } : undefined}>
            PLAYER
          </div>
          <div
            className="dialogue-body-text"
            style={isTouchDevice ? { fontSize: "10px", lineHeight: "1.2" } : undefined}
          >
            {playerDialogue.active ? playerDialogue.displayed : "[ NO SIGNAL ]"}
          </div>
        </div>
      </div>

      <div
        className={`dialogue-box-right neo-pressed ${bossDialogue.active ? "dialogue-active-red" : "dialogue-inactive"}`}
        style={
          isTouchDevice
            ? {
                padding: "4px 8px",
                gap: "8px",
                borderRadius: "6px",
                height: "100%",
              }
            : undefined
        }
      >
        <div className="dialogue-text-container" style={{ textAlign: "right" }}>
          <div
            className="dialogue-speaker-label"
            style={
              isTouchDevice ? { fontSize: "10px", color: "var(--signal-red)" } : { color: "var(--signal-red)" }
            }
          >
            BOSS
          </div>
          <div
            className="dialogue-body-text"
            style={isTouchDevice ? { fontSize: "10px", lineHeight: "1.2" } : undefined}
          >
            {bossDialogue.active ? bossDialogue.displayed : "[ NO SIGNAL ]"}
          </div>
        </div>
        <div
          className={`portrait-square led-red ${bossDialogue.isTyping ? "portrait-rumble" : ""}`}
          style={{
            background: bossDialogue.active ? "" : "#07080b",
            width: isTouchDevice ? "32px" : "64px",
            height: isTouchDevice ? "32px" : "64px",
          }}
        />
      </div>
    </div>
  );
}
