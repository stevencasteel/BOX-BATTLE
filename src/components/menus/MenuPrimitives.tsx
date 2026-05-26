import React from "react";
import { soundSynth } from "@/core/SoundSynth";
import { useCursorStore } from "@/store/useCursorStore";
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
      <button
        className={`neo-btn-large ${isFocused ? "neo-btn-large-focused" : ""} ${className}`}
        {...props}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="btn-indicator-light" style={isFocused ? undefined : { background: "#1e2430" }} />
        <div className="btn-label-group">
          <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {leftIcon}
            {mainLabel}
          </span>
          {subLabel && <span className="btn-sub-label">{subLabel}</span>}
        </div>
        {isFocused && showArrow && <span className="cursor-arrow-large">▶</span>}
      </button>
    );
  }

  return (
    <button
      className={`neo-btn-led ${isFocused ? "neo-btn-led-focused" : ""} ${className}`}
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`btn-indicator-light ${indicatorClass}`} style={isFocused ? undefined : { background: "#1e2430" }} />
      {leftIcon}
      <span>{mainLabel}</span>
      {isFocused && showArrow && <span className="cursor-arrow" style={{ marginLeft: "auto" }}>▶</span>}
    </button>
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
  ...props
}: MenuBackButtonProps) {
  const defaultStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "38vmin",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    zIndex: 2,
    ...style
  };

  return (
    <MenuButton
      variant="led"
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
