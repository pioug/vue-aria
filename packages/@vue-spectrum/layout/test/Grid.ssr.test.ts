import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Grid } from "../src";

describe("Grid SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "GridSSRApp",
      setup() {
        return () => h(Grid);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<div");
  });
});
