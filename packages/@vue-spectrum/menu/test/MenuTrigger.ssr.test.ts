import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Item } from "../src/Item";
import { Menu } from "../src/Menu";
import { MenuTrigger } from "../src/MenuTrigger";

describe("MenuTrigger SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(MenuTrigger as any, null, {
          default: () => [
            h("button", "Menu Button"),
            h(Menu as any, { ariaLabel: "Menu" }, {
              default: () => [
                h(Item as any, { key: "one" }, { default: () => "One" }),
              ],
            }),
          ],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
