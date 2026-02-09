import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { View } from "../src";

describe("View SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ViewSSRApp",
      setup() {
        return () => h(View);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<div");
  });
});
