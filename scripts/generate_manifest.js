import fs from 'fs';
import path from 'path';

const srcDir = './src';
const outputManifest = './public/source_code_manifest.json';

function getFilesRecursive(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursive(fullPath));
    } else {
      const normalized = fullPath.replace(/\\/g, '/');
      const ext = path.extname(normalized);
      if (['.ts', '.tsx', '.css', '.json'].includes(ext)) {
        results.push(normalized);
      }
    }
  });
  return results;
}

try {
  const allFiles = getFilesRecursive(srcDir);
  
  if (fs.existsSync('./package.json')) allFiles.push('package.json');
  if (fs.existsSync('./vite.config.ts')) allFiles.push('vite.config.ts');
  if (fs.existsSync('./tsconfig.json')) allFiles.push('tsconfig.json');

  const manifest = {};
  allFiles.forEach((f) => {
    const fileContent = fs.readFileSync(f, 'utf8');
    manifest[f] = fileContent;
  });

  const dirOfOutput = path.dirname(outputManifest);
  if (!fs.existsSync(dirOfOutput)) {
    fs.mkdirSync(dirOfOutput, { recursive: true });
  }

  fs.writeFileSync(outputManifest, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[MANIFEST GENERATOR] Built manifest containing ${allFiles.length} files.`);
} catch (err) {
  console.error('[MANIFEST GENERATOR] Failed to compile manifest:', err);
  process.exit(1);
}
