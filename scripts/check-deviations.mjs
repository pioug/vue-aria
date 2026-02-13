import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const STATUS_PATH = path.join(process.cwd(), 'status.json');
const DEVIATIONS_PATH = path.join(process.cwd(), 'DEVIATIONS.md');

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const packages = Array.isArray(status.packages) ? status.packages : [];
const trackedPackages = new Set(packages.map((entry) => entry.packageName));

const deviations = fs.readFileSync(DEVIATIONS_PATH, 'utf8');
const packageLinePattern = /- Package:\s*`([^`]+)`/g;
const listedPackages = [];
let match;

while ((match = packageLinePattern.exec(deviations)) !== null) {
  listedPackages.push(match[1]);
}

const listedSet = new Set(listedPackages);
const duplicates = listedPackages.filter((pkg, index) => listedPackages.indexOf(pkg) !== index);
const errors = [];

for (const entry of packages) {
  if (entry.hasDeviations && !listedSet.has(entry.packageName)) {
    errors.push(`${entry.packageName} hasDeviations=true but is missing from DEVIATIONS.md`);
  }
  if (!entry.hasDeviations && listedSet.has(entry.packageName)) {
    errors.push(`${entry.packageName} hasDeviations=false but is listed in DEVIATIONS.md`);
  }
}

for (const pkg of listedSet) {
  if (!trackedPackages.has(pkg)) {
    errors.push(`${pkg} is listed in DEVIATIONS.md but is not tracked in status.json`);
  }
}

for (const pkg of new Set(duplicates)) {
  errors.push(`${pkg} appears multiple times in DEVIATIONS.md`);
}

if (errors.length > 0) {
  console.error('Deviation mapping check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Deviation mapping check passed (${listedSet.size} package entries)`);
