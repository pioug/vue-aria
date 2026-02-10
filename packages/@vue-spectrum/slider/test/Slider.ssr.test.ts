import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { RangeSlider, Slider } from "../src";

describe("Slider SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "SliderSSRApp",
      setup() {
        return () =>
          h("div", [
            h(Slider, {
              label: "Value",
              defaultValue: 10,
            }),
            h(RangeSlider, {
              label: "Range",
              defaultValue: {
                start: 20,
                end: 40,
              },
            }),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Slider");
    expect(html).toContain("Value");
    expect(html).toContain("Range");
  });
});
