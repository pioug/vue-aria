import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { ButtonGroup, Content, Dialog, Footer, Header, Heading } from "../src";

describe("Dialog SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Dialog as any, null, {
          default: () => "contents",
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });

  it("renders composition slot components without SSR errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Dialog as any, null, {
          default: () => [
            h(Header as any, null, { default: () => h(Heading as any, null, { default: () => "Dialog title" }) }),
            h(Content as any, null, { default: () => h("p", "Body") }),
            h(Footer as any, null, { default: () => h(ButtonGroup as any, null, { default: () => h("button", "Confirm") }) }),
          ],
        });
      },
    });

    const html = await renderToString(app);
    expect(html).toContain("spectrum-Dialog-heading");
    expect(html).toContain("spectrum-Dialog-content");
    expect(html).toContain("spectrum-Dialog-footer");
    expect(html).toContain("spectrum-Dialog-buttonGroup");
  });
});
