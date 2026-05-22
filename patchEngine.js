import fs from 'fs';

const filePath = 'src/core/Engine.ts';
let fileContent = fs.readFileSync(filePath, 'utf8');

const oldInitListener = `    window.addEventListener("keydown", this.handlePauseKey);\n\n    this.particleSystem = new ParticleSystem();`;
const newInitListener = `    this.particleSystem = new ParticleSystem();`;

const oldCleanupListener = `    this.particleSystem.cleanup();\n    window.removeEventListener("keydown", this.handlePauseKey);`;
const newCleanupListener = `    this.particleSystem.cleanup();`;

const oldPauseMethod = `  private handlePauseKey = (e: KeyboardEvent) => {
    if (e.code === "KeyP") {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        soundSynth.playErrorTick();
        soundSynth.clearAllSlides();
      } else {
        soundSynth.playHitConfirm();
      }
    }
  };`;

const oldUpdate = `  public update(dt: number) {
    if (this.isPaused) {
      return;
    }
    this.accumulator += dt;
    if (this.accumulator > 0.25) {
      this.accumulator = 0.25;
    }

    while (this.accumulator >= this.fixedTimeStep) {
      this.fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }
  }`;

const newUpdate = `  public update(dt: number) {
    if (this.isPaused) {
      inputProvider.update();
      if (inputProvider.isPauseJustPressed()) {
        this.isPaused = false;
        soundSynth.playHitConfirm();
      }
      inputProvider.postUpdate();
      return;
    }
    this.accumulator += dt;
    if (this.accumulator > 0.25) {
      this.accumulator = 0.25;
    }

    while (this.accumulator >= this.fixedTimeStep) {
      this.fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }
  }`;

const oldFixedUpdate = `  private fixedUpdate(dt: number) {
    inputProvider.update();
    if (Camera.hitStopTimer > 0) {`;

const newFixedUpdate = `  private fixedUpdate(dt: number) {
    inputProvider.update();
    if (inputProvider.isPauseJustPressed()) {
      this.isPaused = true;
      soundSynth.playErrorTick();
      soundSynth.clearAllSlides();
      inputProvider.postUpdate();
      return;
    }
    if (Camera.hitStopTimer > 0) {`;

if (fileContent.includes(oldInitListener) && fileContent.includes(oldCleanupListener) && fileContent.includes(oldPauseMethod) && fileContent.includes(oldUpdate) && fileContent.includes(oldFixedUpdate)) {
  fileContent = fileContent.replace(oldInitListener, newInitListener);
  fileContent = fileContent.replace(oldCleanupListener, newCleanupListener);
  fileContent = fileContent.replace(oldPauseMethod, '');
  fileContent = fileContent.replace(oldUpdate, newUpdate);
  fileContent = fileContent.replace(oldFixedUpdate, newFixedUpdate);
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log('Successfully patched Engine.ts.');
} else {
  console.error('Error: Could not locate expected structures in Engine.ts');
  process.exit(1);
}
