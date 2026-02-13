import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const STATUS_PATH = path.join(ROOT, 'status.json');
const OUTPUT_DIR = path.join(ROOT, 'docs');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'package-status.json');

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const packages = Array.isArray(status.packages) ? status.packages : [];

const packageStatus = {};

for (const entry of packages) {
  if (!entry || typeof entry !== 'object' || typeof entry.packageName !== 'string') {
    continue;
  }

  packageStatus[entry.packageName] = {
    status: entry.status,
    upstreamTests: entry.upstreamTests,
    portedTests: entry.portedTests,
    passingTests: entry.passingTests,
    snapshotTotal: entry.snapshotTotal,
    snapshotPassing: entry.snapshotPassing,
    docsTotal: entry.docsTotal,
    docsComplete: entry.docsComplete,
    hasDeviations: entry.hasDeviations,
    upstreamPackageName: entry.upstreamPackageName,
    upstreamPath: entry.upstreamPath,
    upstreamUrl: entry.upstreamUrl
  };
}

const output = {
  baselineSha: status.baselineSha ?? null,
  packageCount: Object.keys(packageStatus).length,
  packages: packageStatus
};

fs.mkdirSync(OUTPUT_DIR, {recursive: true});
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(ROOT, OUTPUT_PATH)}`);
