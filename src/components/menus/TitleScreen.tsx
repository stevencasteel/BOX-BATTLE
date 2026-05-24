import "./TitleScreen.css";
interface TitleScreenProps {
  menuIndex: number;
  onPlay: () => void;
  onSettings: () => void;
  onCredits: () => void;
  onSource: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function TitleScreen({
  menuIndex,
  onPlay,
  onSettings,
  onCredits,
  onSource,
  playHoverTick,
  setMenuIndex,
}: TitleScreenProps) {
  return (
    <div className="title-screen-container">
      {/* Structural background line vectors */}
      <div className="title-grid-overlay" />

      <div className="title-screen-header">
        <div className="system-tag">WELCOME TO THE ARENA</div>
        <div className="title-banner-overhauled">
          <h1>BOX BATTLE</h1>
          <div className="title-subtitle-container">
            <span className="subtitle-line"></span>
            <p className="subtitle-text">RETRO ACTION GAME</p>
            <span className="subtitle-line"></span>
          </div>
        </div>
      </div>

      <div className="title-screen-center">
        <div className="btn-container-overhauled">
          <button
            onClick={onPlay}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(0);
            }}
            className={`neo-btn-large ${menuIndex === 0 ? "neo-btn-large-focused" : ""}`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">PLAY GAME</span>
              <span className="btn-sub-label">CHOOSE A SAVE SLOT TO BEGIN</span>
            </div>
            {menuIndex === 0 && <span className="cursor-arrow-large">▶</span>}
          </button>

          <button
            onClick={onSettings}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(1);
            }}
            className={`neo-btn-large ${menuIndex === 1 ? "neo-btn-large-focused" : ""}`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">OPTIONS</span>
              <span className="btn-sub-label">ADJUST SOUNDS AND CONTROLS</span>
            </div>
            {menuIndex === 1 && <span className="cursor-arrow-large">▶</span>}
          </button>

          <button
            onClick={onCredits}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(2);
            }}
            className={`neo-btn-large ${menuIndex === 2 ? "neo-btn-large-focused" : ""}`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">CREDITS</span>
              <span className="btn-sub-label">GAME CREATOR AND DETAILS</span>
            </div>
            {menuIndex === 2 && <span className="cursor-arrow-large">▶</span>}
          </button>

          <button
            onClick={onSource}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(3);
            }}
            className={`neo-btn-large ${menuIndex === 3 ? "neo-btn-large-focused" : ""}`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">SOURCE CODE</span>
              <span className="btn-sub-label">BROWSE CABINET ENGINE FILE TREE</span>
            </div>
            {menuIndex === 3 && <span className="cursor-arrow-large">▶</span>}
          </button>
        </div>
      </div>

      <div className="title-screen-footer">
        <div className="footer-deco-line" />
        <div className="footer-status-bar">
          <span>CONTROL METHOD: KEYBOARD</span>
          <span className="footer-center-prompt">NAVIGATE: ARROWS / WASD • SELECT: ENTER / SPACE</span>
          <span>SAVES: 3 AVAILABLE</span>
        </div>
      </div>
    </div>
  );
}
