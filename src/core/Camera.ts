export class Camera {
  public static offsetX = 0;
  public static offsetY = 0;
  public static hitStopTimer = 0;

  private static shakeTimer = 0;
  private static shakeDuration = 0;
  private static shakeAmplitude = 0;
  private static noiseTime = 0;

  private static shakeDirX = 0;
  private static shakeDirY = 0;
  private static isDirectional = false;

  public static shake(amplitude: number, duration: number, dirX?: number, dirY?: number) {
    Camera.shakeAmplitude = amplitude;
    Camera.shakeDuration = duration;
    Camera.shakeTimer = duration;

    if (dirX !== undefined && dirY !== undefined) {
      const len = Math.sqrt(dirX * dirX + dirY * dirY);
      if (len > 0) {
        Camera.shakeDirX = dirX / len;
        Camera.shakeDirY = dirY / len;
        Camera.isDirectional = true;
      } else {
        Camera.isDirectional = false;
      }
    } else {
      Camera.isDirectional = false;
    }
  }

  public static triggerHitStop(duration: number) {
    Camera.hitStopTimer = duration;
  }

  // Fractional sine noise lookup to replace jerky Math.random() with coherent camera tremors
  private static noise(t: number): number {
    return Math.sin(t * 17.1) * 0.43 + Math.sin(t * 31.7) * 0.27 + Math.sin(t * 7.3) * 0.3;
  }

  public static update(dt: number) {
    // 1. Tick Hit Stop
    if (Camera.hitStopTimer > 0) {
      Camera.hitStopTimer -= dt;
    }

    this.noiseTime += dt * 45; // Coherent noise update speed

    // 2. Tick Screen Shake
    let shakeX = 0;
    let shakeY = 0;

    if (Camera.shakeTimer > 0) {
      Camera.shakeTimer -= dt;

      if (Camera.shakeTimer > 0) {
        const decay = Camera.shakeTimer / Camera.shakeDuration;
        const currentAmp = Camera.shakeAmplitude * decay;
        const rawX = this.noise(this.noiseTime) * currentAmp;
        const rawY = this.noise(this.noiseTime + 100) * currentAmp;

        if (Camera.isDirectional) {
          const parallel = (rawX * Camera.shakeDirX + rawY * Camera.shakeDirY) * 0.8;
          const perpendicular = (-rawX * Camera.shakeDirY + rawY * Camera.shakeDirX) * 0.2;
          shakeX = parallel * Camera.shakeDirX - perpendicular * Camera.shakeDirY;
          shakeY = parallel * Camera.shakeDirY + perpendicular * Camera.shakeDirX;
        } else {
          shakeX = rawX;
          shakeY = rawY;
        }
      }
    }

    // Centered camera offset only driven by screen shake
    Camera.offsetX = shakeX;
    Camera.offsetY = shakeY;
  }

  public static reset() {
    Camera.offsetX = 0;
    Camera.offsetY = 0;
    Camera.shakeTimer = 0;
    Camera.hitStopTimer = 0;
    Camera.noiseTime = 0;
    Camera.shakeDirX = 0;
    Camera.shakeDirY = 0;
    Camera.isDirectional = false;
  }
}
