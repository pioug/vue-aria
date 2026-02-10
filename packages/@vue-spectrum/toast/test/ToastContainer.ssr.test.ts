import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ToastContainer } from "../src";

describe("ToastContainer SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ToastContainerSSRApp",
      setup() {
        return () => h(ToastContainer);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toBeDefined();
  });
});
