import { useEffect, useRef, useState } from "react";
import { eventBroker } from "@/core/eventBroker";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Skull, AlertTriangle } from "lucide-react";

interface HudPanelProps {
  isTouchDevice: boolean;
  isPlayingScreen: boolean;
}

export function HudPanel({ isTouchDevice, isPlayingScreen }: HudPanelProps) {
  const [bannerText, setBannerText] = useState<string | null>(null);
  const phaseRef = useRef(1);

  useEffect(() => {
    const unsubPhase = eventBroker.subscribe("BOSS_PHASE_SHIFT", () => {
      phaseRef.current += 1;
      setBannerText(`PHASE ${phaseRef.current}`);
      setTimeout(() => {
        setBannerText(null);
      }, 2800);
    });

    return () => {
      unsubPhase();
    };
  }, []);

  if (isTouchDevice) {
    return (
      <div
        className="cabinet-status-panel neo-pressed"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          height: "36px",
          marginBottom: "4px",
          boxSizing: "border-box",
          flexShrink: 0,
          borderRadius: "8px",
        }}
      >
        <div id="hud-m-hp-group" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--signal-green)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
            <Heart size={10} fill="var(--signal-green)" style={{ flexShrink: 0 }} /> HP
          </span>
          <div className="flex-row" style={{ gap: "3px" }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                id={`hud-m-php-${i}`}
                className="led-dot led-green"
                style={{
                  width: "8px",
                  height: "8px",
                  border: "1px solid rgba(0,0,0,0.5)",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: "2px", marginLeft: "2px" }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                id={`hud-m-heal-${i}`}
                className="led-dot"
                style={{
                  width: "4px",
                  height: "4px",
                  background: "#07080b",
                }}
              />
            ))}
          </div>
          <div
            id="hud-m-det-container"
            className="neo-pressed"
            style={{
              width: "36px",
              height: "6px",
              borderRadius: "3px",
              padding: "1px",
              boxSizing: "border-box",
              overflow: "hidden",
              background: "#07080b",
              marginLeft: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              id="hud-m-det-bar"
              style={{
                height: "100%",
                borderRadius: "1.5px",
                width: "0%",
                transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
                background: "hsl(280, 80%, 65%)",
                boxShadow: "0 0 4px rgba(168, 85, 24, 0.8)",
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {bannerText ? (
            <motion.span
              key="phase-warning-touch"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              style={{
                fontSize: "11px",
                color: "var(--signal-yellow)",
                fontWeight: "bold",
                letterSpacing: "0.12em",
                textShadow: "0 0 6px var(--signal-yellow-glow)",
                textTransform: "uppercase",
                background: "rgba(234, 179, 8, 0.15)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center"
              }}
            >
              <AlertTriangle size={11} style={{ marginRight: "4px", flexShrink: 0 }} /> {bannerText}
            </motion.span>
          ) : (
            <motion.span
              key="box-battle-touch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: "9px", color: "#718096", fontWeight: "bold", letterSpacing: "0.1em" }}
            >
              BOX BATTLE
            </motion.span>
          )}
        </AnimatePresence>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", color: "var(--signal-red)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
            <Skull size={10} style={{ flexShrink: 0 }} /> BOSS
          </span>
          <div
            id="hud-m-boss-container"
            className="neo-pressed"
            style={{
              width: "80px",
              height: "8px",
              borderRadius: "3px",
              padding: "1px",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <div
              id="hud-m-boss-bar"
              className="led-red"
              style={{
                height: "100%",
                borderRadius: "1.5px",
                width: "0%",
                transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cabinet-status-panel neo-pressed">
      <div id="hud-d-hp-group" className="hud-panel-block" style={{ gap: "4px" }}>
        <span className="hud-panel-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Heart size={14} fill="var(--signal-green)" style={{ color: "var(--signal-green)", flexShrink: 0 }} />
          PLAYER HP
        </span>
        <div className="flex-row" style={{ gap: "6px", alignItems: "center" }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              id={`hud-d-php-${i}`}
              className="led-dot led-green"
              style={{
                border: "1px solid rgba(0,0,0,0.5)",
              }}
            />
          ))}
        </div>

        <div className="flex-row" style={{ gap: "12px", marginTop: "6px", alignItems: "center" }}>
          <div className="flex-row" style={{ gap: "4px" }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                id={`hud-d-heal-${i}`}
                className="led-dot"
                style={{
                  border: "1px solid rgba(0,0,0,0.5)",
                  width: "6px",
                  height: "6px",
                }}
              />
            ))}
          </div>
          <div
            id="hud-d-det-container"
            className="neo-pressed"
            style={{
              width: "54px",
              height: "6px",
              borderRadius: "3px",
              padding: "1px",
              boxSizing: "border-box",
              overflow: "hidden",
              background: "#07080b",
            }}
          >
            <div
              id="hud-d-det-bar"
              style={{
                height: "100%",
                borderRadius: "2px",
                width: "0%",
                transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
                background: "hsl(280, 80%, 65%)",
                boxShadow: "0 0 4px rgba(168, 85, 247, 0.8)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="hud-panel-block" style={{ alignItems: "center", justifyContent: "center", minWidth: "280px", position: "relative" }}>
        <AnimatePresence mode="wait">
          {isPlayingScreen && bannerText ? (
            <motion.div
              key="phase-warning"
              initial={{ scale: 0.8, opacity: 0, y: -5 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 15 } }}
              exit={{ scale: 1.15, opacity: 0, transition: { duration: 0.15 } }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "2px solid var(--signal-yellow)",
                background: "rgba(12, 13, 17, 0.98)",
                padding: "10px 28px",
                borderRadius: "10px",
                boxShadow: "0 0 20px rgba(234, 179, 8, 0.35), inset 0 0 10px rgba(234, 179, 8, 0.2)",
                color: "var(--signal-yellow)",
                fontWeight: "bold",
                textShadow: "0 0 8px var(--signal-yellow-glow)",
                letterSpacing: "0.15em",
                fontSize: "clamp(13px, 1.8vmin, 18px)",
                textTransform: "uppercase"
              }}
            >
              <AlertTriangle size={18} style={{ color: "var(--signal-yellow)", flexShrink: 0, animation: "crt-pulse 1s infinite alternate" }} />
              <span>WARNING: {bannerText}</span>
            </motion.div>
          ) : isPlayingScreen ? (
            <motion.div
              key="box-battle-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                border: "1px solid rgba(255, 255, 255, 0.03)",
                background: "rgba(7, 8, 11, 0.85)",
                padding: "8px 22px",
                borderRadius: "8px",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.01), 0 4px 12px rgba(0, 0, 0, 0.75)",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  background: "rgba(34, 197, 94, 0.45)",
                  boxShadow: "0 0 6px rgba(34, 197, 94, 0.35)",
                }}
              />
              <span
                style={{
                  fontSize: "16px",
                  color: "rgba(34, 197, 94, 0.8)",
                  fontWeight: 900,
                  letterSpacing: "0.3em",
                  textShadow: "0 0 8px rgba(34, 197, 94, 0.35)",
                  textTransform: "uppercase",
                  lineHeight: "1",
                }}
              >
                BOX BATTLE
              </span>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  background: "rgba(34, 197, 94, 0.45)",
                  boxShadow: "0 0 6px rgba(34, 197, 94, 0.35)",
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="hud-panel-block" style={{ alignItems: "flex-end" }}>
        <span className="hud-panel-title hud-panel-title-red" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Skull size={14} style={{ color: "var(--signal-red)", flexShrink: 0 }} />
          BOSS HP
        </span>
        <div
          id="hud-d-boss-container"
          className="neo-pressed"
          style={{
            width: "160px",
            height: "10px",
            borderRadius: "4px",
            padding: "1px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            id="hud-d-boss-bar"
            className="led-red"
            style={{
              height: "100%",
              borderRadius: "2px",
              width: "0%",
              transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
