import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, provideSpectrumProvider } from "@vue-spectrum/provider";
import { Form } from "../src";

describe("Form SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "FormSSRApp",
      setup() {
        provideSpectrumProvider({
          theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
          colorScheme: "light",
          scale: "medium",
        });

        return () => h(Form, { "aria-label": "Home" });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<form");
    expect(html).toContain("spectrum-Form");
  });
});
