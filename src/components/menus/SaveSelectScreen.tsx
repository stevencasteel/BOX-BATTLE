import { SaveSlotData } from "@/core/SaveManager";

interface SaveSelectScreenProps {
  slots: SaveSlotData[];
  menuIndex: number;
  isCopyMode: boolean;
  copySourceIndex: number;
  isEraseMode: boolean;
  handleSlotSelect: (index: number) => void;
  toggleCopyMode: () => void;
  toggleEraseMode: () => void;
  onBack: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function SaveSelectScreen({
  slots,
  menuIndex,
  isCopyMode,
  copySourceIndex,
  isEraseMode,
  handleSlotSelect,
  toggleCopyMode,
  toggleEraseMode,
  onBack,
  playHoverTick,
  setMenuIndex,
}: SaveSelectScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner" style={{ marginTop: "12px" }}>
        <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>
          {isCopyMode
            ? copySourceIndex === -1
              ? "COPY SOURCE SLOT"
              : "COPY TARGET SLOT"
            : isEraseMode
            ? "ERASE ACTIVE SLOT"
            : "SAVE SLOTS"}
        </h2>
        <p style={{ color: "#718096", margin: "4px 0 0" }}>Select profile configuration</p>
      </div>

      <div className="slot-list">
        {slots.map((slot, i) => (
          <button
            key={i}
            onClick={() => handleSlotSelect(i)}
            onMouseEnter={() => { playHoverTick(); setMenuIndex(i); }}
            className={`slot-card ${menuIndex === i ? "slot-card-focused" : slot.empty ? "slot-card-empty" : "slot-card-loaded"}`}
          >
            <div className="flex-col">
              <span style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {menuIndex === i && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
                Slot {i + 1}
              </span>
              <span style={{ fontSize: "9px", textTransform: "uppercase", color: menuIndex === i ? "#22c55e" : "#a0aec0", marginTop: "4px", paddingLeft: menuIndex === i ? "16px" : "0" }}>
                {slot.empty ? "EMPTY" : `WINS: ${slot.wins} / LOSSES: ${slot.losses}`}
              </span>
            </div>
            <div className="flex-row" style={{ alignItems: "center", gap: "12px" }}>
              <div className={`led-dot ${
                slot.empty 
                  ? i === copySourceIndex ? "led-yellow" : "" 
                  : isEraseMode ? "led-red" : "led-green"
              }`} style={{ background: slot.empty && i !== copySourceIndex ? "#07080b" : "" }} />
              <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#718096" }}>
                {slot.empty ? "EMPTY" : "USED"}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex-col" style={{ gap: "12px", width: "100%", maxWidth: "340px", marginTop: "16px" }}>
        <div className="flex-row" style={{ gap: "16px", justifyContent: "center" }}>
          <button
            onClick={toggleCopyMode}
            onMouseEnter={() => { playHoverTick(); setMenuIndex(3); }}
            className={`neo-btn ${menuIndex === 3 ? "neo-btn-focused" : isCopyMode ? "neo-btn-active" : ""}`}
            style={{ flex: 1, padding: "10px" }}
          >
            {menuIndex === 3 && <span className="cursor-arrow">▶</span>}
            Copy
            {menuIndex === 3 && <span className="cursor-arrow">◀</span>}
          </button>
          <button
            onClick={toggleEraseMode}
            onMouseEnter={() => { playHoverTick(); setMenuIndex(4); }}
            className={`neo-btn ${menuIndex === 4 ? "neo-btn-focused" : isEraseMode ? "neo-btn-active" : ""}`}
            style={{ flex: 1, padding: "10px" }}
          >
            {menuIndex === 4 && <span className="cursor-arrow">▶</span>}
            Erase
            {menuIndex === 4 && <span className="cursor-arrow">◀</span>}
          </button>
        </div>
        <button
          onClick={onBack}
          onMouseEnter={() => { playHoverTick(); setMenuIndex(5); }}
          className={`neo-btn ${menuIndex === 5 ? "neo-btn-focused" : ""}`}
          style={{ padding: "10px" }}
        >
          {menuIndex === 5 && <span className="cursor-arrow">▶</span>}
          Back
          {menuIndex === 5 && <span className="cursor-arrow">◀</span>}
        </button>
      </div>
    </div>
  );
}
