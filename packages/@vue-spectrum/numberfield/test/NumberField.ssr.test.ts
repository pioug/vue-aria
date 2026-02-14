import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { NumberField } from "../src";

describe("NumberField SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(NumberField as any, { "aria-label": "number" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
