import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const SUBMODULE_ROOT = path.join(ROOT, 'upstream', 'react-spectrum');
const UPSTREAM_PACKAGES_ROOT = path.join(SUBMODULE_ROOT, 'packages');
const STATUS_PATH = path.join(ROOT, 'status.json');
const ROOT_PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');

const TRACKED_GROUPS = ['@react-aria', '@react-spectrum', '@react-stately', '@react-types'];
const STATUS_VALUES = new Set(['not_started', 'in_progress', 'complete']);
const TEXT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

function toVuePackageName(upstreamPackageName) {
  if (upstreamPackageName.startsWith('@react-aria/')) {
    return upstreamPackageName.replace('@react-aria/', '@vue-aria/');
  }
  if (upstreamPackageName.startsWith('@react-spectrum/')) {
    return upstreamPackageName.replace('@react-spectrum/', '@vue-spectrum/');
  }
  if (upstreamPackageName.startsWith('@react-stately/')) {
    return upstreamPackageName.replace('@react-stately/', '@vue-stately/');
  }
  if (upstreamPackageName.startsWith('@react-types/')) {
    return upstreamPackageName.replace('@react-types/', '@vue-types/');
  }
  return upstreamPackageName;
}

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

const rootPackage = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON_PATH, 'utf8'));
const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const existingEntries = new Map(
  (Array.isArray(status.packages) ? status.packages : [])
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => [entry.upstreamPackageName ?? entry.packageName, entry])
);

const discovered = [];

for (const groupName of TRACKED_GROUPS) {
  const groupPath = path.join(UPSTREAM_PACKAGES_ROOT, groupName);
  if (!fs.existsSync(groupPath)) {
    continue;
  }

  for (const dirent of fs.readdirSync(groupPath, {withFileTypes: true})) {
    if (!dirent.isDirectory()) {
      continue;
    }

    const relativePackagePath = path.join('packages', groupName, dirent.name);
    const absPackagePath = path.join(SUBMODULE_ROOT, relativePackagePath);
    const packageJsonPath = path.join(absPackagePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      continue;
    }

    const upstreamPackage = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const upstreamPackageName = upstreamPackage.name;
    const existing = existingEntries.get(upstreamPackageName);
    const {upstreamTests, snapshotTotal} = countUpstreamMetrics(absPackagePath);

    const entry = {
      packageName: existing?.packageName ?? toVuePackageName(upstreamPackageName),
      status: STATUS_VALUES.has(existing?.status) ? existing.status : 'not_started',
      upstreamTests,
      portedTests: Number.isInteger(existing?.portedTests) ? existing.portedTests : 0,
      passingTests: Number.isInteger(existing?.passingTests) ? existing.passingTests : 0,
      snapshotTotal,
      snapshotPassing: Number.isInteger(existing?.snapshotPassing) ? existing.snapshotPassing : 0,
      docsTotal: Number.isInteger(existing?.docsTotal) ? existing.docsTotal : 0,
      docsComplete: Number.isInteger(existing?.docsComplete) ? existing.docsComplete : 0,
      hasDeviations: typeof existing?.hasDeviations === 'boolean' ? existing.hasDeviations : false,
      upstreamPackageName,
      upstreamPath: relativePackagePath.replaceAll(path.sep, '/'),
      upstreamUrl: `https://github.com/adobe/react-spectrum/tree/${status.baselineSha ?? rootPackage.upstreamBaselineSha}/${relativePackagePath.replaceAll(path.sep, '/')}`
    };

    discovered.push(entry);
  }
}

discovered.sort((a, b) => a.upstreamPackageName.localeCompare(b.upstreamPackageName));

const global = {
  upstreamTests: discovered.reduce((sum, pkg) => sum + pkg.upstreamTests, 0),
  portedTests: discovered.reduce((sum, pkg) => sum + pkg.portedTests, 0),
  passingTests: discovered.reduce((sum, pkg) => sum + pkg.passingTests, 0),
  snapshotTotal: discovered.reduce((sum, pkg) => sum + pkg.snapshotTotal, 0),
  snapshotPassing: discovered.reduce((sum, pkg) => sum + pkg.snapshotPassing, 0),
  docsTotal: discovered.reduce((sum, pkg) => sum + pkg.docsTotal, 0),
  docsComplete: discovered.reduce((sum, pkg) => sum + pkg.docsComplete, 0)
};

const nextStatus = {
  baselineSha: status.baselineSha ?? rootPackage.upstreamBaselineSha ?? null,
  global,
  packages: discovered
};

fs.writeFileSync(STATUS_PATH, `${JSON.stringify(nextStatus, null, 2)}\n`, 'utf8');
console.log(`Synced ${discovered.length} packages into status.json`);
