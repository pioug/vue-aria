import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Vue Aria",
  description: "Vue 3 parity port of React Aria and React Spectrum",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      { text: "Selection", link: "/packages/selection" },
      { text: "Interactions", link: "/packages/interactions" },
      { text: "Focus", link: "/packages/focus" },
      { text: "Live Announcer", link: "/packages/live-announcer" },
      { text: "Visually Hidden", link: "/packages/visually-hidden" },
      { text: "Label", link: "/packages/label" },
      { text: "Button", link: "/packages/button" },
      { text: "Link", link: "/packages/link" },
      { text: "Toggle", link: "/packages/toggle" },
      { text: "Checkbox", link: "/packages/checkbox" },
      { text: "Radio", link: "/packages/radio" },
      { text: "Switch", link: "/packages/switch" },
    ],
    sidebar: [
      {
        text: "Packages",
        items: [
          { text: "@vue-aria/selection", link: "/packages/selection" },
          { text: "@vue-aria/interactions", link: "/packages/interactions" },
          { text: "@vue-aria/focus", link: "/packages/focus" },
          { text: "@vue-aria/live-announcer", link: "/packages/live-announcer" },
          { text: "@vue-aria/visually-hidden", link: "/packages/visually-hidden" },
          { text: "@vue-aria/label", link: "/packages/label" },
          { text: "@vue-aria/button", link: "/packages/button" },
          { text: "@vue-aria/link", link: "/packages/link" },
          { text: "@vue-aria/toggle", link: "/packages/toggle" },
          { text: "@vue-aria/checkbox", link: "/packages/checkbox" },
          { text: "@vue-aria/radio", link: "/packages/radio" },
          { text: "@vue-aria/switch", link: "/packages/switch" },
        ],
      },
    ],
  },
});
