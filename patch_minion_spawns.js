import fs from 'fs';

const filepath = 'src/entities/Minion.ts';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Minion spawning trigger at end of constructor
const constructorTarget = `    this.pointA = { ...startPos };
    this.pointB = { x: startPos.x, y: startPos.y - 180 };
    this.behavior = new FlyerBehavior();
  }
}`;

const constructorReplacement = `    this.pointA = { ...startPos };
    this.pointB = { x: startPos.x, y: startPos.y - 180 };
    this.behavior = new FlyerBehavior();
  }
  eventBroker.publish("MINION_SPAWNING", undefined);
}`;

// 2. Minion dissolving trigger at start of death sequence
const deathTarget = `public startDeathSequence() {
  this.isDying = true;
  this.dissolveTimer = 0.5;`;

const deathReplacement = `public startDeathSequence() {
  eventBroker.publish("MINION_DISSOLVING", undefined);
  this.isDying = true;
  this.dissolveTimer = 0.5;`;

if (!content.includes(constructorTarget) || !content.includes(deathTarget)) {
  console.error("ERROR: Constructor or startDeathSequence targets not found in Minion.ts.");
  process.exit(1);
}

content = content.replace(constructorTarget, constructorReplacement);
content = content.replace(deathTarget, deathReplacement);

fs.writeFileSync(filepath, content, 'utf8');
console.log("Successfully patched Minion.ts with assembly and deconstruction event emitters.");
