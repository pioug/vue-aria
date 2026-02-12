import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { TextArea } from "../src";

describe("TextArea SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "TextAreaSSRApp",
      setup() {
        return () =>
          h(TextArea, {
            label: "Notes",
            defaultValue: "Example",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-Textfield");
    expect(html).toContain("Notes");
  });
});
