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

  private keyboardPressed: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false
  };

  private gamepadPressed: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false
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
      DASH: false
    };

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      if (gp.buttons[0]?.pressed) currentGamepadPressed["JUMP"] = true;
      if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) currentGamepadPressed["ATTACK"] = true;
      if (gp.buttons[1]?.pressed || gp.buttons[5]?.pressed || gp.buttons[7]?.pressed) currentGamepadPressed["DASH"] = true;

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
