import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Meter } from "../src";

describe("Meter SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Meter as any, { label: "Storage space", variant: "positive" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
