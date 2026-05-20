interface TitleScreenProps {
  menuIndex: number;
  onPlay: () => void;
  onSettings: () => void;
  onCredits: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function TitleScreen({
  menuIndex,
  onPlay,
  onSettings,
  onCredits,
  playHoverTick,
  setMenuIndex,
}: TitleScreenProps) {
  return (
    <div className="flex-col-center h-full w-full" style={{ justifyContent: "space-between" }}>
      <div className="title-banner">
        <h1>BOX BATTLE</h1>
        <p>CABINET SYSTEM INTERFACE</p>
      </div>

      <div className="btn-container">
        <button
          onClick={onPlay}
          onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
          className={`neo-btn ${menuIndex === 0 ? "neo-btn-focused" : ""}`}
        >
          {menuIndex === 0 && <span className="cursor-arrow">▶</span>}
          START GAME
          {menuIndex === 0 && <span className="cursor-arrow">◀</span>}
        </button>
        <button
          onClick={onSettings}
          onMouseEnter={() => { playHoverTick(); setMenuIndex(1); }}
          className={`neo-btn ${menuIndex === 1 ? "neo-btn-focused" : ""}`}
        >
          {menuIndex === 1 && <span className="cursor-arrow">▶</span>}
          SETTINGS
          {menuIndex === 1 && <span className="cursor-arrow">◀</span>}
        </button>
        <button
          onClick={onCredits}
          onMouseEnter={() => { playHoverTick(); setMenuIndex(2); }}
          className={`neo-btn ${menuIndex === 2 ? "neo-btn-focused" : ""}`}
        >
          {menuIndex === 2 && <span className="cursor-arrow">▶</span>}
          CREDITS
          {menuIndex === 2 && <span className="cursor-arrow">◀</span>}
        </button>
      </div>

      <div style={{ fontSize: "9px", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
        Standard Keyboard Navigation Active // arrows + enter
      </div>
    </div>
  );
}
