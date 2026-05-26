import "./SaveSelectScreen.css";
import { SaveSlotData } from "@/core/SaveManager";
import { Save, FolderPlus, Copy, Trash2 } from "lucide-react";
import { MenuContainer, MenuHeader, MenuButton, MenuBackButton } from "./MenuPrimitives";

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
  const selectHeaderTitle = isCopyMode
    ? copySourceIndex === -1
      ? "CHOOSE SLOT TO COPY"
      : "CHOOSE WHERE TO COPY"
    : isEraseMode
      ? "CHOOSE SLOT TO DELETE"
      : "CHOOSE A SAVE SLOT";

  return (
    <MenuContainer>
      <MenuHeader title={selectHeaderTitle} subtitle="Select a slot to load your game" />

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
                <div className="flex-col" style={{ textAlign: "left" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {slot.empty ? (
                      <FolderPlus size={18} style={{ color: "#4a5568", flexShrink: 0 }} />
                    ) : (
                      <Save size={18} style={{ color: "var(--signal-green)", flexShrink: 0 }} />
                    )}
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
        style={{ gap: "16px", width: "100%", maxWidth: "64vmin", marginTop: "16px", paddingBottom: "10px" }}
      >
        <div className="flex-row" style={{ gap: "16px", justifyContent: "center", width: "100%" }}>
          <MenuButton
            variant="led"
            isFocused={menuIndex === 3}
            onFocused={() => setMenuIndex(3)}
            playHoverTick={playHoverTick}
            onClick={toggleCopyMode}
            leftIcon={<Copy size={16} style={{ flexShrink: 0 }} />}
            mainLabel="COPY SLOT"
            className={isCopyMode ? "neo-btn-led-active" : ""}
            indicatorColor={isCopyMode ? "yellow" : "green"}
            style={{ flex: 1, padding: "18px", whiteSpace: "nowrap" }}
          />

          <MenuButton
            variant="led"
            isFocused={menuIndex === 4}
            onFocused={() => setMenuIndex(4)}
            playHoverTick={playHoverTick}
            onClick={toggleEraseMode}
            leftIcon={<Trash2 size={16} style={{ flexShrink: 0 }} />}
            mainLabel="DELETE SLOT"
            className={isEraseMode ? "neo-btn-led-active" : ""}
            indicatorColor={isEraseMode ? "yellow" : "green"}
            style={{ flex: 1, padding: "18px", whiteSpace: "nowrap" }}
          />
        </div>

        <MenuBackButton
          isFocused={menuIndex === 5}
          onFocused={() => setMenuIndex(5)}
          playHoverTick={playHoverTick}
          onBack={onBack}
          style={{ padding: "18px", maxWidth: "100%", width: "100%" }}
        />
      </div>
    </MenuContainer>
  );
}
