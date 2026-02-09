import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { provideSpectrumProvider } from "@vue-spectrum/provider";
import { Icon, Illustration, UIIcon } from "../src";
import type { SpectrumTheme } from "@vue-spectrum/provider";

const theme: SpectrumTheme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

function renderSvg() {
  return h("svg", { viewBox: "0 0 20 20" }, [h("circle", { cx: "10", cy: "10", r: "7" })]);
}

describe("Icon SSR", () => {
  it("renders icon wrappers on the server", async () => {
    const App = defineComponent({
      name: "IconSSRApp",
      setup() {
        provideSpectrumProvider({
          theme,
          colorScheme: "light",
          scale: "large",
        });

        return () =>
          h("div", [
            h(
              Icon,
              { ariaLabel: "workflow icon" },
              {
                default: () => [renderSvg()],
              }
            ),
            h(
              UIIcon,
              { ariaLabel: "ui icon" },
              {
                default: () => [renderSvg()],
              }
            ),
            h(
              Illustration,
              { ariaLabel: "illustration" },
              {
                default: () => [renderSvg()],
              }
            ),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Icon");
    expect(html).toContain("spectrum-Icon--sizeL");
    expect(html).toContain("aria-label=\"workflow icon\"");
    expect(html).toContain("aria-label=\"ui icon\"");
    expect(html).toContain("aria-label=\"illustration\"");
  });
});
