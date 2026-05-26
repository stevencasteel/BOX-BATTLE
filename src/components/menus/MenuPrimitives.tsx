import React from "react";
import { soundSynth } from "@/core/SoundSynth";
import { useCursorStore } from "@/store/useCursorStore";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface MenuContainerProps {
  children: React.ReactNode;
  className?: string;
  hasGridOverlay?: boolean;
  style?: React.CSSProperties;
}

export function MenuContainer({ children, className = "", hasGridOverlay = false, style }: MenuContainerProps) {
  return (
    <div className={`title-screen-container ${className}`} style={style}>
      {hasGridOverlay && <div className="title-grid-overlay" />}
      {children}
    </div>
  );
}

interface MenuHeaderProps {
  title: string;
  subtitle: string;
}

export function MenuHeader({ title, subtitle }: MenuHeaderProps) {
  return (
    <div className="title-screen-header">
      <div className="title-banner-overhauled">
        <h1 style={{ textTransform: "uppercase" }}>{title}</h1>
        <div className="title-subtitle-container">
          <span className="subtitle-line"></span>
          <p className="subtitle-text">{subtitle}</p>
          <span className="subtitle-line"></span>
        </div>
      </div>
    </div>
  );
}

interface MenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isFocused: boolean;
  onFocused?: () => void;
  playHoverTick?: () => void;
  variant?: "large" | "led";
  indicatorColor?: "green" | "yellow" | "red";
  mainLabel: React.ReactNode;
  subLabel?: string;
  leftIcon?: React.ReactNode;
  showArrow?: boolean;
}

export function MenuButton({
  isFocused,
  onFocused,
  playHoverTick,
  variant = "large",
  indicatorColor = "green",
  mainLabel,
  subLabel,
  leftIcon,
  showArrow = true,
  className = "",
  onMouseEnter,
  ...props
}: MenuButtonProps) {

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    useCursorStore.getState().setCursorType("button");
    if (playHoverTick) {
      playHoverTick();
    } else {
      soundSynth.playSelectTick();
    }
    if (onFocused) {
      onFocused();
    }
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    useCursorStore.getState().setCursorType("default");
    if (props.onMouseLeave) {
      props.onMouseLeave(e);
    }
  };

  const indicatorClass = isFocused ? `led-${indicatorColor}` : "";

  if (variant === "large") {
    return (
      <motion.button
        className={`neo-btn-large ${isFocused ? "neo-btn-large-focused" : ""} ${className}`}
        {...(props as Record<string, unknown>)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.025, x: 4 }}
        whileTap={{ scale: 0.97 }}
        animate={isFocused ? { scale: 1.025, x: 4 } : { scale: 1.0, x: 0 }}
        transition={{ type: "spring", stiffness: 450, damping: 14 }}
      >
        <div className="btn-indicator-light"  />
        <div className="btn-label-group">
          <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {leftIcon}
            {mainLabel}
          </span>
          {subLabel && <span className="btn-sub-label">{subLabel}</span>}
        </div>
        {isFocused && showArrow && (
          <span className="cursor-arrow-large">
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", fill: "currentColor", display: "block" }}>
              <polygon points="20,15 80,50 20,85" />
            </svg>
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      className={`neo-btn-led ${isFocused ? "neo-btn-led-focused" : ""} ${className}`}
      {...(props as Record<string, unknown>)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.98 }}
      animate={isFocused ? { scale: 1.02, x: 2 } : { scale: 1.0, x: 0 }}
      transition={{ type: "spring", stiffness: 450, damping: 14 }}
    >
      <div className={`btn-indicator-light ${indicatorClass}`} style={isFocused ? undefined : { background: "#1e2430" }} />
      {leftIcon}
      <span>{mainLabel}</span>
      {isFocused && showArrow && (
          <span className="cursor-arrow">
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", fill: "currentColor", display: "block" }}>
              <polygon points="20,15 80,50 20,85" />
            </svg>
          </span>
        )}
    </motion.button>
  );
}

interface MenuBackButtonProps extends Omit<MenuButtonProps, "mainLabel"> {
  onBack: () => void;
  label?: string;
}

export function MenuBackButton({
  onBack,
  label = "Back",
  isFocused,
  onFocused,
  playHoverTick,
  style,
  variant = "large",
  ...props
}: MenuBackButtonProps) {
  const defaultStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "58vmin",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    zIndex: 2,
    ...style
  };

  return (
    <MenuButton
      variant={variant}
      isFocused={isFocused}
      onFocused={onFocused}
      playHoverTick={playHoverTick}
      onClick={onBack}
      leftIcon={<ArrowLeft size={16} strokeWidth={2.5} style={{ flexShrink: 0 }} />}
      mainLabel={label}
      style={defaultStyle}
      {...props}
    />
  );
}
