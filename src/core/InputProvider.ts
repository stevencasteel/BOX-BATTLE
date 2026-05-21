import { settingsManager } from "@/core/SettingsManager";

export type Action = "MOVE_LEFT" | "MOVE_RIGHT" | "MOVE_UP" | "MOVE_DOWN" | "JUMP" | "ATTACK" | "DASH";

class InputProvider {
  private pressTimestamps: Record<Action, number> = {
    MOVE_LEFT: 0,
    MOVE_RIGHT: 0,
    MOVE_UP: 0,
    MOVE_DOWN: 0,
    JUMP: 0,
    ATTACK: 0,
    DASH: 0
  };

  private pressed: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false
  };

  private justPressed: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false
  };

  private justReleased: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false
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
    const action = this.getActionFromCode(e.code);
    if (action) {
      e.preventDefault();
      if (!this.pressed[action]) {
        this.justPressed[action] = true;
        this.pressed[action] = true;
        this.pressTimestamps[action] = performance.now();
      }
    }
  };

  public consumeBufferedAction(action: Action, windowMs: number = 100): boolean {
    const elapsed = performance.now() - this.pressTimestamps[action];
    if (elapsed <= windowMs) {
      this.pressTimestamps[action] = 0;
      return true;
    }
    return false;
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    const action = this.getActionFromCode(e.code);
    if (action) {
      e.preventDefault();
      if (this.pressed[action]) {
        this.justReleased[action] = true;
        this.pressed[action] = false;
      }
    }
  };

  private handleBlur = () => {
    for (const key in this.pressed) {
      const action = key as Action;
      this.pressed[action] = false;
      this.justPressed[action] = false;
      this.justReleased[action] = false;
      this.pressTimestamps[action] = 0;
    }
  };

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

  public postUpdate() {
    for (const key in this.justPressed) {
      const action = key as Action;
      this.justPressed[action] = false;
      this.justReleased[action] = false;
    }
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
