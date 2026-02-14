import { mount } from "@vue/test-utils";
import { setInteractionModality } from "@vue-aria/interactions";
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

function mockClickDefault() {
  const onClick = vi.fn((event: MouseEvent) => {
    event.preventDefault();
  });
  const listener: EventListener = (event) => {
    if (event instanceof MouseEvent) {
      onClick(event);
    }
  };
  document.addEventListener("click", listener);
  return {
    onClick,
    restore() {
      document.removeEventListener("click", listener);
    },
  };
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

  it("forwards onScroll from tree props", async () => {
    const onScroll = vi.fn();
    const wrapper = renderTree({ onScroll });

    const tree = wrapper.get('[role="treegrid"]');
    await tree.trigger("scroll");

    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  it("keeps empty trees tabbable", () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Empty tree",
        items: [],
        renderEmptyState: () => "No rows",
      },
      attachTo: document.body,
    });

    const tree = wrapper.get('[role="treegrid"]');
    expect(tree.attributes("tabindex")).toBe("0");
    expect(wrapper.text()).toContain("No rows");
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

  it("marks expandable rows as selectable when selection mode is enabled", () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Selectable tree",
        selectionMode: "single",
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
              h(TreeViewItem as any, { id: "project-1", textValue: "Project 1" }, {
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
    const projectsRow = rows.find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-label")).toBe("Projects");
    expect(projectsRow!.attributes("aria-selected")).toBe("false");
  });

  it("renders selection checkboxes when selection is enabled", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Checkbox tree",
        selectionMode: "single",
        onSelectionChange,
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
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.find('input[type="checkbox"]').exists()).toBe(true);
    }

    const projectOneRow = rows.find((row) => row.text().includes("Project 1"));
    expect(projectOneRow).toBeTruthy();

    await projectOneRow!.get('input[type="checkbox"]').setValue(true);
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalled();
    const selectedKeys = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(selectedKeys?.has("projects-1")).toBe(true);
    expect(projectOneRow!.attributes("aria-selected")).toBe("true");
  });

  it("wires row checkbox aria attributes in single-selection mode", () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Single checkbox tree",
        selectionMode: "single",
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

    const tree = wrapper.get('[role="treegrid"]');
    expect(tree.attributes("aria-multiselectable")).toBeUndefined();

    const rows = wrapper.findAll('[role="row"]');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const checkbox = row.get('input[type="checkbox"]');
      expect(checkbox.attributes("aria-label")).toBe("Select");
      const rowId = row.attributes("id");
      const labelledBy = checkbox.attributes("aria-labelledby");
      expect(labelledBy).toContain(rowId);
      expect(row.attributes("aria-selected")).toBe("false");
    }
  });

  it("sets aria-multiselectable in multiple selection mode", () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Multiple checkbox tree",
        selectionMode: "multiple",
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
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const tree = wrapper.get('[role="treegrid"]');
    expect(tree.attributes("aria-multiselectable")).toBe("true");
  });

  it("does not render selection checkboxes in highlight selection mode", () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Highlight tree",
        selectionMode: "multiple",
        selectionStyle: "highlight",
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
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.find('input[type="checkbox"]').exists()).toBe(false);
    }
  });

  it('prevents Escape from clearing selection when escapeKeyBehavior is "none"', async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Escape tree",
        selectionMode: "multiple",
        escapeKeyBehavior: "none",
        onSelectionChange,
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

    const projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    const projectOneRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Project 1"));
    expect(projectsRow).toBeTruthy();
    expect(projectOneRow).toBeTruthy();

    await projectsRow!.get('input[type="checkbox"]').setValue(true);
    await projectOneRow!.get('input[type="checkbox"]').setValue(true);
    expect(onSelectionChange).toHaveBeenCalledTimes(2);

    const tree = wrapper.get('[role="treegrid"]');
    await tree.trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
  });

  it("renders a chevron for rows marked with hasChildItems before children load", () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Deferred tree",
      },
      slots: {
        default: () => [
          h(TreeViewItem as any, { id: "deferred", textValue: "Deferred row", hasChildItems: true }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Deferred row",
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const row = wrapper.get('[role="row"]');
    expect(row.attributes("aria-label")).toBe("Deferred row");
    expect(row.attributes("aria-expanded")).toBeUndefined();
    expect(row.find("button").exists()).toBe(true);
  });

  it("applies expand and collapse labels on chevrons", async () => {
    const wrapper = renderTree({
      defaultExpandedKeys: ["projects"],
    });

    const projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();

    let chevron = projectsRow!.get("button");
    expect(projectsRow!.attributes("aria-expanded")).toBe("true");
    expect(chevron.attributes("aria-label")).toBe("Collapse");

    await press(chevron);

    const updatedProjectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(updatedProjectsRow).toBeTruthy();
    chevron = updatedProjectsRow!.get("button");
    expect(updatedProjectsRow!.attributes("aria-expanded")).toBe("false");
    expect(chevron.attributes("aria-label")).toBe("Expand");
  });

  it("updates chevron labels when rows toggle expansion", async () => {
    const wrapper = renderTree({
      selectionMode: "none",
      defaultExpandedKeys: ["projects"],
    });

    let projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();

    let chevron = projectsRow!.get("button");
    expect(projectsRow!.attributes("aria-expanded")).toBe("true");
    expect(chevron.attributes("aria-label")).toBe("Collapse");

    await press(projectsRow!);

    projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    chevron = projectsRow!.get("button");
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");
    expect(chevron.attributes("aria-label")).toBe("Expand");

    await press(projectsRow!);

    projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    chevron = projectsRow!.get("button");
    expect(projectsRow!.attributes("aria-expanded")).toBe("true");
    expect(chevron.attributes("aria-label")).toBe("Collapse");
  });

  it("keeps chevron tabIndex when disabledBehavior is selection and removes it for all", async () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Disabled behavior tree",
        selectionMode: "multiple",
        disabledBehavior: "selection",
      },
      slots: {
        default: () => [
          h(TreeViewItem as any, { id: "test", textValue: "Test", hasChildItems: true }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Test",
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    let row = wrapper.get('[role="row"]');
    let chevron = row.get("button");
    expect(chevron.attributes("tabindex")).toBe("-1");

    await wrapper.setProps({
      disabledKeys: ["test"],
      disabledBehavior: "selection",
    });
    await nextTick();

    row = wrapper.get('[role="row"]');
    chevron = row.get("button");
    expect(chevron.attributes("tabindex")).toBe("-1");

    await wrapper.setProps({
      disabledKeys: ["test"],
      disabledBehavior: "all",
    });
    await nextTick();

    row = wrapper.get('[role="row"]');
    chevron = row.get("button");
    expect(chevron.attributes("tabindex")).toBeUndefined();
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

  it("does not expand rows from row press when selection is enabled", async () => {
    const wrapper = renderTree({
      selectionMode: "single",
    });

    let projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");
    expect(projectsRow!.attributes("aria-selected")).toBe("false");

    await press(projectsRow!);

    projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");
    expect(projectsRow!.attributes("aria-selected")).toBe("true");
    expect(wrapper.findAll('[role="row"]').some((row) => row.text().includes("Project 1"))).toBe(false);
  });

  it('does not expand disabled rows when disabledBehavior is "all"', async () => {
    const wrapper = renderTree({
      selectionMode: "none",
      disabledBehavior: "all",
      disabledKeys: ["projects"],
    });

    let projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");
    expect(projectsRow!.attributes("aria-disabled")).toBe("true");

    await press(projectsRow!);

    projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");
    expect(wrapper.findAll('[role="row"]').some((row) => row.text().includes("Project 1"))).toBe(false);
  });

  it('expands disabled rows when disabledBehavior is "selection"', async () => {
    const wrapper = renderTree({
      selectionMode: "none",
      disabledBehavior: "selection",
      disabledKeys: ["projects"],
    });

    let projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");
    expect(projectsRow!.attributes("aria-disabled")).toBeUndefined();

    await press(projectsRow!);

    projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-expanded")).toBe("true");
    expect(wrapper.findAll('[role="row"]').some((row) => row.text().includes("Project 1"))).toBe(true);
  });

  it("does not expand rows from row press when row actions are configured", async () => {
    const onAction = vi.fn();
    const wrapper = renderTree({
      selectionMode: "none",
      onAction,
    });

    let projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");

    await press(projectsRow!);

    projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("projects");
    expect(wrapper.findAll('[role="row"]').some((row) => row.text().includes("Project 1"))).toBe(false);
  });

  it("supports controlled expansion", async () => {
    const onExpandedChange = vi.fn();
    const wrapper = renderTree({
      expandedKeys: [],
      onExpandedChange,
    });

    const projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();

    await press(projectsRow!.get("button"));
    expect(onExpandedChange).toHaveBeenCalled();
    const requestedKeys = onExpandedChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(requestedKeys?.has("projects")).toBe(true);

    let rowTexts = wrapper.findAll('[role="row"]').map((row) => row.text());
    expect(rowTexts.some((text) => text.includes("Project 1"))).toBe(false);

    await wrapper.setProps({
      expandedKeys: ["projects"],
    });
    await nextTick();

    rowTexts = wrapper.findAll('[role="row"]').map((row) => row.text());
    expect(rowTexts.some((text) => text.includes("Project 1"))).toBe(true);
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

  it("toggles and replaces highlight selection based on modifier keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTree({
      selectionMode: "multiple",
      selectionStyle: "highlight",
      onSelectionChange,
    });

    const photosRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Photos"));
    const projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(photosRow).toBeTruthy();
    expect(projectsRow).toBeTruthy();

    await press(photosRow!);
    let selected = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(selected).toBeInstanceOf(Set);
    expect(selected?.has("photos")).toBe(true);

    await projectsRow!.trigger("pointerdown", {
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
      ctrlKey: true,
      metaKey: true,
    });
    await projectsRow!.trigger("pointerup", {
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
      ctrlKey: true,
      metaKey: true,
    });
    await projectsRow!.trigger("click", {
      button: 0,
      ctrlKey: true,
      metaKey: true,
    });
    await nextTick();

    selected = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(selected?.has("photos")).toBe(true);
    expect(selected?.has("projects")).toBe(true);
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

  it('supports row links when selectionMode="none"', async () => {
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Link tree",
        selectionMode: "none",
      },
      slots: {
        default: () => [
          h(TreeViewItem as any, {
            id: "docs",
            textValue: "Docs",
            href: "https://example.com/docs",
          }, {
            default: () => [
              h(TreeViewItemContent as any, null, {
                default: () => "Docs",
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const row = wrapper.get('[role="row"]');
    expect(row.attributes("data-href")).toBe("https://example.com/docs");
    expect(row.attributes("aria-selected")).toBeUndefined();
  });

  it("does not collapse expanded rows when activating row links", async () => {
    const onExpandedChange = vi.fn();
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Linked expandable tree",
        selectionMode: "none",
        defaultExpandedKeys: ["projects"],
        onExpandedChange,
      },
      slots: {
        default: () => [
          h(TreeViewItem as any, {
            id: "projects",
            textValue: "Projects",
            href: "https://example.com/projects",
          }, {
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

    let rows = wrapper.findAll('[role="row"]');
    expect(rows).toHaveLength(2);

    const projectsRow = rows.find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("data-href")).toBe("https://example.com/projects");
    expect(projectsRow!.attributes("aria-expanded")).toBe("true");

    const onClickDefault = mockClickDefault();
    try {
      await press(projectsRow!);
    } finally {
      onClickDefault.restore();
      setInteractionModality("keyboard");
    }

    const linkClick = onClickDefault.onClick.mock.calls
      .map((args) => args[0] as MouseEvent)
      .find((event) => event.target instanceof HTMLAnchorElement);
    expect(linkClick).toBeTruthy();
    expect((linkClick!.target as HTMLAnchorElement).href).toBe("https://example.com/projects");

    rows = wrapper.findAll('[role="row"]');
    const updatedProjectsRow = rows.find((row) => row.text().includes("Projects"));
    expect(updatedProjectsRow).toBeTruthy();
    expect(updatedProjectsRow!.attributes("aria-expanded")).toBe("true");
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it("does not expand collapsed rows when activating row links", async () => {
    const onExpandedChange = vi.fn();
    const wrapper = mount(TreeView as any, {
      props: {
        "aria-label": "Collapsed linked tree",
        selectionMode: "none",
        onExpandedChange,
      },
      slots: {
        default: () => [
          h(TreeViewItem as any, {
            id: "projects",
            textValue: "Projects",
            href: "https://example.com/projects",
          }, {
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

    let projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("data-href")).toBe("https://example.com/projects");
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");

    const onClickDefault = mockClickDefault();
    try {
      await press(projectsRow!);
    } finally {
      onClickDefault.restore();
      setInteractionModality("keyboard");
    }

    const linkClick = onClickDefault.onClick.mock.calls
      .map((args) => args[0] as MouseEvent)
      .find((event) => event.target instanceof HTMLAnchorElement);
    expect(linkClick).toBeTruthy();
    expect((linkClick!.target as HTMLAnchorElement).href).toBe("https://example.com/projects");

    projectsRow = wrapper.findAll('[role="row"]').find((row) => row.text().includes("Projects"));
    expect(projectsRow).toBeTruthy();
    expect(projectsRow!.attributes("aria-expanded")).toBe("false");
    expect(onExpandedChange).not.toHaveBeenCalled();
    expect(wrapper.findAll('[role="row"]').some((row) => row.text().includes("Project 1"))).toBe(false);
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

  it('supports focusing the first row with autoFocus="first"', async () => {
    const wrapper = renderTree({
      autoFocus: "first",
    });

    await nextTick();

    const rows = wrapper.findAll('[role="row"]');
    expect(rows.length).toBeGreaterThan(0);
    expect(document.activeElement).toBe(rows[0]!.element);
  });
});
