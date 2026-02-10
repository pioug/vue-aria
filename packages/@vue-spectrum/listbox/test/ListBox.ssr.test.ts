import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ListBox } from "../src";

describe("ListBox SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ListBoxSSRApp",
      setup() {
        return () =>
          h(ListBox, {
            "aria-label": "Listbox",
            items: [
              { key: "left", label: "Left" },
              { key: "middle", label: "Middle" },
              { key: "right", label: "Right" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Menu");
  });
});
