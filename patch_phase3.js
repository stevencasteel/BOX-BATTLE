import fs from 'fs';

function replaceInFile(filepath, target, replacement) {
  const content = fs.readFileSync(filepath, 'utf8');
  if (!content.includes(target)) {
    console.error(`ERROR: Target string not found in ${filepath}`);
    process.exit(1);
  }
  fs.writeFileSync(filepath, content.split(target).join(replacement));
  console.log(`Successfully patched: ${filepath}`);
}

// 1. Safe cast window in SoundSynth.ts instead of utilizing 'any'
replaceInFile(
  'src/core/SoundSynth.ts',
  'const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;',
  'const AudioContextClass = window.AudioContext || (window as unknown as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;'
);

// 2. MeleeComponent imports and cleanups
replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  'import { IDamageRecorder, EntityStatus } from "@/core/Interfaces";',
  'import { IDamageRecorder, EntityStatus } from "@/core/Interfaces";\nimport { Player } from "@/entities/Player";'
);

replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  'const facing = (this.owner as any).facingDirection ?? 1;',
  'const facing = (this.owner as Player).facingDirection ?? 1;'
);

// Clean up IDamageRecorder casting and cleanly reference the optional core action
replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  `            const recorder = this.owner as unknown as IDamageRecorder;
            if (recorder.registerDamageDealt) {
              recorder.registerDamageDealt();
            }`,
  `            this.owner.registerDamageDealt?.();`
);

replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  `          const recorder = this.owner as unknown as IDamageRecorder;
          if (recorder.registerDamageDealt) {
            recorder.registerDamageDealt();
          }`,
  `          this.owner.registerDamageDealt?.();`
);

// Clean up SPAWN_SPARKS cast bypass
replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  'eventBroker.publish("SPAWN_SPARKS" as any, {',
  'eventBroker.publish("SPAWN_SPARKS", {'
);

replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  `        if (isHit) {
          this.owner.world.releaseProjectile(proj);
          const recorder = this.owner as unknown as IDamageRecorder;
          if (recorder.registerDamageDealt) {
            recorder.registerDamageDealt();
          }
          eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
        }`,
  `        if (isHit) {
          this.owner.world.releaseProjectile(proj);
          this.owner.registerDamageDealt?.();
          eventBroker.publish("CAMERA_SHAKE", { amplitude: 3, duration: 0.1 });
        }`
);

replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  `      if (isHit) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          health.takeDamage(1);
          const recorder = this.owner as unknown as IDamageRecorder;
          if (recorder.registerDamageDealt) {
            recorder.registerDamageDealt();
          }
        }`,
  `      if (isHit) {
        const health = target.getComponent(HealthComponent);
        if (health) {
          health.takeDamage(1);
          this.owner.registerDamageDealt?.();
        }`
);

replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  `        if (isHit) {
          this.owner.world.releaseProjectile(proj);
          const recorder = this.owner as unknown as IDamageRecorder;
          if (recorder.registerDamageDealt) {
            recorder.registerDamageDealt();
          }

          this.owner.velocity.y = -this.pogoForce;`,
  `        if (isHit) {
          this.owner.world.releaseProjectile(proj);
          this.owner.registerDamageDealt?.();

          this.owner.velocity.y = -this.pogoForce;`
);

replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  `        const player = this.owner as any;
        player.hasDoubleJump = true;
        if (player.dashComponent) {
          player.dashComponent.resetDashCharge();
        }`,
  `        const player = this.owner as Player;
        player.hasDoubleJump = true;
        if (player.dashComponent) {
          player.dashComponent.resetDashCharge();
        }`
);

replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  `        const player = this.owner as any;
        player.hasDoubleJump = true;
        if (player.dashComponent) {
          player.dashComponent.resetDashCharge();
        }`,
  `        const player = this.owner as Player;
        player.hasDoubleJump = true;
        if (player.dashComponent) {
          player.dashComponent.resetDashCharge();
        }`
);

replaceInFile(
  'src/entities/components/MeleeComponent.ts',
  `        const player = this.owner as any;
        player.hasDoubleJump = true;
        if (player.dashComponent) {
          player.dashComponent.resetDashCharge();
        }`,
  `        const player = this.owner as Player;
        player.hasDoubleJump = true;
        if (player.dashComponent) {
          player.dashComponent.resetDashCharge();
        }`
);

console.log("All Phase 3 high-fidelity casting cleanups applied successfully.");
