import fs from 'fs';

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add gameResult to the key listener dependency array
content = content.replace(
  '  }, [currentScreen, menuIndex, audio, isCopyMode, isEraseMode, copySourceIndex, slots, rebindTarget]);',
  '  }, [currentScreen, menuIndex, audio, isCopyMode, isEraseMode, copySourceIndex, slots, rebindTarget, gameResult]);'
);

// 2. Overhaul the JSX rendering blocks to always keep layout frames static
const oldRenderBlock = `  return (
    <div className="app-wrapper">
      <div className="cabinet-outer">
        
        {/* Repositioned Status Panel (situated completely above gameplay arena) */}
        {currentScreen === "PLAYING" && (
          <div className="cabinet-status-panel neo-pressed">
            <div className="hud-panel-block">
              <span className="hud-panel-title">PLAYER HP</span>
              <div className="flex-row" style={{ gap: "6px" }}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={\`led-dot \${i < playerHP ? "led-green" : ""}\`}
                    style={{ background: i < playerHP ? "" : "#07080b", border: "1px solid rgba(0,0,0,0.5)" }}
                  />
                ))}
              </div>
            </div>

            <div className="hud-panel-block" style={{ alignItems: "flex-end" }}>
              <span className="hud-panel-title hud-panel-title-red">BOSS HP</span>
              <div className="neo-pressed" style={{ width: "160px", height: "10px", borderRadius: "4px", padding: "1px", boxSizing: "border-box", overflow: "hidden" }}>
                <div
                  className="led-red"
                  style={{ height: "100%", borderRadius: "2px", width: \`\${(bossHP / 30) * 100}%\`, transition: "all 0.15s ease" }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="game-viewport-container">
          {currentScreen === "PLAYING" ? (
            <div className="w-full h-full" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ flexGrow: 1, position: "relative" }}>
                <canvas
                  ref={canvasRef}
                  width={1000}
                  height={1000}
                  className="crt-scanlines crt-flicker"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", background: "#0c0d11", display: "block", margin: "auto" }}
                />

                {gameResult !== "PLAYING" && (
                  <div className="gameover-overlay crt-scanlines crt-flicker">
                    {gameResult === "GAMEOVER" ? (
                      <div className="flex-col-center" style={{ gap: "16px" }}>
                        <h1 style={{ fontSize: "2.5rem", color: "#ef4444", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", textShadow: "0 0 15px rgba(239, 68, 68, 0.75)" }}>
                          GAME OVER
                        </h1>
                        <p style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                          The cabinet connection has been terminated.
                        </p>
                      </div>
                    ) : (
                      <div className="flex-col-center" style={{ gap: "16px" }}>
                        <h1 style={{ fontSize: "2.5rem", color: "#22c55e", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", textShadow: "0 0 15px rgba(34, 197, 94, 0.75)" }}>
                          VICTORY
                        </h1>
                        <p style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                          The simulation has been completed.
                        </p>
                      </div>
                    )}

                    <div className="flex-row" style={{ gap: "16px", marginTop: "32px" }}>
                      <button
                        onClick={() => navTo("PLAYING")}
                        onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
                        className={\`neo-btn \${menuIndex === 0 ? "neo-btn-focused" : ""}\`}
                      >
                        {menuIndex === 0 && <span className="cursor-arrow">▶</span>}
                        RETRY
                        {menuIndex === 0 && <span className="cursor-arrow">◀</span>}
                      </button>
                      <button
                        onClick={() => navTo("TITLE")}
                        onMouseEnter={() => { playHoverTick(); setMenuIndex(1); }}
                        className={\`neo-btn \${menuIndex === 1 ? "neo-btn-focused" : ""}\`}
                      >
                        {menuIndex === 1 && <span className="cursor-arrow">▶</span>}
                        MENU
                        {menuIndex === 1 && <span className="cursor-arrow">◀</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="screen-inner">
              
              {/* Title Screen */}
              {currentScreen === "TITLE" && (
                <div className="flex-col-center h-full w-full" style={{ justifyContent: "space-between" }}>
                  <div className="title-banner">
                    <h1>BOX BATTLE</h1>
                    <p>CABINET SYSTEM INTERFACE</p>
                  </div>

                  <div className="btn-container">
                    <button
                      onClick={() => {
                        reloadSaveSlots();
                        setCurrentScreen("SAVE_SELECT");
                        setMenuIndex(0);
                      }}
                      onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
                      className={\`neo-btn \${menuIndex === 0 ? "neo-btn-focused" : ""}\`}
                    >
                      {menuIndex === 0 && <span className="cursor-arrow">▶</span>}
                      START GAME
                      {menuIndex === 0 && <span className="cursor-arrow">◀</span>}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentScreen("OPTIONS");
                        setMenuIndex(0);
                      }}
                      onMouseEnter={() => { playHoverTick(); setMenuIndex(1); }}
                      className={\`neo-btn \${menuIndex === 1 ? "neo-btn-focused" : ""}\`}
                    >
                      {menuIndex === 1 && <span className="cursor-arrow">▶</span>}
                      SETTINGS
                      {menuIndex === 1 && <span className="cursor-arrow">◀</span>}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentScreen("CREDITS");
                        setMenuIndex(0);
                      }}
                      onMouseEnter={() => { playHoverTick(); setMenuIndex(2); }}
                      className={\`neo-btn \${menuIndex === 2 ? "neo-btn-focused" : ""}\`}
                    >
                      {menuIndex === 2 && <span className="cursor-arrow">▶</span>}
                      CREDITS
                      {menuIndex === 2 && <span className="cursor-arrow">◀</span>}
                    </button>
                  </div>

                  <div style={{ fontSize: "9px", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
                    Standard Keyboard Navigation Active // arrows + enter
                  </div>
                </div>
              )}

              {/* Save Selection Screen */}
              {currentScreen === "SAVE_SELECT" && (
                <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div className="title-banner" style={{ marginTop: "12px" }}>
                    <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>
                      {isCopyMode
                        ? copySourceIndex === -1
                          ? "COPY SOURCE SLOT"
                          : "COPY TARGET SLOT"
                        : isEraseMode
                        ? "ERASE ACTIVE SLOT"
                        : "SAVE SLOTS"}
                    </h2>
                    <p style={{ color: "#718096", margin: "4px 0 0" }}>Select profile configuration</p>
                  </div>

                  <div className="slot-list">
                    {slots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => handleSlotSelect(i)}
                        onMouseEnter={() => { playHoverTick(); setMenuIndex(i); }}
                        className={\`slot-card \${menuIndex === i ? "slot-card-focused" : slot.empty ? "slot-card-empty" : "slot-card-loaded"}\`}
                      >
                        <div className="flex-col">
                          <span style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            {menuIndex === i && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
                            Slot {i + 1}
                          </span>
                          <span style={{ fontSize: "9px", textTransform: "uppercase", color: menuIndex === i ? "#22c55e" : "#a0aec0", marginTop: "4px", paddingLeft: menuIndex === i ? "16px" : "0" }}>
                            {slot.empty ? "EMPTY" : \`WINS: \${slot.wins} / LOSSES: \${slot.losses}\`}
                          </span>
                        </div>
                        <div className="flex-row" style={{ alignItems: "center", gap: "12px" }}>
                          <div className={\`led-dot \${
                            slot.empty 
                              ? i === copySourceIndex ? "led-yellow" : "" 
                              : isEraseMode ? "led-red" : "led-green"
                          }\`} style={{ background: slot.empty && i !== copySourceIndex ? "#07080b" : "" }} />
                          <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#718096" }}>
                            {slot.empty ? "EMPTY" : "USED"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex-col" style={{ gap: "12px", width: "100%", maxWidth: "340px", marginTop: "16px" }}>
                    <div className="flex-row" style={{ gap: "16px", justifyContent: "center" }}>
                      <button
                        onClick={() => {
                          soundSynth.playSelectTick();
                          setIsCopyMode(!isCopyMode);
                          setCopySourceIndex(-1);
                          setIsEraseMode(false);
                          setMenuIndex(3);
                        }}
                        onMouseEnter={() => { playHoverTick(); setMenuIndex(3); }}
                        className={\`neo-btn \${menuIndex === 3 ? "neo-btn-focused" : isCopyMode ? "neo-btn-active" : ""}\`}
                        style={{ flex: 1, padding: "10px" }}
                      >
                        {menuIndex === 3 && <span className="cursor-arrow">▶</span>}
                        Copy
                        {menuIndex === 3 && <span className="cursor-arrow">◀</span>}
                      </button>
                      <button
                        onClick={() => {
                          soundSynth.playSelectTick();
                          setIsEraseMode(!isEraseMode);
                          setIsCopyMode(false);
                          setMenuIndex(4);
                        }}
                        onMouseEnter={() => { playHoverTick(); setMenuIndex(4); }}
                        className={\`neo-btn \${menuIndex === 4 ? "neo-btn-focused" : isEraseMode ? "neo-btn-active" : ""}\`}
                        style={{ flex: 1, padding: "10px" }}
                      >
                        {menuIndex === 4 && <span className="cursor-arrow">▶</span>}
                        Erase
                        {menuIndex === 4 && <span className="cursor-arrow">◀</span>}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setIsCopyMode(false);
                        setIsEraseMode(false);
                        setCopySourceIndex(-1);
                        setCurrentScreen("TITLE");
                        setMenuIndex(0);
                      }}
                      onMouseEnter={() => { playHoverTick(); setMenuIndex(5); }}
                      className={\`neo-btn \${menuIndex === 5 ? "neo-btn-focused" : ""}\`}
                      style={{ padding: "10px" }}
                    >
                      {menuIndex === 5 && <span className="cursor-arrow">▶</span>}
                      Back
                      {menuIndex === 5 && <span className="cursor-arrow">◀</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* Options Panel */}
              {currentScreen === "OPTIONS" && (
                <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div className="title-banner" style={{ marginTop: "20px" }}>
                    <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>SETTINGS</h2>
                    <p style={{ color: "#718096", margin: "4px 0 0" }}>Mixers and controller binding profiles</p>
                  </div>

                  <div className="btn-container" style={{ margin: "auto 0" }}>
                    <button
                      onClick={() => {
                        setCurrentScreen("SOUND");
                        setMenuIndex(0);
                      }}
                      onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
                      className={\`neo-btn \${menuIndex === 0 ? "neo-btn-focused" : ""}\`}
                    >
                      {menuIndex === 0 && <span className="cursor-arrow">▶</span>}
                      AUDIO
                      {menuIndex === 0 && <span className="cursor-arrow">◀</span>}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentScreen("CONTROLS");
                        setMenuIndex(0);
                      }}
                      onMouseEnter={() => { playHoverTick(); setMenuIndex(1); }}
                      className={\`neo-btn \${menuIndex === 1 ? "neo-btn-focused" : ""}\`}
                    >
                      {menuIndex === 1 && <span className="cursor-arrow">▶</span>}
                      KEY BINDINGS
                      {menuIndex === 1 && <span className="cursor-arrow">◀</span>}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentScreen("TITLE");
                      setMenuIndex(1);
                    }}
                    onMouseEnter={() => { playHoverTick(); setMenuIndex(2); }}
                    className={\`neo-btn \${menuIndex === 2 ? "neo-btn-focused" : ""}\`}
                    style={{ width: "100%", maxWidth: "240px" }}
                  >
                    {menuIndex === 2 && <span className="cursor-arrow">▶</span>}
                    Back
                    {menuIndex === 2 && <span className="cursor-arrow">◀</span>}
                  </button>
                </div>
              )}

              {/* Sound Screen */}
              {currentScreen === "SOUND" && (
                <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div className="title-banner" style={{ marginTop: "20px" }}>
                    <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>AUDIO SETTINGS</h2>
                    <p style={{ color: "#718096", margin: "4px 0 0" }}>Console volume configurations</p>
                  </div>

                  <div className="mixer-board neo-pressed">
                    {/* Master Volume */}
                    <div className="mixer-strip">
                      <div className="mixer-header" style={{ color: menuIndex === 0 ? "#22c55e" : "#718096" }}>
                        <span>
                          {menuIndex === 0 && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
                          MASTER VOLUME
                        </span>
                        <span style={{ color: audio.masterMuted ? "#ef4444" : menuIndex === 0 ? "#22c55e" : "#4ade80" }}>
                          {audio.masterMuted ? "MUTED" : \`\${Math.round(audio.masterVolume * 100)}%\`}
                        </span>
                      </div>
                      <div className="slider-row">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={audio.masterVolume}
                          onChange={(e) => handleVolumeChange("masterVolume", parseFloat(e.target.value))}
                          disabled={audio.masterMuted}
                          className="custom-range-slider"
                          style={{ filter: menuIndex === 0 ? "drop-shadow(0 0 2px rgba(34,197,94,0.4))" : "" }}
                        />
                      </div>
                    </div>

                    {/* SFX Volume */}
                    <div className="mixer-strip">
                      <div className="mixer-header" style={{ color: menuIndex === 1 ? "#22c55e" : "#718096" }}>
                        <span>
                          {menuIndex === 1 && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
                          EFFECTS VOLUME
                        </span>
                        <span style={{ color: audio.sfxMuted ? "#ef4444" : menuIndex === 1 ? "#22c55e" : "#4ade80" }}>
                          {audio.sfxMuted ? "MUTED" : \`\${Math.round(audio.sfxVolume * 100)}%\`}
                        </span>
                      </div>
                      <div className="slider-row">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={audio.sfxVolume}
                          onChange={(e) => handleVolumeChange("sfxVolume", parseFloat(e.target.value))}
                          disabled={audio.sfxMuted}
                          className="custom-range-slider"
                          style={{ filter: menuIndex === 1 ? "drop-shadow(0 0 2px rgba(34,197,94,0.4))" : "" }}
                        />
                      </div>
                    </div>

                    {/* Music Volume */}
                    <div className="mixer-strip">
                      <div className="mixer-header" style={{ color: menuIndex === 2 ? "#22c55e" : "#718096" }}>
                        <span>
                          {menuIndex === 2 && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
                          MUSIC VOLUME
                        </span>
                        <span style={{ color: audio.musicMuted ? "#ef4444" : menuIndex === 2 ? "#22c55e" : "#4ade80" }}>
                          {audio.musicMuted ? "MUTED" : \`\${Math.round(audio.musicVolume * 100)}%\`}
                        </span>
                      </div>
                      <div className="slider-row">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={audio.musicVolume}
                          onChange={(e) => handleVolumeChange("musicVolume", parseFloat(e.target.value))}
                          disabled={audio.musicMuted}
                          className="custom-range-slider"
                          style={{ filter: menuIndex === 2 ? "drop-shadow(0 0 2px rgba(34,197,94,0.4))" : "" }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentScreen("OPTIONS");
                      setMenuIndex(0);
                    }}
                    onMouseEnter={() => { playHoverTick(); setMenuIndex(3); }}
                    className={\`neo-btn \${menuIndex === 3 ? "neo-btn-focused" : ""}\`}
                    style={{ width: "100%", maxWidth: "240px" }}
                  >
                    {menuIndex === 3 && <span className="cursor-arrow">▶</span>}
                    Back
                    {menuIndex === 3 && <span className="cursor-arrow">◀</span>}
                  </button>
                </div>
              )}

              {/* Controls Rebinding */}
              {currentScreen === "CONTROLS" && (
                <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div className="title-banner" style={{ marginTop: "12px" }}>
                    <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>KEY BINDINGS</h2>
                    <p style={{ color: "#718096", margin: "4px 0 0" }}>Keyboard mapping configuration</p>
                  </div>

                  <div className="flex-row" style={{ gap: "16px", margin: "4px 0" }}>
                    <button
                      onClick={() => {
                        settingsManager.setPreset("DEFAULT_1");
                        soundSynth.playHitConfirm();
                        reloadSaveSlots();
                      }}
                      className="neo-btn"
                      style={{ 
                        padding: "8px 16px",
                        borderColor: settingsManager.getCurrentPreset() === "DEFAULT_1" ? "#22c55e" : "", 
                        color: settingsManager.getCurrentPreset() === "DEFAULT_1" ? "#22c55e" : "" 
                      }}
                    >
                      PRESET 1
                    </button>
                    <button
                      onClick={() => {
                        settingsManager.setPreset("DEFAULT_2");
                        soundSynth.playHitConfirm();
                        reloadSaveSlots();
                      }}
                      className="neo-btn"
                      style={{ 
                        padding: "8px 16px",
                        borderColor: settingsManager.getCurrentPreset() === "DEFAULT_2" ? "#22c55e" : "", 
                        color: settingsManager.getCurrentPreset() === "DEFAULT_2" ? "#22c55e" : "" 
                      }}
                    >
                      PRESET 2
                    </button>
                    <button
                      onClick={() => {
                        settingsManager.setPreset("CUSTOM");
                        soundSynth.playHitConfirm();
                        reloadSaveSlots();
                      }}
                      className="neo-btn"
                      style={{ 
                        padding: "8px 16px",
                        borderColor: settingsManager.getCurrentPreset() === "CUSTOM" ? "#22c55e" : "", 
                        color: settingsManager.getCurrentPreset() === "CUSTOM" ? "#22c55e" : "" 
                      }}
                    >
                      CUSTOM
                    </button>
                  </div>

                  <div className="binding-board neo-pressed">
                    {(Object.keys(settingsManager.getKeyMap()) as Action[]).map((action, idx) => {
                      const keys = settingsManager.getKeyMap()[action] || [];
                      const isFocusedRow = menuIndex === idx;
                      return (
                        <div key={action} className="binding-row">
                          <span className="binding-action-label" style={{ color: isFocusedRow ? "#22c55e" : "" }}>
                            {isFocusedRow && <span className="cursor-arrow" style={{ marginRight: "6px" }}>▶</span>}
                            {action.replace("_", " ")}
                          </span>
                          <div className="flex-row" style={{ gap: "8px" }}>
                            <button
                              onClick={() => {
                                soundSynth.playHitConfirm();
                                setRebindTarget({ action, index: 0 });
                              }}
                              className={\`binding-btn neo-btn \${isFocusedRow ? "neo-btn-focused" : ""}\`}
                              style={{ 
                                borderColor: rebindTarget?.action === action && rebindTarget?.index === 0 ? "#eab308" : "",
                                color: rebindTarget?.action === action && rebindTarget?.index === 0 ? "#eab308" : ""
                              }}
                            >
                              {rebindTarget?.action === action && rebindTarget?.index === 0
                                ? "PRESS KEY..."
                                : keys[0] || "[ EMPTY ]"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentScreen("OPTIONS");
                      setMenuIndex(1);
                    }}
                    onMouseEnter={() => { playHoverTick(); setMenuIndex(7); }}
                    className={\`neo-btn \${menuIndex === 7 ? "neo-btn-focused" : ""}\`}
                    style={{ width: "100%", maxWidth: "240px" }}
                  >
                    {menuIndex === 7 && <span className="cursor-arrow">▶</span>}
                    Back
                    {menuIndex === 7 && <span className="cursor-arrow">◀</span>}
                  </button>
                </div>
              )}

              {/* Credits Panel */}
              {currentScreen === "CREDITS" && (
                <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div className="title-banner" style={{ marginTop: "20px" }}>
                    <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>CREDITS</h2>
                    <p style={{ color: "#718096", margin: "4px 0 0" }}>System architecture and engineering</p>
                  </div>

                  <div className="credits-block neo-pressed flex-col" style={{ gap: "16px", textAlign: "center" }}>
                    <p style={{ fontSize: "11px", fontWeight: "bold", color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0, textShadow: "0 0 8px rgba(34, 197, 94, 0.45)" }}>Created by Steven Casteel</p>
                    <p style={{ fontSize: "10px", color: "#4a5568", margin: 0 }}>WWW.STEVENCASTEEL.COM</p>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", fontSize: "10px", color: "#a0aec0", lineHeight: "1.5" }}>
                      <p style={{ margin: 0 }}>• Built with TypeScript & Vite using standard Web Canvas interfaces.</p>
                      <p style={{ margin: 0 }}>• Audio procedurally synthesized inside <span style={{ color: "#ffffff" }}>SoundSynth.ts</span> using zero-asset Web Audio API waveforms.</p>
                      <p style={{ margin: 0 }}>• Save profiles managed under local persistent database registers.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentScreen("TITLE");
                      setMenuIndex(2);
                    }}
                    onMouseEnter={() => { playHoverTick(); setMenuIndex(0); }}
                    className="neo-btn neo-btn-focused"
                    style={{ width: "100%", maxWidth: "240px" }}
                  >
                    <span className="cursor-arrow">▶</span>
                    Back
                    <span className="cursor-arrow">◀</span>
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Dialogue Console (Sits completely outside/below playing arena) */}
        {currentScreen === "PLAYING" && (
          <div className="dialogue-console">
            {/* Player Dialogue Box (Left) */}
            <div className={\`dialogue-box-left neo-pressed \${playerDialogue.active ? "dialogue-active-green" : "dialogue-inactive"}\`}>
              <div className={\`portrait-square led-green \${playerDialogue.isTyping ? "portrait-rumble" : ""}\`} style={{ background: playerDialogue.active ? "" : "#07080b" }} />
              <div className="dialogue-text-container">
                <div className="dialogue-speaker-label">PLAYER</div>
                <div className="dialogue-body-text">{playerDialogue.active ? playerDialogue.displayed : "[ NO SIGNAL ]"}</div>
              </div>
            </div>

            {/* Boss Dialogue Box (Right) */}
            <div className={\`dialogue-box-right neo-pressed \${bossDialogue.active ? "dialogue-active-red" : "dialogue-inactive"}\`}>
              <div className="dialogue-text-container" style={{ textAlign: "right" }}>
                <div className="dialogue-speaker-label" style={{ color: "var(--signal-red)" }}>BOSS</div>
                <div className="dialogue-body-text">{bossDialogue.active ? bossDialogue.displayed : "[ NO SIGNAL ]"}</div>
              </div>
              <div className={\`portrait-square led-red \${bossDialogue.isTyping ? "portrait-rumble" : ""}\`} style={{ background: bossDialogue.active ? "" : "#07080b" }} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}`;

content = content.replace(oldRenderBlock, finalDialogueConsoleInsert);

fs.writeFileSync(filePath, content);
console.log('Unified static layout frames successfully created.');
