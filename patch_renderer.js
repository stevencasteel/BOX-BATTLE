import fs from 'fs';

const targetFile = 'src/core/WorldRenderer.ts';
let fileContent = fs.readFileSync(targetFile, 'utf8').replace(/\r\n/g, '\n');

const oldSegment1 = `      if (t < 1.0) {
        const implodeProgress = t;
        const scale = Math.max(0, 1.0 - Math.pow(implodeProgress, 3));
        const radius = 135 * scale;
        const opacity = 1.0 - implodeProgress;

        if (radius > 1) {
          const rotationY = t * 2.5;
          const rotationX = t * 1.2;

          this.ctx.save();
          this.ctx.strokeStyle = \`rgba(34, 197, 94, \${opacity * 0.85})\`;
          this.ctx.shadowColor = "rgba(34, 197, 94, 0.9)";
          this.ctx.shadowBlur = 20 * (1.0 - implodeProgress);
          this.ctx.lineWidth = 1.5;

          this.ctx.beginPath();

          const latitudes = [-Math.PI / 4, 0, Math.PI / 4];
          const segments = 24;
          const step = (Math.PI * 2) / segments;

          for (let lIdx = 0; lIdx < latitudes.length; lIdx++) {
            const lat = latitudes[lIdx];
            const ringR = radius * Math.cos(lat);
            const ringY = radius * Math.sin(lat);

            for (let i = 0; i < segments; i++) {
              const theta1 = i * step + rotationY;
              const theta2 = (i + 1) * step + rotationY;

              const x1_0 = ringR * Math.cos(theta1);
              const z1_0 = ringR * Math.sin(theta1);
              const y1_0 = ringY;

              const x1 = x1_0;
              const y1 = y1_0 * Math.cos(rotationX) - z1_0 * Math.sin(rotationX);

              const x2_0 = ringR * Math.cos(theta2);
              const z2_0 = ringR * Math.sin(theta2);
              const y2_0 = ringY;

              const x2 = x2_0;
              const y2 = y2_0 * Math.cos(rotationX) - z2_0 * Math.sin(rotationX);

              this.ctx.moveTo(px + x1, py + y1 * 0.7);
              this.ctx.lineTo(px + x2, py + y2 * 0.7);
            }
          }

          const longitudes = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
          for (let loIdx = 0; loIdx < longitudes.length; loIdx++) {
            const long = longitudes[loIdx];
            for (let i = 0; i < segments; i++) {
              const theta1 = i * step + rotationX;
              const theta2 = (i + 1) * step + rotationX;

              const x1_0 = radius * Math.cos(theta1) * Math.cos(long);
              const y1_0 = radius * Math.sin(theta1);
              const z1_0 = radius * Math.cos(theta1) * Math.sin(long);

              const x1 = x1_0 * Math.cos(rotationY) + z1_0 * Math.sin(rotationY);
              const y1 = y1;

              const x2_0 = radius * Math.cos(theta2) * Math.cos(long);
              const y2_0 = radius * Math.sin(theta2);
              const z2_0 = radius * Math.cos(theta2) * Math.sin(long);

              const x2 = x2_0 * Math.cos(rotationY) + z2_0 * Math.sin(rotationY);
              const y2 = y2;

              this.ctx.moveTo(px + x1, py + y1 * 0.7);
              this.ctx.lineTo(px + x2, py + y2 * 0.7);
            }
          }

          this.ctx.stroke();
          this.ctx.restore();
        }
      }`;

const newSegment1 = `      if (t < 1.0) {
        const progress = t;
        this.ctx.save();

        const isPlayer = !!(world.player && world.player.isDead);
        const primaryColor = isPlayer ? "hsl(142, 71%, 58%)" : "hsl(350, 80%, 60%)";
        const secondaryColor = isPlayer ? "hsl(280, 80%, 65%)" : "hsl(45, 100%, 65%)";

        const sliceCount = 8;
        const baseWidth = 60;
        const baseHeight = 60;
        const scaleY = Math.max(0, 1.0 - progress);
        const scaleX = 1.0 + Math.sin(progress * Math.PI * 4) * 0.2 * (1.0 - progress);

        if (progress < 0.8) {
          for (let i = 0; i < sliceCount; i++) {
            const sliceHeight = (baseHeight / sliceCount);
            const localY = -baseHeight / 2 + i * sliceHeight;
            const currentY = py + localY * scaleY;

            const shakeX = (Math.sin(progress * 45 + i * 1.5) * 8 * (1.0 - progress)) + (Math.random() * 4 - 2);
            const currentX = px + shakeX;

            const sliceWidth = baseWidth * scaleX * (0.5 + 0.5 * Math.sin((i / sliceCount) * Math.PI));

            this.ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor;
            this.ctx.globalAlpha = 1.0 - progress;
            this.ctx.fillRect(currentX - sliceWidth / 2, currentY - (sliceHeight * scaleY) / 2, sliceWidth, sliceHeight * scaleY);
          }
        }

        if (progress >= 0.6) {
          const pinchProgress = (progress - 0.6) / 0.4;
          const lineLength = Math.max(2, 160 * (1.0 - Math.pow(pinchProgress, 2)));
          const lineHeight = Math.max(1, 10 * (1.0 - pinchProgress));
          const lineAlpha = pinchProgress;

          this.ctx.shadowColor = isPlayer ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)";
          this.ctx.shadowBlur = 20 * (1.0 - pinchProgress);

          this.ctx.fillStyle = "#ffffff";
          this.ctx.globalAlpha = lineAlpha;
          this.ctx.fillRect(px - lineLength / 2, py - lineHeight / 2, lineLength, lineHeight);
        }

        this.ctx.restore();
      }`;

