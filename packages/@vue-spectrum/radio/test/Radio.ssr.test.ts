import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Radio, RadioGroup } from "../src";

describe("Radio SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(RadioGroup as any, { "aria-label": "Choices" }, {
          default: () => [
            h(Radio as any, { value: "one" }, { default: () => "One" }),
            h(Radio as any, { value: "two" }, { default: () => "Two" }),
          ],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
