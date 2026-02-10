import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { useDragAndDrop } from "../src";

describe("useDragAndDrop SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "UseDragAndDropSSRApp",
      setup() {
        useDragAndDrop({});
        return () => h("div", null, "ok");
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("ok");
  });
});
