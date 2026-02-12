import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Heading } from "../src";

describe("Heading SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "HeadingSSRApp",
      setup() {
        return () => h(Heading);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<h3");
  });
});
