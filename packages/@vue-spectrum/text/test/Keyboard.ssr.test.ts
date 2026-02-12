import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Keyboard } from "../src";

describe("Keyboard SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "KeyboardSSRApp",
      setup() {
        return () => h(Keyboard);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<kbd");
  });
});
