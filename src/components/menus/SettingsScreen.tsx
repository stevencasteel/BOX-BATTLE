import { Volume2, Keyboard, ArrowLeft } from "lucide-react";

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
    <div className="title-screen-container">
      <div className="title-banner" style={{ zIndex: 2 }}>
        <h2
          style={{
            fontSize: "2rem",
            margin: 0,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
          }}
        >
          SETTINGS
        </h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>
          Configure sound decibels and keyboard matrices
        </p>
      </div>

      <div className="btn-container-overhauled" style={{ zIndex: 2 }}>
        <button
          onClick={onAudio}
          onMouseEnter={() => {
            playHoverTick();
            setMenuIndex(0);
          }}
          className={`neo-btn-large ${menuIndex === 0 ? "neo-btn-large-focused" : ""}`}
        >
          <div className="btn-indicator-light" />
          <div className="btn-label-group">
            <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Volume2 size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
              SOUND SETTINGS
            </span>
            <span className="btn-sub-label">ADJUST GAME SOUNDS AND MUSIC VOLUME</span>
          </div>
          <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: menuIndex === 0 ? "visible" : "hidden" }}>▶</span>
        </button>

        <button
          onClick={onControls}
          onMouseEnter={() => {
            playHoverTick();
            setMenuIndex(1);
          }}
          className={`neo-btn-large ${menuIndex === 1 ? "neo-btn-large-focused" : ""}`}
        >
          <div className="btn-indicator-light" />
          <div className="btn-label-group">
            <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Keyboard size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
              KEYBOARD CONTROLS
            </span>
            <span className="btn-sub-label">CALIBRATE INPUTS AND REMAP KEYS</span>
          </div>
          <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: menuIndex === 1 ? "visible" : "hidden" }}>▶</span>
        </button>
      </div>

      <button
        onClick={onBack}
        onMouseEnter={() => {
          playHoverTick();
          setMenuIndex(2);
        }}
        className={`neo-btn-led ${menuIndex === 2 ? "neo-btn-led-focused" : ""}`}
        style={{ width: "100%", maxWidth: "38vmin", display: "flex", alignItems: "center", gap: "10px", zIndex: 2 }}
      >
        <div className="btn-indicator-light" />
        <ArrowLeft size={16} strokeWidth={2.5} style={{ flexShrink: 0 }} />
        <span>Back</span>
        <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: menuIndex === 2 ? "visible" : "hidden" }}>▶</span>
      </button>
    </div>
  );
}
