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
const caseTrackerPath = path.join(root, "SPECTRUM_TESTCASE_TRACKER.md");
const styleTrackerPath = path.join(root, "SPECTRUM_STYLE_TRACKER.md");
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

function parseMarkdownTableCells(line) {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function parseCaseTracker(content) {
  const lines = content.split(/\r?\n/);
  const rows = new Map();
  let headerIndex = null;
  let inMatrix = false;

  for (const line of lines) {
    if (!inMatrix && line.startsWith("| package | status |")) {
      const header = parseMarkdownTableCells(line);
      headerIndex = new Map(header.map((name, index) => [name, index]));
      inMatrix = true;
      continue;
    }

    if (!inMatrix) {
      continue;
    }

    if (!line.startsWith("|")) {
      if (rows.size > 0) {
        break;
      }
      continue;
    }

    if (line.startsWith("| ---")) {
      continue;
    }

    if (!headerIndex) {
      continue;
    }

    const cells = parseMarkdownTableCells(line);
    const packageIndex = headerIndex.get("package");
    const statusIndex = headerIndex.get("status");
    const missingNamedIndex = headerIndex.get("missing named");
    const missingFilesIndex = headerIndex.get("missing upstream test files");

    if (
      packageIndex === undefined ||
      statusIndex === undefined ||
      missingNamedIndex === undefined ||
      missingFilesIndex === undefined
    ) {
      continue;
    }

    const packageCell = cells[packageIndex] ?? "";
    if (!packageCell.startsWith("`") || !packageCell.endsWith("`")) {
      continue;
    }

    const packageName = packageCell.slice(1, -1);
    const missingNamed = Number.parseInt(cells[missingNamedIndex] ?? "0", 10);
    rows.set(packageName, {
      status: cells[statusIndex] ?? "pending",
      missingNamed: Number.isFinite(missingNamed) ? missingNamed : 0,
      missingFiles: cells[missingFilesIndex] ?? "none",
    });
  }

  return rows;
}

function parseStyleTracker(content) {
  const lines = content.split(/\r?\n/);
  const rows = new Map();
  let headerIndex = null;
  let inMatrix = false;

  for (const line of lines) {
    if (!inMatrix && line.startsWith("| package | status |")) {
      const header = parseMarkdownTableCells(line);
      headerIndex = new Map(header.map((name, index) => [name, index]));
      inMatrix = true;
      continue;
    }

    if (!inMatrix) {
      continue;
    }

    if (!line.startsWith("|")) {
      if (rows.size > 0) {
        break;
      }
      continue;
    }

    if (line.startsWith("| ---")) {
      continue;
    }

    if (!headerIndex) {
      continue;
    }

    const cells = parseMarkdownTableCells(line);
    const packageIndex = headerIndex.get("package");
    const statusIndex = headerIndex.get("status");

    if (packageIndex === undefined || statusIndex === undefined) {
      continue;
    }

    const packageCell = cells[packageIndex] ?? "";
    if (!packageCell.startsWith("`") || !packageCell.endsWith("`")) {
      continue;
    }

    rows.set(packageCell.slice(1, -1), {
      status: cells[statusIndex] ?? "pending",
    });
  }

  return rows;
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
  const caseTrackerRows = fs.existsSync(caseTrackerPath)
    ? parseCaseTracker(readFile(caseTrackerPath))
    : null;
  const styleTrackerRows = fs.existsSync(styleTrackerPath)
    ? parseStyleTracker(readFile(styleTrackerPath))
    : null;

  if (!caseTrackerRows) {
    errors.push(
      `Missing testcase tracker file: ${path.relative(root, caseTrackerPath)}`
    );
  }

  if (!styleTrackerRows) {
    errors.push(
      `Missing style tracker file: ${path.relative(root, styleTrackerPath)}`
    );
  }

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

    if (caseTrackerRows) {
      const caseParity = caseTrackerRows.get(row.upstream);
      if (!caseParity) {
        errors.push(
          `Completed package missing testcase parity row: @react-spectrum/${row.upstream}`
        );
      } else {
        if (caseParity.status !== "checked") {
          errors.push(
            `Completed package status mismatch in testcase tracker: @react-spectrum/${row.upstream} (expected checked, found ${caseParity.status})`
          );
        }

        if (caseParity.missingNamed > 0) {
          errors.push(
            `Completed package has missing upstream named tests: @react-spectrum/${row.upstream} (${caseParity.missingNamed} remaining)`
          );
        }

        if (caseParity.missingFiles !== "none") {
          errors.push(
            `Completed package has missing upstream test files: @react-spectrum/${row.upstream} (${caseParity.missingFiles})`
          );
        }
      }
    }

    if (styleTrackerRows) {
      const styleParity = styleTrackerRows.get(row.upstream);
      if (!styleParity) {
        errors.push(
          `Completed package missing style readiness row: @react-spectrum/${row.upstream}`
        );
      } else if (styleParity.status !== "ready") {
        errors.push(
          `Completed package style readiness is not ready: @react-spectrum/${row.upstream} (found ${styleParity.status})`
        );
      }
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
