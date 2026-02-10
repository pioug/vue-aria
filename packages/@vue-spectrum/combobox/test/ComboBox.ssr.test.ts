import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ComboBox } from "../src";

describe("ComboBox SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ComboBoxSSRApp",
      setup() {
        return () =>
          h(ComboBox, {
            label: "Combobox",
            items: [
              { key: "1", label: "One" },
              { key: "2", label: "Two" },
              { key: "3", label: "Three" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-ComboBox");
  });
});
