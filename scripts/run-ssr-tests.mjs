import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const PACKAGES_DIR = path.join(ROOT, 'packages');
const ssrTestFiles = [];

function walk(dirPath) {
  for (const entry of fs.readdirSync(dirPath, {withFileTypes: true})) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.ssr.test.ts')) {
      ssrTestFiles.push(path.relative(ROOT, entryPath));
    }
  }
}

walk(PACKAGES_DIR);
ssrTestFiles.sort();

if (ssrTestFiles.length === 0) {
  console.error('No SSR tests found under packages/');
  process.exit(1);
}

const result = spawnSync('npx', ['vitest', 'run', ...ssrTestFiles], {
  cwd: ROOT,
  stdio: 'inherit'
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
