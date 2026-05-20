import { settingsManager } from "@/core/SettingsManager";

export type Action = "MOVE_LEFT" | "MOVE_RIGHT" | "MOVE_UP" | "MOVE_DOWN" | "JUMP" | "ATTACK" | "DASH";

class InputProvider {
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
      }
    }
  };

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
    }
  }
}

export const inputProvider = new InputProvider();
