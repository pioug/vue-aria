import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { OverlayContainer, OverlayProvider } from "../src/useModal";

describe("OverlayContainer SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(
          OverlayProvider,
          { "data-testid": "root-provider" },
          {
            default: () => [
              h(
                OverlayContainer,
                { "data-testid": "modal-provider" },
                { default: () => [h("div", { "data-testid": "modal" })] }
              ),
            ],
          }
        );
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
