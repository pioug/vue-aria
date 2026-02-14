import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Breadcrumbs, Item } from "../src";

describe("Breadcrumbs SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Breadcrumbs as any, null, {
          default: () => [h(Item as any, { key: "one" }, { default: () => "One" })],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
