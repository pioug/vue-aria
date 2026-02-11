import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { ListView, type SpectrumListViewItemData } from "../src";
import { ListViewItem } from "../src";

const baseItems: SpectrumListViewItemData[] = [
  { key: "foo", label: "Foo" },
  { key: "bar", label: "Bar" },
  { key: "baz", label: "Baz" },
];

const manyItems: SpectrumListViewItemData[] = Array.from({ length: 30 }, (_, index) => ({
  key: `item-${index + 1}`,
  label: `Item ${index + 1}`,
}));

function renderComponent(props: Record<string, unknown> = {}) {
  return render(ListView, {
    props: {
      items: baseItems,
      "aria-label": "List",
      ...props,
    },
  });
}

describe("ListView", () => {
  it("renders dynamic list rows", () => {
    const tree = renderComponent();
    const grid = tree.getByRole("grid", { name: "List" });

    expect(grid.getAttribute("aria-rowcount")).toBe("3");
    expect(grid.getAttribute("aria-colcount")).toBe("1");

    const rows = within(grid).getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(rows[0]?.textContent).toContain("Foo");
    expect(rows[1]?.textContent).toContain("Bar");
    expect(rows[2]?.textContent).toContain("Baz");

    const cells = within(rows[0] as HTMLElement).getAllByRole("gridcell");
    expect(cells).toHaveLength(1);
    expect(cells[0]?.textContent).toContain("Foo");
    expect(cells[0]?.getAttribute("aria-colindex")).toBe("1");
  });

  it("renders falsy ids", () => {
    const tree = render(ListView, {
      props: {
        "aria-label": "List",
        items: [
          { id: 0, label: "Zero" },
          { id: "", label: "Empty" },
        ],
      },
    });

    const rows = tree.getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(rows[0]?.textContent).toContain("Zero");
    expect(rows[1]?.textContent).toContain("Empty");
  });

  it("moves focus with ArrowDown and ArrowUp", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({ autoFocus: "first", selectionMode: "single" });
    const rows = tree.getAllByRole("row");

    (rows[0] as HTMLElement).focus();
    expect(document.activeElement).toBe(rows[0]);

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(rows[1]);

    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(rows[0]);
  });

  it("supports single selection (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "single",
      defaultSelectedKeys: ["bar"],
      onSelectionChange,
    });

    const rows = tree.getAllByRole("row");
    expect(rows[1]?.getAttribute("aria-selected")).toBe("true");

    await user.click(rows[2] as HTMLElement);
    expect(rows[2]?.getAttribute("aria-selected")).toBe("true");
    expect(rows[1]?.getAttribute("aria-selected")).toBe("false");

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const keys = onSelectionChange.mock.calls[0]?.[0] as Set<string>;
    expect(keys.has("baz")).toBe(true);
  });

  it("supports controlled selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "single",
      selectedKeys: ["bar"],
      onSelectionChange,
    });

    const rows = tree.getAllByRole("row");
    await user.click(rows[0] as HTMLElement);

    expect(rows[1]?.getAttribute("aria-selected")).toBe("true");
    expect(rows[0]?.getAttribute("aria-selected")).toBe("false");

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const keys = onSelectionChange.mock.calls[0]?.[0] as Set<string>;
    expect(keys.has("foo")).toBe(true);
  });

  it("supports multiple selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "multiple",
      onSelectionChange,
    });

    const grid = tree.getByRole("grid", { name: "List" });
    expect(grid.getAttribute("aria-multiselectable")).toBe("true");

    const rows = tree.getAllByRole("row");
    await user.click(rows[0] as HTMLElement);
    await user.click(rows[1] as HTMLElement);

    expect(rows[0]?.getAttribute("aria-selected")).toBe("true");
    expect(rows[1]?.getAttribute("aria-selected")).toBe("true");

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    const keys = onSelectionChange.mock.calls[1]?.[0] as Set<string>;
    expect(keys.has("foo")).toBe(true);
    expect(keys.has("bar")).toBe(true);
  });

  it("disables rows and skips disabled keys with keyboard", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      selectionMode: "single",
      disabledKeys: ["bar"],
      autoFocus: "first",
    });

    const rows = tree.getAllByRole("row");
    expect(rows[1]?.getAttribute("aria-disabled")).toBe("true");

    (rows[0] as HTMLElement).focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(rows[2]);
  });

  it("calls onLoadMore when scrolling to the bottom", async () => {
    const onLoadMore = vi.fn();
    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "grid") {
          return 2000;
        }
        return 0;
      });
    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "grid") {
          return 400;
        }
        return 0;
      });

    try {
      const tree = render(ListView, {
        props: {
          "aria-label": "List",
          items: manyItems,
          onLoadMore,
        },
      });

      const grid = tree.getByRole("grid", { name: "List" });
      (grid as HTMLElement).scrollTop = 2000;
      fireEvent.scroll(grid);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("does not call onLoadMore while loading", async () => {
    const onLoadMore = vi.fn();
    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "grid") {
          return 2000;
        }
        return 0;
      });
    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "grid") {
          return 400;
        }
        return 0;
      });

    try {
      const tree = render(ListView, {
        props: {
          "aria-label": "List",
          items: manyItems,
          loadingState: "loading",
          onLoadMore,
        },
      });

      const grid = tree.getByRole("grid", { name: "List" });
      (grid as HTMLElement).scrollTop = 2000;
      fireEvent.scroll(grid);

      expect(onLoadMore).not.toHaveBeenCalled();
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("renders loading and empty states", () => {
    const loadingTree = render(ListView, {
      props: {
        "aria-label": "List",
        loadingState: "loading",
        items: [],
      },
    });

    expect(loadingTree.getByRole("progressbar")).toBeTruthy();

    const emptyTree = render(ListView, {
      props: {
        "aria-label": "List",
        items: [],
        renderEmptyState: () => "No results",
      },
    });

    expect(emptyTree.getByText("No results")).toBeTruthy();
  });

  it("supports static slot syntax with ListViewItem", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const onAction = vi.fn();

    const App = defineComponent({
      name: "ListViewSlotHarness",
      setup() {
        return () =>
          h(
            ListView,
            {
              "aria-label": "List",
              selectionMode: "single",
              onSelectionChange,
              onAction,
            },
            {
              default: () => [
                h(ListViewItem, { id: "first" }, () => "First"),
                h(ListViewItem, { id: "second", isDisabled: true }, () => "Second"),
                h(ListViewItem, { id: "third" }, () => "Third"),
              ],
            }
          );
      },
    });

    const tree = render(App);
    const grid = tree.getByRole("grid", { name: "List" });
    const rows = within(grid).getAllByRole("row");

    expect(rows).toHaveLength(3);
    expect(rows[1]?.getAttribute("aria-disabled")).toBe("true");

    await user.click(rows[0] as HTMLElement);
    expect(rows[0]?.getAttribute("aria-selected")).toBe("true");
    expect(onAction).toHaveBeenCalledWith("first");
    expect(Array.from(onSelectionChange.mock.calls[0][0] as Set<string>)).toEqual(["first"]);
  });

  it("supports custom data attributes", () => {
    const tree = render(ListView, {
      props: {
        "aria-label": "List",
        items: baseItems,
      },
      attrs: {
        "data-testid": "test-grid",
      },
    });

    expect(tree.getByRole("grid", { name: "List" }).getAttribute("data-testid")).toBe(
      "test-grid"
    );
  });
});
