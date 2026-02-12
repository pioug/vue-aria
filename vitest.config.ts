import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    conditions: ['source'],
    alias: [
      {find: /\.\.\/intl\/\*\.json$/, replacement: path.resolve(rootDir, 'test-shims/intlMessages.ts')},
      {find: '@internationalized/string', replacement: path.resolve(rootDir, 'test-shims/internationalizedString.ts')},
      {find: '@internationalized/number', replacement: path.resolve(rootDir, 'test-shims/internationalizedNumber.ts')},
      {find: 'use-sync-external-store/shim/index.js', replacement: path.resolve(rootDir, 'test-shims/useSyncExternalStore.ts')},
      {find: /^@vue-aria\/([^/]+)$/, replacement: path.resolve(rootDir, 'packages/@vue-aria/$1/index.ts')},
      {find: /^@vue-stately\/([^/]+)$/, replacement: path.resolve(rootDir, 'packages/@vue-stately/$1/index.ts')},
      {find: /^@vue-spectrum\/([^/]+)$/, replacement: path.resolve(rootDir, 'packages/@vue-spectrum/$1/index.ts')}
    ]
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/**/test/**/*.test.ts']
  }
});
