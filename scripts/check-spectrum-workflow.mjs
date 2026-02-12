import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const trackerPath = path.join(root, "SPECTRUM_PORTING_TRACKER.md");
const wipLockPath = path.join(root, "SPECTRUM_WIP.md");

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

if (!fs.existsSync(trackerPath)) {
  throw new Error(`Missing tracker file: ${trackerPath}`);
}

if (!fs.existsSync(wipLockPath)) {
  throw new Error(`Missing WIP lock file: ${wipLockPath}`);
}

const trackerRows = parseTrackerRows(readFile(trackerPath));
const wipLockContent = readFile(wipLockPath);
const lockMatches = [...wipLockContent.matchAll(/- Active package lock: `@react-spectrum\/([^`]+)`/g)];

if (lockMatches.length !== 1) {
  throw new Error(
    `Expected exactly one active package lock in ${path.relative(root, wipLockPath)}, found ${lockMatches.length}.`
  );
}

const activePackage = lockMatches[0]?.[1];
if (!activePackage) {
  throw new Error(`Could not parse active package lock in ${path.relative(root, wipLockPath)}.`);
}

const row = trackerRows.find((entry) => entry.upstream === activePackage);
if (!row) {
  throw new Error(
    `Active package lock @react-spectrum/${activePackage} does not exist in ${path.relative(root, trackerPath)}.`
  );
}

if (row.checked) {
  throw new Error(
    `Active package lock @react-spectrum/${activePackage} is already checked complete in ${path.relative(root, trackerPath)}.`
  );
}

console.log("Spectrum workflow check passed.");
console.log(`- Active WIP lock: @react-spectrum/${activePackage}`);
console.log("- Mode: single package in progress at a time");
