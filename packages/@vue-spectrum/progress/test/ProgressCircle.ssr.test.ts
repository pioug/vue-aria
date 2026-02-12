import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ProgressCircle } from "../src";

describe("ProgressCircle SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "ProgressCircleSSRApp",
      setup() {
        return () =>
          h(ProgressCircle, { ariaLabel: "progress" } as Record<string, unknown>);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-CircleLoader");
  });
});
