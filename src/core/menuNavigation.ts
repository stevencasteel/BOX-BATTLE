import { settingsManager } from "./SettingsManager";

export function getKeyMap() {
  return settingsManager.getKeyMap();
}

export function isConfirmKey(e: KeyboardEvent): boolean {
  const jumpKeys = getKeyMap()["JUMP"] || [];
  return (
    e.key === "Enter" ||
    e.key === " " ||
    e.code === "Space" ||
    jumpKeys.includes(e.code) ||
    jumpKeys.includes(e.key)
  );
}

export function isBackKey(e: KeyboardEvent): boolean {
  const attackKeys = getKeyMap()["ATTACK"] || [];
  const dashKeys = getKeyMap()["DASH"] || [];
  return (
    e.key === "Escape" ||
    e.key === "Backspace" ||
    attackKeys.includes(e.code) ||
    attackKeys.includes(e.key) ||
    dashKeys.includes(e.code) ||
    dashKeys.includes(e.key)
  );
}
