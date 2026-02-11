import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Modal } from "../src";

describe("Modal SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ModalSSRApp",
      setup() {
        return () =>
          h(
            Modal,
            { isOpen: true },
            {
              default: () => h("div", { role: "dialog" }, "Modal content"),
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("teleport");
  });
});
