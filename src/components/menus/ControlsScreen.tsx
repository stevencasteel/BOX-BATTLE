import { Action } from "@/core/InputProvider";
import { settingsManager } from "@/core/SettingsManager";
import { soundSynth } from "@/core/SoundSynth";

interface ControlsScreenProps {
  menuIndex: number;
  rebindTarget: { action: Action; index: number } | null;
  onBack: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
  setRebindTarget: (target: { action: Action; index: number } | null) => void;
  reloadSaveSlots: () => void;
}

function formatKeyDisplayName(code: string): string {
  if (!code) return "[ EMPTY ]";
  
  const upper = code.trim();
  if (upper === "Space") return "SPACE";
  if (upper === "ArrowLeft") return "LEFT ARROW";
  if (upper === "ArrowRight") return "RIGHT ARROW";
  if (upper === "ArrowUp") return "UP ARROW";
  if (upper === "ArrowDown") return "DOWN ARROW";
  if (upper === "Period") return ".";
  if (upper === "Comma") return ",";
  if (upper === "Slash") return "/";
  if (upper === "Backspace") return "BACKSPACE";
  if (upper === "Escape") return "ESC";
  
  return upper.replace(/^Key/, "");
}

export function ControlsScreen({
  menuIndex,
  rebindTarget,
  onBack,
  playHoverTick,
  setMenuIndex,
  setRebindTarget,
  reloadSaveSlots,
}: ControlsScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", padding: "20px 0" }}>
      
      <div className="title-banner" style={{ marginTop: "0", paddingTop: "0" }}>
        <h2 style={{ fontSize: "2rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>KEY CONTROLS</h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>Change keyboard buttons</p>
      </div>

      <div className="flex-row" style={{ gap: "16px" }}>
        <button
          onClick={() => {
            settingsManager.setPreset("DEFAULT_1");
            soundSynth.playHitConfirm();
            reloadSaveSlots();
          }}
          onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
          className={`neo-btn ${menuIndex === 0 ? "neo-btn-focused" : ""}`}
          style={{
            padding: "16px 28px",
            fontSize: "14px",
            borderColor: menuIndex === 0 ? "#22c55e" : settingsManager.getCurrentPreset() === "DEFAULT_1" ? "rgba(34, 197, 94, 0.4)" : "",
            color: menuIndex === 0 ? "#22c55e" : settingsManager.getCurrentPreset() === "DEFAULT_1" ? "#22c55e" : ""
          }}
        >
          <span className="cursor-arrow" style={{ marginRight: "8px", visibility: menuIndex === 0 ? "visible" : "hidden" }}>▶</span>
          PRESET 1
          <span className="cursor-arrow" style={{ marginLeft: "8px", visibility: menuIndex === 0 ? "visible" : "hidden" }}>◀</span>
        </button>
        <button
          onClick={() => {
            settingsManager.setPreset("DEFAULT_2");
            soundSynth.playHitConfirm();
            reloadSaveSlots();
          }}
          onMouseEnter={() => { playHoverTick(); setMenuIndex(1); }}
          className={`neo-btn ${menuIndex === 1 ? "neo-btn-focused" : ""}`}
          style={{
            padding: "16px 28px",
            fontSize: "14px",
            borderColor: menuIndex === 1 ? "#22c55e" : settingsManager.getCurrentPreset() === "DEFAULT_2" ? "rgba(34, 197, 94, 0.4)" : "",
            color: menuIndex === 1 ? "#22c55e" : settingsManager.getCurrentPreset() === "DEFAULT_2" ? "#22c55e" : ""
          }}
        >
          <span className="cursor-arrow" style={{ marginRight: "8px", visibility: menuIndex === 1 ? "visible" : "hidden" }}>▶</span>
          PRESET 2
          <span className="cursor-arrow" style={{ marginLeft: "8px", visibility: menuIndex === 1 ? "visible" : "hidden" }}>◀</span>
        </button>
        <button
          onClick={() => {
            settingsManager.setPreset("CUSTOM");
            soundSynth.playHitConfirm();
            reloadSaveSlots();
          }}
          onMouseEnter={() => { playHoverTick(); setMenuIndex(2); }}
          className={`neo-btn ${menuIndex === 2 ? "neo-btn-focused" : ""}`}
          style={{
            padding: "16px 28px",
            fontSize: "14px",
            borderColor: menuIndex === 2 ? "#22c55e" : settingsManager.getCurrentPreset() === "CUSTOM" ? "rgba(34, 197, 94, 0.4)" : "",
            color: menuIndex === 2 ? "#22c55e" : settingsManager.getCurrentPreset() === "CUSTOM" ? "#22c55e" : ""
          }}
        >
          <span className="cursor-arrow" style={{ marginRight: "8px", visibility: menuIndex === 2 ? "visible" : "hidden" }}>▶</span>
          CUSTOM
          <span className="cursor-arrow" style={{ marginLeft: "8px", visibility: menuIndex === 2 ? "visible" : "hidden" }}>◀</span>
        </button>
      </div>

      <div className="binding-board neo-pressed">
        {(Object.keys(settingsManager.getKeyMap()) as Action[]).map((action, idx) => {
          const keys = settingsManager.getKeyMap()[action] || [];
          const rowMenuIndex = idx + 3;
          const isFocusedRow = menuIndex === rowMenuIndex;
          return (
            <div key={action} className="binding-row" style={{ padding: "8px 4px" }}>
              <span className="binding-action-label" style={{ color: isFocusedRow ? "#22c55e" : "", fontSize: "14px", display: "flex", alignItems: "center" }}>
                <span className="cursor-arrow" style={{ marginRight: "8px", visibility: isFocusedRow ? "visible" : "hidden" }}>▶</span>
                {action.replace("_", " ")}
              </span>
              <div className="flex-row" style={{ gap: "8px" }}>
                <button
                  onClick={() => {
                    soundSynth.playHitConfirm();
                    setRebindTarget({ action, index: 0 });
                  }}
                  className={`binding-btn neo-btn ${isFocusedRow ? "neo-btn-focused" : ""}`}
                  style={{
                    minWidth: "150px",
                    padding: "16px 24px",
                    borderColor: rebindTarget?.action === action && rebindTarget?.index === 0 ? "#eab308" : "",
                    color: rebindTarget?.action === action && rebindTarget?.index === 0 ? "#eab308" : ""
                  }}
                >
                  {rebindTarget?.action === action && rebindTarget?.index === 0
                    ? "PRESS ANY KEY..."
                    : formatKeyDisplayName(keys[0])}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="controls-notice">
        Determination Heal: Hold [Move Down] + Press [Jump] (Requires 1 Heal Charge)
      </div>

      <button
        onClick={onBack}
        onMouseEnter={() => { playHoverTick(); setMenuIndex(10); }}
        className={`neo-btn ${menuIndex === 10 ? "neo-btn-focused" : ""}`}
        style={{ width: "100%", maxWidth: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span className="cursor-arrow" style={{ marginRight: "8px", visibility: menuIndex === 10 ? "visible" : "hidden" }}>▶</span>
        Back
        <span className="cursor-arrow" style={{ marginLeft: "8px", visibility: menuIndex === 10 ? "visible" : "hidden" }}>◀</span>
      </button>

    </div>
  );
}
