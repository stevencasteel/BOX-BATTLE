import { useCursorStore, CursorType } from "@/store/useCursorStore";
import { useRef } from "react";

interface ButtonHandlerOptions {
  cursor?: CursorType;
  onClick?: (e: React.MouseEvent) => void;
}

export function useButtonHandlers(options: ButtonHandlerOptions = {}) {
  const setCursorType = useCursorStore((state) => state.setCursorType);
  const timeoutRef = useRef<number | null>(null);

  const onMouseEnter = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCursorType(options.cursor || "button");
  };

  const onMouseLeave = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setCursorType("default");
    }, 150);
  };

  const onClick = (e: React.MouseEvent) => {
    if (options.onClick) {
      options.onClick(e);
    }
  };

  return {
    onMouseEnter,
    onMouseLeave,
    onClick,
  };
}
