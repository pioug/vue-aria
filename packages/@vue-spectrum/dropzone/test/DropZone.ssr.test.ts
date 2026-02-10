import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { DropZone } from "../src";

describe("DropZone SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "DropZoneSSRApp",
      setup() {
        return () =>
          h(DropZone, null, {
            default: () => "Drop files here",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Dropzone");
  });
});
