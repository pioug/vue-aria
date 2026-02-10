import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Radio, RadioGroup } from "../src";

describe("Radio SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "RadioSSRApp",
      setup() {
        return () =>
          h(
            RadioGroup,
            {
              label: "radio",
            },
            {
              default: () => [
                h(
                  Radio,
                  {
                    value: "one",
                  },
                  () => "One"
                ),
                h(
                  Radio,
                  {
                    value: "two",
                  },
                  () => "Two"
                ),
              ],
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Radio");
    expect(html).toContain("radio");
  });
});
