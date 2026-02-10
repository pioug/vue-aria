import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { FileTrigger } from "../src";

describe("FileTrigger SSR", () => {
  it("renders child and hidden file input", async () => {
    const App = defineComponent({
      name: "FileTriggerSSRApp",
      setup() {
        return () =>
          h(
            FileTrigger,
            {
              acceptedFileTypes: ["image/png"],
            },
            {
              default: () => h("button", { type: "button" }, "Upload"),
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("type=\"button\"");
    expect(html).toContain("type=\"file\"");
    expect(html).toContain("accept=\"image/png\"");
  });
});
