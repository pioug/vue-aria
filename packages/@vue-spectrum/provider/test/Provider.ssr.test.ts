import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "../src";

describe("Provider SSR", () => {
  it("renders without errors on the server", async () => {
    const App = defineComponent({
      name: "ProviderSSRApp",
      setup() {
        return () =>
          h(
            Provider,
            {
              theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
              colorScheme: "light",
              scale: "medium",
            },
            {
              default: () => h("div", null, "Hello"),
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<div");
    expect(html).toContain("spectrum--light");
    expect(html).toContain("spectrum--medium");
  });
});
