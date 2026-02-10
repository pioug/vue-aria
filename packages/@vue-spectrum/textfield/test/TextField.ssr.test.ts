import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { TextArea, TextField } from "../src";

describe("TextField SSR", () => {
  it("renders text field and text area", async () => {
    const App = defineComponent({
      name: "TextFieldSSRApp",
      setup() {
        return () =>
          h("div", null, [
            h(TextField, {
              label: "Name",
              defaultValue: "Ada",
            }),
            h(TextArea, {
              label: "Notes",
              defaultValue: "Example",
            }),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-Textfield");
    expect(html).toContain("Name");
    expect(html).toContain("Notes");
  });
});
