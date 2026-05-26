import fs from 'fs';

function patchFile(filePath, patches) {
  if (!fs.existsSync(filePath)) {
    console.error("File not found: " + filePath);
    process.exit(1);
  }
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of patches) {
    if (!content.includes(search)) {
      console.error("Search target not found in " + filePath + ": " + search);
      process.exit(1);
    }
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully patched: " + filePath);
}

patchFile('src/core/Engine.ts', [
  ['const nextPlayerHP = pHealth ? pHealth.currentHealth : 5;', 'const nextPlayerHP = pHealth ? pHealth.currentHealth : UNITS.PLAYER_MAX_HP;'],
  ['const nextBossHP = bHealth ? bHealth.currentHealth : 30;', 'const nextBossHP = bHealth ? bHealth.currentHealth : UNITS.BOSS_MAX_HP;']
]);

patchFile('src/entities/Player.ts', [
  ['maxHealth: 5,', 'maxHealth: UNITS.PLAYER_MAX_HP,']
]);

patchFile('src/hooks/useHudSubscription.ts', [
  ['let lastPlayerHP = 5;', 'let lastPlayerHP = UNITS.PLAYER_MAX_HP;']
]);
