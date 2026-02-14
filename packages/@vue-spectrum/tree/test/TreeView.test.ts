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
