import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Divider } from "../src";

describe("Divider SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "DividerSSRApp",
      setup() {
        return () => h(Divider, { orientation: "vertical", "aria-label": "divides" });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Rule");
    expect(html).toContain("role=\"separator\"");
  });
});
