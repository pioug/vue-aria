import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { ProgressBar } from "../src";

describe("ProgressBar SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(ProgressBar as any, { "aria-label": "progress" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
