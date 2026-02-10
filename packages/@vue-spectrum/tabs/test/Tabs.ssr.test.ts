import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { TabList, TabPanels, Tabs } from "../src";

describe("Tabs SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "TabsSSRApp",
      setup() {
        return () =>
          h(
            Tabs,
            {
              "aria-label": "SSR tabs",
              items: [
                { key: "tab-1", title: "Tab 1", children: "Tab 1 body" },
                { key: "tab-2", title: "Tab 2", children: "Tab 2 body" },
              ],
            },
            {
              default: () => [h(TabList), h(TabPanels)],
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-TabsPanel");
    expect(html).toContain("role=\"tablist\"");
    expect(html).toContain("Tab 1 body");
  });
});
