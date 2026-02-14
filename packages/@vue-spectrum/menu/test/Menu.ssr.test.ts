import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Item } from "../src/Item";
import { Menu } from "../src/Menu";

describe("Menu SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Menu as any, { ariaLabel: "Menu" }, {
          default: () => [
            h(Item as any, { key: "one" }, { default: () => "One" }),
          ],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
