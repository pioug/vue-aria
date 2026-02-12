import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Badge } from "../src";

describe("Badge SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "BadgeSSRApp",
      setup() {
        return () =>
          h(
            Badge,
            {
              variant: "positive",
            },
            () => "Online"
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Badge");
    expect(html).toContain("Online");
  });
});
