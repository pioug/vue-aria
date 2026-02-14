import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Link } from "../src";

describe("Link SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Link as any, null, { default: () => "the link" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
