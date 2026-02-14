import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { TreeView, TreeViewItem, TreeViewItemContent } from "../src";

describe("TreeView SSR", () => {
  it("renders data-driven trees without errors", async () => {
    const App = defineComponent({
      name: "TreeViewSSRDataApp",
      setup() {
        return () =>
          h(TreeView, {
            "aria-label": "SSR tree",
            items: [
              { id: "photos", name: "Photos" },
              {
                id: "projects",
                name: "Projects",
                children: [{ id: "projects-1", name: "Project 1" }],
              },
            ],
            defaultExpandedKeys: ["projects"],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-TreeView");
    expect(html).toContain("Projects");
    expect(html).toContain("Project 1");
  });

  it("renders static trees without errors", async () => {
    const App = defineComponent({
      name: "TreeViewSSRStaticApp",
      setup() {
        return () =>
          h(
            TreeView,
            {
              "aria-label": "Static tree",
              defaultExpandedKeys: ["projects"],
            },
            {
              default: () => [
                h(TreeViewItem, { id: "photos", textValue: "Photos" }, {
                  default: () =>
                    h(TreeViewItemContent, null, {
                      default: () => "Photos",
                    }),
                }),
                h(TreeViewItem, { id: "projects", textValue: "Projects" }, {
                  default: () => [
                    h(TreeViewItemContent, null, {
                      default: () => "Projects",
                    }),
                    h(TreeViewItem, { id: "projects-1", textValue: "Project 1" }, {
                      default: () =>
                        h(TreeViewItemContent, null, {
                          default: () => "Project 1",
                        }),
                    }),
                  ],
                }),
              ],
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-TreeView");
    expect(html).toContain("Project 1");
  });

  it("renders semantic empty-state rows", async () => {
    const App = defineComponent({
      name: "TreeViewSSREmptyStateApp",
      setup() {
        return () =>
          h(TreeView, {
            "aria-label": "Empty SSR tree",
            items: [],
            renderEmptyState: () => "No rows",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-TreeView");
    expect(html).toContain('data-empty="true"');
    expect(html).toContain('role="row"');
    expect(html).toContain('role="gridcell"');
    expect(html).toContain("No rows");
  });
});
