import { Gamepad2, Sliders, Award, Code2 } from "lucide-react";
import { MenuContainer, MenuHeader, MenuButton } from "./MenuPrimitives";

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
    <MenuContainer hasGridOverlay>
      <div className="title-screen-header">
        <div className="system-tag">WELCOME TO THE ARENA</div>
        <MenuHeader title="BOX BATTLE" subtitle="RETRO ACTION GAME" />
      </div>

      <div className="title-screen-center">
        <div className="btn-container-overhauled">
          <MenuButton
            isFocused={menuIndex === 0}
            onFocused={() => setMenuIndex(0)}
            playHoverTick={playHoverTick}
            onClick={onPlay}
            leftIcon={<Gamepad2 size={18} strokeWidth={2} />}
            mainLabel="PLAY GAME"
            subLabel="CHOOSE A SAVE SLOT TO BEGIN"
          />

          <MenuButton
            isFocused={menuIndex === 1}
            onFocused={() => setMenuIndex(1)}
            playHoverTick={playHoverTick}
            onClick={onSettings}
            leftIcon={<Sliders size={18} strokeWidth={2} />}
            mainLabel="OPTIONS"
            subLabel="ADJUST SOUNDS AND CONTROLS"
          />

          <MenuButton
            isFocused={menuIndex === 2}
            onFocused={() => setMenuIndex(2)}
            playHoverTick={playHoverTick}
            onClick={onCredits}
            leftIcon={<Award size={18} strokeWidth={2} />}
            mainLabel="CREDITS"
            subLabel="GAME CREATOR AND DETAILS"
          />

          <MenuButton
            isFocused={menuIndex === 3}
            onFocused={() => setMenuIndex(3)}
            playHoverTick={playHoverTick}
            onClick={onSource}
            leftIcon={<Code2 size={18} strokeWidth={2} />}
            mainLabel="SOURCE CODE"
            subLabel="BROWSE CABINET ENGINE FILE TREE"
          />
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
    </MenuContainer>
  );
}
