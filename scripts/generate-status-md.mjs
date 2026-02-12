import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const statusPath = path.join(cwd, 'status.json');
const outputPath = path.join(cwd, 'status.md');

const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));

const global = status.global ?? {};
const packages = Array.isArray(status.packages) ? status.packages : [];

const lines = [];
lines.push('# Port Status');
lines.push('');
lines.push('> This file is auto-generated from `status.json`. Do not edit manually.');
lines.push('');
lines.push('## Baseline');
lines.push('');
lines.push(`- Baseline SHA: \`${status.baselineSha ?? 'TBD'}\``);
lines.push('');
lines.push('## Global Metrics');
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
lines.push('## Package Metrics');
lines.push('');

if (packages.length === 0) {
  lines.push('No packages tracked yet.');
} else {
  lines.push('| Package | Status | Upstream tests | Ported tests | Passing tests | Snapshot total | Snapshot passing | Docs total | Docs complete | Deviations | Upstream package | Upstream path |');
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |');
  for (const entry of packages) {
    lines.push(`| ${entry.packageName ?? '-'} | ${entry.status ?? '-'} | ${entry.upstreamTests ?? 0} | ${entry.portedTests ?? 0} | ${entry.passingTests ?? 0} | ${entry.snapshotTotal ?? 0} | ${entry.snapshotPassing ?? 0} | ${entry.docsTotal ?? 0} | ${entry.docsComplete ?? 0} | ${entry.hasDeviations ?? false} | ${entry.upstreamPackageName ?? '-'} | ${entry.upstreamPath ?? '-'} |`);
  }
}

lines.push('');
fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
