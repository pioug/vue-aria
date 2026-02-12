import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const trackerPath = path.join(root, "SPECTRUM_PORTING_TRACKER.md");
const referenceRoot = path.join(
  root,
  "references",
  "react-spectrum",
  "packages",
  "@react-spectrum"
);
const localRoot = path.join(root, "packages", "@vue-spectrum");

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has("--write");
const includeS2 = args.has("--include-s2");
const selectedPackageArg = process.argv.find((arg) => arg.startsWith("--package="));
const selectedPackage = selectedPackageArg?.slice("--package=".length) ?? null;

const TEST_FILE_PATTERN = /\.(test|spec)\.[cm]?[jt]sx?$/;
const TEST_TITLE_PATTERN =
  /\b(?:it|test)(?:\.(?:only|skip|todo))?\s*\(\s*(["'`])([\s\S]*?)\1\s*,/g;
const TEST_EACH_TITLE_PATTERN =
  /\b(?:it|test)\.each\s*\([\s\S]*?\)\s*\(\s*(["'`])([\s\S]*?)\1/g;

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseTrackerRows(content) {
  const mappingPattern = /- \[( |x)\] `@react-spectrum\/([^`]+)` -> `@vue-spectrum\/([^`]+)`/g;
  const rows = [];

  for (const match of content.matchAll(mappingPattern)) {
    rows.push({
      upstream: match[2],
      local: match[3],
    });
  }

  return rows;
}

function collectTestFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const files = [];
  const stack = [directory];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(next);
        continue;
      }

      if (entry.isFile() && TEST_FILE_PATTERN.test(entry.name)) {
        files.push(next);
      }
    }
  }

  return files.sort();
}

function normalizeCaseTitle(input) {
  return input.replace(/\s+/g, " ").trim();
}

function collectNamedCases(directory) {
  const cases = new Set();
  const files = collectTestFiles(directory);

  for (const filePath of files) {
    const content = readFile(filePath);

    for (const match of content.matchAll(TEST_TITLE_PATTERN)) {
      const title = normalizeCaseTitle(match[2] ?? "");
      if (title.length > 0) {
        cases.add(title);
      }
    }

    for (const match of content.matchAll(TEST_EACH_TITLE_PATTERN)) {
      const title = normalizeCaseTitle(match[2] ?? "");
      if (title.length > 0) {
        cases.add(title);
      }
    }
  }

  return cases;
}

function escapeSingleQuotedString(input) {
  return input.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function buildScaffoldContent(row, missingTitles) {
  const lines = [];
  lines.push('import { describe, it } from "vitest";');
  lines.push("");
  lines.push("/**");
  lines.push(" * Auto-generated upstream parity scaffold.");
  lines.push(
    ` * Source package: @react-spectrum/${row.upstream} -> @vue-spectrum/${row.local}.`
  );
  lines.push(
    " * Regenerate with: npm run scaffold:spectrum-missing-tests -- --write [--package=<name>]"
  );
  lines.push(" */");
  lines.push(
    `describe("@react-spectrum/${row.upstream} missing named cases", () => {`
  );

  for (const title of missingTitles) {
    lines.push(`  it.skip('${escapeSingleQuotedString(title)}', () => {});`);
  }

  lines.push("});");
  lines.push("");
  return lines.join("\n");
}

if (!fs.existsSync(trackerPath)) {
  throw new Error(`Missing tracker file: ${trackerPath}`);
}

if (!fs.existsSync(referenceRoot)) {
  throw new Error(`Missing upstream reference directory: ${referenceRoot}`);
}

const trackerRows = parseTrackerRows(readFile(trackerPath));
const selectedRows = selectedPackage
  ? trackerRows.filter((row) => row.upstream === selectedPackage || row.local === selectedPackage)
  : trackerRows.filter((row) => includeS2 || row.upstream !== "s2");

if (selectedRows.length === 0) {
  throw new Error(
    selectedPackage
      ? `No tracker rows matched --package=${selectedPackage}`
      : "No package rows found in tracker."
  );
}

let totalMissing = 0;
let filesWritten = 0;
let filesRemoved = 0;
const summaries = [];

for (const row of selectedRows) {
  const upstreamCases = collectNamedCases(path.join(referenceRoot, row.upstream, "test"));
  const localCases = collectNamedCases(path.join(localRoot, row.local, "test"));
  const missingTitles = [...upstreamCases]
    .filter((title) => !localCases.has(title))
    .sort((left, right) => left.localeCompare(right));

  totalMissing += missingTitles.length;
  summaries.push({
    row,
    upstreamNamedCount: upstreamCases.size,
    localNamedCount: localCases.size,
    missingTitles,
  });

  if (!shouldWrite) {
    continue;
  }

  const outputPath = path.join(
    localRoot,
    row.local,
    "test",
    "__upstream-missing__.test.ts"
  );

  if (missingTitles.length === 0) {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      filesRemoved += 1;
    }
    continue;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const nextContent = buildScaffoldContent(row, missingTitles);
  const previousContent = fs.existsSync(outputPath) ? readFile(outputPath) : null;

  if (previousContent !== nextContent) {
    fs.writeFileSync(outputPath, nextContent);
    filesWritten += 1;
  }
}

summaries.sort(
  (left, right) =>
    right.missingTitles.length - left.missingTitles.length ||
    left.row.upstream.localeCompare(right.row.upstream)
);

console.log("Spectrum missing upstream named-case scaffold summary:");
for (const summary of summaries.slice(0, 20)) {
  if (summary.missingTitles.length === 0) {
    continue;
  }
  const sample = summary.missingTitles.slice(0, 3).join(" | ");
  console.log(
    `- ${summary.row.upstream}: ${summary.missingTitles.length} missing (sample: ${sample})`
  );
}
console.log(`- Total missing named cases: ${totalMissing}`);

if (!shouldWrite) {
  console.log(
    "- Dry run only. Re-run with --write to create/update __upstream-missing__.test.ts files."
  );
} else {
  console.log(`- Scaffold files written: ${filesWritten}`);
  console.log(`- Scaffold files removed: ${filesRemoved}`);
}

if (!includeS2 && !selectedPackage) {
  console.log("- Note: S2 is skipped by default. Use --include-s2 to include it.");
}
