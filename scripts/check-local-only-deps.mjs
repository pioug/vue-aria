import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const ROOT_PACKAGE_PATH = path.join(ROOT, 'package.json');
const DEP_SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

const LOCAL_ONLY_PACKAGES = [
  '@adobe/spectrum-css-temp',
  '@vue-spectrum/test-utils-internal'
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function expandWorkspacePattern(pattern) {
  const parts = pattern.split('/').filter(Boolean);
  const results = [];

  function walk(base, index) {
    if (index >= parts.length) {
      if (fs.existsSync(path.join(base, 'package.json'))) {
        results.push(base);
      }
      return;
    }

    const part = parts[index];
    if (part === '*') {
      if (!fs.existsSync(base)) {
        return;
      }

      for (const entry of fs.readdirSync(base, {withFileTypes: true})) {
        if (!entry.isDirectory()) {
          continue;
        }
        walk(path.join(base, entry.name), index + 1);
      }
      return;
    }

    walk(path.join(base, part), index + 1);
  }

  walk(ROOT, 0);
  return results;
}

const rootPackage = readJson(ROOT_PACKAGE_PATH);
const workspacePatterns = Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : [];
const workspacePackageDirs = workspacePatterns.flatMap(expandWorkspacePattern);

const workspacePackagesByName = new Map();
for (const dirPath of workspacePackageDirs) {
  const packageJsonPath = path.join(dirPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    continue;
  }

  const pkg = readJson(packageJsonPath);
  if (typeof pkg.name !== 'string') {
    continue;
  }

  if (!workspacePackagesByName.has(pkg.name)) {
    workspacePackagesByName.set(pkg.name, []);
  }
  workspacePackagesByName.get(pkg.name).push(path.relative(ROOT, dirPath));
}

const referencedLocalOnlyDeps = new Set();
for (const dirPath of workspacePackageDirs) {
  const pkg = readJson(path.join(dirPath, 'package.json'));
  for (const sectionName of DEP_SECTIONS) {
    const section = pkg[sectionName];
    if (!section || typeof section !== 'object') {
      continue;
    }

    for (const depName of Object.keys(section)) {
      if (LOCAL_ONLY_PACKAGES.includes(depName)) {
        referencedLocalOnlyDeps.add(depName);
      }
    }
  }
}

const errors = [];
for (const depName of LOCAL_ONLY_PACKAGES) {
  const packageDirs = workspacePackagesByName.get(depName) ?? [];
  if (packageDirs.length === 0) {
    errors.push(`Missing workspace package for local-only dependency: ${depName}`);
    continue;
  }

  if (packageDirs.length > 1) {
    errors.push(`Multiple workspace packages found for ${depName}: ${packageDirs.join(', ')}`);
  }

  if (!referencedLocalOnlyDeps.has(depName)) {
    errors.push(`Local-only dependency is no longer referenced by workspace packages: ${depName}`);
  }
}

if (errors.length > 0) {
  console.error('Local-only dependency check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Local-only dependency check passed (${LOCAL_ONLY_PACKAGES.length} package(s))`);
