import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Button } from "../src";

describe("Button SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ButtonSSRApp",
      setup() {
        return () => h(Button, null, () => "Click Me");
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Button");
    expect(html).toContain("Click Me");
  });
});
