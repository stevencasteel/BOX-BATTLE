import fs from 'fs';

function patchFile(filePath, search, replace) {
  if (!fs.existsSync(filePath)) {
    console.error("File not found: " + filePath);
    process.exit(1);
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(search)) {
    console.error("Search target not found in " + filePath);
    process.exit(1);
  }
  content = content.replace(search, replace);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully patched: " + filePath);
}

patchFile(
  'src/core/Engine.ts',
  'const nextPlayerHP = pHealth ? pHealth.currentHealth : 5;\n    const nextBossHP = bHealth ? bHealth.currentHealth : 30;',
  'const nextPlayerHP = pHealth ? pHealth.currentHealth : UNITS.PLAYER_MAX_HP;\n    const nextBossHP = bHealth ? bHealth.currentHealth : UNITS.BOSS_MAX_HP;'
);

patchFile(
  'src/entities/Player.ts',
  '    this.health = this.addComponent(HealthComponent, new HealthComponent(), {\n      maxHealth: 5,\n      invincibilityDuration: 1.5,\n    });',
  '    this.health = this.addComponent(HealthComponent, new HealthComponent(), {\n      maxHealth: UNITS.PLAYER_MAX_HP,\n      invincibilityDuration: 1.5,\n    });'
);

patchFile(
  'src/hooks/useHudSubscription.ts',
  'let lastPlayerHP = 5;',
  'let lastPlayerHP = UNITS.PLAYER_MAX_HP;'
);
