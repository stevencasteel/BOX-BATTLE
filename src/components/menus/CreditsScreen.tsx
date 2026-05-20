interface CreditsScreenProps {
  onBack: () => void;
}

export function CreditsScreen({ onBack }: CreditsScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner" style={{ marginTop: "20px" }}>
        <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>CREDITS</h2>
        <p style={{ color: "#718096", margin: "4px 0 0" }}>System architecture and engineering</p>
      </div>

      <div className="credits-block neo-pressed flex-col" style={{ gap: "16px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: "bold", color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0, textShadow: "0 0 8px rgba(34, 197, 94, 0.45)" }}>Created by Steven Casteel</p>
        <p style={{ fontSize: "10px", color: "#4a5568", margin: 0 }}>WWW.STEVENCASTEEL.COM</p>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", fontSize: "10px", color: "#a0aec0", lineHeight: "1.5" }}>
          <p style={{ margin: 0 }}>• Built with TypeScript & Vite using standard Web Canvas interfaces.</p>
          <p style={{ margin: 0 }}>• Audio procedurally synthesized inside <span style={{ color: "#ffffff" }}>SoundSynth.ts</span> using zero-asset Web Audio API waveforms.</p>
          <p style={{ margin: 0 }}>• Save profiles managed under local persistent database registers.</p>
        </div>
      </div>

      <button
        onClick={onBack}
        className="neo-btn neo-btn-focused"
        style={{ width: "100%", maxWidth: "240px" }}
      >
        <span className="cursor-arrow">▶</span>
        Back
        <span className="cursor-arrow">◀</span>
      </button>
    </div>
  );
}
