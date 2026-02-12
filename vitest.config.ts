import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    conditions: ['source'],
    alias: [
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
