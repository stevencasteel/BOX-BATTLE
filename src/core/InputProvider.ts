import { settingsManager } from "@/core/SettingsManager";

export type Action = "MOVE_LEFT" | "MOVE_RIGHT" | "MOVE_UP" | "MOVE_DOWN" | "JUMP" | "ATTACK" | "DASH";

export interface IInputDevice {
  update(): Record<Action, boolean>;
  isPauseJustPressed?(): boolean;
  cleanup?(): void;
}

export class KeyboardInputDevice implements IInputDevice {
  private pressed: Record<Action, boolean> = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    MOVE_UP: false,
    MOVE_DOWN: false,
    JUMP: false,
    ATTACK: false,
    DASH: false,
  };
  private pauseJustPressed = false;

  constructor() {
    // Listeners added lazily via activate()
  }

  public activate() {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("keyup", this.handleKeyUp);
    }
  }

  public deactivate() {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("keyup", this.handleKeyUp);
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
      this.pressed[action] = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const action = this.getActionFromCode(e.code);
    if (action) {
      e.preventDefault();
      this.pressed[action] = false;
    }
  };

  public update(): Record<Action, boolean> {
    return { ...this.pressed };
  }

  public triggerTouchStart(action: Action) {
    this.pressed[action] = true;
  }

  public triggerTouchEnd(action: Action) {
    this.pressed[action] = false;
  }

  public isPauseJustPressed(): boolean {
    const val = this.pauseJustPressed;
    this.pauseJustPressed = false;
    return val;
  }

  public cleanup() {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("keyup", this.handleKeyUp);
    }
  }
}

export class GamepadInputDevice implements IInputDevice {
  public update(): Record<Action, boolean> {
    const pressed: Record<Action, boolean> = {
      MOVE_LEFT: false,
      MOVE_RIGHT: false,
      MOVE_UP: false,
      MOVE_DOWN: false,
      JUMP: false,
      ATTACK: false,
      DASH: false,
    };

    if (typeof navigator === "undefined" || !navigator.getGamepads) return pressed;

    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      if (gp.buttons[0]?.pressed) pressed["JUMP"] = true;
      if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) pressed["ATTACK"] = true;
      if (gp.buttons[1]?.pressed || gp.buttons[5]?.pressed || gp.buttons[7]?.pressed)
        pressed["DASH"] = true;

      const axisThreshold = 0.35;
      if (gp.axes[0] < -axisThreshold || gp.buttons[14]?.pressed) pressed["MOVE_LEFT"] = true;
      if (gp.axes[0] > axisThreshold || gp.buttons[15]?.pressed) pressed["MOVE_RIGHT"] = true;
      if (gp.axes[1] < -axisThreshold || gp.buttons[12]?.pressed) pressed["MOVE_UP"] = true;
      if (gp.axes[1] > axisThreshold || gp.buttons[13]?.pressed) pressed["MOVE_DOWN"] = true;
    }

    return pressed;
  }
}

class InputProvider {
  private devices: IInputDevice[] = [];
  private keyboardDevice!: KeyboardInputDevice;
  private pauseJustPressed = false;
  private pressTimestamps: Record<Action, number> = {
    MOVE_LEFT: 0,
    MOVE_RIGHT: 0,
    MOVE_UP: 0,
    MOVE_DOWN: 0,
    JUMP: 0,
    ATTACK: 0,
    DASH: 0,
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

  private hasVibrationSupport = typeof navigator !== "undefined" && !!navigator.vibrate;
  private active = true;

  constructor() {
    this.keyboardDevice = new KeyboardInputDevice();
    this.devices.push(this.keyboardDevice);
    this.devices.push(new GamepadInputDevice());
    this.keyboardDevice.activate();

    if (typeof window !== "undefined") {
      window.addEventListener("blur", this.handleBlur);
    }
  }

  public setActive(v: boolean) {
    this.active = v;
    if (v) {
      this.keyboardDevice.activate();
    } else {
      this.keyboardDevice.deactivate();
    }
  }

  public isActive(): boolean {
    return this.active;
  }

  private handleBlur = () => {
    this.pauseJustPressed = false;
    for (const key in this.pressed) {
      const action = key as Action;
      this.pressed[action] = false;
      this.justPressed[action] = false;
      this.justReleased[action] = false;
      this.pressTimestamps[action] = 0;
    }
  };

  public triggerTouchStart(action: Action) {
    this.keyboardDevice.triggerTouchStart(action);
  }

  public triggerTouchEnd(action: Action) {
    this.keyboardDevice.triggerTouchEnd(action);
  }

  public consumeBufferedAction(action: Action, windowMs = 100): boolean {
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

  public triggerHapticFeedback(strength: "light" | "medium" | "heavy") {
    if (this.hasVibrationSupport) {
      if (strength === "light") {
        navigator.vibrate(30);
      } else if (strength === "medium") {
        navigator.vibrate(80);
      } else if (strength === "heavy") {
        navigator.vibrate([150, 50, 150]);
      }
    }

    if (typeof navigator === "undefined" || !navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (gp && gp.vibrationActuator && gp.vibrationActuator.playEffect) {
        let weak = 0.2;
        let strong = 0.0;
        let duration = 100;

        if (strength === "medium") {
          weak = 0.5;
          strong = 0.3;
          duration = 200;
        } else if (strength === "heavy") {
          weak = 0.9;
          strong = 0.9;
          duration = 400;
        }

        gp.vibrationActuator
          .playEffect("dual-rumble", {
            startDelay: 0,
            duration: duration,
            weakMagnitude: weak,
            strongMagnitude: strong,
          })
          .catch(() => {});
      }
    }
  }

  public update() {
    const combinedPressed: Record<Action, boolean> = {
      MOVE_LEFT: false,
      MOVE_RIGHT: false,
      MOVE_UP: false,
      MOVE_DOWN: false,
      JUMP: false,
      ATTACK: false,
      DASH: false,
    };

    for (const device of this.devices) {
      const devicePressed = device.update();
      for (const key in combinedPressed) {
        const action = key as Action;
        if (devicePressed[action]) {
          combinedPressed[action] = true;
        }
      }
      if (device.isPauseJustPressed && device.isPauseJustPressed()) {
        this.pauseJustPressed = true;
      }
    }

    const actions: Action[] = ["MOVE_LEFT", "MOVE_RIGHT", "MOVE_UP", "MOVE_DOWN", "JUMP", "ATTACK", "DASH"];
    for (const action of actions) {
      const isNowPressed = combinedPressed[action];
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
    for (const device of this.devices) {
      if (device.cleanup) {
        device.cleanup();
      }
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("blur", this.handleBlur);
    }
  }
}

export const inputProvider = new InputProvider();
