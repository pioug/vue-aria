import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Tray } from "../src";

describe("Tray SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "TraySSRApp",
      setup() {
        return () =>
          h(
            Tray,
            { isOpen: true },
            {
              default: () => h("div", { role: "dialog" }, "Tray content"),
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("teleport");
  });
});
