export class Camera {
  public static offsetX = 0;
  public static offsetY = 0;
  public static hitStopTimer = 0;

  private static shakeTimer = 0;
  private static shakeDuration = 0;
  private static shakeAmplitude = 0;
  private static noiseTime = 0;

  public static shake(amplitude: number, duration: number) {
    Camera.shakeAmplitude = amplitude;
    Camera.shakeDuration = duration;
    Camera.shakeTimer = duration;
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
        shakeX = this.noise(this.noiseTime) * currentAmp;
        shakeY = this.noise(this.noiseTime + 100) * currentAmp;
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
  }
}
