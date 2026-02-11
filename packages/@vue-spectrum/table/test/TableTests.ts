import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { expect, it, vi } from "vitest";
import {
  Cell,
  Column,
  EditableCell,
  Row,
  TableBody,
  TableHeader,
  TableView,
  type SpectrumSortDescriptor,
  type SpectrumTableColumnData,
  type SpectrumTableRowData,
  type TableKey,
} from "../src";

const columns: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", allowsSorting: true, isRowHeader: true },
  { key: "bar", title: "Bar", allowsSorting: true },
  { key: "baz", title: "Baz" },
];

const items: SpectrumTableRowData[] = [
  { key: "row-1", foo: "Foo 1", bar: "Bar 1", baz: "Baz 1" },
  { key: "row-2", foo: "Foo 2", bar: "Bar 2", baz: "Baz 2" },
];

function renderTable(
  props: Record<string, unknown> = {},
  options: { slots?: Record<string, () => unknown> } = {}
) {
  return render(TableView, {
    props: {
      "aria-label": "Table",
      columns,
      items,
      ...props,
    },
    slots: options.slots,
  });
}

export function tableTests() {
  it("renders a static table from columns and items", () => {
    const tree = renderTable();

    const grid = tree.getByRole("grid", { name: "Table" });
    expect(grid.getAttribute("aria-colcount")).toBe("3");

    const rowGroups = within(grid).getAllByRole("rowgroup");
    expect(rowGroups).toHaveLength(2);

    const headers = within(rowGroups[0] as HTMLElement).getAllByRole("columnheader");
    expect(headers).toHaveLength(3);
    expect(headers[0]?.textContent).toContain("Foo");
    expect(headers[1]?.textContent).toContain("Bar");
    expect(headers[2]?.textContent).toContain("Baz");

    const rows = within(rowGroups[1] as HTMLElement).getAllByRole("row");
    expect(rows).toHaveLength(2);

    const firstRowHeaders = within(rows[0] as HTMLElement).getAllByRole("rowheader");
    expect(firstRowHeaders).toHaveLength(1);
    expect(firstRowHeaders[0]?.textContent).toContain("Foo 1");

    const firstRowCells = within(rows[0] as HTMLElement).getAllByRole("gridcell");
    expect(firstRowCells).toHaveLength(2);
    expect(firstRowCells[0]?.textContent).toContain("Bar 1");
    expect(firstRowCells[1]?.textContent).toContain("Baz 1");
  });

  it("supports static slot table syntax", async () => {
    const onAction = vi.fn();

    const App = defineComponent({
      name: "TableSlotApp",
      setup() {
        return () =>
          h(
            TableView,
            {
              "aria-label": "Slot table",
              selectionMode: "single",
              onAction,
            },
            {
              default: () => [
                h(TableHeader, null, {
                  default: () => [
                    h(Column, { id: "foo", isRowHeader: true }, () => "Foo"),
                    h(Column, { id: "bar" }, () => "Bar"),
                    h(Column, { id: "baz" }, () => "Baz"),
                  ],
                }),
                h(TableBody, null, {
                  default: () => [
                    h(Row, { id: "row-1" }, {
                      default: () => [
                        h(Cell, () => "Foo 1"),
                        h(Cell, () => "Bar 1"),
                        h(Cell, () => "Baz 1"),
                      ],
                    }),
                    h(Row, { id: "row-2" }, {
                      default: () => [
                        h(EditableCell, () => "Foo 2"),
                        h(Cell, () => "Bar 2"),
                        h(Cell, () => "Baz 2"),
                      ],
                    }),
                  ],
                }),
              ],
            }
          );
      },
    });

    const user = userEvent.setup();
    const tree = render(App);

    const grid = tree.getByRole("grid", { name: "Slot table" });
    const rowGroups = within(grid).getAllByRole("rowgroup");
    const bodyRows = within(rowGroups[1] as HTMLElement).getAllByRole("row");
    expect(bodyRows[1]?.textContent).toContain("Foo 2");

    await user.click(bodyRows[1] as HTMLElement);
    expect(bodyRows[1]?.getAttribute("aria-selected")).toBe("true");

    fireEvent.dblClick(bodyRows[1] as HTMLElement);
    expect(onAction).toHaveBeenCalledWith("row-2");
  });

  it("supports keyboard row navigation", async () => {
    const user = userEvent.setup();
    const tree = renderTable({ selectionMode: "single", autoFocus: "first" });

    const grid = tree.getByRole("grid", { name: "Table" });
    const rowGroups = within(grid).getAllByRole("rowgroup");
    const bodyRows = within(rowGroups[1] as HTMLElement).getAllByRole("row");

    grid.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(bodyRows[1]);

    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(bodyRows[0]);

    await user.keyboard("{End}");
    expect(document.activeElement).toBe(bodyRows[1]);

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(bodyRows[0]);
  });

  it("supports uncontrolled sorting", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    const tree = renderTable({ onSortChange });
    const grid = tree.getByRole("grid", { name: "Table" });
    const headers = within(grid).getAllByRole("columnheader");

    await user.click(headers[0] as HTMLElement);
    expect(onSortChange).toHaveBeenCalledTimes(1);
    const firstSort = onSortChange.mock.calls[0]?.[0] as SpectrumSortDescriptor;
    expect(firstSort.column).toBe("foo");
    expect(firstSort.direction).toBe("ascending");
    expect(headers[0]?.getAttribute("aria-sort")).toBe("ascending");

    await user.click(headers[0] as HTMLElement);
    const secondSort = onSortChange.mock.calls[1]?.[0] as SpectrumSortDescriptor;
    expect(secondSort.direction).toBe("descending");
  });

  it("supports controlled selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    const tree = renderTable({
      selectionMode: "single",
      selectedKeys: ["row-1"],
      onSelectionChange,
    });

    const grid = tree.getByRole("grid", { name: "Table" });
    const rowGroups = within(grid).getAllByRole("rowgroup");
    const bodyRows = within(rowGroups[1] as HTMLElement).getAllByRole("row");

    expect(bodyRows[0]?.getAttribute("aria-selected")).toBe("true");
    await user.click(bodyRows[1] as HTMLElement);

    expect(bodyRows[0]?.getAttribute("aria-selected")).toBe("true");
    expect(bodyRows[1]?.getAttribute("aria-selected")).toBe("false");

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const next = onSelectionChange.mock.calls[0]?.[0] as Set<TableKey>;
    expect(next.has("row-2")).toBe(true);
  });

  it("renders empty state", () => {
    const tree = renderTable(
      {
        items: [],
        renderEmptyState: () => "No rows",
      },
      {
        slots: {
          emptyState: () => h("span", "No rows"),
        },
      }
    );

    expect(tree.getByText("No rows")).toBeTruthy();
  });

  it("supports falsy ids", () => {
    const tree = render(TableView, {
      props: {
        "aria-label": "Table",
        columns: [
          { key: "foo", title: "Foo" },
          { key: "bar", title: "Bar" },
        ],
        items: [
          { id: 0, foo: "Zero", bar: "Row" },
          { id: "", foo: "Empty", bar: "Key" },
        ],
      },
    });

    const rows = tree.getAllByRole("row");
    expect(rows[1]?.textContent).toContain("Zero");
    expect(rows[2]?.textContent).toContain("Empty");
  });
}
