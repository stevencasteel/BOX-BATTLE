import{a as e}from"./rolldown-runtime-BYbx6iT9.js";import{n as t,r as n,t as r}from"./vendor-highlighter-42TrrCe7.js";import{t as i}from"./vendor-react-Ckf8byYu.js";import{n as a,t as o}from"./index-CY85CD0w.js";var s=e(n(),1),c={"index.html":`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>box-battle</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"><\/script>
  </body>
</html>
`,"package.json":`{
  "name": "box-battle",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "predev": "node scripts/generate_manifest.js && node scripts/create_source_context.js",
    "dev": "vite",
    "prebuild": "node scripts/generate_manifest.js && node scripts/create_source_context.js",
    "build": "eslint . && tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "format": "prettier --write \\"src/**/*.{ts,tsx,css}\\" \\"*.{js,ts,html,json,md}\\""
  },
  "dependencies": {
    "framer-motion": "^12.39.0",
    "lucide-react": "^1.16.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-syntax-highlighter": "^15.6.1",
    "tone": "^15.1.22",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@types/react-syntax-highlighter": "^15.5.13",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.59.2",
    "vite": "^8.0.12",
    "prettier": "^3.2.5"
  }
}
`,"tsconfig.json":`{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
`,"tsconfig.app.json":`{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "noUncheckedSideEffectImports": false,

    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
`,"tsconfig.node.json":`{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "module": "esnext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
`,"vite.config.ts":`import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 6502,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react/")) {
              return "vendor-react";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("zustand")) {
              return "vendor-zustand";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("tone")) {
              return "vendor-tone";
            }
            if (id.includes("react-syntax-highlighter") || id.includes("prismjs")) {
              return "vendor-highlighter";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
});
`,"eslint.config.js":`import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-refresh/only-export-components": "off",
    },
  },
]);
`,"README.md":`# BOX BATTLE

Mega Man / Hollow Knight battle arena prototype.

Ported over from a Gemini 2.5 Pro in Godot to React + TypeScript + Vite + Zustand

Play the live build here:
👉 **[Live Demo](https://stevencasteel.github.io/BOX-BATTLE/)**

---

## Player Controls

### Default Preset (Preset 1)

- **Move Left / Right**: \`A\` / \`D\` or \`Left Arrow\` / \`Right Arrow\`
- **Look / Move Up**: \`W\` or \`Up Arrow\`
- **Crouch / Move Down**: \`S\` or \`Down Arrow\`
- **Jump**: \`Space\` or \`X\`
- **Melee Attack**: \`C\`
- **Dash**: \`Z\`
- **Determination Heal**: Hold \`Move Down\` + Press \`Jump\` (Requires 1 active Heal Charge)

### Alternate Preset (Preset 2)

- **Move Left / Right**: \`A\` / \`D\`
- **Look / Move Up**: \`W\`
- **Crouch / Move Down**: \`S\`
- **Jump**: \`.\` (Period)
- **Melee Attack**: \`,\` (Comma)
- **Dash**: \`/\` (Slash)
- **Determination Heal**: Hold \`Move Down\` + Press \`Jump\` (Requires 1 active Heal Charge)

_Key bindings are fully customizable inside the Options menu._

---

## Technical Architecture

- **Presentation & UI**: React 19, TypeScript 6, Vite 8, Zustand 5
- **Physics Simulation**: Custom 60Hz Semi-Implicit Euler accumulator loop with swept collision checks and corner-nudging
- **Sound Design**: Pure procedural waveform synthesis utilizing native Web Audio API oscillators, filters, and envelope gains (zero external binary audio assets)

---

## Creator

Built by **[Steven Casteel](https://www.stevencasteel.com)** and Gemini Flash 3.5.
`,"src/App.css":`.cabinet-outer {
  position: relative;
  width: min(95vw, 81.2vh);
  height: min(111vw, 95vh);
  border-radius: 20px;
  background: #0f1218;
  padding: 2.5vmin;
  box-shadow:
    -8px -8px 24px rgba(255, 255, 255, 0.02),
    8px 8px 36px rgba(0, 0, 0, 0.95),
    inset 0 0 30px rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.01);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
}

.cabinet-wide-source {
  width: 95vw !important;
  height: 95vh !important;
  max-width: 1500px !important;
  max-height: 95vh !important;
  border-radius: 20px !important;
  padding: 24px !important;
}

.cabinet-wide-source .cabinet-status-panel,
.cabinet-wide-source .dialogue-console {
  display: none !important;
}

.cabinet-wide-source .game-viewport-container {
  aspect-ratio: auto !important;
  flex-grow: 1 !important;
  flex-shrink: 1 !important;
  height: 100% !important;
}

.screen-inner {
  width: 100%;
  height: 100%;
  background: var(--void-bg);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2.5vmin;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.crt-scanlines {
  position: relative;
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.crt-scanlines::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%);
  z-index: 99;
  background-size: 100% 4px;
  pointer-events: none;
}

.crt-flicker {
  animation: crt-flicker-animation 0.15s infinite alternate;
}

@keyframes crt-flicker-animation {
  0% {
    opacity: 0.985;
  }
  100% {
    opacity: 1;
  }
}

.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 65%, rgba(239, 68, 68, 0.28) 100%);
  pointer-events: none;
  z-index: 80;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.vignette-pulse {
  opacity: 1;
  animation: vignette-heartbeat 1.2s infinite alternate;
}

@keyframes vignette-heartbeat {
  0% {
    opacity: 0.15;
  }
  100% {
    opacity: 0.55;
  }
}

.filter-chromatic {
  filter: url(#chromatic-aberration);
}

.shockwave-blast {
  position: absolute;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    inset 0 0 30px rgba(255, 255, 255, 0.3),
    0 0 40px rgba(255, 255, 255, 0.15);
  pointer-events: none;
  z-index: 90;
  transform: translate(-50%, -50%);
  animation: blast-wave-expand 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
}

@keyframes blast-wave-expand {
  0% {
    width: 0px;
    height: 0px;
    opacity: 1;
    filter: blur(1px);
  }
  50% {
    filter: blur(6px);
  }
  100% {
    width: 1200px;
    height: 1200px;
    opacity: 0;
    filter: blur(12px);
  }
}

.title-banner {
  padding-top: 2vmin;
  margin-top: 0;
  text-align: center;
}

.title-banner h2 {
  font-size: 2.5vmin;
  margin: 0;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #fff;
}

.title-banner p {
  font-size: 1.3vmin;
  color: var(--signal-green);
  margin: 1vmin 0 0;
  letter-spacing: 0.35em;
  font-weight: bold;
  text-shadow: 0 0 8px var(--signal-green-glow);
  animation: crt-pulse 2s infinite alternate;
}

@keyframes crt-pulse {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) and (pointer: coarse) {
  .cabinet-outer,
  .cabinet-wide-source {
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    max-height: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }

  .screen-inner {
    border-radius: 0;
    padding: 12px 10px;
  }

  .title-banner {
    padding-top: 10px;
  }
  .title-banner h2 {
    font-size: 20px;
  }
  .title-banner p {
    font-size: 11px;
  }
}

@media (max-height: 600px) {
  .title-banner {
    padding-top: 4px;
  }
  .title-banner h2 {
    font-size: 1.3rem !important;
  }
  .title-banner p {
    margin: 2px 0 0;
    font-size: 10px;
  }
}
`,"src/App.tsx":`import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";
import { useSaveSlots } from "@/hooks/useSaveSlots";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useBootSequence, BootStage } from "@/hooks/useBootSequence";
import { useGameplayStore, useSessionStore } from "@/store/useGameStore";
import { useGameDialogue } from "@/hooks/useGameDialogue";
import { screenConfigs, MenuContext } from "@/core/screenRoutes";

import { TitleScreen } from "@/components/menus/TitleScreen";
import { SaveSelectScreen } from "@/components/menus/SaveSelectScreen";
import { SettingsScreen } from "@/components/menus/SettingsScreen";
import { AudioScreen } from "@/components/menus/AudioScreen";
import { ControlsScreen } from "@/components/menus/ControlsScreen";
import { CreditsScreen } from "@/components/menus/CreditsScreen";
const SourceViewScreen = lazy(() =>
  import("@/components/menus/SourceViewScreen").then((m) => ({ default: m.SourceViewScreen }))
);
import { GameArena } from "@/components/GameArena";
import { HudPanel } from "@/components/HudPanel";
import { DialogueConsole } from "@/components/DialogueConsole";
import { TouchOverlay } from "@/components/TouchOverlay";
import { ChromaticAberrationFilter } from "@/components/ChromaticAberrationFilter";
import { useHudSubscription } from "@/hooks/useHudSubscription";
import { useMusicLifecycle } from "@/hooks/useMusicLifecycle";
import { useFirstGesture } from "@/hooks/useFirstGesture";
import { useEngineSubscriptions } from "@/hooks/useEngineSubscriptions";
import { useRebindCapture } from "@/hooks/useRebindCapture";

import "./App.css";
import "./styles/neomorphism.css";
import "./components/GameArena.css";

export default function App() {
  const bootStage = useBootSequence();
  const viewportRef = useRef<HTMLDivElement>(null);

  useHudSubscription();

  const currentScreen = useSessionStore((state) => state.currentScreen);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const gameResult = useSessionStore((state) => state.gameResult);

  const navTo = useSessionStore((state) => state.navTo);
  const setMenuIndex = useSessionStore((state) => state.setMenuIndex);
  const resetGameSession = useGameplayStore((state) => state.resetGameSession);

  const {
    slots,
    copySourceIndex,
    isCopyMode,
    isEraseMode,
    reloadSaveSlots,
    handleSlotAction,
    toggleCopyMode,
    toggleEraseMode,
    resetActions,
  } = useSaveSlots();

  const { audio, handleVolumeChange, resetSettings } = useAudioSettings();
  const { playerDialogue, bossDialogue, triggerDialogue, resetDialogues } = useGameDialogue();

  const [rebindTarget, setRebindTarget] = useState<{ action: Action; index: number } | null>(null);

  const [isTouchDevice] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(pointer: coarse)").matches;
    }
    return false;
  });

  const isFullHeightScreen = currentScreen === "SOURCE_VIEW";
  const isPlayingScreen = currentScreen === "PLAYING";

  useMusicLifecycle(isPlayingScreen);
  useFirstGesture(reloadSaveSlots);
  useEngineSubscriptions(viewportRef, triggerDialogue, resetDialogues);
  useRebindCapture(rebindTarget, setRebindTarget, reloadSaveSlots);

  const playHoverTick = () => {
    soundSynth.playSelectTick();
  };

  useEffect(() => {
    if (!isPlayingScreen) {
      resetDialogues();
    }
  }, [isPlayingScreen, resetDialogues]);

  useEffect(() => {
    if ((isPlayingScreen && gameResult === "PLAYING") || currentScreen === "SOURCE_VIEW" || rebindTarget !== null)
      return;

    const handleMenuNavigation = (e: KeyboardEvent) => {
      const config = screenConfigs[currentScreen];
      if (!config) return;

      const context: MenuContext = {
        navTo,
        menuIndex,
        setMenuIndex,
        reloadSaveSlots,
        resetGameSession,
        handleSlotAction,
        toggleCopyMode,
        toggleEraseMode,
        resetActions,
        audio,
        handleVolumeChange,
        resetSettings,
        setRebindTarget,
        gameResult,
      };

      const maxIndex = config.getMaxIndex(context);
      const isHorizontalEndScreen = isPlayingScreen && gameResult !== "PLAYING";

      const keyMap = settingsManager.getKeyMap();
      const jumpKeys = keyMap["JUMP"] || [];
      const attackKeys = keyMap["ATTACK"] || [];
      const dashKeys = keyMap["DASH"] || [];

      const isConfirmKey =
        e.key === "Enter" ||
        e.key === " " ||
        e.code === "Space" ||
        jumpKeys.includes(e.code) ||
        jumpKeys.includes(e.key);

      const isBackKey =
        e.key === "Escape" ||
        e.key === "Backspace" ||
        attackKeys.includes(e.code) ||
        attackKeys.includes(e.key) ||
        dashKeys.includes(e.code) ||
        dashKeys.includes(e.key);

      const isSoundSliderZone = currentScreen === "SOUND" && menuIndex < 3;

      const isMoveForward =
        e.key === "ArrowDown" ||
        e.key === "KeyS" ||
        (isHorizontalEndScreen && (e.key === "ArrowRight" || e.key === "KeyD")) ||
        (!isSoundSliderZone && !isHorizontalEndScreen && (e.key === "ArrowRight" || e.key === "KeyD"));

      const isMoveBackward =
        e.key === "ArrowUp" ||
        e.key === "KeyW" ||
        (isHorizontalEndScreen && (e.key === "ArrowLeft" || e.key === "KeyA")) ||
        (!isSoundSliderZone && !isHorizontalEndScreen && (e.key === "ArrowLeft" || e.key === "KeyA"));

      if (isMoveForward) {
        e.preventDefault();
        soundSynth.playSelectTick();
        setMenuIndex((menuIndex + 1) % (maxIndex + 1));
      } else if (isMoveBackward) {
        e.preventDefault();
        soundSynth.playSelectTick();
        setMenuIndex((menuIndex - 1 + (maxIndex + 1)) % (maxIndex + 1));
      } else if (isConfirmKey) {
        e.preventDefault();
        config.onSelect(context);
      } else if (isBackKey) {
        e.preventDefault();
        if (config.onBack) {
          config.onBack(context);
        }
      }

      if (
        isSoundSliderZone &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "KeyA" || e.key === "KeyD")
      ) {
        if (config.onHorizontal) {
          e.preventDefault();
          const direction = e.key === "ArrowRight" || e.key === "KeyD" ? 1 : -1;
          config.onHorizontal(direction, context);
        }
      }
    };

    window.addEventListener("keydown", handleMenuNavigation);
    return () => {
      window.removeEventListener("keydown", handleMenuNavigation);
    };
  }, [
    currentScreen,
    menuIndex,
    audio,
    isCopyMode,
    isEraseMode,
    copySourceIndex,
    slots,
    rebindTarget,
    gameResult,
    isPlayingScreen,
  ]);

  if (bootStage === BootStage.NONE) {
    return (
      <div className="app-wrapper">
        <div className="cabinet-outer" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ color: "#718096", fontSize: "11px", letterSpacing: "0.2em" }}>BOOTING SYSTEM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <div
        className={\`cabinet-outer \${isFullHeightScreen ? "cabinet-wide-source" : ""}\`}
        style={
          isTouchDevice
            ? {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "10px",
                height: "100vh",
              }
            : undefined
        }
      >
        {!isFullHeightScreen && <HudPanel isTouchDevice={isTouchDevice} isPlayingScreen={isPlayingScreen} />}

        <div
          className={\`game-viewport-container \${isPlayingScreen ? "viewport-playing" : "viewport-menu"}\`}
          ref={viewportRef}
          style={
            isTouchDevice
              ? isPlayingScreen
                ? {
                    flexGrow: 0,
                    flexShrink: 0,
                    width: "100%",
                    aspectRatio: "1/1",
                    maxHeight: "calc(100vh - 250px)",
                    height: "auto",
                  }
                : {
                    flexGrow: 1,
                    width: "100%",
                    height: "0px",
                    aspectRatio: "auto",
                  }
              : undefined
          }
        >
          {isPlayingScreen ? (
            <div className="w-full" style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
              <div style={{ flexGrow: 1, position: "relative", display: "flex", minHeight: 0 }}>
                <GameArena triggerDialogue={() => {}} playHoverTick={playHoverTick} />
              </div>
            </div>
          ) : (
            <div className="screen-inner">
              {currentScreen === "TITLE" && (
                <TitleScreen
                  menuIndex={menuIndex}
                  onPlay={() => {
                    reloadSaveSlots();
                    navTo("SAVE_SELECT");
                  }}
                  onSettings={() => {
                    navTo("OPTIONS");
                  }}
                  onCredits={() => {
                    navTo("CREDITS");
                  }}
                  onSource={() => {
                    navTo("SOURCE_VIEW");
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                />
              )}

              {currentScreen === "SAVE_SELECT" && (
                <SaveSelectScreen
                  slots={slots}
                  menuIndex={menuIndex}
                  isCopyMode={isCopyMode}
                  copySourceIndex={copySourceIndex}
                  isEraseMode={isEraseMode}
                  handleSlotSelect={(idx) => handleSlotAction(idx, () => navTo("PLAYING"))}
                  toggleCopyMode={toggleCopyMode}
                  toggleEraseMode={toggleEraseMode}
                  onBack={() => {
                    resetActions();
                    navTo("TITLE");
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                />
              )}

              {currentScreen === "OPTIONS" && (
                <SettingsScreen
                  menuIndex={menuIndex}
                  onAudio={() => {
                    navTo("SOUND");
                  }}
                  onControls={() => {
                    navTo("CONTROLS");
                  }}
                  onBack={() => {
                    navTo("TITLE");
                    setMenuIndex(1);
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                />
              )}

              {currentScreen === "SOUND" && (
                <AudioScreen
                  audio={audio}
                  menuIndex={menuIndex}
                  handleVolumeChange={handleVolumeChange}
                  resetSettings={resetSettings}
                  onBack={() => {
                    navTo("OPTIONS");
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                />
              )}

              {currentScreen === "CONTROLS" && (
                <ControlsScreen
                  menuIndex={menuIndex}
                  rebindTarget={rebindTarget}
                  onBack={() => {
                    navTo("OPTIONS");
                    setMenuIndex(1);
                  }}
                  playHoverTick={playHoverTick}
                  setMenuIndex={setMenuIndex}
                  setRebindTarget={setRebindTarget}
                  reloadSaveSlots={reloadSaveSlots}
                />
              )}

              {currentScreen === "CREDITS" && (
                <CreditsScreen
                  onBack={() => {
                    navTo("TITLE");
                    setMenuIndex(2);
                  }}
                />
              )}

              {currentScreen === "SOURCE_VIEW" && (
                <Suspense
                  fallback={
                    <div
                      className="flex-col-center h-full w-full"
                      style={{ gap: "12px", background: "var(--void-bg)", justifyContent: "center" }}
                    >
                      <div
                        className="led-dot led-green"
                        style={{ width: "16px", height: "16px", animation: "crt-pulse 1s infinite alternate" }}
                      />
                      <span
                        style={{
                          color: "#718096",
                          fontSize: "11px",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                        }}
                      >
                        COMPILING SOURCE ARCHIVE...
                      </span>
                    </div>
                  }
                >
                  <SourceViewScreen
                    onBack={() => {
                      navTo("TITLE");
                      setMenuIndex(3);
                    }}
                  />
                </Suspense>
              )}
            </div>
          )}
        </div>

        {!isFullHeightScreen && (
          <DialogueConsole
            playerDialogue={playerDialogue}
            bossDialogue={bossDialogue}
            isTouchDevice={isTouchDevice}
          />
        )}

        {isPlayingScreen && isTouchDevice && <TouchOverlay />}
      </div>

      <ChromaticAberrationFilter />
    </div>
  );
}
`,"src/components/ChromaticAberrationFilter.tsx":`export function ChromaticAberrationFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
      <defs>
        <filter id="chromatic-aberration">
          <feOffset dx="6" dy="0" in="SourceGraphic" result="red" />
          <feOffset dx="-6" dy="0" in="SourceGraphic" result="blue" />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            in="red"
            result="red-only"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            in="SourceGraphic"
            result="green-only"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            in="blue"
            result="blue-only"
          />
          <feBlend mode="screen" in="red-only" in2="green-only" result="rg" />
          <feBlend mode="screen" in="rg" in2="blue-only" />
        </filter>
      </defs>
    </svg>
  );
}
`,"src/components/DialogueConsole.tsx":`import { DialogueState } from "@/hooks/useGameDialogue";

interface DialogueConsoleProps {
  playerDialogue: DialogueState;
  bossDialogue: DialogueState;
  isTouchDevice: boolean;
}

export function DialogueConsole({ playerDialogue, bossDialogue, isTouchDevice }: DialogueConsoleProps) {
  return (
    <div
      className="dialogue-console"
      style={
        isTouchDevice
          ? {
              height: "54px",
              marginTop: "0px",
              gap: "4px",
              padding: "0",
              flexShrink: 0,
            }
          : undefined
      }
    >
      <div
        className={\`dialogue-box-left neo-pressed \${playerDialogue.active ? "dialogue-active-green" : "dialogue-inactive"}\`}
        style={
          isTouchDevice
            ? {
                padding: "4px 8px",
                gap: "8px",
                borderRadius: "6px",
                height: "100%",
              }
            : undefined
        }
      >
        <div
          className={\`portrait-square led-green \${playerDialogue.isTyping ? "portrait-rumble" : ""}\`}
          style={{
            background: playerDialogue.active ? "" : "#07080b",
            width: isTouchDevice ? "32px" : "64px",
            height: isTouchDevice ? "32px" : "64px",
          }}
        />
        <div className="dialogue-text-container">
          <div className="dialogue-speaker-label" style={isTouchDevice ? { fontSize: "10px" } : undefined}>
            PLAYER
          </div>
          <div
            className="dialogue-body-text"
            style={isTouchDevice ? { fontSize: "10px", lineHeight: "1.2" } : undefined}
          >
            {playerDialogue.active ? playerDialogue.displayed : "[ NO SIGNAL ]"}
          </div>
        </div>
      </div>

      <div
        className={\`dialogue-box-right neo-pressed \${bossDialogue.active ? "dialogue-active-red" : "dialogue-inactive"}\`}
        style={
          isTouchDevice
            ? {
                padding: "4px 8px",
                gap: "8px",
                borderRadius: "6px",
                height: "100%",
              }
            : undefined
        }
      >
        <div className="dialogue-text-container" style={{ textAlign: "right" }}>
          <div
            className="dialogue-speaker-label"
            style={
              isTouchDevice ? { fontSize: "10px", color: "var(--signal-red)" } : { color: "var(--signal-red)" }
            }
          >
            BOSS
          </div>
          <div
            className="dialogue-body-text"
            style={isTouchDevice ? { fontSize: "10px", lineHeight: "1.2" } : undefined}
          >
            {bossDialogue.active ? bossDialogue.displayed : "[ NO SIGNAL ]"}
          </div>
        </div>
        <div
          className={\`portrait-square led-red \${bossDialogue.isTyping ? "portrait-rumble" : ""}\`}
          style={{
            background: bossDialogue.active ? "" : "#07080b",
            width: isTouchDevice ? "32px" : "64px",
            height: isTouchDevice ? "32px" : "64px",
          }}
        />
      </div>
    </div>
  );
}
`,"src/components/GameArena.css":`.cabinet-status-panel {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vmin 1.5vmin;
  border-radius: 1.5vmin;
  margin-bottom: 1vmin;
  box-sizing: border-box;
  flex-shrink: 0;
}

.hud-panel-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hud-panel-title {
  font-size: clamp(10px, 1.4vmin, 15px);
  font-weight: bold;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.hud-panel-title-red {
  color: var(--signal-red);
}

.game-viewport-container {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  background: var(--void-bg);
  position: relative;
  contain: layout style paint;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.gameover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.94);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 99;
  padding: 24px;
  box-sizing: border-box;
  animation: overlay-fade-in 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  opacity: 0;
  will-change: opacity;
}

@keyframes overlay-fade-in {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(12px);
  }
}

.dialogue-console {
  width: 100%;
  height: 8.5vmin;
  min-height: 50px;
  max-height: 90px;
  display: flex;
  gap: 1.5vmin;
  margin-top: auto;
  box-sizing: border-box;
  flex-shrink: 0;
}

.dialogue-box-left,
.dialogue-box-right {
  flex: 1;
  border-radius: 1.5vmin;
  padding: 1vmin 1.8vmin;
  display: flex;
  align-items: center;
  gap: 1.2vmin;
  box-sizing: border-box;
  overflow: hidden;
  transition:
    opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1),
    border-color 0.4s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  transform: scale(0.97);
}

.dialogue-active-green {
  opacity: 1;
  border-color: rgba(34, 197, 94, 0.25);
  box-shadow:
    var(--shadow-inset-light),
    var(--shadow-inset-dark),
    0 0 12px rgba(34, 197, 94, 0.08);
  transform: scale(1);
}

.dialogue-active-red {
  opacity: 1;
  border-color: rgba(239, 68, 68, 0.25);
  box-shadow:
    var(--shadow-inset-light),
    var(--shadow-inset-dark),
    0 0 12px rgba(239, 68, 68, 0.08);
  transform: scale(1);
}

.dialogue-inactive {
  opacity: 0.12;
  transform: scale(0.97);
}

.portrait-square {
  width: 6vmin;
  height: 6vmin;
  min-width: 32px;
  min-height: 32px;
  max-width: 50px;
  max-height: 50px;
  border-radius: 1vmin;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.4);
}

.dialogue-text-container {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-grow: 1;
  overflow: hidden;
}

.dialogue-speaker-label {
  font-size: clamp(9px, 1.2vmin, 13px);
  font-weight: bold;
  letter-spacing: 0.15em;
  color: var(--signal-green);
}

.dialogue-body-text {
  font-size: clamp(10px, 1.4vmin, 14px);
  line-height: 1.35;
  color: #eaeaea;
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow: hidden;
}

.portrait-rumble {
  animation: rumble-anim 0.08s infinite alternate;
}

@keyframes rumble-anim {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  20% {
    transform: translate(-1px, -1px) rotate(-1deg);
  }
  40% {
    transform: translate(-1px, 1px) rotate(1deg);
  }
  60% {
    transform: translate(1px, -1px) rotate(0deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  100% {
    transform: translate(1px, 1px) rotate(-1deg);
  }
}

@media (max-width: 768px) and (pointer: coarse) {
  .cabinet-status-panel {
    padding: 10px 14px;
    border-radius: 10px;
    margin-bottom: 8px;
  }
  .hud-panel-title {
    font-size: 11px;
    letter-spacing: 0.1em;
  }
  .hud-panel-block:nth-child(3) .neo-pressed {
    width: 100px !important;
  }
  .dialogue-console {
    height: 90px;
    margin-top: 8px;
    gap: 8px;
  }
  .dialogue-box-left,
  .dialogue-box-right {
    padding: 10px 14px;
    gap: 10px;
    border-radius: 10px;
  }
  .portrait-square {
    width: 44px;
    height: 44px;
  }
  .dialogue-speaker-label {
    font-size: 11px;
  }
  .dialogue-body-text {
    font-size: 11px;
    line-height: 1.3;
  }
}

@media (max-height: 600px) {
  .cabinet-status-panel {
    display: none;
  }
  .dialogue-console {
    display: none;
  }
}
`,"src/components/GameArena.tsx":`import "./GameArena.css";
import { useEffect, useRef } from "react";
import { Engine } from "@/core/Engine";
import { useSessionStore, useGameplayStore } from "@/store/useGameStore";
import { eventBroker } from "@/core/eventBroker";

interface GameArenaProps {
  triggerDialogue: (speaker: "player" | "boss", text: string) => void;
  playHoverTick: () => void;
}

export function GameArena({ triggerDialogue, playHoverTick }: GameArenaProps) {
  const triggerRef = useRef(triggerDialogue);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    triggerRef.current = triggerDialogue;
  }, [triggerDialogue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, (speaker, text) => {
      triggerRef.current(speaker, text);
    });
    engineRef.current = engine;
    engine.start();

    const updateVignette = (hp: number) => {
      const overlay = canvas.parentElement?.querySelector(".vignette-overlay") as HTMLDivElement | null;
      if (overlay) {
        if (hp === 1) {
          overlay.classList.add("vignette-pulse");
        } else {
          overlay.classList.remove("vignette-pulse");
        }
      }
    };

    const unsubHurt = eventBroker.subscribe("PLAYER_HURT", ({ currentHealth }) => {
      updateVignette(currentHealth);
    });
    const unsubHealed = eventBroker.subscribe("PLAYER_HEALED", ({ currentHealth }) => {
      updateVignette(currentHealth);
    });

    const initialHP = useGameplayStore.getState().playerHP;
    updateVignette(initialHP);

    return () => {
      unsubHurt();
      unsubHealed();
      engine.cleanup();
      engineRef.current = null;
    };
  }, []);

  const gameResult = useSessionStore((state) => state.gameResult);
  const menuIndex = useSessionStore((state) => state.menuIndex);
  const navTo = useSessionStore((state) => state.navTo);
  const setMenuIndex = useSessionStore((state) => state.setMenuIndex);
  const retryCount = useSessionStore((state) => state.retryCount);
  const currentScreen = useSessionStore((state) => state.currentScreen);

  const initialRetryCountRef = useRef(retryCount);

  useEffect(() => {
    if (currentScreen === "PLAYING" && retryCount > initialRetryCountRef.current) {
      engineRef.current?.reset();
    }
  }, [retryCount, currentScreen]);

  const resetGameSession = useGameplayStore((state) => state.resetGameSession);

  return (
    <div className="w-full" style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
      <div
        style={{ flexGrow: 1, position: "relative", display: "flex", width: "100%", overflow: "hidden", minHeight: 0 }}
      >
        <div
          style={{
            position: "relative",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "100%",
            maxHeight: "100%",
            aspectRatio: "1/1",
            width: "100%",
            height: "100%",
          }}
        >
          <canvas
            ref={canvasRef}
            width={1250}
            height={1250}
            className="crt-scanlines crt-flicker"
            style={{
              background: "#0c0d11",
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />

          <div className="vignette-overlay" />

          {gameResult !== "PLAYING" && (
            <div className="gameover-overlay">
              <div
                className="gameover-box neo-elevated"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px",
                  borderRadius: "20px",
                  border:
                    gameResult === "GAMEOVER"
                      ? "2px solid rgba(239, 68, 68, 0.35)"
                      : "2px solid rgba(34, 197, 94, 0.35)",
                  boxShadow:
                    gameResult === "GAMEOVER"
                      ? "0 0 30px rgba(239, 68, 68, 0.15), inset 0 0 20px rgba(239, 68, 68, 0.1)"
                      : "0 0 30px rgba(34, 197, 94, 0.15), inset 0 0 20px rgba(34, 197, 94, 0.1)",
                  background: "rgba(12, 14, 18, 0.95)",
                  maxWidth: "440px",
                  width: "85%",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                {gameResult === "GAMEOVER" ? (
                  <div className="flex-col-center">
                    <h1
                      style={{
                        fontSize: "2.6rem",
                        margin: 0,
                        color: "var(--signal-red)",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.22em",
                        textShadow: "0 0 15px var(--signal-red-glow)",
                        lineHeight: "1.1",
                      }}
                    >
                      DEFEATED
                    </h1>
                  </div>
                ) : (
                  <div className="flex-col-center">
                    <h1
                      style={{
                        fontSize: "2.6rem",
                        margin: 0,
                        color: "var(--signal-green)",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.22em",
                        textShadow: "0 0 15px var(--signal-green-glow)",
                        lineHeight: "1.1",
                      }}
                    >
                      VICTORY
                    </h1>
                  </div>
                )}

                <div
                  style={{
                    height: "1px",
                    width: "60px",
                    background: "rgba(255,255,255,0.08)",
                    margin: "24px 0",
                  }}
                />

                <div className="flex-row" style={{ gap: "16px", width: "100%", justifyContent: "center" }}>
                  <button
                    onClick={() => {
                      resetGameSession();
                      navTo("PLAYING");
                    }}
                    onMouseEnter={() => {
                      playHoverTick();
                      setMenuIndex(0);
                    }}
                    className={\`neo-btn \${menuIndex === 0 ? "neo-btn-focused" : ""}\`}
                    style={{ flex: 1, padding: "16px 20px", fontSize: "14px", borderRadius: "10px" }}
                  >
                    <span
                      className="cursor-arrow"
                      style={{ marginRight: "6px", visibility: menuIndex === 0 ? "visible" : "hidden" }}
                    >
                      ▶
                    </span>
                    RETRY
                    <span
                      className="cursor-arrow"
                      style={{ marginLeft: "6px", visibility: menuIndex === 0 ? "visible" : "hidden" }}
                    >
                      ◀
                    </span>
                  </button>
                  <button
                    onClick={() => navTo("TITLE")}
                    onMouseEnter={() => {
                      playHoverTick();
                      setMenuIndex(1);
                    }}
                    className={\`neo-btn \${menuIndex === 1 ? "neo-btn-focused" : ""}\`}
                    style={{ flex: 1, padding: "16px 20px", fontSize: "14px", borderRadius: "10px" }}
                  >
                    <span
                      className="cursor-arrow"
                      style={{ marginRight: "6px", visibility: menuIndex === 1 ? "visible" : "hidden" }}
                    >
                      ▶
                    </span>
                    MENU
                    <span
                      className="cursor-arrow"
                      style={{ marginLeft: "6px", visibility: menuIndex === 1 ? "visible" : "hidden" }}
                    >
                      ◀
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`,"src/components/HudPanel.tsx":`interface HudPanelProps {
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
                id={\`hud-m-php-\${i}\`}
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
                id={\`hud-m-heal-\${i}\`}
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
              id={\`hud-d-php-\${i}\`}
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
                id={\`hud-d-heal-\${i}\`}
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
`,"src/components/TouchButton.tsx":`import { inputProvider, Action } from "@/core/InputProvider";

interface TouchButtonProps {
  action: Action;
  label: string;
  style?: React.CSSProperties;
}

export function TouchButton({ action, label, style }: TouchButtonProps) {
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (e.pointerType === "touch") {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    inputProvider.triggerTouchStart(action);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputProvider.triggerTouchEnd(action);
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="neo-btn"
      style={{
        ...style,
        userSelect: "none",
        touchAction: "none",
        padding: "0",
        borderRadius: "12px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.6)",
      }}
    >
      {label}
    </button>
  );
}
`,"src/components/TouchOverlay.tsx":`import { TouchButton } from "./TouchButton";

export function TouchOverlay() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        gap: "8px",
        background: "#0c0e12",
        boxSizing: "border-box",
        flexGrow: 1,
        height: "0px",
        paddingTop: "6px",
      }}
    >
      <div
        style={{
          flex: 1.3,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "6px",
          height: "100%",
        }}
      >
        <TouchButton action="MOVE_LEFT" label="◀" style={{ height: "100%", fontSize: "24px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", height: "100%" }}>
          <TouchButton action="MOVE_UP" label="▲" style={{ flex: 1, fontSize: "20px" }} />
          <TouchButton action="MOVE_DOWN" label="▼" style={{ flex: 1, fontSize: "20px" }} />
        </div>
        <TouchButton action="MOVE_RIGHT" label="▶" style={{ height: "100%", fontSize: "24px" }} />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          height: "100%",
        }}
      >
        <TouchButton
          action="DASH"
          label="DASH"
          style={{
            flex: 1,
            fontSize: "14px",
            borderColor: "var(--signal-yellow)",
            color: "var(--signal-yellow)",
          }}
        />
        <div style={{ display: "flex", gap: "6px", flex: 1.2 }}>
          <TouchButton
            action="ATTACK"
            label="ATK"
            style={{ flex: 1, fontSize: "14px", borderColor: "var(--signal-red)", color: "var(--signal-red)" }}
          />
          <TouchButton
            action="JUMP"
            label="JMP"
            style={{
              flex: 1,
              fontSize: "14px",
              borderColor: "var(--signal-green)",
              color: "var(--signal-green)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
`,"src/components/menus/AudioScreen.css":`.mixer-board {
  width: 100%;
  max-width: 60vmin;
  padding: 3.2vmin;
  border-radius: 2.8vmin;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  gap: 3.2vmin;
  box-sizing: border-box;
}

.mixer-strip {
  display: flex;
  flex-direction: column;
  gap: 1vmin;
  width: 100%;
}

.mixer-header {
  display: flex;
  justify-content: space-between;
  font-size: 1.5vmin;
  font-weight: bold;
  letter-spacing: 0.12em;
  color: #718096;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 1.6vmin;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) and (pointer: coarse) {
  .mixer-board {
    padding: 18px;
    gap: 20px;
    max-width: none;
    border-radius: 16px;
  }
  .mixer-header {
    font-size: 14px;
  }
  .slider-row {
    gap: 12px;
  }
}
`,"src/components/menus/AudioScreen.tsx":`import "./AudioScreen.css";
import { AudioSettings } from "@/core/SettingsManager";

interface AudioScreenProps {
  audio: AudioSettings;
  menuIndex: number;
  handleVolumeChange: (field: keyof AudioSettings, value: number | boolean) => void;
  resetSettings: () => void;
  onBack: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function AudioScreen({
  audio,
  menuIndex,
  handleVolumeChange,
  resetSettings,
  onBack,
  playHoverTick,
  setMenuIndex,
}: AudioScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner">
        <h2
          style={{
            fontSize: "2rem",
            margin: 0,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
          }}
        >
          SOUND SETTINGS
        </h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>
          Adjust game sounds and music volume
        </p>
      </div>

      <div className="mixer-board neo-pressed">
        <div className="mixer-strip">
          <div className="mixer-header" style={{ color: menuIndex === 0 ? "#22c55e" : "#718096" }}>
            <span>
              {menuIndex === 0 && (
                <span className="cursor-arrow" style={{ marginRight: "6px" }}>
                  ▶
                </span>
              )}
              MAIN VOLUME
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
              style={{
                filter: menuIndex === 0 ? "drop-shadow(0 0 2px rgba(34,197,94,0.4))" : "",
                background: \`linear-gradient(to right, var(--signal-green) 0%, var(--signal-green) \${audio.masterVolume * 100}%, var(--surface-bg) \${audio.masterVolume * 100}%, var(--surface-bg) 100%)\`,
              }}
            />
          </div>
        </div>

        <div className="mixer-strip">
          <div className="mixer-header" style={{ color: menuIndex === 1 ? "#22c55e" : "#718096" }}>
            <span>
              {menuIndex === 1 && (
                <span className="cursor-arrow" style={{ marginRight: "6px" }}>
                  ▶
                </span>
              )}
              SOUND EFFECTS
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
              style={{
                filter: menuIndex === 1 ? "drop-shadow(0 0 2px rgba(34,197,94,0.4))" : "",
                background: \`linear-gradient(to right, var(--signal-green) 0%, var(--signal-green) \${audio.sfxVolume * 100}%, var(--surface-bg) \${audio.sfxVolume * 100}%, var(--surface-bg) 100%)\`,
              }}
            />
          </div>
        </div>

        <div className="mixer-strip">
          <div className="mixer-header" style={{ color: menuIndex === 2 ? "#22c55e" : "#718096" }}>
            <span>
              {menuIndex === 2 && (
                <span className="cursor-arrow" style={{ marginRight: "6px" }}>
                  ▶
                </span>
              )}
              MUSIC
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
              style={{
                filter: menuIndex === 2 ? "drop-shadow(0 0 2px rgba(34,197,94,0.4))" : "",
                background: \`linear-gradient(to right, var(--signal-green) 0%, var(--signal-green) \${audio.musicVolume * 100}%, var(--surface-bg) \${audio.musicVolume * 100}%, var(--surface-bg) 100%)\`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-col" style={{ gap: "1.2vmin", width: "100%", maxWidth: "38vmin", marginTop: "1vmin" }}>
        <button
          onClick={resetSettings}
          onMouseEnter={() => {
            playHoverTick();
            setMenuIndex(3);
          }}
          className={\`neo-btn \${menuIndex === 3 ? "neo-btn-focused" : ""}\`}
          style={{
            width: "100%",
            padding: "1.4vmin 2vmin",
            fontSize: "1.4vmin",
            borderRadius: "1vmin",
            whiteSpace: "nowrap",
          }}
        >
          {menuIndex === 3 && <span className="cursor-arrow">▶</span>}
          RESET ALL TO 100%
          {menuIndex === 3 && <span className="cursor-arrow">◀</span>}
        </button>

        <button
          onClick={onBack}
          onMouseEnter={() => {
            playHoverTick();
            setMenuIndex(4);
          }}
          className={\`neo-btn \${menuIndex === 4 ? "neo-btn-focused" : ""}\`}
          style={{
            width: "100%",
            padding: "1.4vmin 2vmin",
            fontSize: "1.4vmin",
            borderRadius: "1vmin",
            whiteSpace: "nowrap",
          }}
        >
          {menuIndex === 4 && <span className="cursor-arrow">▶</span>}
          Back
          {menuIndex === 4 && <span className="cursor-arrow">◀</span>}
        </button>
      </div>
    </div>
  );
}
`,"src/components/menus/ControlsScreen.css":`.binding-board {
  width: 100%;
  max-width: 64vmin;
  padding: 1.6vmin 2vmin;
  border-radius: 2.4vmin;
  margin: auto 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1vmin 2vmin;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 40vh;
}

.binding-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2vmin;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding: 0.6vmin 0.4vmin;
  box-sizing: border-box;
}

.binding-action-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: bold;
  color: #718096;
}

.binding-btn {
  min-width: 10vmin;
  text-align: center;
  font-size: 1.4vmin;
  padding: 1.4vmin 2.2vmin;
  border-radius: 0.8vmin;
}

.controls-notice {
  padding: 1vmin 2vmin;
  border-radius: 1vmin;
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.25);
  color: hsl(280, 80%, 75%);
  font-size: 1.1vmin;
  font-weight: bold;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 0 0 6px rgba(168, 85, 247, 0.35);
  width: 100%;
  max-width: 64vmin;
  box-sizing: border-box;
  white-space: nowrap;
}

@media (max-width: 768px) and (pointer: coarse) {
  .binding-board {
    grid-template-columns: 1fr;
    gap: 8px;
    max-height: 30vh;
    padding: 10px;
    max-width: none;
    border-radius: 16px;
  }
  .binding-row {
    padding: 4px 0;
    font-size: 12px;
  }
  .binding-btn {
    min-width: 110px;
    padding: 10px 16px;
    font-size: 12px;
    border-radius: 6px;
  }
  .controls-notice {
    font-size: 9px;
    padding: 8px 12px;
    white-space: normal;
    line-height: 1.4;
    max-width: none;
    border-radius: 8px;
  }
}
`,"src/components/menus/ControlsScreen.tsx":`import "./ControlsScreen.css";
import { useState } from "react";
import { Action } from "@/core/InputProvider";
import { settingsManager } from "@/core/SettingsManager";
import { soundSynth } from "@/core/SoundSynth";

interface ControlsScreenProps {
  menuIndex: number;
  rebindTarget: { action: Action; index: number } | null;
  onBack: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
  setRebindTarget: (target: { action: Action; index: number } | null) => void;
  reloadSaveSlots: () => void;
}

function formatKeyDisplayName(code: string): string {
  if (!code) return "[ EMPTY ]";

  const upper = code.trim();
  if (upper === "Space") return "SPACE";
  if (upper === "ArrowLeft") return "LEFT ARROW";
  if (upper === "ArrowRight") return "RIGHT ARROW";
  if (upper === "ArrowUp") return "UP ARROW";
  if (upper === "ArrowDown") return "DOWN ARROW";
  if (upper === "Period") return ".";
  if (upper === "Comma") return ",";
  if (upper === "Slash") return "/";
  if (upper === "Backspace") return "BACKSPACE";
  if (upper === "Escape") return "ESC";

  return upper.replace(/^Key/, "");
}

export function ControlsScreen({
  menuIndex,
  rebindTarget,
  onBack,
  playHoverTick,
  setMenuIndex,
  setRebindTarget,
  reloadSaveSlots,
}: ControlsScreenProps) {
  const [isTouchDevice] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(pointer: coarse)").matches;
    }
    return false;
  });

  const handleRebindTrigger = (action: Action) => {
    if (isTouchDevice) {
      soundSynth.playErrorTick();
      return;
    }
    soundSynth.playHitConfirm();
    setRebindTarget({ action, index: 0 });
  };

  const backBtnIndex = isTouchDevice ? 0 : 10;

  return (
    <div
      className="flex-col h-full w-full"
      style={{ justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", padding: "20px 0" }}
    >
      <div className="title-banner" style={{ marginTop: "0", paddingTop: "0" }}>
        <h2
          style={{
            fontSize: "2rem",
            margin: 0,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
          }}
        >
          CONTROLS
        </h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>
          {isTouchDevice ? "Calibration Matrix" : "Change keyboard buttons"}
        </p>
      </div>

      {isTouchDevice ? (
        <div
          className="mixer-board neo-pressed"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "32px",
            textAlign: "center",
            margin: "auto 0",
            width: "100%",
            maxWidth: "540px",
            borderColor: "rgba(234, 179, 8, 0.15)",
            boxSizing: "border-box",
          }}
        >
          <div className="led-dot led-yellow" style={{ width: "16px", height: "16px", marginBottom: "8px" }} />
          <span
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "var(--signal-yellow)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            [ TOUCH INTERFACE CALIBRATION ]
          </span>
          <h3
            style={{
              fontSize: "16px",
              color: "#ffffff",
              margin: 0,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            Bespoke Custom Touch Controls Coming Soon
          </h3>
          <p
            style={{
              fontSize: "11px",
              color: "#718096",
              lineHeight: "1.6",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              maxWidth: "380px",
              margin: 0,
            }}
          >
            Virtual joystick remapping, physical boundary calibration, and responsive gesture-mapping menus are
            currently under engineering.
          </p>
        </div>
      ) : (
        <>
          <div className="flex-row" style={{ gap: "16px", marginTop: "auto", marginBottom: "auto" }}>
            <button
              onClick={() => {
                settingsManager.setPreset("DEFAULT_1");
                soundSynth.playHitConfirm();
                reloadSaveSlots();
              }}
              onMouseEnter={() => {
                playHoverTick();
                setMenuIndex(0);
              }}
              className={\`neo-btn \${menuIndex === 0 ? "neo-btn-focused" : ""}\`}
              style={{
                padding: "16px 28px",
                fontSize: "14px",
                borderColor:
                  menuIndex === 0
                    ? "#22c55e"
                    : settingsManager.getCurrentPreset() === "DEFAULT_1"
                      ? "rgba(34, 197, 94, 0.4)"
                      : "",
                color:
                  menuIndex === 0 ? "#22c55e" : settingsManager.getCurrentPreset() === "DEFAULT_1" ? "#22c55e" : "",
              }}
            >
              <span
                className="cursor-arrow"
                style={{ marginRight: "8px", visibility: menuIndex === 0 ? "visible" : "hidden" }}
              >
                ▶
              </span>
              PRESET 1
              <span
                className="cursor-arrow"
                style={{ marginLeft: "8px", visibility: menuIndex === 0 ? "visible" : "hidden" }}
              >
                ◀
              </span>
            </button>
            <button
              onClick={() => {
                settingsManager.setPreset("DEFAULT_2");
                soundSynth.playHitConfirm();
                reloadSaveSlots();
              }}
              onMouseEnter={() => {
                playHoverTick();
                setMenuIndex(1);
              }}
              className={\`neo-btn \${menuIndex === 1 ? "neo-btn-focused" : ""}\`}
              style={{
                padding: "16px 28px",
                fontSize: "14px",
                borderColor:
                  menuIndex === 1
                    ? "#22c55e"
                    : settingsManager.getCurrentPreset() === "DEFAULT_2"
                      ? "rgba(34, 197, 94, 0.4)"
                      : "",
                color:
                  menuIndex === 1 ? "#22c55e" : settingsManager.getCurrentPreset() === "DEFAULT_2" ? "#22c55e" : "",
              }}
            >
              <span
                className="cursor-arrow"
                style={{ marginRight: "8px", visibility: menuIndex === 1 ? "visible" : "hidden" }}
              >
                ▶
              </span>
              PRESET 2
              <span
                className="cursor-arrow"
                style={{ marginLeft: "8px", visibility: menuIndex === 1 ? "visible" : "hidden" }}
              >
                ◀
              </span>
            </button>
            <button
              onClick={() => {
                settingsManager.setPreset("CUSTOM");
                soundSynth.playHitConfirm();
                reloadSaveSlots();
              }}
              onMouseEnter={() => {
                playHoverTick();
                setMenuIndex(2);
              }}
              className={\`neo-btn \${menuIndex === 2 ? "neo-btn-focused" : ""}\`}
              style={{
                padding: "16px 28px",
                fontSize: "14px",
                borderColor:
                  menuIndex === 2
                    ? "#22c55e"
                    : settingsManager.getCurrentPreset() === "CUSTOM"
                      ? "rgba(34, 197, 94, 0.4)"
                      : "",
                color: menuIndex === 2 ? "#22c55e" : settingsManager.getCurrentPreset() === "CUSTOM" ? "#22c55e" : "",
              }}
            >
              <span
                className="cursor-arrow"
                style={{ marginRight: "8px", visibility: menuIndex === 2 ? "visible" : "hidden" }}
              >
                ▶
              </span>
              CUSTOM
              <span
                className="cursor-arrow"
                style={{ marginLeft: "8px", visibility: menuIndex === 2 ? "visible" : "hidden" }}
              >
                ◀
              </span>
            </button>
          </div>

          <div className="binding-board neo-pressed">
            {(Object.keys(settingsManager.getKeyMap()) as Action[]).map((action, idx) => {
              const keys = settingsManager.getKeyMap()[action] || [];
              const rowMenuIndex = idx + 3;
              const isFocusedRow = menuIndex === rowMenuIndex;
              return (
                <div key={action} className="binding-row" style={{ padding: "8px 4px" }}>
                  <span
                    className="binding-action-label"
                    style={{
                      color: isFocusedRow ? "#22c55e" : "",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      className="cursor-arrow"
                      style={{ marginRight: "8px", visibility: isFocusedRow ? "visible" : "hidden" }}
                    >
                      ▶
                    </span>
                    {action.replace("_", " ")}
                  </span>
                  <div className="flex-row" style={{ gap: "8px" }}>
                    <button
                      onClick={() => handleRebindTrigger(action)}
                      className={\`binding-btn neo-btn \${isFocusedRow ? "neo-btn-focused" : ""}\`}
                      style={{
                        minWidth: "150px",
                        padding: "16px 24px",
                        borderColor: rebindTarget?.action === action && rebindTarget?.index === 0 ? "#eab308" : "",
                        color: rebindTarget?.action === action && rebindTarget?.index === 0 ? "#eab308" : "",
                      }}
                    >
                      {rebindTarget?.action === action && rebindTarget?.index === 0
                        ? "PRESS ANY KEY..."
                        : formatKeyDisplayName(keys[0])}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="controls-notice" style={{ marginTop: "auto", marginBottom: "auto" }}>
            Determination Heal: Hold [Move Down] + Press [Jump] (Requires 1 Heal Charge)
          </div>
        </>
      )}

      <button
        onClick={onBack}
        onMouseEnter={() => {
          playHoverTick();
          setMenuIndex(backBtnIndex);
        }}
        className={\`neo-btn \${menuIndex === backBtnIndex ? "neo-btn-focused" : ""}\`}
        style={{ width: "100%", maxWidth: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span
          className="cursor-arrow"
          style={{ marginRight: "8px", visibility: menuIndex === backBtnIndex ? "visible" : "hidden" }}
        >
          ▶
        </span>
        Back
        <span
          className="cursor-arrow"
          style={{ marginLeft: "8px", visibility: menuIndex === backBtnIndex ? "visible" : "hidden" }}
        >
          ◀
        </span>
      </button>
    </div>
  );
}
`,"src/components/menus/CreditsScreen.css":`.credits-block {
  max-width: 64vmin;
  padding: 3.2vmin;
  width: 100%;
  border-radius: 2vmin;
  margin: auto 0;
  box-sizing: border-box;
}

.credits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2vmin;
  width: 100%;
  box-sizing: border-box;
}

.credits-item {
  background: var(--surface-bg);
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 1.2vmin;
  padding: 1.2vmin 1.6vmin;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.4vmin;
  box-shadow: var(--shadow-inset-light), var(--shadow-inset-dark);
}

.credits-tech-title {
  font-size: 1.4vmin;
  font-weight: bold;
  color: var(--signal-green);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-shadow: 0 0 6px var(--signal-green-glow);
}

.credits-tech-desc {
  font-size: 1.25vmin;
  color: #a0aec0;
  line-height: 1.45;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 768px) and (pointer: coarse) {
  .credits-block {
    padding: 12px 16px !important;
    border-radius: 12px !important;
    max-width: none;
  }
  .credits-grid {
    grid-template-columns: 1fr;
    gap: 8px;
    max-height: 30vh;
    overflow-y: auto;
  }
  .credits-item {
    padding: 8px 12px;
    border-radius: 8px;
  }
  .credits-tech-title {
    font-size: 11px;
  }
  .credits-tech-desc {
    font-size: 10px;
  }
}
`,"src/components/menus/CreditsScreen.tsx":`import "./CreditsScreen.css";
interface CreditsScreenProps {
  onBack: () => void;
}

export function CreditsScreen({ onBack }: CreditsScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner" style={{ marginTop: "15px" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            margin: 0,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
          }}
        >
          SYSTEM CREDITS
        </h2>
        <p style={{ color: "#718096", margin: "4px 0 0", fontSize: "11px", letterSpacing: "0.15em" }}>
          Engine Architecture & Technologies
        </p>
      </div>

      <div
        className="credits-block neo-pressed flex-col"
        style={{
          width: "100%",
          maxWidth: "68vmin",
          padding: "3.2vmin",
          borderRadius: "2vmin",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
            paddingBottom: "1.2vmin",
            marginBottom: "1.2vmin",
          }}
        >
          <p
            style={{
              fontSize: "1.6vmin",
              fontWeight: "bold",
              color: "#22c55e",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              margin: 0,
              textShadow: "0 0 8px rgba(34, 197, 94, 0.45)",
            }}
          >
            Built by Steven Casteel
          </p>
          <p
            style={{
              fontSize: "1.2vmin",
              color: "#4ade80",
              margin: "0.6vmin 0 0",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: "bold",
              textShadow: "0 0 6px rgba(74, 222, 128, 0.2)",
            }}
          >
            AI Co-Pilots: Gemini 2.5 Pro, Gemini 3.5 Flash
          </p>
          <a
            href="https://www.stevencasteel.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontSize: "1.1vmin",
              color: "#4a5568",
              margin: "0.6vmin 0 0",
              letterSpacing: "0.15em",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--signal-green)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}
          >
            WWW.STEVENCASTEEL.COM
          </a>
        </div>

        <div className="credits-grid">
          <div className="credits-item">
            <span className="credits-tech-title">PRESENTATION LAYOUT</span>
            <span className="credits-tech-desc">
              React 19, TypeScript 6.0, and Vite 8.0 bundle chunk splitting for low loading latencies.
            </span>
          </div>

          <div className="credits-item">
            <span className="credits-tech-title">PHYSICS ENGINE</span>
            <span className="credits-tech-desc">
              Custom 60Hz Semi-Implicit Euler accumulator loops, dynamic circular sweep checks, and ceiling corner
              nudging.
            </span>
          </div>

          <div className="credits-item">
            <span className="credits-tech-title">AUDIO SYNTHESIS</span>
            <span className="credits-tech-desc">
              Dynamic procedural sound wave generation using native Web Audio API oscillators, gain, and muffle lowpass
              filters.
            </span>
          </div>

          <div className="credits-item">
            <span className="credits-tech-title">DATA MANAGEMENT</span>
            <span className="credits-tech-desc">
              Zustand 5.0 reactive state managers and persistent browser registers secured with schema input checkers.
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="neo-btn neo-btn-focused"
        style={{ width: "100%", maxWidth: "240px", padding: "16px 32px", fontSize: "16px", borderRadius: "10px" }}
      >
        <span className="cursor-arrow">▶</span>
        Back
        <span className="cursor-arrow">◀</span>
      </button>
    </div>
  );
}
`,"src/components/menus/SaveSelectScreen.css":`.slot-list {
  display: flex;
  flex-direction: column;
  gap: 2.2vmin;
  width: 100%;
  max-width: 64vmin;
  margin: auto 0;
}

.slot-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2.4vmin 3.2vmin;
  border-radius: 1.4vmin;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.slot-card:active {
  transform: scale(0.98);
}

.slot-card-empty {
  background: var(--surface-bg);
  box-shadow: var(--shadow-inset-light), var(--shadow-inset-dark);
  border: 1px solid rgba(0, 0, 0, 0.3);
  color: #4a5568;
}

.slot-card-loaded {
  background: var(--surface-elevated);
  box-shadow: var(--shadow-light), var(--shadow-dark);
  border: 1px solid rgba(255, 255, 255, 0.02);
  color: #ffffff;
}

.slot-card-focused {
  background: var(--surface-bg);
  box-shadow: var(--shadow-inset-light), var(--shadow-inset-dark);
  color: var(--signal-green);
  border-color: rgba(34, 197, 94, 0.25);
  text-shadow: 0 0 8px var(--signal-green-glow);
}

@media (max-width: 768px) and (pointer: coarse) {
  .slot-list {
    gap: 10px;
    max-width: none;
  }
  .slot-card {
    padding: 12px 16px;
    border-radius: 10px;
  }
}
`,"src/components/menus/SaveSelectScreen.tsx":`import "./SaveSelectScreen.css";
import { SaveSlotData } from "@/core/SaveManager";

interface SaveSelectScreenProps {
  slots: SaveSlotData[];
  menuIndex: number;
  isCopyMode: boolean;
  copySourceIndex: number;
  isEraseMode: boolean;
  handleSlotSelect: (index: number) => void;
  toggleCopyMode: () => void;
  toggleEraseMode: () => void;
  onBack: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function SaveSelectScreen({
  slots,
  menuIndex,
  isCopyMode,
  copySourceIndex,
  isEraseMode,
  handleSlotSelect,
  toggleCopyMode,
  toggleEraseMode,
  onBack,
  playHoverTick,
  setMenuIndex,
}: SaveSelectScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner">
        <h2
          style={{
            fontSize: "2rem",
            margin: 0,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
          }}
        >
          {isCopyMode
            ? copySourceIndex === -1
              ? "CHOOSE SLOT TO COPY"
              : "CHOOSE WHERE TO COPY"
            : isEraseMode
              ? "CHOOSE SLOT TO DELETE"
              : "CHOOSE A SAVE SLOT"}
        </h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>
          Select a slot to load your game
        </p>
      </div>

      <div className="slot-list">
        {slots.map((slot, i) => (
          <button
            key={i}
            onClick={() => handleSlotSelect(i)}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(i);
            }}
            className={\`slot-card \${menuIndex === i ? "slot-card-focused" : slot.empty ? "slot-card-empty" : "slot-card-loaded"}\`}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div className="flex-row" style={{ alignItems: "center", gap: "12px" }}>
              {/* Arrow is always rendered to maintain static text alignment, toggling only visibility */}
              <span
                className="cursor-arrow"
                style={{
                  visibility: menuIndex === i ? "visible" : "hidden",
                  width: "16px",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                ▶
              </span>
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
            </div>

            <div className="flex-row" style={{ alignItems: "center", gap: "12px" }}>
              <div
                className={\`led-dot \${
                  slot.empty ? (i === copySourceIndex ? "led-yellow" : "") : isEraseMode ? "led-red" : "led-green"
                }\`}
                style={{ background: slot.empty && i !== copySourceIndex ? "#07080b" : "" }}
              />
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#718096" }}>
                {slot.empty ? "EMPTY" : "SAVED GAME"}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div
        className="flex-col"
        style={{ gap: "16px", width: "100%", maxWidth: "420px", marginTop: "16px", paddingBottom: "10px" }}
      >
        <div className="flex-row" style={{ gap: "16px", justifyContent: "center" }}>
          <button
            onClick={toggleCopyMode}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(3);
            }}
            className={\`neo-btn \${menuIndex === 3 ? "neo-btn-focused" : isCopyMode ? "neo-btn-active" : ""}\`}
            style={{
              flex: 1,
              padding: "18px",
              fontSize: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              className="cursor-arrow"
              style={{ visibility: menuIndex === 3 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
            >
              ▶
            </span>
            <span>Copy Slot</span>
            <span
              className="cursor-arrow"
              style={{ visibility: menuIndex === 3 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
            >
              ◀
            </span>
          </button>
          <button
            onClick={toggleEraseMode}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(4);
            }}
            className={\`neo-btn \${menuIndex === 4 ? "neo-btn-focused" : isEraseMode ? "neo-btn-active" : ""}\`}
            style={{
              flex: 1,
              padding: "18px",
              fontSize: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              className="cursor-arrow"
              style={{ visibility: menuIndex === 4 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
            >
              ▶
            </span>
            <span>Delete Slot</span>
            <span
              className="cursor-arrow"
              style={{ visibility: menuIndex === 4 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
            >
              ◀
            </span>
          </button>
        </div>
        <button
          onClick={onBack}
          onMouseEnter={() => {
            playHoverTick();
            setMenuIndex(5);
          }}
          className={\`neo-btn \${menuIndex === 5 ? "neo-btn-focused" : ""}\`}
          style={{
            padding: "18px",
            fontSize: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            className="cursor-arrow"
            style={{ visibility: menuIndex === 5 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
          >
            ▶
          </span>
          <span>Back</span>
          <span
            className="cursor-arrow"
            style={{ visibility: menuIndex === 5 ? "visible" : "hidden", width: "16px", display: "inline-block" }}
          >
            ◀
          </span>
        </button>
      </div>
    </div>
  );
}
`,"src/components/menus/SettingsScreen.tsx":`interface SettingsScreenProps {
  menuIndex: number;
  onAudio: () => void;
  onControls: () => void;
  onBack: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function SettingsScreen({
  menuIndex,
  onAudio,
  onControls,
  onBack,
  playHoverTick,
  setMenuIndex,
}: SettingsScreenProps) {
  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", alignItems: "center" }}>
      <div className="title-banner">
        <h2
          style={{
            fontSize: "2rem",
            margin: 0,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
          }}
        >
          SETTINGS
        </h2>
        <p style={{ color: "#718096", margin: "6px 0 0", fontSize: "12px", letterSpacing: "0.15em" }}>
          Adjust sounds and change keys
        </p>
      </div>

      <div className="btn-container" style={{ margin: "auto 0" }}>
        <button
          onClick={onAudio}
          onMouseEnter={() => {
            playHoverTick();
            setMenuIndex(0);
          }}
          className={\`neo-btn \${menuIndex === 0 ? "neo-btn-focused" : ""}\`}
        >
          {menuIndex === 0 && <span className="cursor-arrow">▶</span>}
          SOUND SETTINGS
          {menuIndex === 0 && <span className="cursor-arrow">◀</span>}
        </button>
        <button
          onClick={onControls}
          onMouseEnter={() => {
            playHoverTick();
            setMenuIndex(1);
          }}
          className={\`neo-btn \${menuIndex === 1 ? "neo-btn-focused" : ""}\`}
        >
          {menuIndex === 1 && <span className="cursor-arrow">▶</span>}
          KEYBOARD CONTROLS
          {menuIndex === 1 && <span className="cursor-arrow">◀</span>}
        </button>
      </div>

      <button
        onClick={onBack}
        onMouseEnter={() => {
          playHoverTick();
          setMenuIndex(2);
        }}
        className={\`neo-btn \${menuIndex === 2 ? "neo-btn-focused" : ""}\`}
        style={{ width: "100%", maxWidth: "240px" }}
      >
        {menuIndex === 2 && <span className="cursor-arrow">▶</span>}
        Back
        {menuIndex === 2 && <span className="cursor-arrow">◀</span>}
      </button>
    </div>
  );
}
`,"src/components/menus/SourceViewScreen.css":`.source-view-workspace {
  display: flex;
  gap: 16px;
  flex-grow: 1;
  height: 0;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  margin: 14px 0;
}

.directory-tree-pane {
  width: 24%;
  overflow-y: auto;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
}

.code-viewer-pane {
  width: 76%;
  overflow-y: auto;
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
  background: #1d1f21;
}

.source-view-footer {
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  box-sizing: border-box;
}

@media (max-width: 768px) and (pointer: coarse) {
  .source-view-workspace {
    flex-direction: column;
    gap: 12px;
    margin: 10px 0;
  }
  .directory-tree-pane {
    width: 100%;
    height: 35%;
    min-height: 140px;
    padding: 8px;
  }
  .code-viewer-pane {
    width: 100%;
    height: 65%;
    padding: 10px;
  }
  .source-view-footer {
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }
  .source-view-footer > button,
  .source-view-footer > a {
    width: 100% !important;
    max-width: none !important;
    padding: 14px 24px;
    font-size: 13px;
    justify-content: center;
  }
}
`,"src/components/menus/SourceViewScreen.tsx":`import "./SourceViewScreen.css";
import { useEffect, useState, useRef, useMemo } from "react";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";
import { sourceCodeManifest } from "@/core/sourceCodeManifest";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface SourceViewScreenProps {
  onBack: () => void;
}

interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children: FileNode[];
  depth: number;
}

function buildTree(paths: string[]): FileNode {
  const root: FileNode = { name: "root", path: "", isDir: true, children: [], depth: -1 };

  paths.forEach((p) => {
    const parts = p.split("/");
    let current = root;

    parts.forEach((part, i) => {
      const isDir = i < parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      let child = current.children.find((c) => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: isDir ? currentPath : p,
          isDir,
          children: [],
          depth: i,
        };
        current.children.push(child);
      }
      current = child;
    });
  });

  const sortNodes = (node: FileNode) => {
    node.children.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNodes);
  };
  sortNodes(root);

  return root;
}

function flattenVisible(node: FileNode, expanded: Record<string, boolean>, list: FileNode[] = []): FileNode[] {
  if (node.depth === -1) {
    node.children.forEach((child) => flattenVisible(child, expanded, list));
    return list;
  }

  list.push(node);

  if (node.isDir && expanded[node.path]) {
    node.children.forEach((child) => flattenVisible(child, expanded, list));
  }

  return list;
}

function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split(".").pop() || "";
  if (ext === "tsx") return "tsx";
  if (ext === "ts") return "typescript";
  if (ext === "js" || ext === "jsx") return "javascript";
  if (ext === "css") return "css";
  if (ext === "json") return "json";
  if (ext === "md") return "markdown";
  return "text";
}

export function SourceViewScreen({ onBack }: SourceViewScreenProps) {
  const [manifest] = useState<Record<string, string>>(sourceCodeManifest);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({
    src: true,
    "src/components": true,
    "src/core": true,
  });

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<"TOC" | "CODE">("TOC");

  const listRef = useRef<HTMLDivElement>(null);

  const treeRoot = useMemo(() => {
    const paths = Object.keys(sourceCodeManifest);
    return buildTree(paths);
  }, []);

  const visibleNodes = useMemo(() => {
    if (!treeRoot) return [];
    return flattenVisible(treeRoot, expandedDirs);
  }, [treeRoot, expandedDirs]);

  const handleDownload = () => {
    soundSynth.playHitConfirm();
    const link = document.createElement("a");
    link.href = "./all_source_code.txt";
    link.download = "all_source_code.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkRes = () => {
        setIsMobile(window.innerWidth <= 800);
      };
      checkRes();
      window.addEventListener("resize", checkRes);
      return () => window.removeEventListener("resize", checkRes);
    }
  }, []);

  useEffect(() => {
    const paths = Object.keys(sourceCodeManifest).sort();
    if (paths.length > 0) {
      setSelectedFile(paths[0]);
    }
  }, []);

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(0, visibleNodes.length - 1)));
  }, [visibleNodes]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (visibleNodes.length === 0) return;

      const keyMap = settingsManager.getKeyMap();
      const jumpKeys = keyMap["JUMP"] || [];
      const attackKeys = keyMap["ATTACK"] || [];
      const dashKeys = keyMap["DASH"] || [];

      const isConfirmKey =
        e.key === "Enter" ||
        e.key === " " ||
        e.code === "Space" ||
        jumpKeys.includes(e.code) ||
        jumpKeys.includes(e.key);

      const isBackKey =
        e.key === "Escape" ||
        e.key === "Backspace" ||
        attackKeys.includes(e.code) ||
        attackKeys.includes(e.key) ||
        dashKeys.includes(e.code) ||
        dashKeys.includes(e.key);

      if (isMobile && mobileView === "CODE") {
        if (isBackKey || e.key === "ArrowLeft" || e.key === "KeyA") {
          e.preventDefault();
          soundSynth.playSelectTick();
          setMobileView("TOC");
          return;
        }
      }

      const node = visibleNodes[activeIndex < visibleNodes.length ? activeIndex : 0];

      if (e.key === "ArrowDown" || e.key === "KeyS") {
        e.preventDefault();
        soundSynth.playSelectTick();
        setActiveIndex((prev) => {
          if (prev >= visibleNodes.length) {
            if (prev === visibleNodes.length + 2) {
              return 0;
            }
            return prev + 1;
          }
          if (prev === visibleNodes.length - 1) {
            return visibleNodes.length;
          }
          return prev + 1;
        });
      } else if (e.key === "ArrowUp" || e.key === "KeyW") {
        e.preventDefault();
        soundSynth.playSelectTick();
        setActiveIndex((prev) => {
          if (prev >= visibleNodes.length) {
            if (prev === visibleNodes.length) {
              return visibleNodes.length - 1;
            }
            return prev - 1;
          }
          if (prev === 0) {
            return visibleNodes.length + 2;
          }
          return prev - 1;
        });
      } else if (e.key === "ArrowRight" || e.key === "KeyD") {
        e.preventDefault();
        soundSynth.playSelectTick();
        if (activeIndex < visibleNodes.length) {
          if (node.isDir && !expandedDirs[node.path]) {
            setExpandedDirs((prev) => ({ ...prev, [node.path]: true }));
          }
        } else {
          setActiveIndex((prev) => {
            if (prev === visibleNodes.length + 2) {
              return 0;
            }
            return prev + 1;
          });
        }
      } else if (e.key === "ArrowLeft" || e.key === "KeyA") {
        e.preventDefault();
        soundSynth.playSelectTick();
        if (activeIndex < visibleNodes.length) {
          if (node.isDir && expandedDirs[node.path]) {
            setExpandedDirs((prev) => ({ ...prev, [node.path]: false }));
          } else {
            const parts = node.path.split("/");
            if (parts.length > 1) {
              const parentPath = parts.slice(0, -1).join("/");
              const parentIdx = visibleNodes.findIndex((n) => n.isDir && n.path === parentPath);
              if (parentIdx !== -1) {
                setActiveIndex(parentIdx);
                return;
              }
            }
            setActiveIndex(visibleNodes.length + 2);
          }
        } else {
          setActiveIndex((prev) => {
            if (prev === visibleNodes.length) {
              return visibleNodes.length - 1;
            }
            return prev - 1;
          });
        }
      } else if (isConfirmKey) {
        e.preventDefault();
        if (activeIndex < visibleNodes.length) {
          soundSynth.playHitConfirm();
          if (node.isDir) {
            setExpandedDirs((prev) => ({
              ...prev,
              [node.path]: !prev[node.path],
            }));
          } else {
            setSelectedFile(node.path);
            if (isMobile) {
              setMobileView("CODE");
            }
          }
        } else if (activeIndex === visibleNodes.length) {
          soundSynth.playHitConfirm();
          window.open("https://github.com/stevencasteel/BOX-BATTLE", "_blank");
        } else if (activeIndex === visibleNodes.length + 1) {
          handleDownload();
        } else if (activeIndex === visibleNodes.length + 2) {
          soundSynth.playErrorTick();
          onBack();
        }
      } else if (isBackKey) {
        e.preventDefault();
        if (activeIndex < visibleNodes.length) {
          if (node.isDir && expandedDirs[node.path]) {
            soundSynth.playErrorTick();
            setExpandedDirs((prev) => ({ ...prev, [node.path]: false }));
          } else {
            soundSynth.playSelectTick();
            setActiveIndex(visibleNodes.length + 2);
          }
        } else {
          if (activeIndex === visibleNodes.length + 2) {
            soundSynth.playErrorTick();
            onBack();
          } else {
            soundSynth.playSelectTick();
            setActiveIndex(visibleNodes.length + 2);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [visibleNodes, activeIndex, expandedDirs, onBack, isMobile, mobileView]);

  useEffect(() => {
    if (activeIndex < visibleNodes.length) {
      const activeEl = listRef.current?.querySelector(".file-item-active");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex, visibleNodes.length]);

  return (
    <div
      className="flex-col h-full w-full"
      style={{ justifyContent: "space-between", boxSizing: "border-box", padding: "16px 0" }}
    >
      <div className="title-banner" style={{ marginTop: "0", paddingTop: "0" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            margin: 0,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
          }}
        >
          SOURCE VIEWER
        </h2>
        <p style={{ color: "#718096", margin: "4px 0 0", fontSize: "11px", letterSpacing: "0.15em" }}>
          {isMobile
            ? mobileView === "TOC"
              ? "TAP FILE TO VIEW  •  DRAG TO SCROLL"
              : "SWIPE TO SCROLL  •  TAP BUTTON TO EXIT CODE"
            : "UP/DOWN/LEFT/RIGHT: NAVIGATE  •  JUMP: ENTER/OPEN  •  ATTACK/DASH: EXIT"}
        </p>
      </div>

      <div className="source-view-workspace">
        {(!isMobile || mobileView === "TOC") && (
          <div
            ref={listRef}
            className="directory-tree-pane neo-pressed"
            style={{
              WebkitOverflowScrolling: "touch",
              width: isMobile ? "100%" : "24%",
              height: isMobile ? "100%" : "",
            }}
          >
            {visibleNodes.map((node, idx) => {
              const isActive = idx === activeIndex;
              const isExpanded = node.isDir && !!expandedDirs[node.path];
              const isCurrentlySelected = !node.isDir && node.path === selectedFile;

              return (
                <div
                  key={node.path + "-" + idx}
                  className={isActive ? "file-item-active" : ""}
                  onClick={() => {
                    soundSynth.playSelectTick();
                    setActiveIndex(idx);
                    if (node.isDir) {
                      setExpandedDirs((prev) => ({ ...prev, [node.path]: !prev[node.path] }));
                    } else {
                      setSelectedFile(node.path);
                      if (isMobile) {
                        setMobileView("CODE");
                      }
                    }
                  }}
                  style={{
                    paddingTop: isMobile ? "14px" : "6px",
                    paddingBottom: isMobile ? "14px" : "6px",
                    paddingRight: isMobile ? "16px" : "10px",
                    paddingLeft: \`\${node.depth * (isMobile ? 22 : 16) + (isMobile ? 16 : 10)}px\`,
                    borderRadius: "6px",
                    fontSize: isMobile ? "13px" : "11px",
                    fontFamily: "monospace",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: isActive
                      ? "var(--signal-green)"
                      : isCurrentlySelected
                        ? "#ffffff"
                        : node.isDir
                          ? "#718096"
                          : "#4a5568",
                    background: isActive
                      ? "rgba(34, 197, 94, 0.08)"
                      : isCurrentlySelected
                        ? "rgba(255, 255, 255, 0.03)"
                        : "transparent",
                    border: isActive ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid transparent",
                    textShadow: isActive ? "0 0 6px var(--signal-green-glow)" : "none",
                    wordBreak: "break-all",
                    transition: "all 0.12s ease",
                    textAlign: "left",
                  }}
                >
                  <span style={{ minWidth: "12px", fontSize: "10px" }}>
                    {node.isDir ? (isExpanded ? "▼" : "▶") : " "}
                  </span>
                  <span style={{ fontSize: "13px" }}>{node.isDir ? (isExpanded ? "📂" : "📁") : "📄"}</span>
                  <span style={{ fontWeight: node.isDir ? "bold" : "normal" }}>{node.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {(!isMobile || mobileView === "CODE") && (
          <div
            className="code-viewer-pane neo-pressed"
            style={{
              WebkitOverflowScrolling: "touch",
              width: isMobile ? "100%" : "76%",
              height: isMobile ? "100%" : "",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isMobile && (
              <button
                onClick={() => {
                  soundSynth.playSelectTick();
                  setMobileView("TOC");
                }}
                className="neo-btn"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "12px",
                  marginBottom: "12px",
                  borderColor: "var(--signal-green)",
                  color: "var(--signal-green)",
                  flexShrink: 0,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                📁 BACK TO DIRECTORY
              </button>
            )}

            {selectedFile ? (
              <div
                style={{
                  textAlign: "left",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    color: "hsl(142, 70%, 75%)",
                    marginBottom: "14px",
                    fontFamily: "monospace",
                    flexShrink: 0,
                    fontSize: isMobile ? "10px" : "11px",
                    wordBreak: "break-all",
                  }}
                >
                  // FILE: {selectedFile}
                </div>
                <div style={{ flexGrow: 1, overflow: "auto" }}>
                  <SyntaxHighlighter
                    language={getLanguageFromPath(selectedFile)}
                    style={atomDark}
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      background: "transparent",
                      fontSize: isMobile ? "10px" : "11px",
                      lineHeight: "1.5",
                    }}
                  >
                    {manifest[selectedFile] || ""}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <span style={{ color: "#4a5568", fontSize: "11px" }}>
                Select a file in the directory tree to view content.
              </span>
            )}
          </div>
        )}
      </div>

      {!isMobile ? (
        <div
          className="source-view-footer"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            width: "100%",
            boxSizing: "border-box",
            marginTop: "12px",
            flexShrink: 0,
          }}
        >
          <a
            href="https://github.com/stevencasteel/BOX-BATTLE"
            target="_blank"
            rel="noopener noreferrer"
            className={\`neo-btn-large \${activeIndex === visibleNodes.length ? "neo-btn-large-focused" : ""}\`}
            style={{ flex: 1, textDecoration: "none", boxSizing: "border-box" }}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                GITHUB REPO
              </span>
              <span className="btn-sub-label">VIEW AND DOWNLOAD CODE ARCHIVE</span>
            </div>
            {activeIndex === visibleNodes.length && <span className="cursor-arrow-large">▶</span>}
          </a>

          <button
            onClick={handleDownload}
            className={\`neo-btn-large \${activeIndex === visibleNodes.length + 1 ? "neo-btn-large-focused" : ""}\`}
            style={{ flex: 1, boxSizing: "border-box" }}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                DOWNLOAD SOURCE
              </span>
              <span className="btn-sub-label">SAVE ALL CODE AS SINGLE .TXT FILE</span>
            </div>
            {activeIndex === visibleNodes.length + 1 && <span className="cursor-arrow-large">▶</span>}
          </button>

          <button
            onClick={onBack}
            className={\`neo-btn-large \${activeIndex === visibleNodes.length + 2 ? "neo-btn-large-focused" : ""}\`}
            style={{ flex: 1, boxSizing: "border-box" }}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                BACK TO MENU
              </span>
              <span className="btn-sub-label">EXIT SOURCE CODE VIEW</span>
            </div>
            {activeIndex === visibleNodes.length + 2 && <span className="cursor-arrow-large">▶</span>}
          </button>
        </div>
      ) : (
        <div
          className="source-view-footer"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            width: "100%",
            justifyContent: "space-between",
            boxSizing: "border-box",
            marginTop: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, display: "flex" }}>
            <a
              href="https://github.com/stevencasteel/BOX-BATTLE"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "12px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>

          <div style={{ flex: 1, display: "flex" }}>
            <button
              onClick={handleDownload}
              className="neo-btn"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "12px",
                boxSizing: "border-box",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>

          <div style={{ flex: 1, display: "flex" }}>
            <button
              onClick={onBack}
              className="neo-btn"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "12px",
                boxSizing: "border-box",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
`,"src/components/menus/TitleScreen.css":`.title-screen-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  padding: 1.5vmin 2.5vmin;
  position: relative;
}

.title-grid-overlay {
  position: absolute;
  inset: 0;
  background-size: 3.2vmin 3.2vmin;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  pointer-events: none;
  z-index: 1;
}

.title-screen-header {
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1.5vmin;
}

.system-tag {
  font-size: 1.1vmin;
  color: #4a5568;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 0.5vmin 1.4vmin;
  border-radius: 0.4vmin;
  background: rgba(0, 0, 0, 0.2);
}

.title-banner-overhauled {
  text-align: center;
  margin-top: 1.5vmin;
  width: 100%;
}

.title-banner-overhauled h1 {
  font-size: 4vmin;
  margin: 0;
  letter-spacing: 0.22em;
  font-weight: 900;
  color: #ffffff;
  text-shadow:
    0 4px 20px rgba(0, 0, 0, 0.95),
    0 0 10px rgba(255, 255, 255, 0.05);
  text-transform: uppercase;
}

.title-subtitle-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6vmin;
  width: 100%;
  margin-top: 0.8vmin;
}

.subtitle-line {
  height: 1px;
  flex-grow: 1;
  max-width: 8vmin;
  background: linear-gradient(to right, transparent, var(--signal-green), transparent);
}

.subtitle-text {
  font-size: 1.2vmin;
  color: var(--signal-green);
  margin: 0;
  letter-spacing: 0.35em;
  font-weight: bold;
  text-shadow: 0 0 8px var(--signal-green-glow);
}

.title-screen-center {
  z-index: 2;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

.btn-container {
  width: 100%;
  max-width: 54vmin;
  display: flex;
  flex-direction: column;
  gap: 2.4vmin;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.btn-container-overhauled {
  width: 100%;
  max-width: 58vmin;
  display: flex;
  flex-direction: column;
  gap: 1.8vmin;
}

.neo-btn-large {
  display: flex;
  align-items: center;
  position: relative;
  background: #0f1218;
  box-shadow:
    -4px -4px 10px rgba(255, 255, 255, 0.015),
    6px 6px 15px rgba(0, 0, 0, 0.8),
    inset 1px 1px 0px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 24px 32px;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
  outline: none;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}

.neo-btn-large:hover {
  background: #141922;
  border-color: rgba(255, 255, 255, 0.08);
}

.neo-btn-large:active {
  transform: scale(0.98);
}

.neo-btn-large-focused {
  background: #0c0e12;
  border-color: var(--signal-green);
  box-shadow:
    0 0 15px rgba(34, 197, 94, 0.15),
    inset 0 0 8px rgba(34, 197, 94, 0.1),
    6px 6px 18px rgba(0, 0, 0, 0.95);
}

.neo-btn-large .btn-indicator-light {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1e2430;
  margin-right: 24px;
  transition: all 0.15s ease;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.5);
}

.neo-btn-large-focused .btn-indicator-light {
  background: var(--signal-green);
  box-shadow:
    0 0 10px var(--signal-green),
    0 0 20px var(--signal-green-glow);
}

.btn-label-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-grow: 1;
}

.btn-main-label {
  font-size: clamp(14px, 4vw, 18px);
  font-weight: 800;
  color: #a0aec0;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: all 0.15s ease;
}

.neo-btn-large-focused .btn-main-label {
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.btn-sub-label {
  font-size: clamp(8px, 2.5vw, 10px);
  font-weight: 500;
  color: #4a5568;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: all 0.15s ease;
}

.neo-btn-large-focused .btn-sub-label {
  color: var(--signal-green);
  opacity: 0.85;
}

.cursor-arrow-large {
  color: var(--signal-green);
  font-size: 18px;
  font-weight: bold;
  animation: arrow-blink 0.4s infinite alternate;
  margin-left: 10px;
}

.cursor-arrow {
  color: var(--signal-green);
  font-weight: bold;
  display: inline-block;
  animation: arrow-blink 0.4s infinite alternate;
}

@keyframes arrow-blink {
  0% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1.15);
  }
}

.title-screen-footer {
  z-index: 2;
  width: 100%;
  margin-top: 1vmin;
}

.footer-deco-line {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.05) 80%,
    transparent
  );
  width: 100%;
  margin-bottom: 0.8vmin;
}

.footer-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9vmin;
  color: #4a5568;
  letter-spacing: 0.15em;
  padding: 0 1.6vmin;
  text-transform: uppercase;
}

.footer-center-prompt {
  color: #718096;
  font-weight: bold;
}

.title-screen-container .neo-btn-large {
  padding: 2.2vmin 3.2vmin;
  border-radius: 1.2vmin;
}

.title-screen-container .neo-btn-large-focused {
  background: #0c0e12;
  border-color: var(--signal-green);
  box-shadow:
    0 0 15px rgba(34, 197, 94, 0.15),
    inset 0 0 8px rgba(34, 197, 94, 0.1),
    6px 6px 18px rgba(0, 0, 0, 0.95);
}

.title-screen-container .neo-btn-large .btn-indicator-light {
  width: 1vmin;
  height: 1vmin;
  margin-right: 2.4vmin;
}

.title-screen-container .btn-main-label {
  font-size: 1.7vmin;
}

.title-screen-container .btn-sub-label {
  font-size: 1vmin;
}

.title-screen-container .cursor-arrow-large {
  font-size: 1.8vmin;
  margin-left: 1vmin;
}

@media (max-width: 768px) and (pointer: coarse) {
  .title-screen-container {
    padding: 8px 12px;
  }
  .title-screen-header {
    padding-top: 10px;
  }
  .system-tag {
    font-size: 9px;
    padding: 4px 10px;
  }
  .title-banner-overhauled {
    margin-top: 8px;
  }
  .title-banner-overhauled h1 {
    font-size: 26px;
  }
  .title-subtitle-container {
    gap: 8px;
    margin-top: 4px;
  }
  .subtitle-text {
    font-size: 10px;
  }
  .btn-container {
    max-width: none;
    gap: 14px;
    margin-bottom: 20px;
  }
  .btn-container-overhauled {
    max-width: none;
    gap: 10px;
  }
  .neo-btn-large {
    padding: 14px 20px;
    border-radius: 10px;
  }
  .neo-btn-large .btn-indicator-light {
    width: 8px;
    height: 8px;
    margin-right: 14px;
  }
  .btn-main-label {
    font-size: 14px;
  }
  .btn-sub-label {
    font-size: 9px;
  }
  .cursor-arrow-large {
    font-size: 14px;
  }
  .footer-status-bar {
    font-size: 7px;
    padding: 0;
  }
  .footer-center-prompt {
    display: none;
  }

  .title-screen-container .neo-btn-large {
    padding: 14px 20px;
    border-radius: 10px;
  }
  .title-screen-container .neo-btn-large .btn-indicator-light {
    width: 8px;
    height: 8px;
    margin-right: 14px;
  }
  .title-screen-container .btn-main-label {
    font-size: 14px;
  }
  .title-screen-container .btn-sub-label {
    font-size: 9px;
  }
  .title-screen-container .cursor-arrow-large {
    font-size: 14px;
    margin-left: 10px;
  }
}

@media (max-height: 600px) {
  .title-screen-header {
    padding-top: 6px;
  }
  .title-banner-overhauled h1 {
    font-size: 2rem;
  }
  .btn-container-overhauled {
    gap: 6px;
  }
  .neo-btn-large {
    padding: 10px 16px;
  }
}
`,"src/components/menus/TitleScreen.tsx":`import "./TitleScreen.css";
interface TitleScreenProps {
  menuIndex: number;
  onPlay: () => void;
  onSettings: () => void;
  onCredits: () => void;
  onSource: () => void;
  playHoverTick: () => void;
  setMenuIndex: (index: number) => void;
}

export function TitleScreen({
  menuIndex,
  onPlay,
  onSettings,
  onCredits,
  onSource,
  playHoverTick,
  setMenuIndex,
}: TitleScreenProps) {
  return (
    <div className="title-screen-container">
      {/* Structural background line vectors */}
      <div className="title-grid-overlay" />

      <div className="title-screen-header">
        <div className="system-tag">WELCOME TO THE ARENA</div>
        <div className="title-banner-overhauled">
          <h1>BOX BATTLE</h1>
          <div className="title-subtitle-container">
            <span className="subtitle-line"></span>
            <p className="subtitle-text">RETRO ACTION GAME</p>
            <span className="subtitle-line"></span>
          </div>
        </div>
      </div>

      <div className="title-screen-center">
        <div className="btn-container-overhauled">
          <button
            onClick={onPlay}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(0);
            }}
            className={\`neo-btn-large \${menuIndex === 0 ? "neo-btn-large-focused" : ""}\`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">PLAY GAME</span>
              <span className="btn-sub-label">CHOOSE A SAVE SLOT TO BEGIN</span>
            </div>
            {menuIndex === 0 && <span className="cursor-arrow-large">▶</span>}
          </button>

          <button
            onClick={onSettings}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(1);
            }}
            className={\`neo-btn-large \${menuIndex === 1 ? "neo-btn-large-focused" : ""}\`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">OPTIONS</span>
              <span className="btn-sub-label">ADJUST SOUNDS AND CONTROLS</span>
            </div>
            {menuIndex === 1 && <span className="cursor-arrow-large">▶</span>}
          </button>

          <button
            onClick={onCredits}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(2);
            }}
            className={\`neo-btn-large \${menuIndex === 2 ? "neo-btn-large-focused" : ""}\`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">CREDITS</span>
              <span className="btn-sub-label">GAME CREATOR AND DETAILS</span>
            </div>
            {menuIndex === 2 && <span className="cursor-arrow-large">▶</span>}
          </button>

          <button
            onClick={onSource}
            onMouseEnter={() => {
              playHoverTick();
              setMenuIndex(3);
            }}
            className={\`neo-btn-large \${menuIndex === 3 ? "neo-btn-large-focused" : ""}\`}
          >
            <div className="btn-indicator-light" />
            <div className="btn-label-group">
              <span className="btn-main-label">SOURCE CODE</span>
              <span className="btn-sub-label">BROWSE CABINET ENGINE FILE TREE</span>
            </div>
            {menuIndex === 3 && <span className="cursor-arrow-large">▶</span>}
          </button>
        </div>
      </div>

      <div className="title-screen-footer">
        <div className="footer-deco-line" />
        <div className="footer-status-bar">
          <span>CONTROL METHOD: KEYBOARD</span>
          <span className="footer-center-prompt">NAVIGATE: ARROWS / WASD • SELECT: ENTER / SPACE</span>
          <span>SAVES: 3 AVAILABLE</span>
        </div>
      </div>
    </div>
  );
}
`,"src/core/BattleDirector.ts":`import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { eventBroker } from "@/core/eventBroker";
import { soundSynth } from "@/core/SoundSynth";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { useSessionStore } from "@/store/useGameStore";

interface CinematicEvent {
  triggerTime: number;
  fired: boolean;
  action: () => void;
}

export class BattleDirector {
  private hasTriggeredFirstHit = false;
  private hasTriggeredPhase2 = false;
  private hasTriggeredPhase3 = false;
  private cinematicActive = false;

  private bossDeathTimer = -1;
  private bossDeathPos: { x: number; y: number } | null = null;

  private cinematicTimeline = 0;
  private cinematicQueue: CinematicEvent[] = [];

  private onBattleEnd: () => void;

  constructor(onBattleEnd: () => void) {
    this.onBattleEnd = onBattleEnd;
  }

  public isCinematicActive(): boolean {
    return this.cinematicActive;
  }

  public getDeathVisuals() {
    return {
      timer: this.bossDeathTimer,
      pos: this.bossDeathPos,
    };
  }

  public update(dt: number, player: Player, boss: Boss) {
    if (this.bossDeathTimer >= 0) {
      this.bossDeathTimer += dt;
    }

    if (this.cinematicActive) {
      this.updateCinematicTimeline(dt);
      return;
    }

    const bHealth = boss.getComponent(HealthComponent);
    if (bHealth) {
      if (bHealth.currentHealth < 30 && !this.hasTriggeredFirstHit) {
        this.hasTriggeredFirstHit = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "I found you. This battle ends now!" });
      }

      if (bHealth.currentHealth <= 21 && !this.hasTriggeredPhase2) {
        this.hasTriggeredPhase2 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "You won't beat me! Watch out for my rapid fire!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }

      if (bHealth.currentHealth <= 12 && !this.hasTriggeredPhase3) {
        this.hasTriggeredPhase3 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "This is my final stand! Prepare yourself!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }
    }

    const sessionState = useSessionStore.getState();

    if (player.isDead && !this.cinematicActive) {
      this.startCinematicSequence(
        player.position,
        () => {
          soundSynth.playPlayerExplosion();
        },
        [
          {
            triggerTime: 2.0,
            fired: false,
            action: () => {
              sessionState.setGameResult("GAMEOVER");
            },
          },
          {
            triggerTime: 2.5,
            fired: false,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "No... I can't go on..." });
            },
          },
          {
            triggerTime: 3.8,
            fired: false,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", {
                speaker: "boss",
                text: "You fought well... but I am victorious.",
              });
            },
          },
          {
            triggerTime: 7.2,
            fired: false,
            action: () => {
              eventBroker.publish("CLEAR_DIALOGUES", undefined);
              this.onBattleEnd();
            },
          },
        ]
      );
    } else if (boss.isDead && !this.cinematicActive) {
      this.startCinematicSequence(
        boss.position,
        () => {
          soundSynth.playBossExplosion();
        },
        [
          {
            triggerTime: 2.0,
            fired: false,
            action: () => {
              sessionState.setGameResult("VICTORY");
            },
          },
          {
            triggerTime: 2.5,
            fired: false,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", {
                speaker: "boss",
                text: "No... How could I lose this fight...",
              });
            },
          },
          {
            triggerTime: 4.8,
            fired: false,
            action: () => {
              eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "It is over. The area is secure." });
            },
          },
          {
            triggerTime: 7.2,
            fired: false,
            action: () => {
              eventBroker.publish("CLEAR_DIALOGUES", undefined);
              this.onBattleEnd();
            },
          },
        ]
      );
    }
  }

  private startCinematicSequence(
    pos: { x: number; y: number },
    initialExplosion: () => void,
    events: CinematicEvent[]
  ) {
    this.cinematicActive = true;
    eventBroker.publish("CLEAR_DIALOGUES", undefined);
    soundSynth.clearAllSlides();
    soundSynth.stopChargeDrone();
    soundSynth.stopHealDrone();
    initialExplosion();

    this.bossDeathTimer = 0;
    this.bossDeathPos = { x: pos.x, y: pos.y };

    eventBroker.publish("CAMERA_SHAKE", { amplitude: 30, duration: 1.8 });

    this.cinematicTimeline = 0;
    this.cinematicQueue = events;
  }

  private updateCinematicTimeline(dt: number) {
    this.cinematicTimeline += dt;

    for (const event of this.cinematicQueue) {
      if (!event.fired && this.cinematicTimeline >= event.triggerTime) {
        event.action();
        event.fired = true;
      }
    }
  }

  public cleanup() {
    this.cinematicQueue = [];
    this.cinematicTimeline = 0;
    this.bossDeathTimer = -1;
    this.bossDeathPos = null;
    this.cinematicActive = false;
  }
}
`,"src/core/Camera.ts":`export class Camera {
  public static offsetX: number = 0;
  public static offsetY: number = 0;
  public static hitStopTimer: number = 0;

  private static shakeTimer: number = 0;
  private static shakeDuration: number = 0;
  private static shakeAmplitude: number = 0;

  public static shake(amplitude: number, duration: number) {
    Camera.shakeAmplitude = amplitude;
    Camera.shakeDuration = duration;
    Camera.shakeTimer = duration;
  }

  public static triggerHitStop(duration: number) {
    Camera.hitStopTimer = duration;
  }

  public static update(dt: number) {
    // 1. Tick Hit Stop
    if (Camera.hitStopTimer > 0) {
      Camera.hitStopTimer -= dt;
    }

    // 2. Tick Screen Shake
    if (Camera.shakeTimer > 0) {
      Camera.shakeTimer -= dt;

      if (Camera.shakeTimer <= 0) {
        Camera.offsetX = 0;
        Camera.offsetY = 0;
      } else {
        const decay = Camera.shakeTimer / Camera.shakeDuration;
        Camera.offsetX = (Math.random() * 2 - 1) * Camera.shakeAmplitude * decay;
        Camera.offsetY = (Math.random() * 2 - 1) * Camera.shakeAmplitude * decay;
      }
    } else {
      Camera.offsetX = 0;
      Camera.offsetY = 0;
    }
  }

  public static reset() {
    Camera.offsetX = 0;
    Camera.offsetY = 0;
    Camera.shakeTimer = 0;
    Camera.hitStopTimer = 0;
  }
}
`,"src/core/Engine.ts":`import GameLoop from "@/core/GameLoop";
import { Player } from "@/entities/Player";
import { Boss } from "@/entities/Boss";
import { soundSynth } from "@/core/SoundSynth";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { ObjectPool } from "@/core/ObjectPool";
import { Projectile } from "@/entities/Projectile";
import { Camera } from "@/core/Camera";
import { Spawner } from "@/entities/Spawner";
import { inputProvider } from "@/core/InputProvider";
import { useSessionStore, useGameplayStore } from "@/store/useGameStore";
import { World } from "@/core/World";
import { SimulationSystems } from "@/core/SimulationSystems";
import { eventBroker } from "@/core/eventBroker";
import { Rectangle, EntityStatus } from "@/core/Interfaces";
import { BaseEntity } from "@/entities/BaseEntity";
import { defaultLevelConfig, LevelConfig } from "@/core/levelData";
import { WorldRenderer } from "@/core/WorldRenderer";
import { ParticleSystem } from "@/core/ParticleSystem";
import { BattleDirector } from "@/core/BattleDirector";

export class Engine {
  // Rendering & UI Bridges
  private ctx: CanvasRenderingContext2D;
  private triggerDialogue: (speaker: "player" | "boss", text: string) => void;
  private renderer!: WorldRenderer;

  // Simulation Core Loops & Systems
  private loop!: GameLoop;
  private systems!: SimulationSystems;
  private world!: World;
  private battleDirector!: BattleDirector;
  private particleSystem!: ParticleSystem;

  // Pools & Entity Registries
  private pool!: ObjectPool<Projectile>;
  private player!: Player;
  private boss!: Boss;
  private activeSpawners: Spawner[] = [];

  // Local Reactive Performance Cache Boundaries
  private cachedPlayerHP: number = -1;
  private cachedBossHP: number = -1;
  private cachedHealingCharges: number = -1;
  private cachedDetermination: number = -1;

  // Main Loop Accumulation Controls
  public isPaused: boolean = false;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60;

  // Level Geography Configuration
  private levelConfig: LevelConfig;
  private solids: Rectangle[] = [];
  private onewayPlatforms: Rectangle[] = [];
  private hazards: Rectangle[] = [];

  // Cleanup Event Handles
  private unsubDialogue!: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    triggerDialogue: (speaker: "player" | "boss", text: string) => void,
    levelConfig: LevelConfig = defaultLevelConfig
  ) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not construct 2D context.");
    }
    this.ctx = context;
    this.triggerDialogue = triggerDialogue;
    this.levelConfig = levelConfig;

    this.solids = this.levelConfig.solids;
    this.onewayPlatforms = this.levelConfig.onewayPlatforms;
    this.hazards = this.levelConfig.hazards;

    this.init();
  }

  /**
   * Performs the initial system configuration and allocates entities.
   */
  private init() {
    this.systems = new SimulationSystems();
    this.systems.setup(
      () => this.player.position.x,
      () => this.boss.position.x,
      (id) => this.world.minions.find((m) => m.id === id)?.position.x ?? 625
    );

    this.world = new World(this.solids, this.hazards, this.onewayPlatforms);
    this.renderer = new WorldRenderer(this.ctx);

    this.pool = new ObjectPool(() => new Projectile(), 60);
    this.world.projectilePool = this.pool;

    this.player = new Player("player-01", this.world);
    this.player.position = { ...this.levelConfig.playerStart };
    this.player.previousPosition = { ...this.levelConfig.playerStart };

    this.boss = new Boss("boss-01", this.world);
    this.boss.position = { ...this.levelConfig.bossStart };
    this.boss.previousPosition = { ...this.levelConfig.bossStart };

    this.world.player = this.player;
    this.world.boss = this.boss;

    this.activeSpawners = this.levelConfig.spawners.map((s) => new Spawner(s.type, s.x, s.y, this.world));

    Camera.reset();

    const sessionState = useSessionStore.getState();
    sessionState.setGameResult("PLAYING");

    this.projectState();

    this.unsubDialogue = eventBroker.subscribe("DIALOGUE_TRIGGERED", ({ speaker, text }) => {
      this.triggerDialogue(speaker, text);
    });

    window.addEventListener("keydown", this.handlePauseKey);

    this.particleSystem = new ParticleSystem();
    this.battleDirector = new BattleDirector(() => {});

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );
  }

  public start() {
    this.loop.start();
  }

  public stop() {
    this.loop.stop();
  }

  /**
   * Reset orchestrator. Restores all gameplay states back to baseline values.
   */
  public reset() {
    this.resetEnvironment();
    this.resetSpawnersAndMinions();
    this.resetPlayerState();
    this.resetBossState();
    this.resetSystemStates();

    // Force an immediate synchronous repaint to show the refreshed starting frame
    this.render();

    // Defer game loop restart until after React finishes DOM reconciliation
    requestAnimationFrame(() => {
      this.start();
    });
  }

  private resetEnvironment() {
    this.isPaused = false;
    this.accumulator = 0;
    Camera.reset();
    this.pool.clear();

    const overlay = this.ctx.canvas.parentElement?.querySelector(".vignette-overlay") as HTMLDivElement | null;
    if (overlay) {
      overlay.classList.remove("vignette-pulse");
    }
  }

  private resetSpawnersAndMinions() {
    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];
    this.activeSpawners = this.levelConfig.spawners.map((s) => new Spawner(s.type, s.x, s.y, this.world));
  }

  private resetPlayerState() {
    this.player.isDead = false;
    this.player.position = { ...this.levelConfig.playerStart };
    this.player.previousPosition = { ...this.levelConfig.playerStart };
    this.player.velocity = { x: 0, y: 0 };
    this.player.facingDirection = 1;
    this.player.hasDoubleJump = true;
    this.player.determinationCounter = 0;
    this.player.healingCharges = 0;
    this.player.hurtTimer = 0;
    this.player.visualScale = { x: 1, y: 1 };

    const pHealth = this.player.getComponent(HealthComponent);
    if (pHealth) {
      pHealth.reset();
    }

    // Restore dash parameters
    this.player.dashComponent.isDashing = false;
    this.player.dashComponent.dashTimer = 0;
    this.player.dashComponent.dashCooldown = 0;
    this.player.dashComponent.canDash = true;
    this.player.dashComponent.ghosts = [];

    // Restore melee properties
    this.player.meleeComponent.attackCooldownTimer = 0;
    this.player.meleeComponent.attackActiveTimer = 0;
    this.player.meleeComponent.attackActive = false;
    this.player.meleeComponent.attackDirection = null;
    this.player.meleeComponent.hasHitEnemyThisSwing = false;

    // Restore fireball charge states
    this.player.fireballComponent.isCharging = false;
    this.player.fireballComponent.chargeTimer = 0;

    // Restore healing controls
    this.player.healComponent.isHealing = false;
    this.player.healComponent.healTimer = 0;
  }

  private resetBossState() {
    this.boss.isDead = false;
    this.boss.position = { ...this.levelConfig.bossStart };
    this.boss.previousPosition = { ...this.levelConfig.bossStart };
    this.boss.velocity = { x: 0, y: 0 };
    this.boss.facingDirection = -1;
    this.boss.currentPhase = 1;
    this.boss.patrolSpeed = 200;
    this.boss.lungeSpeed = 1200;

    const bHealth = this.boss.getComponent(HealthComponent);
    if (bHealth) {
      bHealth.reset();
    }
    this.boss.stateMachine.changeState(this.boss.cooldownState);
  }

  private resetSystemStates() {
    this.particleSystem.cleanup();
    this.particleSystem = new ParticleSystem();

    this.battleDirector.cleanup();
    this.battleDirector = new BattleDirector(() => {});

    const sessionState = useSessionStore.getState();
    sessionState.setGameResult("PLAYING");

    this.projectState();

    eventBroker.publish("CLEAR_DIALOGUES", undefined);
  }

  /**
   * Projects changing inner gameplay states to the global Zustand cache.
   * Leverages selective check boundaries to skip redundant rendering updates.
   */
  private projectState() {
    const pHealth = this.player.getComponent(HealthComponent);
    const bHealth = this.boss.getComponent(HealthComponent);

    const nextPlayerHP = pHealth ? pHealth.currentHealth : 5;
    const nextBossHP = bHealth ? bHealth.currentHealth : 30;
    const nextHealingCharges = this.player.healingCharges;
    const nextDetermination = this.player.determinationCounter;

    if (
      nextPlayerHP !== this.cachedPlayerHP ||
      nextBossHP !== this.cachedBossHP ||
      nextHealingCharges !== this.cachedHealingCharges ||
      nextDetermination !== this.cachedDetermination
    ) {
      this.cachedPlayerHP = nextPlayerHP;
      this.cachedBossHP = nextBossHP;
      this.cachedHealingCharges = nextHealingCharges;
      this.cachedDetermination = nextDetermination;

      useGameplayStore.setState({
        playerHP: nextPlayerHP,
        bossHP: nextBossHP,
        healingCharges: nextHealingCharges,
        determination: nextDetermination,
      });
    }
  }

  private handlePauseKey = (e: KeyboardEvent) => {
    if (e.code === "KeyP") {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        soundSynth.playErrorTick();
        soundSynth.clearAllSlides();
      } else {
        soundSynth.playHitConfirm();
      }
    }
  };

  /**
   * Accumulates frame-duration deltas and triggers discrete fixed-rate steps.
   */
  private update(dt: number) {
    if (this.isPaused) {
      return;
    }
    this.accumulator += dt;
    if (this.accumulator > 0.25) {
      this.accumulator = 0.25;
    }

    while (this.accumulator >= this.fixedTimeStep) {
      this.fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }
  }

  /**
   * High-precision 60Hz physics and game logic step cascade.
   */
  private fixedUpdate(dt: number) {
    inputProvider.update();
    if (Camera.hitStopTimer > 0) {
      Camera.update(dt);
      return;
    }

    Camera.update(dt);

    this.battleDirector.update(dt, this.player, this.boss);

    // Cache pre-integration positions for accurate renderer interpolations
    this.player.previousPosition = { ...this.player.position };
    this.boss.previousPosition = { ...this.boss.position };
    for (const minion of this.world.minions) {
      (minion as BaseEntity).previousPosition = { ...minion.position };
    }
    const activeProjectiles = this.pool.getActive();
    for (const proj of activeProjectiles) {
      proj.previousPosition = { ...proj.position };
    }

    if (this.battleDirector.isCinematicActive()) {
      this.player.velocity = { x: 0, y: 0 };
      this.boss.velocity = { x: 0, y: 0 };

      const activeProjectiles = [...this.pool.getActive()];
      for (let i = activeProjectiles.length - 1; i >= 0; i--) {
        activeProjectiles[i].update(dt);
      }
      inputProvider.postUpdate();
      this.projectState();
      return;
    }

    this.particleSystem.update(dt);

    this.player.update(dt);
    this.boss.update(dt);

    for (const spawner of this.activeSpawners) {
      spawner.update(dt);
    }

    for (let i = this.world.minions.length - 1; i >= 0; i--) {
      const minion = this.world.minions[i];
      minion.update(dt);

      const isMinionHazardous = minion.status === EntityStatus.ACTIVE;
      if (!this.player.isDead && isMinionHazardous) {
        const pW = this.player.size.width / 2;
        const pH = this.player.size.height / 2;
        const mW = minion.size.width / 2;
        const mH = minion.size.height / 2;

        const isColliding =
          this.player.position.x + pW > minion.position.x - mW &&
          this.player.position.x - pW < minion.position.x + mW &&
          this.player.position.y + pH > minion.position.y - mH &&
          this.player.position.y - pH < minion.position.y + mH;

        if (isColliding) {
          const playerHealth = this.player.getComponent(HealthComponent);
          if (playerHealth) {
            const damaged = playerHealth.takeDamage(1);
            if (damaged) {
              const knockbackDir = Math.sign(this.player.position.x - minion.position.x);
              this.player.velocity.x = (knockbackDir !== 0 ? knockbackDir : 1) * 450;
              this.player.velocity.y = -350;
            }
          }
        }
      }
    }

    const activeProjectilesUpdate = [...this.pool.getActive()];
    for (let i = activeProjectilesUpdate.length - 1; i >= 0; i--) {
      activeProjectilesUpdate[i].update(dt);
    }

    inputProvider.postUpdate();

    this.projectState();
  }

  private render() {
    const alpha = this.accumulator / this.fixedTimeStep;
    this.renderer.render(
      this.world,
      this.particleSystem.getParticles(),
      this.solids,
      this.onewayPlatforms,
      this.hazards,
      this.pool,
      this.isPaused,
      this.battleDirector.getDeathVisuals().timer,
      this.battleDirector.getDeathVisuals().pos,
      alpha
    );
  }

  public cleanup() {
    this.battleDirector.cleanup();
    this.loop.cleanup();
    this.player.teardown();
    this.boss.teardown();
    this.pool.clear();
    Camera.reset();
    this.systems.teardown();
    this.unsubDialogue();
    this.particleSystem.cleanup();
    window.removeEventListener("keydown", this.handlePauseKey);

    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];
  }
}
`,"src/core/GameLoop.ts":`class GameLoop {
  private lastTime: number = 0;
  private rafId: number | null = null;
  private isRunning: boolean = false;

  private onUpdate: (dt: number) => void;
  private onRender: () => void;

  constructor(onUpdate: (dt: number) => void, onRender: () => void) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;

    if (typeof window !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (dt > 0.1) {
      dt = 0.1;
    }

    this.onUpdate(dt);
    this.onRender();

    this.rafId = requestAnimationFrame(this.loop);
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
    }
  };

  public cleanup() {
    this.stop();
    if (typeof window !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }
}

export default GameLoop;
`,"src/core/InputProvider.ts":`import { settingsManager } from "@/core/SettingsManager";

export type Action = "MOVE_LEFT" | "MOVE_RIGHT" | "MOVE_UP" | "MOVE_DOWN" | "JUMP" | "ATTACK" | "DASH";

class InputProvider {
  private pauseJustPressed: boolean = false;
  private pressTimestamps: Record<Action, number> = {
    MOVE_LEFT: 0,
    MOVE_RIGHT: 0,
    MOVE_UP: 0,
    MOVE_DOWN: 0,
    JUMP: 0,
    ATTACK: 0,
    DASH: 0,
  };

  private keyboardPressed: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false,
  };

  private gamepadPressed: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false,
  };

  private pressed: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false,
  };

  private justPressed: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false,
  };

  private justReleased: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false,
  };

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("keyup", this.handleKeyUp);
      window.addEventListener("blur", this.handleBlur);
    }
  }

  private getActionFromCode(code: string): Action | null {
    const keyMap = settingsManager.getKeyMap();
    for (const action in keyMap) {
      if (keyMap[action as Action]?.includes(code)) {
        return action as Action;
      }
    }
    return null;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "KeyP") {
      e.preventDefault();
      this.pauseJustPressed = true;
      return;
    }
    const action = this.getActionFromCode(e.code);
    if (action) {
      e.preventDefault();
      if (!this.keyboardPressed[action]) {
        this.keyboardPressed[action] = true;
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const action = this.getActionFromCode(e.code);
    if (action) {
      e.preventDefault();
      this.keyboardPressed[action] = false;
    }
  };

  private handleBlur = () => {
    this.pauseJustPressed = false;
    for (const key in this.keyboardPressed) {
      const action = key as Action;
      this.keyboardPressed[action] = false;
      this.gamepadPressed[action] = false;
      this.pressed[action] = false;
      this.justPressed[action] = false;
      this.justReleased[action] = false;
      this.pressTimestamps[action] = 0;
    }
  };

  public triggerTouchStart(action: Action) {
    if (!this.keyboardPressed[action]) {
      this.keyboardPressed[action] = true;
    }
  }

  public triggerTouchEnd(action: Action) {
    this.keyboardPressed[action] = false;
  }

  public consumeBufferedAction(action: Action, windowMs: number = 100): boolean {
    const elapsed = performance.now() - this.pressTimestamps[action];
    if (elapsed <= windowMs) {
      this.pressTimestamps[action] = 0;
      return true;
    }
    return false;
  }

  public isPressed(action: Action): boolean {
    return this.pressed[action];
  }

  public isJustPressed(action: Action): boolean {
    return this.justPressed[action];
  }

  public isJustReleased(action: Action): boolean {
    return this.justReleased[action];
  }

  public getAxis(negative: Action, positive: Action): number {
    let axis = 0;
    if (this.pressed[negative]) axis -= 1;
    if (this.pressed[positive]) axis += 1;
    return axis;
  }

  public pollGamepads() {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return;

    const gamepads = navigator.getGamepads();

    const currentGamepadPressed: Record<Action, boolean> = {
      MOVE_LEFT: false,
      MOVE_RIGHT: false,
      MOVE_UP: false,
      MOVE_DOWN: false,
      JUMP: false,
      ATTACK: false,
      DASH: false,
    };

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      if (gp.buttons[0]?.pressed) currentGamepadPressed["JUMP"] = true;
      if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) currentGamepadPressed["ATTACK"] = true;
      if (gp.buttons[1]?.pressed || gp.buttons[5]?.pressed || gp.buttons[7]?.pressed)
        currentGamepadPressed["DASH"] = true;

      const axisThreshold = 0.35;
      if (gp.axes[0] < -axisThreshold || gp.buttons[14]?.pressed) currentGamepadPressed["MOVE_LEFT"] = true;
      if (gp.axes[0] > axisThreshold || gp.buttons[15]?.pressed) currentGamepadPressed["MOVE_RIGHT"] = true;
      if (gp.axes[1] < -axisThreshold || gp.buttons[12]?.pressed) currentGamepadPressed["MOVE_UP"] = true;
      if (gp.axes[1] > axisThreshold || gp.buttons[13]?.pressed) currentGamepadPressed["MOVE_DOWN"] = true;
    }

    this.gamepadPressed = currentGamepadPressed;
  }

  public update() {
    this.pollGamepads();

    const actions: Action[] = ["MOVE_LEFT", "MOVE_RIGHT", "MOVE_UP", "MOVE_DOWN", "JUMP", "ATTACK", "DASH"];
    for (const action of actions) {
      const isNowPressed = this.keyboardPressed[action] || this.gamepadPressed[action];
      const wasPressed = this.pressed[action];

      this.pressed[action] = isNowPressed;

      if (isNowPressed && !wasPressed) {
        this.justPressed[action] = true;
        this.pressTimestamps[action] = performance.now();
      } else if (!isNowPressed && wasPressed) {
        this.justReleased[action] = true;
      }
    }
  }

  public postUpdate() {
    this.pauseJustPressed = false;
    for (const key in this.justPressed) {
      const action = key as Action;
      this.justPressed[action] = false;
      this.justReleased[action] = false;
    }
  }

  public isPauseJustPressed(): boolean {
    return this.pauseJustPressed;
  }

  public cleanup() {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("keyup", this.handleKeyUp);
      window.removeEventListener("blur", this.handleBlur);
    }
  }
}

export const inputProvider = new InputProvider();
`,"src/core/Interfaces.ts":`import { IEntityComponent } from "@/entities/EntityComponent";

export enum EntityStatus {
  SPAWNING = "SPAWNING",
  ACTIVE = "ACTIVE",
  DYING = "DYING",
  DEAD = "DEAD",
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape: "spark" | "dust" | "ring";
}

export interface IAbilityUser {
  hasDoubleJump?: boolean;
  healingCharges?: number;
  facingDirection?: number;
}

export interface IEntity {
  id: string;
  position: Vector2D;
  previousPosition: Vector2D;
  velocity: Vector2D;
  size: { width: number; height: number };
  isDead: boolean;
  status: EntityStatus;
  world: IWorld;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D, alpha?: number): void;
  teardown(): void;
  addComponent<T extends IEntityComponent>(
    componentClass: new (...args: any[]) => T,
    component: T,
    dependencies?: any
  ): T;
  getComponent<T extends IEntityComponent>(componentClass: new (...args: any[]) => T): T | null;
  startDeathSequence?(): void;
  registerDamageDealt?(): void;
}

export interface IProjectile extends IEntity {
  isActive: boolean;
  ownerId: "player" | "boss";
  damage: number;
}

export interface IDamageable {
  takeDamage(amount: number): boolean;
  isInvincible(): boolean;
  isFlashing(): boolean;
  currentHealth: number;
  maxHealth: number;
}

export interface IPhysicsBody {
  isGrounded: boolean;
  isOnWallLeft: boolean;
  isOnWallRight: boolean;
  gravity: number;
}

export interface IPhysicsWorld {
  solids: Rectangle[];
  hazards: Rectangle[];
  onewayPlatforms: Rectangle[];
  isOverlapping(x: number, y: number, width: number, height: number, rects: Rectangle[]): boolean;
  getOverlapCandidates(
    x: number,
    y: number,
    width: number,
    height: number,
    type: "solid" | "platform" | "hazard"
  ): Rectangle[];
}

export interface IWorld {
  player: IEntity | null;
  boss: IEntity | null;
  minions: IEntity[];
  physicsWorld: IPhysicsWorld;
  getProjectiles(): IProjectile[];
  releaseProjectile(proj: IProjectile): void;
  spawnProjectile(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    ownerId: "player" | "boss",
    damage: number,
    speed: number,
    lifespan: number
  ): IProjectile;
}

export interface IDamageRecorder {
  registerDamageDealt(): void;
}
`,"src/core/ObjectPool.ts":`export interface IPoolable {
  isActive: boolean;
  activate(...args: any[]): void;
  deactivate(): void;
}

export class ObjectPool<T extends IPoolable> {
  private inactivePool: T[] = [];
  private activePool: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, initialSize: number = 20) {
    this.factory = factory;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      const instance = this.factory();
      instance.deactivate();
      this.inactivePool.push(instance);
    }
  }

  /**
   * Retrieves an inactive instance from the pool, activates it,
   * and tracks it in the active list.
   */
  public get(...args: any[]): T {
    let instance: T;

    if (this.inactivePool.length > 0) {
      instance = this.inactivePool.pop()!;
    } else {
      // Fallback: scale pool size dynamically if we run out under heavy load
      instance = this.factory();
    }

    instance.activate(...args);
    this.activePool.push(instance);
    return instance;
  }

  /**
   * Deactivates an active instance and returns it to the inactive pool.
   */
  public release(instance: T) {
    const index = this.activePool.indexOf(instance);
    if (index !== -1) {
      this.activePool.splice(index, 1);
      instance.deactivate();
      this.inactivePool.push(instance);
    }
  }

  public getActive(): readonly T[] {
    return this.activePool;
  }

  public clear() {
    this.inactivePool = [];
    this.activePool = [];
  }
}
`,"src/core/ParticleSystem.ts":`import { Particle } from "./Interfaces";
import { ObjectPool, IPoolable } from "./ObjectPool";
import { eventBroker } from "./eventBroker";

export class PoolableParticle implements Particle, IPoolable {
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public color = "";
  public size = 0;
  public life = 0;
  public maxLife = 0;
  public shape: "spark" | "dust" | "ring" = "spark";
  public isActive = false;

  public activate(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    life: number,
    shape: "spark" | "dust" | "ring"
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.shape = shape;
    this.isActive = true;
  }

  public deactivate() {
    this.isActive = false;
  }
}

export class ParticleSystem {
  private pool: ObjectPool<PoolableParticle>;
  private unsubs: (() => void)[] = [];

  constructor() {
    this.pool = new ObjectPool(() => new PoolableParticle(), 200);
    this.setupListeners();
  }

  private setupListeners() {
    this.unsubs.push(
      eventBroker.subscribe("SPAWN_SPARKS", ({ x, y, angle, color, radial, count }) => {
        const sparkCount = count || 12;
        for (let i = 0; i < sparkCount; i++) {
          const pAngle = radial
            ? (i / sparkCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2)
            : angle + (Math.random() * 0.9 - 0.45);
          const pSpeed = radial ? 100 + Math.random() * 300 : 160 + Math.random() * 280;

          const vx = Math.cos(pAngle) * pSpeed;
          const vy = Math.sin(pAngle) * pSpeed;
          const pColor = color || "hsl(142, 71%, 58%)";
          const size = 2.5 + Math.random() * 3.5;
          const life = 0.22;

          this.pool.get(x, y, vx, vy, pColor, size, life, "spark");
        }
      })
    );

    this.unsubs.push(
      eventBroker.subscribe("SPAWN_DUST", ({ x, y }) => {
        const count = 10;
        for (let i = 0; i < count; i++) {
          const dir = i % 2 === 0 ? 1 : -1;
          const pSpeedX = dir * (50 + Math.random() * 110);
          const pSpeedY = -8 - Math.random() * 30;
          const size = 3 + Math.random() * 3;
          const life = 0.24;

          this.pool.get(x, y, pSpeedX, pSpeedY, "rgba(255, 255, 255, 0.40)", size, life, "dust");
        }
      })
    );

    this.unsubs.push(
      eventBroker.subscribe("SPAWN_BLAST", ({ x, y, color }) => {
        this.pool.get(x, y, 0, 0, color, 8, 0.16, "ring");
      })
    );
  }

  public update(dt: number) {
    const active = [...this.pool.getActive()];
    for (let i = active.length - 1; i >= 0; i--) {
      const p = active[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.pool.release(p);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  public getParticles(): readonly Particle[] {
    return this.pool.getActive();
  }

  public cleanup() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
    this.pool.clear();
  }
}
`,"src/core/PhysicsWorld.ts":`import { Rectangle, IPhysicsWorld } from "./Interfaces";
import { UNITS } from "@/core/Units";

export class PhysicsWorld implements IPhysicsWorld {
  public solids: Rectangle[] = [];
  public hazards: Rectangle[] = [];
  public onewayPlatforms: Rectangle[] = [];

  private static readonly CELL_SIZE = UNITS.SPATIAL_GRID_CELL_SIZE;
  private solidGrid: Map<string, Rectangle[]> = new Map();
  private platformGrid: Map<string, Rectangle[]> = new Map();
  private hazardGrid: Map<string, Rectangle[]> = new Map();

  constructor(solids: Rectangle[], hazards: Rectangle[], onewayPlatforms: Rectangle[]) {
    this.solids = solids;
    this.hazards = hazards;
    this.onewayPlatforms = onewayPlatforms;

    this.indexGeometry(this.solids, this.solidGrid);
    this.indexGeometry(this.onewayPlatforms, this.platformGrid);
    this.indexGeometry(this.hazards, this.hazardGrid);
  }

  private indexGeometry(rects: Rectangle[], grid: Map<string, Rectangle[]>) {
    for (const rect of rects) {
      const startX = Math.floor(rect.x / PhysicsWorld.CELL_SIZE);
      const endX = Math.floor((rect.x + rect.width) / PhysicsWorld.CELL_SIZE);
      const startY = Math.floor(rect.y / PhysicsWorld.CELL_SIZE);
      const endY = Math.floor((rect.y + rect.height) / PhysicsWorld.CELL_SIZE);

      for (let cx = startX; cx <= endX; cx++) {
        for (let cy = startY; cy <= endY; cy++) {
          const key = \`\${cx},\${cy}\`;
          if (!grid.has(key)) {
            grid.set(key, []);
          }
          grid.get(key)!.push(rect);
        }
      }
    }
  }

  public getOverlapCandidates(
    x: number,
    y: number,
    width: number,
    height: number,
    type: "solid" | "platform" | "hazard"
  ): Rectangle[] {
    const grid = type === "solid" ? this.solidGrid : type === "platform" ? this.platformGrid : this.hazardGrid;
    const fallback = type === "solid" ? this.solids : type === "platform" ? this.onewayPlatforms : this.hazards;

    const halfW = width / 2;
    const halfH = height / 2;
    const left = x - halfW;
    const right = x + halfW;
    const top = y - halfH;
    const bottom = y + halfH;

    const startX = Math.floor(left / PhysicsWorld.CELL_SIZE);
    const endX = Math.floor(right / PhysicsWorld.CELL_SIZE);
    const startY = Math.floor(top / PhysicsWorld.CELL_SIZE);
    const endY = Math.floor(bottom / PhysicsWorld.CELL_SIZE);

    const resultSet = new Set<Rectangle>();

    for (let cx = startX; cx <= endX; cx++) {
      for (let cy = startY; cy <= endY; cy++) {
        const key = \`\${cx},\${cy}\`;
        const cellCandidates = grid.get(key);
        if (cellCandidates) {
          for (const candidate of cellCandidates) {
            resultSet.add(candidate);
          }
        }
      }
    }

    if (resultSet.size === 0) {
      return fallback;
    }

    return Array.from(resultSet);
  }

  public isOverlapping(x: number, y: number, width: number, height: number, rects: Rectangle[]): boolean {
    const halfW = width / 2;
    const halfH = height / 2;

    const left = x - halfW;
    const right = x + halfW;
    const top = y - halfH;
    const bottom = y + halfH;

    for (const rect of rects) {
      if (right > rect.x && left < rect.x + rect.width && bottom > rect.y && top < rect.y + rect.height) {
        return true;
      }
    }
    return false;
  }
}
`,"src/core/SaveManager.ts":`import { ConfigurationValidator } from "./schemas";

export interface SaveSlotData {
  wins: number;
  losses: number;
  empty: boolean;
}

class SaveManager {
  private readonly storageKey = "box_battle_save_slots";
  private currentSlotIndex: number = -1;

  constructor() {
    this.initializeDefaultStorage();
  }

  private initializeDefaultStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      const defaultSlots: SaveSlotData[] = Array.from({ length: 3 }, () => ({
        wins: 0,
        losses: 0,
        empty: true,
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(defaultSlots));
    }
  }

  public getSlots(): SaveSlotData[] {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((slot) => ConfigurationValidator.validateSaveSlot(slot));
      }
    } catch {
      // Intentionally fall back below if JSON error occurs
    }
    return Array.from({ length: 3 }, () => ({ wins: 0, losses: 0, empty: true }));
  }

  public getSlot(index: number): SaveSlotData | null {
    const slots = this.getSlots();
    if (index >= 0 && index < slots.length) {
      return slots[index];
    }
    return null;
  }

  public selectSlot(index: number) {
    this.currentSlotIndex = index;
    const slot = this.getSlot(index);
    if (slot && slot.empty) {
      this.writeSlot(index, { wins: 0, losses: 0, empty: false });
    }
  }

  public getCurrentSlotIndex(): number {
    return this.currentSlotIndex;
  }

  public writeSlot(index: number, data: SaveSlotData) {
    const slots = this.getSlots();
    if (index >= 0 && index < slots.length) {
      slots[index] = ConfigurationValidator.validateSaveSlot(data);
      localStorage.setItem(this.storageKey, JSON.stringify(slots));
    }
  }

  public eraseSlot(index: number) {
    this.writeSlot(index, { wins: 0, losses: 0, empty: true });
    if (this.currentSlotIndex === index) {
      this.currentSlotIndex = -1;
    }
  }

  public copySlot(fromIndex: number, toIndex: number): boolean {
    const source = this.getSlot(fromIndex);
    if (!source || source.empty) return false;

    this.writeSlot(toIndex, {
      wins: source.wins,
      losses: source.losses,
      empty: false,
    });
    return true;
  }

  public recordWin() {
    if (this.currentSlotIndex === -1) return;
    const slot = this.getSlot(this.currentSlotIndex);
    if (slot) {
      this.writeSlot(this.currentSlotIndex, {
        ...slot,
        wins: slot.wins + 1,
      });
    }
  }

  public recordLoss() {
    if (this.currentSlotIndex === -1) return;
    const slot = this.getSlot(this.currentSlotIndex);
    if (slot) {
      this.writeSlot(this.currentSlotIndex, {
        ...slot,
        losses: slot.losses + 1,
      });
    }
  }
}

export const saveManager = new SaveManager();
`,"src/core/SettingsManager.ts":`import type { Action } from "@/core/InputProvider";
import { ConfigurationValidator } from "./schemas";

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  masterMuted: boolean;
  sfxMuted: boolean;
  musicMuted: boolean;
}

export type KeyMap = Record<Action, string[]>;

export type InputPreset = "DEFAULT_1" | "DEFAULT_2" | "CUSTOM";

class SettingsManager {
  private readonly configKey = "box_battle_config";

  private audioSettings: AudioSettings = {
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    masterMuted: false,
    sfxMuted: false,
    musicMuted: false,
  };

  private currentPreset: InputPreset = "DEFAULT_1";

  private customKeyMap: KeyMap = {
    MOVE_LEFT: ["ArrowLeft", "KeyA"],
    MOVE_RIGHT: ["ArrowRight", "KeyD"],
    MOVE_UP: ["ArrowUp", "KeyW"],
    MOVE_DOWN: ["ArrowDown", "KeyS"],
    JUMP: ["Space", "KeyX"],
    ATTACK: ["KeyC"],
    DASH: ["KeyZ"],
  };

  private presetDefault1: KeyMap = {
    MOVE_LEFT: ["ArrowLeft", "KeyA"],
    MOVE_RIGHT: ["ArrowRight", "KeyD"],
    MOVE_UP: ["ArrowUp", "KeyW"],
    MOVE_DOWN: ["ArrowDown", "KeyS"],
    JUMP: ["Space", "KeyX"],
    ATTACK: ["KeyC"],
    DASH: ["KeyZ"],
  };

  private presetDefault2: KeyMap = {
    MOVE_LEFT: ["KeyA"],
    MOVE_RIGHT: ["KeyD"],
    MOVE_UP: ["KeyW"],
    MOVE_DOWN: ["KeyS"],
    JUMP: ["Period"],
    ATTACK: ["Comma"],
    DASH: ["Slash"],
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const saved = localStorage.getItem(this.configKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.audio) {
          this.audioSettings = ConfigurationValidator.validateAudioSettings(parsed.audio, this.audioSettings);
        }
        if (parsed.preset === "DEFAULT_1" || parsed.preset === "DEFAULT_2" || parsed.preset === "CUSTOM") {
          this.currentPreset = parsed.preset;
        }
        if (parsed.customKeyMap) {
          this.customKeyMap = ConfigurationValidator.validateKeyMap(parsed.customKeyMap, this.customKeyMap);
        }
      } catch (e) {
        console.warn("Could not read settings from disk. Restoring defaults.", e);
      }
    }
  }

  public saveSettings() {
    const config = {
      audio: this.audioSettings,
      preset: this.currentPreset,
      customKeyMap: this.customKeyMap,
    };
    localStorage.setItem(this.configKey, JSON.stringify(config));
  }

  public getAudio(): AudioSettings {
    return this.audioSettings;
  }

  public setAudio(audio: Partial<AudioSettings>) {
    this.audioSettings = { ...this.audioSettings, ...audio };
    this.saveSettings();
  }

  public getCurrentPreset(): InputPreset {
    return this.currentPreset;
  }

  public setPreset(preset: InputPreset) {
    this.currentPreset = preset;
    this.saveSettings();
  }

  public getKeyMap(): KeyMap {
    if (this.currentPreset === "DEFAULT_1" || this.currentPreset === "DEFAULT_2") {
      return {
        MOVE_LEFT: [...new Set([...this.presetDefault1.MOVE_LEFT, ...this.presetDefault2.MOVE_LEFT])],
        MOVE_RIGHT: [...new Set([...this.presetDefault1.MOVE_RIGHT, ...this.presetDefault2.MOVE_RIGHT])],
        MOVE_UP: [...new Set([...this.presetDefault1.MOVE_UP, ...this.presetDefault2.MOVE_UP])],
        MOVE_DOWN: [...new Set([...this.presetDefault1.MOVE_DOWN, ...this.presetDefault2.MOVE_DOWN])],
        JUMP: [...new Set([...this.presetDefault1.JUMP, ...this.presetDefault2.JUMP])],
        ATTACK: [...new Set([...this.presetDefault1.ATTACK, ...this.presetDefault2.ATTACK])],
        DASH: [...new Set([...this.presetDefault1.DASH, ...this.presetDefault2.DASH])],
      };
    }
    return this.customKeyMap;
  }

  public remapKey(action: Action, index: number, newCode: string) {
    this.currentPreset = "CUSTOM";
    if (!this.customKeyMap[action]) {
      this.customKeyMap[action] = [];
    }
    this.customKeyMap[action][index] = newCode;
    this.saveSettings();
  }
}

export const settingsManager = new SettingsManager();
`,"src/core/SimulationSystems.ts":`import { eventBroker } from "@/core/eventBroker";
import { Camera } from "@/core/Camera";
import { soundSynth } from "@/core/SoundSynth";

export class SimulationSystems {
  private unsubscribes: (() => void)[] = [];

  private getPlayerX!: () => number;
  private getBossX!: () => number;
  private getMinionX!: (id: string) => number;

  public setup(getPlayerX: () => number, getBossX: () => number, getMinionX: (id: string) => number): void {
    this.getPlayerX = getPlayerX;
    this.getBossX = getBossX;
    this.getMinionX = getMinionX;

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_HURT", () => {
        soundSynth.playHurt(this.getPlayerX());
        Camera.shake(15, 0.3);
        Camera.triggerHitStop(0.08);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_HURT", ({ currentHealth }) => {
        soundSynth.playHitConfirm(this.getBossX());
        if (currentHealth <= 0) {
          Camera.shake(25, 0.6);
          Camera.triggerHitStop(0.15);
        } else {
          Camera.shake(8, 0.15);
          Camera.triggerHitStop(0.04);
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("MINION_HURT", ({ id, currentHealth }) => {
        const mX = this.getMinionX(id);
        soundSynth.playHitConfirm(mX);
        if (currentHealth <= 0) {
          Camera.shake(4, 0.15);
          Camera.triggerHitStop(0.03);
        } else {
          Camera.shake(2, 0.08);
          Camera.triggerHitStop(0.01);
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_JUMPED", () => {
        soundSynth.playJump(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_DASHED", () => {
        soundSynth.playDash(this.getPlayerX());
        Camera.triggerHitStop(0.035);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_POGOED", () => {
        soundSynth.playPogo(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_ATTACKED", ({ direction }) => {
        soundSynth.playSlash(direction, this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_PROJECTILE_FIRED", ({ level }) => {
        if (level === 2) {
          soundSynth.playFireballLvl2(this.getPlayerX());
        } else {
          soundSynth.playFireballLvl1(this.getPlayerX());
        }
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CAMERA_SHAKE", ({ amplitude, duration }) => {
        Camera.shake(amplitude, duration);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("HIT_STOP", ({ duration }) => {
        Camera.triggerHitStop(duration);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_LANDED", () => {
        soundSynth.playLanding(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("HEAL_START", () => {
        soundSynth.playHealStart(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("HEAL_CANCEL", () => {
        soundSynth.playHealCancel(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("HEAL_COMPLETE", () => {
        soundSynth.playHealComplete();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_SPIKED", () => {
        soundSynth.playSpikeStrike(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_PHASE_SHIFT", () => {
        soundSynth.playBossPhaseShift(this.getBossX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("MINION_SPAWNING", () => {
        soundSynth.playMinionSpawning();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("MINION_DISSOLVING", () => {
        soundSynth.playMinionDeconstruct();
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("PLAYER_DASH_RECHARGED", () => {
        soundSynth.playDashRecharge(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_SWIPED", () => {
        soundSynth.playBossSwipe(this.getBossX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_TELEGRAPH", () => {
        soundSynth.playBossTelegraph(this.getBossX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("BOSS_LUNGED", () => {
        soundSynth.playBossLunge(this.getBossX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CHARGE_START", () => {
        soundSynth.playChargeStart(this.getPlayerX());
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CHARGE_UPDATE", ({ timer }) => {
        soundSynth.updateChargeTimer(timer);
      })
    );

    this.unsubscribes.push(
      eventBroker.subscribe("CHARGE_STOP", () => {
        soundSynth.stopChargeDrone();
      })
    );
  }

  public teardown(): void {
    this.unsubscribes.forEach((unsub) => unsub());
    this.unsubscribes = [];
    soundSynth.stopHealDrone();
    soundSynth.stopChargeDrone();
  }
}
`,"src/core/SoundSynth.ts":`import { AudioContextManager } from "./audio/AudioContextManager";
import { SFXManager } from "./audio/SFXManager";
import { MusicSequencer } from "./audio/MusicSequencer";
import { DroneManager } from "./audio/DroneManager";

class SoundSynth {
  private ctxManager: AudioContextManager;
  private sfx: SFXManager;
  private music: MusicSequencer;
  private drones: DroneManager;

  constructor() {
    this.ctxManager = new AudioContextManager();
    this.sfx = new SFXManager(this.ctxManager);
    this.music = new MusicSequencer(this.ctxManager);
    this.drones = new DroneManager(this.ctxManager, this.music);
  }

  public get hasUserGestured(): boolean {
    return this.ctxManager.hasUserGestured;
  }

  public get initialized(): boolean {
    return this.ctxManager.initialized;
  }

  public resumeContext(force?: boolean): void {
    this.ctxManager.resumeContext(force);
  }

  public updateVolumes(): void {
    this.ctxManager.updateVolumes();
  }

  public setCabinetMuffle(active: boolean): void {
    this.ctxManager.setCabinetMuffle(active);
  }

  public playBossTelegraph(x?: number): void {
    this.sfx.playBossTelegraph(x);
  }

  public playBossLunge(x?: number): void {
    this.sfx.playBossLunge(x);
  }

  public playDashRecharge(x?: number): void {
    this.sfx.playDashRecharge(x);
  }

  public playBossSwipe(x?: number): void {
    this.sfx.playBossSwipe(x);
  }

  public playMinionSpawning(x?: number): void {
    this.sfx.playMinionSpawning(x);
  }

  public playMinionDeconstruct(x?: number): void {
    this.sfx.playMinionDeconstruct(x);
  }

  public playBossPhaseShift(x?: number): void {
    this.sfx.playBossPhaseShift(x);
  }

  public playBossExplosion(x?: number): void {
    this.sfx.playBossExplosion(x);
  }

  public playPlayerExplosion(x?: number): void {
    this.sfx.playPlayerExplosion(x);
  }

  public playHealCancel(x?: number): void {
    this.sfx.playHealCancel(x);
  }

  public playSpikeStrike(x?: number): void {
    this.sfx.playSpikeStrike(x);
  }

  public playLanding(x?: number): void {
    this.sfx.playLanding(x);
  }

  public playFireballLvl1(x?: number): void {
    this.sfx.playFireballLvl1(x);
  }

  public playFireballLvl2(x?: number): void {
    this.sfx.playFireballLvl2(x);
  }

  public playMenuConfirm(): void {
    this.sfx.playMenuConfirm();
  }

  public playMenuBack(): void {
    this.sfx.playMenuBack();
  }

  public playJump(x?: number): void {
    this.sfx.playJump(x);
  }

  public playDash(x?: number): void {
    this.sfx.playDash(x);
  }

  public playSlash(direction?: "side" | "up" | "down", x?: number): void {
    this.sfx.playSlash(direction, x);
  }

  public playHitConfirm(x?: number): void {
    this.sfx.playHitConfirm(x);
  }

  public playPogo(x?: number): void {
    this.sfx.playPogo(x);
  }

  public playHurt(x?: number): void {
    this.sfx.playHurt(x);
  }

  public playSelectTick(): void {
    this.sfx.playSelectTick();
  }

  public playErrorTick(): void {
    this.sfx.playErrorTick();
  }

  public playDialogueTick(speaker: "player" | "boss", char: string): void {
    this.sfx.playDialogueTick(speaker, char);
  }

  public fadeOutMusic(duration?: number): void {
    this.music.fadeOutMusic(duration);
  }

  public fadeInMusic(duration?: number): void {
    this.music.fadeInMusic(duration);
  }

  public startMusic(): void {
    this.music.startMusic();
  }

  public stopMusic(): void {
    this.music.stopMusic();
  }

  public clearAllSlides(): void {
    // Deprecated
  }

  public playHealStart(x?: number): void {
    this.drones.playHealStart(x);
  }

  public stopHealDrone(): void {
    this.drones.stopHealDrone();
  }

  public playChargeStart(x?: number): void {
    this.drones.playChargeStart(x);
  }

  public updateChargeTimer(timer: number): void {
    this.drones.updateChargeTimer(timer);
  }

  public stopChargeDrone(): void {
    this.drones.stopChargeDrone();
  }

  public playHealComplete(): void {
    this.drones.playHealComplete();
  }
}

export const soundSynth = new SoundSynth();
`,"src/core/StateMachine.ts":`export interface IState {
  enter(): void;
  update(dt: number): void;
  exit(): void;
}

export class StateMachine {
  private currentState: IState | null = null;

  public changeState(newState: IState): void {
    if (this.currentState) {
      this.currentState.exit();
    }
    this.currentState = newState;
    this.currentState.enter();
  }

  public update(dt: number): void {
    if (this.currentState) {
      this.currentState.update(dt);
    }
  }

  public getCurrentState(): IState | null {
    return this.currentState;
  }
}
`,"src/core/Units.ts":`export const UNITS = {
  // World space coordinates (1 World Unit = 1 Pixel)
  WORLD_SIZE: 1250,
  WORLD_HALF_SIZE: 625,

  // Audio spatialization parameters
  AUDIO_MAX_PAN_SCALE: 0.45,

  // Spatial hashing configuration
  SPATIAL_GRID_CELL_SIZE: 250,

  // Physics sub-stepping and tolerances
  CCD_STEP_LIMIT_DEFAULT: 6,
  CCD_STEP_LIMIT_PROJECTILE: 5,
  GROUND_DETECTION_OFFSET: 1,
  CORNER_NUDGE_MAX_OVERLAP: 6,
  BROAD_PHASE_PADDING_STANDARD: 12,
  BROAD_PHASE_PADDING_LARGE: 24,

  // Canonical timing values (Seconds)
  ENGINE_TICK_RATE_HZ: 60,
  CANONICAL_DELTA_TIME: 1 / 60,

  // Combat range bounds
  MELEE_MAX_REACH: 95,
  MELEE_CLOSE_RANGE_THRESHOLD: 75,
  MELEE_SIDE_OFFSET: 35,
  MELEE_VERTICAL_OFFSET: 35,
  MELEE_SWEEP_INNER_RADIUS: 25,

  // Downward attack (pogo) hitbox dimensions
  POGO_HITBOX_WIDTH: 90,
  POGO_HITBOX_HEIGHT: 44.5,
  POGO_HITBOX_Y_OFFSET: 40,
  POGO_HITBOX_X_OFFSET: -45,
} as const;
`,"src/core/World.ts":`import { IWorld, IEntity, IPhysicsWorld, IProjectile, Rectangle } from "./Interfaces";
import { PhysicsWorld } from "./PhysicsWorld";
import { ObjectPool } from "./ObjectPool";
import { Projectile } from "@/entities/Projectile";

export class World implements IWorld {
  public player: IEntity | null = null;
  public boss: IEntity | null = null;
  public minions: IEntity[] = [];
  public physicsWorld: IPhysicsWorld;
  public projectilePool: ObjectPool<Projectile> | null = null;

  constructor(solids: Rectangle[], hazards: Rectangle[], onewayPlatforms: Rectangle[]) {
    this.physicsWorld = new PhysicsWorld(solids, hazards, onewayPlatforms);
  }

  public getProjectiles(): IProjectile[] {
    if (!this.projectilePool) return [];
    return this.projectilePool.getActive() as any[] as IProjectile[];
  }

  public releaseProjectile(proj: IProjectile): void {
    if (this.projectilePool) {
      this.projectilePool.release(proj as any);
    }
  }

  public spawnProjectile(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    ownerId: "player" | "boss",
    damage: number,
    speed: number,
    lifespan: number
  ): IProjectile {
    if (!this.projectilePool) {
      throw new Error("Projectile pool not initialized on World.");
    }
    return this.projectilePool.get(
      x,
      y,
      dirX,
      dirY,
      ownerId,
      damage,
      speed,
      lifespan,
      (p: any) => this.releaseProjectile(p),
      this
    ) as any as IProjectile;
  }
}
`,"src/core/WorldRenderer.ts":`import { Player } from "@/entities/Player";
import { Camera } from "./Camera";
import { World } from "./World";
import { Rectangle, Particle } from "./Interfaces";
import { Projectile } from "@/entities/Projectile";
import { ObjectPool } from "./ObjectPool";
import { UNITS } from "@/core/Units";

export class WorldRenderer {
  private ctx: CanvasRenderingContext2D;
  private cachedMeleeGradient: CanvasGradient;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;

    // Allocate the radial gradient once at startup to prevent GC spikes in high-frame-rate loops
    this.cachedMeleeGradient = ctx.createRadialGradient(
      0,
      0,
      UNITS.MELEE_SWEEP_INNER_RADIUS,
      0,
      0,
      UNITS.MELEE_MAX_REACH
    );
    this.cachedMeleeGradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
    this.cachedMeleeGradient.addColorStop(0.2, "rgba(255, 255, 255, 1.0)");
    this.cachedMeleeGradient.addColorStop(0.5, "rgba(132, 239, 158, 0.95)");
    this.cachedMeleeGradient.addColorStop(0.85, "rgba(34, 197, 94, 0.85)");
    this.cachedMeleeGradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");
  }

  private drawPlayerAttackVisual(ctx: CanvasRenderingContext2D, player: Player, alpha: number) {
    const facing = player.facingDirection;
    ctx.lineCap = "round";

    const progress = 1.0 - player.meleeComponent.attackActiveTimer / 0.09;
    const opacity = Math.max(0, player.meleeComponent.attackActiveTimer / 0.09);

    if (opacity <= 0.01) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = player.previousPosition.x + (player.position.x - player.previousPosition.x) * alphaVal;
    const drawY = player.previousPosition.y + (player.position.y - player.previousPosition.y) * alphaVal;

    if (player.attackDirection === "side") {
      const offset = facing * UNITS.MELEE_SIDE_OFFSET;
      const baseStart = -Math.PI / 2;
      const angleLength = Math.PI;
      const currentSweepAngle = angleLength * progress;

      const cx = drawX + offset;
      const cy = drawY;

      ctx.save();

      // Shift origin space to (cx, cy) to draw pre-compiled cached gradient centered at (0, 0)
      ctx.translate(cx, cy);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = this.cachedMeleeGradient;
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(
        0,
        0,
        UNITS.MELEE_MAX_REACH,
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle),
        facing < 0
      );
      ctx.arc(
        0,
        0,
        UNITS.MELEE_SWEEP_INNER_RADIUS,
        facing > 0 ? baseStart + currentSweepAngle : Math.PI - (baseStart + currentSweepAngle),
        facing > 0 ? baseStart : Math.PI - baseStart,
        facing > 0
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (player.attackDirection === "up") {
      const cx = drawX;
      const cy = drawY - UNITS.MELEE_VERTICAL_OFFSET;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      const gradient = ctx.createRadialGradient(cx, cy, currentInnerRadius, cx, cy, currentRadius);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.2, \`rgba(255, 255, 255, \${opacity})\`);
      gradient.addColorStop(0.5, \`rgba(132, 239, 158, \${opacity * 0.95})\`);
      gradient.addColorStop(0.85, \`rgba(34, 197, 94, \${opacity * 0.85})\`);
      gradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");

      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20 * opacity;

      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, -Math.PI, 0);
      ctx.arc(cx, cy, currentInnerRadius, 0, -Math.PI, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (player.attackDirection === "down") {
      const cx = drawX;
      const cy = drawY + UNITS.MELEE_VERTICAL_OFFSET;

      const currentRadius = 30 + progress * 65;
      const currentInnerRadius = 15 + progress * 15;

      ctx.save();
      const gradient = ctx.createRadialGradient(cx, cy, currentInnerRadius, cx, cy, currentRadius);
      gradient.addColorStop(0.0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.2, \`rgba(255, 255, 255, \${opacity})\`);
      gradient.addColorStop(0.5, \`rgba(132, 239, 158, \${opacity * 0.95})\`);
      gradient.addColorStop(0.85, \`rgba(34, 197, 94, \${opacity * 0.85})\`);
      gradient.addColorStop(1.0, "rgba(34, 197, 94, 0)");

      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(132, 239, 158, 0.85)";
      ctx.shadowBlur = 20 * opacity;

      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI);
      ctx.arc(cx, cy, currentInnerRadius, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  public render(
    world: World,
    particles: readonly Particle[],
    solids: Rectangle[],
    onewayPlatforms: Rectangle[],
    hazards: Rectangle[],
    projectilePool: ObjectPool<Projectile>,
    isPaused: boolean,
    bossDeathTimer: number,
    bossDeathPos: { x: number; y: number } | null,
    alpha: number
  ) {
    this.ctx.fillStyle = "#0c0d11";
    this.ctx.fillRect(0, 0, UNITS.WORLD_SIZE, UNITS.WORLD_SIZE);

    this.ctx.save();
    this.ctx.translate(Camera.offsetX, Camera.offsetY);

    this.ctx.fillStyle = "#1e1e24";
    for (const solid of solids) {
      this.ctx.fillRect(solid.x, solid.y, solid.width, solid.height);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      this.ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
    }

    this.ctx.fillStyle = "#2c3e50";
    for (const platform of onewayPlatforms) {
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Geometric Path Batching: Group hazard rendering triangles into a single GPU state call
    this.ctx.fillStyle = "hsl(350, 80%, 60%)";
    this.ctx.beginPath();
    for (const hazard of hazards) {
      const spikeWidth = 25;
      const spikeCount = Math.floor(hazard.width / spikeWidth);
      for (let i = 0; i < spikeCount; i++) {
        this.ctx.moveTo(hazard.x + i * spikeWidth, 1200);
        this.ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth / 2, 1150);
        this.ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth, 1200);
      }
    }
    this.ctx.fill();

    if (world.boss) {
      world.boss.draw(this.ctx, alpha);
    }

    for (const p of particles) {
      const pct = p.life / p.maxLife;
      this.ctx.save();

      if (p.shape === "spark") {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.shape === "dust") {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.7);
      } else if (p.shape === "ring") {
        const radius = p.size + (1.0 - pct) * 44;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = p.color;
        this.ctx.globalAlpha = pct;
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 10 * pct;
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    if (world.player) {
      world.player.draw(this.ctx, alpha);
      const player = world.player as Player;
      if (player.attackActive) {
        this.drawPlayerAttackVisual(this.ctx, player, alpha);
      }
    }

    for (const minion of world.minions) {
      minion.draw(this.ctx, alpha);
    }

    const activeProjectiles = projectilePool.getActive();
    for (const proj of activeProjectiles) {
      proj.draw(this.ctx, alpha);
    }

    if (bossDeathTimer >= 0 && bossDeathPos) {
      const t = bossDeathTimer;
      const px = bossDeathPos.x;
      const py = bossDeathPos.y;

      if (t < 0.25) {
        const flashOpacity = Math.max(0, 0.85 * (1 - t / 0.25));
        this.ctx.fillStyle = \`rgba(255, 255, 255, \${flashOpacity})\`;
        this.ctx.fillRect(0, 0, UNITS.WORLD_SIZE, UNITS.WORLD_SIZE);
      }

      const ringCount = 3;
      const speed = 750;
      for (let i = 0; i < ringCount; i++) {
        const delay = i * 0.15;
        const ringTime = t - delay;
        if (ringTime > 0 && ringTime < 1.2) {
          const radius = ringTime * speed;
          const opacity = Math.max(0, 1 - ringTime / 1.2);

          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(px, py, radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = \`rgba(34, 197, 94, \${opacity * 0.85})\`;
          this.ctx.lineWidth = Math.max(1, 14 * (1 - ringTime / 1.2));
          this.ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
          this.ctx.shadowBlur = 30 * (1 - ringTime / 1.2);
          this.ctx.stroke();

          this.ctx.beginPath();
          this.ctx.arc(px, py, radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = \`rgba(255, 255, 255, \${opacity * 0.95})\`;
          this.ctx.lineWidth = Math.max(1, 4 * (1 - ringTime / 1.2));
          this.ctx.shadowBlur = 0;
          this.ctx.stroke();
          this.ctx.restore();
        }
      }

      const particleCount = 24;
      const particleSpeed = 550;
      const particleLife = 1.0;
      if (t < particleLife) {
        const opacity = Math.max(0, 1 - t / particleLife);
        this.ctx.save();
        this.ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        this.ctx.shadowBlur = 15;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + (i % 2 === 0 ? t * 0.5 : -t * 0.5);
          const distance = t * particleSpeed * (0.6 + (0.4 * (i % 3)) / 3);
          const x = px + Math.cos(angle) * distance;
          const y = py + Math.sin(angle) * distance;

          this.ctx.fillStyle = \`rgba(34, 197, 94, \${opacity})\`;
          this.ctx.fillRect(x - 4, y - 4, 8, 8);
          this.ctx.fillStyle = \`rgba(255, 255, 255, \${opacity})\`;
          this.ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        this.ctx.restore();
      }
    }

    if (isPaused) {
      this.ctx.fillStyle = "rgba(12, 13, 17, 0.65)";
      this.ctx.fillRect(0, 0, UNITS.WORLD_SIZE, UNITS.WORLD_SIZE);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 44px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("SIMULATION PAUSED", UNITS.WORLD_HALF_SIZE, 600);

      this.ctx.font = "bold 18px monospace";
      this.ctx.fillStyle = "var(--signal-green)";
      this.ctx.fillText("PRESS 'P' TO RESUME RUNTIME STEPPERS", UNITS.WORLD_HALF_SIZE, 650);
    }

    this.ctx.restore();
  }
}
`,"src/core/audio/AudioContextManager.ts":`import * as Tone from "tone";
import { settingsManager } from "@/core/SettingsManager";
import { UNITS } from "@/core/Units";

export class AudioContextManager {
  public hasUserGestured: boolean = false;
  public initialized: boolean = false;

  public masterVolume!: Tone.Volume;
  public sfxGain!: Tone.Volume;
  public musicGain!: Tone.Volume;
  public cabinetFilter!: Tone.Filter;
  public limiter!: Tone.Limiter;

  private onInitCallbacks: (() => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const resumeOnGesture = () => {
        this.hasUserGestured = true;
        this.resumeContext();

        window.removeEventListener("click", resumeOnGesture);
        window.removeEventListener("keydown", resumeOnGesture);
        window.removeEventListener("touchend", resumeOnGesture);
        window.removeEventListener("mousedown", resumeOnGesture);
      };
      window.addEventListener("click", resumeOnGesture);
      window.addEventListener("keydown", resumeOnGesture);
      window.addEventListener("touchend", resumeOnGesture);
      window.addEventListener("mousedown", resumeOnGesture);
    }
  }

  public registerOnInit(callback: () => void) {
    if (this.initialized) {
      callback();
    } else {
      this.onInitCallbacks.push(callback);
    }
  }

  public resumeContext(force = false) {
    if (force) {
      this.hasUserGestured = true;
    }
    if (this.hasUserGestured) {
      Tone.start();
      this.init();
      if (Tone.getContext().state === "suspended") {
        Tone.getContext().resume();
      }
    }
  }

  public getPanFromX(x: number): number {
    const clampedX = Math.max(0, Math.min(UNITS.WORLD_SIZE, x));
    const rawPan = clampedX / UNITS.WORLD_HALF_SIZE - 1.0;
    const scaledPan = rawPan * UNITS.AUDIO_MAX_PAN_SCALE;
    return Math.max(-UNITS.AUDIO_MAX_PAN_SCALE, Math.min(UNITS.AUDIO_MAX_PAN_SCALE, scaledPan));
  }

  private init() {
    if (this.initialized) return;
    if (!this.hasUserGestured) return;

    this.initialized = true;

    const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    Tone.getContext().lookAhead = isMobile ? 0.15 : 0.05;

    this.masterVolume = new Tone.Volume(-120).toDestination();
    this.limiter = new Tone.Limiter(-12);

    this.cabinetFilter = new Tone.Filter({
      frequency: 20000,
      type: "lowpass",
      Q: 1.0,
    });

    this.sfxGain = new Tone.Volume(-120);
    this.musicGain = new Tone.Volume(-120);

    this.sfxGain.chain(this.cabinetFilter, this.limiter, this.masterVolume);
    this.musicGain.chain(this.cabinetFilter, this.limiter, this.masterVolume);

    this.updateVolumes();

    for (const cb of this.onInitCallbacks) {
      cb();
    }
    this.onInitCallbacks = [];
  }

  public updateVolumes() {
    if (!this.initialized) return;

    const config = settingsManager.getAudio();

    const masterDb = config.masterVolume <= 0 ? -120 : Tone.gainToDb(config.masterVolume * 0.35);
    const sfxDb = config.sfxVolume <= 0 ? -120 : Tone.gainToDb(config.sfxVolume * 0.85);
    const musicDb = config.musicVolume <= 0 ? -120 : Tone.gainToDb(config.musicVolume * 0.3);

    this.masterVolume.mute = config.masterMuted || config.masterVolume <= 0;
    this.sfxGain.mute = config.sfxMuted || config.sfxVolume <= 0;
    this.musicGain.mute = config.musicMuted || config.musicVolume <= 0;

    this.masterVolume.volume.setTargetAtTime(masterDb, Tone.now(), 0.05);
    this.sfxGain.volume.setTargetAtTime(sfxDb, Tone.now(), 0.05);
    this.musicGain.volume.setTargetAtTime(musicDb, Tone.now(), 0.05);
  }

  public setCabinetMuffle(active: boolean) {
    if (!this.initialized || !this.cabinetFilter) return;

    const targetFreq = active ? 600 : 20000;
    this.cabinetFilter.frequency.rampTo(targetFreq, 0.3);
  }
}
`,"src/core/audio/DroneManager.ts":`import * as Tone from "tone";
import { AudioContextManager } from "./AudioContextManager";
import { MusicSequencer } from "./MusicSequencer";

export class DroneManager {
  private ctxManager: AudioContextManager;
  private musicSeq: MusicSequencer;
  private panner!: Tone.Panner;

  private healOsc!: Tone.Oscillator;
  private healFilter!: Tone.Filter;
  private healGain!: Tone.Gain;
  private isHealDroneRunning: boolean = false;

  private chargeOsc!: Tone.Oscillator;
  private chargeFilter!: Tone.Filter;
  private chargeLfo!: Tone.LFO;
  private chargeGain!: Tone.Gain;
  private isChargeDroneRunning: boolean = false;
  private currentChargeLevel: number = 0;

  constructor(ctxManager: AudioContextManager, musicSeq: MusicSequencer) {
    this.ctxManager = ctxManager;
    this.musicSeq = musicSeq;
    this.ctxManager.registerOnInit(() => this.init());
  }

  private init() {
    this.panner = new Tone.Panner(0).connect(this.ctxManager.sfxGain);

    this.healOsc = new Tone.Oscillator({ type: "sine", frequency: 220 }).start();
    this.healFilter = new Tone.Filter({ frequency: 440, type: "bandpass", Q: 3.0 });
    this.healGain = new Tone.Gain(0);

    this.healOsc.connect(this.healFilter);
    this.healFilter.connect(this.healGain);
    this.healGain.connect(this.panner);

    this.chargeOsc = new Tone.Oscillator({ type: "sawtooth", frequency: 220 }).start();
    this.chargeFilter = new Tone.Filter({ frequency: 450, type: "lowpass", Q: 4.0 });
    this.chargeLfo = new Tone.LFO({ frequency: 5.5, min: -360, max: 360, type: "sine" }).start();
    this.chargeGain = new Tone.Gain(0);

    this.chargeLfo.connect(this.chargeFilter.frequency);
    this.chargeOsc.connect(this.chargeFilter);
    this.chargeFilter.connect(this.chargeGain);
    this.chargeGain.connect(this.panner);
  }

  public playHealStart(x?: number) {
    if (!this.ctxManager.initialized) return;
    this.stopHealDrone();

    if (x !== undefined && this.panner) {
      this.panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), Tone.now());
    }

    const now = Tone.now();

    this.healOsc.frequency.setValueAtTime(220, now);
    this.healFilter.frequency.setValueAtTime(440, now);

    this.healOsc.frequency.rampTo(660, 2.0);
    this.healFilter.frequency.rampTo(1320, 2.0);
    this.healGain.gain.rampTo(0.25, 0.15);

    this.isHealDroneRunning = true;
  }

  public stopHealDrone() {
    if (!this.ctxManager.initialized || !this.isHealDroneRunning) return;
    this.healGain.gain.rampTo(0, 0.1);
    this.isHealDroneRunning = false;
  }

  public playChargeStart(x?: number) {
    if (!this.ctxManager.initialized) return;
    this.stopChargeDrone();

    if (x !== undefined && this.panner) {
      this.panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), Tone.now());
    }

    const now = Tone.now();

    this.chargeOsc.frequency.setValueAtTime(220, now);
    this.chargeFilter.frequency.setValueAtTime(450, now);
    this.chargeLfo.frequency.setValueAtTime(5.5, now);
    this.chargeLfo.amplitude.setValueAtTime(110 / 360, now);
    this.chargeGain.gain.setValueAtTime(0.18, now);

    this.isChargeDroneRunning = true;
    this.currentChargeLevel = 0;
  }

  public updateChargeTimer(timer: number) {
    if (!this.ctxManager.initialized || !this.isChargeDroneRunning) return;
    const now = Tone.now();

    if (timer < 0.25) {
      const progress = timer / 0.25;
      this.chargeOsc.frequency.setTargetAtTime(220 + progress * 100, now, 0.05);
      this.chargeFilter.frequency.setTargetAtTime(450 + progress * 150, now, 0.05);
      this.chargeLfo.frequency.setTargetAtTime(6.0, now, 0.05);
      this.chargeLfo.amplitude.setTargetAtTime(110 / 360, now, 0.05);
      this.chargeGain.gain.setTargetAtTime(0.25, now, 0.05);
    } else if (timer >= 0.25 && timer < 1.12) {
      this.currentChargeLevel = 1;
      const range = (timer - 0.25) / (1.12 - 0.25);

      this.chargeOsc.frequency.setTargetAtTime(320 + range * 120, now, 0.06);
      this.chargeFilter.frequency.setTargetAtTime(600 + range * 250, now, 0.06);
      this.chargeLfo.frequency.setTargetAtTime(6.0 + range * 4.0, now, 0.06);
      this.chargeLfo.amplitude.setTargetAtTime((120 + range * 120) / 360, now, 0.06);
      this.chargeGain.gain.setTargetAtTime(0.45, now, 0.05);
    } else if (timer >= 1.12) {
      if (this.currentChargeLevel < 2) {
        this.currentChargeLevel = 2;
        this.playChargeCompleteDing();
      }
      const vibration = Math.sin(now * 30) * 8;
      this.chargeOsc.frequency.setTargetAtTime(660 + vibration, now, 0.08);
      this.chargeFilter.frequency.setTargetAtTime(1500, now, 0.08);
      this.chargeLfo.frequency.setTargetAtTime(15.0, now, 0.08);
      this.chargeLfo.amplitude.setTargetAtTime(1.0, now, 0.08);
      this.chargeGain.gain.setTargetAtTime(0.35, now, 0.05);
    }
  }

  private playChargeCompleteDing() {
    if (!this.ctxManager.initialized) return;
    this.musicSeq.musicArpSynth.triggerAttackRelease("G6", "4n");
  }

  public stopChargeDrone() {
    if (!this.ctxManager.initialized || !this.isChargeDroneRunning) return;
    this.chargeGain.gain.rampTo(0, 0.08);
    this.isChargeDroneRunning = false;
    this.currentChargeLevel = 0;
  }

  public playHealComplete() {
    this.stopHealDrone();
    if (!this.ctxManager.initialized) return;

    const chimeNotes = ["C5", "E5", "G5", "C6"];
    const now = Tone.now();

    chimeNotes.forEach((note, idx) => {
      this.musicSeq.musicArpSynth.triggerAttackRelease(note, "4n", now + idx * 0.05);
    });
  }
}
`,"src/core/audio/MusicSequencer.ts":`import * as Tone from "tone";
import { AudioContextManager } from "./AudioContextManager";
import { settingsManager } from "@/core/SettingsManager";

export class MusicSequencer {
  private ctxManager: AudioContextManager;

  private musicBassSynth!: Tone.MonoSynth;
  public musicArpSynth!: Tone.PolySynth;
  private bassSeq!: Tone.Sequence<string>;
  private arpSeq!: Tone.Sequence<string>;

  public isMusicPlaying: boolean = false;

  constructor(ctxManager: AudioContextManager) {
    this.ctxManager = ctxManager;
    this.ctxManager.registerOnInit(() => this.init());
  }

  private init() {
    const musicGain = this.ctxManager.musicGain;

    this.musicBassSynth = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      filter: { type: "lowpass", frequency: 350, Q: 1.0 },
      envelope: { attack: 0.02, decay: 0.12, sustain: 0.4, release: 0.15 },
      filterEnvelope: { attack: 0.02, decay: 0.15, sustain: 0.3, release: 0.15, baseFrequency: 350, octaves: 1.5 },
    }).connect(musicGain);

    this.musicArpSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.25 },
    }).connect(musicGain);

    const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (!isMobile) {
      const delay = new Tone.FeedbackDelay("8n.", 0.35).connect(musicGain);
      this.musicArpSynth.connect(delay);
    }

    this.setupMusicSequences();

    if (this.isMusicPlaying) {
      this.bassSeq.start(0);
      this.arpSeq.start(0);
      Tone.getTransport().start();
      this.fadeInMusic(0.4);
    }
  }

  private setupMusicSequences() {
    const bassNotes = ["C2", "C2", "D#2", "D#2", "F2", "F2", "A#1", "A#1"];
    this.bassSeq = new Tone.Sequence<string>(
      (time, note) => {
        this.musicBassSynth.triggerAttackRelease(note, "8n", time);
      },
      bassNotes,
      "4n"
    );

    const arpProgression = ["C4", "C4", "G3", "G3", "F3", "F3", "G#3", "A#3"];
    this.arpSeq = new Tone.Sequence<string>(
      (time, baseNote) => {
        const chord =
          baseNote === "G3" || baseNote === "A#3"
            ? [baseNote, Tone.Frequency(baseNote).transpose(4).toNote(), Tone.Frequency(baseNote).transpose(7).toNote()]
            : [
                baseNote,
                Tone.Frequency(baseNote).transpose(3).toNote(),
                Tone.Frequency(baseNote).transpose(7).toNote(),
              ];

        chord.forEach((note, index) => {
          this.musicArpSynth.triggerAttackRelease(note, "8n", time + index * 0.05);
        });
      },
      arpProgression,
      "2n"
    );

    Tone.getTransport().bpm.value = 135;
  }

  public startMusic() {
    this.ctxManager.resumeContext(true);
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    if (this.ctxManager.initialized) {
      this.bassSeq.start(0);
      this.arpSeq.start(0);
      Tone.getTransport().start();
      this.fadeInMusic(0.4);
    }
  }

  public stopMusic() {
    if (this.ctxManager.initialized) {
      this.bassSeq.stop();
      this.arpSeq.stop();
      Tone.getTransport().stop();
    }
    this.isMusicPlaying = false;
  }

  public fadeOutMusic(duration: number = 1.5) {
    if (!this.ctxManager.initialized || !this.isMusicPlaying) return;
    this.ctxManager.musicGain.volume.rampTo(-120, duration);
    setTimeout(
      () => {
        this.stopMusic();
        this.ctxManager.updateVolumes();
      },
      duration * 1000 + 100
    );
  }

  public fadeInMusic(duration: number = 0.4) {
    if (!this.ctxManager.initialized || !this.isMusicPlaying) return;
    const config = settingsManager.getAudio();
    const targetDb = config.musicVolume <= 0 ? -120 : Tone.gainToDb(config.musicVolume * 0.3);

    this.ctxManager.musicGain.volume.setValueAtTime(-120, Tone.now());
    this.ctxManager.musicGain.volume.rampTo(targetDb, duration);
  }
}
`,"src/core/audio/SFXManager.ts":`import { AudioContextManager } from "./AudioContextManager";
import { SFXHelper } from "./sfx/SFXHelper";
import { PlayerSFX } from "./sfx/PlayerSFX";
import { BossSFX } from "./sfx/BossSFX";
import { InterfaceSFX } from "./sfx/InterfaceSFX";

export class SFXManager {
  private helper: SFXHelper;
  private playerSFX: PlayerSFX;
  private bossSFX: BossSFX;
  private interfaceSFX: InterfaceSFX;

  constructor(ctxManager: AudioContextManager) {
    this.helper = new SFXHelper(ctxManager);
    this.playerSFX = new PlayerSFX(ctxManager, this.helper);
    this.bossSFX = new BossSFX(ctxManager, this.helper);
    this.interfaceSFX = new InterfaceSFX(ctxManager, this.helper);
  }

  public playBossTelegraph(x?: number) {
    this.bossSFX.playBossTelegraph(x);
  }
  public playBossLunge(x?: number) {
    this.bossSFX.playBossLunge(x);
  }
  public playDashRecharge(x?: number) {
    this.playerSFX.playDashRecharge(x);
  }
  public playBossSwipe(x?: number) {
    this.bossSFX.playBossSwipe(x);
  }
  public playMinionSpawning(x?: number) {
    this.bossSFX.playMinionSpawning(x);
  }
  public playMinionDeconstruct(x?: number) {
    this.bossSFX.playMinionDeconstruct(x);
  }
  public playBossPhaseShift(x?: number) {
    this.bossSFX.playBossPhaseShift(x);
  }
  public playBossExplosion(x?: number) {
    this.bossSFX.playBossExplosion(x);
  }
  public playPlayerExplosion(x?: number) {
    this.playerSFX.playPlayerExplosion(x);
  }
  public playHealCancel(x?: number) {
    this.playerSFX.playHealCancel(x);
  }
  public playSpikeStrike(x?: number) {
    this.bossSFX.playSpikeStrike(x);
  }
  public playLanding(x?: number) {
    this.playerSFX.playLanding(x);
  }
  public playFireballLvl1(x?: number) {
    this.playerSFX.playFireballLvl1(x);
  }
  public playFireballLvl2(x?: number) {
    this.playerSFX.playFireballLvl2(x);
  }
  public playMenuConfirm() {
    this.interfaceSFX.playMenuConfirm();
  }
  public playMenuBack() {
    this.interfaceSFX.playMenuBack();
  }
  public playJump(x?: number) {
    this.playerSFX.playJump(x);
  }
  public playDash(x?: number) {
    this.playerSFX.playDash(x);
  }
  public playSlash(direction?: "side" | "up" | "down", x?: number) {
    this.playerSFX.playSlash(direction, x);
  }
  public playHitConfirm(x?: number) {
    this.bossSFX.playHitConfirm(x);
  }
  public playPogo(x?: number) {
    this.playerSFX.playPogo(x);
  }
  public playHurt(x?: number) {
    this.playerSFX.playHurt(x);
  }
  public playSelectTick() {
    this.interfaceSFX.playSelectTick();
  }
  public playErrorTick() {
    this.interfaceSFX.playErrorTick();
  }
  public playDialogueTick(speaker: "player" | "boss", char: string) {
    this.interfaceSFX.playDialogueTick(speaker, char);
  }
}
`,"src/core/audio/sfx/BossSFX.ts":`import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";
import { SFX_PRESETS } from "../sfxPresetData";

export class BossSFX {
  private helper: SFXHelper;
  private bossPanner!: Tone.Panner;
  private impactPanner!: Tone.Panner;
  private hurtPanner!: Tone.Panner;

  private jumpSynth!: Tone.Synth;
  private hurtSynth!: Tone.Synth;
  private hitSynth!: Tone.MetalSynth;
  private spikeSynth!: Tone.Synth;
  private teleportSynth!: Tone.Synth;
  private dialogueSynthPlayer!: Tone.Synth;

  constructor(ctxManager: AudioContextManager, helper: SFXHelper) {
    this.helper = helper;
    ctxManager.registerOnInit(() => this.init(ctxManager));
  }

  private init(ctxManager: AudioContextManager) {
    const sfxGain = ctxManager.sfxGain;

    this.bossPanner = new Tone.Panner(0).connect(sfxGain);
    this.impactPanner = new Tone.Panner(0).connect(sfxGain);
    this.hurtPanner = new Tone.Panner(0).connect(sfxGain);

    const presets = SFX_PRESETS.boss;

    this.jumpSynth = new Tone.Synth({
      oscillator: { type: presets.telegraph.oscillatorType },
      envelope: { attack: 0.01, decay: presets.telegraph.decay, sustain: 0, release: presets.telegraph.decay },
    }).connect(this.bossPanner);

    this.hurtSynth = new Tone.Synth({
      oscillator: { type: presets.lunge.oscillatorType },
      envelope: { attack: 0.01, decay: presets.lunge.decay, sustain: 0, release: presets.lunge.decay },
    }).connect(this.hurtPanner);

    this.hitSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.08 },
      harmonicity: 5.1,
      resonance: 4000,
    }).connect(this.impactPanner);
    this.hitSynth.frequency.value = 440;

    this.spikeSynth = new Tone.Synth({
      oscillator: { type: presets.spike_strike.oscillatorType },
      envelope: { attack: 0.005, decay: presets.spike_strike.decay, sustain: 0, release: presets.spike_strike.decay },
    }).connect(this.impactPanner);

    this.teleportSynth = new Tone.Synth({
      oscillator: { type: presets.minion_spawn.oscillatorType },
      envelope: { attack: 0.05, decay: presets.minion_spawn.decay, sustain: 0, release: presets.minion_spawn.decay },
    }).connect(this.bossPanner);

    this.dialogueSynthPlayer = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 },
    }).connect(this.impactPanner);
  }

  public playBossTelegraph(x?: number) {
    const preset = SFX_PRESETS.boss.telegraph;
    this.helper.execute("boss_telegraph", 150, x, this.bossPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(preset.frequency, "8n", now);
      this.jumpSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playBossLunge(x?: number) {
    const preset = SFX_PRESETS.boss.lunge;
    this.helper.execute("boss_lunge", 200, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "2n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playBossSwipe(x?: number) {
    const preset = SFX_PRESETS.boss.swipe;
    this.helper.execute("boss_swipe", 150, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "8n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playMinionSpawning(x?: number) {
    const preset = SFX_PRESETS.boss.minion_spawn;
    this.helper.execute("minion_spawn", 100, x, this.bossPanner, (now) => {
      this.teleportSynth.triggerAttackRelease(preset.frequency, "4n", now);
      this.teleportSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playMinionDeconstruct(x?: number) {
    const preset = SFX_PRESETS.boss.minion_deconstruct;
    this.helper.execute("minion_deconstruct", 100, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "4n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playBossPhaseShift(x?: number) {
    const preset = SFX_PRESETS.boss.phase_shift;
    this.helper.execute("boss_phase_shift", 0, x, this.bossPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "2n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playBossExplosion(x?: number) {
    this.helper.execute("boss_explosion", 0, x, this.bossPanner, (now) => {
      for (let i = 0; i < 3; i++) {
        const delay = i * 0.25;
        this.hurtSynth.triggerAttackRelease(140 - i * 20, "4n", now + delay);
        this.hurtSynth.frequency.rampTo(40, 0.35, now + delay);
      }
    });
  }

  public playSpikeStrike(x?: number) {
    const preset = SFX_PRESETS.boss.spike_strike;
    this.helper.execute("spike_strike", 80, x, this.impactPanner, (now) => {
      this.spikeSynth.triggerAttackRelease(preset.frequency, "16n", now);
      this.spikeSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playHitConfirm(x?: number) {
    const preset = SFX_PRESETS.boss.hit_confirm;
    this.helper.execute("hit_confirm", 40, x, this.impactPanner, (now) => {
      this.hitSynth.triggerAttackRelease(preset.metalNote, "16n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(preset.synthFreq, "16n", now + preset.synthDelay);
    });
  }
}
`,"src/core/audio/sfx/InterfaceSFX.ts":`import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";
import { SFX_PRESETS } from "../sfxPresetData";

export class InterfaceSFX {
  private helper: SFXHelper;
  private playerDialoguePanner!: Tone.Panner;
  private bossDialoguePanner!: Tone.Panner;

  private dialogueSynthPlayer!: Tone.PolySynth;
  private dialogueSynthBoss!: Tone.PolySynth;
  private menuSynth!: Tone.Synth;

  constructor(ctxManager: AudioContextManager, helper: SFXHelper) {
    this.helper = helper;
    ctxManager.registerOnInit(() => this.init(ctxManager));
  }

  private init(ctxManager: AudioContextManager) {
    const sfxGain = ctxManager.sfxGain;

    this.playerDialoguePanner = new Tone.Panner(-0.35).connect(sfxGain);
    this.bossDialoguePanner = new Tone.Panner(0.35).connect(sfxGain);

    this.dialogueSynthPlayer = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 },
    }).connect(this.playerDialoguePanner);

    this.dialogueSynthBoss = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.07, sustain: 0, release: 0.07 },
    }).connect(this.bossDialoguePanner);

    this.menuSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.15 },
    }).connect(this.playerDialoguePanner);

    this.dialogueSynthPlayer.maxPolyphony = 4;
    this.dialogueSynthBoss.maxPolyphony = 4;
  }

  public playSelectTick() {
    const preset = SFX_PRESETS.interface.select_tick;
    this.helper.execute("select_tick", 30, undefined, undefined, (now) => {
      this.dialogueSynthPlayer.triggerAttackRelease(preset.note1, "32n", now);
      this.dialogueSynthPlayer.triggerAttackRelease(preset.note2, "32n", now + preset.delay);
    });
  }

  public playErrorTick() {
    const preset = SFX_PRESETS.interface.error_tick;
    this.helper.execute("error_tick", 30, undefined, undefined, (now) => {
      this.dialogueSynthBoss.triggerAttackRelease(preset.note1, "16n", now);
      this.dialogueSynthBoss.triggerAttackRelease(preset.note2, "16n", now + preset.delay);
    });
  }

  public playMenuConfirm() {
    const preset = SFX_PRESETS.interface.menu_confirm;
    this.helper.execute("menu_confirm", 80, undefined, undefined, (now) => {
      this.menuSynth.triggerAttackRelease(preset.startFreq, "16n", now);
      this.menuSynth.frequency.setValueAtTime(preset.startFreq, now);
      this.menuSynth.frequency.rampTo(preset.targetFreq, preset.duration, now);
    });
  }

  public playMenuBack() {
    const preset = SFX_PRESETS.interface.menu_back;
    this.helper.execute("menu_back", 80, undefined, undefined, (now) => {
      this.menuSynth.triggerAttackRelease(preset.startFreq, "16n", now);
      this.menuSynth.frequency.setValueAtTime(preset.startFreq, now);
      this.menuSynth.frequency.rampTo(preset.targetFreq, preset.duration, now);
    });
  }

  public playDialogueTick(speaker: "player" | "boss", char: string) {
    if (!char) return;
    this.helper.execute("dialogue_tick", 35, undefined, undefined, (now) => {
      if (speaker === "player") {
        const freq = 240 + (char.charCodeAt(0) % 6) * 35;
        this.dialogueSynthPlayer.triggerAttackRelease(freq, "32n", now);
      } else {
        const freq = 70 + (char.charCodeAt(0) % 5) * 12;
        this.dialogueSynthBoss.triggerAttackRelease(freq, "24n", now);
      }
    });
  }
}
`,"src/core/audio/sfx/PlayerSFX.ts":`import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";
import { SFXHelper } from "./SFXHelper";
import { SFX_PRESETS } from "../sfxPresetData";

export class PlayerSFX {
  private helper: SFXHelper;
  private playerPanner!: Tone.Panner;
  private hurtPanner!: Tone.Panner;

  private jumpSynth!: Tone.Synth;
  private slashSynth!: Tone.Synth;
  private pogoSynth!: Tone.Synth;
  private dashNoise!: Tone.Noise;
  private dashFilter!: Tone.Filter;
  private dashEnv!: Tone.AmplitudeEnvelope;
  private hurtSynth!: Tone.Synth;

  private landingNoise!: Tone.Noise;
  private landingFilter!: Tone.Filter;
  private landingEnv!: Tone.AmplitudeEnvelope;

  private slashNoiseSide!: Tone.Noise;
  private slashFilterSide!: Tone.Filter;
  private slashFilter2Side!: Tone.Filter;
  private slashEnvSide!: Tone.AmplitudeEnvelope;

  private slashNoisePuff!: Tone.Noise;
  private slashFilterPuff!: Tone.Filter;
  private slashEnvPuff!: Tone.AmplitudeEnvelope;

  constructor(ctxManager: AudioContextManager, helper: SFXHelper) {
    this.helper = helper;
    ctxManager.registerOnInit(() => this.init(ctxManager));
  }

  private init(ctxManager: AudioContextManager) {
    const sfxGain = ctxManager.sfxGain;

    this.playerPanner = new Tone.Panner(0).connect(sfxGain);
    this.hurtPanner = new Tone.Panner(0).connect(sfxGain);

    const presets = SFX_PRESETS.player;

    this.jumpSynth = new Tone.Synth({
      oscillator: { type: presets.jump.oscillatorType },
      envelope: { attack: 0.01, decay: presets.jump.decay, sustain: 0, release: presets.jump.decay },
    }).connect(this.playerPanner);

    this.slashSynth = new Tone.Synth({
      oscillator: { type: presets.fireball_lvl1.oscillatorType },
      envelope: { attack: 0.01, decay: presets.fireball_lvl1.decay, sustain: 0, release: presets.fireball_lvl1.decay },
    }).connect(this.playerPanner);

    this.pogoSynth = new Tone.Synth({
      oscillator: { type: presets.pogo.oscillatorType },
      envelope: { attack: 0.01, decay: presets.pogo.decay, sustain: 0, release: presets.pogo.decay },
    }).connect(this.playerPanner);

    this.dashNoise = new Tone.Noise("white");
    this.dashFilter = new Tone.Filter({ frequency: presets.dash.noiseFreq, type: "bandpass", Q: presets.dash.noiseQ });
    this.dashEnv = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: presets.dash.noiseDecay,
      sustain: 0,
      release: presets.dash.noiseDecay,
    });
    this.dashNoise.chain(this.dashFilter, this.dashEnv, this.playerPanner);
    this.dashNoise.start();

    this.hurtSynth = new Tone.Synth({
      oscillator: { type: presets.hurt.oscillatorType },
      envelope: { attack: 0.01, decay: presets.hurt.decay, sustain: 0, release: presets.hurt.decay },
    }).connect(this.hurtPanner);

    this.landingNoise = new Tone.Noise("white");
    this.landingFilter = new Tone.Filter({
      frequency: presets.landing.noiseFreq,
      type: "bandpass",
      Q: presets.landing.noiseQ,
    });
    this.landingEnv = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: presets.landing.noiseDecay,
      sustain: 0,
      release: presets.landing.noiseDecay,
    });
    this.landingNoise.chain(this.landingFilter, this.landingEnv, this.playerPanner);
    this.landingNoise.start();

    this.slashNoiseSide = new Tone.Noise("white");
    this.slashFilterSide = new Tone.Filter({ frequency: presets.slash_side.noiseFreq, type: "highpass" });
    this.slashFilter2Side = new Tone.Filter({ frequency: 1600, type: "bandpass", Q: 1.0 });
    this.slashEnvSide = new Tone.AmplitudeEnvelope({
      attack: 0.005,
      decay: presets.slash_side.noiseDecay,
      sustain: 0,
      release: presets.slash_side.noiseDecay,
    });
    this.slashNoiseSide.chain(this.slashFilterSide, this.slashFilter2Side, this.slashEnvSide, this.playerPanner);
    this.slashNoiseSide.start();

    this.slashNoisePuff = new Tone.Noise("pink");
    this.slashFilterPuff = new Tone.Filter({
      frequency: presets.slash_puff.noiseFreq,
      type: "bandpass",
      Q: presets.slash_puff.noiseQ,
    });
    this.slashEnvPuff = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: presets.slash_puff.noiseDecay,
      sustain: 0,
      release: presets.slash_puff.noiseDecay,
    });
    this.slashNoisePuff.chain(this.slashFilterPuff, this.slashEnvPuff, this.playerPanner);
    this.slashNoisePuff.start();
  }

  public playDashRecharge(x?: number) {
    const preset = SFX_PRESETS.player.dash_recharge;
    this.helper.execute("dash_recharge", 150, x, this.playerPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(preset.lowNote, "16n", now);
      this.jumpSynth.triggerAttackRelease(preset.highNote, "16n", now + 0.04);
    });
  }

  public playHealCancel(x?: number) {
    const preset = SFX_PRESETS.player.heal_cancel;
    this.helper.execute("heal_cancel", 0, x, this.playerPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "8n", now);
    });
  }

  public playPlayerExplosion(x?: number) {
    this.helper.execute("player_explosion", 0, x, this.playerPanner, (now) => {
      for (let i = 0; i < 3; i++) {
        const delay = i * 0.25;
        this.hurtSynth.triggerAttackRelease(180 - i * 30, "4n", now + delay);
        this.hurtSynth.frequency.rampTo(40, 0.35, now + delay);
      }
    });
  }

  public playLanding(x?: number) {
    const preset = SFX_PRESETS.player.landing;
    this.helper.execute("landing", 100, x, this.playerPanner, (now) => {
      this.pogoSynth.triggerAttackRelease(preset.synthFreq, "8n", now);
      this.pogoSynth.frequency.rampTo(preset.synthTargetFreq, preset.synthDuration, now);
      this.landingEnv.triggerAttackRelease(preset.noiseDecay, now);
    });
  }

  public playFireballLvl1(x?: number) {
    const preset = SFX_PRESETS.player.fireball_lvl1;
    this.helper.execute("fireball_lvl1", 0, x, this.playerPanner, (now) => {
      this.slashSynth.triggerAttackRelease(preset.frequency, "8n", now);
      this.slashSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playFireballLvl2(x?: number) {
    const preset = SFX_PRESETS.player.fireball_lvl2;
    this.helper.execute("fireball_lvl2", 0, x, this.playerPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "4n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playJump(x?: number) {
    const preset = SFX_PRESETS.player.jump;
    this.helper.execute("jump", 100, x, this.playerPanner, (now) => {
      this.jumpSynth.triggerAttackRelease(preset.frequency, "8n", now);
      this.jumpSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playDash(x?: number) {
    const preset = SFX_PRESETS.player.dash;
    this.helper.execute("dash", 100, x, this.playerPanner, (now) => {
      this.dashEnv.triggerAttackRelease(preset.noiseDecay, now);
      this.dashFilter.frequency.setValueAtTime(preset.noiseFreq, now);
      this.dashFilter.frequency.rampTo(preset.noiseTargetFreq, preset.noiseDuration, now);
    });
  }

  public playSlash(direction: "side" | "up" | "down" = "side", x?: number) {
    if (direction === "side") {
      const preset = SFX_PRESETS.player.slash_side;
      this.helper.execute("slash_side", 80, x, this.playerPanner, (now) => {
        this.slashFilterSide.frequency.rampTo(preset.noiseTargetFreq, preset.noiseDuration, now);
        this.slashEnvSide.triggerAttackRelease(preset.noiseDecay, now);
      });
    } else {
      const preset = SFX_PRESETS.player.slash_puff;
      this.helper.execute("slash_puff", 100, x, this.playerPanner, (now) => {
        this.pogoSynth.triggerAttackRelease(preset.synthFreq, "8n", now);
        this.pogoSynth.frequency.rampTo(preset.synthTargetFreq, preset.synthDuration, now);
        this.slashEnvPuff.triggerAttackRelease(preset.noiseDecay, now);
      });
    }
  }

  public playPogo(x?: number) {
    const preset = SFX_PRESETS.player.pogo;
    this.helper.execute("pogo", 80, x, this.playerPanner, (now) => {
      this.pogoSynth.triggerAttackRelease(preset.frequency, "16n", now);
      this.pogoSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }

  public playHurt(x?: number) {
    const preset = SFX_PRESETS.player.hurt;
    this.helper.execute("hurt", 120, x, this.hurtPanner, (now) => {
      this.hurtSynth.triggerAttackRelease(preset.frequency, "8n", now);
      this.hurtSynth.frequency.rampTo(preset.targetFrequency, preset.rampDuration, now);
    });
  }
}
`,"src/core/audio/sfx/SFXHelper.ts":`import * as Tone from "tone";
import { AudioContextManager } from "../AudioContextManager";

export class SFXHelper {
  private lastTriggerTimes: Record<string, number> = {};

  constructor(private ctxManager: AudioContextManager) {}

  public execute(
    key: string,
    throttleMs: number,
    x: number | undefined,
    panner: Tone.Panner | undefined,
    callback: (now: number) => void
  ): void {
    try {
      if (!this.ctxManager.initialized) return;
      if (!this.checkThrottle(key, throttleMs)) return;

      const now = Tone.now();
      if (x !== undefined && panner) {
        panner.pan.setValueAtTime(this.ctxManager.getPanFromX(x), now);
      }

      callback(now);
    } catch {
      // Safe global exception boundary
    }
  }

  private checkThrottle(key: string, limitMs: number): boolean {
    const now = performance.now();
    const last = this.lastTriggerTimes[key] || 0;
    if (now - last < limitMs) {
      return false;
    }
    this.lastTriggerTimes[key] = now;
    return true;
  }
}
`,"src/core/audio/sfxPresetData.ts":`export type BasicOscillatorType = "sine" | "sawtooth" | "triangle" | "square";

export interface SFXPreset {
  frequency: number;
  targetFrequency?: number;
  rampDuration?: number;
  decay: number;
  sustain?: number;
  release?: number;
  oscillatorType: BasicOscillatorType;
  filterType?: "lowpass" | "highpass" | "bandpass";
  filterFrequency?: number;
  filterTargetFrequency?: number;
  filterQ?: number;
  noiseType?: "white" | "pink" | "brown";
}

export const SFX_PRESETS = {
  player: {
    jump: {
      frequency: 240,
      targetFrequency: 580,
      rampDuration: 0.12,
      decay: 0.12,
      oscillatorType: "sine" as BasicOscillatorType,
    },
    dash_recharge: {
      lowNote: "A5",
      highNote: "E6",
      decay: 0.06,
    },
    heal_cancel: {
      frequency: 180,
      decay: 0.12,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    pogo: {
      frequency: 320,
      targetFrequency: 140,
      rampDuration: 0.09,
      decay: 0.1,
      oscillatorType: "sine" as BasicOscillatorType,
    },
    hurt: {
      frequency: 180,
      targetFrequency: 45,
      rampDuration: 0.16,
      decay: 0.16,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    fireball_lvl1: {
      frequency: 440,
      targetFrequency: 160,
      rampDuration: 0.15,
      decay: 0.12,
      oscillatorType: "triangle" as BasicOscillatorType,
    },
    fireball_lvl2: {
      frequency: 220,
      targetFrequency: 80,
      rampDuration: 0.25,
      decay: 0.25,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    landing: {
      synthFreq: 160,
      synthTargetFreq: 65,
      synthDuration: 0.11,
      noiseFreq: 1100,
      noiseDecay: 0.08,
      noiseQ: 2.0,
    },
    dash: {
      noiseFreq: 1400,
      noiseTargetFreq: 500,
      noiseDuration: 0.18,
      noiseDecay: 0.18,
      noiseQ: 2.5,
    },
    slash_side: {
      noiseFreq: 2200,
      noiseTargetFreq: 1000,
      noiseDuration: 0.14,
      noiseDecay: 0.15,
    },
    slash_puff: {
      synthFreq: 220,
      synthTargetFreq: 90,
      synthDuration: 0.15,
      noiseFreq: 650,
      noiseDecay: 0.18,
      noiseQ: 1.2,
    },
  },
  boss: {
    telegraph: {
      frequency: 320,
      targetFrequency: 680,
      rampDuration: 0.35,
      decay: 0.12,
      oscillatorType: "sine" as BasicOscillatorType,
    },
    lunge: {
      frequency: 120,
      targetFrequency: 40,
      rampDuration: 0.45,
      decay: 0.5,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    swipe: {
      frequency: 180,
      targetFrequency: 50,
      rampDuration: 0.22,
      decay: 0.16,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    minion_spawn: {
      frequency: 180,
      targetFrequency: 720,
      rampDuration: 0.3,
      decay: 0.3,
      oscillatorType: "triangle" as BasicOscillatorType,
    },
    minion_deconstruct: {
      frequency: 280,
      targetFrequency: 60,
      rampDuration: 0.28,
      decay: 0.28,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    phase_shift: {
      frequency: 80,
      targetFrequency: 320,
      rampDuration: 0.8,
      decay: 0.8,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    spike_strike: {
      frequency: 1400,
      targetFrequency: 700,
      rampDuration: 0.12,
      decay: 0.12,
      oscillatorType: "square" as BasicOscillatorType,
    },
    hit_confirm: {
      metalNote: "C6",
      synthFreq: 880,
      synthDelay: 0.04,
    },
  },
  interface: {
    select_tick: {
      note1: 950,
      note2: 1400,
      delay: 0.025,
    },
    error_tick: {
      note1: 260,
      note2: 160,
      delay: 0.05,
    },
    menu_confirm: {
      startFreq: 440,
      targetFreq: 880,
      duration: 0.12,
    },
    menu_back: {
      startFreq: 587,
      targetFreq: 293,
      duration: 0.12,
    },
  },
};
`,"src/core/eventBroker.ts":`export type GameEventMap = {
  PLAYER_HURT: { amount: number; currentHealth: number; maxHealth: number };
  BOSS_HURT: { amount: number; currentHealth: number; maxHealth: number };
  MINION_HURT: { id: string; amount: number; currentHealth: number; maxHealth: number };
  PLAYER_HEALED: { amount: number; currentHealth: number; maxHealth: number };
  PLAYER_JUMPED: void;
  PLAYER_DASHED: { direction: number };
  PLAYER_POGOED: void;
  PLAYER_ATTACKED: { direction: "side" | "up" | "down" };
  PLAYER_PROJECTILE_FIRED: { level: 1 | 2 };
  HEALING_CHARGES_CHANGED: { charges: number };
  DETERMINATION_CHANGED: { determination: number };
  DIALOGUE_TRIGGERED: { speaker: "player" | "boss"; text: string };
  CAMERA_SHAKE: { amplitude: number; duration: number };
  HIT_STOP: { duration: number };
  BOSS_DEFEATED: { x: number; y: number };
  GAME_OVER: void;
  VICTORY: void;
  CLEAR_DIALOGUES: void;
  SPAWN_SPARKS: { x: number; y: number; angle: number; color?: string; radial?: boolean; count?: number };
  SPAWN_DUST: { x: number; y: number };
  SPAWN_BLAST: { x: number; y: number; color: string };
  PLAYER_LANDED: void;
  HEAL_START: void;
  HEAL_CANCEL: void;
  HEAL_COMPLETE: void;
  PLAYER_SPIKED: void;
  BOSS_PHASE_SHIFT: void;
  MINION_SPAWNING: void;
  MINION_DISSOLVING: void;
  PLAYER_DASH_RECHARGED: void;
  BOSS_SWIPED: void;
  BOSS_TELEGRAPH: void;
  BOSS_LUNGED: void;
  CHARGE_START: void;
  CHARGE_UPDATE: { timer: number };
  CHARGE_STOP: void;
};

export type EventCallback<T> = (payload: T) => void;

class EventBroker {
  private listeners: { [K in keyof GameEventMap]?: Set<EventCallback<any>> } = {};

  public subscribe<K extends keyof GameEventMap>(event: K, callback: EventCallback<GameEventMap[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    const set = this.listeners[event]!;
    set.add(callback);
    return () => {
      this.listeners[event]?.delete(callback);
    };
  }

  public publish<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const set = this.listeners[event];
    if (set) {
      set.forEach((cb) => cb(payload));
    }
  }

  public clear(): void {
    this.listeners = {};
  }
}

export const eventBroker = new EventBroker();
`,"src/core/levelData.ts":`import { Rectangle } from "@/core/Interfaces";
import { MinionType } from "@/entities/Minion";

export interface SpawnerConfig {
  type: MinionType;
  x: number;
  y: number;
}

export interface LevelConfig {
  solids: Rectangle[];
  onewayPlatforms: Rectangle[];
  hazards: Rectangle[];
  spawners: SpawnerConfig[];
  playerStart: { x: number; y: number };
  bossStart: { x: number; y: number };
}

export const defaultLevelConfig: LevelConfig = {
  solids: [
    { x: 0, y: 1150, width: 400, height: 100 },
    { x: 850, y: 1150, width: 400, height: 100 },
    { x: 400, y: 1200, width: 450, height: 50 },
    { x: 0, y: 0, width: 1250, height: 50 },
    { x: 0, y: 0, width: 50, height: 1250 },
    { x: 1200, y: 0, width: 50, height: 1250 },
    { x: 425, y: 800, width: 400, height: 40 },
  ],
  onewayPlatforms: [
    { x: 50, y: 550, width: 300, height: 20 },
    { x: 900, y: 550, width: 300, height: 20 },
  ],
  hazards: [{ x: 400, y: 1150, width: 450, height: 100 }],
  spawners: [
    { type: "TURRET", x: 175, y: 490 },
    { type: "TURRET", x: 1075, y: 490 },
    { type: "LANCER", x: 625, y: 740 },
    { type: "FLYER", x: 625, y: 400 },
  ],
  playerStart: { x: 150, y: 1000 },
  bossStart: { x: 1050, y: 1000 },
};

export class LevelLoader {
  public static parse(jsonString: string): LevelConfig {
    try {
      const parsed = JSON.parse(jsonString);
      if (
        parsed &&
        Array.isArray(parsed.solids) &&
        Array.isArray(parsed.onewayPlatforms) &&
        Array.isArray(parsed.hazards) &&
        Array.isArray(parsed.spawners) &&
        parsed.playerStart &&
        parsed.bossStart
      ) {
        return parsed as LevelConfig;
      }
    } catch (e) {
      console.error("Failed to parse dynamic LevelConfig:", e);
    }
    return defaultLevelConfig;
  }

  public static stringify(config: LevelConfig): string {
    return JSON.stringify(config, null, 2);
  }
}
`,"src/core/schemas.ts":`import { Action } from "@/core/InputProvider";

export interface ValidatedSaveSlot {
  wins: number;
  losses: number;
  empty: boolean;
}

export interface ValidatedAudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  masterMuted: boolean;
  sfxMuted: boolean;
  musicMuted: boolean;
}

export interface ValidatedKeyMap {
  MOVE_LEFT: string[];
  MOVE_RIGHT: string[];
  MOVE_UP: string[];
  MOVE_DOWN: string[];
  JUMP: string[];
  ATTACK: string[];
  DASH: string[];
}

export class ConfigurationValidator {
  private static readonly REQUIRED_ACTIONS: Action[] = [
    "MOVE_LEFT",
    "MOVE_RIGHT",
    "MOVE_UP",
    "MOVE_DOWN",
    "JUMP",
    "ATTACK",
    "DASH",
  ];

  public static validateSaveSlot(data: unknown): ValidatedSaveSlot {
    if (!data || typeof data !== "object") {
      return { wins: 0, losses: 0, empty: true };
    }

    const obj = data as Record<string, unknown>;

    return {
      wins: typeof obj.wins === "number" && obj.wins >= 0 ? obj.wins : 0,
      losses: typeof obj.losses === "number" && obj.losses >= 0 ? obj.losses : 0,
      empty: typeof obj.empty === "boolean" ? obj.empty : true,
    };
  }

  public static validateAudioSettings(data: unknown, fallback: ValidatedAudioSettings): ValidatedAudioSettings {
    if (!data || typeof data !== "object") {
      return fallback;
    }

    const obj = data as Record<string, unknown>;

    const checkVolume = (val: unknown, def: number) => {
      return typeof val === "number" && val >= 0 && val <= 1 ? val : def;
    };

    const checkMute = (val: unknown, def: boolean) => {
      return typeof val === "boolean" ? val : def;
    };

    return {
      masterVolume: checkVolume(obj.masterVolume, fallback.masterVolume),
      sfxVolume: checkVolume(obj.sfxVolume, fallback.sfxVolume),
      musicVolume: checkVolume(obj.musicVolume, fallback.musicVolume),
      masterMuted: checkMute(obj.masterMuted, fallback.masterMuted),
      sfxMuted: checkMute(obj.sfxMuted, fallback.sfxMuted),
      musicMuted: checkMute(obj.musicMuted, fallback.musicMuted),
    };
  }

  public static validateKeyMap(data: unknown, fallback: ValidatedKeyMap): ValidatedKeyMap {
    if (!data || typeof data !== "object") {
      return fallback;
    }

    const obj = data as Record<string, unknown>;
    const validatedMap = {} as ValidatedKeyMap;

    for (const action of this.REQUIRED_ACTIONS) {
      const keys = obj[action];
      if (Array.isArray(keys) && keys.length > 0 && keys.every((k) => typeof k === "string")) {
        validatedMap[action] = [...keys] as string[];
      } else {
        validatedMap[action] = [...fallback[action]];
      }
    }

    return validatedMap;
  }
}
`,"src/core/screenRoutes.ts":`import { ScreenState } from "@/store/useGameStore";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager, AudioSettings } from "@/core/SettingsManager";

export interface MenuContext {
  navTo: (screen: ScreenState) => void;
  menuIndex: number;
  setMenuIndex: (index: number) => void;
  reloadSaveSlots: () => void;
  resetGameSession: () => void;
  handleSlotAction: (index: number, onPlay: () => void) => void;
  toggleCopyMode: () => void;
  toggleEraseMode: () => void;
  resetActions: () => void;
  audio: AudioSettings;
  handleVolumeChange: (field: keyof AudioSettings, value: number | boolean) => void;
  resetSettings?: () => void;
  setRebindTarget: (target: { action: Action; index: number } | null) => void;
  gameResult: string;
}

export interface ScreenConfig {
  getMaxIndex(context: MenuContext): number;
  onSelect(context: MenuContext): void;
  onBack?(context: MenuContext): void;
  onHorizontal?(direction: number, context: MenuContext): void;
}

export const screenConfigs: Record<string, ScreenConfig> = {
  TITLE: {
    getMaxIndex: () => 3,
    onSelect: ({ menuIndex, navTo, reloadSaveSlots }) => {
      if (menuIndex === 0) {
        reloadSaveSlots();
        navTo("SAVE_SELECT");
      } else if (menuIndex === 1) {
        navTo("OPTIONS");
      } else if (menuIndex === 2) {
        navTo("CREDITS");
      } else if (menuIndex === 3) {
        navTo("SOURCE_VIEW");
      }
    },
  },
  PLAYING: {
    getMaxIndex: ({ gameResult }) => (gameResult !== "PLAYING" ? 1 : 0),
    onSelect: ({ menuIndex, gameResult, resetGameSession, navTo }) => {
      if (gameResult !== "PLAYING") {
        if (menuIndex === 0) {
          resetGameSession();
          navTo("PLAYING");
        } else {
          navTo("TITLE");
        }
      }
    },
  },
  SAVE_SELECT: {
    getMaxIndex: () => 5,
    onSelect: ({
      menuIndex,
      handleSlotAction,
      navTo,
      resetGameSession,
      toggleCopyMode,
      toggleEraseMode,
      resetActions,
    }) => {
      if (menuIndex >= 0 && menuIndex <= 2) {
        handleSlotAction(menuIndex, () => {
          resetGameSession();
          navTo("PLAYING");
        });
      } else if (menuIndex === 3) {
        toggleCopyMode();
      } else if (menuIndex === 4) {
        toggleEraseMode();
      } else if (menuIndex === 5) {
        resetActions();
        navTo("TITLE");
      }
    },
    onBack: ({ resetActions, navTo }) => {
      resetActions();
      navTo("TITLE");
    },
  },
  OPTIONS: {
    getMaxIndex: () => 2,
    onSelect: ({ menuIndex, navTo, setMenuIndex }) => {
      if (menuIndex === 0) {
        navTo("SOUND");
      } else if (menuIndex === 1) {
        navTo("CONTROLS");
      } else if (menuIndex === 2) {
        navTo("TITLE");
        setMenuIndex(1);
      }
    },
    onBack: ({ resetActions, navTo }) => {
      resetActions();
      navTo("TITLE");
    },
  },
  SOUND: {
    getMaxIndex: () => 4,
    onSelect: ({ menuIndex, navTo, resetSettings }) => {
      if (menuIndex === 3) {
        resetSettings?.();
      } else if (menuIndex === 4) {
        navTo("OPTIONS");
      }
    },
    onHorizontal: (direction, { menuIndex, audio, handleVolumeChange }) => {
      const delta = direction * 0.05;
      if (menuIndex === 0 && !audio.masterMuted) {
        handleVolumeChange("masterVolume", Math.max(0, Math.min(1, audio.masterVolume + delta)));
        soundSynth.playSelectTick();
      } else if (menuIndex === 1 && !audio.sfxMuted) {
        handleVolumeChange("sfxVolume", Math.max(0, Math.min(1, audio.sfxVolume + delta)));
        soundSynth.playSelectTick();
      } else if (menuIndex === 2 && !audio.musicMuted) {
        handleVolumeChange("musicVolume", Math.max(0, Math.min(1, audio.musicVolume + delta)));
        soundSynth.playSelectTick();
      }
    },
    onBack: ({ navTo }) => {
      navTo("OPTIONS");
    },
  },
  CONTROLS: {
    getMaxIndex: () => {
      const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
      return isTouch ? 0 : 10;
    },
    onSelect: ({ menuIndex, navTo, setMenuIndex, setRebindTarget, reloadSaveSlots }) => {
      const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
      if (isTouch) {
        navTo("OPTIONS");
        setMenuIndex(1);
        return;
      }
      if (menuIndex === 0) {
        settingsManager.setPreset("DEFAULT_1");
        soundSynth.playHitConfirm();
        reloadSaveSlots();
      } else if (menuIndex === 1) {
        settingsManager.setPreset("DEFAULT_2");
        soundSynth.playHitConfirm();
        reloadSaveSlots();
      } else if (menuIndex === 2) {
        settingsManager.setPreset("CUSTOM");
        soundSynth.playHitConfirm();
        reloadSaveSlots();
      } else if (menuIndex === 10) {
        navTo("OPTIONS");
        setMenuIndex(1);
      } else {
        const actionIndex = menuIndex - 3;
        const action = (Object.keys(settingsManager.getKeyMap()) as Action[])[actionIndex];
        soundSynth.playHitConfirm();
        setRebindTarget({ action, index: 0 });
      }
    },
    onBack: ({ navTo }) => {
      navTo("OPTIONS");
    },
  },
  CREDITS: {
    getMaxIndex: () => 0,
    onSelect: ({ navTo }) => {
      navTo("TITLE");
    },
    onBack: ({ navTo }) => {
      navTo("TITLE");
    },
  },
};
`,"src/entities/BaseEntity.ts":`import { IEntityComponent } from "./EntityComponent";
import { IEntity, IWorld, Vector2D, EntityStatus } from "@/core/Interfaces";

export class BaseEntity implements IEntity {
  public position: Vector2D = { x: 0, y: 0 };
  public previousPosition: Vector2D = { x: 0, y: 0 };
  public velocity: Vector2D = { x: 0, y: 0 };
  public size = { width: 50, height: 50 };
  public id: string;
  public isDead: boolean = false;
  public world: IWorld;

  public visualScale = { x: 1, y: 1 };
  public targetVisualScale = { x: 1, y: 1 };
  public squashPivot: "center" | "feet" = "center";

  public startDeathSequence?(): void;
  public registerDamageDealt?(): void;

  private components = new Map<any, IEntityComponent>();

  constructor(id: string, world: IWorld) {
    this.id = id;
    this.world = world;
  }

  public get status(): EntityStatus {
    return this.isDead ? EntityStatus.DEAD : EntityStatus.ACTIVE;
  }

  public addComponent<T extends IEntityComponent>(
    componentClass: new (...args: any[]) => T,
    component: T,
    dependencies?: any
  ): T {
    component.setup(this, dependencies);
    this.components.set(componentClass, component);
    return component;
  }

  public getComponent<T extends IEntityComponent>(componentClass: new (...args: any[]) => T): T | null {
    const component = this.components.get(componentClass);
    return (component as T) || null;
  }

  public update(dt: number) {
    if (this.isDead) return;

    this.visualScale.x += (this.targetVisualScale.x - this.visualScale.x) * 12 * dt;
    this.visualScale.y += (this.targetVisualScale.y - this.visualScale.y) * 12 * dt;

    for (const component of this.components.values()) {
      if (component.update) {
        component.update(dt);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (this.isDead) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
    const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;

    if (this.squashPivot === "feet") {
      const feetY = drawY + this.size.height / 2;
      ctx.fillRect(drawX - vWidth / 2, feetY - vHeight, vWidth, vHeight);
    } else {
      ctx.fillRect(drawX - vWidth / 2, drawY - vHeight / 2, vWidth, vHeight);
    }
    ctx.restore();
  }

  public teardown() {
    for (const component of this.components.values()) {
      if (component.teardown) {
        component.teardown();
      }
    }
    this.components.clear();
  }
}
`,"src/entities/Boss.ts":`import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld } from "@/core/Interfaces";
import { StateMachine } from "@/core/StateMachine";
import { eventBroker } from "@/core/eventBroker";
import {
  BossCooldownState,
  BossPatrolState,
  BossMeleeState,
  BossAttackState,
  BossTelegraphState,
  BossLungeState,
  BossDeadState,
} from "./BossStates";

export class Boss extends BaseEntity {
  public health!: HealthComponent;
  public physics!: PhysicsComponent;
  public stateMachine: StateMachine;
  public cooldownState!: BossCooldownState;
  public patrolState!: BossPatrolState;
  public meleeState!: BossMeleeState;
  public attackState!: BossAttackState;
  public telegraphState!: BossTelegraphState;
  public lungeState!: BossLungeState;
  public deadState!: BossDeadState;

  public patrolSpeed: number = 200;
  public lungeSpeed: number = 1200;

  public facingDirection: number = -1;
  public currentPhase: number = 1;

  constructor(id: string, world: IWorld) {
    super(id, world);
    this.size = { width: 60, height: 60 };
    this.squashPivot = "feet";

    this.position = { x: 0, y: 0 };
    this.previousPosition = { x: 0, y: 0 };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 30,
      invincibilityDuration: 0.25,
    });

    this.cooldownState = new BossCooldownState(this);
    this.patrolState = new BossPatrolState(this);
    this.meleeState = new BossMeleeState(this);
    this.attackState = new BossAttackState(this);
    this.telegraphState = new BossTelegraphState(this);
    this.lungeState = new BossLungeState(this);
    this.deadState = new BossDeadState(this);

    this.stateMachine = new StateMachine();
    this.stateMachine.changeState(this.cooldownState);
  }

  public update(dt: number) {
    if (this.isDead) {
      if (!(this.stateMachine.getCurrentState() instanceof BossDeadState)) {
        this.stateMachine.changeState(this.deadState);
      }
      super.update(dt);
      return;
    }

    this.evaluatePhaseShifts();
    this.trackPlayer();

    this.stateMachine.update(dt);

    this.checkPlayerContact();
    this.checkHazardContact();

    super.update(dt);
  }

  public get activeStateName(): string {
    const active = this.stateMachine.getCurrentState();
    if (!active) return "UNKNOWN";
    return active.constructor.name.replace("Boss", "").replace("State", "").toUpperCase();
  }

  public fireSingleShotAtPlayer() {
    const player = this.world.player;
    if (!player || player.isDead) return;

    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return;

    const dirX = dx / mag;
    const dirY = dy / mag;

    this.world.spawnProjectile(
      this.position.x + dirX * 40,
      this.position.y + dirY * 40,
      dirX,
      dirY,
      "boss",
      1,
      250,
      10.0
    );
  }

  public fireRadialOmniBurst() {
    const projectileCount = 8;
    const angleStep = (Math.PI * 2) / projectileCount;

    for (let i = 0; i < projectileCount; i++) {
      const angle = i * angleStep;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      this.world.spawnProjectile(
        this.position.x + dirX * 40,
        this.position.y + dirY * 40,
        dirX,
        dirY,
        "boss",
        1,
        280,
        4.0
      );
    }
  }

  private evaluatePhaseShifts() {
    const hpRatio = this.health.currentHealth / this.health.maxHealth;

    if (hpRatio <= 0.4 && this.currentPhase < 3) {
      this.currentPhase = 3;
      this.patrolSpeed = 350;
      this.lungeSpeed = 1400;
    } else if (hpRatio <= 0.7 && this.currentPhase < 2) {
      this.currentPhase = 2;
      this.patrolSpeed = 260;
    }
  }

  private trackPlayer() {
    const player = this.world.player;
    const activeState = this.activeStateName;
    if (player && activeState !== "LUNGE") {
      const dirToPlayer = Math.sign(player.position.x - this.position.x);
      if (dirToPlayer !== 0) {
        this.facingDirection = dirToPlayer;
      }
    }
  }

  private checkPlayerContact() {
    const player = this.world.player;
    const activeState = this.activeStateName;
    if (!player || player.isDead) return;

    const playerHalfW = player.size.width / 2;
    const playerHalfH = player.size.height / 2;
    const bossHalfW = this.size.width / 2;
    const bossHalfH = this.size.height / 2;

    const isColliding =
      this.position.x + bossHalfW > player.position.x - playerHalfW &&
      this.position.x - bossHalfW < player.position.x + playerHalfW &&
      this.position.y + bossHalfH > player.position.y - playerHalfH &&
      this.position.y - bossHalfH < player.position.y + playerHalfH;

    if (isColliding) {
      const playerHealth = player.getComponent(HealthComponent);
      if (playerHealth) {
        const damageAmount = activeState === "LUNGE" || activeState === "MELEE" ? 2 : 1;
        const damaged = playerHealth.takeDamage(damageAmount);

        if (damaged) {
          const knockbackDir = Math.sign(player.position.x - this.position.x);
          player.velocity.x = (knockbackDir !== 0 ? knockbackDir : 1) * 500;
          player.velocity.y = -400;
        }
      }
    }
  }

  private checkHazardContact() {
    if (this.health.isInvincible() || this.isDead) return;

    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;

    for (const hazard of this.world.physicsWorld.hazards) {
      const isHit =
        this.position.x + halfW > hazard.x &&
        this.position.x - halfW < hazard.x + hazard.width &&
        this.position.y + halfH > hazard.y &&
        this.position.y - halfH < hazard.y + hazard.height;

      if (isHit) {
        eventBroker.publish("PLAYER_SPIKED", undefined);
        const damaged = this.health.takeDamage(1);
        if (damaged && !this.isDead) {
          this.velocity.y = -550;
          this.physics.isGrounded = false;
        }
        break;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (this.isDead) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
    const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

    const activeState = this.activeStateName;

    ctx.save();
    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else if (activeState === "TELEGRAPH") {
      ctx.fillStyle = "hsl(45, 100%, 50%)";
      ctx.shadowColor = "rgba(234, 179, 8, 0.8)";
      ctx.shadowBlur = 20;
    } else {
      ctx.fillStyle = "hsl(350, 80%, 60%)";
      if (this.currentPhase === 3) {
        ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
        ctx.shadowBlur = 25;
      }
    }

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;
    const feetY = drawY + this.size.height / 2;

    ctx.fillRect(drawX - vWidth / 2, feetY - vHeight, vWidth, vHeight);

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
`,"src/entities/BossStates.ts":`import { IState } from "@/core/StateMachine";
import { Boss } from "./Boss";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { eventBroker } from "@/core/eventBroker";

export abstract class BossState implements IState {
  protected owner: Boss;

  constructor(owner: Boss) {
    this.owner = owner;
  }

  public abstract enter(): void;
  public abstract update(dt: number): void;
  public abstract exit(): void;
}

export class BossCooldownState extends BossState {
  private duration: number = 2.0;
  private overrideDuration: number = -1;

  constructor(owner: Boss) {
    super(owner);
  }

  public setDuration(customDuration: number) {
    this.overrideDuration = customDuration;
  }

  public enter(): void {
    this.owner.velocity.x = 0;
    if (this.overrideDuration > 0) {
      this.duration = this.overrideDuration;
      this.overrideDuration = -1;
    } else {
      this.duration = this.owner.currentPhase === 3 ? 1.5 : 2.5;
    }
    this.owner.targetVisualScale = { x: 1.0, y: 1.0 };
  }

  public update(dt: number): void {
    this.duration -= dt;
    if (this.duration <= 0) {
      this.owner.stateMachine.changeState(this.owner.patrolState);
    }
  }

  public exit(): void {}
}

export class BossPatrolState extends BossState {
  private duration: number = 2.0;

  public enter(): void {
    this.owner.targetVisualScale = { x: 1.0, y: 1.0 };
    this.duration = this.owner.currentPhase === 3 ? 1.5 : 2.5;
  }

  public update(dt: number): void {
    this.duration -= dt;
    const physics = this.owner.getComponent(PhysicsComponent);

    this.owner.velocity.x = this.owner.facingDirection * this.owner.patrolSpeed;

    if (physics) {
      if (physics.isOnWallLeft) {
        this.owner.facingDirection = 1;
      } else if (physics.isOnWallRight) {
        this.owner.facingDirection = -1;
      }
    }

    const player = this.owner.world.player;
    if (player && !player.isDead) {
      const distance = Math.abs(player.position.x - this.owner.position.x);
      const distanceY = Math.abs(player.position.y - this.owner.position.y);
      if (distance < 120 && distanceY < 60) {
        this.owner.stateMachine.changeState(this.owner.telegraphState);
        return;
      }
    }

    if (this.duration <= 0) {
      this.owner.stateMachine.changeState(this.owner.attackState);
    }
  }

  public exit(): void {
    this.owner.velocity.x = 0;
  }
}

export class BossMeleeState extends BossState {
  private duration: number = 0.5;

  public enter(): void {
    this.owner.velocity.x = 0;
    this.duration = 0.5;
    eventBroker.publish("BOSS_SWIPED", undefined);
  }

  public update(dt: number): void {
    this.duration -= dt;
    if (this.duration <= 0) {
      this.owner.cooldownState.setDuration(1.0);
      this.owner.stateMachine.changeState(this.owner.cooldownState);
    }
  }

  public exit(): void {}
}

export class BossAttackState extends BossState {
  private attackType: "SINGLE_SHOT" | "VOLLEY" | "OMNI_BURST" = "SINGLE_SHOT";
  private durationTimer: number = 0;
  private volleyCount: number = 0;
  private volleyTimer: number = 0;

  public enter(): void {
    const phase = this.owner.currentPhase;
    this.owner.velocity.x = 0;

    if (phase === 1) {
      if (Math.random() < 0.6) {
        this.attackType = "SINGLE_SHOT";
        this.durationTimer = 0.5;
        this.owner.fireSingleShotAtPlayer();
      } else {
        this.owner.stateMachine.changeState(this.owner.telegraphState);
      }
    } else if (phase === 2) {
      if (Math.random() < 0.5) {
        this.attackType = "VOLLEY";
        this.volleyCount = 3;
        this.volleyTimer = 0;
        this.durationTimer = 1.0;
      } else {
        this.owner.stateMachine.changeState(this.owner.telegraphState);
      }
    } else {
      const r = Math.random();
      if (r < 0.33) {
        this.attackType = "VOLLEY";
        this.volleyCount = 5;
        this.volleyTimer = 0;
        this.durationTimer = 1.2;
      } else if (r < 0.66) {
        this.attackType = "OMNI_BURST";
        this.owner.fireRadialOmniBurst();
        this.durationTimer = 0.8;
      } else {
        this.owner.stateMachine.changeState(this.owner.telegraphState);
      }
    }
  }

  public update(dt: number): void {
    this.durationTimer -= dt;

    if (this.attackType === "VOLLEY" && this.volleyCount > 0) {
      this.volleyTimer -= dt;
      if (this.volleyTimer <= 0) {
        this.owner.fireSingleShotAtPlayer();
        this.volleyCount--;
        this.volleyTimer = 0.2;
      }
    }

    if (this.durationTimer <= 0) {
      let cooldown = 1.5;
      if (this.attackType === "VOLLEY") cooldown = 2.5;
      else if (this.attackType === "OMNI_BURST") cooldown = 3.5;

      this.owner.cooldownState.setDuration(cooldown);
      this.owner.stateMachine.changeState(this.owner.cooldownState);
    }
  }

  public exit(): void {}
}

export class BossTelegraphState extends BossState {
  private duration: number = 0.8;

  public enter(): void {
    this.owner.velocity.x = 0;
    this.duration = this.owner.currentPhase === 3 ? 0.4 : 0.8;
    this.owner.visualScale = { x: 1.25, y: 0.75 };
    this.owner.targetVisualScale = { x: 1.15, y: 0.85 };
    eventBroker.publish("BOSS_TELEGRAPH", undefined);
  }

  public update(dt: number): void {
    this.duration -= dt;
    if (this.duration <= 0) {
      this.owner.stateMachine.changeState(this.owner.lungeState);
    }
  }

  public exit(): void {
    const player = this.owner.world.player;
    if (player) {
      const dir = Math.sign(player.position.x - this.owner.position.x);
      this.owner.facingDirection = dir !== 0 ? dir : this.owner.facingDirection;
    }
  }
}

export class BossLungeState extends BossState {
  private duration: number = 0.5;

  public enter(): void {
    this.duration = 0.5;
    this.owner.visualScale = { x: 1.35, y: 0.65 };
    this.owner.targetVisualScale = { x: 1.2, y: 0.8 };
    eventBroker.publish("BOSS_LUNGED", undefined);
  }

  public update(dt: number): void {
    this.duration -= dt;
    this.owner.velocity.x = this.owner.facingDirection * this.owner.lungeSpeed;

    const physics = this.owner.getComponent(PhysicsComponent);
    const hitWall = physics ? physics.isOnWallLeft || physics.isOnWallRight : false;

    if (this.duration <= 0 || hitWall) {
      this.owner.stateMachine.changeState(this.owner.cooldownState);
    }
  }

  public exit(): void {
    this.owner.velocity.x = 0;
    this.owner.visualScale = { x: 0.8, y: 1.2 };
    this.owner.targetVisualScale = { x: 1.0, y: 1.0 };
  }
}

export class BossDeadState extends BossState {
  public enter(): void {
    this.owner.velocity.x = 0;
    this.owner.velocity.y = 0;
  }

  public update(_dt: number): void {}
  public exit(): void {}
}
`,"src/entities/EntityComponent.ts":`import { BaseEntity } from "./BaseEntity";

export interface IEntityComponent {
  setup(owner: BaseEntity, dependencies?: any): void;
  update?(dt: number): void;
  teardown?(): void;
}
`,"src/entities/Minion.ts":`import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld, EntityStatus } from "@/core/Interfaces";
import { IMinionBehavior, TurretBehavior, LancerBehavior, FlyerBehavior } from "./MinionBehaviors";
import { eventBroker } from "@/core/eventBroker";

export type MinionType = "TURRET" | "LANCER" | "FLYER";

export class Minion extends BaseEntity {
  public get status(): EntityStatus {
    if (this.isDead) return EntityStatus.DEAD;
    if (this.isDying) return EntityStatus.DYING;
    if (this.isSpawning) return EntityStatus.SPAWNING;
    return EntityStatus.ACTIVE;
  }

  public minionType: MinionType;
  public health!: HealthComponent;
  public physics!: PhysicsComponent;
  private behavior: IMinionBehavior;

  public patrolSpeed: number = 100;
  public facingDirection: number = 1;
  public stateTimer: number = 0;

  public pointA: { x: number; y: number } = { x: 0, y: 0 };
  public pointB: { x: number; y: number } = { x: 0, y: 0 };
  public flyerTarget: "A" | "B" = "B";

  public shootTimer: number = 0;
  public attackState: "PATROL" | "TELEGRAPH" | "ATTACK" | "COOLDOWN" = "PATROL";
  public volleyCount: number = 0;
  public volleyTimer: number = 0;

  public isSpawning: boolean = true;
  public spawnTimer: number = 0.6;
  public isDying: boolean = false;
  public dissolveTimer: number = 0.5;

  constructor(id: string, type: MinionType, startPos: { x: number; y: number }, world: IWorld) {
    super(id, world);
    this.minionType = type;
    this.position = { ...startPos };
    this.previousPosition = { ...startPos };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());

    if (type === "TURRET") {
      this.size = { width: 44, height: 44 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 3,
        invincibilityDuration: 0.15,
      });
      this.physics.gravity = 0;
      this.squashPivot = "feet";
      this.behavior = new TurretBehavior();
    } else if (type === "LANCER") {
      this.size = { width: 40, height: 50 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 4,
        invincibilityDuration: 0.15,
      });
      this.squashPivot = "feet";
      this.behavior = new LancerBehavior();
    } else {
      this.size = { width: 36, height: 36 };
      this.health = this.addComponent(HealthComponent, new HealthComponent(), {
        maxHealth: 2,
        invincibilityDuration: 0.15,
      });
      this.physics.gravity = 0;

      this.pointA = { ...startPos };
      this.pointB = { x: startPos.x, y: startPos.y - 180 };
      this.squashPivot = "center";
      this.behavior = new FlyerBehavior();
    }
    eventBroker.publish("MINION_SPAWNING", undefined);
  }

  public startDeathSequence() {
    eventBroker.publish("MINION_DISSOLVING", undefined);
    this.isDying = true;
    this.dissolveTimer = 0.5;
    this.velocity = { x: 0, y: 0 };

    const mColor =
      this.minionType === "LANCER"
        ? "hsl(280, 70%, 65%)"
        : this.minionType === "FLYER"
          ? "hsl(200, 80%, 65%)"
          : "hsl(215, 20%, 65%)";

    eventBroker.publish("SPAWN_SPARKS", {
      x: this.position.x,
      y: this.position.y,
      angle: 0,
      color: mColor,
      radial: true,
      count: 24,
    });

    eventBroker.publish("SPAWN_BLAST", {
      x: this.position.x,
      y: this.position.y,
      color: mColor,
    });
  }

  public update(dt: number) {
    if (this.isDead) return;

    if (this.isSpawning) {
      this.spawnTimer -= dt;
      this.velocity = { x: 0, y: 0 };

      const mColor =
        this.minionType === "LANCER"
          ? "hsl(280, 70%, 65%)"
          : this.minionType === "FLYER"
            ? "hsl(200, 80%, 65%)"
            : "hsl(215, 20%, 65%)";

      if (Math.random() < 0.5) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 30;
        eventBroker.publish("SPAWN_SPARKS", {
          x: this.position.x + Math.cos(angle) * dist,
          y: this.position.y + Math.sin(angle) * dist,
          angle: angle + Math.PI,
          color: mColor,
        });
      }

      if (this.spawnTimer <= 0) {
        this.isSpawning = false;
      }
      super.update(dt);
      return;
    }

    if (this.isDying) {
      this.dissolveTimer -= dt;
      this.velocity = { x: 0, y: 0 };

      const mColor =
        this.minionType === "LANCER"
          ? "hsl(280, 70%, 65%)"
          : this.minionType === "FLYER"
            ? "hsl(200, 80%, 65%)"
            : "hsl(215, 20%, 65%)";

      if (Math.random() < 0.6) {
        eventBroker.publish("SPAWN_SPARKS", {
          x: this.position.x + (Math.random() * this.size.width - this.size.width / 2),
          y: this.position.y + (Math.random() * this.size.height - this.size.height / 2),
          angle: -Math.PI / 2 + (Math.random() * 0.4 - 0.2),
          color: mColor,
        });
      }

      if (this.dissolveTimer <= 0) {
        this.isDead = true;
      }
      super.update(dt);
      return;
    }

    this.stateTimer -= dt;
    this.shootTimer -= dt;

    this.behavior.update(this, dt);

    this.checkHazardContact();

    super.update(dt);
  }

  public fireSingleShotAtPlayer(player: any) {
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return;

    const dirX = dx / mag;
    const dirY = dy / mag;

    this.world.spawnProjectile(
      this.position.x + dirX * 30,
      this.position.y + dirY * 30,
      dirX,
      dirY,
      "boss",
      1,
      400,
      5.0
    );
  }

  private checkHazardContact() {
    if (this.health.isInvincible() || this.isDead || this.isSpawning || this.isDying) return;

    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;

    for (const hazard of this.world.physicsWorld.hazards) {
      const isHit =
        this.position.x + halfW > hazard.x &&
        this.position.x - halfW < hazard.x + hazard.width &&
        this.position.y + halfH > hazard.y &&
        this.position.y - halfH < hazard.y + hazard.height;

      if (isHit) {
        eventBroker.publish("PLAYER_SPIKED", undefined);
        const damaged = this.health.takeDamage(1);
        if (damaged && !this.isDead) {
          if (this.minionType !== "TURRET" && !this.isDying) {
            this.velocity.y = -550;
            this.physics.isGrounded = false;
          }
        }
        break;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (this.isDead) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
    const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

    ctx.save();

    if (this.isSpawning) {
      const pct = 1.0 - this.spawnTimer / 0.6;
      ctx.globalAlpha = pct;
      ctx.translate(drawX, drawY);
      ctx.scale(pct, pct);
      ctx.translate(-drawX, -drawY);
    } else if (this.isDying) {
      const pct = this.dissolveTimer / 0.5;
      ctx.globalAlpha = pct;
      ctx.translate(drawX, drawY);
      ctx.scale(pct, pct);
      ctx.translate(-drawX, -drawY);
    }

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      if (this.minionType === "TURRET") {
        ctx.fillStyle = "#718096";
      } else if (this.minionType === "LANCER") {
        ctx.fillStyle = "hsl(280, 60%, 55%)";
      } else if (this.minionType === "FLYER") {
        ctx.fillStyle = "hsl(200, 70%, 55%)";
      }
    }

    if (this.attackState === "TELEGRAPH" && !this.isDying) {
      ctx.fillStyle = "hsl(45, 100%, 50%)";
      ctx.shadowColor = "rgba(234, 179, 8, 0.8)";
      ctx.shadowBlur = 14;
    }

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;

    if (this.squashPivot === "feet") {
      const feetY = drawY + this.size.height / 2;
      ctx.fillRect(drawX - vWidth / 2, feetY - vHeight, vWidth, vHeight);
    } else {
      ctx.fillRect(drawX - vWidth / 2, drawY - vHeight / 2, vWidth, vHeight);
    }

    ctx.shadowBlur = 0;

    ctx.fillStyle = "black";
    const faceDirection = this.minionType === "LANCER" ? this.facingDirection : 1;
    ctx.fillRect(drawX + faceDirection * 8 - 2, drawY - 12, 6, 4);

    ctx.restore();
  }
}
`,"src/entities/MinionBehaviors.ts":`import { Minion } from "./Minion";

export interface IMinionBehavior {
  update(minion: Minion, dt: number): void;
}

export class TurretBehavior implements IMinionBehavior {
  public update(minion: Minion, _dt: number): void {
    minion.velocity = { x: 0, y: 0 };
    const player = minion.world.player;
    const playerValid = player && !player.isDead;

    if (minion.attackState === "PATROL") {
      if (playerValid) {
        const dx = player.position.x - minion.position.x;
        const dy = player.position.y - minion.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400 && minion.shootTimer <= 0) {
          minion.attackState = "TELEGRAPH";
          minion.stateTimer = 0.5;
        }
      }
    } else if (minion.attackState === "TELEGRAPH") {
      if (minion.stateTimer <= 0) {
        if (playerValid) {
          minion.fireSingleShotAtPlayer(player);
        }
        minion.shootTimer = 2.5;
        minion.attackState = "PATROL";
      }
    }
  }
}

export class LancerBehavior implements IMinionBehavior {
  public update(minion: Minion, _dt: number): void {
    const player = minion.world.player;
    const playerValid = player && !player.isDead;

    if (minion.attackState === "PATROL") {
      minion.velocity.x = minion.facingDirection * minion.patrolSpeed;

      const physics = minion.physics;
      if (physics.isOnWallLeft) minion.facingDirection = 1;
      else if (physics.isOnWallRight) minion.facingDirection = -1;

      if (playerValid) {
        const distY = Math.abs(player.position.y - minion.position.y);
        const distX = player.position.x - minion.position.x;

        if (distY < 40 && Math.abs(distX) < 110 && Math.sign(distX) === minion.facingDirection) {
          minion.attackState = "TELEGRAPH";
          minion.stateTimer = 0.4;
          minion.velocity.x = 0;
          minion.visualScale = { x: 1.18, y: 0.82 };
          minion.targetVisualScale = { x: 1.1, y: 0.9 };
        }
      }
    } else if (minion.attackState === "TELEGRAPH") {
      minion.velocity.x = 0;
      if (minion.stateTimer <= 0) {
        minion.attackState = "ATTACK";
        minion.stateTimer = 0.2;
        minion.velocity.x = minion.facingDirection * 400;
        minion.visualScale = { x: 1.26, y: 0.74 };
        minion.targetVisualScale = { x: 1.15, y: 0.85 };
      }
    } else if (minion.attackState === "ATTACK") {
      const physics = minion.physics;
      if (minion.stateTimer <= 0 || physics.isOnWallLeft || physics.isOnWallRight) {
        minion.attackState = "COOLDOWN";
        minion.stateTimer = 1.2;
        minion.velocity.x = 0;
        minion.visualScale = { x: 0.85, y: 1.15 };
        minion.targetVisualScale = { x: 1.0, y: 1.0 };
      }
    } else if (minion.attackState === "COOLDOWN") {
      minion.velocity.x = 0;
      if (minion.stateTimer <= 0) {
        minion.attackState = "PATROL";
        minion.targetVisualScale = { x: 1.0, y: 1.0 };
      }
    }
  }
}

export class FlyerBehavior implements IMinionBehavior {
  public update(minion: Minion, dt: number): void {
    const player = minion.world.player;
    const playerValid = player && !player.isDead;

    // Organic breathing wave pulsation
    const cycle = performance.now() * 0.006;
    minion.targetVisualScale.x = 1.0 + Math.sin(cycle) * 0.06;
    minion.targetVisualScale.y = 1.0 - Math.sin(cycle) * 0.06;

    if (minion.attackState === "PATROL") {
      const targetPos = minion.flyerTarget === "A" ? minion.pointA : minion.pointB;
      const dx = targetPos.x - minion.position.x;
      const dy = targetPos.y - minion.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        minion.flyerTarget = minion.flyerTarget === "A" ? "B" : "A";
      } else {
        minion.velocity.x = (dx / dist) * minion.patrolSpeed;
        minion.velocity.y = (dy / dist) * minion.patrolSpeed;
      }

      if (playerValid) {
        const dxP = player.position.x - minion.position.x;
        const dyP = player.position.y - minion.position.y;
        const playerDist = Math.sqrt(dxP * dxP + dyP * dyP);
        if (playerDist < 480 && minion.shootTimer <= 0 && minion.volleyCount === 0) {
          minion.attackState = "TELEGRAPH";
          minion.stateTimer = 0.6;
          minion.velocity = { x: 0, y: 0 };
        }
      }
    } else if (minion.attackState === "TELEGRAPH") {
      minion.velocity = { x: 0, y: 0 };
      if (minion.stateTimer <= 0) {
        minion.attackState = "ATTACK";
        minion.volleyCount = 3;
        minion.volleyTimer = 0;
        minion.shootTimer = 3.5;
      }
    } else if (minion.attackState === "ATTACK") {
      minion.velocity = { x: minion.velocity.x * 0.9, y: minion.velocity.y * 0.9 };

      if (minion.volleyCount > 0) {
        minion.volleyTimer -= dt;
        if (minion.volleyTimer <= 0 && playerValid) {
          minion.fireSingleShotAtPlayer(player);
          minion.volleyCount--;
          minion.volleyTimer = 0.18;
        }
      }

      if (minion.volleyCount === 0) {
        minion.attackState = "PATROL";
      }
    }
  }
}
`,"src/entities/Player.ts":`import { BaseEntity } from "./BaseEntity";
import { PhysicsComponent } from "@/entities/components/PhysicsComponent";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { InputReceiverComponent } from "@/entities/components/InputReceiverComponent";
import { DashComponent } from "@/entities/components/DashComponent";
import { MeleeComponent, IMeleeCapable } from "@/entities/components/MeleeComponent";
import { FireballComponent } from "@/entities/components/FireballComponent";
import { HealComponent, IHealCapable } from "@/entities/components/HealComponent";
import { IWorld } from "@/core/Interfaces";
import { eventBroker } from "@/core/eventBroker";

export class Player extends BaseEntity implements IMeleeCapable, IHealCapable {
  public health!: HealthComponent;
  public physics!: PhysicsComponent;
  public inputReceiver!: InputReceiverComponent;
  public dashComponent!: DashComponent;
  public meleeComponent!: MeleeComponent;
  public fireballComponent!: FireballComponent;
  public healComponent!: HealComponent;

  private readonly moveSpeed: number = 450;
  private readonly jumpForce: number = 680;
  private readonly wallSlideSpeed: number = 120;

  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  public hasDoubleJump: boolean = true;
  public facingDirection: number = 1;

  private wallCoyoteTimer: number = 0;
  private lastWallNormal: number = 0;
  private airtimeDuration: number = 0;

  public determinationCounter: number = 0;
  public healingCharges: number = 0;
  public readonly maxHealingCharges: number = 3;

  public hurtTimer: number = 0;
  private unsubHurt!: () => void;
  private wasOnWall: boolean = false;

  constructor(id: string, world: IWorld) {
    super(id, world);
    this.size = { width: 40, height: 80 };
    this.squashPivot = "feet";

    this.position = { x: 0, y: 0 };
    this.previousPosition = { x: 0, y: 0 };

    this.physics = this.addComponent(PhysicsComponent, new PhysicsComponent());
    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 5,
      invincibilityDuration: 1.5,
    });

    this.inputReceiver = this.addComponent(InputReceiverComponent, new InputReceiverComponent());
    this.dashComponent = this.addComponent(DashComponent, new DashComponent());
    this.meleeComponent = this.addComponent(MeleeComponent, new MeleeComponent());
    this.fireballComponent = this.addComponent(FireballComponent, new FireballComponent());
    this.healComponent = this.addComponent(HealComponent, new HealComponent());

    this.unsubHurt = eventBroker.subscribe("PLAYER_HURT", () => {
      this.hurtTimer = 0.15;
      if (this.healComponent.isHealing) {
        this.healComponent.cancelHealing();
      }
      if (this.fireballComponent.isCharging) {
        this.fireballComponent.cancelCharging();
      }
    });
  }

  public get isDashing(): boolean {
    return this.dashComponent.isDashing;
  }
  public get canDash(): boolean {
    return this.dashComponent.canDash;
  }
  public get isHealing(): boolean {
    return this.healComponent.isHealing;
  }
  public get isCharging(): boolean {
    return this.fireballComponent.isCharging;
  }
  public get chargeTimer(): number {
    return this.fireballComponent.chargeTimer;
  }
  public get attackActive(): boolean {
    return this.meleeComponent.attackActive;
  }
  public get attackDirection(): "side" | "up" | "down" | null {
    return this.meleeComponent.attackDirection;
  }

  public update(dt: number) {
    if (this.isDead) {
      super.update(dt);
      return;
    }

    const moveAxis = this.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
    const currentOnWall = this.physics.isOnWallLeft || this.physics.isOnWallRight;
    const isPressedAgainstWall = currentOnWall && moveAxis !== 0 && Math.sign(moveAxis) === -this.lastWallNormal;
    const isSliding =
      !this.physics.isGrounded && this.velocity.y > 0 && this.wallCoyoteTimer > 0 && isPressedAgainstWall;

    let targetScaleX = 1.0;
    let targetScaleY = 1.0;

    if (isPressedAgainstWall) {
      targetScaleX = 0.91;
      targetScaleY = 1.09;

      if (isSliding) {
        targetScaleX = 0.85;
        targetScaleY = 1.15;

        // Spawn subtle friction dust particles
        if (Math.random() < 0.12) {
          const contactX = this.position.x - this.lastWallNormal * (this.size.width / 2);
          eventBroker.publish("SPAWN_SPARKS", {
            x: contactX,
            y: this.position.y + (Math.random() * 30 - 15),
            angle: this.lastWallNormal === 1 ? 0 : Math.PI,
            color: "rgba(255, 255, 255, 0.35)",
            count: 2,
          });
        }
      }
    }

    this.targetVisualScale = { x: targetScaleX, y: targetScaleY };

    if (!this.physics.isGrounded) {
      this.airtimeDuration += dt;
    } else {
      if (this.airtimeDuration > 0.08) {
        this.visualScale = { x: 1.22, y: 0.78 };
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
        eventBroker.publish("PLAYER_LANDED", undefined);
      }
      this.airtimeDuration = 0;
    }

    const isFalling = !this.physics.isGrounded && this.velocity.y > 0;
    const isPogoing = this.meleeComponent.attackActive && this.meleeComponent.attackDirection === "down";
    const isNearJumpApex = !this.physics.isGrounded && Math.abs(this.velocity.y) < 120;

    if (isPogoing) {
      this.physics.gravity = 1200 * 0.85;
    } else if (isNearJumpApex) {
      this.physics.gravity = 1200 * 0.65;
    } else if (isFalling && this.inputReceiver.isPressed("MOVE_DOWN")) {
      this.physics.gravity = 1200 * 1.4;
    } else {
      this.physics.gravity = 1200;
    }

    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      this.velocity.y += this.physics.gravity * dt;
      const knockbackFriction = 800.0;
      this.velocity.x = Math.sign(this.velocity.x) * Math.max(0, Math.abs(this.velocity.x) - knockbackFriction * dt);

      super.update(dt);
      return;
    }

    super.update(dt);

    if (currentOnWall && !this.wasOnWall && !this.physics.isGrounded) {
      // Just clung to wall - squash horizontally and stretch vertically on impact
      this.visualScale = { x: 0.76, y: 1.24 };

      const impactSide = this.physics.isOnWallLeft ? -1 : 1;
      eventBroker.publish("SPAWN_SPARKS", {
        x: this.position.x + impactSide * (this.size.width / 2),
        y: this.position.y,
        angle: impactSide > 0 ? Math.PI : 0,
        color: "rgba(255, 255, 255, 0.55)",
        count: 6,
      });
    }
    this.wasOnWall = currentOnWall;

    if (this.healComponent.isHealing) {
      if (!this.inputReceiver.isPressed("MOVE_DOWN") || !this.inputReceiver.isPressed("JUMP")) {
        this.healComponent.cancelHealing();
      }
      return;
    }

    if (this.dashComponent.isDashing) {
      return;
    }

    if (this.physics.isGrounded) {
      this.coyoteTimer = 0.15;
      this.hasDoubleJump = true;
      this.dashComponent.resetDashCharge();
    } else {
      this.coyoteTimer -= dt;
    }

    if (this.physics.isOnWallLeft) {
      this.wallCoyoteTimer = 0.1;
      this.lastWallNormal = 1;
      this.hasDoubleJump = true;
      this.dashComponent.resetDashCharge();
    } else if (this.physics.isOnWallRight) {
      this.wallCoyoteTimer = 0.1;
      this.lastWallNormal = -1;
      this.hasDoubleJump = true;
      this.dashComponent.resetDashCharge();
    } else {
      this.wallCoyoteTimer -= dt;
    }

    if (this.meleeComponent.attackActive) {
      const friction = 2000.0;
      this.velocity.x = Math.sign(this.velocity.x) * Math.max(0, Math.abs(this.velocity.x) - friction * dt);
    } else {
      this.velocity.x = moveAxis * this.moveSpeed;
    }

    if (moveAxis !== 0) {
      this.facingDirection = Math.sign(moveAxis);
    }

    if (!this.physics.isGrounded && this.velocity.y > 0 && this.wallCoyoteTimer > 0) {
      if (moveAxis !== 0 && Math.sign(moveAxis) === -this.lastWallNormal) {
        this.velocity.y = Math.min(this.velocity.y, this.wallSlideSpeed);
      }
    }

    if (
      this.inputReceiver.consumeBufferedAction("DASH", 100) &&
      this.dashComponent.canDash &&
      this.dashComponent.dashCooldown <= 0
    ) {
      let dirX = this.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
      let dirY = 0;
      if (this.inputReceiver.isPressed("MOVE_UP")) {
        dirY = -1;
      } else if (this.inputReceiver.isPressed("MOVE_DOWN")) {
        dirY = 1;
      }

      if (dirX === 0 && dirY === 0) {
        dirX = this.facingDirection;
      }

      const len = Math.sqrt(dirX * dirX + dirY * dirY);
      const normX = dirX / len;
      const normY = dirY / len;

      this.dashComponent.triggerDash(normX, normY);
      this.visualScale = { x: 1.25, y: 0.75 };
      super.update(dt);
      return;
    }

    if (this.inputReceiver.consumeBufferedAction("JUMP", 100)) {
      this.jumpBufferTimer = 0.1;
    } else {
      this.jumpBufferTimer -= dt;
    }

    if (this.jumpBufferTimer > 0) {
      if (this.inputReceiver.isPressed("MOVE_DOWN") && this.isStandingOnOneway()) {
        this.physics.disablePlatformCollisionTimer = 0.25;
        this.position.y += 12;
        this.velocity.y = 180;
        this.physics.isGrounded = false;
        this.jumpBufferTimer = 0;
      } else if (
        this.inputReceiver.isPressed("MOVE_DOWN") &&
        this.physics.isGrounded &&
        this.healingCharges > 0 &&
        this.health.currentHealth < this.health.maxHealth
      ) {
        this.healComponent.startHealing();
        this.jumpBufferTimer = 0;
      } else if (this.coyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.visualScale = { x: 0.82, y: 1.18 };
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
        eventBroker.publish("PLAYER_JUMPED", undefined);
      } else if (this.wallCoyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.velocity.x = this.lastWallNormal * 1650;
        this.wallCoyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.dashComponent.resetDashCharge();
        this.visualScale = { x: 0.82, y: 1.18 };
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
        eventBroker.publish("PLAYER_JUMPED", undefined);
      } else if (this.hasDoubleJump) {
        this.velocity.y = -this.jumpForce;
        this.hasDoubleJump = false;
        this.jumpBufferTimer = 0;
        this.visualScale = { x: 0.82, y: 1.18 };
        eventBroker.publish("PLAYER_JUMPED", undefined);
      }
    }

    if (this.inputReceiver.isJustReleased("JUMP") && this.velocity.y < 0) {
      this.velocity.y *= 0.4;
    }

    if (this.inputReceiver.consumeBufferedAction("ATTACK", 100)) {
      this.fireballComponent.startCharging();

      if (this.meleeComponent.attackCooldownTimer <= 0) {
        if (this.inputReceiver.isPressed("MOVE_DOWN") && !this.physics.isGrounded) {
          this.meleeComponent.triggerAttack("down");
        } else if (this.inputReceiver.isPressed("MOVE_UP")) {
          this.meleeComponent.triggerAttack("up");
        } else {
          this.meleeComponent.triggerAttack("side");
        }
      }
    }

    if (this.inputReceiver.isJustReleased("ATTACK")) {
      const dirX = this.inputReceiver.getAxis("MOVE_LEFT", "MOVE_RIGHT");
      const dirY = this.inputReceiver.isPressed("MOVE_UP")
        ? -1
        : this.inputReceiver.isPressed("MOVE_DOWN") && !this.physics.isGrounded
          ? 1
          : 0;
      this.fireballComponent.releaseCharge(dirX, dirY, this.facingDirection);
    }

    this.checkHazardContact();
  }

  private isStandingOnOneway(): boolean {
    const ownerHalfH = this.size.height / 2;
    const feetY = this.position.y + ownerHalfH;
    const halfW = this.size.width / 2;

    for (const platform of this.world.physicsWorld.onewayPlatforms) {
      if (this.position.x + halfW > platform.x && this.position.x - halfW < platform.x + platform.width) {
        if (Math.abs(feetY - platform.y) <= 12) {
          return true;
        }
      }
    }
    return false;
  }

  public registerDamageDealt() {
    if (this.healingCharges >= this.maxHealingCharges) return;

    this.determinationCounter++;
    if (this.determinationCounter >= 5) {
      this.determinationCounter = 0;
      this.healingCharges = Math.min(this.maxHealingCharges, this.healingCharges + 1);
      eventBroker.publish("HEALING_CHARGES_CHANGED", { charges: this.healingCharges });
    }
    eventBroker.publish("DETERMINATION_CHANGED", { determination: this.determinationCounter });
  }

  private checkHazardContact() {
    if (this.health.isInvincible() || this.isDead) return;

    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;

    for (const hazard of this.world.physicsWorld.hazards) {
      const isHit =
        this.position.x + halfW > hazard.x &&
        this.position.x - halfW < hazard.x + hazard.width &&
        this.position.y + halfH > hazard.y &&
        this.position.y - halfH < hazard.y + hazard.height;

      if (isHit) {
        if (this.healComponent.isHealing) {
          this.healComponent.cancelHealing();
        }

        eventBroker.publish("PLAYER_SPIKED", undefined);
        const damaged = this.health.takeDamage(1);
        if (damaged && !this.isDead) {
          this.velocity.y = -550;
          this.physics.isGrounded = false;
        }
        break;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (this.isDead) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
    const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

    for (const ghost of this.dashComponent.ghosts) {
      ctx.fillStyle = \`hsla(142, 71%, 58%, \${ghost.opacity})\`;
      const gWidth = this.size.width * this.visualScale.x;
      const gHeight = this.size.height * this.visualScale.y;
      const gFeetY = ghost.y + this.size.height / 2;
      ctx.fillRect(ghost.x - gWidth / 2, gFeetY - gHeight, gWidth, gHeight);
    }

    if (this.health.isFlashing()) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "hsl(142, 71%, 58%)";
    }

    ctx.shadowColor = "rgba(34, 197, 94, 0.4)";
    ctx.shadowBlur = this.isDashing ? 25 : 15;

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;
    const feetY = drawY + this.size.height / 2;

    ctx.fillRect(drawX - vWidth / 2, feetY - vHeight, vWidth, vHeight);

    ctx.shadowBlur = 0;

    if (this.isHealing) {
      const cycle = performance.now() * 0.008;
      ctx.strokeStyle = "hsl(280, 80%, 65%)";
      ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;
      ctx.beginPath();

      const radius1 = 44 + Math.sin(cycle) * 8;
      const radius2 = 28 + Math.cos(cycle * 1.5) * 6;
      ctx.arc(drawX, drawY, radius1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(drawX, drawY, radius2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (this.isCharging && this.chargeTimer >= 0.25) {
      const isLvl2 = this.chargeTimer >= 1.12;
      ctx.strokeStyle = isLvl2 ? "white" : "rgba(34, 197, 94, 0.6)";
      ctx.lineWidth = isLvl2 ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(drawX, drawY, this.size.height * 0.6 + Math.sin(performance.now() * 0.05) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  public teardown() {
    this.unsubHurt();
    super.teardown();
  }
}
`,"src/entities/Projectile.ts":`import { BaseEntity } from "./BaseEntity";
import { IPoolable } from "@/core/ObjectPool";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { IWorld, EntityStatus } from "@/core/Interfaces";
import { eventBroker } from "@/core/eventBroker";
import { UNITS } from "@/core/Units";

export class Projectile extends BaseEntity implements IPoolable {
  public isActive: boolean = false;
  public ownerId: "player" | "boss" = "player";
  public damage: number = 1;

  private lifespan: number = 0;
  private onRelease?: (proj: Projectile) => void;

  constructor() {
    super("projectile", null as any);
    this.size = { width: 14, height: 14 };
  }

  public activate(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    ownerId: "player" | "boss",
    damage: number,
    speed: number,
    lifespan: number,
    onRelease: (proj: Projectile) => void,
    world: IWorld
  ) {
    this.position = { x, y };
    this.previousPosition = { x, y };
    this.velocity = { x: dirX * speed, y: dirY * speed };

    this.ownerId = ownerId;
    this.damage = damage;
    this.lifespan = lifespan;
    this.onRelease = onRelease;
    this.world = world;

    this.isActive = true;
    this.isDead = false;
  }

  public deactivate() {
    this.isActive = false;
    this.isDead = true;
    this.velocity = { x: 0, y: 0 };
  }

  public update(dt: number) {
    if (!this.isActive) return;

    this.lifespan -= dt;
    if (this.lifespan <= 0) {
      this.selfRelease();
      return;
    }

    const dx = this.velocity.x * dt;
    const dy = this.velocity.y * dt;
    const maxStepSize = UNITS.CCD_STEP_LIMIT_PROJECTILE;

    const steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy) / maxStepSize));
    const substepX = dx / steps;
    const substepY = dy / steps;

    for (let i = 0; i < steps; i++) {
      this.position.x += substepX;
      this.position.y += substepY;

      if (this.checkSolidCollisions() || this.checkOnewayCollisions()) {
        this.selfRelease();
        return;
      }

      if (this.checkProjectileClashes()) {
        this.selfRelease();
        return;
      }

      if (this.checkEntityCollisions()) {
        this.selfRelease();
        return;
      }
    }
  }

  private checkSolidCollisions(): boolean {
    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;
    const physicsWorld = this.world.physicsWorld;

    const solidCandidates = physicsWorld.getOverlapCandidates(
      this.position.x,
      this.position.y,
      this.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
      this.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
      "solid"
    );

    for (const solid of solidCandidates) {
      const isHit =
        this.position.x + halfW > solid.x &&
        this.position.x - halfW < solid.x + solid.width &&
        this.position.y + halfH > solid.y &&
        this.position.y - halfH < solid.y + solid.height;

      if (isHit) {
        return true;
      }
    }
    return false;
  }

  private checkOnewayCollisions(): boolean {
    if (this.velocity.y < 0) return false;

    const halfW = this.size.width / 2;
    const halfH = this.size.height / 2;
    const prevY = this.position.y - this.velocity.y * UNITS.CANONICAL_DELTA_TIME;
    const physicsWorld = this.world.physicsWorld;

    const platformCandidates = physicsWorld.getOverlapCandidates(
      this.position.x,
      this.position.y,
      this.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
      this.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
      "platform"
    );

    for (const platform of platformCandidates) {
      const isHit =
        this.position.x + halfW > platform.x &&
        this.position.x - halfW < platform.x + platform.width &&
        this.position.y + halfH > platform.y &&
        this.position.y - halfH < platform.y + platform.height;

      if (isHit) {
        if (prevY + halfH - 4 <= platform.y) {
          return true;
        }
      }
    }
    return false;
  }

  private checkProjectileClashes(): boolean {
    if (this.ownerId !== "player") return false;

    const pW = this.size.width / 2;
    const pH = this.size.height / 2;

    const activeProjectiles = [...this.world.getProjectiles()];
    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
      const other = activeProjectiles[i];
      if (other && other.isActive && other.ownerId === "boss") {
        const oW = other.size.width / 2;
        const oH = other.size.height / 2;

        const isColliding =
          this.position.x + pW > other.position.x - oW &&
          this.position.x - pW < other.position.x + oW &&
          this.position.y + pH > other.position.y - oH &&
          this.position.y - pH < other.position.y + oH;

        if (isColliding) {
          const incomingDamage = other.damage || 1;
          this.world.releaseProjectile(other);
          this.damage -= incomingDamage;
          if (this.damage <= 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private checkEntityCollisions(): boolean {
    const targets = [];

    if (this.ownerId === "boss") {
      if (this.world.player && !this.world.player.isDead) {
        targets.push(this.world.player);
      }
    } else {
      if (this.world.boss && !this.world.boss.isDead) {
        targets.push(this.world.boss);
      }
      for (const minion of this.world.minions) {
        if (minion && minion.status === EntityStatus.ACTIVE) {
          targets.push(minion);
        }
      }
    }

    const pW = this.size.width / 2;
    const pH = this.size.height / 2;

    for (const target of targets) {
      const tW = target.size.width / 2;
      const tH = target.size.height / 2;

      const isColliding =
        this.position.x + pW > target.position.x - tW &&
        this.position.x - pW < target.position.x + tW &&
        this.position.y + pH > target.position.y - tH &&
        this.position.y - pH < target.position.y + tH;

      if (isColliding) {
        const targetHealth = target.getComponent(HealthComponent);
        if (targetHealth) {
          targetHealth.takeDamage(this.damage);
          return true;
        }
      }
    }
    return false;
  }

  private selfRelease() {
    eventBroker.publish("SPAWN_BLAST", {
      x: this.position.x,
      y: this.position.y,
      color: this.ownerId === "player" ? "hsl(142, 71%, 58%)" : "hsl(350, 80%, 60%)",
    });
    if (this.onRelease) {
      this.onRelease(this);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (!this.isActive) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
    const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

    if (this.ownerId === "player") {
      ctx.fillStyle = "hsl(142, 71%, 58%)";
      ctx.shadowColor = "rgba(34, 197, 94, 0.6)";
    } else {
      ctx.fillStyle = "hsl(350, 80%, 60%)";
      ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
    }

    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.size.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
`,"src/entities/Spawner.ts":`import { Minion, MinionType } from "./Minion";
import { IWorld } from "@/core/Interfaces";

export class Spawner {
  public position: { x: number; y: number };
  public spawnType: MinionType;
  public world: IWorld;

  private activeMinion: Minion | null = null;
  private respawnTimer: number = 0;
  private readonly respawnDelay: number = 5.0;

  constructor(type: MinionType, x: number, y: number, world: IWorld) {
    this.spawnType = type;
    this.position = { x, y };
    this.world = world;
    this.spawnMinion();
  }

  public update(dt: number) {
    if (this.activeMinion) {
      if (this.activeMinion.isDead) {
        this.world.minions = this.world.minions.filter((m) => m !== this.activeMinion);
        this.activeMinion = null;
        this.respawnTimer = this.respawnDelay;
      }
    } else {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.spawnMinion();
      }
    }
  }

  private spawnMinion() {
    const minionId = \`minion-\${this.spawnType}-\${Date.now()}\`;
    const minion = new Minion(minionId, this.spawnType, this.position, this.world);
    this.activeMinion = minion;
    this.world.minions.push(minion);
  }

  public cleanup() {
    if (this.activeMinion) {
      this.activeMinion.teardown();
      this.world.minions = this.world.minions.filter((m) => m !== this.activeMinion);
      this.activeMinion = null;
    }
  }
}
`,"src/entities/components/DashComponent.ts":`import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { eventBroker } from "@/core/eventBroker";

export interface GhostFrame {
  x: number;
  y: number;
  opacity: number;
}

export class DashComponent implements IEntityComponent {
  public owner!: BaseEntity;

  public isDashing: boolean = false;
  public dashTimer: number = 0;
  public dashCooldown: number = 0;
  public canDash: boolean = true;
  public dashDirectionX: number = 1;
  public dashDirectionY: number = 0;
  public ghosts: GhostFrame[] = [];
  public ghostSpawnTimer: number = 0;

  private readonly dashSpeed: number = 1400;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public update(dt: number): void {
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }

    for (const ghost of this.ghosts) {
      ghost.opacity -= dt * 5.0;
    }
    this.ghosts = this.ghosts.filter((g) => g.opacity > 0);

    if (this.isDashing) {
      this.dashTimer -= dt;
      this.owner.velocity.x = this.dashDirectionX * this.dashSpeed;
      this.owner.velocity.y = this.dashDirectionY * this.dashSpeed;

      this.ghostSpawnTimer -= dt;
      if (this.ghostSpawnTimer <= 0) {
        this.ghosts.push({
          x: this.owner.position.x,
          y: this.owner.position.y,
          opacity: 0.6,
        });
        this.ghostSpawnTimer = 0.025;
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        if (this.dashDirectionX !== 0) this.owner.velocity.x *= 0.5;
        if (this.dashDirectionY !== 0) this.owner.velocity.y = 0;
      }
    }
  }

  public triggerDash(directionX: number, directionY: number): void {
    this.isDashing = true;
    this.dashTimer = 0.15;
    this.dashCooldown = 0.5;
    this.canDash = false;
    this.dashDirectionX = directionX;
    this.dashDirectionY = directionY;
    this.ghostSpawnTimer = 0;
    eventBroker.publish("PLAYER_DASHED", { direction: directionX });
  }

  public resetDashCharge(): void {
    if (!this.canDash) {
      this.canDash = true;
      eventBroker.publish("PLAYER_DASH_RECHARGED", undefined);
    }
  }
}
`,"src/entities/components/FireballComponent.ts":`import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { eventBroker } from "@/core/eventBroker";

export class FireballComponent implements IEntityComponent {
  public owner!: BaseEntity;

  public isCharging: boolean = false;
  public chargeTimer: number = 0;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public update(dt: number): void {
    if (this.isCharging) {
      this.chargeTimer += dt;
      eventBroker.publish("CHARGE_UPDATE", { timer: this.chargeTimer });
    }
  }

  public startCharging(): void {
    this.isCharging = true;
    this.chargeTimer = 0;
    eventBroker.publish("CHARGE_START", undefined);
  }

  public cancelCharging(): void {
    if (this.isCharging) {
      this.isCharging = false;
      this.chargeTimer = 0;
      eventBroker.publish("CHARGE_STOP", undefined);
    }
  }

  public releaseCharge(dirX: number, dirY: number, facingDirection: number): void {
    if (!this.isCharging) return;
    this.isCharging = false;
    eventBroker.publish("CHARGE_STOP", undefined);

    if (this.chargeTimer >= 0.35) {
      this.fire(dirX, dirY, facingDirection);
    }
  }

  private fire(dirX: number, dirY: number, facingDirection: number): void {
    let finalDirX = dirX;
    const finalDirY = dirY;

    if (finalDirX === 0 && finalDirY === 0) {
      finalDirX = facingDirection;
    }

    const mag = Math.sqrt(finalDirX * finalDirX + finalDirY * finalDirY);
    const normalizedDir = { x: finalDirX / mag, y: finalDirY / mag };

    const isLvl2 = this.chargeTimer >= 1.12;
    const damage = isLvl2 ? 3 : 1;
    const speed = isLvl2 ? 900 : 800;
    const lifespan = isLvl2 ? 3.0 : 2.0;

    const spawnX = this.owner.position.x + normalizedDir.x * 30;
    const spawnY = this.owner.position.y + normalizedDir.y * 30;

    eventBroker.publish("PLAYER_PROJECTILE_FIRED", { level: isLvl2 ? 2 : 1 });

    const proj = this.owner.world.spawnProjectile(
      spawnX,
      spawnY,
      normalizedDir.x,
      normalizedDir.y,
      "player",
      damage,
      speed,
      lifespan
    );

    if (isLvl2) {
      proj.size = { width: 28, height: 28 };
    } else {
      proj.size = { width: 14, height: 14 };
    }
  }
}
`,"src/entities/components/HealComponent.ts":`import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { eventBroker } from "@/core/eventBroker";
import { IEntity } from "@/core/Interfaces";

export interface IHealCapable extends IEntity {
  healingCharges: number;
}

export class HealComponent implements IEntityComponent {
  public owner!: IHealCapable;

  public isHealing: boolean = false;
  public healTimer: number = 0;

  private readonly healDuration: number = 2.0;

  public setup(owner: BaseEntity): void {
    this.owner = owner as unknown as IHealCapable;
  }

  public update(dt: number): void {
    if (this.isHealing) {
      this.owner.velocity.x = 0;
      this.healTimer -= dt;

      if (this.healTimer <= 0) {
        this.completeHealing();
      }
    }
  }

  public startHealing(): void {
    this.isHealing = true;
    this.healTimer = this.healDuration;
    eventBroker.publish("HEAL_START", undefined);
  }

  public cancelHealing(): void {
    if (this.isHealing) {
      this.isHealing = false;
      eventBroker.publish("HEAL_CANCEL", undefined);
    }
  }

  private completeHealing(): void {
    this.isHealing = false;

    this.owner.healingCharges = Math.max(0, this.owner.healingCharges - 1);
    eventBroker.publish("HEALING_CHARGES_CHANGED", { charges: this.owner.healingCharges });

    const health = this.owner.getComponent(HealthComponent);
    if (health) {
      health.currentHealth = Math.min(health.maxHealth, health.currentHealth + 1);
      eventBroker.publish("PLAYER_HEALED", {
        amount: 1,
        currentHealth: health.currentHealth,
        maxHealth: health.maxHealth,
      });
    }
    eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
    eventBroker.publish("HEAL_COMPLETE", undefined);
  }
}
`,"src/entities/components/HealthComponent.ts":`import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { eventBroker } from "@/core/eventBroker";
import { EntityStatus } from "@/core/Interfaces";

export interface HealthComponentOptions {
  maxHealth?: number;
  invincibilityDuration?: number;
}

export class HealthComponent implements IEntityComponent {
  public owner!: BaseEntity;
  public maxHealth: number = 5;
  public currentHealth: number = 5;

  public invincibilityDuration: number = 0.15;
  private invincibilityTimer: number = 0;

  public hitFlashTimer: number = 0;
  public hitFlashDuration: number = 0.12;

  public setup(owner: BaseEntity, dependencies?: HealthComponentOptions): void {
    this.owner = owner;
    if (dependencies) {
      if (dependencies.maxHealth !== undefined) {
        this.maxHealth = dependencies.maxHealth;
        this.currentHealth = dependencies.maxHealth;
      }
      if (dependencies.invincibilityDuration !== undefined) {
        this.invincibilityDuration = dependencies.invincibilityDuration;
      }
    }
  }

  public update(dt: number): void {
    if (this.invincibilityTimer > 0) this.invincibilityTimer -= dt;
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
  }

  public reset(): void {
    this.currentHealth = this.maxHealth;
    this.invincibilityTimer = 0;
    this.hitFlashTimer = 0;
  }

  public takeDamage(amount: number): boolean {
    const isDying = this.owner.status === EntityStatus.DYING;
    const isSpawning = this.owner.status === EntityStatus.SPAWNING;
    if (this.invincibilityTimer > 0 || this.owner.isDead || isDying || isSpawning) {
      return false;
    }

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.invincibilityTimer = this.invincibilityDuration;
    this.hitFlashTimer = this.hitFlashDuration;

    if (this.owner.id === "player-01") {
      eventBroker.publish("PLAYER_HURT", {
        amount,
        currentHealth: this.currentHealth,
        maxHealth: this.maxHealth,
      });
    } else if (this.owner.id === "boss-01") {
      eventBroker.publish("BOSS_HURT", {
        amount,
        currentHealth: this.currentHealth,
        maxHealth: this.maxHealth,
      });
    } else if (this.owner.id.startsWith("minion-")) {
      eventBroker.publish("MINION_HURT", {
        id: this.owner.id,
        amount,
        currentHealth: this.currentHealth,
        maxHealth: this.maxHealth,
      });
    }

    if (this.currentHealth <= 0) {
      if (this.owner.startDeathSequence) {
        this.owner.startDeathSequence();
      } else {
        this.owner.isDead = true;
      }
    }

    return true;
  }

  public isInvincible(): boolean {
    return this.invincibilityTimer > 0;
  }

  public isFlashing(): boolean {
    return this.hitFlashTimer > 0;
  }
}
`,"src/entities/components/InputReceiverComponent.ts":`import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { inputProvider, Action } from "@/core/InputProvider";

export class InputReceiverComponent implements IEntityComponent {
  public owner!: BaseEntity;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public isPressed(action: Action): boolean {
    return inputProvider.isPressed(action);
  }

  public isJustPressed(action: Action): boolean {
    return inputProvider.isJustPressed(action);
  }

  public isJustReleased(action: Action): boolean {
    return inputProvider.isJustReleased(action);
  }

  public consumeBufferedAction(action: Action, windowMs: number = 100): boolean {
    return inputProvider.consumeBufferedAction(action, windowMs);
  }

  public getAxis(negative: Action, positive: Action): number {
    return inputProvider.getAxis(negative, positive);
  }
}
`,"src/entities/components/MeleeComponent.ts":`import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { HealthComponent } from "@/entities/components/HealthComponent";
import { eventBroker } from "@/core/eventBroker";
import { EntityStatus, IEntity } from "@/core/Interfaces";
import { DashComponent } from "@/entities/components/DashComponent";
import { UNITS } from "@/core/Units";

export interface IMeleeCapable extends IEntity {
  facingDirection: number;
  hasDoubleJump: boolean;
  registerDamageDealt?(): void;
}

export class MeleeComponent implements IEntityComponent {
  public owner!: IMeleeCapable;

  // High-frequency timing registers
  public attackCooldownTimer: number = 0;
  public attackActiveTimer: number = 0;
  public attackActive: boolean = false;
  public attackDirection: "side" | "up" | "down" | null = null;
  public hasHitEnemyThisSwing: boolean = false;

  // Balancing & Reach parameters
  private readonly pogoForce: number = 450;
  private readonly meleeRangeLimit: number = UNITS.MELEE_MAX_REACH;
  private readonly closeRangeThreshold: number = UNITS.MELEE_CLOSE_RANGE_THRESHOLD;
  private readonly sideReachOffset: number = UNITS.MELEE_SIDE_OFFSET;
  private readonly verticalReachOffset: number = UNITS.MELEE_VERTICAL_OFFSET;

  public setup(owner: BaseEntity): void {
    this.owner = owner as unknown as IMeleeCapable;
  }

  public update(dt: number): void {
    this.decayAttackTimers(dt);

    // Evaluate active swing intersections if we have not registered contact yet
    if (this.attackActive && !this.hasHitEnemyThisSwing) {
      if (this.attackDirection === "down") {
        this.checkPogoAttack();
      } else {
        this.checkMeleeAttackContact();
      }
    }
  }

  private decayAttackTimers(dt: number): void {
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= dt;
    if (this.attackActiveTimer > 0) this.attackActiveTimer -= dt;

    if (this.attackActive && this.attackActiveTimer <= 0) {
      this.attackActive = false;
      this.attackDirection = null;
    }
  }

  public triggerAttack(direction: "side" | "up" | "down"): void {
    this.attackActive = true;
    this.attackActiveTimer = 0.09;
    this.attackCooldownTimer = 0.15;
    this.hasHitEnemyThisSwing = false;
    this.attackDirection = direction;

    eventBroker.publish("PLAYER_ATTACKED", { direction });
  }

  /**
   * Main intersection bridge for horizontal (side) and vertical-upward swipes.
   */
  private checkMeleeAttackContact(): void {
    this.swipeEnemies();
    this.swipeIncomingProjectiles();
  }

  /**
   * Evaluates and applies swipe damage to valid boss and minion targets within range.
   */
  private swipeEnemies(): void {
    const targets = this.gatherAwaitingTargets();
    const facing = this.owner.facingDirection;

    for (const target of targets) {
      let isWithinSwingArc = false;
      let distanceToTarget = 0;

      if (this.attackDirection === "side") {
        const centerReachX = this.owner.position.x + facing * this.sideReachOffset;
        const centerReachY = this.owner.position.y;

        distanceToTarget = this.calculateDistance(target.position.x, target.position.y, centerReachX, centerReachY);

        const withinReach = distanceToTarget <= this.meleeRangeLimit + target.size.width / 2;
        const withinDirection =
          (facing > 0 && target.position.x >= centerReachX - 25) ||
          (facing < 0 && target.position.x <= centerReachX + 25);

        if (withinReach && withinDirection) {
          isWithinSwingArc = true;
        }
      } else if (this.attackDirection === "up") {
        const centerReachX = this.owner.position.x;
        const centerReachY = this.owner.position.y - this.verticalReachOffset;

        distanceToTarget = this.calculateDistance(target.position.x, target.position.y, centerReachX, centerReachY);

        const withinReach = distanceToTarget <= this.meleeRangeLimit + target.size.height / 2;
        const withinDirection = target.position.y <= centerReachY + 25;

        if (withinReach && withinDirection) {
          isWithinSwingArc = true;
        }
      }

      if (isWithinSwingArc) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          const isCloseRange = distanceToTarget <= this.closeRangeThreshold;
          const damageAmount = isCloseRange ? 5 : 1;

          const registeredDamage = health.takeDamage(damageAmount);
          if (registeredDamage) {
            this.hasHitEnemyThisSwing = true;
            this.owner.registerDamageDealt?.();

            if (isCloseRange) {
              eventBroker.publish("CAMERA_SHAKE", { amplitude: 8, duration: 0.15 });
            }
            eventBroker.publish("SPAWN_SPARKS", {
              x: target.position.x,
              y: target.position.y,
              angle: facing > 0 ? 0 : Math.PI,
              color: "hsl(142, 71%, 58%)",
            });
          }
        }
      }
    }
  }

  /**
   * Evaluates and releases/deflects incoming hostile projectiles within swipe reach.
   */
  private swipeIncomingProjectiles(): void {
    const facing = this.owner.facingDirection;
    const activeProjectiles = [...this.owner.world.getProjectiles()];

    for (const proj of activeProjectiles) {
      if (proj.isActive && proj.ownerId === "boss") {
        let isDeflected = false;

        if (this.attackDirection === "side") {
          const centerReachX = this.owner.position.x + facing * this.sideReachOffset;
          const centerReachY = this.owner.position.y;
          const distance = this.calculateDistance(proj.position.x, proj.position.y, centerReachX, centerReachY);

          const withinReach = distance <= this.meleeRangeLimit + proj.size.width / 2;
          const withinDirection =
            (facing > 0 && proj.position.x >= centerReachX - 25) ||
            (facing < 0 && proj.position.x <= centerReachX + 25);

          if (withinReach && withinDirection) {
            isDeflected = true;
          }
        } else if (this.attackDirection === "up") {
          const centerReachX = this.owner.position.x;
          const centerReachY = this.owner.position.y - this.verticalReachOffset;
          const distance = this.calculateDistance(proj.position.x, proj.position.y, centerReachX, centerReachY);

          const withinReach = distance <= this.meleeRangeLimit + proj.size.height / 2;
          const withinDirection = proj.position.y <= centerReachY + 25;

          if (withinReach && withinDirection) {
            isDeflected = true;
          }
        }

        if (isDeflected) {
          this.owner.world.releaseProjectile(proj);
          this.hasHitEnemyThisSwing = true;
          this.owner.registerDamageDealt?.();
          eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
        }
      }
    }
  }

  /**
   * Main intersection bridge for downward pogo hits against enemies, projectiles, and solid ground.
   */
  private checkPogoAttack(): void {
    const pogoHitbox = {
      x: this.owner.position.x + UNITS.POGO_HITBOX_X_OFFSET,
      y: this.owner.position.y + UNITS.POGO_HITBOX_Y_OFFSET,
      width: UNITS.POGO_HITBOX_WIDTH,
      height: UNITS.POGO_HITBOX_HEIGHT,
    };

    if (this.pogoEnemies(pogoHitbox)) return;
    if (this.pogoIncomingProjectiles(pogoHitbox)) return;
    this.pogoEnvironmentSurfaces(pogoHitbox);
  }

  private pogoEnemies(pogoBox: { x: number; y: number; width: number; height: number }): boolean {
    const targets = this.gatherAwaitingTargets();

    for (const target of targets) {
      const halfW = target.size.width / 2;
      const halfH = target.size.height / 2;

      const isColliding =
        pogoBox.x + pogoBox.width > target.position.x - halfW &&
        pogoBox.x < target.position.x + halfW &&
        pogoBox.y + pogoBox.height > target.position.y - halfH &&
        pogoBox.y < target.position.y + halfH;

      if (isColliding) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          health.takeDamage(1);
          this.owner.registerDamageDealt?.();
        }

        this.applyPogoRebound();
        return true;
      }
    }
    return false;
  }

  private pogoIncomingProjectiles(pogoBox: { x: number; y: number; width: number; height: number }): boolean {
    const activeProjectiles = this.owner.world.getProjectiles();

    for (const proj of activeProjectiles) {
      if (proj.isActive && proj.ownerId === "boss") {
        const pW = proj.size.width / 2;
        const pH = proj.size.height / 2;

        const isColliding =
          pogoBox.x + pogoBox.width > proj.position.x - pW &&
          pogoBox.x < proj.position.x + pW &&
          pogoBox.y + pogoBox.height > proj.position.y - pH &&
          pogoBox.y < proj.position.y + pH;

        if (isColliding) {
          this.owner.world.releaseProjectile(proj);
          this.owner.registerDamageDealt?.();
          this.applyPogoRebound();
          return true;
        }
      }
    }
    return false;
  }

  private pogoEnvironmentSurfaces(pogoBox: { x: number; y: number; width: number; height: number }): void {
    const surfaces = [
      ...this.owner.world.physicsWorld.solids,
      ...this.owner.world.physicsWorld.onewayPlatforms,
      ...this.owner.world.physicsWorld.hazards,
    ];

    for (const solid of surfaces) {
      const isColliding =
        pogoBox.x + pogoBox.width > solid.x &&
        pogoBox.x < solid.x + solid.width &&
        pogoBox.y + pogoBox.height > solid.y &&
        pogoBox.y < solid.y + solid.height;

      if (isColliding) {
        this.applyPogoRebound();
        break;
      }
    }
  }

  /**
   * Calculates vertical push force upon landing a successful downward strike,
   * restoring the double-jump and dash registers.
   */
  private applyPogoRebound(): void {
    this.owner.velocity.y = -this.pogoForce;
    this.owner.position.y -= 2;
    this.hasHitEnemyThisSwing = true;
    this.owner.hasDoubleJump = true;

    const dash = this.owner.getComponent(DashComponent);
    if (dash) {
      dash.resetDashCharge();
    }

    eventBroker.publish("PLAYER_POGOED", undefined);
  }

  private gatherAwaitingTargets(): BaseEntity[] {
    const targets: BaseEntity[] = [];
    if (this.owner.world.boss && !this.owner.world.boss.isDead) {
      targets.push(this.owner.world.boss as BaseEntity);
    }
    for (const minion of this.owner.world.minions) {
      if (minion && minion.status === EntityStatus.ACTIVE) {
        targets.push(minion as BaseEntity);
      }
    }
    return targets;
  }

  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
`,"src/entities/components/PhysicsComponent.ts":`import { IEntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { Rectangle } from "@/core/Interfaces";
import { UNITS } from "@/core/Units";

export interface PhysicsComponentOptions {
  gravity?: number;
}

export class PhysicsComponent implements IEntityComponent {
  public owner!: BaseEntity;
  public gravity: number = 1200;
  public isGrounded: boolean = false;
  public isOnWallLeft: boolean = false;
  public isOnWallRight: boolean = false;

  public disablePlatformCollisionTimer: number = 0;

  private readonly maxStepSize: number = UNITS.CCD_STEP_LIMIT_DEFAULT;
  private readonly cornerNudgeThreshold: number = UNITS.CORNER_NUDGE_MAX_OVERLAP;
  private readonly groundDetectionOffset: number = UNITS.GROUND_DETECTION_OFFSET;
  private readonly frameDurationEstimate: number = UNITS.CANONICAL_DELTA_TIME;

  public setup(owner: BaseEntity, dependencies?: PhysicsComponentOptions): void {
    this.owner = owner;
    if (dependencies) {
      if (dependencies.gravity !== undefined) {
        this.gravity = dependencies.gravity;
      }
    }
  }

  public update(dt: number): void {
    this.decayDisablePlatformTimer(dt);
    this.applyGravity(dt);
    this.executeSplitAxisMovement(dt);
    this.evaluateGroundedStatus();
  }

  private decayDisablePlatformTimer(dt: number): void {
    if (this.disablePlatformCollisionTimer > 0) {
      this.disablePlatformCollisionTimer -= dt;
    }
  }

  private applyGravity(dt: number): void {
    if (!this.isGrounded) {
      this.owner.velocity.y += this.gravity * dt;
    }
  }

  private executeSplitAxisMovement(dt: number): void {
    this.isOnWallLeft = false;
    this.isOnWallRight = false;

    const deltaX = this.owner.velocity.x * dt;
    const deltaY = this.owner.velocity.y * dt;

    const stepsX = Math.max(1, Math.ceil(Math.abs(deltaX) / this.maxStepSize));
    const stepsY = Math.max(1, Math.ceil(Math.abs(deltaY) / this.maxStepSize));

    const substepX = deltaX / stepsX;
    const substepY = deltaY / stepsY;

    for (let i = 0; i < stepsX; i++) {
      this.owner.position.x += substepX;
      if (this.resolveCollisionsX()) {
        break;
      }
    }

    for (let i = 0; i < stepsY; i++) {
      this.owner.position.y += substepY;
      if (this.resolveCollisionsY()) {
        break;
      }
    }
  }

  private resolveCollisionsX(): boolean {
    const ownerHalfWidth = this.owner.size.width / 2;
    const physicsWorld = this.owner.world.physicsWorld;
    let hasCollided = false;

    const solidCandidates = physicsWorld.getOverlapCandidates(
      this.owner.position.x,
      this.owner.position.y,
      this.owner.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
      this.owner.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
      "solid"
    );

    for (const solid of solidCandidates) {
      if (this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
        if (this.owner.velocity.x > 0) {
          this.owner.position.x = solid.x - ownerHalfWidth;
          this.isOnWallRight = true;
        } else if (this.owner.velocity.x < 0) {
          this.owner.position.x = solid.x + solid.width + ownerHalfWidth;
          this.isOnWallLeft = true;
        }
        this.owner.velocity.x = 0;
        hasCollided = true;
      }
    }
    return hasCollided;
  }

  private resolveCollisionsY(): boolean {
    const ownerHalfHeight = this.owner.size.height / 2;
    const ownerHalfWidth = this.owner.size.width / 2;
    const physicsWorld = this.owner.world.physicsWorld;
    let hasCollided = false;

    const solidCandidates = physicsWorld.getOverlapCandidates(
      this.owner.position.x,
      this.owner.position.y,
      this.owner.size.width + UNITS.BROAD_PHASE_PADDING_LARGE,
      this.owner.size.height + UNITS.BROAD_PHASE_PADDING_LARGE,
      "solid"
    );

    for (const solid of solidCandidates) {
      if (this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
        if (this.owner.velocity.y >= 0) {
          this.owner.position.y = solid.y - ownerHalfHeight;
          this.owner.velocity.y = 0;
          this.isGrounded = true;
          hasCollided = true;
        } else if (this.owner.velocity.y < 0) {
          const overlapRight = this.owner.position.x + ownerHalfWidth - solid.x;
          const overlapLeft = solid.x + solid.width - (this.owner.position.x - ownerHalfWidth);

          if (overlapRight > 0 && overlapRight <= this.cornerNudgeThreshold) {
            this.owner.position.x -= overlapRight;
            if (!this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
              continue;
            }
            this.owner.position.x += overlapRight;
          } else if (overlapLeft > 0 && overlapLeft <= this.cornerNudgeThreshold) {
            this.owner.position.x += overlapLeft;
            if (!this.isOverlapping(this.owner.position.x, this.owner.position.y, solid)) {
              continue;
            }
            this.owner.position.x -= overlapLeft;
          }

          this.owner.position.y = solid.y + solid.height + ownerHalfHeight;
          this.owner.velocity.y = 0;
          hasCollided = true;
        }
      }
    }

    if (this.disablePlatformCollisionTimer <= 0 && this.owner.velocity.y >= 0) {
      const previousY = this.owner.position.y - this.owner.velocity.y * this.frameDurationEstimate;

      const platformCandidates = physicsWorld.getOverlapCandidates(
        this.owner.position.x,
        this.owner.position.y,
        this.owner.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
        this.owner.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
        "platform"
      );

      for (const platform of platformCandidates) {
        if (this.isOverlapping(this.owner.position.x, this.owner.position.y, platform)) {
          if (previousY + ownerHalfHeight - 4 <= platform.y) {
            this.owner.position.y = platform.y - ownerHalfHeight;
            this.owner.velocity.y = 0;
            this.isGrounded = true;
            hasCollided = true;
          }
        }
      }
    }

    return hasCollided;
  }

  private evaluateGroundedStatus(): void {
    this.isGrounded = false;
    const physicsWorld = this.owner.world.physicsWorld;
    const testPosY = this.owner.position.y + this.groundDetectionOffset;

    if (this.owner.velocity.y >= 0) {
      const solidCandidates = physicsWorld.getOverlapCandidates(
        this.owner.position.x,
        testPosY,
        this.owner.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
        this.owner.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
        "solid"
      );
      for (const solid of solidCandidates) {
        if (this.isOverlapping(this.owner.position.x, testPosY, solid)) {
          this.isGrounded = true;
          break;
        }
      }

      if (!this.isGrounded && this.disablePlatformCollisionTimer <= 0) {
        const platformCandidates = physicsWorld.getOverlapCandidates(
          this.owner.position.x,
          testPosY,
          this.owner.size.width + UNITS.BROAD_PHASE_PADDING_STANDARD,
          this.owner.size.height + UNITS.BROAD_PHASE_PADDING_STANDARD,
          "platform"
        );
        for (const platform of platformCandidates) {
          if (this.isOverlapping(this.owner.position.x, testPosY, platform)) {
            this.isGrounded = true;
            break;
          }
        }
      }
    }
  }

  private isOverlapping(x: number, y: number, rect: Rectangle): boolean {
    const halfWidth = this.owner.size.width / 2;
    const halfHeight = this.owner.size.height / 2;

    const left = x - halfWidth;
    const right = x + halfWidth;
    const top = y - halfHeight;
    const bottom = y + halfHeight;

    return right > rect.x && left < rect.x + rect.width && bottom > rect.y && top < rect.y + rect.height;
  }

  public teardown(): void {
    // Reserved for cleanup
  }
}
`,"src/hooks/useAudioSettings.ts":`import { useState } from "react";
import { settingsManager, AudioSettings } from "@/core/SettingsManager";
import { soundSynth } from "@/core/SoundSynth";

export function useAudioSettings() {
  const [audio, setAudio] = useState<AudioSettings>({ ...settingsManager.getAudio() });

  const handleVolumeChange = (field: keyof AudioSettings, value: number | boolean) => {
    const updated = { ...audio, [field]: value };
    setAudio(updated);
    settingsManager.setAudio(updated);
    soundSynth.updateVolumes();
  };

  const resetSettings = () => {
    const defaulted: AudioSettings = {
      masterVolume: 1.0,
      sfxVolume: 1.0,
      musicVolume: 1.0,
      masterMuted: false,
      sfxMuted: false,
      musicMuted: false,
    };
    setAudio(defaulted);
    settingsManager.setAudio(defaulted);
    soundSynth.updateVolumes();
    soundSynth.playHitConfirm();
  };

  return {
    audio,
    handleVolumeChange,
    resetSettings,
  };
}
`,"src/hooks/useBootSequence.ts":`import { useState, useEffect, startTransition } from "react";

export enum BootStage {
  NONE = 0,
  INITIALIZED = 1,
  ASSETS_PRELOADED = 2,
  ARENA_READY = 3,
}

export function useBootSequence() {
  const [bootStage, setBootStage] = useState<BootStage>(BootStage.NONE);

  useEffect(() => {
    startTransition(() => {
      setBootStage(BootStage.INITIALIZED);
    });

    const queuePreload = () => {
      startTransition(() => {
        setBootStage(BootStage.ASSETS_PRELOADED);
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(queuePreload, { timeout: 800 });
    } else {
      setTimeout(queuePreload, 150);
    }

    const queueFullSystem = () => {
      startTransition(() => {
        setBootStage(BootStage.ARENA_READY);
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(queueFullSystem, { timeout: 1500 });
    } else {
      setTimeout(queueFullSystem, 400);
    }
  }, []);

  return bootStage;
}
`,"src/hooks/useEngineSubscriptions.ts":`import { useEffect, useRef } from "react";
import { eventBroker } from "@/core/eventBroker";
import { useGameplayStore } from "@/store/useGameStore";

export function useEngineSubscriptions(
  viewportRef: React.RefObject<HTMLDivElement | null>,
  triggerDialogue: (speaker: "player" | "boss", text: string) => void,
  resetDialogues: () => void
) {
  const triggerRef = useRef(triggerDialogue);
  const resetRef = useRef(resetDialogues);

  useEffect(() => {
    triggerRef.current = triggerDialogue;
    resetRef.current = resetDialogues;
  });

  useEffect(() => {
    const unsubGameplay = useGameplayStore.subscribe((state) => {
      const viewport = viewportRef.current;
      if (viewport) {
        if (state.isGlitching) {
          viewport.classList.add("filter-chromatic");
        } else {
          viewport.classList.remove("filter-chromatic");
        }
      }
    });

    const unsubs = [
      eventBroker.subscribe("DIALOGUE_TRIGGERED", ({ speaker, text }) => {
        triggerRef.current(speaker, text);
      }),
      eventBroker.subscribe("CLEAR_DIALOGUES", () => {
        resetRef.current();
      }),
    ];

    return () => {
      unsubGameplay();
      unsubs.forEach((unsub) => unsub());
    };
  }, [viewportRef]);
}
`,"src/hooks/useFirstGesture.ts":`import { useEffect } from "react";
import { soundSynth } from "@/core/SoundSynth";

export function useFirstGesture(reloadSaveSlots: () => void) {
  useEffect(() => {
    const triggerOnFirstGesture = () => {
      soundSynth.startMusic();
      window.removeEventListener("click", triggerOnFirstGesture);
      window.removeEventListener("touchend", triggerOnFirstGesture);
    };

    window.addEventListener("click", triggerOnFirstGesture);
    window.addEventListener("touchend", triggerOnFirstGesture);

    reloadSaveSlots();

    return () => {
      window.removeEventListener("click", triggerOnFirstGesture);
      window.removeEventListener("touchend", triggerOnFirstGesture);
      soundSynth.stopMusic();
    };
  }, []);
}
`,"src/hooks/useGameDialogue.ts":`import { useState, useEffect, useCallback } from "react";
import { soundSynth } from "@/core/SoundSynth";

export interface DialogueState {
  text: string;
  displayed: string;
  active: boolean;
  isTyping: boolean;
}

export function useGameDialogue() {
  const [playerDialogue, setPlayerDialogue] = useState<DialogueState>({
    text: "",
    displayed: "",
    active: false,
    isTyping: false,
  });
  const [bossDialogue, setBossDialogue] = useState<DialogueState>({
    text: "",
    displayed: "",
    active: false,
    isTyping: false,
  });

  useEffect(() => {
    if (!playerDialogue.text || !playerDialogue.active) return;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < playerDialogue.text.length) {
        const char = playerDialogue.text[idx];
        setPlayerDialogue((prev) => ({
          ...prev,
          displayed: playerDialogue.text.substring(0, idx + 1),
        }));
        soundSynth.playDialogueTick("player", char);
        idx++;
      } else {
        setPlayerDialogue((prev) => ({ ...prev, isTyping: false }));
        clearInterval(interval);

        setTimeout(() => {
          setPlayerDialogue((prev) => ({ ...prev, active: false }));
        }, 3000);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [playerDialogue.text, playerDialogue.active]);

  useEffect(() => {
    if (!bossDialogue.text || !bossDialogue.active) return;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < bossDialogue.text.length) {
        const char = bossDialogue.text[idx];
        setBossDialogue((prev) => ({
          ...prev,
          displayed: bossDialogue.text.substring(0, idx + 1),
        }));
        soundSynth.playDialogueTick("boss", char);
        idx++;
      } else {
        setBossDialogue((prev) => ({ ...prev, isTyping: false }));
        clearInterval(interval);

        setTimeout(() => {
          setBossDialogue((prev) => ({ ...prev, active: false }));
        }, 3000);
      }
    }, 55);

    return () => clearInterval(interval);
  }, [bossDialogue.text, bossDialogue.active]);

  const triggerDialogue = useCallback((speaker: "player" | "boss", text: string) => {
    if (speaker === "player") {
      setPlayerDialogue({ text, displayed: "", active: true, isTyping: true });
    } else {
      setBossDialogue({ text, displayed: "", active: true, isTyping: true });
    }
  }, []);

  const resetDialogues = useCallback(() => {
    setPlayerDialogue({ text: "", displayed: "", active: false, isTyping: false });
    setBossDialogue({ text: "", displayed: "", active: false, isTyping: false });
  }, []);

  return {
    playerDialogue,
    bossDialogue,
    triggerDialogue,
    resetDialogues,
  };
}
`,"src/hooks/useHudSubscription.ts":`import { useEffect } from "react";
import { useGameplayStore } from "@/store/useGameStore";

export function useHudSubscription() {
  useEffect(() => {
    const unsub = useGameplayStore.subscribe((state) => {
      const { playerHP, bossHP, healingCharges, determination } = state;

      for (let i = 0; i < 5; i++) {
        const isLit = i < playerHP;
        const dotD = document.getElementById("hud-d-php-" + i);
        const dotM = document.getElementById("hud-m-php-" + i);
        if (dotD) {
          if (isLit) dotD.classList.add("led-green");
          else dotD.classList.remove("led-green");
        }
        if (dotM) {
          if (isLit) dotM.classList.add("led-green");
          else dotM.classList.remove("led-green");
        }
      }

      for (let i = 0; i < 3; i++) {
        const isLit = i < healingCharges;
        const dotD = document.getElementById("hud-d-heal-" + i);
        const dotM = document.getElementById("hud-m-heal-" + i);
        if (dotD) {
          if (isLit) dotD.classList.add("led-yellow");
          else dotD.classList.remove("led-yellow");
        }
        if (dotM) {
          if (isLit) dotM.classList.add("led-yellow");
          else dotM.classList.remove("led-yellow");
        }
      }

      const detD = document.getElementById("hud-d-det-bar");
      const detM = document.getElementById("hud-m-det-bar");
      const detWidth = (determination / 5) * 100 + "%";
      if (detD) detD.style.width = detWidth;
      if (detM) detM.style.width = detWidth;

      const bossD = document.getElementById("hud-d-boss-bar");
      const bossM = document.getElementById("hud-m-boss-bar");
      const bossWidth = (bossHP / 30) * 100 + "%";
      if (bossD) {
        bossD.style.width = bossWidth;
        if (bossHP > 0) bossD.classList.add("led-red");
        else bossD.classList.remove("led-red");
      }
      if (bossM) {
        bossM.style.width = bossWidth;
        if (bossHP > 0) bossM.classList.add("led-red");
        else bossM.classList.remove("led-red");
      }
    });
    return unsub;
  }, []);
}
`,"src/hooks/useMusicLifecycle.ts":`import { useEffect } from "react";
import { soundSynth } from "@/core/SoundSynth";

export function useMusicLifecycle(isPlayingScreen: boolean) {
  useEffect(() => {
    if (isPlayingScreen) {
      soundSynth.stopMusic();
    } else {
      soundSynth.setCabinetMuffle(true);
      if (soundSynth.hasUserGestured) {
        soundSynth.startMusic();
      }
    }
  }, [isPlayingScreen]);
}
`,"src/hooks/useRebindCapture.ts":`import { useEffect } from "react";
import { Action } from "@/core/InputProvider";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";

export function useRebindCapture(
  rebindTarget: { action: Action; index: number } | null,
  setRebindTarget: (target: null) => void,
  reloadSaveSlots: () => void
) {
  useEffect(() => {
    if (!rebindTarget) return;

    const handleRebindCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      soundSynth.playHitConfirm();
      settingsManager.remapKey(rebindTarget.action, rebindTarget.index, e.code);
      setRebindTarget(null);
      reloadSaveSlots();
    };

    window.addEventListener("keydown", handleRebindCapture);
    return () => {
      window.removeEventListener("keydown", handleRebindCapture);
    };
  }, [rebindTarget, setRebindTarget, reloadSaveSlots]);
}
`,"src/hooks/useSaveSlots.ts":`import { useState, useEffect } from "react";
import { saveManager, SaveSlotData } from "@/core/SaveManager";
import { soundSynth } from "@/core/SoundSynth";

export function useSaveSlots() {
  const [slots, setSlots] = useState<SaveSlotData[]>([]);
  const [copySourceIndex, setCopySourceIndex] = useState<number>(-1);
  const [isCopyMode, setIsCopyMode] = useState<boolean>(false);
  const [isEraseMode, setIsEraseMode] = useState<boolean>(false);

  const reloadSaveSlots = () => {
    setSlots(saveManager.getSlots());
  };

  useEffect(() => {
    reloadSaveSlots();
  }, []);

  const handleSlotAction = (index: number, onPlay: () => void) => {
    if (isEraseMode) {
      saveManager.eraseSlot(index);
      setIsEraseMode(false);
      soundSynth.playErrorTick();
      reloadSaveSlots();
      return;
    }

    if (isCopyMode) {
      if (copySourceIndex === -1) {
        if (slots[index]?.empty) {
          soundSynth.playErrorTick();
          return;
        }
        setCopySourceIndex(index);
        soundSynth.playSelectTick();
      } else {
        if (index === copySourceIndex) {
          soundSynth.playErrorTick();
          return;
        }
        saveManager.copySlot(copySourceIndex, index);
        setCopySourceIndex(-1);
        setIsCopyMode(false);
        soundSynth.playSelectTick();
        reloadSaveSlots();
      }
      return;
    }

    saveManager.selectSlot(index);
    soundSynth.playHitConfirm();
    onPlay();
  };

  const toggleCopyMode = () => {
    soundSynth.playSelectTick();
    setIsCopyMode(!isCopyMode);
    setCopySourceIndex(-1);
    setIsEraseMode(false);
  };

  const toggleEraseMode = () => {
    soundSynth.playSelectTick();
    setIsEraseMode(!isEraseMode);
    setIsCopyMode(false);
  };

  const resetActions = () => {
    setIsCopyMode(false);
    setIsEraseMode(false);
    setCopySourceIndex(-1);
  };

  return {
    slots,
    copySourceIndex,
    isCopyMode,
    isEraseMode,
    reloadSaveSlots,
    handleSlotAction,
    toggleCopyMode,
    toggleEraseMode,
    resetActions,
  };
}
`,"src/index.css":`:root {
  --void-bg: #07080b;
  --surface-bg: #0c0e12;
  --surface-elevated: #141820;
  --surface-highlight: #1d222d;
  --signal-green: #22c55e;
  --signal-green-glow: rgba(34, 197, 94, 0.45);
  --signal-red: #ef4444;
  --signal-red-glow: rgba(239, 68, 68, 0.45);
  --signal-yellow: #eab308;
  --signal-yellow-glow: rgba(234, 179, 8, 0.45);

  --shadow-light: -4px -4px 12px rgba(255, 255, 255, 0.03);
  --shadow-dark: 6px 6px 18px rgba(0, 0, 0, 0.75);
  --shadow-inset-light: inset -2px -2px 6px rgba(255, 255, 255, 0.01);
  --shadow-inset-dark: inset 3px 3px 10px rgba(0, 0, 0, 0.9);
}

html,
body,
#root {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background-color: #050505;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

body {
  background-color: var(--void-bg);
  font-family: "SF Mono", Monaco, Consolas, monospace;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-col-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.flex-row-center {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: var(--surface-bg);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: var(--signal-green);
  border-radius: 2px;
  box-shadow: 0 0 6px var(--signal-green-glow);
}

::-webkit-scrollbar-thumb:hover {
  background: #4ade80;
}
`,"src/main.tsx":`import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`,"src/store/useGameStore.ts":`import { create } from "zustand";
import { soundSynth } from "@/core/SoundSynth";

export type ScreenState =
  | "TITLE"
  | "SAVE_SELECT"
  | "OPTIONS"
  | "SOUND"
  | "CONTROLS"
  | "CREDITS"
  | "SOURCE_VIEW"
  | "PLAYING";
export type GameResultState = "PLAYING" | "GAMEOVER" | "VICTORY";

const SCREEN_DEPTHS: Record<ScreenState, number> = {
  TITLE: 0,
  SAVE_SELECT: 1,
  OPTIONS: 1,
  CREDITS: 1,
  SOURCE_VIEW: 1,
  SOUND: 2,
  CONTROLS: 2,
  PLAYING: 2,
};

interface SessionState {
  currentScreen: ScreenState;
  menuIndex: number;
  gameResult: GameResultState;
  retryCount: number;
  navTo: (screen: ScreenState) => void;
  setMenuIndex: (index: number) => void;
  setGameResult: (result: GameResultState) => void;
  incrementRetry: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentScreen: "TITLE",
  menuIndex: 0,
  gameResult: "PLAYING",
  retryCount: 0,
  navTo: (screen) => {
    const current = get().currentScreen;

    // Trigger context-backed sound sweeps centrally based on numerical screen hierarchy depth checks
    if (soundSynth.initialized && current !== screen) {
      const currentDepth = SCREEN_DEPTHS[current] ?? 0;
      const targetDepth = SCREEN_DEPTHS[screen] ?? 0;

      if (targetDepth < currentDepth) {
        soundSynth.playMenuBack();
      } else {
        soundSynth.playMenuConfirm();
      }
    }

    set((state) => ({
      currentScreen: screen,
      menuIndex: 0,
      gameResult: "PLAYING",
      retryCount: screen === "PLAYING" ? state.retryCount + 1 : state.retryCount,
    }));
  },
  setMenuIndex: (index) => set({ menuIndex: index }),
  setGameResult: (result) => set({ gameResult: result }),
  incrementRetry: () => set((state) => ({ retryCount: state.retryCount + 1 })),
}));

interface GameplayState {
  playerHP: number;
  bossHP: number;
  healingCharges: number;
  determination: number;
  isGlitching: boolean;
  bossDeathCoordinates: { x: number; y: number } | null;
  setPlayerHP: (hp: number) => void;
  setBossHP: (hp: number) => void;
  setHealingCharges: (charges: number) => void;
  setDetermination: (determination: number) => void;
  triggerGlitch: (duration?: number) => void;
  triggerBossDefeat: (x: number, y: number) => void;
  resetGameSession: () => void;
}

export const useGameplayStore = create<GameplayState>((set, get) => ({
  playerHP: 5,
  bossHP: 30,
  healingCharges: 0,
  determination: 0,
  isGlitching: false,
  bossDeathCoordinates: null,
  setPlayerHP: (hp) => {
    const current = get().playerHP;
    if (hp !== current) {
      set({ playerHP: hp });
      if (hp < current) {
        get().triggerGlitch(150);
      }
    }
  },
  setBossHP: (hp) => {
    if (hp !== get().bossHP) {
      set({ bossHP: hp });
    }
  },
  setHealingCharges: (charges) => {
    if (charges !== get().healingCharges) {
      set({ healingCharges: charges });
    }
  },
  setDetermination: (det) => {
    if (det !== get().determination) {
      set({ determination: det });
    }
  },
  triggerGlitch: (duration = 150) => {
    set({ isGlitching: true });
    setTimeout(() => {
      set({ isGlitching: false });
    }, duration);
  },
  triggerBossDefeat: (x, y) => {
    set({ bossDeathCoordinates: { x, y } });
  },
  resetGameSession: () => {
    set({
      playerHP: 5,
      bossHP: 30,
      healingCharges: 0,
      determination: 0,
      isGlitching: false,
      bossDeathCoordinates: null,
    });
  },
}));
`,"src/styles/neomorphism.css":`.neo-elevated {
  background: var(--surface-elevated);
  box-shadow: var(--shadow-light), var(--shadow-dark);
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.neo-pressed {
  background: var(--surface-bg);
  box-shadow: var(--shadow-inset-light), var(--shadow-inset-dark);
  border: 1px solid rgba(0, 0, 0, 0.3);
}

.neo-btn {
  background: var(--surface-elevated);
  box-shadow: var(--shadow-light), var(--shadow-dark);
  border: 1px solid rgba(255, 255, 255, 0.02);
  color: #a0aec0;
  padding: 2.2vmin 4.4vmin;
  font-size: 1.7vmin;
  font-weight: bold;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border-radius: 1.2vmin;
  cursor: pointer;
  transition: all 0.1s cubic-bezier(0.25, 0.8, 0.25, 1);
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8vmin;
  -webkit-tap-highlight-color: transparent;
}

.neo-btn:hover {
  background: var(--surface-highlight);
  color: #ffffff;
}

.neo-btn:active {
  transform: scale(0.97);
  background: var(--surface-bg);
}

.neo-btn-focused {
  background: var(--surface-bg);
  box-shadow: var(--shadow-inset-light), var(--shadow-inset-dark);
  color: var(--signal-green);
  border-color: rgba(34, 197, 94, 0.25);
  text-shadow: 0 0 8px var(--signal-green-glow);
}

.led-dot {
  width: 1.3vmin;
  height: 1.3vmin;
  border-radius: 25%;
  transition: all 0.2s ease;
}

.led-green {
  background: var(--signal-green);
  box-shadow:
    0 0 8px var(--signal-green),
    0 0 16px var(--signal-green-glow);
}

.led-red {
  background: var(--signal-red);
  box-shadow:
    0 0 8px var(--signal-red),
    0 0 16px var(--signal-red-glow);
}

.led-yellow {
  background: var(--signal-yellow);
  box-shadow:
    0 0 8px var(--signal-yellow),
    0 0 16px var(--signal-yellow-glow);
}

.custom-range-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 1.2vmin;
  border-radius: 0.6vmin;
  background: var(--surface-bg);
  box-shadow: var(--shadow-inset-light), var(--shadow-inset-dark);
  outline: none;
  margin: 1vmin 0;
  border: 1px solid rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.custom-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 2.2vmin;
  height: 2.6vmin;
  border-radius: 0.6vmin;
  background: var(--surface-elevated);
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow:
    -2px -2px 6px rgba(255, 255, 255, 0.01),
    4px 4px 10px rgba(0, 0, 0, 0.8),
    inset 1px 1px 0px rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition:
    transform 0.1s ease,
    border-color 0.1s ease;
}

.custom-range-slider:focus::-webkit-slider-thumb,
.custom-range-slider::-webkit-slider-thumb:hover {
  border-color: var(--signal-green);
  transform: scale(1.08);
}

.custom-range-slider::-moz-range-thumb {
  width: 2.2vmin;
  height: 2.6vmin;
  border-radius: 0.6vmin;
  background: var(--surface-elevated);
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow:
    -2px -2px 6px rgba(255, 255, 255, 0.01),
    4px 4px 10px rgba(0, 0, 0, 0.8),
    inset 1px 1px 0px rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition:
    transform 0.1s ease,
    border-color 0.1s ease;
}

.custom-range-slider:focus::-moz-range-thumb,
.custom-range-slider::-moz-range-thumb:hover {
  border-color: var(--signal-green);
  transform: scale(1.08);
}

.custom-range-slider::-moz-range-progress {
  background: var(--signal-green);
  height: 1.2vmin;
  border-radius: 0.6vmin;
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-right: none;
}

@media (max-width: 768px) and (pointer: coarse) {
  .neo-btn {
    padding: 16px 32px;
    font-size: 15px;
    border-radius: 12px;
  }
  .led-dot {
    width: 14px;
    height: 14px;
  }
  .custom-range-slider {
    height: 12px;
    border-radius: 6px;
    margin: 10px 0;
  }
  .custom-range-slider::-webkit-slider-thumb {
    width: 28px;
    height: 32px;
    border-radius: 6px;
  }
  .custom-range-slider::-moz-range-thumb {
    width: 28px;
    height: 32px;
    border-radius: 6px;
  }
}
`},l=i();function u(e){let t={name:`root`,path:``,isDir:!0,children:[],depth:-1};e.forEach(e=>{let n=e.split(`/`),r=t;n.forEach((t,i)=>{let a=i<n.length-1,o=n.slice(0,i+1).join(`/`),s=r.children.find(e=>e.name===t);s||(s={name:t,path:a?o:e,isDir:a,children:[],depth:i},r.children.push(s)),r=s})});let n=e=>{e.children.sort((e,t)=>e.isDir&&!t.isDir?-1:!e.isDir&&t.isDir?1:e.name.localeCompare(t.name)),e.children.forEach(n)};return n(t),t}function d(e,t,n=[]){return e.depth===-1?(e.children.forEach(e=>d(e,t,n)),n):(n.push(e),e.isDir&&t[e.path]&&e.children.forEach(e=>d(e,t,n)),n)}function f(e){let t=e.split(`.`).pop()||``;return t===`tsx`?`tsx`:t===`ts`?`typescript`:t===`js`||t===`jsx`?`javascript`:t===`css`?`css`:t===`json`?`json`:t===`md`?`markdown`:`text`}function p({onBack:e}){let[n]=(0,s.useState)(c),[i,p]=(0,s.useState)({src:!0,"src/components":!0,"src/core":!0}),[m,h]=(0,s.useState)(0),[g,_]=(0,s.useState)(``),[v,y]=(0,s.useState)(!1),[b,x]=(0,s.useState)(`TOC`),S=(0,s.useRef)(null),C=(0,s.useMemo)(()=>u(Object.keys(c)),[]),w=(0,s.useMemo)(()=>C?d(C,i):[],[C,i]),T=()=>{o.playHitConfirm();let e=document.createElement(`a`);e.href=`./all_source_code.txt`,e.download=`all_source_code.txt`,document.body.appendChild(e),e.click(),document.body.removeChild(e)};return(0,s.useEffect)(()=>{if(typeof window<`u`){let e=()=>{y(window.innerWidth<=800)};return e(),window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)}},[]),(0,s.useEffect)(()=>{let e=Object.keys(c).sort();e.length>0&&_(e[0])},[]),(0,s.useEffect)(()=>{h(e=>Math.min(e,Math.max(0,w.length-1)))},[w]),(0,s.useEffect)(()=>{let t=t=>{if(w.length===0)return;let n=a.getKeyMap(),r=n.JUMP||[],s=n.ATTACK||[],c=n.DASH||[],l=t.key===`Enter`||t.key===` `||t.code===`Space`||r.includes(t.code)||r.includes(t.key),u=t.key===`Escape`||t.key===`Backspace`||s.includes(t.code)||s.includes(t.key)||c.includes(t.code)||c.includes(t.key);if(v&&b===`CODE`&&(u||t.key===`ArrowLeft`||t.key===`KeyA`)){t.preventDefault(),o.playSelectTick(),x(`TOC`);return}let d=w[m<w.length?m:0];if(t.key===`ArrowDown`||t.key===`KeyS`)t.preventDefault(),o.playSelectTick(),h(e=>e>=w.length?e===w.length+2?0:e+1:e===w.length-1?w.length:e+1);else if(t.key===`ArrowUp`||t.key===`KeyW`)t.preventDefault(),o.playSelectTick(),h(e=>e>=w.length?e===w.length?w.length-1:e-1:e===0?w.length+2:e-1);else if(t.key===`ArrowRight`||t.key===`KeyD`)t.preventDefault(),o.playSelectTick(),m<w.length?d.isDir&&!i[d.path]&&p(e=>({...e,[d.path]:!0})):h(e=>e===w.length+2?0:e+1);else if(t.key===`ArrowLeft`||t.key===`KeyA`)if(t.preventDefault(),o.playSelectTick(),m<w.length)if(d.isDir&&i[d.path])p(e=>({...e,[d.path]:!1}));else{let e=d.path.split(`/`);if(e.length>1){let t=e.slice(0,-1).join(`/`),n=w.findIndex(e=>e.isDir&&e.path===t);if(n!==-1){h(n);return}}h(w.length+2)}else h(e=>e===w.length?w.length-1:e-1);else l?(t.preventDefault(),m<w.length?(o.playHitConfirm(),d.isDir?p(e=>({...e,[d.path]:!e[d.path]})):(_(d.path),v&&x(`CODE`))):m===w.length?(o.playHitConfirm(),window.open(`https://github.com/stevencasteel/BOX-BATTLE`,`_blank`)):m===w.length+1?T():m===w.length+2&&(o.playErrorTick(),e())):u&&(t.preventDefault(),m<w.length?d.isDir&&i[d.path]?(o.playErrorTick(),p(e=>({...e,[d.path]:!1}))):(o.playSelectTick(),h(w.length+2)):m===w.length+2?(o.playErrorTick(),e()):(o.playSelectTick(),h(w.length+2)))};return window.addEventListener(`keydown`,t),()=>window.removeEventListener(`keydown`,t)},[w,m,i,e,v,b]),(0,s.useEffect)(()=>{if(m<w.length){let e=S.current?.querySelector(`.file-item-active`);e&&e.scrollIntoView({block:`nearest`,behavior:`smooth`})}},[m,w.length]),(0,l.jsxs)(`div`,{className:`flex-col h-full w-full`,style:{justifyContent:`space-between`,boxSizing:`border-box`,padding:`16px 0`},children:[(0,l.jsxs)(`div`,{className:`title-banner`,style:{marginTop:`0`,paddingTop:`0`},children:[(0,l.jsx)(`h2`,{style:{fontSize:`1.8rem`,margin:0,fontWeight:`bold`,textTransform:`uppercase`,letterSpacing:`0.15em`,color:`#fff`},children:`SOURCE VIEWER`}),(0,l.jsx)(`p`,{style:{color:`#718096`,margin:`4px 0 0`,fontSize:`11px`,letterSpacing:`0.15em`},children:v?b===`TOC`?`TAP FILE TO VIEW  •  DRAG TO SCROLL`:`SWIPE TO SCROLL  •  TAP BUTTON TO EXIT CODE`:`UP/DOWN/LEFT/RIGHT: NAVIGATE  •  JUMP: ENTER/OPEN  •  ATTACK/DASH: EXIT`})]}),(0,l.jsxs)(`div`,{className:`source-view-workspace`,children:[(!v||b===`TOC`)&&(0,l.jsx)(`div`,{ref:S,className:`directory-tree-pane neo-pressed`,style:{WebkitOverflowScrolling:`touch`,width:v?`100%`:`24%`,height:v?`100%`:``},children:w.map((e,t)=>{let n=t===m,r=e.isDir&&!!i[e.path],a=!e.isDir&&e.path===g;return(0,l.jsxs)(`div`,{className:n?`file-item-active`:``,onClick:()=>{o.playSelectTick(),h(t),e.isDir?p(t=>({...t,[e.path]:!t[e.path]})):(_(e.path),v&&x(`CODE`))},style:{paddingTop:v?`14px`:`6px`,paddingBottom:v?`14px`:`6px`,paddingRight:v?`16px`:`10px`,paddingLeft:`${e.depth*(v?22:16)+(v?16:10)}px`,borderRadius:`6px`,fontSize:v?`13px`:`11px`,fontFamily:`monospace`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`8px`,color:n?`var(--signal-green)`:a?`#ffffff`:e.isDir?`#718096`:`#4a5568`,background:n?`rgba(34, 197, 94, 0.08)`:a?`rgba(255, 255, 255, 0.03)`:`transparent`,border:n?`1px solid rgba(34, 197, 94, 0.25)`:`1px solid transparent`,textShadow:n?`0 0 6px var(--signal-green-glow)`:`none`,wordBreak:`break-all`,transition:`all 0.12s ease`,textAlign:`left`},children:[(0,l.jsx)(`span`,{style:{minWidth:`12px`,fontSize:`10px`},children:e.isDir?r?`▼`:`▶`:` `}),(0,l.jsx)(`span`,{style:{fontSize:`13px`},children:e.isDir?r?`📂`:`📁`:`📄`}),(0,l.jsx)(`span`,{style:{fontWeight:e.isDir?`bold`:`normal`},children:e.name})]},e.path+`-`+t)})}),(!v||b===`CODE`)&&(0,l.jsxs)(`div`,{className:`code-viewer-pane neo-pressed`,style:{WebkitOverflowScrolling:`touch`,width:v?`100%`:`76%`,height:v?`100%`:``,display:`flex`,flexDirection:`column`},children:[v&&(0,l.jsx)(`button`,{onClick:()=>{o.playSelectTick(),x(`TOC`)},className:`neo-btn`,style:{width:`100%`,padding:`12px`,fontSize:`12px`,marginBottom:`12px`,borderColor:`var(--signal-green)`,color:`var(--signal-green)`,flexShrink:0,borderRadius:`8px`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`8px`},children:`📁 BACK TO DIRECTORY`}),g?(0,l.jsxs)(`div`,{style:{textAlign:`left`,fontSize:`11px`,fontFamily:`monospace`,display:`flex`,flexDirection:`column`,height:`100%`,overflow:`hidden`},children:[(0,l.jsxs)(`div`,{style:{color:`hsl(142, 70%, 75%)`,marginBottom:`14px`,fontFamily:`monospace`,flexShrink:0,fontSize:v?`10px`:`11px`,wordBreak:`break-all`},children:[`// FILE: `,g]}),(0,l.jsx)(`div`,{style:{flexGrow:1,overflow:`auto`},children:(0,l.jsx)(t,{language:f(g),style:r,customStyle:{margin:0,padding:0,background:`transparent`,fontSize:v?`10px`:`11px`,lineHeight:`1.5`},children:n[g]||``})})]}):(0,l.jsx)(`span`,{style:{color:`#4a5568`,fontSize:`11px`},children:`Select a file in the directory tree to view content.`})]})]}),v?(0,l.jsxs)(`div`,{className:`source-view-footer`,style:{display:`flex`,flexDirection:`row`,gap:`8px`,width:`100%`,justifyContent:`space-between`,boxSizing:`border-box`,marginTop:`12px`,flexShrink:0},children:[(0,l.jsx)(`div`,{style:{flex:1,display:`flex`},children:(0,l.jsx)(`a`,{href:`https://github.com/stevencasteel/BOX-BATTLE`,target:`_blank`,rel:`noopener noreferrer`,className:`neo-btn`,style:{width:`100%`,padding:`12px`,fontSize:`12px`,textDecoration:`none`,display:`flex`,alignItems:`center`,justifyContent:`center`,boxSizing:`border-box`},children:(0,l.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`22`,height:`22`,stroke:`currentColor`,strokeWidth:`2.5`,fill:`none`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,l.jsx)(`path`,{d:`M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22`})})})}),(0,l.jsx)(`div`,{style:{flex:1,display:`flex`},children:(0,l.jsx)(`button`,{onClick:T,className:`neo-btn`,style:{width:`100%`,padding:`12px`,fontSize:`12px`,boxSizing:`border-box`},children:(0,l.jsxs)(`svg`,{viewBox:`0 0 24 24`,width:`22`,height:`22`,stroke:`currentColor`,strokeWidth:`2.5`,fill:`none`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,l.jsx)(`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}),(0,l.jsx)(`polyline`,{points:`7 10 12 15 17 10`}),(0,l.jsx)(`line`,{x1:`12`,y1:`15`,x2:`12`,y2:`3`})]})})}),(0,l.jsx)(`div`,{style:{flex:1,display:`flex`},children:(0,l.jsx)(`button`,{onClick:e,className:`neo-btn`,style:{width:`100%`,padding:`12px`,fontSize:`12px`,boxSizing:`border-box`},children:(0,l.jsxs)(`svg`,{viewBox:`0 0 24 24`,width:`22`,height:`22`,stroke:`currentColor`,strokeWidth:`2.5`,fill:`none`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,l.jsx)(`line`,{x1:`19`,y1:`12`,x2:`5`,y2:`12`}),(0,l.jsx)(`polyline`,{points:`12 19 5 12 12 5`})]})})})]}):(0,l.jsxs)(`div`,{className:`source-view-footer`,style:{display:`flex`,flexDirection:`row`,gap:`16px`,width:`100%`,boxSizing:`border-box`,marginTop:`12px`,flexShrink:0},children:[(0,l.jsxs)(`a`,{href:`https://github.com/stevencasteel/BOX-BATTLE`,target:`_blank`,rel:`noopener noreferrer`,className:`neo-btn-large ${m===w.length?`neo-btn-large-focused`:``}`,style:{flex:1,textDecoration:`none`,boxSizing:`border-box`},children:[(0,l.jsx)(`div`,{className:`btn-indicator-light`}),(0,l.jsxs)(`div`,{className:`btn-label-group`,children:[(0,l.jsxs)(`span`,{className:`btn-main-label`,style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,l.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`18`,height:`18`,stroke:`currentColor`,strokeWidth:`2.5`,fill:`none`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,l.jsx)(`path`,{d:`M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22`})}),`GITHUB REPO`]}),(0,l.jsx)(`span`,{className:`btn-sub-label`,children:`VIEW AND DOWNLOAD CODE ARCHIVE`})]}),m===w.length&&(0,l.jsx)(`span`,{className:`cursor-arrow-large`,children:`▶`})]}),(0,l.jsxs)(`button`,{onClick:T,className:`neo-btn-large ${m===w.length+1?`neo-btn-large-focused`:``}`,style:{flex:1,boxSizing:`border-box`},children:[(0,l.jsx)(`div`,{className:`btn-indicator-light`}),(0,l.jsxs)(`div`,{className:`btn-label-group`,children:[(0,l.jsxs)(`span`,{className:`btn-main-label`,style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,l.jsxs)(`svg`,{viewBox:`0 0 24 24`,width:`18`,height:`18`,stroke:`currentColor`,strokeWidth:`2.5`,fill:`none`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,l.jsx)(`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}),(0,l.jsx)(`polyline`,{points:`7 10 12 15 17 10`}),(0,l.jsx)(`line`,{x1:`12`,y1:`15`,x2:`12`,y2:`3`})]}),`DOWNLOAD SOURCE`]}),(0,l.jsx)(`span`,{className:`btn-sub-label`,children:`SAVE ALL CODE AS SINGLE .TXT FILE`})]}),m===w.length+1&&(0,l.jsx)(`span`,{className:`cursor-arrow-large`,children:`▶`})]}),(0,l.jsxs)(`button`,{onClick:e,className:`neo-btn-large ${m===w.length+2?`neo-btn-large-focused`:``}`,style:{flex:1,boxSizing:`border-box`},children:[(0,l.jsx)(`div`,{className:`btn-indicator-light`}),(0,l.jsxs)(`div`,{className:`btn-label-group`,children:[(0,l.jsxs)(`span`,{className:`btn-main-label`,style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,l.jsxs)(`svg`,{viewBox:`0 0 24 24`,width:`18`,height:`18`,stroke:`currentColor`,strokeWidth:`2.5`,fill:`none`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,l.jsx)(`line`,{x1:`19`,y1:`12`,x2:`5`,y2:`12`}),(0,l.jsx)(`polyline`,{points:`12 19 5 12 12 5`})]}),`BACK TO MENU`]}),(0,l.jsx)(`span`,{className:`btn-sub-label`,children:`EXIT SOURCE CODE VIEW`})]}),m===w.length+2&&(0,l.jsx)(`span`,{className:`cursor-arrow-large`,children:`▶`})]})]})]})}export{p as SourceViewScreen};