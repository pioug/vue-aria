import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Menu } from "../src";

describe("Menu SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "MenuSSRApp",
      setup() {
        return () =>
          h(Menu, {
            "aria-label": "Menu",
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
    expect(html).toContain("Left");
    expect(html).toContain("Middle");
    expect(html).toContain("Right");
  });
});
