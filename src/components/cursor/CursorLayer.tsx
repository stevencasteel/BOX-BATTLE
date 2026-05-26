import { motion, AnimatePresence } from "framer-motion";
import { CURSOR_VARIANTS } from "./CursorVariants";
import { CursorType } from "@/store/useCursorStore";
import { Eye, Play } from "lucide-react";

interface CursorLayerProps {
  cursorType: CursorType;
  isPressed: boolean;
}

export function CursorLayer({ cursorType, isPressed }: CursorLayerProps) {
  const variant = CURSOR_VARIANTS[cursorType];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Layer A — Aura (optional prismatic ring) */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0) 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
        animate={{
          width: (variant.bubbleSize > 0 && cursorType !== "text") ? variant.bubbleSize + 24 : 0,
          height: (variant.bubbleSize > 0 && cursorType !== "text") ? variant.bubbleSize + 24 : 0,
        }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
      />

      {/* Layer B — Icon Bubble */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          borderRadius: "50%",
          backgroundColor: variant.bubbleBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 2,
        }}
        animate={{
          width: variant.bubbleSize,
          height: variant.bubbleSize,
        }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
      >
        <AnimatePresence mode="wait">
          {cursorType === "view" && (
            <motion.div
              key="view-icon"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Eye size={32} color={variant.color} />
            </motion.div>
          )}
          {cursorType === "view-small" && (
            <motion.div
              key="view-small-icon"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Eye size={20} color={variant.color} />
            </motion.div>
          )}
          {cursorType === "play" && (
            <motion.div
              key="play-icon"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Play size={32} fill={variant.color} color={variant.color} />
            </motion.div>
          )}
          {cursorType === "text" && (
            <motion.div
              key="text-icon"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <svg width="26" height="26" viewBox="0 0 83 83" style={{ display: "block" }}>
                <path
                  fill="none"
                  stroke={variant.color}
                  strokeLinecap="round"
                  strokeWidth="4"
                  d="M43 71h11M43 12h11M25.5 71h11m-11-59h11m3.5 5v50"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Layer C — Triangle Pointer positioned at exact tracking center with offset compensation */}
      {variant.isBase && (
        <motion.div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            x: "-5.5px",
            y: "-3.2px",
            zIndex: 3,
            pointerEvents: "none",
            transformOrigin: "top left",
          }}
          animate={{
            scale: isPressed ? 0.85 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <svg width="24" height="24" viewBox="0 0 100 100" style={{ display: "block" }}>
            <path
              d="M22.917,13.375l51.333,51.333l-19.03,-3.781l14.863,23.031l-8.833,8.834l-14.863,-23.032l-4.387,27.198l-19.083,-83.583Z"
              fill={variant.color}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="2"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
