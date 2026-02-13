import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const STATUS_PATH = path.join(ROOT, 'status.json');
const PACKAGES_DIR = path.join(ROOT, 'packages');
const STATUS_MARKER_START = '<!-- PORT_STATUS_START -->';
const STATUS_MARKER_END = '<!-- PORT_STATUS_END -->';

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const baselineSha = status?.baselineSha ?? 'unknown';
const statusPackages = Array.isArray(status?.packages) ? status.packages : [];

function walk(dirPath, onFile) {
  for (const entry of fs.readdirSync(dirPath, {withFileTypes: true})) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath, onFile);
      continue;
    }

    if (entry.isFile()) {
      onFile(entryPath);
    }
  }
}

function readFrontmatter(content) {
  const match = content.match(/(?:^|\n)---\n([\s\S]*?)\n---\n/);
  return match?.[1] ?? null;
}

function readFrontmatterValue(frontmatter, key) {
  const keyRegex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const match = frontmatter.match(keyRegex);
  return match ? match[1].trim() : null;
}

function formatPercent(done, total) {
  if (!Number.isInteger(done) || !Number.isInteger(total) || total <= 0) {
    return '100.0%';
  }
  return `${((done / total) * 100).toFixed(1)}%`;
}

function resolveStatusEntry(packageKey, packageNameHint) {
  if (packageNameHint) {
    const hintedMatch = statusPackages.find((entry) => entry.packageName === packageNameHint);
    if (hintedMatch) {
      return hintedMatch;
    }
  }

  const exactMatch = statusPackages.find((entry) => entry.packageName === packageKey);
  if (exactMatch) {
    return exactMatch;
  }

  const scopedMatches = statusPackages.filter((entry) => entry.packageName?.endsWith(`/${packageKey}`));
  if (scopedMatches.length === 1) {
    return scopedMatches[0];
  }

  if (scopedMatches.length > 1) {
    throw new Error(`Ambiguous status entry for package key "${packageKey}"`);
  }

  throw new Error(`Missing status entry for package key "${packageKey}"`);
}

function renderStatusBlock(entry) {
  const tests = `${entry.passingTests}/${entry.upstreamTests} (${formatPercent(entry.passingTests, entry.upstreamTests)})`;
  const snapshots = `${entry.snapshotPassing}/${entry.snapshotTotal} (${formatPercent(entry.snapshotPassing, entry.snapshotTotal)})`;
  const docs = `${entry.docsComplete}/${entry.docsTotal} (${formatPercent(entry.docsComplete, entry.docsTotal)})`;
  const deviations = entry.hasDeviations ? 'yes' : 'no';

  return [
    STATUS_MARKER_START,
    '> **Port Status**',
    `> - Status: \`${entry.status}\``,
    `> - Test parity: \`${tests}\``,
    `> - Snapshot parity: \`${snapshots}\``,
    `> - Docs completion: \`${docs}\``,
    `> - Baseline SHA: \`${baselineSha}\``,
    `> - Deviations: \`${deviations}\``,
    `> - Upstream reference: <${entry.upstreamUrl}>`,
    STATUS_MARKER_END
  ].join('\n');
}

let updatedCount = 0;
const errors = [];

walk(PACKAGES_DIR, (filePath) => {
  if (!filePath.endsWith('.mdx') || !filePath.includes(`${path.sep}docs${path.sep}`)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = readFrontmatter(content);
  if (!frontmatter) {
    errors.push(`${path.relative(ROOT, filePath)}: missing frontmatter`);
    return;
  }

  const packageKey = readFrontmatterValue(frontmatter, 'package');
  if (!packageKey) {
    errors.push(`${path.relative(ROOT, filePath)}: missing frontmatter key "package"`);
    return;
  }

  const relative = path.relative(ROOT, filePath);
  const packagePathMatch = relative.match(/^packages\/([^/]+)\/([^/]+)\/docs\/.+\.mdx$/);
  const packageNameHint = packagePathMatch ? `${packagePathMatch[1]}/${packagePathMatch[2]}` : null;

  let entry;
  try {
    entry = resolveStatusEntry(packageKey, packageNameHint);
  } catch (error) {
    errors.push(`${relative}: ${error.message}`);
    return;
  }

  const block = renderStatusBlock(entry);
  let nextContent;

  if (content.includes(STATUS_MARKER_START) && content.includes(STATUS_MARKER_END)) {
    nextContent = content.replace(
      /<!-- PORT_STATUS_START -->[\s\S]*?<!-- PORT_STATUS_END -->/,
      block
    );
  } else {
    const headingMatch = content.match(/^# .+$/m);
    if (!headingMatch) {
      errors.push(`${path.relative(ROOT, filePath)}: missing top-level heading for status block insertion`);
      return;
    }

    nextContent = content.replace(headingMatch[0], `${headingMatch[0]}\n\n${block}`);
  }

  if (nextContent !== content) {
    fs.writeFileSync(filePath, nextContent);
    updatedCount += 1;
  }
});

if (errors.length > 0) {
  console.error('Docs status header generation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Synced docs status headers (${updatedCount} file(s) updated)`);
