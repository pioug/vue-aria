import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@vue-aria/types": fileURLToPath(
        new URL("./packages/@vue-aria/types/src/index.ts", import.meta.url)
      ),
      "@vue-aria/utils": fileURLToPath(
        new URL("./packages/@vue-aria/utils/src/index.ts", import.meta.url)
      ),
      "@vue-aria/ssr": fileURLToPath(
        new URL("./packages/@vue-aria/ssr/src/index.ts", import.meta.url)
      ),
      "@vue-aria/focus": fileURLToPath(
        new URL("./packages/@vue-aria/focus/src/index.ts", import.meta.url)
      ),
      "@vue-aria/interactions": fileURLToPath(
        new URL("./packages/@vue-aria/interactions/src/index.ts", import.meta.url)
      ),
      "@vue-aria/button": fileURLToPath(
        new URL("./packages/@vue-aria/button/src/index.ts", import.meta.url)
      ),
      "@vue-aria/checkbox": fileURLToPath(
        new URL("./packages/@vue-aria/checkbox/src/index.ts", import.meta.url)
      ),
      "@vue-aria/radio": fileURLToPath(
        new URL("./packages/@vue-aria/radio/src/index.ts", import.meta.url)
      ),
      "@vue-aria/switch": fileURLToPath(
        new URL("./packages/@vue-aria/switch/src/index.ts", import.meta.url)
      ),
      "@vue-aria/slider": fileURLToPath(
        new URL("./packages/@vue-aria/slider/src/index.ts", import.meta.url)
      ),
      "@vue-aria/link": fileURLToPath(
        new URL("./packages/@vue-aria/link/src/index.ts", import.meta.url)
      ),
      "@vue-aria/label": fileURLToPath(
        new URL("./packages/@vue-aria/label/src/index.ts", import.meta.url)
      ),
      "@vue-aria/textfield": fileURLToPath(
        new URL("./packages/@vue-aria/textfield/src/index.ts", import.meta.url)
      ),
      "@vue-aria/searchfield": fileURLToPath(
        new URL("./packages/@vue-aria/searchfield/src/index.ts", import.meta.url)
      ),
      "@vue-aria/numberfield": fileURLToPath(
        new URL("./packages/@vue-aria/numberfield/src/index.ts", import.meta.url)
      ),
      "@vue-aria/spinbutton": fileURLToPath(
        new URL("./packages/@vue-aria/spinbutton/src/index.ts", import.meta.url)
      ),
      "@vue-aria/separator": fileURLToPath(
        new URL("./packages/@vue-aria/separator/src/index.ts", import.meta.url)
      ),
      "@vue-aria/visually-hidden": fileURLToPath(
        new URL("./packages/@vue-aria/visually-hidden/src/index.ts", import.meta.url)
      ),
      "@vue-aria/vue-aria": fileURLToPath(
        new URL("./packages/@vue-aria/vue-aria/src/index.ts", import.meta.url)
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/setup.ts"],
    include: ["packages/**/test/**/*.test.ts"],
    restoreMocks: true,
    clearMocks: true,
  },
});
