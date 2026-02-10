import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { MenuTrigger } from "../src";

describe("MenuTrigger SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "MenuTriggerSSRApp",
      setup() {
        return () =>
          h(MenuTrigger, {
            triggerLabel: "Edit",
            items: [
              { key: "one", label: "One" },
              { key: "two", label: "Two" },
              { key: "three", label: "Three" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-MenuTrigger");
    expect(html).toContain("Edit");
  });
});
