import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_GLOBAL_KEYS = [
  'upstreamTests',
  'portedTests',
  'passingTests',
  'snapshotTotal',
  'snapshotPassing',
  'docsTotal',
  'docsComplete'
];

const REQUIRED_PACKAGE_KEYS = [
  'packageName',
  'status',
  'upstreamTests',
  'portedTests',
  'passingTests',
  'snapshotTotal',
  'snapshotPassing',
  'docsTotal',
  'docsComplete',
  'hasDeviations',
  'upstreamPackageName',
  'upstreamPath',
  'upstreamUrl'
];

const VALID_PACKAGE_STATUSES = new Set(['not_started', 'in_progress', 'complete']);

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

const statusPath = path.join(process.cwd(), 'status.json');
const raw = fs.readFileSync(statusPath, 'utf8');
const status = JSON.parse(raw);
const errors = [];

assert(Object.prototype.hasOwnProperty.call(status, 'baselineSha'), 'Missing root field: baselineSha', errors);
assert(status.global && typeof status.global === 'object' && !Array.isArray(status.global), 'Root field global must be an object', errors);

if (status.global && typeof status.global === 'object' && !Array.isArray(status.global)) {
  for (const key of REQUIRED_GLOBAL_KEYS) {
    assert(Object.prototype.hasOwnProperty.call(status.global, key), `Missing global field: ${key}`, errors);
    if (Object.prototype.hasOwnProperty.call(status.global, key)) {
      assert(isNonNegativeInteger(status.global[key]), `global.${key} must be a non-negative integer`, errors);
    }
  }
}

assert(Array.isArray(status.packages), 'Root field packages must be an array', errors);
if (Array.isArray(status.packages)) {
  for (const [index, entry] of status.packages.entries()) {
    assert(entry && typeof entry === 'object' && !Array.isArray(entry), `packages[${index}] must be an object`, errors);
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }

    for (const key of REQUIRED_PACKAGE_KEYS) {
      assert(Object.prototype.hasOwnProperty.call(entry, key), `packages[${index}] missing field: ${key}`, errors);
    }

    if (Object.prototype.hasOwnProperty.call(entry, 'status')) {
      assert(VALID_PACKAGE_STATUSES.has(entry.status), `packages[${index}].status must be one of: not_started, in_progress, complete`, errors);
    }

    for (const numericKey of ['upstreamTests', 'portedTests', 'passingTests', 'snapshotTotal', 'snapshotPassing', 'docsTotal', 'docsComplete']) {
      if (Object.prototype.hasOwnProperty.call(entry, numericKey)) {
        assert(isNonNegativeInteger(entry[numericKey]), `packages[${index}].${numericKey} must be a non-negative integer`, errors);
      }
    }

    if (Object.prototype.hasOwnProperty.call(entry, 'hasDeviations')) {
      assert(typeof entry.hasDeviations === 'boolean', `packages[${index}].hasDeviations must be boolean`, errors);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('status.json validation passed');
