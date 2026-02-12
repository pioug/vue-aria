import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Switch } from "../src";

describe("Switch SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "SwitchSSRApp",
      setup() {
        return () => h(Switch, null, () => "Switching");
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-ToggleSwitch");
    expect(html).toContain("Switching");
  });
});
