import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Content } from "../src";

describe("Content SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ContentSSRApp",
      setup() {
        return () => h(Content);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<section");
  });
});
