import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { SearchAutocomplete } from "../src";

describe("SearchAutocomplete SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "SearchAutocompleteSSRApp",
      setup() {
        return () =>
          h(SearchAutocomplete, {
            label: "Search",
            defaultItems: [
              { key: "1", label: "One" },
              { key: "2", label: "Two" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-SearchAutocomplete");
  });
});
