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
  const packageSums = {
    upstreamTests: 0,
    portedTests: 0,
    passingTests: 0,
    snapshotTotal: 0,
    snapshotPassing: 0,
    docsTotal: 0,
    docsComplete: 0
  };

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
        if (isNonNegativeInteger(entry[numericKey])) {
          packageSums[numericKey] += entry[numericKey];
        }
      }
    }

    if (isNonNegativeInteger(entry.portedTests) && isNonNegativeInteger(entry.upstreamTests)) {
      assert(entry.portedTests <= entry.upstreamTests, `packages[${index}].portedTests must be <= upstreamTests`, errors);
    }

    if (isNonNegativeInteger(entry.passingTests) && isNonNegativeInteger(entry.portedTests)) {
      assert(entry.passingTests <= entry.portedTests, `packages[${index}].passingTests must be <= portedTests`, errors);
    }

    if (entry.status === 'complete') {
      if (isNonNegativeInteger(entry.portedTests) && isNonNegativeInteger(entry.upstreamTests)) {
        assert(entry.portedTests === entry.upstreamTests, `packages[${index}] marked complete but portedTests != upstreamTests`, errors);
      }
      if (isNonNegativeInteger(entry.passingTests) && isNonNegativeInteger(entry.portedTests)) {
        assert(entry.passingTests === entry.portedTests, `packages[${index}] marked complete but passingTests != portedTests`, errors);
      }
      if (isNonNegativeInteger(entry.snapshotPassing) && isNonNegativeInteger(entry.snapshotTotal)) {
        assert(entry.snapshotPassing === entry.snapshotTotal, `packages[${index}] marked complete but snapshotPassing != snapshotTotal`, errors);
      }
      if (isNonNegativeInteger(entry.docsComplete) && isNonNegativeInteger(entry.docsTotal)) {
        assert(entry.docsComplete === entry.docsTotal, `packages[${index}] marked complete but docsComplete != docsTotal`, errors);
      }
    }

    if (entry.status === 'not_started') {
      if (isNonNegativeInteger(entry.portedTests)) {
        assert(entry.portedTests === 0, `packages[${index}] marked not_started but portedTests != 0`, errors);
      }
      if (isNonNegativeInteger(entry.passingTests)) {
        assert(entry.passingTests === 0, `packages[${index}] marked not_started but passingTests != 0`, errors);
      }
      if (isNonNegativeInteger(entry.snapshotPassing)) {
        assert(entry.snapshotPassing === 0, `packages[${index}] marked not_started but snapshotPassing != 0`, errors);
      }
      if (isNonNegativeInteger(entry.docsComplete)) {
        assert(entry.docsComplete === 0, `packages[${index}] marked not_started but docsComplete != 0`, errors);
      }
    }

    if (Object.prototype.hasOwnProperty.call(entry, 'hasDeviations')) {
      assert(typeof entry.hasDeviations === 'boolean', `packages[${index}].hasDeviations must be boolean`, errors);
    }
  }

  if (status.global && typeof status.global === 'object' && !Array.isArray(status.global)) {
    for (const key of REQUIRED_GLOBAL_KEYS) {
      if (isNonNegativeInteger(status.global[key])) {
        assert(
          status.global[key] === packageSums[key],
          `global.${key} must equal sum of package ${key}`,
          errors
        );
      }
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
