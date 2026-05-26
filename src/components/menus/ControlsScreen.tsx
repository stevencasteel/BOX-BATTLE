import "./ControlsScreen.css";
import { useState } from "react";
import { Action } from "@/core/InputProvider";
import { settingsManager } from "@/core/SettingsManager";
import { soundSynth } from "@/core/SoundSynth";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpCircle,
  Swords,
  Zap,
  Cpu,
  Keyboard,
  Sliders
} from "lucide-react";

interface ControlsScreenProps {
  menuIndex: number;
  rebindTarget: { action: Action; index: number } | null;
  onBack: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
  setRebindTarget: (target: { action: Action; index: number } | null) => void;
  reloadSaveSlots: () => void;
}

function formatKeyDisplayName(code: string): string {
  if (!code) return "[ EMPTY ]";

  const upper = code.trim();
  if (upper === "Space") return "SPACE";
  if (upper === "ArrowLeft") return "LEFT ARROW";
  if (upper === "ArrowRight") return "RIGHT ARROW";
  if (upper === "ArrowUp") return "UP ARROW";
  if (upper === "ArrowDown") return "DOWN ARROW";
  if (upper === "Period") return ".";
  if (upper === "Comma") return ",";
  if (upper === "Slash") return "/";
  if (upper === "Backspace") return "BACKSPACE";
  if (upper === "Escape") return "ESC";

  return upper.replace(/^Key/, "");
}

function getActionIcon(action: Action) {
  switch (action) {
    case "MOVE_LEFT":
      return <ArrowLeft size={14} style={{ flexShrink: 0 }} />;
    case "MOVE_RIGHT":
      return <ArrowRight size={14} style={{ flexShrink: 0 }} />;
    case "MOVE_UP":
      return <ArrowUp size={14} style={{ flexShrink: 0 }} />;
    case "MOVE_DOWN":
      return <ArrowDown size={14} style={{ flexShrink: 0 }} />;
    case "JUMP":
      return <ArrowUpCircle size={14} style={{ flexShrink: 0 }} />;
    case "ATTACK":
      return <Swords size={14} style={{ flexShrink: 0 }} />;
    case "DASH":
      return <Zap size={14} style={{ flexShrink: 0 }} />;
    default:
      return null;
  }
}

