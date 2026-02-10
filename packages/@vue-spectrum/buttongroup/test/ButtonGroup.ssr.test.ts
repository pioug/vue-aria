import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Button } from "@vue-spectrum/button";
import { ButtonGroup } from "../src";

describe("ButtonGroup SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ButtonGroupSSRApp",
      setup() {
        return () =>
          h(ButtonGroup, null, {
            default: () => [h(Button, { variant: "primary" }, () => "Test")],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-ButtonGroup");
    expect(html).toContain("Test");
  });
});
