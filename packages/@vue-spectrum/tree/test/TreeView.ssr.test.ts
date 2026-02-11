import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { TreeView } from "../src";

describe("TreeView SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "TreeSSRApp",
      setup() {
        return () =>
          h(TreeView, {
            "aria-label": "Tree",
            defaultExpandedKeys: ["documents"],
            items: [
              {
                id: "documents",
                name: "Documents",
                childItems: [
                  { id: "project-a", name: "Project A" },
                  { id: "document-1", name: "Document 1" },
                ],
              },
              {
                id: "photos",
                name: "Photos",
              },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-TreeView");
    expect(html).toContain("Documents");
    expect(html).toContain("Project A");
  });
});
