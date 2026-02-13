import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const STATUS_PATH = path.join(process.cwd(), 'status.json');
const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

const global = status?.global ?? {};
assert(Number.isInteger(global.snapshotTotal) && global.snapshotTotal >= 0, 'global.snapshotTotal must be a non-negative integer');
assert(Number.isInteger(global.snapshotPassing) && global.snapshotPassing >= 0, 'global.snapshotPassing must be a non-negative integer');

if (Number.isInteger(global.snapshotTotal) && Number.isInteger(global.snapshotPassing)) {
  assert(global.snapshotPassing <= global.snapshotTotal, 'global.snapshotPassing must be <= global.snapshotTotal');
}

const packages = Array.isArray(status?.packages) ? status.packages : [];
for (const [index, entry] of packages.entries()) {
  const key = entry?.packageName ?? `packages[${index}]`;
  const total = entry?.snapshotTotal;
  const passing = entry?.snapshotPassing;

  assert(Number.isInteger(total) && total >= 0, `${key}.snapshotTotal must be a non-negative integer`);
  assert(Number.isInteger(passing) && passing >= 0, `${key}.snapshotPassing must be a non-negative integer`);

  if (Number.isInteger(total) && Number.isInteger(passing)) {
    assert(passing <= total, `${key}.snapshotPassing must be <= snapshotTotal`);
    if (entry?.status === 'complete') {
      assert(passing === total, `${key} is complete but snapshotPassing != snapshotTotal`);
    }
  }
}

if (errors.length > 0) {
  console.error('Visual parity check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const total = global.snapshotTotal ?? 0;
const passing = global.snapshotPassing ?? 0;
if (total === 0) {
  console.log('Visual parity check passed (metrics-only mode: 0 snapshots tracked)');
} else {
  console.log(`Visual parity check passed (${passing}/${total} snapshots)`);
}
