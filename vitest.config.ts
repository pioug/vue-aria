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
      ),
      "@vue-aria/utils-state": fileURLToPath(
        new URL("./packages/@vue-aria/utils-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/selection-state": fileURLToPath(
        new URL("./packages/@vue-aria/selection-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/selection": fileURLToPath(
        new URL("./packages/@vue-aria/selection/src/index.ts", import.meta.url)
      ),
      "@vue-aria/interactions": fileURLToPath(
        new URL("./packages/@vue-aria/interactions/src/index.ts", import.meta.url)
      ),
      "@vue-aria/focus": fileURLToPath(
        new URL("./packages/@vue-aria/focus/src/index.ts", import.meta.url)
      ),
      "@vue-aria/live-announcer": fileURLToPath(
        new URL("./packages/@vue-aria/live-announcer/src/index.ts", import.meta.url)
      ),
      "@vue-aria/visually-hidden": fileURLToPath(
        new URL("./packages/@vue-aria/visually-hidden/src/index.ts", import.meta.url)
      ),
      "@vue-aria/label": fileURLToPath(
        new URL("./packages/@vue-aria/label/src/index.ts", import.meta.url)
      ),
      "@vue-aria/button": fileURLToPath(
        new URL("./packages/@vue-aria/button/src/index.ts", import.meta.url)
      ),
      "@vue-aria/link": fileURLToPath(
        new URL("./packages/@vue-aria/link/src/index.ts", import.meta.url)
      ),
      "@vue-aria/toggle": fileURLToPath(
        new URL("./packages/@vue-aria/toggle/src/index.ts", import.meta.url)
      ),
      "@vue-aria/checkbox-state": fileURLToPath(
        new URL("./packages/@vue-aria/checkbox-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/checkbox": fileURLToPath(
        new URL("./packages/@vue-aria/checkbox/src/index.ts", import.meta.url)
      ),
      "@vue-aria/radio-state": fileURLToPath(
        new URL("./packages/@vue-aria/radio-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/radio": fileURLToPath(
        new URL("./packages/@vue-aria/radio/src/index.ts", import.meta.url)
      ),
      "@vue-aria/switch": fileURLToPath(
        new URL("./packages/@vue-aria/switch/src/index.ts", import.meta.url)
      ),
      "@vue-aria/textfield": fileURLToPath(
        new URL("./packages/@vue-aria/textfield/src/index.ts", import.meta.url)
      ),
      "@vue-aria/searchfield-state": fileURLToPath(
        new URL("./packages/@vue-aria/searchfield-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/searchfield": fileURLToPath(
        new URL("./packages/@vue-aria/searchfield/src/index.ts", import.meta.url)
      ),
      "@vue-aria/progress": fileURLToPath(
        new URL("./packages/@vue-aria/progress/src/index.ts", import.meta.url)
      )
    }
  }
});
