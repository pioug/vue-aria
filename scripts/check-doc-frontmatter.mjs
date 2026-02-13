import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const PACKAGES_DIR = path.join(ROOT, 'packages');
const STATUS_MARKER_START = '<!-- PORT_STATUS_START -->';
const STATUS_MARKER_END = '<!-- PORT_STATUS_END -->';
const errors = [];

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

function getFrontmatter(content) {
  const match = content.match(/(?:^|\n)---\n([\s\S]*?)\n---\n/);
  return match?.[1] ?? null;
}

function getFrontmatterValue(frontmatter, key) {
  const keyRegex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const match = frontmatter.match(keyRegex);
  return match ? match[1].trim() : null;
}

const mdxFiles = [];
walk(PACKAGES_DIR, (filePath) => {
  if (filePath.endsWith('.mdx') && filePath.includes(`${path.sep}docs${path.sep}`)) {
    mdxFiles.push(filePath);
  }
});

for (const filePath of mdxFiles) {
  const relative = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = getFrontmatter(content);

  if (!frontmatter) {
    errors.push(`${relative}: missing frontmatter block`);
    continue;
  }

  const packageValue = getFrontmatterValue(frontmatter, 'package');
  if (!packageValue) {
    errors.push(`${relative}: missing frontmatter key "package"`);
    continue;
  }

  if (!content.includes(STATUS_MARKER_START) || !content.includes(STATUS_MARKER_END)) {
    errors.push(`${relative}: missing generated status header block`);
  }

  const pathMatch = relative.match(/^packages\/[^/]+\/([^/]+)\/docs\/.+\.mdx$/);
  if (!pathMatch) {
    continue;
  }

  const expectedPackage = pathMatch[1];
  if (packageValue !== expectedPackage) {
    errors.push(`${relative}: frontmatter package "${packageValue}" must equal "${expectedPackage}"`);
  }
}

if (errors.length > 0) {
  console.error('Docs frontmatter check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Docs frontmatter check passed (${mdxFiles.length} file(s))`);
