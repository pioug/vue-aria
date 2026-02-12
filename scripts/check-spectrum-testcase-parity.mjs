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
const reportPath = path.join(root, "SPECTRUM_TESTCASE_TRACKER.md");

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has("--write");
const includeLocalOnly = args.has("--include-local-only");
const selectedPackageArg = process.argv.find((arg) => arg.startsWith("--package="));
const selectedPackage = selectedPackageArg?.slice("--package=".length) ?? null;

const TEST_FILE_PATTERN = /\.(test|spec)\.[cm]?[jt]sx?$/;
const TEST_CALL_PATTERN = /\b(?:it|test)(?:\.(?:only|skip|todo))?(?:\.each)?\s*\(/g;
const TEST_TITLE_PATTERN =
  /\b(?:it|test)(?:\.(?:only|skip|todo))?\s*\(\s*(["'`])([\s\S]*?)\1\s*,/g;
const TEST_EACH_TITLE_PATTERN =
  /\b(?:it|test)\.each\s*\([\s\S]*?\)\s*\(\s*(["'`])([\s\S]*?)\1/g;

function readFile(absolutePath) {
  return fs.readFileSync(absolutePath, "utf8");
}

function parseTrackerRows(content) {
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

function normalizeTestFileName(filePath) {
  return path.basename(filePath).replace(/\.[^.]+$/, "");
}

function normalizeCaseTitle(input) {
  return input.replace(/\s+/g, " ").trim();
}

function analyzeTestFile(filePath) {
  const content = readFile(filePath);
  const callCount = [...content.matchAll(TEST_CALL_PATTERN)].length;
  const titles = new Set();

  for (const match of content.matchAll(TEST_TITLE_PATTERN)) {
    const title = normalizeCaseTitle(match[2] ?? "");
    if (title.length > 0) {
      titles.add(title);
    }
  }

  for (const match of content.matchAll(TEST_EACH_TITLE_PATTERN)) {
    const title = normalizeCaseTitle(match[2] ?? "");
    if (title.length > 0) {
      titles.add(title);
    }
  }

  return { callCount, titles };
}

function analyzePackageTests(upstreamPackage, localPackage) {
  const upstreamTestDir = path.join(referenceRoot, upstreamPackage, "test");
  const localTestDir = path.join(localRoot, localPackage, "test");

  const upstreamFiles = collectTestFiles(upstreamTestDir);
  const localFiles = collectTestFiles(localTestDir);

  const upstreamFileKeys = new Set(upstreamFiles.map(normalizeTestFileName));
  const localFileKeys = new Set(localFiles.map(normalizeTestFileName));
  const missingTestFiles = [...upstreamFileKeys].filter((key) => !localFileKeys.has(key));

  let upstreamCaseCalls = 0;
  let localCaseCalls = 0;
  const upstreamTitles = new Set();
  const localTitles = new Set();

  for (const filePath of upstreamFiles) {
    const analysis = analyzeTestFile(filePath);
    upstreamCaseCalls += analysis.callCount;
    for (const title of analysis.titles) {
      upstreamTitles.add(title);
    }
  }

  for (const filePath of localFiles) {
    const analysis = analyzeTestFile(filePath);
    localCaseCalls += analysis.callCount;
    for (const title of analysis.titles) {
      localTitles.add(title);
    }
  }

  const missingNamedCases = [...upstreamTitles].filter((title) => !localTitles.has(title));
  const localOnlyNamedCases = [...localTitles].filter((title) => !upstreamTitles.has(title));
  const matchedNamedCases = [...upstreamTitles].filter((title) => localTitles.has(title));
  const upstreamNamedCases = upstreamTitles.size;
  const localNamedCases = localTitles.size;
  const matchedNamedCaseCount = matchedNamedCases.length;
  const caseDelta = localCaseCalls - upstreamCaseCalls;
  const rawCoverage =
    upstreamCaseCalls > 0
      ? (localCaseCalls / upstreamCaseCalls) * 100
      : localCaseCalls > 0
        ? 100
        : 0;
  const namedCoverage =
    upstreamNamedCases > 0
      ? (matchedNamedCaseCount / upstreamNamedCases) * 100
      : localNamedCases > 0
        ? 100
        : 0;

  return {
    upstreamFiles: upstreamFiles.length,
    localFiles: localFiles.length,
    upstreamCaseCalls,
    localCaseCalls,
    caseDelta,
    rawCoverage,
    upstreamNamedCases,
    localNamedCases,
    matchedNamedCaseCount,
    localOnlyNamedCaseCount: localOnlyNamedCases.length,
    namedCoverage,
    missingTestFiles,
    missingNamedCases,
    localOnlyNamedCases,
  };
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function summarizeTotals(rows) {
  const totals = {
    upstreamCaseCalls: 0,
    localCaseCalls: 0,
    upstreamNamedCases: 0,
    localNamedCases: 0,
    matchedNamedCaseCount: 0,
    localOnlyNamedCaseCount: 0,
    upstreamFiles: 0,
    localFiles: 0,
  };

  for (const row of rows) {
    totals.upstreamCaseCalls += row.analysis.upstreamCaseCalls;
    totals.localCaseCalls += row.analysis.localCaseCalls;
    totals.upstreamNamedCases += row.analysis.upstreamNamedCases;
    totals.localNamedCases += row.analysis.localNamedCases;
    totals.matchedNamedCaseCount += row.analysis.matchedNamedCaseCount;
    totals.localOnlyNamedCaseCount += row.analysis.localOnlyNamedCaseCount;
    totals.upstreamFiles += row.analysis.upstreamFiles;
    totals.localFiles += row.analysis.localFiles;
  }

  return totals;
}

function buildMarkdownReport(rows, options = {}) {
  const includeLocalOnlyDiagnostics = Boolean(
    (options && typeof options === "object" && "includeLocalOnly" in options
      ? options.includeLocalOnly
      : false)
  );
  const now = new Date();
  const isoDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(
    now.getUTCDate()
  ).padStart(2, "0")}`;
  const allTotals = summarizeTotals(rows);
  const v1Rows = rows.filter((row) => row.upstream !== "s2");
  const v1Totals = summarizeTotals(v1Rows);
  const checkedRows = rows.filter((row) => row.checked);
  const checkedTotals = summarizeTotals(checkedRows);
  const allRawRemaining = Math.max(0, allTotals.upstreamCaseCalls - allTotals.localCaseCalls);
  const v1RawRemaining = Math.max(0, v1Totals.upstreamCaseCalls - v1Totals.localCaseCalls);
  const allNamedRemaining = Math.max(0, allTotals.upstreamNamedCases - allTotals.matchedNamedCaseCount);
  const v1NamedRemaining = Math.max(0, v1Totals.upstreamNamedCases - v1Totals.matchedNamedCaseCount);
  const checkedNamedRemaining = Math.max(
    0,
    checkedTotals.upstreamNamedCases - checkedTotals.matchedNamedCaseCount
  );

  const lines = [];
  lines.push("# Spectrum Test-Case Parity Tracker");
  lines.push("");
  lines.push("Auto-generated by `scripts/check-spectrum-testcase-parity.mjs --write`.");
  lines.push("");
  lines.push("## Snapshot");
  lines.push("");
  lines.push(`- Generated (UTC): \`${isoDate}\``);
  lines.push(
    `- All packages named-case parity (upstream matched): \`${allTotals.matchedNamedCaseCount} / ${allTotals.upstreamNamedCases}\` (remaining \`${allNamedRemaining}\`, coverage \`${formatPercent(
      allTotals.upstreamNamedCases > 0
        ? (allTotals.matchedNamedCaseCount / allTotals.upstreamNamedCases) * 100
        : 0
    )}\`)`
  );
  lines.push(
    `- V1-only named-case parity (excluding \`s2\`): \`${v1Totals.matchedNamedCaseCount} / ${v1Totals.upstreamNamedCases}\` (remaining \`${v1NamedRemaining}\`, coverage \`${formatPercent(
      v1Totals.upstreamNamedCases > 0
        ? (v1Totals.matchedNamedCaseCount / v1Totals.upstreamNamedCases) * 100
        : 0
    )}\`)`
  );
  lines.push(
    `- Checked-package named-case parity: \`${checkedTotals.matchedNamedCaseCount} / ${checkedTotals.upstreamNamedCases}\` (remaining \`${checkedNamedRemaining}\`, coverage \`${formatPercent(
      checkedTotals.upstreamNamedCases > 0
        ? (checkedTotals.matchedNamedCaseCount / checkedTotals.upstreamNamedCases) * 100
        : 0
    )}\`)`
  );
  lines.push(
    `- All packages raw call ratio (secondary): \`${allTotals.localCaseCalls} / ${allTotals.upstreamCaseCalls}\` (remaining \`${allRawRemaining}\`, coverage \`${formatPercent(
      allTotals.upstreamCaseCalls > 0 ? (allTotals.localCaseCalls / allTotals.upstreamCaseCalls) * 100 : 0
    )}\`)`
  );
  lines.push(
    `- V1-only raw call ratio (excluding \`s2\`, secondary): \`${v1Totals.localCaseCalls} / ${v1Totals.upstreamCaseCalls}\` (remaining \`${v1RawRemaining}\`, coverage \`${formatPercent(
      v1Totals.upstreamCaseCalls > 0 ? (v1Totals.localCaseCalls / v1Totals.upstreamCaseCalls) * 100 : 0
    )}\`)`
  );
  lines.push(
    `- Checked-package raw call ratio (secondary): \`${checkedTotals.localCaseCalls} / ${checkedTotals.upstreamCaseCalls}\``
  );
  if (includeLocalOnlyDiagnostics) {
    lines.push(
      `- All packages local-only named cases (diagnostic): \`${allTotals.localOnlyNamedCaseCount}\``
    );
  }
  lines.push(
    "- Note: named-case parity is the primary upstream progress metric; raw call ratio is informational."
  );
  lines.push("");
  lines.push("## Package Matrix");
  lines.push("");
  if (includeLocalOnlyDiagnostics) {
    lines.push(
      "| package | status | upstream files | local files | upstream named | matched named | missing named | named coverage | upstream calls | local calls | call delta | call coverage | local-only named | missing upstream test files |"
    );
    lines.push(
      "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |"
    );
  } else {
    lines.push(
      "| package | status | upstream files | local files | upstream named | matched named | missing named | named coverage | upstream calls | local calls | call delta | call coverage | missing upstream test files |"
    );
    lines.push(
      "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |"
    );
  }

  for (const row of rows) {
    const status = row.checked ? "checked" : "pending";
    const missingFiles =
      row.analysis.missingTestFiles.length > 0
        ? row.analysis.missingTestFiles.join(", ")
        : "none";

    if (includeLocalOnlyDiagnostics) {
      lines.push(
        `| \`${row.upstream}\` | ${status} | ${row.analysis.upstreamFiles} | ${row.analysis.localFiles} | ${row.analysis.upstreamNamedCases} | ${row.analysis.matchedNamedCaseCount} | ${row.analysis.missingNamedCases.length} | ${formatPercent(
          row.analysis.namedCoverage
        )} | ${row.analysis.upstreamCaseCalls} | ${row.analysis.localCaseCalls} | ${row.analysis.caseDelta} | ${formatPercent(
          row.analysis.rawCoverage
        )} | ${row.analysis.localOnlyNamedCaseCount} | ${missingFiles} |`
      );
    } else {
      lines.push(
        `| \`${row.upstream}\` | ${status} | ${row.analysis.upstreamFiles} | ${row.analysis.localFiles} | ${row.analysis.upstreamNamedCases} | ${row.analysis.matchedNamedCaseCount} | ${row.analysis.missingNamedCases.length} | ${formatPercent(
          row.analysis.namedCoverage
        )} | ${row.analysis.upstreamCaseCalls} | ${row.analysis.localCaseCalls} | ${row.analysis.caseDelta} | ${formatPercent(
          row.analysis.rawCoverage
        )} | ${missingFiles} |`
      );
    }
  }

  lines.push("");
  lines.push("## Missing Upstream Named Test Cases (Sample)");
  lines.push("");

  const rowsWithMissingTitles = rows
    .filter((row) => row.analysis.missingNamedCases.length > 0)
    .sort((left, right) => right.analysis.missingNamedCases.length - left.analysis.missingNamedCases.length);

  if (rowsWithMissingTitles.length === 0) {
    lines.push("- None.");
  } else {
    for (const row of rowsWithMissingTitles.slice(0, 20)) {
      const sample = row.analysis.missingNamedCases.slice(0, 5).map((title) => `\`${title}\``).join(", ");
      lines.push(
        `- \`${row.upstream}\`: ${row.analysis.missingNamedCases.length} missing named cases (sample: ${sample})`
      );
    }
  }

  lines.push("");
  if (includeLocalOnlyDiagnostics) {
    lines.push("## Local-Only Named Test Cases (Sample)");
    lines.push("");

    const rowsWithLocalOnlyTitles = rows
      .filter((row) => row.analysis.localOnlyNamedCases.length > 0)
      .sort(
        (left, right) =>
          right.analysis.localOnlyNamedCases.length - left.analysis.localOnlyNamedCases.length
      );

    if (rowsWithLocalOnlyTitles.length === 0) {
      lines.push("- None.");
    } else {
      for (const row of rowsWithLocalOnlyTitles.slice(0, 20)) {
        const sample = row.analysis.localOnlyNamedCases
          .slice(0, 5)
          .map((title) => `\`${title}\``)
          .join(", ");
        lines.push(
          `- \`${row.upstream}\`: ${row.analysis.localOnlyNamedCases.length} local-only named cases (sample: ${sample})`
        );
      }
    }

    lines.push("");
  }
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
  : trackerRows;

if (selectedRows.length === 0) {
  throw new Error(
    selectedPackage
      ? `No tracker rows matched --package=${selectedPackage}`
      : "No package rows found in tracker."
  );
}

const analyzedRows = selectedRows.map((row) => ({
  ...row,
  analysis: analyzePackageTests(row.upstream, row.local),
}));

const totals = summarizeTotals(analyzedRows);
const rawRemaining = Math.max(0, totals.upstreamCaseCalls - totals.localCaseCalls);
const namedRemaining = Math.max(0, totals.upstreamNamedCases - totals.matchedNamedCaseCount);

console.log("Spectrum test-case parity summary:");
console.log(
  `- Named parity (upstream matched): ${totals.matchedNamedCaseCount} / ${totals.upstreamNamedCases} (${formatPercent(
    totals.upstreamNamedCases > 0
      ? (totals.matchedNamedCaseCount / totals.upstreamNamedCases) * 100
      : 0
  )})`
);
console.log(`- Remaining named-case gap (non-negative): ${namedRemaining}`);
console.log(
  `- Raw calls: ${totals.localCaseCalls} / ${totals.upstreamCaseCalls} (${formatPercent(
    totals.upstreamCaseCalls > 0 ? (totals.localCaseCalls / totals.upstreamCaseCalls) * 100 : 0
  )})`
);
console.log(`- Remaining raw call gap (non-negative): ${rawRemaining}`);
if (includeLocalOnly) {
  console.log(`- Local-only named cases (diagnostic): ${totals.localOnlyNamedCaseCount}`);
}

const rowsWithMissingFiles = analyzedRows.filter(
  (row) => row.analysis.missingTestFiles.length > 0
);
if (rowsWithMissingFiles.length > 0) {
  console.log("- Packages with missing upstream test file coverage:");
  for (const row of rowsWithMissingFiles) {
    console.log(
      `  - ${row.upstream}: ${row.analysis.missingTestFiles.join(", ")}`
    );
  }
}

const rowsWithMissingTitles = analyzedRows.filter(
  (row) => row.analysis.missingNamedCases.length > 0
);
if (rowsWithMissingTitles.length > 0) {
  console.log("- Packages with missing upstream named test cases (sample):");
  for (const row of rowsWithMissingTitles.slice(0, 15)) {
    const sample = row.analysis.missingNamedCases.slice(0, 3).join(" | ");
    console.log(
      `  - ${row.upstream}: ${row.analysis.missingNamedCases.length} missing (sample: ${sample})`
    );
  }
}

if (includeLocalOnly) {
  const rowsWithLocalOnlyTitles = analyzedRows.filter(
    (row) => row.analysis.localOnlyNamedCases.length > 0
  );
  if (rowsWithLocalOnlyTitles.length > 0) {
    console.log("- Packages with local-only named test cases (sample):");
    for (const row of rowsWithLocalOnlyTitles
      .sort(
        (left, right) =>
          right.analysis.localOnlyNamedCases.length - left.analysis.localOnlyNamedCases.length
      )
      .slice(0, 15)) {
      const sample = row.analysis.localOnlyNamedCases.slice(0, 3).join(" | ");
      console.log(
        `  - ${row.upstream}: ${row.analysis.localOnlyNamedCases.length} local-only (sample: ${sample})`
      );
    }
  }
}

if (shouldWrite && !selectedPackage) {
  const markdown = buildMarkdownReport(analyzedRows, {
    includeLocalOnly,
  });
  fs.writeFileSync(reportPath, markdown);
  console.log(`Wrote ${path.relative(root, reportPath)}`);
}
