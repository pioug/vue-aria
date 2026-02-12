import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Flex } from "../src";

describe("Flex SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "FlexSSRApp",
      setup() {
        return () => h(Flex);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<div");
  });
});
