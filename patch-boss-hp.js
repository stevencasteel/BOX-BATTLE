import fs from 'fs';

function patchFile(filePath, searchStr, replaceStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(searchStr)) {
    console.error("Could not find search pattern in: " + filePath);
    process.exit(1);
  }
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully patched: " + filePath);
}

// 1. Boss.ts
patchFile(
  'src/entities/Boss.ts',
  `    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 30,
      invincibilityDuration: 0.25,
    });`,
  `    this.health = this.addComponent(HealthComponent, new HealthComponent(), {
      maxHealth: 38,
      invincibilityDuration: 0.25,
    });`
);

// 2. useGameStore.ts (State Initialization)
patchFile(
  'src/store/useGameStore.ts',
  `  playerHP: 5,
  bossHP: 30,`,
  `  playerHP: 5,
  bossHP: 38,`
);

// 3. useGameStore.ts (State Reset)
patchFile(
  'src/store/useGameStore.ts',
  `  resetGameSession: () => {
    set({
      playerHP: 5,
      bossHP: 30,`,
  `  resetGameSession: () => {
    set({
      playerHP: 5,
      bossHP: 38,`
);

// 4. Engine.ts
patchFile(
  'src/core/Engine.ts',
  `    const nextPlayerHP = pHealth ? pHealth.currentHealth : 5;
    const nextBossHP = bHealth ? bHealth.currentHealth : 30;`,
  `    const nextPlayerHP = pHealth ? pHealth.currentHealth : 5;
    const nextBossHP = bHealth ? bHealth.currentHealth : 38;`
);

// 5. useHudSubscription.ts
patchFile(
  'src/hooks/useHudSubscription.ts',
  `      const bossWidth = (bossHP / 30) * 100 + "%";`,
  `      const bossWidth = (bossHP / 38) * 100 + "%";`
);

// 6. BattleDirector.ts
patchFile(
  'src/core/BattleDirector.ts',
  `    const bHealth = boss.getComponent(HealthComponent);
    if (bHealth) {
      if (bHealth.currentHealth < 30 && !this.hasTriggeredFirstHit) {
        this.hasTriggeredFirstHit = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "I found you. This battle ends now!" });
      }

      if (bHealth.currentHealth <= 21 && !this.hasTriggeredPhase2) {
        this.hasTriggeredPhase2 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "You won't beat me! Watch out for my rapid fire!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }

      if (bHealth.currentHealth <= 12 && !this.hasTriggeredPhase3) {
        this.hasTriggeredPhase3 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "This is my final stand! Prepare yourself!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }
    }`,
  `    const bHealth = boss.getComponent(HealthComponent);
    if (bHealth) {
      if (bHealth.currentHealth < 38 && !this.hasTriggeredFirstHit) {
        this.hasTriggeredFirstHit = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", { speaker: "player", text: "I found you. This battle ends now!" });
      }

      if (bHealth.currentHealth <= 27 && !this.hasTriggeredPhase2) {
        this.hasTriggeredPhase2 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "You won't beat me! Watch out for my rapid fire!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }

      if (bHealth.currentHealth <= 15 && !this.hasTriggeredPhase3) {
        this.hasTriggeredPhase3 = true;
        eventBroker.publish("DIALOGUE_TRIGGERED", {
          speaker: "boss",
          text: "This is my final stand! Prepare yourself!",
        });
        eventBroker.publish("BOSS_PHASE_SHIFT", undefined);
      }
    }`
);
