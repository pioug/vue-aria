import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { TabList, TabPanels, Tabs } from "../src";

describe("Tabs SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(
          Tabs as any,
          {
            ariaLabel: "SSR tabs",
            items: [
              { key: "tab-1", title: "Tab 1", children: "Tab 1 body" },
              { key: "tab-2", title: "Tab 2", children: "Tab 2 body" },
            ],
          },
          {
            default: () => [h(TabList as any), h(TabPanels as any)],
          }
        );
      },
    });

    const html = await renderToString(app);
    expect(html).toContain("spectrum-TabsPanel");
    expect(html).toContain("role=\"tablist\"");
    expect(html).toContain("Tab 1 body");
  });
});
