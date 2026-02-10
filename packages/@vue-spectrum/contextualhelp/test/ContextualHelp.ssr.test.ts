import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { Header } from "@vue-spectrum/view";
import { describe, expect, it } from "vitest";
import { ContextualHelp } from "../src";

describe("ContextualHelp SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ContextualHelpSSRApp",
      setup() {
        return () =>
          h(
            ContextualHelp,
            null,
            {
              default: () => h(Header, null, () => "Test title"),
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-ContextualHelp-button");
  });
});
