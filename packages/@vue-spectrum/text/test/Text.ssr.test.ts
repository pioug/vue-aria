import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Text } from "../src";

describe("Text SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "TextSSRApp",
      setup() {
        return () => h(Text);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<span");
  });
});
