import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { BreadcrumbItem, Breadcrumbs } from "../src";

describe("Breadcrumbs SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "BreadcrumbsSSRApp",
      setup() {
        return () =>
          h(Breadcrumbs, null, {
            default: () => [h(BreadcrumbItem, null, () => "Folder 1")],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Breadcrumbs");
    expect(html).toContain("Folder 1");
  });
});
