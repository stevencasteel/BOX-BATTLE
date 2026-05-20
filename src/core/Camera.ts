export class Camera {
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
