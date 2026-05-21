import { AudioSettings } from "@/core/SettingsManager";

interface AudioScreenProps {
  audio: AudioSettings;
  menuIndex: number;
  handleVolumeChange: (field: keyof AudioSettings, value: number | boolean) => void;
  onBack: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function AudioScreen({
  audio,
  menuIndex,
  handleVolumeChange,
  onBack,
  playHoverTick,
  setMenuIndex,
}: AudioScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner">
        <h2 style={{ fontSize: "2rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>SOUND SETTINGS</h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>Adjust game sounds and music volume</p>
      </div>

      <div className="mixer-board neo-pressed">
        <div className="mixer-strip">
          <div className="mixer-header" style={{ color: menuIndex === 0 ? "#22c55e" : "#718096" }}>
            <span>
              {menuIndex === 0 && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
              MAIN VOLUME
            </span>
            <span style={{ color: audio.masterMuted ? "#ef4444" : menuIndex === 0 ? "#22c55e" : "#4ade80" }}>
              {audio.masterMuted ? "MUTED" : `${Math.round(audio.masterVolume * 100)}%`}
            </span>
          </div>
          <div className="slider-row">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audio.masterVolume}
              onChange={(e) => handleVolumeChange("masterVolume", parseFloat(e.target.value))}
              disabled={audio.masterMuted}
              className="custom-range-slider"
              style={{ 
                filter: menuIndex === 0 ? "drop-shadow(0 0 2px rgba(34,197,94,0.4))" : "",
                background: `linear-gradient(to right, var(--signal-green) 0%, var(--signal-green) ${audio.masterVolume * 100}%, var(--surface-bg) ${audio.masterVolume * 100}%, var(--surface-bg) 100%)`
              }}
            />
          </div>
        </div>

        <div className="mixer-strip">
          <div className="mixer-header" style={{ color: menuIndex === 1 ? "#22c55e" : "#718096" }}>
            <span>
              {menuIndex === 1 && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
              SOUND EFFECTS
            </span>
            <span style={{ color: audio.sfxMuted ? "#ef4444" : menuIndex === 1 ? "#22c55e" : "#4ade80" }}>
              {audio.sfxMuted ? "MUTED" : `${Math.round(audio.sfxVolume * 100)}%`}
            </span>
          </div>
          <div className="slider-row">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audio.sfxVolume}
              onChange={(e) => handleVolumeChange("sfxVolume", parseFloat(e.target.value))}
              disabled={audio.sfxMuted}
              className="custom-range-slider"
              style={{ 
                filter: menuIndex === 1 ? "drop-shadow(0 0 2px rgba(34,197,94,0.4))" : "",
                background: `linear-gradient(to right, var(--signal-green) 0%, var(--signal-green) ${audio.sfxVolume * 100}%, var(--surface-bg) ${audio.sfxVolume * 100}%, var(--surface-bg) 100%)`
              }}
            />
          </div>
        </div>

        <div className="mixer-strip">
          <div className="mixer-header" style={{ color: menuIndex === 2 ? "#22c55e" : "#718096" }}>
            <span>
              {menuIndex === 2 && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
              MUSIC
            </span>
            <span style={{ color: audio.musicMuted ? "#ef4444" : menuIndex === 2 ? "#22c55e" : "#4ade80" }}>
              {audio.musicMuted ? "MUTED" : `${Math.round(audio.musicVolume * 100)}%`}
            </span>
          </div>
          <div className="slider-row">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audio.musicVolume}
              onChange={(e) => handleVolumeChange("musicVolume", parseFloat(e.target.value))}
              disabled={audio.musicMuted}
              className="custom-range-slider"
              style={{ 
                filter: menuIndex === 2 ? "drop-shadow(0 0 2px rgba(34,197,94,0.4))" : "",
                background: `linear-gradient(to right, var(--signal-green) 0%, var(--signal-green) ${audio.musicVolume * 100}%, var(--surface-bg) ${audio.musicVolume * 100}%, var(--surface-bg) 100%)`
              }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onBack}
        onMouseEnter={() => { playHoverTick(); setMenuIndex(3); }}
        className={`neo-btn ${menuIndex === 3 ? "neo-btn-focused" : ""}`}
        style={{ width: "100%", maxWidth: "240px" }}
      >
        {menuIndex === 3 && <span className="cursor-arrow">▶</span>}
        Back
        {menuIndex === 3 && <span className="cursor-arrow">◀</span>}
      </button>
    </div>
  );
}