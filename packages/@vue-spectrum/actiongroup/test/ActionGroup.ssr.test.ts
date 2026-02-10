import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ActionGroup } from "../src";

describe("ActionGroup SSR", () => {
  it("renders action items on the server", async () => {
    const App = defineComponent({
      name: "ActionGroupSSRApp",
      setup() {
        return () =>
          h(ActionGroup, {
            "aria-label": "Server actions",
            items: [
              { key: "edit", label: "Edit" },
              { key: "copy", label: "Copy" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-ActionGroup");
    expect(html).toContain("Edit");
    expect(html).toContain("Copy");
  });
});
