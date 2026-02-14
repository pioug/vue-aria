import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Picker } from "../src/Picker";

describe("Picker SSR", () => {
  it("renders selected item content without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Picker as any, {
          ariaLabel: "Picker",
          selectedKey: "2",
          items: [
            { key: "1", label: "One" },
            { key: "2", label: "Two" },
          ],
        });
      },
    });

    const html = await renderToString(app);
    expect(html).toContain("spectrum-Dropdown");
    expect(html).toContain("Two");
  });
});
