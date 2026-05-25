interface HudPanelProps {
  isTouchDevice: boolean;
  isPlayingScreen: boolean;
}

export function HudPanel({ isTouchDevice, isPlayingScreen }: HudPanelProps) {
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
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--signal-green)", fontWeight: "bold" }}>HP</span>
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
                transition: "width 0.15s ease",
                background: "hsl(280, 80%, 65%)",
                boxShadow: "0 0 4px rgba(168, 85, 247, 0.8)",
              }}
            />
          </div>
        </div>
        <span style={{ fontSize: "9px", color: "#718096", fontWeight: "bold", letterSpacing: "0.1em" }}>
          BOX BATTLE
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", color: "var(--signal-red)", fontWeight: "bold" }}>BOSS</span>
          <div
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
                transition: "all 0.15s ease",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cabinet-status-panel neo-pressed">
      <div className="hud-panel-block" style={{ gap: "4px" }}>
        <span className="hud-panel-title">PLAYER HP</span>
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
                transition: "width 0.15s ease",
                background: "hsl(280, 80%, 65%)",
                boxShadow: "0 0 4px rgba(168, 85, 247, 0.8)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="hud-panel-block" style={{ alignItems: "center", justifyContent: "center" }}>
        {isPlayingScreen ? (
          <div
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
          </div>
        ) : null}
      </div>

      <div className="hud-panel-block" style={{ alignItems: "flex-end" }}>
        <span className="hud-panel-title hud-panel-title-red">BOSS HP</span>
        <div
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
              transition: "all 0.15s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
