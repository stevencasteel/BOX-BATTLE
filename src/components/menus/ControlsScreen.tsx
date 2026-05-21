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
      
      {/* 1. Header (Top) */}
      <div className="title-banner" style={{ marginTop: "0", paddingTop: "0" }}>
        <h2 style={{ fontSize: "2rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>KEY CONTROLS</h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>Change keyboard buttons</p>
      </div>

      {/* 2. Preset Selection Buttons (Suspended in Upper Negative Space) */}
      <div className="flex-row" style={{ gap: "16px" }}>
        <button
          onClick={() => {
            settingsManager.setPreset("DEFAULT_1");
            soundSynth.playHitConfirm();
            reloadSaveSlots();
          }}
          className="neo-btn"
          style={{
            padding: "16px 28px",
            fontSize: "14px",
            borderColor: settingsManager.getCurrentPreset() === "DEFAULT_1" ? "#22c55e" : "",
            color: settingsManager.getCurrentPreset() === "DEFAULT_1" ? "#22c55e" : ""
          }}
        >
          PRESET 1
        </button>
        <button
          onClick={() => {
            settingsManager.setPreset("DEFAULT_2");
            soundSynth.playHitConfirm();
            reloadSaveSlots();
          }}
          className="neo-btn"
          style={{
            padding: "16px 28px",
            fontSize: "14px",
            borderColor: settingsManager.getCurrentPreset() === "DEFAULT_2" ? "#22c55e" : "",
            color: settingsManager.getCurrentPreset() === "DEFAULT_2" ? "#22c55e" : ""
          }}
        >
          PRESET 2
        </button>
        <button
          onClick={() => {
            settingsManager.setPreset("CUSTOM");
            soundSynth.playHitConfirm();
            reloadSaveSlots();
          }}
          className="neo-btn"
          style={{
            padding: "16px 28px",
            fontSize: "14px",
            borderColor: settingsManager.getCurrentPreset() === "CUSTOM" ? "#22c55e" : "",
            color: settingsManager.getCurrentPreset() === "CUSTOM" ? "#22c55e" : ""
          }}
        >
          CUSTOM
        </button>
      </div>

      {/* 3. Interactive Binding Board (Middle Third Centerpiece) */}
      <div className="binding-board neo-pressed" style={{ margin: "0", maxHeight: "32vh" }}>
        {(Object.keys(settingsManager.getKeyMap()) as Action[]).map((action, idx) => {
          const keys = settingsManager.getKeyMap()[action] || [];
          const isFocusedRow = menuIndex === idx;
          return (
            <div key={action} className="binding-row">
              <span className="binding-action-label" style={{ color: isFocusedRow ? "#22c55e" : "", fontSize: "13px" }}>
                {isFocusedRow && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
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

      {/* 4. Help Instruction Card (Suspended in Lower Negative Space - Single Line Enforcement) */}
      <div style={{
        padding: "10px 20px",
        borderRadius: "10px",
        background: "rgba(168, 85, 247, 0.08)",
        border: "1px solid rgba(168, 85, 247, 0.25)",
        color: "hsl(280, 80%, 75%)",
        fontSize: "11px",
        fontWeight: "bold",
        letterSpacing: "0.08em",
        textAlign: "center",
        textTransform: "uppercase",
        textShadow: "0 0 6px rgba(168, 85, 247, 0.35)",
        width: "100%",
        maxWidth: "640px",
        boxSizing: "border-box",
        whiteSpace: "nowrap"
      }}>
        Determination Heal: Hold [Move Down] + Press [Jump] (Requires 1 Heal Charge)
      </div>

      {/* 5. Back Button (Bottom) */}
      <button
        onClick={onBack}
        onMouseEnter={() => { playHoverTick(); setMenuIndex(7); }}
        className={`neo-btn ${menuIndex === 7 ? "neo-btn-focused" : ""}`}
        style={{ width: "100%", maxWidth: "240px" }}
      >
        {menuIndex === 7 && <span className="cursor-arrow">▶</span>}
        Back
        {menuIndex === 7 && <span className="cursor-arrow">◀</span>}
      </button>

    </div>
  );
}
