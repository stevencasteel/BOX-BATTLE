import { ReactNode, PointerEvent } from "react";
import { inputProvider, Action } from "@/core/InputProvider";

interface TouchButtonProps {
  action: Action;
  label: ReactNode;
  style?: React.CSSProperties;
}

export function TouchButton({ action, label, style }: TouchButtonProps) {
  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (e.pointerType === "touch") {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    inputProvider.triggerTouchStart(action);
  };

  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputProvider.triggerTouchEnd(action);
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="neo-btn"
      style={{
        ...style,
        userSelect: "none",
        touchAction: "none",
        padding: "0",
        borderRadius: "12px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.6)",
      }}
    >
      {label}
    </button>
  );
}
