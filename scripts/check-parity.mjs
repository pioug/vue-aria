#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

function hasPackageJson(dir) {
  return fs
    .access(path.join(dir, 'package.json'))
    .then(() => true)
    .catch(() => false);
}

async function readPackageDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const withPackage = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(async (entry) => {
        const full = path.join(dir, entry.name);
        return (await hasPackageJson(full)) ? entry.name : null;
      })
  );

  return withPackage.filter(Boolean);
}

async function readPackageNames(dir) {
  const packageDirs = await readPackageDirs(dir);
  const result = new Set();

  for (const name of packageDirs) {
    try {
      const file = await fs.readFile(path.join(dir, name, 'package.json'), 'utf8');
      const json = JSON.parse(file);
      if (typeof json?.name === 'string') result.add(json.name);
    } catch {
      // Ignore malformed or unreadable package files in parity checks.
    }
  }

  return result;
}

async function main() {
  const reactAriaDir = path.join('references', 'react-spectrum', 'packages', '@react-aria');
  const reactStatelyDir = path.join('references', 'react-spectrum', 'packages', '@react-stately');
  const reactSpectrumDir = path.join('references', 'react-spectrum', 'packages', '@react-spectrum');
  const reactTypesDir = path.join('references', 'react-spectrum', 'packages', '@react-types');

  const reactAriaRefs = await readPackageDirs(reactAriaDir);
  const reactStatelyRefs = await readPackageDirs(reactStatelyDir);

  const expectedVueAria = new Set(reactAriaRefs.map((name) => `@vue-aria/${name}`));
  const expectedVueStately = new Set(reactStatelyRefs.map((name) => `@vue-stately/${name}`));
  const expectedVueSpectrum = new Set((await readPackageDirs(reactSpectrumDir)).map((name) => `@vue-spectrum/${name}`));
  const expectedVueTypes = new Set([
    '@vue-types/shared',
    ...(await readPackageDirs(reactTypesDir)).map((name) => `@vue-types/${name}`),
  ]);

  const localVueAria = await readPackageNames(path.join('packages', '@vue-aria'));
  const localVueStately = new Set(
    (await fs.readdir(path.join('packages', '@vue-stately'), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => `@vue-stately/${entry.name}`)
  );
  const localVueSpectrum = await readPackageNames(path.join('packages', '@vue-spectrum'));
  const localVueTypes = await readPackageNames(path.join('packages', '@vue-types'));

  localVueTypes.add('@vue-types/shared');

  const vueAriaFromStately = new Set([
    ...[...localVueAria],
    ...[...expectedVueAria].filter((name) => {
      const baseName = name.replace('@vue-aria/', '');
      return localVueStately.has(`@vue-stately/${baseName}`);
    }),
  ]);

  const reactAriaMissing = [...expectedVueAria].filter((pkg) => !vueAriaFromStately.has(pkg)).sort();
  const reactAriaExtra = [...localVueAria].filter((pkg) => !expectedVueAria.has(pkg)).sort();

  const reactStatelyMissing = [...expectedVueStately].filter((pkg) => !localVueStately.has(pkg)).sort();
  const reactStatelyExtra = [...localVueStately].filter((pkg) => !expectedVueStately.has(pkg)).sort();

  const reactSpectrumMissing = [...expectedVueSpectrum].filter((pkg) => !localVueSpectrum.has(pkg)).sort();
  const reactSpectrumExtra = [...localVueSpectrum].filter((pkg) => !expectedVueSpectrum.has(pkg)).sort();

  const reactTypesMissing = [...expectedVueTypes].filter((pkg) => !localVueTypes.has(pkg)).sort();
  const reactTypesExtra = [...localVueTypes].filter((pkg) => !expectedVueTypes.has(pkg)).sort();

  const report = {
    reactAria: {
      reference: expectedVueAria.size,
      local: vueAriaFromStately.size,
      missing: reactAriaMissing.length,
      extra: reactAriaExtra.length,
    },
    reactStately: {
      reference: expectedVueStately.size,
      local: localVueStately.size,
      missing: reactStatelyMissing.length,
      extra: reactStatelyExtra.length,
    },
    reactSpectrum: {
      reference: expectedVueSpectrum.size,
      local: localVueSpectrum.size,
      missing: reactSpectrumMissing.length,
      extra: reactSpectrumExtra.length,
    },
    vueTypes: {
      reference: expectedVueTypes.size,
      local: localVueTypes.size,
      missing: reactTypesMissing.length,
      extra: reactTypesExtra.length,
    },
  };

  console.log('Canonical parity report');
  console.log('================================');
  console.log(`@react-aria -> canonical vue mapping: ${report.reactAria.reference} total reference`, report.reactAria);
  console.log(`@react-stately -> @vue-stately: ${report.reactStately.reference} total reference`, report.reactStately);
  console.log(`@react-spectrum -> @vue-spectrum: ${report.reactSpectrum.reference} total reference`, report.reactSpectrum);
  console.log(`@react-types -> @vue-types: ${report.vueTypes.reference} total reference`, report.vueTypes);

  console.log('\nCanonical missing (true gaps only):');
  if (reactAriaMissing.length) {
    console.log('  @react-aria missing:', reactAriaMissing.join(', '));
  } else {
    console.log('  @react-aria missing: none');
  }

  if (reactStatelyMissing.length) {
    console.log('  @react-stately missing:', reactStatelyMissing.join(', '));
  } else {
    console.log('  @react-stately missing: none');
  }

  if (reactSpectrumMissing.length) {
    console.log('  @react-spectrum missing:', reactSpectrumMissing.join(', '));
  } else {
    console.log('  @react-spectrum missing: none');
  }

  if (reactTypesMissing.length) {
    console.log('  @react-types missing:', reactTypesMissing.join(', '));
  } else {
    console.log('  @react-types missing: none');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
