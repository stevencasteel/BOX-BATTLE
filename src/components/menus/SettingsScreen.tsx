interface SettingsScreenProps {
  menuIndex: number;
  onAudio: () => void;
  onControls: () => void;
  onBack: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function SettingsScreen({
  menuIndex,
  onAudio,
  onControls,
  onBack,
  playHoverTick,
  setMenuIndex,
}: SettingsScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner" style={{ marginTop: "20px" }}>
        <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>SETTINGS</h2>
        <p style={{ color: "#718096", margin: "4px 0 0" }}>Mixers and controller binding profiles</p>
      </div>

      <div className="btn-container" style={{ margin: "auto 0" }}>
        <button
          onClick={onAudio}
          onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
          className={`neo-btn ${menuIndex === 0 ? "neo-btn-focused" : ""}`}
        >
          {menuIndex === 0 && <span className="cursor-arrow">▶</span>}
          AUDIO
          {menuIndex === 0 && <span className="cursor-arrow">◀</span>}
        </button>
        <button
          onClick={onControls}
          onMouseEnter={() => { playHoverTick(); setMenuIndex(1); }}
          className={`neo-btn ${menuIndex === 1 ? "neo-btn-focused" : ""}`}
        >
          {menuIndex === 1 && <span className="cursor-arrow">▶</span>}
          KEY BINDINGS
          {menuIndex === 1 && <span className="cursor-arrow">◀</span>}
        </button>
      </div>

      <button
        onClick={onBack}
        onMouseEnter={() => { playHoverTick(); setMenuIndex(2); }}
        className={`neo-btn ${menuIndex === 2 ? "neo-btn-focused" : ""}`}
        style={{ width: "100%", maxWidth: "240px" }}
      >
        {menuIndex === 2 && <span className="cursor-arrow">▶</span>}
        Back
        {menuIndex === 2 && <span className="cursor-arrow">◀</span>}
      </button>
    </div>
  );
}
