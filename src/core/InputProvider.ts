export type Action = "MOVE_LEFT" | "MOVE_RIGHT" | "MOVE_UP" | "MOVE_DOWN" | "JUMP" | "ATTACK" | "DASH";

class InputProvider {
  private keyMap: Record<string, Action> = {
    "ArrowLeft": "MOVE_LEFT",
    "KeyA": "MOVE_LEFT",
    "ArrowRight": "MOVE_RIGHT",
    "KeyD": "MOVE_RIGHT",
    "ArrowUp": "MOVE_UP",
    "KeyW": "MOVE_UP",
    "ArrowDown": "MOVE_DOWN",
    "KeyS": "MOVE_DOWN",
    "KeyX": "JUMP",
    "Space": "JUMP",
    "KeyC": "ATTACK",
    "KeyZ": "DASH"
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
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const action = this.keyMap[e.code];
    if (action) {
      // Prevent browser default scroll behaviors
      e.preventDefault();
      if (!this.pressed[action]) {
        this.justPressed[action] = true;
        this.pressed[action] = true;
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const action = this.keyMap[e.code];
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

  /**
   * Clears single-frame state buffers.
   * MUST be called at the very end of your Game Loop update tick.
   */
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
