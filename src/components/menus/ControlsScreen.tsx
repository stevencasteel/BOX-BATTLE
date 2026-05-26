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
import { MenuContainer, MenuHeader, MenuButton, MenuBackButton } from "./MenuPrimitives";

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
    <MenuContainer style={{ padding: "20px 0" }}>
      <MenuHeader title="CONTROLS" subtitle={isTouchDevice ? "Calibration Matrix" : "Change keyboard buttons"} />

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
            <MenuButton
              variant="led"
              isFocused={menuIndex === 0}
              onFocused={() => setMenuIndex(0)}
              playHoverTick={playHoverTick}
              onClick={() => {
                settingsManager.setPreset("DEFAULT_1");
                soundSynth.playHitConfirm();
                reloadSaveSlots();
              }}
              leftIcon={<Keyboard size={16} style={{ flexShrink: 0 }} />}
              mainLabel="PRESET 1"
              showArrow={false}
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
            />

            <MenuButton
              variant="led"
              isFocused={menuIndex === 1}
              onFocused={() => setMenuIndex(1)}
              playHoverTick={playHoverTick}
              onClick={() => {
                settingsManager.setPreset("DEFAULT_2");
                soundSynth.playHitConfirm();
                reloadSaveSlots();
              }}
              leftIcon={<Cpu size={16} style={{ flexShrink: 0 }} />}
              mainLabel="PRESET 2"
              showArrow={false}
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
            />

            <MenuButton
              variant="led"
              isFocused={menuIndex === 2}
              onFocused={() => setMenuIndex(2)}
              playHoverTick={playHoverTick}
              onClick={() => {
                settingsManager.setPreset("CUSTOM");
                soundSynth.playHitConfirm();
                reloadSaveSlots();
              }}
              leftIcon={<Sliders size={16} style={{ flexShrink: 0 }} />}
              mainLabel="CUSTOM"
              showArrow={false}
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
            />
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
                      style={{ color: "var(--signal-green)", marginRight: "8px", visibility: isFocusedRow ? "visible" : "hidden" }}
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

      <MenuBackButton
        isFocused={menuIndex === backBtnIndex}
        onFocused={() => setMenuIndex(backBtnIndex)}
        playHoverTick={playHoverTick}
        onBack={onBack}
      />
    </MenuContainer>
  );
}
