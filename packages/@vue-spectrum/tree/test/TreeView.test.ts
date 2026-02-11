import { render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  TreeView,
  type SpectrumTreeViewItemData,
  type TreeKey,
} from "../src";

const treeItems: SpectrumTreeViewItemData[] = [
  {
    id: "projects",
    name: "Projects",
    childItems: [
      { id: "project-a", name: "Project A" },
      { id: "project-b", name: "Project B" },
    ],
  },
  {
    id: "photos",
    name: "Photos",
  },
];

function renderTree(
  props: Record<string, unknown> = {},
  options: { slots?: Record<string, (...args: any[]) => unknown> } = {}
) {
  return render(TreeView, {
    props: {
      "aria-label": "Tree",
      items: treeItems,
      ...props,
    },
    slots: options.slots,
  });
}

describe("TreeView", () => {
  it("renders tree rows and expanded descendants", () => {
    const tree = renderTree({ defaultExpandedKeys: ["projects"] });

    const treeGrid = tree.getByRole("treegrid", { name: "Tree" });
    expect(treeGrid).toBeTruthy();

    const rows = within(treeGrid).getAllByRole("row");
    expect(rows).toHaveLength(4);
    expect(rows[0]?.getAttribute("aria-level")).toBe("1");
    expect(rows[1]?.getAttribute("aria-level")).toBe("2");
    expect(rows[2]?.getAttribute("aria-level")).toBe("2");
    expect(rows[3]?.getAttribute("aria-level")).toBe("1");
    expect(rows[0]?.getAttribute("aria-expanded")).toBe("true");
  });

  it("supports expand and collapse", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const tree = renderTree({ onExpandedChange });

    const treeGrid = tree.getByRole("treegrid", { name: "Tree" });

    expect(within(treeGrid).queryByText("Project A")).toBeNull();

    const expandButton = treeGrid.querySelector(
      "button[aria-label='Expand']"
    ) as HTMLButtonElement | null;
    expect(expandButton).toBeTruthy();
    await user.click(expandButton as HTMLButtonElement);

    expect(within(treeGrid).getAllByText("Project A").length).toBeGreaterThan(0);
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    const expanded = onExpandedChange.mock.calls[0]?.[0] as Set<TreeKey>;
    expect(expanded.has("projects")).toBe(true);

    const collapseButton = treeGrid.querySelector(
      "button[aria-label='Collapse']"
    ) as HTMLButtonElement | null;
    expect(collapseButton).toBeTruthy();
    await user.click(collapseButton as HTMLButtonElement);
    expect(within(treeGrid).queryByText("Project A")).toBeNull();
  });

  it("supports keyboard navigation and selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderTree({
      selectionMode: "single",
      defaultExpandedKeys: ["projects"],
      autoFocus: "first",
      onSelectionChange,
    });

    const treeGrid = tree.getByRole("treegrid", { name: "Tree" });
    const rows = within(treeGrid).getAllByRole("row");

    treeGrid.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(rows[1]);

    await user.keyboard("{Enter}");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const selected = onSelectionChange.mock.calls[0]?.[0] as Set<TreeKey>;
    expect(selected.has("project-a")).toBe(true);
  });

  it("supports controlled selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderTree({
      selectionMode: "single",
      selectedKeys: ["projects"],
      onSelectionChange,
    });

    const treeGrid = tree.getByRole("treegrid", { name: "Tree" });
    const rows = within(treeGrid).getAllByRole("row");

    await user.click(rows[1] as HTMLElement);

    expect(rows[0]?.getAttribute("aria-selected")).toBe("true");
    expect(rows[1]?.getAttribute("aria-selected")).toBe("false");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    const selected = onSelectionChange.mock.calls[0]?.[0] as Set<TreeKey>;
    expect(selected.has("photos")).toBe(true);
  });

  it("renders slot content for rows", () => {
    const tree = renderTree(
      {
        defaultExpandedKeys: ["projects"],
      },
      {
        slots: {
          default: ({ item }) =>
            h(
              "span",
              {
                "data-testid": `row-${String(item.id ?? item.key)}`,
              },
              item.name ?? item.textValue
            ),
        },
      }
    );

    expect(tree.getByTestId("row-projects")).toBeTruthy();
    expect(tree.getByTestId("row-project-a")).toBeTruthy();
  });

  it("renders empty state", () => {
    const tree = render(TreeView, {
      props: {
        "aria-label": "Tree",
        items: [],
        renderEmptyState: () => "Nothing here",
      },
    });

    expect(tree.getByText("Nothing here")).toBeTruthy();
  });

  it("supports falsy ids", () => {
    const tree = render(TreeView, {
      props: {
        "aria-label": "Tree",
        items: [
          { id: 0, name: "Zero" },
          { id: "", name: "Empty" },
        ],
      },
    });

    const rows = tree.getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(rows[0]?.textContent).toContain("Zero");
    expect(rows[1]?.textContent).toContain("Empty");
  });
});
