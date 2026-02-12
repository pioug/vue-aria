import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    conditions: ['source'],
    alias: [
      {find: /\.\.\/intl\/\*\.json$/, replacement: path.resolve(rootDir, 'test-shims/intlMessages.ts')},
      {find: /^@adobe\/spectrum-css-temp\/.*\.css$/, replacement: path.resolve(rootDir, 'test-shims/spectrumCssModule.ts')},
      {find: /^@spectrum-icons\/(ui|workflow)\/.*$/, replacement: path.resolve(rootDir, 'test-shims/spectrumIcon.tsx')},
      {find: '@internationalized/message', replacement: path.resolve(rootDir, 'test-shims/internationalizedMessage.ts')},
      {find: '@internationalized/string', replacement: path.resolve(rootDir, 'test-shims/internationalizedString.ts')},
      {find: '@internationalized/number', replacement: path.resolve(rootDir, 'test-shims/internationalizedNumber.ts')},
      {find: 'react-aria-components', replacement: path.resolve(rootDir, 'test-shims/reactAriaComponents.tsx')},
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
