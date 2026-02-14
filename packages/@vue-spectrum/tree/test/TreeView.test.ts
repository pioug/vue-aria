import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { TreeView, TreeViewItem, TreeViewItemContent, type SpectrumTreeViewItemData } from "../src";

const items: SpectrumTreeViewItemData[] = [
  { id: "photos", name: "Photos" },
  {
    id: "projects",
    name: "Projects",
    children: [
      { id: "projects-1", name: "Project 1" },
      { id: "projects-2", name: "Project 2" },
    ],
  },
];

function renderTree(props: Record<string, unknown> = {}) {
  return mount(TreeView as any, {
    props: {
      "aria-label": "Test tree",
      items,
      ...props,
    },
    attachTo: document.body,
  });
}

async function press(target: { trigger: (event: string, options?: Record<string, unknown>) => Promise<unknown> }) {
  await target.trigger("pointerdown", {
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
  });
  await target.trigger("pointerup", {
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
  });
  await target.trigger("click", { button: 0 });
  await nextTick();
}

describe("TreeView", () => {
  it("renders treegrid and top-level rows", () => {
    const wrapper = renderTree();

    const tree = wrapper.get('[role="treegrid"]');
    expect(tree.attributes("aria-label")).toBe("Test tree");

    const rows = wrapper.findAll('[role="row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.text()).toContain("Photos");
    expect(rows[1]!.text()).toContain("Projects");
  });

  it("supports DOM props on tree rows", async () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "DOM tree",
        "data-testid": "tree-root",
        defaultExpandedKeys: ["projects"],
      },
      slots: {
        default: () => [
          h(TreeViewItem as any, { id: "photos", textValue: "Photos", "data-testid": "row-photos" }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Photos",
              }),
            ],
          }),
          h(TreeViewItem as any, { id: "projects", textValue: "Projects", "data-testid": "row-projects" }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Projects",
              }),
              h(TreeViewItem as any, { id: "projects-1", textValue: "Project 1", "data-testid": "row-project-1" }, {
                default: () => [
                  h(TreeViewItemContent as any, null, {
                    default: () => "Project 1",
                  }),
                ],
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const tree = wrapper.get('[role="treegrid"]');
    expect(tree.attributes("data-testid")).toBe("tree-root");

    const rows = wrapper.findAll('[role="row"]');
    expect(rows.find((row) => row.text().includes("Photos"))?.attributes("data-testid")).toBe("row-photos");
    expect(rows.find((row) => row.text().includes("Projects"))?.attributes("data-testid")).toBe("row-projects");
    expect(rows.find((row) => row.text().includes("Project 1"))?.attributes("data-testid")).toBe("row-project-1");
  });

  it("applies custom aria-label to rows", () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Label tree",
      },
      slots: {
        default: () => [
          h(TreeViewItem as any, { id: "row-1", textValue: "Row 1", "aria-label": "Custom row label" }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Row 1",
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const row = wrapper.get('[role="row"]');
    expect(row.attributes("aria-label")).toBe("Custom row label");
  });

  it("applies expected hierarchy attributes to visible rows", () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Hierarchy tree",
        defaultExpandedKeys: ["projects"],
      },
      slots: {
        default: () => [
          h(TreeViewItem as any, { id: "photos", textValue: "Photos" }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Photos",
              }),
            ],
          }),
          h(TreeViewItem as any, { id: "projects", textValue: "Projects" }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Projects",
              }),
              h(TreeViewItem as any, { id: "projects-1", textValue: "Project 1" }, {
                default: () => [
                  h(TreeViewItemContent as any, null, {
                    default: () => "Project 1",
                  }),
                ],
              }),
              h(TreeViewItem as any, { id: "projects-2", textValue: "Project 2" }, {
                default: () => [
                  h(TreeViewItemContent as any, null, {
                    default: () => "Project 2",
                  }),
                ],
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('[role="row"]');
    expect(rows).toHaveLength(4);

    const photosRow = rows.find((row) => row.text().includes("Photos"));
    const projectsRow = rows.find((row) => row.text().includes("Projects"));
    const projectOneRow = rows.find((row) => row.text().includes("Project 1"));

    expect(photosRow).toBeTruthy();
    expect(photosRow!.attributes("aria-level")).toBe("1");
    expect(photosRow!.attributes("data-level")).toBe("1");
    expect(photosRow!.attributes("aria-posinset")).toBe("1");
    expect(photosRow!.attributes("aria-setsize")).toBe("2");
    expect(photosRow!.attributes("aria-expanded")).toBeUndefined();

    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-level")).toBe("1");
    expect(projectsRow!.attributes("data-level")).toBe("1");
    expect(projectsRow!.attributes("aria-posinset")).toBe("2");
    expect(projectsRow!.attributes("aria-setsize")).toBe("2");
    expect(projectsRow!.attributes("aria-expanded")).toBe("true");

    expect(projectOneRow).toBeTruthy();
    expect(projectOneRow!.attributes("aria-level")).toBe("2");
    expect(projectOneRow!.attributes("data-level")).toBe("2");
    expect(projectOneRow!.attributes("aria-posinset")).toBe("1");
    expect(projectOneRow!.attributes("aria-setsize")).toBe("2");
    expect(projectOneRow!.attributes("aria-expanded")).toBeUndefined();
  });

  it("supports dynamic nested data trees", () => {
    const dynamicItems: SpectrumTreeViewItemData[] = [
      {
        id: "projects",
        name: "Projects",
        "data-testid": "row-projects",
        children: [
          { id: "project-1", name: "Project 1" },
          {
            id: "project-2",
            name: "Project 2",
            children: [
              { id: "project-2a", name: "Project 2A" },
              { id: "project-2b", name: "Project 2B" },
            ],
          },
        ],
      },
      {
        id: "reports",
        name: "Reports",
        children: [{ id: "report-1", name: "Report 1" }],
      },
    ];

    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Dynamic tree",
        items: dynamicItems,
        defaultExpandedKeys: ["projects", "project-2", "reports"],
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('[role="row"]');
    expect(rows).toHaveLength(7);

    const projectsRow = rows.find((row) => row.text().includes("Projects"));
    const projectTwoRow = rows.find((row) => row.text().includes("Project 2"));
    const projectTwoARow = rows.find((row) => row.text().includes("Project 2A"));
    const reportsRow = rows.find((row) => row.text().includes("Reports"));

    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("data-testid")).toBe("row-projects");
    expect(projectsRow!.attributes("aria-level")).toBe("1");
    expect(projectsRow!.attributes("aria-expanded")).toBe("true");
    expect(projectsRow!.attributes("aria-setsize")).toBe("2");

    expect(projectTwoRow).toBeTruthy();
    expect(projectTwoRow!.attributes("aria-level")).toBe("2");
    expect(projectTwoRow!.attributes("aria-expanded")).toBe("true");

    expect(projectTwoARow).toBeTruthy();
    expect(projectTwoARow!.attributes("aria-level")).toBe("3");
    expect(projectTwoARow!.attributes("aria-setsize")).toBe("2");

    expect(reportsRow).toBeTruthy();
    expect(reportsRow!.attributes("aria-level")).toBe("1");
    expect(reportsRow!.attributes("aria-expanded")).toBe("true");
    expect(reportsRow!.attributes("aria-posinset")).toBe("2");
  });

  it("supports expanding child rows", async () => {
    const wrapper = renderTree();

    const rows = wrapper.findAll('[role="row"]');
    const projectsRow = rows.find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();

    const chevron = projectsRow!.get("button");
    await press(chevron);

    const updatedRows = wrapper.findAll('[role="row"]');
    const rowTexts = updatedRows.map((row) => row.text());
    expect(rowTexts.some((text) => text.includes("Photos"))).toBe(true);
    expect(rowTexts.some((text) => text.includes("Projects"))).toBe(true);
    expect(rowTexts.some((text) => text.includes("Project 1"))).toBe(true);
    expect(rowTexts.some((text) => text.includes("Project 2"))).toBe(true);
  });

  it("supports selection callbacks", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTree({
      selectionMode: "single",
      selectionStyle: "highlight",
      onSelectionChange,
      defaultExpandedKeys: ["projects"],
    });

    const rows = wrapper.findAll('[role="row"]');
    const projectOneRow = rows.find((row) => row.text().includes("Project 1"));
    expect(projectOneRow).toBeTruthy();

    await press(projectOneRow!);

    expect(onSelectionChange).toHaveBeenCalled();
    const selected = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string>;
    expect(selected.has("projects-1")).toBe(true);
  });

  it("supports row action callbacks", async () => {
    const onAction = vi.fn();
    const wrapper = renderTree({
      selectionMode: "single",
      selectionStyle: "highlight",
      onAction,
    });

    const projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();

    (projectsRow!.element as HTMLElement).focus();
    await projectsRow!.trigger("keydown", { key: "Enter" });
    await projectsRow!.trigger("keyup", { key: "Enter" });
    await nextTick();

    expect(onAction).toHaveBeenCalledWith("projects");
  });

  it("supports static tree item composition", async () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Static tree",
        defaultExpandedKeys: ["projects"],
      },
      slots: {
        default: () => [
          h(TreeViewItem as any, { id: "photos", textValue: "Photos" }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Photos",
              }),
            ],
          }),
          h(TreeViewItem as any, { id: "projects", textValue: "Projects" }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Projects",
              }),
              h(TreeViewItem as any, { id: "projects-1", textValue: "Project 1" }, {
                default: () => [
                  h(TreeViewItemContent as any, null, {
                    default: () => "Project 1",
                  }),
                ],
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('[role="row"]');
    const rowTexts = rows.map((row) => row.text());
    expect(rowTexts.some((text) => text.includes("Photos"))).toBe(true);
    expect(rowTexts.some((text) => text.includes("Projects"))).toBe(true);
    expect(rowTexts.some((text) => text.includes("Project 1"))).toBe(true);
  });
});
