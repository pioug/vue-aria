import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Item } from "../src/Item";
import { ListBox } from "../src/ListBox";

describe("ListBox SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(ListBox as any, { ariaLabel: "ListBox" }, {
          default: () => [
            h(Item as any, { key: "one" }, { default: () => "One" }),
          ],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
