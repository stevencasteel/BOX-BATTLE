import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { Writable } from 'stream';
import { exec, execSync, spawn } from 'child_process';

const fsp = fs.promises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');
const outputFile = path.join(docsDir, 'all_source_code.txt');

function shouldInclude(filePath) {
  const relPath = path.relative(rootDir, filePath).split(path.sep).join('/');
  
  // Safety Check: Never self-ingest the generated output file
  if (path.basename(filePath) === 'all_source_code.txt') {
    return false;
  }

  const ignoredPaths = ['node_modules', '.git', 'dist', '.vscode', '.github', 'BOX_BATTLE_ARCHIVE', 'scripts'];
  if (ignoredPaths.some(p => relPath.startsWith(p) || relPath.includes(`/${p}/`))) return false;
  
  const boilerplateConfigs = ['.DS_Store', 'package-lock.json', 'tsconfig.tsbuildinfo'];
  if (boilerplateConfigs.includes(path.basename(relPath))) return false;

  const ext = path.extname(relPath);
  const allowedExts = ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md', '.txt', '.command'];
  return allowedExts.includes(ext);
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileName = path.basename(filePath);
    if (fs.statSync(filePath).isDirectory()) {
      if (!fileName.startsWith('.') && fileName !== 'node_modules' && fileName !== 'dist') {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (shouldInclude(filePath)) fileList.push(filePath);
    }
  }
  return fileList;
}

function closeTerminalWindow() {
  try {
    execSync(`osascript -e 'tell application "Terminal" to close front window'`);
  } catch (e) {
    process.exit(0);
  }
}

async function main() {
  try {
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const now = new Date().toLocaleString();
    let content = '┌──────────────────────────────────────────────────┐\n';
    content += '│              BOX BATTLE ENGINE WEB               │\n';
    content += '│               Vite + React Context               │\n';
    content += '└──────────────────────────────────────────────────┘\n';
    content += ` [SYSTEM] Generated: ${now}\n`;
    content += ` [BASELINE]: Pure HTML5 Canvas, responsive, procedurally synthesized Web Audio.\n\n`;
    content += '─── SOURCE FILES ───────────────────────────────────\n\n';

    const files = getAllFiles(rootDir);
    
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      const relPath = path.relative(rootDir, filePath).split(path.sep).join('/');
      
      process.stdout.write(`  \x1b[36m⠋\x1b[0m Compiling: ${relPath}\r`);

      content += `● ./${relPath}\n`;
      content += `────────────────────────────────────────────────────\n`;
      const fileContent = await fsp.readFile(filePath, 'utf8');
      content += fileContent + '\n\n\n';
    }

    await fsp.writeFile(outputFile, content, 'utf8');
    process.stdout.write('\r\x1b[K');

    // Calculate detailed metrics for the success report
    const stats = await fsp.stat(outputFile);
    const totalLines = content.split('\n').length;
    const totalChars = content.length;
    const fileCount = files.length;

    let sizeStr = '';
    if (stats.size > 1024 * 1024) {
      sizeStr = `${(stats.size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      sizeStr = `${(stats.size / 1024).toFixed(1)} KB`;
    }

    // Render success display
    console.clear();
    console.log('\n\x1b[32m  ┌────────────────────────────────────────────────────────┐\x1b[0m');
    console.log('\x1b[32m  │                                                        │\x1b[0m');
    console.log('\x1b[32m  │    \x1b[1;32m✔\x1b[0;37m  SOURCE CONTEXT COMPILED SUCCESSFULLY             \x1b[32m│\x1b[0m');
    console.log('\x1b[32m  │                                                        │\x1b[0m');
    console.log(`\x1b[32m  │      Files Bundled: \x1b[1;37m${String(fileCount).padEnd(35)}\x1b[32m │\x1b[0m`);
    console.log(`\x1b[32m  │      Total Lines:   \x1b[1;37m${String(totalLines.toLocaleString()).padEnd(35)}\x1b[32m │\x1b[0m`);
    console.log(`\x1b[32m  │      Total Chars:   \x1b[1;37m${String(totalChars.toLocaleString()).padEnd(35)}\x1b[32m │\x1b[0m`);
    console.log(`\x1b[32m  │      File Size:     \x1b[1;37m${sizeStr.padEnd(35)}\x1b[32m │\x1b[0m`);
    console.log('\x1b[32m  │                                                        │\x1b[0m');
    console.log('\x1b[32m  │      Output: \x1b[37mdocs/all_source_code.txt\x1b[32m                  │\x1b[0m');
    console.log('\x1b[32m  │                                                        │\x1b[0m');
    console.log('\x1b[32m  └────────────────────────────────────────────────────────┘\x1b[0m\n');

    // Play Pop sound and open the Docs directory in Finder
    const audioProcess = spawn('afplay', ['/System/Library/Sounds/Pop.aiff'], { detached: true, stdio: 'ignore' });
    audioProcess.unref();
    exec('open -g docs');

    // Wait for keypress to exit and close window
    console.log('  \x1b[90mPress [Enter] or [Escape] to close this window.\x1b[0m\n');
    const mutedOut = new Writable({ write() {} });
    const rl = readline.createInterface({ input: process.stdin, output: mutedOut, terminal: true });
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    const keypressHandler = (str, key) => {
      if (
        (key.ctrl && key.name === 'c') || 
        key.name === 'return' || 
        key.name === 'enter' || 
        key.name === 'escape'
      ) {
        process.stdin.removeListener('keypress', keypressHandler);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        rl.close();
        closeTerminalWindow();
        process.exit(0);
      }
    };
    process.stdin.on('keypress', keypressHandler);

  } catch (err) {
    console.error('Error during context compilation:', err);
  }
}

main();
