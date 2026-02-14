import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Tooltip } from "../src";

describe("Tooltip SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Tooltip as any, { "aria-label": "tooltip" }, { default: () => "Tip" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
