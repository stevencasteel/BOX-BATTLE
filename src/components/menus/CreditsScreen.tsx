interface CreditsScreenProps {
  onBack: () => void;
}

export function CreditsScreen({ onBack }: CreditsScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner">
        <h2 style={{ fontSize: "2rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>CREDITS</h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>Game Developers and Tools</p>
      </div>

      <div className="credits-block neo-pressed flex-col" style={{ gap: "16px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: "bold", color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0, textShadow: "0 0 8px rgba(34, 197, 94, 0.45)" }}>Created by Steven Casteel</p>
        <p style={{ fontSize: "10px", color: "#4a5568", margin: 0 }}>WWW.STEVENCASTEEL.COM</p>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", fontSize: "10px", color: "#a0aec0", lineHeight: "1.5" }}>
          <p style={{ margin: 0 }}>• Built using modern web technologies and HTML5 Canvas.</p>
          <p style={{ margin: 0 }}>• Sounds generated dynamically using the Web Audio API.</p>
          <p style={{ margin: 0 }}>• Game progress is saved automatically on your browser.</p>
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