import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { ToastContainer } from "../src";

describe("ToastContainer SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(ToastContainer as any);
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
