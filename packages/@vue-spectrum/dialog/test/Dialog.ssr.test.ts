import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Dialog } from "../src";

describe("Dialog SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Dialog as any, null, {
          default: () => "contents",
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
