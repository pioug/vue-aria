import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Link } from "../src";

describe("Link SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "LinkSSRApp",
      setup() {
        return () => h(Link, null, () => "the link");
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Link");
    expect(html).toContain("the link");
  });
});
