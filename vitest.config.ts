import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["packages/**/test/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@vue-aria/utils": fileURLToPath(
        new URL("./packages/@vue-aria/utils/src/index.ts", import.meta.url)
      ),
      "@vue-aria/types": fileURLToPath(
        new URL("./packages/@vue-aria/types/src/index.ts", import.meta.url)
      ),
      "@vue-aria/ssr": fileURLToPath(
        new URL("./packages/@vue-aria/ssr/src/index.ts", import.meta.url)
      ),
      "@vue-aria/flags": fileURLToPath(
        new URL("./packages/@vue-aria/flags/src/index.ts", import.meta.url)
      ),
      "@vue-aria/i18n": fileURLToPath(
        new URL("./packages/@vue-aria/i18n/src/index.ts", import.meta.url)
      ),
      "@vue-aria/collections": fileURLToPath(
        new URL("./packages/@vue-aria/collections/src/index.ts", import.meta.url)
      ),
      "@vue-aria/toggle-state": fileURLToPath(
        new URL("./packages/@vue-aria/toggle-state/src/index.ts", import.meta.url)
      )
    }
  }
});
