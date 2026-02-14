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
}
