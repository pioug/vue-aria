import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const STATUS_PATH = path.join(process.cwd(), 'status.json');
const trackedMetrics = ['portedTests', 'passingTests', 'snapshotPassing', 'docsComplete'];

function readStatusFromGit(ref) {
  try {
    const raw = execSync(`git show ${ref}:status.json`, {encoding: 'utf8'});
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function keyForPackage(entry) {
  return entry.packageName ?? entry.upstreamPackageName;
}

const previous = readStatusFromGit('HEAD^');
if (!previous) {
  console.log('No previous status.json found in git history; skipping parity regression check.');
  process.exit(0);
}

const current = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const errors = [];

for (const metric of trackedMetrics) {
  const prevValue = previous?.global?.[metric];
  const currValue = current?.global?.[metric];
  if (Number.isInteger(prevValue) && Number.isInteger(currValue) && currValue < prevValue) {
    errors.push(`global.${metric} decreased: ${prevValue} -> ${currValue}`);
  }
}

const previousPackages = new Map(
  (Array.isArray(previous.packages) ? previous.packages : [])
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => [keyForPackage(entry), entry])
);

for (const entry of Array.isArray(current.packages) ? current.packages : []) {
  if (!entry || typeof entry !== 'object') {
    continue;
  }

  const key = keyForPackage(entry);
  const prevEntry = previousPackages.get(key);
  if (!prevEntry) {
    continue;
  }

  for (const metric of trackedMetrics) {
    const prevValue = prevEntry[metric];
    const currValue = entry[metric];
    if (Number.isInteger(prevValue) && Number.isInteger(currValue) && currValue < prevValue) {
      errors.push(`${key}.${metric} decreased: ${prevValue} -> ${currValue}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Parity regression check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Parity regression check passed');
