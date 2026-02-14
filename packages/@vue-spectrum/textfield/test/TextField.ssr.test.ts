import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { TextField } from "../src";

describe("TextField SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(TextField as any, { label: "text" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
