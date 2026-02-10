import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Dialog } from "../src";

describe("Dialog SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "DialogSSRApp",
      setup() {
        return () => h(Dialog, null, () => "contents");
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Dialog");
    expect(html).toContain("contents");
  });
});
