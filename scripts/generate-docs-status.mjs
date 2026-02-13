import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const STATUS_PATH = path.join(ROOT, 'status.json');
const OUTPUT_DIR = path.join(ROOT, 'docs');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'port-status.md');

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
const global = status.global ?? {};
const packages = Array.isArray(status.packages) ? status.packages : [];

const counts = {
  complete: packages.filter((entry) => entry.status === 'complete').length,
  inProgress: packages.filter((entry) => entry.status === 'in_progress').length,
  notStarted: packages.filter((entry) => entry.status === 'not_started').length
};

const lines = [];
lines.push('# Port Status');
lines.push('');
lines.push('> This page is auto-generated from `status.json`. Do not edit manually.');
lines.push('');
lines.push('## Baseline');
lines.push('');
lines.push(`- Baseline SHA: \`${status.baselineSha ?? 'TBD'}\``);
lines.push('');
lines.push('## Package Completion');
lines.push('');
lines.push(`- Complete: ${counts.complete}/${packages.length}`);
lines.push(`- In progress: ${counts.inProgress}`);
lines.push(`- Not started: ${counts.notStarted}`);
lines.push('');
lines.push('## Test Metrics');
lines.push('');
lines.push('| Metric | Value |');
lines.push('| --- | ---: |');
lines.push(`| Upstream tests | ${global.upstreamTests ?? 0} |`);
lines.push(`| Ported tests | ${global.portedTests ?? 0} |`);
lines.push(`| Passing tests | ${global.passingTests ?? 0} |`);
lines.push(`| Snapshot total | ${global.snapshotTotal ?? 0} |`);
lines.push(`| Snapshot passing | ${global.snapshotPassing ?? 0} |`);
lines.push(`| Docs total | ${global.docsTotal ?? 0} |`);
lines.push(`| Docs complete | ${global.docsComplete ?? 0} |`);
lines.push('');
lines.push('## Incomplete Packages');
lines.push('');

const incomplete = packages
  .filter((entry) => entry.status !== 'complete')
  .sort((a, b) => (a.packageName ?? '').localeCompare(b.packageName ?? ''));

if (incomplete.length === 0) {
  lines.push('All tracked packages are marked complete.');
} else {
  lines.push('| Package | Status | Upstream tests | Ported tests | Passing tests |');
  lines.push('| --- | --- | ---: | ---: | ---: |');
  for (const entry of incomplete) {
    lines.push(`| ${entry.packageName ?? '-'} | ${entry.status ?? '-'} | ${entry.upstreamTests ?? 0} | ${entry.portedTests ?? 0} | ${entry.passingTests ?? 0} |`);
  }
}

lines.push('');

fs.mkdirSync(OUTPUT_DIR, {recursive: true});
fs.writeFileSync(OUTPUT_PATH, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote ${path.relative(ROOT, OUTPUT_PATH)}`);
