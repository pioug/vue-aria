import { defineConfig } from "vitepress";

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
  base: normalizeBase(process.env.VITEPRESS_BASE),
  title: "vue-aria",
  description: "Vue port of React Aria interaction and accessibility hooks.",
  lastUpdated: true,
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Packages", link: "/packages/overview" },
      { text: "Porting", link: "/porting/roadmap" },
      { text: "GitHub", link: "https://github.com/adobe/react-spectrum" },
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
          { text: "Cross-Browser Demos", link: "/porting/cross-browser-demos" },
          { text: "Test Parity", link: "/porting/test-parity" },
          { text: "Workflow", link: "/porting/workflow" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/adobe/react-spectrum" },
    ],
    editLink: {
      pattern: "https://github.com/your-org/vue-aria/edit/main/docs/:path",
      text: "Edit this page",
    },
    outline: {
      level: [2, 3],
    },
  },
});
