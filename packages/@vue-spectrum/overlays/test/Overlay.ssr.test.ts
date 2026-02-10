import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Overlay } from "../src";

describe("Overlay SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "OverlaySSRApp",
      setup() {
        return () =>
          h(Overlay, { isOpen: true }, { default: () => h("span", "Overlay") });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("teleport");
  });
});
