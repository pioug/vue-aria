import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { SearchField } from "../src";

describe("SearchField SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(SearchField as any, { label: "search" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
