import { defineConfig } from "vitepress";
import { fileURLToPath, URL } from "node:url";

function normalizeBase(value: string | undefined): string {
  if (!value) {
    return "/";
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "/";
  }

  let normalized = trimmed;
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (!normalized.endsWith("/")) {
    normalized = `${normalized}/`;
  }

  return normalized;
}

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "@vue-spectrum/provider": fileURLToPath(
          new URL("../../packages/@vue-spectrum/provider/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/icon": fileURLToPath(
          new URL("../../packages/@vue-spectrum/icon/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/utils": fileURLToPath(
          new URL("../../packages/@vue-spectrum/utils/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/form": fileURLToPath(
          new URL("../../packages/@vue-spectrum/form/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/label": fileURLToPath(
          new URL("../../packages/@vue-spectrum/label/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/text": fileURLToPath(
          new URL("../../packages/@vue-spectrum/text/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/view": fileURLToPath(
          new URL("../../packages/@vue-spectrum/view/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/layout": fileURLToPath(
          new URL("../../packages/@vue-spectrum/layout/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/button": fileURLToPath(
          new URL("../../packages/@vue-spectrum/button/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/actionbar": fileURLToPath(
          new URL("../../packages/@vue-spectrum/actionbar/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/actiongroup": fileURLToPath(
          new URL("../../packages/@vue-spectrum/actiongroup/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/tag": fileURLToPath(
          new URL("../../packages/@vue-spectrum/tag/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/picker": fileURLToPath(
          new URL("../../packages/@vue-spectrum/picker/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/menu": fileURLToPath(
          new URL("../../packages/@vue-spectrum/menu/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/list": fileURLToPath(
          new URL("../../packages/@vue-spectrum/list/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/listbox": fileURLToPath(
          new URL("../../packages/@vue-spectrum/listbox/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/buttongroup": fileURLToPath(
          new URL("../../packages/@vue-spectrum/buttongroup/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/accordion": fileURLToPath(
          new URL("../../packages/@vue-spectrum/accordion/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/checkbox": fileURLToPath(
          new URL("../../packages/@vue-spectrum/checkbox/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/radio": fileURLToPath(
          new URL("../../packages/@vue-spectrum/radio/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/slider": fileURLToPath(
          new URL("../../packages/@vue-spectrum/slider/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/link": fileURLToPath(
          new URL("../../packages/@vue-spectrum/link/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/breadcrumbs": fileURLToPath(
          new URL("../../packages/@vue-spectrum/breadcrumbs/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/tabs": fileURLToPath(
          new URL("../../packages/@vue-spectrum/tabs/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/textfield": fileURLToPath(
          new URL("../../packages/@vue-spectrum/textfield/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/searchfield": fileURLToPath(
          new URL("../../packages/@vue-spectrum/searchfield/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/numberfield": fileURLToPath(
          new URL("../../packages/@vue-spectrum/numberfield/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/combobox": fileURLToPath(
          new URL("../../packages/@vue-spectrum/combobox/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/autocomplete": fileURLToPath(
          new URL("../../packages/@vue-spectrum/autocomplete/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/filetrigger": fileURLToPath(
          new URL("../../packages/@vue-spectrum/filetrigger/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/steplist": fileURLToPath(
          new URL("../../packages/@vue-spectrum/steplist/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/divider": fileURLToPath(
          new URL("../../packages/@vue-spectrum/divider/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/well": fileURLToPath(
          new URL("../../packages/@vue-spectrum/well/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/statuslight": fileURLToPath(
          new URL("../../packages/@vue-spectrum/statuslight/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/badge": fileURLToPath(
          new URL("../../packages/@vue-spectrum/badge/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/avatar": fileURLToPath(
          new URL("../../packages/@vue-spectrum/avatar/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/image": fileURLToPath(
          new URL("../../packages/@vue-spectrum/image/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/illustratedmessage": fileURLToPath(
          new URL("../../packages/@vue-spectrum/illustratedmessage/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/inlinealert": fileURLToPath(
          new URL("../../packages/@vue-spectrum/inlinealert/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/overlays": fileURLToPath(
          new URL("../../packages/@vue-spectrum/overlays/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/dialog": fileURLToPath(
          new URL("../../packages/@vue-spectrum/dialog/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/contextualhelp": fileURLToPath(
          new URL("../../packages/@vue-spectrum/contextualhelp/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/tooltip": fileURLToPath(
          new URL("../../packages/@vue-spectrum/tooltip/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/toast": fileURLToPath(
          new URL("../../packages/@vue-spectrum/toast/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/dnd": fileURLToPath(
          new URL("../../packages/@vue-spectrum/dnd/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/dropzone": fileURLToPath(
          new URL("../../packages/@vue-spectrum/dropzone/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/progress": fileURLToPath(
          new URL("../../packages/@vue-spectrum/progress/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/meter": fileURLToPath(
          new URL("../../packages/@vue-spectrum/meter/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/labeledvalue": fileURLToPath(
          new URL("../../packages/@vue-spectrum/labeledvalue/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/card": fileURLToPath(
          new URL("../../packages/@vue-spectrum/card/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/switch": fileURLToPath(
          new URL("../../packages/@vue-spectrum/switch/src/index.ts", import.meta.url)
        ),
        "@vue-spectrum/vue-spectrum": fileURLToPath(
          new URL("../../packages/@vue-spectrum/vue-spectrum/src/index.ts", import.meta.url)
        ),
      },
    },
  },
  base: normalizeBase(process.env.VITEPRESS_BASE),
  title: "vue-aria",
  description: "Vue port of React Aria interaction and accessibility hooks.",
  lastUpdated: true,
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Packages", link: "/packages/overview" },
      { text: "Spectrum", link: "/spectrum/overview" },
      { text: "Porting", link: "/porting/roadmap" },
      { text: "GitHub", link: "https://github.com/pioug/vue-aria/" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/getting-started" },
          { text: "Architecture", link: "/architecture" },
        ],
      },
      {
        text: "Packages",
        items: [
          { text: "Overview", link: "/packages/overview" },
          { text: "@vue-aria/ssr", link: "/packages/ssr" },
          { text: "@vue-aria/live-announcer", link: "/packages/live-announcer" },
          { text: "@vue-aria/i18n", link: "/packages/i18n" },
          { text: "@vue-aria/focus", link: "/packages/focus" },
          { text: "@vue-aria/interactions", link: "/packages/interactions" },
          { text: "@vue-aria/dnd", link: "/packages/dnd" },
          { text: "@vue-aria/dnd-state", link: "/packages/dnd-state" },
          { text: "@vue-aria/button", link: "/packages/button" },
          { text: "@vue-aria/checkbox", link: "/packages/checkbox" },
          { text: "@vue-aria/radio", link: "/packages/radio" },
          { text: "@vue-aria/switch", link: "/packages/switch" },
          { text: "@vue-aria/tabs", link: "/packages/tabs" },
          { text: "@vue-aria/slider", link: "/packages/slider" },
          { text: "@vue-aria/progress", link: "/packages/progress" },
          { text: "@vue-aria/meter", link: "/packages/meter" },
          { text: "@vue-aria/toast-state", link: "/packages/toast-state" },
          { text: "@vue-aria/toast", link: "/packages/toast" },
          { text: "@vue-aria/datefield", link: "/packages/datefield" },
          { text: "@vue-aria/datepicker", link: "/packages/datepicker" },
          { text: "@vue-aria/datepicker-state", link: "/packages/datepicker-state" },
          { text: "@vue-aria/calendar", link: "/packages/calendar" },
          { text: "@vue-aria/calendar-state", link: "/packages/calendar-state" },
          { text: "@vue-aria/breadcrumbs", link: "/packages/breadcrumbs" },
          { text: "@vue-aria/disclosure", link: "/packages/disclosure" },
          { text: "@vue-aria/collections", link: "/packages/collections" },
          { text: "@vue-aria/menu", link: "/packages/menu" },
          { text: "@vue-aria/overlays-state", link: "/packages/overlays-state" },
          { text: "@vue-aria/toggle-state", link: "/packages/toggle-state" },
          { text: "@vue-aria/overlays", link: "/packages/overlays" },
          { text: "@vue-aria/dialog", link: "/packages/dialog" },
          { text: "@vue-aria/tooltip", link: "/packages/tooltip" },
          { text: "@vue-aria/listbox", link: "/packages/listbox" },
          { text: "@vue-aria/list-state", link: "/packages/list-state" },
          { text: "@vue-aria/grid", link: "/packages/grid" },
          { text: "@vue-aria/gridlist", link: "/packages/gridlist" },
          { text: "@vue-aria/tree", link: "/packages/tree" },
          { text: "@vue-aria/tree-state", link: "/packages/tree-state" },
          { text: "@vue-aria/virtualizer", link: "/packages/virtualizer" },
          { text: "@vue-aria/virtualizer-state", link: "/packages/virtualizer-state" },
          { text: "@vue-aria/table", link: "/packages/table" },
          { text: "@vue-aria/table-state", link: "/packages/table-state" },
          { text: "@vue-aria/selection", link: "/packages/selection" },
          { text: "@vue-aria/selection-state", link: "/packages/selection-state" },
          { text: "@vue-aria/combobox-state", link: "/packages/combobox-state" },
          { text: "@vue-aria/combobox", link: "/packages/combobox" },
          { text: "@vue-aria/link", link: "/packages/link" },
          { text: "@vue-aria/label", link: "/packages/label" },
          { text: "@vue-aria/textfield", link: "/packages/textfield" },
          { text: "@vue-aria/searchfield", link: "/packages/searchfield" },
          { text: "@vue-aria/select", link: "/packages/select" },
          { text: "@vue-aria/numberfield", link: "/packages/numberfield" },
          { text: "@vue-aria/spinbutton", link: "/packages/spinbutton" },
          { text: "@vue-aria/separator", link: "/packages/separator" },
          { text: "@vue-aria/visually-hidden", link: "/packages/visually-hidden" },
          { text: "@vue-aria/utils", link: "/packages/utils" },
        ],
      },
      {
        text: "Porting",
        items: [
          { text: "Roadmap", link: "/porting/roadmap" },
          { text: "Spectrum Components Roadmap", link: "/porting/spectrum-roadmap" },
          { text: "Cross-Browser Demos", link: "/porting/cross-browser-demos" },
          { text: "Test Parity", link: "/porting/test-parity" },
          { text: "Workflow", link: "/porting/workflow" },
        ],
      },
      {
        text: "Spectrum",
        items: [
          { text: "Overview", link: "/spectrum/overview" },
          { text: "Cross-Browser Demos", link: "/spectrum/cross-browser-demos" },
          { text: "Theming Baseline", link: "/spectrum/theming-baseline" },
          { text: "@vue-spectrum/provider", link: "/spectrum/provider" },
          { text: "@vue-spectrum/icon", link: "/spectrum/icon" },
          { text: "@vue-spectrum/utils", link: "/spectrum/utils" },
          { text: "@vue-spectrum/form", link: "/spectrum/form" },
          { text: "@vue-spectrum/label", link: "/spectrum/label" },
          { text: "@vue-spectrum/text", link: "/spectrum/text" },
          { text: "@vue-spectrum/view", link: "/spectrum/view" },
          { text: "@vue-spectrum/layout", link: "/spectrum/layout" },
          { text: "@vue-spectrum/button", link: "/spectrum/button" },
          { text: "@vue-spectrum/actionbar", link: "/spectrum/actionbar" },
          { text: "@vue-spectrum/actiongroup", link: "/spectrum/actiongroup" },
          { text: "@vue-spectrum/tag", link: "/spectrum/tag" },
          { text: "@vue-spectrum/picker", link: "/spectrum/picker" },
          { text: "@vue-spectrum/menu", link: "/spectrum/menu" },
          { text: "@vue-spectrum/list", link: "/spectrum/list" },
          { text: "@vue-spectrum/listbox", link: "/spectrum/listbox" },
          { text: "@vue-spectrum/buttongroup", link: "/spectrum/buttongroup" },
          { text: "@vue-spectrum/accordion", link: "/spectrum/accordion" },
          { text: "@vue-spectrum/checkbox", link: "/spectrum/checkbox" },
          { text: "@vue-spectrum/radio", link: "/spectrum/radio" },
          { text: "@vue-spectrum/slider", link: "/spectrum/slider" },
          { text: "@vue-spectrum/link", link: "/spectrum/link" },
          { text: "@vue-spectrum/breadcrumbs", link: "/spectrum/breadcrumbs" },
          { text: "@vue-spectrum/tabs", link: "/spectrum/tabs" },
          { text: "@vue-spectrum/textfield", link: "/spectrum/textfield" },
          { text: "@vue-spectrum/searchfield", link: "/spectrum/searchfield" },
          { text: "@vue-spectrum/numberfield", link: "/spectrum/numberfield" },
          { text: "@vue-spectrum/combobox", link: "/spectrum/combobox" },
          { text: "@vue-spectrum/autocomplete", link: "/spectrum/autocomplete" },
          { text: "@vue-spectrum/filetrigger", link: "/spectrum/filetrigger" },
          { text: "@vue-spectrum/steplist", link: "/spectrum/steplist" },
          { text: "@vue-spectrum/divider", link: "/spectrum/divider" },
          { text: "@vue-spectrum/well", link: "/spectrum/well" },
          { text: "@vue-spectrum/statuslight", link: "/spectrum/statuslight" },
          { text: "@vue-spectrum/badge", link: "/spectrum/badge" },
          { text: "@vue-spectrum/avatar", link: "/spectrum/avatar" },
          { text: "@vue-spectrum/image", link: "/spectrum/image" },
          { text: "@vue-spectrum/illustratedmessage", link: "/spectrum/illustratedmessage" },
          { text: "@vue-spectrum/inlinealert", link: "/spectrum/inlinealert" },
          { text: "@vue-spectrum/overlays", link: "/spectrum/overlays" },
          { text: "@vue-spectrum/dialog", link: "/spectrum/dialog" },
          { text: "@vue-spectrum/contextualhelp", link: "/spectrum/contextualhelp" },
          { text: "@vue-spectrum/tooltip", link: "/spectrum/tooltip" },
          { text: "@vue-spectrum/toast", link: "/spectrum/toast" },
          { text: "@vue-spectrum/dnd", link: "/spectrum/dnd" },
          { text: "@vue-spectrum/dropzone", link: "/spectrum/dropzone" },
          { text: "@vue-spectrum/progress", link: "/spectrum/progress" },
          { text: "@vue-spectrum/meter", link: "/spectrum/meter" },
          { text: "@vue-spectrum/labeledvalue", link: "/spectrum/labeledvalue" },
          { text: "@vue-spectrum/card", link: "/spectrum/card" },
          { text: "@vue-spectrum/switch", link: "/spectrum/switch" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/pioug/vue-aria/" },
    ],
    editLink: {
      pattern: "https://github.com/pioug/vue-aria/edit/main/docs/:path",
      text: "Edit this page",
    },
    outline: {
      level: [2, 3],
    },
  },
});
