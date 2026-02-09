import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Header } from "../src";

describe("Header SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "HeaderSSRApp",
      setup() {
        return () => h(Header);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<header");
  });
});
