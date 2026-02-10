import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Meter } from "../src";

describe("Meter SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "MeterSSRApp",
      setup() {
        return () =>
          h(Meter, {
            label: "Storage space",
            variant: "positive",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-BarLoader");
  });
});
