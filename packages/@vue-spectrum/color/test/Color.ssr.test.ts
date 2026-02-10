import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import {
  ColorArea,
  ColorEditor,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatchPicker,
  ColorWheel,
} from "../src";

describe("Color SSR", () => {
  it("renders the baseline color components on server", async () => {
    const App = defineComponent({
      name: "ColorSSRApp",
      setup() {
        return () =>
          h("div", [
            h(ColorField, {
              label: "Color field",
              defaultValue: "#f00",
            }),
            h(ColorSlider, {
              label: "Hue",
              channel: "hue",
              defaultValue: 120,
            }),
            h(ColorArea, {
              "aria-label": "Color area",
              defaultValue: "#f00",
            }),
            h(ColorWheel, {
              "aria-label": "Color wheel",
              defaultValue: "#0f0",
            }),
            h(ColorSwatchPicker, {
              items: [
                { key: "red", color: "#f00" },
                { key: "green", color: "#0f0" },
              ],
            }),
            h(ColorEditor, {
              defaultValue: "#00f",
            }),
            h(ColorPicker, {
              label: "Fill",
              defaultValue: "#f00",
            }),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-ColorField");
    expect(html).toContain("react-spectrum-ColorSlider");
    expect(html).toContain("react-spectrum-ColorArea");
    expect(html).toContain("react-spectrum-ColorWheel");
    expect(html).toContain("react-spectrum-ColorSwatchPicker");
    expect(html).toContain("react-spectrum-ColorEditor");
    expect(html).toContain("react-spectrum-ColorPicker");
  });
});
