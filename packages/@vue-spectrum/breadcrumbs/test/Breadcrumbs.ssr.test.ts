import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Breadcrumbs, Item } from "../src";

describe("Breadcrumbs SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Breadcrumbs as any, null, {
          default: () => [h(Item as any, { key: "one" }, { default: () => "One" })],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });

  it("renders multiline and showRoot variants without SSR errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Breadcrumbs as any, { isMultiline: true, showRoot: true }, {
          default: () => [
            h(Item as any, { key: "one" }, { default: () => "One" }),
            h(Item as any, { key: "two" }, { default: () => "Two" }),
            h(Item as any, { key: "three" }, { default: () => "Three" }),
          ],
        });
      },
    });

    const html = await renderToString(app);
    expect(html).toContain("spectrum-Breadcrumbs--multiline");
    expect(html).toContain("spectrum-Breadcrumbs--showRoot");
  });

  it("renders id and UNSAFE_className without SSR errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Breadcrumbs as any, {
          id: "breadcrumbs-ssr",
          UNSAFE_className: "breadcrumbs-ssr-class",
          "aria-label": "Breadcrumbs",
        }, {
          default: () => [
            h(Item as any, { key: "one" }, { default: () => "One" }),
            h(Item as any, { key: "two" }, { default: () => "Two" }),
          ],
        });
      },
    });

    const html = await renderToString(app);
    expect(html).toContain("breadcrumbs-ssr");
    expect(html).toContain("breadcrumbs-ssr-class");
  });
});
