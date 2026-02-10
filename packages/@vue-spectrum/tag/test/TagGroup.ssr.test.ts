import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { TagGroup } from "../src";

describe("TagGroup SSR", () => {
  it("renders tags on the server", async () => {
    const App = defineComponent({
      name: "TagGroupSSRApp",
      setup() {
        return () =>
          h(TagGroup, {
            "aria-label": "Tags",
            items: [
              { key: "1", label: "Tag 1" },
              { key: "2", label: "Tag 2" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-Tags");
    expect(html).toContain("Tag 1");
    expect(html).toContain("Tag 2");
  });
});
