// @vitest-environment node

import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { useViewportSize } from "../src/useViewportSize";

describe("useViewportSize SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      setup() {
        useViewportSize();
        return () => null;
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });

  it("renders 0x0 before hydration", async () => {
    const app = createSSRApp({
      setup() {
        const size = useViewportSize();
        return () => h("div", { "data-testid": "viewport" }, `${size.value.width}x${size.value.height}`);
      },
    });

    const html = await renderToString(app);
    expect(html).toContain("0x0");
  });
});
