import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Switch } from "../src";

describe("Switch SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Switch as any, null, { default: () => "Switching" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
