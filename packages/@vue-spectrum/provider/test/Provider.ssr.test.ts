import { describe, expect, it, vi } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Provider } from "../src/Provider";
import type { Theme } from "../src/types";

const theme: Theme = {
  global: {},
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

describe("Provider SSR", () => {
  it("renders without errors", async () => {
    const languageSpy = vi.spyOn(navigator, "language", "get").mockImplementation(() => "fr");
    const app = createSSRApp({
      render() {
        return h(
          Provider,
          {
            theme,
          },
          () => h("div")
        );
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
    languageSpy.mockRestore();
  });
});
