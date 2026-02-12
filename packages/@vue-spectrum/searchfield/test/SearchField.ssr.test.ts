import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { SearchField } from "../src";

describe("SearchField SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "SearchFieldSSRApp",
      setup() {
        return () =>
          h(SearchField, {
            label: "Search",
            defaultValue: "Query",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-Search");
    expect(html).toContain("Search");
    expect(html).toContain("Query");
  });
});
