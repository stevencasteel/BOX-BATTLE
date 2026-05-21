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

// Remove Registry imports and setup statements inside Engine.ts
replaceInFile(
  'src/core/Engine.ts',
  "import { Registry } from \"@/core/Registry\";\n",
  ""
);

replaceInFile(
  'src/core/Engine.ts',
  `    this.pool = new ObjectPool(() => new Projectile(), 60);
    this.world.projectilePool = this.pool;
    Registry.projectilePool = this.pool;`,
  `    this.pool = new ObjectPool(() => new Projectile(), 60);
    this.world.projectilePool = this.pool;`
);

replaceInFile(
  'src/core/Engine.ts',
  `    this.world.player = this.player;
    this.world.boss = this.boss;
    Registry.player = this.player;
    Registry.boss = this.boss;`,
  `    this.world.player = this.player;
    this.world.boss = this.boss;`
);

replaceInFile(
  'src/core/Engine.ts',
  `    Registry.player = null;
    Registry.boss = null;
    Registry.projectilePool = null;
    Camera.reset();
    this.systems.teardown();
    this.unsubDialogue();
    this.unsubEvents.forEach((unsub) => unsub());
    this.unsubEvents = [];
    this.particles = [];
    window.removeEventListener("keydown", this.handlePauseKey);
    Registry.player = null;
    Registry.boss = null;
    Registry.projectilePool = null;

    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];
    Registry.minions = [];`,
  `    Camera.reset();
    this.systems.teardown();
    this.unsubDialogue();
    this.unsubEvents.forEach((unsub) => unsub());
    this.unsubEvents = [];
    this.particles = [];
    window.removeEventListener("keydown", this.handlePauseKey);

    for (const spawner of this.activeSpawners) {
      spawner.cleanup();
    }
    this.world.minions = [];`
);

console.log("All Registry coupling references inside Engine.ts successfully removed.");
