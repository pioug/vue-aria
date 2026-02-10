import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ActionBar } from "../src";

describe("ActionBar SSR", () => {
  it("renders selected count and actions on the server when open", async () => {
    const App = defineComponent({
      name: "ActionBarSSRApp",
      setup() {
        return () =>
          h(ActionBar, {
            selectedItemCount: 2,
            items: [
              { key: "edit", label: "Edit" },
              { key: "copy", label: "Copy" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("react-spectrum-ActionBar");
    expect(html).toContain("2 selected");
    expect(html).toContain("Edit");
  });
});
