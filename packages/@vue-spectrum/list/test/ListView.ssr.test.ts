import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ListView } from "../src";

describe("ListView SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ListViewSSRApp",
      setup() {
        return () =>
          h(ListView, {
            "aria-label": "List view",
            items: [
              { key: "one", label: "One" },
              { key: "two", label: "Two" },
              { key: "three", label: "Three" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-ListView");
  });
});