export function ControlsScreen({
  menuIndex,
  rebindTarget,
  onBack,
  playHoverTick,
  setMenuIndex,
  setRebindTarget,
  reloadSaveSlots,
}: ControlsScreenProps) {
  const [isTouchDevice] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(pointer: coarse)").matches;
    }
    return false;
  });

  const handleRebindTrigger = (action: Action) => {
    if (isTouchDevice) {
      soundSynth.playErrorTick();
      return;
    }
    soundSynth.playHitConfirm();
    setRebindTarget({ action, index: 0 });
  };

  const backBtnIndex = isTouchDevice ? 0 : 10;

  return (
    <div
      className="flex-col h-full w-full"
      style={{ justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", padding: "20px 0" }}
    >
      <div className="title-banner" style={{ marginTop: "0", paddingTop: "0" }}>
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
          CONTROLS
        </h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>
          {isTouchDevice ? "Calibration Matrix" : "Change keyboard buttons"}
        </p>
      </div>

      {isTouchDevice ? (
        <div
          className="mixer-board neo-pressed"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "32px",
            textAlign: "center",
            margin: "auto 0",
            width: "100%",
            maxWidth: "540px",
            borderColor: "rgba(234, 179, 8, 0.15)",
            boxSizing: "border-box",
          }}
        >
          <div className="led-dot led-yellow" style={{ width: "16px", height: "16px", marginBottom: "8px" }} />
          <span
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "var(--signal-yellow)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            [ TOUCH INTERFACE CALIBRATION ]
          </span>
          <h3
            style={{
              fontSize: "16px",
              color: "#ffffff",
              margin: 0,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            Bespoke Custom Touch Controls Coming Soon
          </h3>
          <p
            style={{
              fontSize: "11px",
              color: "#718096",
              lineHeight: "1.6",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              maxWidth: "380px",
              margin: 0,
            }}
          >
            Virtual joystick remapping, physical boundary calibration, and responsive gesture-mapping menus are
            currently under engineering.
          </p>
        </div>
      ) : (
        <>
          <div className="flex-row" style={{ gap: "16px", marginTop: "auto", marginBottom: "auto" }}>
            <button
              onClick={() => {
                settingsManager.setPreset("DEFAULT_1");
                soundSynth.playHitConfirm();
                reloadSaveSlots();
              }}
              onMouseEnter={() => {
                playHoverTick();
                setMenuIndex(0);
              }}
              className={`neo-btn-led ${menuIndex === 0 ? "neo-btn-led-focused" : ""}`}
              style={{
                padding: "16px 28px",
                fontSize: "14px",
                borderColor:
                  menuIndex === 0
                    ? "#22c55e"
                    : settingsManager.getCurrentPreset() === "DEFAULT_1"
                      ? "rgba(34, 197, 94, 0.4)"
                      : "",
                color:
                  menuIndex === 0 ? "#22c55e" : settingsManager.getCurrentPreset() === "DEFAULT_1" ? "#22c55e" : "",
              }}
            >
              <div className="btn-indicator-light" />
              <Keyboard size={16} style={{ flexShrink: 0 }} />
              <span>PRESET 1</span>
              <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: menuIndex === 0 ? "visible" : "hidden" }}>▶</span>
            </button>
            <button
              onClick={() => {
                settingsManager.setPreset("DEFAULT_2");
                soundSynth.playHitConfirm();
                reloadSaveSlots();
              }}
              onMouseEnter={() => {
                playHoverTick();
                setMenuIndex(1);
              }}
              className={`neo-btn-led ${menuIndex === 1 ? "neo-btn-led-focused" : ""}`}
              style={{
                padding: "16px 28px",
                fontSize: "14px",
                borderColor:
                  menuIndex === 1
                    ? "#22c55e"
                    : settingsManager.getCurrentPreset() === "DEFAULT_2"
                      ? "rgba(34, 197, 94, 0.4)"
                      : "",
                color:
                  menuIndex === 1 ? "#22c55e" : settingsManager.getCurrentPreset() === "DEFAULT_2" ? "#22c55e" : "",
              }}
            >
              <div className="btn-indicator-light" />
              <Cpu size={16} style={{ flexShrink: 0 }} />
              <span>PRESET 2</span>
              <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: menuIndex === 1 ? "visible" : "hidden" }}>▶</span>
            </button>
            <button
              onClick={() => {
                settingsManager.setPreset("CUSTOM");
                soundSynth.playHitConfirm();
                reloadSaveSlots();
              }}
              onMouseEnter={() => {
                playHoverTick();
                setMenuIndex(2);
              }}
              className={`neo-btn-led ${menuIndex === 2 ? "neo-btn-led-focused" : ""}`}
              style={{
                padding: "16px 28px",
                fontSize: "14px",
                borderColor:
                  menuIndex === 2
                    ? "#22c55e"
                    : settingsManager.getCurrentPreset() === "CUSTOM"
                      ? "rgba(34, 197, 94, 0.4)"
                      : "",
                color: menuIndex === 2 ? "#22c55e" : settingsManager.getCurrentPreset() === "CUSTOM" ? "#22c55e" : "",
              }}
            >
              <div className="btn-indicator-light" />
              <Sliders size={16} style={{ flexShrink: 0 }} />
              <span>CUSTOM</span>
              <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: menuIndex === 2 ? "visible" : "hidden" }}>▶</span>
            </button>
          </div>

          <div className="binding-board neo-pressed">
            {(Object.keys(settingsManager.getKeyMap()) as Action[]).map((action, idx) => {
              const keys = settingsManager.getKeyMap()[action] || [];
              const rowMenuIndex = idx + 3;
              const isFocusedRow = menuIndex === rowMenuIndex;
              return (
                <div key={action} className="binding-row" style={{ padding: "8px 4px" }}>
                  <span
                    className="binding-action-label"
                    style={{
                      color: isFocusedRow ? "#22c55e" : "",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <span
                      className="cursor-arrow"
                      style={{ marginRight: "8px", visibility: isFocusedRow ? "visible" : "hidden" }}
                    >
                      ▶
                    </span>
                    {getActionIcon(action)}
                    {action.replace("_", " ")}
                  </span>
                  <div className="flex-row" style={{ gap: "8px" }}>
                    <button
                      onClick={() => handleRebindTrigger(action)}
                      className={`binding-btn neo-btn ${isFocusedRow ? "neo-btn-focused" : ""}`}
                      style={{
                        minWidth: "150px",
                        padding: "16px 24px",
                        borderColor: rebindTarget?.action === action && rebindTarget?.index === 0 ? "#eab308" : "",
                        color: rebindTarget?.action === action && rebindTarget?.index === 0 ? "#eab308" : "",
                      }}
                    >
                      {rebindTarget?.action === action && rebindTarget?.index === 0
                        ? "PRESS ANY KEY..."
                        : formatKeyDisplayName(keys[0])}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="controls-notice" style={{ marginTop: "auto", marginBottom: "auto" }}>
            Determination Heal: Hold [Move Down] + Press [Jump] (Requires 1 Heal Charge)
          </div>
        </>
      )}

      <button
        onClick={onBack}
        onMouseEnter={() => {
          playHoverTick();
          setMenuIndex(backBtnIndex);
        }}
        className={`neo-btn-led ${menuIndex === backBtnIndex ? "neo-btn-led-focused" : ""}`}
        style={{ width: "100%", maxWidth: "38vmin", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
      >
        <div className="btn-indicator-light" />
        <ArrowLeft size={16} style={{ flexShrink: 0 }} />
        <span>Back</span>
        <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: menuIndex === backBtnIndex ? "visible" : "hidden" }}>▶</span>
      </button>
    </div>
  );
}
