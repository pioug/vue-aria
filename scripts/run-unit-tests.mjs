import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const PACKAGES_DIR = path.join(ROOT, 'packages');
const unitTestFiles = [];

function walk(dirPath) {
  for (const entry of fs.readdirSync(dirPath, {withFileTypes: true})) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (entry.name.endsWith('.test.ts') && !entry.name.endsWith('.ssr.test.ts')) {
      unitTestFiles.push(path.relative(ROOT, entryPath));
    }
  }
}

walk(PACKAGES_DIR);
unitTestFiles.sort();

if (unitTestFiles.length === 0) {
  console.error('No unit tests found under packages/');
  process.exit(1);
}

const result = spawnSync('npx', ['vitest', 'run', ...unitTestFiles], {
  cwd: ROOT,
  stdio: 'inherit'
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
