import fs from 'fs';

const filepath = 'src/entities/Player.ts';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Coyote Ground Jump Patch
const coyoteTarget = `      else if (this.coyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        /* Visual Squash and Stretch: Stretch vertically on ground jump */
        this.visualScale = { x: 0.82, y: 1.18 };
        /* Spawn Jump Dust Puff */
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
      }`;

const coyoteReplacement = `      else if (this.coyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        /* Visual Squash and Stretch: Stretch vertically on ground jump */
        this.visualScale = { x: 0.82, y: 1.18 };
        /* Spawn Jump Dust Puff */
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
        eventBroker.publish("PLAYER_JUMPED", undefined);
      }`;

// 2. Wall Coyote Jump Patch
const wallTarget = `      else if (this.wallCoyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.velocity.x = this.lastWallNormal * 1650;
        this.wallCoyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.dashComponent.resetDashCharge();
        /* Visual Squash and Stretch: Stretch vertically on wall jump */
        this.visualScale = { x: 0.82, y: 1.18 };
        /* Spawn Wall Slide Dust Puff */
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
      }`;

const wallReplacement = `      else if (this.wallCoyoteTimer > 0) {
        this.velocity.y = -this.jumpForce;
        this.velocity.x = this.lastWallNormal * 1650;
        this.wallCoyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.dashComponent.resetDashCharge();
        /* Visual Squash and Stretch: Stretch vertically on wall jump */
        this.visualScale = { x: 0.82, y: 1.18 };
        /* Spawn Wall Slide Dust Puff */
        eventBroker.publish("SPAWN_DUST", { x: this.position.x, y: this.position.y + this.size.height / 2 });
        eventBroker.publish("PLAYER_JUMPED", undefined);
      }`;

// 3. Double Jump Patch
const doubleTarget = `      } else if (this.hasDoubleJump) {
        this.velocity.y = -this.jumpForce;
        this.hasDoubleJump = false;
        this.jumpBufferTimer = 0;
        /* Visual Squash and Stretch: Stretch vertically on double jump */
        this.visualScale = { x: 0.82, y: 1.18 };
      }`;

const doubleReplacement = `      } else if (this.hasDoubleJump) {
        this.velocity.y = -this.jumpForce;
        this.hasDoubleJump = false;
        this.jumpBufferTimer = 0;
        /* Visual Squash and Stretch: Stretch vertically on double jump */
        this.visualScale = { x: 0.82, y: 1.18 };
        eventBroker.publish("PLAYER_JUMPED", undefined);
      }`;

if (!content.includes(coyoteTarget) || !content.includes(wallTarget) || !content.includes(doubleTarget)) {
  console.error("ERROR: One or more jump block targets were not found in Player.ts.");
  process.exit(1);
}

content = content.replace(coyoteTarget, coyoteReplacement);
content = content.replace(wallTarget, wallReplacement);
content = content.replace(doubleTarget, doubleReplacement);

fs.writeFileSync(filepath, content, 'utf8');
console.log("Successfully patched Player.ts with all jump event publishers.");
