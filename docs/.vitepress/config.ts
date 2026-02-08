import { defineConfig } from "vitepress";

export default defineConfig({
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
          { text: "@vue-aria/focus", link: "/packages/focus" },
          { text: "@vue-aria/interactions", link: "/packages/interactions" },
          { text: "@vue-aria/button", link: "/packages/button" },
          { text: "@vue-aria/checkbox", link: "/packages/checkbox" },
          { text: "@vue-aria/link", link: "/packages/link" },
          { text: "@vue-aria/label", link: "/packages/label" },
          { text: "@vue-aria/textfield", link: "/packages/textfield" },
          { text: "@vue-aria/searchfield", link: "/packages/searchfield" },
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
