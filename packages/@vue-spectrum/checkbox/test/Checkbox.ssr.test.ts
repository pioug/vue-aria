import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Checkbox, CheckboxGroup } from "../src";

describe("Checkbox SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "CheckboxSSRApp",
      setup() {
        return () =>
          h("div", [
            h(Checkbox, null, () => "Checkbox"),
            h(
              CheckboxGroup,
              {
                label: "Favorite Pet",
              },
              {
                default: () => [
                  h(
                    Checkbox,
                    {
                      value: "dogs",
                    },
                    () => "Dogs"
                  ),
                ],
              }
            ),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Checkbox");
    expect(html).toContain("Favorite Pet");
  });
});
