import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const STATUS_PATH = path.join(ROOT, 'status.json');
const OUTPUT_PATH = path.join(ROOT, 'port-order.json');

function readUpstreamDependencies(upstreamPath) {
  const packageJsonPath = path.join(ROOT, 'upstream', 'react-spectrum', upstreamPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return {
    ...pkg.dependencies,
    ...pkg.peerDependencies
  };
}

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const packages = Array.isArray(status.packages) ? status.packages : [];

const byUpstreamName = new Map(packages.map((pkg) => [pkg.upstreamPackageName, pkg]));

const upstreamDeps = new Map();
for (const pkg of packages) {
  const deps = readUpstreamDependencies(pkg.upstreamPath);
  const internalDeps = Object.keys(deps).filter((dep) => byUpstreamName.has(dep));
  upstreamDeps.set(pkg.upstreamPackageName, internalDeps);
}

const incomplete = packages.filter((pkg) => pkg.status !== 'complete');

const availableLeaves = incomplete
  .filter((pkg) => {
    const deps = upstreamDeps.get(pkg.upstreamPackageName) ?? [];
    return deps.every((dep) => byUpstreamName.get(dep)?.status === 'complete');
  })
  .map((pkg) => ({
    packageName: pkg.packageName,
    upstreamPackageName: pkg.upstreamPackageName,
    upstreamPath: pkg.upstreamPath
  }))
  .sort((a, b) => a.packageName.localeCompare(b.packageName));

const indegree = new Map();
const adj = new Map();
for (const pkg of incomplete) {
  indegree.set(pkg.upstreamPackageName, 0);
  adj.set(pkg.upstreamPackageName, []);
}

for (const pkg of incomplete) {
  const deps = upstreamDeps.get(pkg.upstreamPackageName) ?? [];
  for (const dep of deps) {
    if (!indegree.has(dep)) {
      continue;
    }
    indegree.set(pkg.upstreamPackageName, (indegree.get(pkg.upstreamPackageName) ?? 0) + 1);
    const depAdj = adj.get(dep);
    depAdj?.push(pkg.upstreamPackageName);
  }
}

const queue = [...indegree.entries()].filter(([, count]) => count === 0).map(([name]) => name).sort();
let visited = 0;
while (queue.length > 0) {
  const next = queue.shift();
  if (!next) {
    break;
  }
  visited += 1;
  for (const neighbor of adj.get(next) ?? []) {
    const value = (indegree.get(neighbor) ?? 0) - 1;
    indegree.set(neighbor, value);
    if (value === 0) {
      queue.push(neighbor);
      queue.sort();
    }
  }
}

const cyclePackages = visited === incomplete.length
  ? []
  : [...indegree.entries()].filter(([, count]) => count > 0).map(([name]) => name).sort();

const output = {
  trackedPackageCount: packages.length,
  incompletePackageCount: incomplete.length,
  availableLeafCount: availableLeaves.length,
  availableLeaves,
  hasCycles: cyclePackages.length > 0,
  cyclePackages
};

fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

if (cyclePackages.length > 0) {
  console.error(`Dependency cycles detected across ${cyclePackages.length} in-progress packages.`);
  for (const name of cyclePackages) {
    console.error(`- ${name}`);
  }
  process.exit(2);
}

console.log(`Wrote ${path.basename(OUTPUT_PATH)} with ${availableLeaves.length} available leaf package(s).`);
