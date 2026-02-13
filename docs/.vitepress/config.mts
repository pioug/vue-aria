import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Vue Aria",
  description: "Vue 3 parity port of React Aria and React Spectrum",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      { text: "Selection", link: "/packages/selection" },
    ],
    sidebar: [
      {
        text: "Packages",
        items: [{ text: "@vue-aria/selection", link: "/packages/selection" }],
      },
    ],
  },
});
