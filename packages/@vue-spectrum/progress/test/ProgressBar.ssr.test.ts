import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "../src";

describe("ProgressBar SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ProgressBarSSRApp",
      setup() {
        return () => h(ProgressBar, { ariaLabel: "progress" } as Record<string, unknown>);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-BarLoader");
  });
});
