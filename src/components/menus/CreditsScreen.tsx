import "./CreditsScreen.css";
import { Layout, Activity, Waves, Database, ArrowLeft } from "lucide-react";

interface CreditsScreenProps {
  onBack: () => void;
}

export function CreditsScreen({ onBack }: CreditsScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner" style={{ marginTop: "15px" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            margin: 0,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
          }}
        >
          SYSTEM CREDITS
        </h2>
        <p style={{ color: "#718096", margin: "4px 0 0", fontSize: "11px", letterSpacing: "0.15em" }}>
          Engine Architecture & Technologies
        </p>
      </div>

      <div
        className="credits-block neo-pressed flex-col"
        style={{
          width: "100%",
          maxWidth: "68vmin",
          padding: "3.2vmin",
          borderRadius: "2vmin",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
            paddingBottom: "1.2vmin",
            marginBottom: "1.2vmin",
          }}
        >
          <p
            style={{
              fontSize: "1.6vmin",
              fontWeight: "bold",
              color: "#22c55e",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              margin: 0,
              textShadow: "0 0 8px rgba(34, 197, 94, 0.45)",
            }}
          >
            Built by Steven Casteel
          </p>
          <p
            style={{
              fontSize: "1.2vmin",
              color: "#4ade80",
              margin: "0.6vmin 0 0",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: "bold",
              textShadow: "0 0 6px rgba(74, 222, 128, 0.2)",
            }}
          >
            AI Co-Pilots: Gemini 2.5 Pro, Gemini 3.5 Flash
          </p>
          <a
            href="https://www.stevencasteel.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontSize: "1.1vmin",
              color: "#4a5568",
              margin: "0.6vmin 0 0",
              letterSpacing: "0.15em",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--signal-green)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}
          >
            WWW.STEVENCASTEEL.COM
          </a>
        </div>

        <div className="credits-grid">
          <div className="credits-item">
            <span className="credits-tech-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Layout size={14} style={{ flexShrink: 0 }} />
              PRESENTATION LAYOUT
            </span>
            <span className="credits-tech-desc">
              React 19, TypeScript 6.0, and Vite 8.0 bundle chunk splitting for low loading latencies.
            </span>
          </div>

          <div className="credits-item">
            <span className="credits-tech-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Activity size={14} style={{ flexShrink: 0 }} />
              PHYSICS ENGINE
            </span>
            <span className="credits-tech-desc">
              Custom 60Hz Semi-Implicit Euler accumulator loops, dynamic circular sweep checks, and ceiling corner
              nudging.
            </span>
          </div>

          <div className="credits-item">
            <span className="credits-tech-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Waves size={14} style={{ flexShrink: 0 }} />
              AUDIO SYNTHESIS
            </span>
            <span className="credits-tech-desc">
              Dynamic procedural sound wave generation using native Web Audio API oscillators, gain, and muffle lowpass
              filters.
            </span>
          </div>

          <div className="credits-item">
            <span className="credits-tech-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Database size={14} style={{ flexShrink: 0 }} />
              DATA MANAGEMENT
            </span>
            <span className="credits-tech-desc">
              Zustand 5.0 reactive state managers and persistent browser registers secured with schema input checkers.
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="neo-btn neo-btn-focused"
        style={{ width: "100%", maxWidth: "240px", padding: "16px 32px", fontSize: "16px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
      >
        <span className="cursor-arrow">▶</span>
        <ArrowLeft size={16} style={{ flexShrink: 0 }} />
        Back
        <span className="cursor-arrow">◀</span>
      </button>
    </div>
  );
}
