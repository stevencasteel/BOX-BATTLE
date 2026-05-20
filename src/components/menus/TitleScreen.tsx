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
    <div className="title-screen-container">
      {/* Structural background line vectors */}
      <div className="title-grid-overlay" />

      <div className="title-screen-header">
        <div className="system-tag">BOOT STATUS: SECURE_CORE_v1.0.4</div>
        <div className="title-banner-overhauled">
          <h1>BOX BATTLE</h1>
          <div className="title-subtitle-container">
            <span className="subtitle-line"></span>
            <p className="subtitle-text">CABINET SYSTEM INTERFACE</p>
            <span className="subtitle-line"></span>
          </div>
        </div>
      </div>

      <div className="title-screen-center">
        <div className="btn-container-overhauled">
          <button
            onClick={onPlay}
            onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
            className={`neo-btn-large ${menuIndex === 0 ? "neo-btn-large-focused" : ""}`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">START SIMULATION</span>
              <span className="btn-sub-label">ACCESS PERSISTENT DATA SLOTS</span>
            </div>
            {menuIndex === 0 && <span className="cursor-arrow-large">▶</span>}
          </button>

          <button
            onClick={onSettings}
            onMouseEnter={() => { playHoverTick(); setMenuIndex(1); }}
            className={`neo-btn-large ${menuIndex === 1 ? "neo-btn-large-focused" : ""}`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">SYSTEM CONFIG</span>
              <span className="btn-sub-label">CALIBRATE CONTROLS & MIXERS</span>
            </div>
            {menuIndex === 1 && <span className="cursor-arrow-large">▶</span>}
          </button>

          <button
            onClick={onCredits}
            onMouseEnter={() => { playHoverTick(); setMenuIndex(2); }}
            className={`neo-btn-large ${menuIndex === 2 ? "neo-btn-large-focused" : ""}`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">DIAGNOSTICS & CREDITS</span>
              <span className="btn-sub-label">ENGINE SPECIFICATIONS & CREATOR</span>
            </div>
            {menuIndex === 2 && <span className="cursor-arrow-large">▶</span>}
          </button>
        </div>
      </div>

      <div className="title-screen-footer">
        <div className="footer-deco-line" />
        <div className="footer-status-bar">
          <span>CONTROLLER: KEYBOARD MAPPED</span>
          <span className="footer-center-prompt">NAV: ARROWS / WASD  •  SELECT: ENTER / SPACE</span>
          <span>SLOTS: 3/3 DETECTED</span>
        </div>
      </div>
    </div>
  );
}