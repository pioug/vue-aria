import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {execFileSync} from 'node:child_process';

const ROOT = process.cwd();
const STATUS_PATH = path.join(ROOT, 'status.json');
const ORDER_PATH = path.join(ROOT, 'port-order.json');

execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'compute-port-order.mjs')], {
  cwd: ROOT,
  stdio: 'inherit'
});

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const order = JSON.parse(fs.readFileSync(ORDER_PATH, 'utf8'));
const packages = Array.isArray(status.packages) ? status.packages : [];

const active = packages.find((pkg) => pkg.status === 'in_progress');
if (active) {
  console.log(`Package already in progress: ${active.packageName} (${active.upstreamPackageName})`);
  process.exit(0);
}

const nextLeaf = Array.isArray(order.availableLeaves) ? order.availableLeaves[0] : null;
if (!nextLeaf) {
  console.log('No available leaf packages to start.');
  process.exit(0);
}

const nextPackage = packages.find((pkg) => pkg.upstreamPackageName === nextLeaf.upstreamPackageName);
if (!nextPackage) {
  console.error(`Unable to locate package entry: ${nextLeaf.upstreamPackageName}`);
  process.exit(1);
}

nextPackage.status = 'in_progress';
fs.writeFileSync(STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
console.log(`Marked in_progress: ${nextPackage.packageName} (${nextPackage.upstreamPackageName})`);
