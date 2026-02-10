import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { StepList } from "../src";

describe("StepList SSR", () => {
  it("renders step list links on the server", async () => {
    const App = defineComponent({
      name: "StepListSSRApp",
      setup() {
        return () =>
          h(StepList, {
            "aria-label": "Setup steps",
            items: [
              { key: "one", label: "Step 1" },
              { key: "two", label: "Step 2" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-Steplist");
    expect(html).toContain("Step 1");
    expect(html).toContain("Step 2");
  });
});
