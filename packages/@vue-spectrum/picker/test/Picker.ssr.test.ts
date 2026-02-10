import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Picker } from "../src";

describe("Picker SSR", () => {
  it("renders picker trigger and selected value on server", async () => {
    const App = defineComponent({
      name: "PickerSSRApp",
      setup() {
        return () =>
          h(Picker, {
            "aria-label": "Picker",
            selectedKey: "2",
            items: [
              { key: "1", label: "One" },
              { key: "2", label: "Two" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-Dropdown");
    expect(html).toContain("Two");
  });
});
