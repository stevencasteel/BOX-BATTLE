import fs from 'fs';

const file = 'src/components/menus/SaveSelectScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const p1 = `                  <div className="flex-row" style={{ alignItems: "center", gap: "8px" }}>
                    {slot.empty ? (
                      <FolderPlus size={18} style={{ color: "#4a5568", flexShrink: 0 }} />
                    ) : (
                      <Save size={18} style={{ color: "var(--signal-green)", flexShrink: 0 }} />
                    )}
                    <div className="flex-col" style={{ textAlign: "left" }}>
                      <span
                        style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "0.12em", textTransform: "uppercase" }}
                      >
                        Slot {i + 1}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          textTransform: "uppercase",
                          color: menuIndex === i ? "#22c55e" : "#a0aec0",
                          marginTop: "6px",
                        }}
                      >
                        {slot.empty ? "NO SAVE DATA" : \`WINS: \${slot.wins} / LOSSES: \${slot.losses}\`}
                      </span>
                    </div>
                  </div>`;

const r1 = `                  <div className="flex-row" style={{ alignItems: "center", gap: "8px" }}>
                    <div className="flex-col" style={{ textAlign: "left" }}>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {slot.empty ? (
                          <FolderPlus size={18} style={{ color: "#4a5568", flexShrink: 0 }} />
                        ) : (
                          <Save size={18} style={{ color: "var(--signal-green)", flexShrink: 0 }} />
                        )}
                        Slot {i + 1}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          textTransform: "uppercase",
                          color: menuIndex === i ? "#22c55e" : "#a0aec0",
                          marginTop: "6px",
                          paddingLeft: "26px",
                        }}
                      >
                        {slot.empty ? "NO SAVE DATA" : \`WINS: \${slot.wins} / LOSSES: \${slot.losses}\`}
                      </span>
                    </div>
                  </div>`;

const p2 = `              <MenuButton
                variant="led"
                isFocused={menuIndex === 3}
                onFocused={() => setMenuIndex(3)}
                playHoverTick={playHoverTick}
                onClick={toggleCopyMode}
                leftIcon={<Copy size={16} style={{ flexShrink: 0 }} />}
                mainLabel="COPY SLOT"
                showArrow={false}
                className={isCopyMode ? "neo-btn-led-active" : ""}
                indicatorColor={isCopyMode ? "yellow" : "green"}
                style={{ flex: 1, padding: "18px" }}
              />`;

const r2 = `              <MenuButton
                variant="led"
                isFocused={menuIndex === 3}
                onFocused={() => setMenuIndex(3)}
                playHoverTick={playHoverTick}
                onClick={toggleCopyMode}
                leftIcon={<Copy size={16} style={{ flexShrink: 0 }} />}
                mainLabel="COPY SLOT"
                showArrow={false}
                className={isCopyMode ? "neo-btn-led-active" : ""}
                indicatorColor={isCopyMode ? "yellow" : "green"}
                style={{ flex: 1, padding: "18px", justifyContent: "center" }}
              />`;

const p3 = `              <MenuButton
                variant="led"
                isFocused={menuIndex === 4}
                onFocused={() => setMenuIndex(4)}
                playHoverTick={playHoverTick}
                onClick={toggleEraseMode}
                leftIcon={<Trash2 size={16} style={{ flexShrink: 0 }} />}
                mainLabel="DELETE SLOT"
                showArrow={false}
                className={isEraseMode ? "neo-btn-led-active" : ""}
                indicatorColor={isEraseMode ? "yellow" : "green"}
                style={{ flex: 1, padding: "18px" }}
              />`;

const r3 = `              <MenuButton
                variant="led"
                isFocused={menuIndex === 4}
                onFocused={() => setMenuIndex(4)}
                playHoverTick={playHoverTick}
                onClick={toggleEraseMode}
                leftIcon={<Trash2 size={16} style={{ flexShrink: 0 }} />}
                mainLabel="DELETE SLOT"
                showArrow={false}
                className={isEraseMode ? "neo-btn-led-active" : ""}
                indicatorColor={isEraseMode ? "yellow" : "green"}
                style={{ flex: 1, padding: "18px", justifyContent: "center" }}
              />`;

if (content.includes(p2)) {
  content = content.replace(p1, r1).replace(p2, r2).replace(p3, r3);
  fs.writeFileSync(file, content, 'utf8');
  console.log("SaveSelectScreen.tsx patched successfully.");
} else {
  console.error("Target pattern block was not found.");
  process.exit(1);
}
