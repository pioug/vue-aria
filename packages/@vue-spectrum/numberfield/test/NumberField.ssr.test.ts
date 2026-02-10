import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { NumberField } from "../src";

describe("NumberField SSR", () => {
  it("renders number field on the server", async () => {
    const App = defineComponent({
      name: "NumberFieldSSRApp",
      setup() {
        return () =>
          h(NumberField, {
            "aria-label": "Amount",
            defaultValue: 4,
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-Stepper");
    expect(html).toContain("value=\"4\"");
  });
});
