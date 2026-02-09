import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const trackerPath = path.join(root, "SPECTRUM_PORTING_TRACKER.md");
const spectrumReferencePath = path.join(
  root,
  "references",
  "react-spectrum",
  "packages",
  "@react-spectrum"
);
const umbrellaEntryPath = path.join(
  root,
  "packages",
  "@vue-spectrum",
  "vue-spectrum",
  "src",
  "index.ts"
);

function readFile(absolutePath) {
  return fs.readFileSync(absolutePath, "utf8");
}

function listReferencePackages() {
  if (!fs.existsSync(spectrumReferencePath)) {
    throw new Error(`Missing upstream reference directory: ${spectrumReferencePath}`);
  }

  return fs
    .readdirSync(spectrumReferencePath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function parseTracker(content) {
  const mappingPattern = /- \[( |x)\] `@react-spectrum\/([^`]+)` -> `@vue-spectrum\/([^`]+)`/g;
  const rows = [];

  for (const match of content.matchAll(mappingPattern)) {
    rows.push({
      checked: match[1] === "x",
      upstream: match[2],
      local: match[3],
    });
  }

  return rows;
}

function collectTests(testDirectory) {
  if (!fs.existsSync(testDirectory)) {
    return [];
  }

  return fs
    .readdirSync(testDirectory)
    .filter((name) => name.endsWith(".test.ts") || name.endsWith(".test.tsx"));
}

const errors = [];

if (!fs.existsSync(trackerPath)) {
  errors.push(`Missing tracker file: ${path.relative(root, trackerPath)}`);
} else {
  const tracker = readFile(trackerPath);
  const rows = parseTracker(tracker);
  const referencePackages = listReferencePackages();

  if (rows.length !== referencePackages.length) {
    errors.push(
      `Tracker row count mismatch. Expected ${referencePackages.length}, found ${rows.length}.`
    );
  }

  for (const row of rows) {
    if (row.upstream !== row.local) {
      errors.push(
        `Package mapping mismatch: @react-spectrum/${row.upstream} -> @vue-spectrum/${row.local}`
      );
    }
  }

  const trackedUpstream = new Set(rows.map((row) => row.upstream));
  for (const packageName of referencePackages) {
    if (!trackedUpstream.has(packageName)) {
      errors.push(`Tracker is missing upstream package: @react-spectrum/${packageName}`);
    }
  }

  const trackedRows = rows.filter((row) => row.checked);
  const umbrellaExports = fs.existsSync(umbrellaEntryPath)
    ? readFile(umbrellaEntryPath)
    : "";

  for (const row of trackedRows) {
    const packageDirectory = path.join(root, "packages", "@vue-spectrum", row.local);
    const sourceEntry = path.join(packageDirectory, "src", "index.ts");
    const tests = collectTests(path.join(packageDirectory, "test"));
    const docsPage = path.join(root, "docs", "spectrum", `${row.local}.md`);

    if (!fs.existsSync(packageDirectory)) {
      errors.push(`Completed package directory missing: packages/@vue-spectrum/${row.local}`);
      continue;
    }

    if (!fs.existsSync(sourceEntry)) {
      errors.push(`Completed package source missing: packages/@vue-spectrum/${row.local}/src/index.ts`);
    }

    if (tests.length === 0) {
      errors.push(`Completed package has no tests: packages/@vue-spectrum/${row.local}/test/*.test.ts`);
    }

    if (!fs.existsSync(docsPage)) {
      errors.push(`Completed package docs missing: docs/spectrum/${row.local}.md`);
    }

    if (!umbrellaExports.includes(`@vue-spectrum/${row.local}`)) {
      errors.push(`Completed package not exported by umbrella: @vue-spectrum/${row.local}`);
    }
  }
}

const requiredSetupFiles = [
  "packages/@vue-spectrum/vue-spectrum/src/index.ts",
  "docs/spectrum/overview.md",
];

for (const relativePath of requiredSetupFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(`Missing required setup file: ${relativePath}`);
  }
}

if (errors.length > 0) {
  console.error("Spectrum parity check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Spectrum parity check passed.");
