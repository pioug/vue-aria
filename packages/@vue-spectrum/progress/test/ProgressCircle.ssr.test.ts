import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { ProgressCircle } from "../src";

describe("ProgressCircle SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(ProgressCircle as any, { "aria-label": "progress" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
