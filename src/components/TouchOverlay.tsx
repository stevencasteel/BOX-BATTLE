import { TouchButton } from "./TouchButton";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpToLine, Swords, Zap } from "lucide-react";

export function TouchOverlay() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        gap: "8px",
        background: "#0c0e12",
        boxSizing: "border-box",
        flexGrow: 1,
        height: "0px",
        paddingTop: "6px",
      }}
    >
      <div
        style={{
          flex: 1.3,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "6px",
          height: "100%",
        }}
      >
        <TouchButton action="MOVE_LEFT" label={<ArrowLeft size={24} />} style={{ height: "100%" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", height: "100%" }}>
          <TouchButton action="MOVE_UP" label={<ArrowUp size={20} />} style={{ flex: 1 }} />
          <TouchButton action="MOVE_DOWN" label={<ArrowDown size={20} />} style={{ flex: 1 }} />
        </div>
        <TouchButton action="MOVE_RIGHT" label={<ArrowRight size={24} />} style={{ height: "100%" }} />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          height: "100%",
        }}
      >
        <TouchButton
          action="DASH"
          label={
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
              <Zap size={14} />
              <span>DASH</span>
            </div>
          }
          style={{
            flex: 1,
            borderColor: "var(--signal-yellow)",
            color: "var(--signal-yellow)",
          }}
        />
        <div style={{ display: "flex", gap: "6px", flex: 1.2 }}>
          <TouchButton
            action="ATTACK"
            label={
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px" }}>
                <Swords size={14} />
                <span>ATK</span>
              </div>
            }
            style={{ flex: 1, borderColor: "var(--signal-red)", color: "var(--signal-red)" }}
          />
          <TouchButton
            action="JUMP"
            label={
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px" }}>
                <ArrowUpToLine size={14} />
                <span>JMP</span>
              </div>
            }
            style={{
              flex: 1,
              borderColor: "var(--signal-green)",
              color: "var(--signal-green)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
