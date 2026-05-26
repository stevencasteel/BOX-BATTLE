import { Volume2, Keyboard } from "lucide-react";
import { MenuContainer, MenuHeader, MenuButton, MenuBackButton } from "./MenuPrimitives";

interface SettingsScreenProps {
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
    <MenuContainer>
      <MenuHeader title="SETTINGS" subtitle="Configure sound decibels and keyboard matrices" />

      <div className="btn-container-overhauled" style={{ zIndex: 2 }}>
        <MenuButton
          isFocused={menuIndex === 0}
          onFocused={() => setMenuIndex(0)}
          playHoverTick={playHoverTick}
          onClick={onAudio}
          leftIcon={<Volume2 size={18} strokeWidth={2} style={{ flexShrink: 0 }} />}
          mainLabel="SOUND SETTINGS"
          subLabel="ADJUST GAME SOUNDS AND MUSIC VOLUME"
        />

        <MenuButton
          isFocused={menuIndex === 1}
          onFocused={() => setMenuIndex(1)}
          playHoverTick={playHoverTick}
          onClick={onControls}
          leftIcon={<Keyboard size={18} strokeWidth={2} style={{ flexShrink: 0 }} />}
          mainLabel="KEYBOARD CONTROLS"
          subLabel="CALIBRATE INPUTS AND REMAP KEYS"
        />
      </div>

      <MenuBackButton
        isFocused={menuIndex === 2}
        onFocused={() => setMenuIndex(2)}
        playHoverTick={playHoverTick}
        onBack={onBack}
      />
    </MenuContainer>
  );
}
