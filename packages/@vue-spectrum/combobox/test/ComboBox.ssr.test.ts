import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { ComboBox } from "../src/ComboBox";

describe("ComboBox SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(ComboBox as any, {
          label: "ComboBox",
          items: [
            { key: "1", label: "One" },
            { key: "2", label: "Two" },
          ],
        });
      },
    });

    const html = await renderToString(app);
    expect(html).toContain("spectrum-ComboBox");
  });
});
