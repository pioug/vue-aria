import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { TextField } from "../src";

describe("TextField SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "TextFieldSSRApp",
      setup() {
        return () =>
          h(TextField, {
            label: "Name",
            defaultValue: "Ada",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-Textfield");
    expect(html).toContain("Name");
  });
});
