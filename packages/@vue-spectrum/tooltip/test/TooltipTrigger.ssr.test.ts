import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Tooltip, TooltipTrigger } from "../src";

describe("TooltipTrigger SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(TooltipTrigger as any, null, {
          default: () => [
            h("button", { "aria-label": "trigger" }, "Trigger"),
            h(Tooltip as any, null, { default: () => "Tip" }),
          ],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
