import { TouchButton } from "./TouchButton";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpToLine, Swords, Zap } from "lucide-react";

export function TouchOverlay() {
  return (
    <div className="touch-overlay-panel">
      <div className="touch-joystick-side">
        <TouchButton action="MOVE_LEFT" label={<ArrowLeft size={24} />} style={{ height: "100%" }} />
        <div className="touch-vertical-group">
          <TouchButton action="MOVE_UP" label={<ArrowUp size={20} />} style={{ flex: 1 }} />
          <TouchButton action="MOVE_DOWN" label={<ArrowDown size={20} />} style={{ flex: 1 }} />
        </div>
        <TouchButton action="MOVE_RIGHT" label={<ArrowRight size={24} />} style={{ height: "100%" }} />
      </div>

      <div className="touch-action-side">
        <TouchButton
          action="DASH"
          label={
            <div className="touch-label-inner">
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
        <div className="touch-action-row">
          <TouchButton
            action="ATTACK"
            label={
              <div className="touch-label-inner">
                <Swords size={14} />
                <span>ATK/CHG</span>
              </div>
            }
            style={{ flex: 1, borderColor: "var(--signal-red)", color: "var(--signal-red)" }}
          />
          <TouchButton
            action="JUMP"
            label={
              <div className="touch-label-inner">
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
