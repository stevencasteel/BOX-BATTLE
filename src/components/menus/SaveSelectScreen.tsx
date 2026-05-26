import "./SaveSelectScreen.css";
import { SaveSlotData } from "@/core/SaveManager";
import { Save, FolderPlus, Copy, Trash2, ArrowLeft } from "lucide-react";

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
      <div className="title-banner">
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
          {isCopyMode
            ? copySourceIndex === -1
              ? "CHOOSE SLOT TO COPY"
              : "CHOOSE WHERE TO COPY"
            : isEraseMode
              ? "CHOOSE SLOT TO DELETE"
              : "CHOOSE A SAVE SLOT"}
        </h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>
          Select a slot to load your game
        </p>
      </div>

      <div className="slot-list">
        {slots.map((slot, i) => (
          <button
            key={i}
            onClick={() => handleSlotSelect(i)}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(i);
            }}
            className={`slot-card ${menuIndex === i ? "slot-card-focused" : slot.empty ? "slot-card-empty" : "slot-card-loaded"}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div className="flex-row" style={{ alignItems: "center", gap: "12px" }}>
              <span
                className="cursor-arrow"
                style={{
                  visibility: menuIndex === i ? "visible" : "hidden",
                  width: "16px",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                ▶
              </span>
              <div className="flex-row" style={{ alignItems: "center", gap: "8px" }}>
                {slot.empty ? (
                  <FolderPlus size={18} style={{ color: "#4a5568", flexShrink: 0 }} />
                ) : (
                  <Save size={18} style={{ color: "var(--signal-green)", flexShrink: 0 }} />
                )}
                <div className="flex-col" style={{ textAlign: "left" }}>
                  <span
                    style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "0.12em", textTransform: "uppercase" }}
                  >
                    Slot {i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: menuIndex === i ? "#22c55e" : "#a0aec0",
                      marginTop: "6px",
                    }}
                  >
                    {slot.empty ? "NO SAVE DATA" : `WINS: ${slot.wins} / LOSSES: ${slot.losses}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-row" style={{ alignItems: "center", gap: "12px" }}>
              <div
                className={`led-dot ${
                  slot.empty ? (i === copySourceIndex ? "led-yellow" : "") : isEraseMode ? "led-red" : "led-green"
                }`}
                style={{ background: slot.empty && i !== copySourceIndex ? "#07080b" : "" }}
              />
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#718096" }}>
                {slot.empty ? "EMPTY" : "SAVED GAME"}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div
        className="flex-col"
        style={{ gap: "16px", width: "100%", maxWidth: "420px", marginTop: "16px", paddingBottom: "10px" }}
      >
        <div className="flex-row" style={{ gap: "16px", justifyContent: "center" }}>
          <button
            onClick={toggleCopyMode}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(3);
            }}
            className={`neo-btn ${menuIndex === 3 ? "neo-btn-focused" : isCopyMode ? "neo-btn-active" : ""}`}
            style={{
              flex: 1,
              padding: "18px",
              fontSize: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              className="cursor-arrow"
              style={{ visibility: menuIndex === 3 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
            >
              ▶
                </span>
            <Copy size={16} style={{ flexShrink: 0 }} />
            <span>Copy Slot</span>
            <span
              className="cursor-arrow"
              style={{ visibility: menuIndex === 3 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
            >
              ◀
                </span>
          </button>
          <button
            onClick={toggleEraseMode}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(4);
            }}
            className={`neo-btn ${menuIndex === 4 ? "neo-btn-focused" : isEraseMode ? "neo-btn-active" : ""}`}
            style={{
              flex: 1,
              padding: "18px",
              fontSize: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              className="cursor-arrow"
              style={{ visibility: menuIndex === 4 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
            >
              ▶
                </span>
            <Trash2 size={16} style={{ flexShrink: 0 }} />
            <span>Delete Slot</span>
            <span
              className="cursor-arrow"
              style={{ visibility: menuIndex === 4 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
            >
              ◀
                </span>
          </button>
        </div>
        <button
          onClick={onBack}
          onMouseEnter={() => {
            playHoverTick();
            setMenuIndex(5);
          }}
          className={`neo-btn ${menuIndex === 5 ? "neo-btn-focused" : ""}`}
          style={{
            padding: "18px",
            fontSize: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            className="cursor-arrow"
            style={{ visibility: menuIndex === 5 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
          >
            ▶
              </span>
          <ArrowLeft size={16} style={{ flexShrink: 0 }} />
          <span>Back</span>
          <span
            className="cursor-arrow"
            style={{ visibility: menuIndex === 5 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
          >
            ◀
              </span>
        </button>
      </div>
    </div>
  );
}
