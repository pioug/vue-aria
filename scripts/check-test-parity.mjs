import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const SUBMODULE_ROOT = path.join(ROOT, 'upstream', 'react-spectrum');
const STATUS_PATH = path.join(ROOT, 'status.json');

const TEXT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

function listFilesRecursive(dirPath, collector = []) {
  const entries = fs.readdirSync(dirPath, {withFileTypes: true});
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      listFilesRecursive(entryPath, collector);
      continue;
    }
    collector.push(entryPath);
  }
  return collector;
}

function isTestFile(relativeFilePath) {
  const normalized = relativeFilePath.replaceAll(path.sep, '/');
  const extension = path.extname(normalized).toLowerCase();
  if (!TEXT_EXTENSIONS.includes(extension)) {
    return false;
  }
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(normalized)) {
    return true;
  }
  return /(?:^|\/)(test|tests|__tests__)\/.+\.[cm]?[jt]sx?$/.test(normalized);
}

function countUpstreamMetrics(absPackagePath) {
  const files = listFilesRecursive(absPackagePath);
  let upstreamTests = 0;
  let snapshotTotal = 0;

  for (const filePath of files) {
    const relative = path.relative(absPackagePath, filePath);
    if (filePath.endsWith('.snap')) {
      snapshotTotal += 1;
    }
    if (isTestFile(relative)) {
      upstreamTests += 1;
    }
  }

  return {upstreamTests, snapshotTotal};
}

if (!fs.existsSync(SUBMODULE_ROOT)) {
  console.error('Missing submodule at upstream/react-spectrum. Run: git submodule update --init --recursive');
  process.exit(1);
}

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const packages = Array.isArray(status.packages) ? status.packages : [];
const errors = [];

for (const entry of packages) {
  const upstreamPath = entry?.upstreamPath;
  if (typeof upstreamPath !== 'string') {
    errors.push(`Invalid upstreamPath for package ${entry?.packageName ?? 'unknown'}`);
    continue;
  }

  const absPackagePath = path.join(SUBMODULE_ROOT, upstreamPath);
  if (!fs.existsSync(absPackagePath)) {
    errors.push(`Missing upstream package path: ${upstreamPath}`);
    continue;
  }

  const computed = countUpstreamMetrics(absPackagePath);
  if (entry.upstreamTests !== computed.upstreamTests) {
    errors.push(
      `${entry.packageName}: upstreamTests mismatch (status=${entry.upstreamTests}, computed=${computed.upstreamTests})`
    );
  }
  if (entry.snapshotTotal !== computed.snapshotTotal) {
    errors.push(
      `${entry.packageName}: snapshotTotal mismatch (status=${entry.snapshotTotal}, computed=${computed.snapshotTotal})`
    );
  }
}

const sum = (key) => packages.reduce((acc, entry) => acc + (Number.isInteger(entry?.[key]) ? entry[key] : 0), 0);
const global = status.global ?? {};
const globalKeys = ['upstreamTests', 'portedTests', 'passingTests', 'snapshotTotal', 'snapshotPassing', 'docsTotal', 'docsComplete'];

for (const key of globalKeys) {
  const expected = sum(key);
  if (global[key] !== expected) {
    errors.push(`global.${key} mismatch (status=${global[key]}, computed=${expected})`);
  }
}

if (errors.length > 0) {
  console.error('Test parity check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Test parity check passed for ${packages.length} package(s)`);
