import { TouchButton } from "./TouchButton";

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
        <TouchButton action="MOVE_LEFT" label="◀" style={{ height: "100%", fontSize: "24px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", height: "100%" }}>
          <TouchButton action="MOVE_UP" label="▲" style={{ flex: 1, fontSize: "20px" }} />
          <TouchButton action="MOVE_DOWN" label="▼" style={{ flex: 1, fontSize: "20px" }} />
        </div>
        <TouchButton action="MOVE_RIGHT" label="▶" style={{ height: "100%", fontSize: "24px" }} />
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
          label="DASH"
          style={{
            flex: 1,
            fontSize: "14px",
            borderColor: "var(--signal-yellow)",
            color: "var(--signal-yellow)",
          }}
        />
        <div style={{ display: "flex", gap: "6px", flex: 1.2 }}>
          <TouchButton
            action="ATTACK"
            label="ATK"
            style={{ flex: 1, fontSize: "14px", borderColor: "var(--signal-red)", color: "var(--signal-red)" }}
          />
          <TouchButton
            action="JUMP"
            label="JMP"
            style={{
              flex: 1,
              fontSize: "14px",
              borderColor: "var(--signal-green)",
              color: "var(--signal-green)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
