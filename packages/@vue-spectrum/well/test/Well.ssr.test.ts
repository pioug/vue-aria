import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Well } from "../src";

describe("Well SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "WellSSRApp",
      setup() {
        return () => h(Well, null, () => "Server-side well");
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Well");
    expect(html).toContain("Server-side well");
  });
});
