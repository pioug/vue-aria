import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { LabeledValue } from "../src";

describe("LabeledValue SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "LabeledValueSSRApp",
      setup() {
        return () =>
          h(LabeledValue, {
            label: "Field label",
            value: "Value",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-LabeledValue");
  });
});