const oldSegment2 = `      const particleCount = 24;
      const particleSpeed = 550;
      const particleLife = 1.0;
      const explodeT = t - 1.0;
      if (explodeT >= 0 && explodeT < particleLife) {
        const opacity = Math.max(0, 1 - explodeT / particleLife);
        this.ctx.save();
        this.ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        this.ctx.shadowBlur = 15;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + (i % 2 === 0 ? explodeT * 0.5 : -explodeT * 0.5);
          const distance = explodeT * particleSpeed * (0.6 + (0.4 * (i % 3)) / 3);
          const x = px + Math.cos(angle) * distance;
          const y = py + Math.sin(angle) * distance;

          this.ctx.fillStyle = \`rgba(34, 197, 94, \${opacity})\`;
          this.ctx.fillRect(x - 4, y - 4, 8, 8);
          this.ctx.fillStyle = \`rgba(255, 255, 255, \${opacity})\`;
          this.ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        this.ctx.restore();
      }`;

const newSegment2 = `      const orbCount = 12;
      const orbSpeed = 620;
      const orbLife = 1.0;
      const explodeT = t - 1.0;

      if (explodeT >= 0 && explodeT < orbLife) {
        const opacity = Math.max(0, 1 - explodeT / orbLife);
        const isPlayer = !!(world.player && world.player.isDead);
        const orbColor = isPlayer ? "hsl(142, 100%, 70%)" : "hsl(350, 100%, 70%)";
        const innerColor = "#ffffff";

        this.ctx.save();
        for (let i = 0; i < orbCount; i++) {
          const angle = (i / orbCount) * Math.PI * 2;

          const tailCount = 3;
          for (let j = 0; j < tailCount; j++) {
            const tailDelay = j * 0.045;
            const currentT = explodeT - tailDelay;
            if (currentT <= 0) continue;

            const currentDist = currentT * orbSpeed;
            const x = px + Math.cos(angle) * currentDist;
            const y = py + Math.sin(angle) * currentDist;

            const baseSize = 14 * (1.0 - currentT / orbLife);
            const size = baseSize * (1.0 - j * 0.28);
            const tailOpacity = opacity * (1.0 - j * 0.3);

            if (size <= 0.1) continue;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = orbColor;
            this.ctx.globalAlpha = tailOpacity * 0.45;
            this.ctx.shadowColor = orbColor;
            this.ctx.shadowBlur = size * 1.5;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
            this.ctx.fillStyle = orbColor;
            this.ctx.globalAlpha = tailOpacity;
            this.ctx.shadowBlur = 0;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
            this.ctx.fillStyle = innerColor;
            this.ctx.globalAlpha = tailOpacity;
            this.ctx.fill();
          }
        }
        this.ctx.restore();
      }`;

let success = true;

if (fileContent.includes(oldSegment1)) {
  fileContent = fileContent.replace(oldSegment1, newSegment1);
  console.log('Successfully patched Phase 1: De-Rez and CRT Line Pinch.');
} else {
  console.error('Error: Old Segment 1 (globe cage) not found in WorldRenderer.ts');
  success = false;
}

if (fileContent.includes(oldSegment2)) {
  fileContent = fileContent.replace(oldSegment2, newSegment2);
  console.log('Successfully patched Phase 2: Radial Concentric Orb Explosion.');
} else {
  console.error('Error: Old Segment 2 (rectangular particles) not found in WorldRenderer.ts');
  success = false;
}

if (success) {
  fs.writeFileSync(targetFile, fileContent, 'utf8');
} else {
  process.exit(1);
}
