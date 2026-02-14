import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { expect, it, vi } from "vitest";
import {
  Cell,
  Column,
  EditableCell,
  Row,
  TableBody,
  TableHeader,
  TableView,
  type SpectrumTableColumnData,
  type SpectrumTableRowData,
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

const itemsWithFalsyRowKey: SpectrumTableRowData[] = [
  { key: 0, foo: "Foo 0", bar: "Bar 0", baz: "Baz 0" },
  { key: 1, foo: "Foo 1", bar: "Bar 1", baz: "Baz 1" },
];

function renderTable(props: Record<string, unknown> = {}) {
  return mount(TableView as any, {
    props: {
      "aria-label": "Table",
      columns,
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

export function tableTests() {
  it("renders a static table from columns and items", () => {
    const wrapper = renderTable({ "data-testid": "test" });

    const grid = wrapper.get('[role="grid"]');
    expect(grid.attributes("data-testid")).toBe("test");
    expect(grid.attributes("aria-colcount")).toBe("3");
    expect(grid.attributes("aria-rowcount")).toBe("3");

    const rowGroups = wrapper.findAll('[role="rowgroup"]');
    expect(rowGroups).toHaveLength(2);

    const headerRows = rowGroups[0]!.findAll('[role="row"]');
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0]!.attributes("aria-rowindex")).toBe("1");

    const headers = rowGroups[0]!.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(headers[0]!.attributes("aria-colindex")).toBe("1");
    expect(headers[1]!.attributes("aria-colindex")).toBe("2");
    expect(headers[2]!.attributes("aria-colindex")).toBe("3");
    expect(headers[0]!.text()).toContain("Foo");
    expect(headers[1]!.text()).toContain("Bar");
    expect(headers[2]!.text()).toContain("Baz");
    expect(headers[0]!.attributes("aria-sort")).toBe("none");
    expect(headers[1]!.attributes("aria-sort")).toBe("none");
    expect(headers[2]!.attributes("aria-sort")).toBeUndefined();
    expect(headers[0]!.attributes("aria-describedby")).toBeDefined();
    expect(headers[1]!.attributes("aria-describedby")).toBeDefined();
    expect(headers[2]!.attributes("aria-describedby")).toBeUndefined();

    const rows = rowGroups[1]!.findAll('[role="row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.attributes("aria-rowindex")).toBe("2");
    expect(rows[1]!.attributes("aria-rowindex")).toBe("3");

    const firstRowHeaders = rows[0]!.findAll('[role="rowheader"]');
    expect(firstRowHeaders).toHaveLength(1);
    expect(firstRowHeaders[0]!.attributes("aria-colindex")).toBe("1");
    expect(firstRowHeaders[0]!.text()).toContain("Foo 1");

    const firstRowCells = rows[0]!.findAll('[role="gridcell"]');
    expect(firstRowCells).toHaveLength(2);
    expect(firstRowCells[0]!.attributes("aria-colindex")).toBe("2");
    expect(firstRowCells[1]!.attributes("aria-colindex")).toBe("3");
    expect(firstRowCells[0]!.text()).toContain("Bar 1");
    expect(firstRowCells[1]!.text()).toContain("Baz 1");
  });

  it("supports static slot table syntax", async () => {
    const onAction = vi.fn();

    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Slot table",
        selectionMode: "single",
        selectionStyle: "highlight",
        onAction,
      },
      slots: {
        default: () => [
          h(TableHeader as any, null, {
            default: () => [
              h(Column as any, { id: "foo", isRowHeader: true }, () => "Foo"),
              h(Column as any, { id: "bar" }, () => "Bar"),
              h(Column as any, { id: "baz" }, () => "Baz"),
            ],
          }),
          h(TableBody as any, null, {
            default: () => [
              h(Row as any, { id: "row-1" }, {
                default: () => [
                  h(Cell as any, () => "Foo 1"),
                  h(Cell as any, () => "Bar 1"),
                  h(Cell as any, () => "Baz 1"),
                ],
              }),
              h(Row as any, { id: "row-2" }, {
                default: () => [
                  h(EditableCell as any, () => "Foo 2"),
                  h(Cell as any, () => "Bar 2"),
                  h(Cell as any, () => "Baz 2"),
                ],
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[1]!.text()).toContain("Foo 2");

    await press(bodyRows[1]!);
    await bodyRows[1]!.trigger("dblclick");
    await nextTick();
    expect(onAction).toHaveBeenCalledWith("row-2");
  });

  it("supports keyboard row navigation", async () => {
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
    });

    const grid = wrapper.get('[role="grid"]');
    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    expect(grid.element.contains(document.activeElement)).toBe(true);

    await bodyRows[0]!.trigger("keydown", { key: "ArrowUp" });
    await nextTick();
    expect(grid.element.contains(document.activeElement)).toBe(true);

    await grid.trigger("keydown", { key: "End" });
    await nextTick();
    expect(grid.element.contains(document.activeElement)).toBe(true);

    await grid.trigger("keydown", { key: "Home" });
    await nextTick();
    expect(grid.element.contains(document.activeElement)).toBe(true);
  });

  it("supports row selection callbacks", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[1]!);

    expect(onSelectionChange).toHaveBeenCalled();
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has("row-2")).toBe(true);
  });

  it("updates aria-selected on uncontrolled pointer selection", async () => {
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[1]!);

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("supports default selected keys initialization", () => {
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      defaultSelectedKeys: new Set(["row-2"]),
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("prevents selecting disabled rows via pointer", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      disabledKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[1]!);

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("updates selection when controlled selectedKeys changes", async () => {
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      selectedKeys: new Set(["row-1"]),
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");

    await wrapper.setProps({
      selectedKeys: new Set(["row-2"]),
    });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("emits controlled selection changes without mutating rendered state", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      selectedKeys: new Set(["row-1"]),
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[1]!);

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has("row-2")).toBe(true);

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("supports UNSAFE className passthrough", () => {
    const wrapper = renderTable({
      UNSAFE_className: "test-class",
    });

    expect(wrapper.get('[role="grid"]').attributes("class")).toContain("test-class");
  });

  it("supports UNSAFE style passthrough", () => {
    const wrapper = renderTable({
      UNSAFE_style: { width: "320px" },
    });

    expect(wrapper.get('[role="grid"]').attributes("style")).toContain("width: 320px");
  });

  it("preserves falsy numeric row keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithFalsyRowKey,
      selectionMode: "single",
      selectionStyle: "highlight",
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[0]!);

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<number> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has(0)).toBe(true);
  });

  it("renders empty state content when no rows are present", () => {
    const wrapper = renderTable({
      items: [],
      renderEmptyState: () => "No rows",
    });

    const emptyCell = wrapper.get("tbody .react-spectrum-Table-empty");
    expect(emptyCell.text()).toContain("No rows");
    expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(1);
  });

  it("supports sorting callbacks and aria-sort updates", async () => {
    const onSortChange = vi.fn();
    const wrapper = renderTable({ onSortChange });

    const headers = wrapper.findAll('[role="columnheader"]');
    await press(headers[0]!);

    expect(onSortChange).toHaveBeenCalledWith({
      column: "foo",
      direction: "ascending",
    });
  });

  it("toggles sorting direction when pressing the same header", async () => {
    const onSortChange = vi.fn();
    const wrapper = renderTable({ onSortChange });

    const headers = wrapper.findAll('[role="columnheader"]');
    await press(headers[0]!);
    await press(headers[0]!);

    expect(onSortChange).toHaveBeenNthCalledWith(1, {
      column: "foo",
      direction: "ascending",
    });
    expect(onSortChange).toHaveBeenNthCalledWith(2, {
      column: "foo",
      direction: "descending",
    });
    expect(wrapper.findAll('[role="columnheader"]')[0]!.attributes("aria-sort")).toBe("descending");
  });

  it("resets sort direction when switching to a different column", async () => {
    const onSortChange = vi.fn();
    const wrapper = renderTable({ onSortChange });

    const headers = wrapper.findAll('[role="columnheader"]');
    await press(headers[0]!);
    await press(headers[1]!);

    expect(onSortChange).toHaveBeenNthCalledWith(1, {
      column: "foo",
      direction: "ascending",
    });
    expect(onSortChange).toHaveBeenNthCalledWith(2, {
      column: "bar",
      direction: "ascending",
    });
  });

  it("supports default sort descriptor initialization", () => {
    const wrapper = renderTable({
      defaultSortDescriptor: {
        column: "foo",
        direction: "descending",
      },
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers[0]!.attributes("aria-sort")).toBe("descending");
    expect(wrapper.findAll('tbody [role="row"]')[0]!.text()).toContain("Foo 2");
  });

  it("updates sorting when controlled sortDescriptor changes", async () => {
    const wrapper = renderTable({
      sortDescriptor: {
        column: "foo",
        direction: "ascending",
      },
    });

    let headers = wrapper.findAll('[role="columnheader"]');
    expect(headers[0]!.attributes("aria-sort")).toBe("ascending");
    expect(headers[1]!.attributes("aria-sort")).toBe("none");

    await wrapper.setProps({
      sortDescriptor: {
        column: "bar",
        direction: "descending",
      },
    });
    await nextTick();

    headers = wrapper.findAll('[role="columnheader"]');
    expect(headers[0]!.attributes("aria-sort")).toBe("none");
    expect(headers[1]!.attributes("aria-sort")).toBe("descending");
    expect(wrapper.findAll('tbody [role="row"]')[0]!.text()).toContain("Foo 2");
  });

  it("emits controlled sort changes without mutating rendered state", async () => {
    const onSortChange = vi.fn();
    const wrapper = renderTable({
      sortDescriptor: {
        column: "foo",
        direction: "ascending",
      },
      onSortChange,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    await press(headers[0]!);

    expect(onSortChange).toHaveBeenCalledWith({
      column: "foo",
      direction: "descending",
    });
    expect(wrapper.findAll('[role="columnheader"]')[0]!.attributes("aria-sort")).toBe("ascending");
  });
}
