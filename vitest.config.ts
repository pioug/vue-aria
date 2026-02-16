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
      "@vue-types/shared": fileURLToPath(
        new URL("./packages/@vue-types/shared/src/index.ts", import.meta.url)
      ),
      "@vue-aria/ssr": fileURLToPath(
        new URL("./packages/@vue-aria/ssr/src/index.ts", import.meta.url)
      ),
      "@vue-aria/flags": fileURLToPath(
        new URL("./packages/@vue-aria/flags/src/index.ts", import.meta.url)
      ),
      "@vue-aria/data": fileURLToPath(
        new URL("./packages/@vue-aria/data/src/index.ts", import.meta.url)
      ),
      "@vue-aria/layout": fileURLToPath(
        new URL("./packages/@vue-aria/layout/src/index.ts", import.meta.url)
      ),
      "@vue-aria/i18n": fileURLToPath(
        new URL("./packages/@vue-aria/i18n/src/index.ts", import.meta.url)
      ),
      "@vue-aria/collections": fileURLToPath(
        new URL("./packages/@vue-aria/collections/src/index.ts", import.meta.url)
      ),
      "@vue-stately/collections": fileURLToPath(
        new URL("./packages/@vue-aria/collections/src/index.ts", import.meta.url)
      ),
      "@vue-stately/toggle": fileURLToPath(
        new URL("./packages/@vue-aria/toggle-state/src/index.ts", import.meta.url)
      ),
      "@vue-stately/utils": fileURLToPath(
        new URL("./packages/@vue-aria/utils-state/src/index.ts", import.meta.url)
      ),
      "@vue-stately/selection": fileURLToPath(
        new URL("./packages/@vue-stately/selection/src/index.ts", import.meta.url)
      ),
      "@vue-stately/autocomplete": fileURLToPath(
        new URL("./packages/@vue-aria/autocomplete/src/index.ts", import.meta.url)
      ),
      "@vue-stately/color": fileURLToPath(
        new URL("./packages/@vue-aria/color/src/index.ts", import.meta.url)
      ),
      "@vue-stately/data": fileURLToPath(
        new URL("./packages/@vue-aria/data/src/index.ts", import.meta.url)
      ),
      "@vue-stately/dnd": fileURLToPath(
        new URL("./packages/@vue-aria/dnd/src/index.ts", import.meta.url)
      ),
      "@vue-stately/layout": fileURLToPath(
        new URL("./packages/@vue-aria/layout/src/index.ts", import.meta.url)
      ),
      "@vue-stately/steplist": fileURLToPath(
        new URL("./packages/@vue-aria/steplist/src/index.ts", import.meta.url)
      ),
      "@vue-stately/virtualizer": fileURLToPath(
        new URL("./packages/@vue-aria/virtualizer/src/index.ts", import.meta.url)
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
      "@vue-stately/checkbox": fileURLToPath(
        new URL("./packages/@vue-stately/checkbox/src/index.ts", import.meta.url)
      ),
      "@vue-aria/checkbox": fileURLToPath(
        new URL("./packages/@vue-aria/checkbox/src/index.ts", import.meta.url)
      ),
      "@vue-stately/radio": fileURLToPath(
        new URL("./packages/@vue-stately/radio/src/index.ts", import.meta.url)
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
      "@vue-stately/searchfield": fileURLToPath(
        new URL("./packages/@vue-stately/searchfield/src/index.ts", import.meta.url)
      ),
      "@vue-aria/searchfield": fileURLToPath(
        new URL("./packages/@vue-aria/searchfield/src/index.ts", import.meta.url)
      ),
      "@vue-aria/form": fileURLToPath(
        new URL("./packages/@vue-aria/form/src/index.ts", import.meta.url)
      ),
      "@vue-stately/form": fileURLToPath(
        new URL("./packages/@vue-stately/form/src/index.ts", import.meta.url)
      ),
      "@vue-aria/spinbutton": fileURLToPath(
        new URL("./packages/@vue-aria/spinbutton/src/index.ts", import.meta.url)
      ),
      "@vue-stately/numberfield": fileURLToPath(
        new URL("./packages/@vue-stately/numberfield/src/index.ts", import.meta.url)
      ),
      "@vue-stately/slider": fileURLToPath(
        new URL("./packages/@vue-stately/slider/src/index.ts", import.meta.url)
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
      "@vue-stately/overlays": fileURLToPath(
        new URL("./packages/@vue-stately/overlays/src/index.ts", import.meta.url)
      ),
      "@vue-aria/listbox": fileURLToPath(
        new URL("./packages/@vue-aria/listbox/src/index.ts", import.meta.url)
      ),
      "@vue-stately/list": fileURLToPath(
        new URL("./packages/@vue-stately/list/src/index.ts", import.meta.url)
      ),
      "@vue-aria/select": fileURLToPath(
        new URL("./packages/@vue-aria/select/src/index.ts", import.meta.url)
      ),
      "@vue-stately/select": fileURLToPath(
        new URL("./packages/@vue-aria/select/src/index.ts", import.meta.url)
      ),
      "@vue-aria/menu": fileURLToPath(
        new URL("./packages/@vue-aria/menu/src/index.ts", import.meta.url)
      ),
      "@vue-stately/menu": fileURLToPath(
        new URL("./packages/@vue-aria/menu/src/index.ts", import.meta.url)
      ),
      "@vue-stately/combobox": fileURLToPath(
        new URL("./packages/@vue-stately/combobox/src/index.ts", import.meta.url)
      ),
      "@vue-aria/combobox": fileURLToPath(
        new URL("./packages/@vue-aria/combobox/src/index.ts", import.meta.url)
      ),
      "@vue-stately/grid": fileURLToPath(
        new URL("./packages/@vue-stately/grid/src/index.ts", import.meta.url)
      ),
      "@vue-stately/table": fileURLToPath(
        new URL("./packages/@vue-stately/table/src/index.ts", import.meta.url)
      ),
      "@vue-stately/tree": fileURLToPath(
        new URL("./packages/@vue-aria/tree-state/src/index.ts", import.meta.url)
      ),
      "@vue-stately/calendar": fileURLToPath(
        new URL("./packages/@vue-stately/calendar/src/index.ts", import.meta.url)
      ),
      "@vue-stately/datepicker": fileURLToPath(
        new URL("./packages/@vue-stately/datepicker/src/index.ts", import.meta.url)
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
      "@vue-stately/tabs": fileURLToPath(
        new URL("./packages/@vue-aria/tabs-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/tabs": fileURLToPath(
        new URL("./packages/@vue-aria/tabs/src/index.ts", import.meta.url)
      ),
      "@vue-aria/toast": fileURLToPath(
        new URL("./packages/@vue-aria/toast/src/index.ts", import.meta.url)
      ),
      "@vue-stately/toast": fileURLToPath(
        new URL("./packages/@vue-aria/toast-state/src/index.ts", import.meta.url)
      ),
      "@vue-stately/tooltip": fileURLToPath(
        new URL("./packages/@vue-aria/tooltip-state/src/index.ts", import.meta.url)
      ),
      "@vue-aria/tooltip": fileURLToPath(
        new URL("./packages/@vue-aria/tooltip/src/index.ts", import.meta.url)
      ),
      "@vue-stately/disclosure": fileURLToPath(
        new URL("./packages/@vue-stately/disclosure/src/index.ts", import.meta.url)
      ),
      "@vue-aria/disclosure": fileURLToPath(
        new URL("./packages/@vue-aria/disclosure/src/index.ts", import.meta.url)
      ),
      "@vue-aria/overlays": fileURLToPath(
        new URL("./packages/@vue-aria/overlays/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/theme-express": fileURLToPath(
        new URL("./packages/@vue-spectrum/theme-express/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/theme-dark": fileURLToPath(
        new URL("./packages/@vue-spectrum/theme-dark/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/theme-light": fileURLToPath(
        new URL("./packages/@vue-spectrum/theme-light/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/label": fileURLToPath(
        new URL("./packages/@vue-spectrum/label/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/accordion": fileURLToPath(
        new URL("./packages/@vue-spectrum/accordion/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/actiongroup": fileURLToPath(
        new URL("./packages/@vue-spectrum/actiongroup/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/actionbar": fileURLToPath(
        new URL("./packages/@vue-spectrum/actionbar/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/autocomplete": fileURLToPath(
        new URL("./packages/@vue-spectrum/autocomplete/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/buttongroup": fileURLToPath(
        new URL("./packages/@vue-spectrum/buttongroup/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/color": fileURLToPath(
        new URL("./packages/@vue-spectrum/color/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/contextualhelp": fileURLToPath(
        new URL("./packages/@vue-spectrum/contextualhelp/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/divider": fileURLToPath(
        new URL("./packages/@vue-spectrum/divider/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/dnd": fileURLToPath(
        new URL("./packages/@vue-spectrum/dnd/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/dropzone": fileURLToPath(
        new URL("./packages/@vue-spectrum/dropzone/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/filetrigger": fileURLToPath(
        new URL("./packages/@vue-spectrum/filetrigger/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/form": fileURLToPath(
        new URL("./packages/@vue-spectrum/form/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/illustratedmessage": fileURLToPath(
        new URL("./packages/@vue-spectrum/illustratedmessage/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/labeledvalue": fileURLToPath(
        new URL("./packages/@vue-spectrum/labeledvalue/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/layout": fileURLToPath(
        new URL("./packages/@vue-spectrum/layout/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/list": fileURLToPath(
        new URL("./packages/@vue-spectrum/list/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/overlays": fileURLToPath(
        new URL("./packages/@vue-spectrum/overlays/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/s2": fileURLToPath(
        new URL("./packages/@vue-spectrum/s2/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/steplist": fileURLToPath(
        new URL("./packages/@vue-spectrum/steplist/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/story-utils": fileURLToPath(
        new URL("./packages/@vue-spectrum/story-utils/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/style-macro-s1": fileURLToPath(
        new URL("./packages/@vue-spectrum/style-macro-s1/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/tag": fileURLToPath(
        new URL("./packages/@vue-spectrum/tag/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/test-utils": fileURLToPath(
        new URL("./packages/@vue-spectrum/test-utils/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/statuslight": fileURLToPath(
        new URL("./packages/@vue-spectrum/statuslight/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/text": fileURLToPath(
        new URL("./packages/@vue-spectrum/text/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/view": fileURLToPath(
        new URL("./packages/@vue-spectrum/view/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/well": fileURLToPath(
        new URL("./packages/@vue-spectrum/well/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/avatar": fileURLToPath(
        new URL("./packages/@vue-spectrum/avatar/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/badge": fileURLToPath(
        new URL("./packages/@vue-spectrum/badge/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/icon": fileURLToPath(
        new URL("./packages/@vue-spectrum/icon/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/image": fileURLToPath(
        new URL("./packages/@vue-spectrum/image/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/inlinealert": fileURLToPath(
        new URL("./packages/@vue-spectrum/inlinealert/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/card": fileURLToPath(
        new URL("./packages/@vue-spectrum/card/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/utils": fileURLToPath(
        new URL("./packages/@vue-spectrum/utils/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/provider": fileURLToPath(
        new URL("./packages/@vue-spectrum/provider/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/slider": fileURLToPath(
        new URL("./packages/@vue-spectrum/slider/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/button": fileURLToPath(
        new URL("./packages/@vue-spectrum/button/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/checkbox": fileURLToPath(
        new URL("./packages/@vue-spectrum/checkbox/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/radio": fileURLToPath(
        new URL("./packages/@vue-spectrum/radio/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/switch": fileURLToPath(
        new URL("./packages/@vue-spectrum/switch/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/link": fileURLToPath(
        new URL("./packages/@vue-spectrum/link/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/textfield": fileURLToPath(
        new URL("./packages/@vue-spectrum/textfield/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/searchfield": fileURLToPath(
        new URL("./packages/@vue-spectrum/searchfield/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/progress": fileURLToPath(
        new URL("./packages/@vue-spectrum/progress/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/meter": fileURLToPath(
        new URL("./packages/@vue-spectrum/meter/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/numberfield": fileURLToPath(
        new URL("./packages/@vue-spectrum/numberfield/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/breadcrumbs": fileURLToPath(
        new URL("./packages/@vue-spectrum/breadcrumbs/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/dialog": fileURLToPath(
        new URL("./packages/@vue-spectrum/dialog/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/tooltip": fileURLToPath(
        new URL("./packages/@vue-spectrum/tooltip/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/toast": fileURLToPath(
        new URL("./packages/@vue-spectrum/toast/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/menu": fileURLToPath(
        new URL("./packages/@vue-spectrum/menu/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/listbox": fileURLToPath(
        new URL("./packages/@vue-spectrum/listbox/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/picker": fileURLToPath(
        new URL("./packages/@vue-spectrum/picker/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/combobox": fileURLToPath(
        new URL("./packages/@vue-spectrum/combobox/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/tabs": fileURLToPath(
        new URL("./packages/@vue-spectrum/tabs/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/table": fileURLToPath(
        new URL("./packages/@vue-spectrum/table/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/tree": fileURLToPath(
        new URL("./packages/@vue-spectrum/tree/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/calendar": fileURLToPath(
        new URL("./packages/@vue-spectrum/calendar/src/index.ts", import.meta.url)
      ),
      "@vue-spectrum/datepicker": fileURLToPath(
        new URL("./packages/@vue-spectrum/datepicker/src/index.ts", import.meta.url)
      )
    }
  }
});
