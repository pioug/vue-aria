import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const STATUS_PATH = path.join(ROOT, 'status.json');
const ROOT_PACKAGE_PATH = path.join(ROOT, 'package.json');
const BASELINE_DOC_PATH = path.join(ROOT, 'PORT_BASELINE.md');
const SUBMODULE_PATH = path.join(ROOT, 'upstream', 'react-spectrum');

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const rootPackage = JSON.parse(fs.readFileSync(ROOT_PACKAGE_PATH, 'utf8'));
const baselineDoc = fs.readFileSync(BASELINE_DOC_PATH, 'utf8');

const docSha = baselineDoc.match(/- Baseline SHA:\s*`([0-9a-f]{40})`/)?.[1] ?? null;
const statusSha = typeof status.baselineSha === 'string' ? status.baselineSha : null;
const packageSha = typeof rootPackage.upstreamBaselineSha === 'string' ? rootPackage.upstreamBaselineSha : null;

const errors = [];

if (!docSha) {
  errors.push('PORT_BASELINE.md is missing a valid baseline SHA');
}
if (!statusSha) {
  errors.push('status.json is missing baselineSha');
}
if (!packageSha) {
  errors.push('package.json is missing upstreamBaselineSha');
}

if (docSha && statusSha && docSha !== statusSha) {
  errors.push(`PORT_BASELINE.md baseline SHA (${docSha}) does not match status.json (${statusSha})`);
}
if (packageSha && statusSha && packageSha !== statusSha) {
  errors.push(`package.json upstreamBaselineSha (${packageSha}) does not match status.json (${statusSha})`);
}

if (!fs.existsSync(SUBMODULE_PATH)) {
  errors.push('Missing submodule at upstream/react-spectrum');
} else {
  const submoduleSha = execSync('git rev-parse HEAD', {
    cwd: SUBMODULE_PATH,
    encoding: 'utf8'
  }).trim();

  if (statusSha && submoduleSha !== statusSha) {
    errors.push(`Submodule HEAD (${submoduleSha}) does not match status baseline SHA (${statusSha})`);
  }
}

const packages = Array.isArray(status.packages) ? status.packages : [];
for (const entry of packages) {
  if (!statusSha || typeof entry?.upstreamPath !== 'string' || typeof entry?.upstreamUrl !== 'string') {
    continue;
  }

  const expected = `https://github.com/adobe/react-spectrum/tree/${statusSha}/${entry.upstreamPath}`;
  if (entry.upstreamUrl !== expected) {
    errors.push(`${entry.packageName}: upstreamUrl mismatch`);
  }
}

if (errors.length > 0) {
  console.error('Baseline consistency check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Baseline consistency check passed (${statusSha})`);
