import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { StatusLight } from "../src";

describe("StatusLight SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "StatusLightSSRApp",
      setup() {
        return () =>
          h(
            StatusLight,
            {
              variant: "positive",
              role: "status",
              "aria-label": "Build successful",
            },
            () => "Ready"
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-StatusLight");
    expect(html).toContain("Build successful");
  });
});
