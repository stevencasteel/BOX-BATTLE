import { CursorType } from "@/store/useCursorStore";

export interface CursorVariantConfig {
  blendMode: "normal" | "difference" | "exclusion";
  color: string;
  isBase: boolean;
  bubbleSize: number;
  bubbleBg: string;
}

export const CURSOR_VARIANTS: Record<CursorType, CursorVariantConfig> = {
  default: {
    blendMode: "normal",
    color: "var(--signal-green)",
    isBase: true,
    bubbleSize: 0,
    bubbleBg: "transparent",
  },
  button: {
    blendMode: "normal",
    color: "var(--signal-green)",
    isBase: true,
    bubbleSize: 0,
    bubbleBg: "transparent",
  },
  view: {
    blendMode: "difference",
    color: "var(--signal-green)",
    isBase: false,
    bubbleSize: 80,
    bubbleBg: "#ffffff",
  },
  "view-small": {
    blendMode: "difference",
    color: "var(--signal-green)",
    isBase: false,
    bubbleSize: 48,
    bubbleBg: "#ffffff",
  },
  play: {
    blendMode: "exclusion",
    color: "var(--signal-green)",
    isBase: false,
    bubbleSize: 80,
    bubbleBg: "#ffffff",
  },
  video: {
    blendMode: "exclusion",
    color: "var(--signal-green)",
    isBase: false,
    bubbleSize: 80,
    bubbleBg: "#ffffff",
  },
  text: {
    blendMode: "normal",
    color: "hsl(142, 71%, 58%)",
    isBase: false,
    bubbleSize: 64,
    bubbleBg: "transparent",
  },
  grab: {
    blendMode: "normal",
    color: "var(--signal-green)",
    isBase: false,
    bubbleSize: 0,
    bubbleBg: "transparent",
  },
  hidden: {
    blendMode: "normal",
    color: "transparent",
    isBase: false,
    bubbleSize: 0,
    bubbleBg: "transparent",
  },
};
