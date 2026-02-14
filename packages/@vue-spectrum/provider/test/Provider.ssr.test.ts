import { describe, expect, it, vi } from "vitest";
import { theme } from "@vue-spectrum/theme";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Provider } from "../src/Provider";

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
