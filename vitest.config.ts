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
      "@vue-aria/aria-modal-polyfill": fileURLToPath(
        new URL("./packages/@vue-aria/aria-modal-polyfill/src/index.ts", import.meta.url)
      ),
      "@vue-aria/landmark": fileURLToPath(
        new URL("./packages/@vue-aria/landmark/src/index.ts", import.meta.url)
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
      "@vue-aria/actiongroup": fileURLToPath(
        new URL("./packages/@vue-aria/actiongroup/src/index.ts", import.meta.url)
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
      "@vue-aria/form": fileURLToPath(
        new URL("./packages/@vue-aria/form/src/index.ts", import.meta.url)
      ),
      "@vue-aria/form-state": fileURLToPath(
        new URL("./packages/@vue-aria/form-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/spinbutton": fileURLToPath(
        new URL("./packages/@vue-aria/spinbutton/src/index.ts", import.meta.url)
      ),
      "@vue-aria/numberfield-state": fileURLToPath(
        new URL("./packages/@vue-aria/numberfield-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/slider-state": fileURLToPath(
        new URL("./packages/@vue-aria/slider-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/numberfield": fileURLToPath(
        new URL("./packages/@vue-aria/numberfield/src/index.ts", import.meta.url)
      ),
      "@vue-aria/slider": fileURLToPath(
        new URL("./packages/@vue-aria/slider/src/index.ts", import.meta.url)
      ),
      "@vue-aria/progress": fileURLToPath(
        new URL("./packages/@vue-aria/progress/src/index.ts", import.meta.url)
      ),
      "@vue-aria/meter": fileURLToPath(
        new URL("./packages/@vue-aria/meter/src/index.ts", import.meta.url)
      ),
      "@vue-aria/dialog": fileURLToPath(
        new URL("./packages/@vue-aria/dialog/src/index.ts", import.meta.url)
      ),
      "@vue-aria/breadcrumbs": fileURLToPath(
        new URL("./packages/@vue-aria/breadcrumbs/src/index.ts", import.meta.url)
      ),
      "@vue-aria/separator": fileURLToPath(
        new URL("./packages/@vue-aria/separator/src/index.ts", import.meta.url)
      ),
      "@vue-aria/overlays-state": fileURLToPath(
        new URL("./packages/@vue-aria/overlays-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/listbox": fileURLToPath(
        new URL("./packages/@vue-aria/listbox/src/index.ts", import.meta.url)
      ),
      "@vue-aria/list-state": fileURLToPath(
        new URL("./packages/@vue-aria/list-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/select": fileURLToPath(
        new URL("./packages/@vue-aria/select/src/index.ts", import.meta.url)
      ),
      "@vue-aria/menu": fileURLToPath(
        new URL("./packages/@vue-aria/menu/src/index.ts", import.meta.url)
      ),
      "@vue-aria/combobox-state": fileURLToPath(
        new URL("./packages/@vue-aria/combobox-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/combobox": fileURLToPath(
        new URL("./packages/@vue-aria/combobox/src/index.ts", import.meta.url)
      ),
      "@vue-aria/grid-state": fileURLToPath(
        new URL("./packages/@vue-aria/grid-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/table-state": fileURLToPath(
        new URL("./packages/@vue-aria/table-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/tree-state": fileURLToPath(
        new URL("./packages/@vue-aria/tree-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/calendar-state": fileURLToPath(
        new URL("./packages/@vue-aria/calendar-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/datepicker-state": fileURLToPath(
        new URL("./packages/@vue-aria/datepicker-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/datepicker": fileURLToPath(
        new URL("./packages/@vue-aria/datepicker/src/index.ts", import.meta.url)
      ),
      "@vue-aria/calendar": fileURLToPath(
        new URL("./packages/@vue-aria/calendar/src/index.ts", import.meta.url)
      ),
      "@vue-aria/table": fileURLToPath(
        new URL("./packages/@vue-aria/table/src/index.ts", import.meta.url)
      ),
      "@vue-aria/gridlist": fileURLToPath(
        new URL("./packages/@vue-aria/gridlist/src/index.ts", import.meta.url)
      ),
      "@vue-aria/tree": fileURLToPath(
        new URL("./packages/@vue-aria/tree/src/index.ts", import.meta.url)
      ),
      "@vue-aria/grid": fileURLToPath(
        new URL("./packages/@vue-aria/grid/src/index.ts", import.meta.url)
      ),
      "@vue-aria/tabs-state": fileURLToPath(
        new URL("./packages/@vue-aria/tabs-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/tabs": fileURLToPath(
        new URL("./packages/@vue-aria/tabs/src/index.ts", import.meta.url)
      ),
      "@vue-aria/toast": fileURLToPath(
        new URL("./packages/@vue-aria/toast/src/index.ts", import.meta.url)
      ),
      "@vue-aria/tooltip-state": fileURLToPath(
        new URL("./packages/@vue-aria/tooltip-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/tooltip": fileURLToPath(
        new URL("./packages/@vue-aria/tooltip/src/index.ts", import.meta.url)
      ),
      "@vue-aria/disclosure-state": fileURLToPath(
        new URL("./packages/@vue-aria/disclosure-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/disclosure": fileURLToPath(
        new URL("./packages/@vue-aria/disclosure/src/index.ts", import.meta.url)
      ),
      "@vue-aria/overlays": fileURLToPath(
        new URL("./packages/@vue-aria/overlays/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/slider": fileURLToPath(
        new URL("./packages/@vue-spectrum/slider/src/index.ts", import.meta.url)
      )
    }
  }
});
