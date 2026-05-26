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
      className="neo-btn touch-action-btn"
      style={style}
    >
      {label}
    </button>
  );
}
