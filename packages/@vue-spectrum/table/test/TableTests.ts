import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
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
  type TableKey,
} from "../src";

const columns: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", allowsSorting: true, isRowHeader: true },
  { key: "bar", title: "Bar", allowsSorting: true },
  { key: "baz", title: "Baz" },
];

const columnsWithoutMiddle: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", allowsSorting: true, isRowHeader: true },
  { key: "baz", title: "Baz" },
];

const columnsWithExtra: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", allowsSorting: true, isRowHeader: true },
  { key: "bar", title: "Bar", allowsSorting: true },
  { key: "baz", title: "Baz" },
  { key: "qux", title: "Qux" },
];

const columnsForDynamicWidthPair: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true },
  { key: "bar", title: "Bar" },
];

const columnsWithMultipleRowHeaders: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true },
  { key: "bar", title: "Bar", isRowHeader: true },
  { key: "baz", title: "Baz" },
];

const columnsWithAlignment: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true },
  { key: "bar", title: "Bar", align: "center" },
  { key: "baz", title: "Baz", align: "end" },
];

const columnsWithHeaderDisplayMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true },
  { key: "bar", title: "Bar", hideHeader: true, showDivider: true },
  { key: "baz", title: "Baz", showDivider: true },
];

const columnsWithSizingMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: 200 },
  { key: "bar", title: "Bar", minWidth: 150 },
  { key: "baz", title: "Baz", maxWidth: 300 },
];

const columnsWithStringSizingMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: "25%" },
  { key: "bar", title: "Bar", minWidth: "12rem" },
  { key: "baz", title: "Baz", maxWidth: "40ch" },
];

const columnsWithPercentageSizingMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: "10%" },
  { key: "bar", title: "Bar", width: 500 },
  { key: "baz", title: "Baz" },
];

const columnsWithPartialSizingMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: 200 },
  { key: "bar", title: "Bar" },
  { key: "baz", title: "Baz" },
];

const columnsWithMinWidthConstraint: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: 200 },
  { key: "bar", title: "Bar", minWidth: 500 },
  { key: "baz", title: "Baz" },
];

const columnsWithMaxWidthConstraint: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: 200 },
  { key: "bar", title: "Bar", maxWidth: 300 },
  { key: "baz", title: "Baz" },
];

const columnsWithClampedExplicitWidth: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: 100, minWidth: 200 },
  { key: "bar", title: "Bar" },
  { key: "baz", title: "Baz" },
];

const columnsWithClampedMaxExplicitWidth: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: 500, maxWidth: 300 },
  { key: "bar", title: "Bar" },
  { key: "baz", title: "Baz" },
];

const columnsWithWithinMaxExplicitWidth: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: 200, maxWidth: 500 },
  { key: "bar", title: "Bar" },
  { key: "baz", title: "Baz" },
];

const columnsWithDynamicBeforeBoundedMax: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, allowsResizing: true },
  { key: "bar", title: "Bar", maxWidth: 200 },
  { key: "baz", title: "Baz", maxWidth: 200 },
];

const columnsWithMixedBoundsAndDynamic: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, allowsResizing: true, minWidth: 100 },
  { key: "bar", title: "Bar", minWidth: 500 },
  { key: "baz", title: "Baz", maxWidth: 200 },
];

const columnsWithDefaultWidthMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, defaultWidth: 200 },
  { key: "bar", title: "Bar" },
  { key: "baz", title: "Baz" },
];

const columnsWithPercentageDefaultWidthMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, defaultWidth: "20%" },
  { key: "bar", title: "Bar", defaultWidth: 300 },
  { key: "baz", title: "Baz" },
];

const columnsWithFractionalDefaultWidthMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, defaultWidth: "1fr" },
  { key: "bar", title: "Bar", defaultWidth: "2fr" },
  { key: "baz", title: "Baz", defaultWidth: "1fr" },
];

const columnsWithMixedFractionalSizingMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, width: 200 },
  { key: "bar", title: "Bar", defaultWidth: "1fr" },
  { key: "baz", title: "Baz", defaultWidth: "3fr" },
];

const columnsWithResizableMetadata: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, allowsResizing: true, defaultWidth: 220 },
  { key: "bar", title: "Bar", defaultWidth: 390 },
  { key: "baz", title: "Baz", allowsResizing: true, hideHeader: true, defaultWidth: 390 },
];

const columnsWithResizableConstraints: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, allowsResizing: true, defaultWidth: 220, minWidth: 210, maxWidth: 225 },
  { key: "bar", title: "Bar", defaultWidth: 390 },
  { key: "baz", title: "Baz", defaultWidth: 390 },
];

const columnsWithResizableFractionalWidths: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, allowsResizing: true, defaultWidth: "1fr" },
  { key: "bar", title: "Bar", defaultWidth: "1fr" },
  { key: "baz", title: "Baz", defaultWidth: "2fr" },
];

const columnsWithControlledResizableWidth: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, allowsResizing: true, width: 220 },
  { key: "bar", title: "Bar", defaultWidth: "1fr" },
  { key: "baz", title: "Baz", defaultWidth: "1fr" },
];

const columnsWithResizablePair: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true, allowsResizing: true, defaultWidth: "1fr" },
  { key: "bar", title: "Bar", defaultWidth: "1fr" },
];

const items: SpectrumTableRowData[] = [
  { key: "row-1", foo: "Foo 1", bar: "Bar 1", baz: "Baz 1" },
  { key: "row-2", foo: "Foo 2", bar: "Bar 2", baz: "Baz 2" },
];

const itemsWithThreeRows: SpectrumTableRowData[] = [
  { key: "row-1", foo: "Foo 1", bar: "Bar 1", baz: "Baz 1" },
  { key: "row-2", foo: "Foo 2", bar: "Bar 2", baz: "Baz 2" },
  { key: "row-3", foo: "Foo 3", bar: "Bar 3", baz: "Baz 3" },
];

const itemsWithFourRows: SpectrumTableRowData[] = [
  ...itemsWithThreeRows,
  { key: "row-4", foo: "Foo 4", bar: "Bar 4", baz: "Baz 4" },
];

const itemsWithFourRowsWithoutSecond: SpectrumTableRowData[] = [
  itemsWithFourRows[0]!,
  itemsWithFourRows[2]!,
  itemsWithFourRows[3]!,
];

const itemsWithThreeRowsEdited: SpectrumTableRowData[] = [
  itemsWithThreeRows[0]!,
  { key: "row-2", foo: "Foo 2 edited", bar: "Bar 2 edited", baz: "Baz 2 edited" },
  itemsWithThreeRows[2]!,
];

const itemsWithDisabledFlag: SpectrumTableRowData[] = [
  { key: "row-1", foo: "Foo 1", bar: "Bar 1", baz: "Baz 1" },
  { key: "row-2", foo: "Foo 2", bar: "Bar 2", baz: "Baz 2", isDisabled: true },
];

const itemsWithThreeRowsMiddleDisabled: SpectrumTableRowData[] = [
  { key: "row-1", foo: "Foo 1", bar: "Bar 1", baz: "Baz 1" },
  { key: "row-2", foo: "Foo 2", bar: "Bar 2", baz: "Baz 2", isDisabled: true },
  { key: "row-3", foo: "Foo 3", bar: "Bar 3", baz: "Baz 3" },
];

const itemsWithFalsyRowKey: SpectrumTableRowData[] = [
  { key: 0, foo: "Foo 0", bar: "Bar 0", baz: "Baz 0" },
  { key: 1, foo: "Foo 1", bar: "Bar 1", baz: "Baz 1" },
];

const itemsWithIdOnly: SpectrumTableRowData[] = [
  { id: "id-1", foo: "Foo A", bar: "Bar A", baz: "Baz A" },
  { id: "id-2", foo: "Foo B", bar: "Bar B", baz: "Baz B" },
];

const itemsWithEmptyStringId: SpectrumTableRowData[] = [
  { id: "", foo: "Foo Empty", bar: "Bar Empty", baz: "Baz Empty" },
  { id: "id-2", foo: "Foo B", bar: "Bar B", baz: "Baz B" },
];

const columnsWithSpan: SpectrumTableColumnData[] = [
  { key: "col-1", title: "Col 1", isRowHeader: true },
  { key: "col-2", title: "Col 2" },
  { key: "col-3", title: "Col 3" },
  { key: "col-4", title: "Col 4" },
];

const sortableColumnsWithSpan: SpectrumTableColumnData[] = [
  { key: "col-1", title: "Col 1", isRowHeader: true, allowsSorting: true },
  { key: "col-2", title: "Col 2", allowsSorting: true },
  { key: "col-3", title: "Col 3", allowsSorting: true },
  { key: "col-4", title: "Col 4", allowsSorting: true },
];

const itemsWithPropSpanCells: SpectrumTableRowData[] = [
  {
    key: "row-1",
    cells: [
      { value: "Cell 1" },
      { value: "Span 2", colSpan: 2 },
      { value: "Cell 4" },
    ],
  },
];

const itemsWithStringPropSpanCells: SpectrumTableRowData[] = [
  {
    key: "row-1",
    cells: [
      { value: "Cell 1" },
      { value: "Span 2", colSpan: "2" as any },
      { value: "Cell 4" },
    ],
  },
];

const sortableItemsWithPropSpanCells: SpectrumTableRowData[] = [
  {
    key: "row-a",
    cells: [
      { value: "Alpha" },
      { value: "Span A", colSpan: 2 },
      { value: "A" },
    ],
  },
  {
    key: "row-z",
    cells: [
      { value: "Zulu" },
      { value: "Span Z", colSpan: 2 },
      { value: "Z" },
    ],
  },
];

const unsortedSortableItemsWithPropSpanCells: SpectrumTableRowData[] = [
  sortableItemsWithPropSpanCells[1]!,
  sortableItemsWithPropSpanCells[0]!,
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

async function press(
  target: { trigger: (event: string, options?: Record<string, unknown>) => Promise<unknown> },
  options: Record<string, unknown> = {}
) {
  await target.trigger("pointerdown", {
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
    ...options,
  });
  await target.trigger("pointerup", {
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
    ...options,
  });
  await target.trigger("click", { button: 0, ...options });
  await nextTick();
}

function readDescriptionText(ids: string | undefined): string {
  if (!ids) {
    return "";
  }

  return ids
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ")
    .trim();
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
    expect(rowGroups[0]!.classes()).toContain("spectrum-Table-head");
    expect(rowGroups[1]!.classes()).toContain("spectrum-Table-body");

    const headerRows = rowGroups[0]!.findAll('[role="row"]');
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0]!.attributes("aria-rowindex")).toBe("1");
    expect(headerRows[0]!.classes()).toContain("spectrum-Table-headRow");

    const headers = rowGroups[0]!.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(headers[0]!.attributes("aria-colindex")).toBe("1");
    expect(headers[1]!.attributes("aria-colindex")).toBe("2");
    expect(headers[2]!.attributes("aria-colindex")).toBe("3");
    expect(headers[0]!.text()).toContain("Foo");
    expect(headers[1]!.text()).toContain("Bar");
    expect(headers[2]!.text()).toContain("Baz");
    expect(headers[0]!.find(".spectrum-Table-headCellContents").exists()).toBe(true);
    expect(headers[1]!.find(".spectrum-Table-headCellContents").exists()).toBe(true);
    expect(headers[2]!.find(".spectrum-Table-headCellContents").exists()).toBe(true);
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
    expect(firstRowCells[0]!.find(".spectrum-Table-cellContents").exists()).toBe(true);
    expect(firstRowCells[1]!.find(".spectrum-Table-cellContents").exists()).toBe(true);
  });

  it("applies default visual classes", () => {
    const wrapper = renderTable();
    const grid = wrapper.get('[role="grid"]');

    expect(grid.classes()).toContain("spectrum-Table");
    expect(grid.classes()).toContain("react-spectrum-Table");
    expect(grid.classes()).toContain("spectrum-Table--regular");
    expect(grid.classes()).not.toContain("spectrum-Table--quiet");
    expect(grid.classes()).not.toContain("spectrum-Table--wrap");
  });

  it("applies quiet/density/overflow visual classes", () => {
    const wrapper = renderTable({
      isQuiet: true,
      density: "compact",
      overflowMode: "wrap",
    });
    const grid = wrapper.get('[role="grid"]');

    expect(grid.classes()).toContain("spectrum-Table");
    expect(grid.classes()).toContain("spectrum-Table--compact");
    expect(grid.classes()).toContain("spectrum-Table--quiet");
    expect(grid.classes()).toContain("spectrum-Table--wrap");
  });

  it("does not throw when selection mode changes in wrap overflow with controlled selection", async () => {
    const wrapper = renderTable({
      overflowMode: "wrap",
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
    });

    await wrapper.setProps({
      selectionMode: "single",
      selectionStyle: "highlight",
      selectedKeys: new Set(["row-1"]),
    });
    await nextTick();

    await wrapper.setProps({
      selectionMode: "none",
      selectedKeys: new Set(),
    });
    await nextTick();

    expect(wrapper.get('[role="grid"]').classes()).toContain("spectrum-Table--wrap");
  });

  it("applies spectrum header and body cell classes", () => {
    const wrapper = renderTable();

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(headers[0]!.classes()).toContain("spectrum-Table-headCell");
    expect(headers[0]!.classes()).toContain("react-spectrum-Table-cell");

    const firstBodyRow = wrapper.findAll('tbody [role="row"]')[0]!;
    const rowHeaderCell = firstBodyRow.find('[role="rowheader"]');
    const bodyCells = firstBodyRow.findAll('[role="gridcell"]');
    expect(rowHeaderCell.classes()).toContain("spectrum-Table-cell");
    expect(bodyCells[0]!.classes()).toContain("spectrum-Table-cell");
  });

  it("supports removing columns via reactive prop updates", async () => {
    const wrapper = renderTable();

    let headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(wrapper.get('[role="grid"]').attributes("aria-colcount")).toBe("3");

    await wrapper.setProps({
      columns: columnsWithoutMiddle,
    });
    await nextTick();

    headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(2);
    expect(headers[0]!.text()).toContain("Foo");
    expect(headers[1]!.text()).toContain("Baz");
    expect(wrapper.get('[role="grid"]').attributes("aria-colcount")).toBe("2");

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.findAll('[role="rowheader"]')).toHaveLength(1);
    expect(bodyRows[0]!.findAll('[role="gridcell"]')).toHaveLength(1);
    expect(bodyRows[0]!.text()).toContain("Foo 1");
    expect(bodyRows[0]!.text()).toContain("Baz 1");
    expect(bodyRows[0]!.text()).not.toContain("Bar 1");
  });

  it("supports adding columns via reactive prop updates", async () => {
    const wrapper = renderTable({
      columns: columnsWithoutMiddle,
    });

    let headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(2);
    expect(wrapper.get('[role="grid"]').attributes("aria-colcount")).toBe("2");

    await wrapper.setProps({
      columns: columnsWithExtra,
      items: [
        { key: "row-1", foo: "Foo 1", bar: "Bar 1", baz: "Baz 1", qux: "Qux 1" },
        { key: "row-2", foo: "Foo 2", bar: "Bar 2", baz: "Baz 2", qux: "Qux 2" },
      ],
    });
    await nextTick();

    headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(4);
    expect(headers[3]!.text()).toContain("Qux");
    expect(wrapper.get('[role="grid"]').attributes("aria-colcount")).toBe("4");

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.findAll('[role="rowheader"]')).toHaveLength(1);
    expect(bodyRows[0]!.findAll('[role="gridcell"]')).toHaveLength(3);
    expect(bodyRows[0]!.text()).toContain("Foo 1");
    expect(bodyRows[0]!.text()).toContain("Bar 1");
    expect(bodyRows[0]!.text()).toContain("Baz 1");
    expect(bodyRows[0]!.text()).toContain("Qux 1");
  });

  it("supports adding rows via reactive item updates", async () => {
    const wrapper = renderTable();

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await wrapper.setProps({ items: itemsWithThreeRows });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);
    expect(bodyRows[2]!.text()).toContain("Foo 3");
    expect(bodyRows[2]!.text()).toContain("Bar 3");
    expect(bodyRows[2]!.text()).toContain("Baz 3");
  });

  it("supports removing rows via reactive item updates", async () => {
    const wrapper = renderTable({ items: itemsWithFourRows });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(4);

    await wrapper.setProps({ items: itemsWithThreeRows });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);
    expect(wrapper.text()).not.toContain("Foo 4");
  });

  it("resets body row indexes after removing a row", async () => {
    const wrapper = renderTable({ items: itemsWithFourRows });

    await wrapper.setProps({ items: itemsWithFourRowsWithoutSecond });
    await nextTick();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);
    expect(bodyRows[0]!.attributes("aria-rowindex")).toBe("2");
    expect(bodyRows[1]!.attributes("aria-rowindex")).toBe("3");
    expect(bodyRows[2]!.attributes("aria-rowindex")).toBe("4");
    expect(bodyRows[0]!.text()).toContain("Foo 1");
    expect(bodyRows[1]!.text()).toContain("Foo 3");
    expect(bodyRows[2]!.text()).toContain("Foo 4");
  });

  it("supports editing row content via reactive item updates", async () => {
    const wrapper = renderTable({ items: itemsWithThreeRows });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[1]!.text()).toContain("Foo 2");

    await wrapper.setProps({ items: itemsWithThreeRowsEdited });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[1]!.text()).toContain("Foo 2 edited");
    expect(bodyRows[1]!.text()).toContain("Bar 2 edited");
    expect(bodyRows[1]!.text()).toContain("Baz 2 edited");
  });

  it("recomputes distributed widths when columns are removed and added", async () => {
    const wrapper = renderTable({
      columns: columnsForDynamicWidthPair,
      items: [
        { key: "row-1", foo: "Foo 1", bar: "Bar 1" },
        { key: "row-2", foo: "Foo 2", bar: "Bar 2" },
      ],
    });

    const headerWidths = () =>
      wrapper
        .findAll('thead [role="columnheader"]')
        .map((header) => parseFloat((header.element as HTMLElement).style.width));

    let widths = headerWidths();
    expect(widths).toHaveLength(2);
    expect(widths[0]!).toBeCloseTo(500, 3);
    expect(widths[1]!).toBeCloseTo(500, 3);

    await wrapper.setProps({
      columns,
      items,
    });
    await nextTick();

    widths = headerWidths();
    expect(widths).toHaveLength(3);
    expect(widths[0]!).toBeCloseTo(333, 0);
    expect(widths[1]!).toBeCloseTo(333, 0);
    expect(widths[2]!).toBeCloseTo(333, 0);

    await wrapper.setProps({
      columns: columnsForDynamicWidthPair,
      items: [
        { key: "row-1", foo: "Foo 1", bar: "Bar 1" },
        { key: "row-2", foo: "Foo 2", bar: "Bar 2" },
      ],
    });
    await nextTick();

    widths = headerWidths();
    expect(widths).toHaveLength(2);
    expect(widths[0]!).toBeCloseTo(500, 3);
    expect(widths[1]!).toBeCloseTo(500, 3);
  });

  it("resets uncontrolled resize widths when resizable columns are removed and added", async () => {
    const wrapper = renderTable({
      columns: columnsWithResizableFractionalWidths,
    });

    const readWidths = () =>
      wrapper
        .findAll('thead [role="columnheader"]')
        .map((header) => parseFloat((header.element as HTMLElement).style.width));

    const resizeFirstColumn = async () => {
      const resizer = wrapper.findAll('[role="columnheader"]')[0]!.get(".spectrum-Table-columnResizer");
      await resizer.trigger("keydown", { key: "Enter" });
      await nextTick();
      await resizer.trigger("keydown", { key: "ArrowRight" });
      await nextTick();
      await resizer.trigger("keydown", { key: "Escape" });
      await nextTick();
    };

    let widths = readWidths();
    expect(widths).toHaveLength(3);
    expect(widths[0]!).toBeCloseTo(250, 3);
    expect(widths[1]!).toBeCloseTo(250, 3);
    expect(widths[2]!).toBeCloseTo(500, 3);

    await resizeFirstColumn();
    widths = readWidths();
    expect(widths[0]!).toBeGreaterThan(250);

    await wrapper.setProps({
      columns: columnsWithResizablePair,
      items: [
        { key: "row-1", foo: "Foo 1", bar: "Bar 1" },
        { key: "row-2", foo: "Foo 2", bar: "Bar 2" },
      ],
    });
    await nextTick();

    widths = readWidths();
    expect(widths).toHaveLength(2);
    expect(widths[0]!).toBeCloseTo(500, 3);
    expect(widths[1]!).toBeCloseTo(500, 3);

    await wrapper.setProps({
      columns: columnsWithResizableFractionalWidths,
      items,
    });
    await nextTick();

    widths = readWidths();
    expect(widths).toHaveLength(3);
    expect(widths[0]!).toBeCloseTo(250, 3);
    expect(widths[1]!).toBeCloseTo(250, 3);
    expect(widths[2]!).toBeCloseTo(500, 3);
  });

  it("supports multiple row header columns", () => {
    const wrapper = renderTable({
      columns: columnsWithMultipleRowHeaders,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    const firstRowHeaders = bodyRows[0]!.findAll('[role="rowheader"]');
    expect(firstRowHeaders).toHaveLength(2);
    expect(firstRowHeaders[0]!.attributes("aria-colindex")).toBe("1");
    expect(firstRowHeaders[1]!.attributes("aria-colindex")).toBe("2");

    const firstRowCells = bodyRows[0]!.findAll('[role="gridcell"]');
    expect(firstRowCells).toHaveLength(1);
    expect(firstRowCells[0]!.attributes("aria-colindex")).toBe("3");
  });

  it("applies column alignment classes to headers and cells", () => {
    const wrapper = renderTable({
      columns: columnsWithAlignment,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(headers[1]!.classes()).toContain("react-spectrum-Table-cell--alignCenter");
    expect(headers[2]!.classes()).toContain("react-spectrum-Table-cell--alignEnd");

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    const firstRowCells = bodyRows[0]!.findAll('[role="gridcell"]');
    expect(firstRowCells).toHaveLength(2);
    expect(firstRowCells[0]!.classes()).toContain("react-spectrum-Table-cell--alignCenter");
    expect(firstRowCells[1]!.classes()).toContain("react-spectrum-Table-cell--alignEnd");
  });

  it("applies hide-header and divider column classes", () => {
    const wrapper = renderTable({
      columns: columnsWithHeaderDisplayMetadata,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(headers[1]!.classes()).toContain("spectrum-Table-cell--hideHeader");
    expect(headers[1]!.find(".spectrum-Table-visuallyHidden").exists()).toBe(true);

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    const firstRowCells = bodyRows[0]!.findAll('[role="gridcell"]');
    expect(firstRowCells).toHaveLength(2);
    expect(firstRowCells[0]!.classes()).toContain("spectrum-Table-cell--hideHeader");
    expect(firstRowCells[0]!.classes()).toContain("spectrum-Table-cell--divider");
    expect(firstRowCells[1]!.classes()).not.toContain("spectrum-Table-cell--divider");
  });

  it("applies numeric column sizing styles to headers and body cells", () => {
    const wrapper = renderTable({
      columns: columnsWithSizingMetadata,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect((headers[0]!.element as HTMLElement).style.width).toBe("200px");
    expect((headers[1]!.element as HTMLElement).style.minWidth).toBe("150px");
    expect((headers[2]!.element as HTMLElement).style.maxWidth).toBe("300px");

    const firstRow = wrapper.findAll('tbody [role="row"]')[0]!;
    const rowHeader = firstRow.get('[role="rowheader"]');
    const bodyCells = firstRow.findAll('[role="gridcell"]');
    expect((rowHeader.element as HTMLElement).style.width).toBe("200px");
    expect((bodyCells[0]!.element as HTMLElement).style.minWidth).toBe("150px");
    expect((bodyCells[1]!.element as HTMLElement).style.maxWidth).toBe("300px");
  });

  it("applies string column sizing styles to headers and body cells", () => {
    const wrapper = renderTable({
      columns: columnsWithStringSizingMetadata,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(parseFloat((headers[0]!.element as HTMLElement).style.width)).toBeCloseTo(250, 3);
    expect((headers[1]!.element as HTMLElement).style.minWidth).toBe("12rem");
    expect((headers[2]!.element as HTMLElement).style.maxWidth).toBe("40ch");

    const firstRow = wrapper.findAll('tbody [role="row"]')[0]!;
    const rowHeader = firstRow.get('[role="rowheader"]');
    const bodyCells = firstRow.findAll('[role="gridcell"]');
    expect(parseFloat((rowHeader.element as HTMLElement).style.width)).toBeCloseTo(250, 3);
    expect((bodyCells[0]!.element as HTMLElement).style.minWidth).toBe("12rem");
    expect((bodyCells[1]!.element as HTMLElement).style.maxWidth).toBe("40ch");
  });

  it("resolves percentage widths and distributes remaining width", () => {
    const wrapper = renderTable({
      columns: columnsWithPercentageSizingMetadata,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(parseFloat((headers[0]!.element as HTMLElement).style.width)).toBeCloseTo(100, 3);
    expect(parseFloat((headers[1]!.element as HTMLElement).style.width)).toBeCloseTo(500, 3);
    expect(parseFloat((headers[2]!.element as HTMLElement).style.width)).toBeCloseTo(400, 3);
  });

  it("distributes default widths for unsized columns in selectable tables", () => {
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(4);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(38, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo((1000 - 38) / 3, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo((1000 - 38) / 3, 3);
    expect(parseFloat((headerCells[3]!.element as HTMLElement).style.width)).toBeCloseTo((1000 - 38) / 3, 3);

    const firstBodyRowCells = wrapper.findAll('tbody [role="row"]')[0]!.findAll('[role="rowheader"], [role="gridcell"]');
    expect(firstBodyRowCells).toHaveLength(4);
    expect(parseFloat((firstBodyRowCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(38, 3);
    expect(parseFloat((firstBodyRowCells[1]!.element as HTMLElement).style.width)).toBeCloseTo((1000 - 38) / 3, 3);
    expect(parseFloat((firstBodyRowCells[2]!.element as HTMLElement).style.width)).toBeCloseTo((1000 - 38) / 3, 3);
    expect(parseFloat((firstBodyRowCells[3]!.element as HTMLElement).style.width)).toBeCloseTo((1000 - 38) / 3, 3);
  });

  it("divides remaining width among unsized columns after explicit widths", () => {
    const wrapper = renderTable({
      columns: columnsWithPartialSizingMetadata,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(4);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(38, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo((1000 - 38 - 200) / 2, 3);
    expect(parseFloat((headerCells[3]!.element as HTMLElement).style.width)).toBeCloseTo((1000 - 38 - 200) / 2, 3);
  });

  it("respects minWidth constraints while distributing remaining width", () => {
    const wrapper = renderTable({
      columns: columnsWithMinWidthConstraint,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(4);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(38, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(500, 3);
    expect(parseFloat((headerCells[3]!.element as HTMLElement).style.width)).toBeCloseTo(262, 3);
  });

  it("respects maxWidth constraints while distributing remaining width", () => {
    const wrapper = renderTable({
      columns: columnsWithMaxWidthConstraint,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(300, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(500, 3);
  });

  it("clamps explicit widths to minWidth constraints", () => {
    const wrapper = renderTable({
      columns: columnsWithClampedExplicitWidth,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(400, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(400, 3);
  });

  it("clamps explicit widths to maxWidth constraints", () => {
    const wrapper = renderTable({
      columns: columnsWithClampedMaxExplicitWidth,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(300, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(350, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(350, 3);
  });

  it("keeps explicit widths when they are within maxWidth constraints", () => {
    const wrapper = renderTable({
      columns: columnsWithWithinMaxExplicitWidth,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(400, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(400, 3);
  });

  it("allocates remaining width to earlier dynamic columns when later columns are max-bounded", () => {
    const wrapper = renderTable({
      columns: columnsWithDynamicBeforeBoundedMax,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(600, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);

    const bodyCells = wrapper.findAll('tbody [role="row"]')[0]!.findAll('[role="rowheader"], [role="gridcell"]');
    expect(parseFloat((bodyCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(600, 3);
    expect(parseFloat((bodyCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((bodyCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
  });

  it("allocates remaining width to less-bounded dynamic columns when later columns are constrained", () => {
    const wrapper = renderTable({
      columns: columnsWithMixedBoundsAndDynamic,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(300, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(500, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);

    const bodyCells = wrapper.findAll('tbody [role="row"]')[0]!.findAll('[role="rowheader"], [role="gridcell"]');
    expect(parseFloat((bodyCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(300, 3);
    expect(parseFloat((bodyCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(500, 3);
    expect(parseFloat((bodyCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
  });

  it("uses defaultWidth when width is not provided", () => {
    const wrapper = renderTable({
      columns: columnsWithDefaultWidthMetadata,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(400, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(400, 3);
  });

  it("resolves percentage defaultWidth and distributes remaining width", () => {
    const wrapper = renderTable({
      columns: columnsWithPercentageDefaultWidthMetadata,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(300, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(500, 3);
  });

  it("resolves fractional defaultWidth values into proportional widths", () => {
    const wrapper = renderTable({
      columns: columnsWithFractionalDefaultWidthMetadata,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(250, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(500, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(250, 3);
  });

  it("resolves mixed static and fractional sizing values", () => {
    const wrapper = renderTable({
      columns: columnsWithMixedFractionalSizingMetadata,
    });

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(3);
    expect(parseFloat((headerCells[0]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[1]!.element as HTMLElement).style.width)).toBeCloseTo(200, 3);
    expect(parseFloat((headerCells[2]!.element as HTMLElement).style.width)).toBeCloseTo(600, 3);
  });

  it("renders column resizer affordances for resizable headers", () => {
    const wrapper = renderTable({
      columns: columnsWithResizableMetadata,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(headers[0]!.classes()).toContain("is-resizable");
    expect(headers[0]!.find(".spectrum-Table-columnResizer").exists()).toBe(true);
    expect(headers[0]!.find('input[type="range"]').exists()).toBe(true);
    expect(headers[0]!.find(".spectrum-Table-columnResizerPlaceholder").exists()).toBe(true);

    expect(headers[1]!.classes()).not.toContain("is-resizable");
    expect(headers[1]!.find(".spectrum-Table-columnResizer").exists()).toBe(false);

    expect(headers[2]!.classes()).not.toContain("is-resizable");
    expect(headers[2]!.find(".spectrum-Table-columnResizer").exists()).toBe(false);
  });

  it("updates column width and emits callbacks during keyboard resizing", async () => {
    const onResizeStart = vi.fn();
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const wrapper = renderTable({
      columns: columnsWithResizableMetadata,
      onResizeStart,
      onResize,
      onResizeEnd,
    });

    const firstHeader = wrapper.findAll('[role="columnheader"]')[0]!;
    const resizer = firstHeader.get(".spectrum-Table-columnResizer");
    const initialWidth = parseFloat((firstHeader.element as HTMLElement).style.width);

    await resizer.trigger("keydown", { key: "Enter" });
    await nextTick();
    await resizer.trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    await resizer.trigger("keydown", { key: "Escape" });
    await nextTick();

    const updatedFirstHeader = wrapper.findAll('[role="columnheader"]')[0]!;
    const nextWidth = parseFloat((updatedFirstHeader.element as HTMLElement).style.width);
    expect(nextWidth).toBeGreaterThan(initialWidth);
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalledTimes(1);

    const resizeMap = onResize.mock.calls.at(-1)?.[0] as Map<TableKey, number | string> | undefined;
    expect(resizeMap).toBeInstanceOf(Map);
    expect(typeof resizeMap?.get("foo")).toBe("number");
  });

  it("resizes columns through pointer drag interactions", async () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const wrapper = renderTable({
      columns: columnsWithResizableMetadata,
      onResize,
      onResizeEnd,
    });

    const firstHeader = wrapper.findAll('[role="columnheader"]')[0]!;
    const resizer = firstHeader.get(".spectrum-Table-columnResizer");
    const initialWidth = parseFloat((firstHeader.element as HTMLElement).style.width);

    if (typeof PointerEvent !== "undefined") {
      await resizer.trigger("pointerdown", {
        button: 0,
        pointerId: 1,
        pointerType: "mouse",
        clientX: initialWidth,
        pageX: initialWidth,
        clientY: 0,
      });
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 1,
          pointerType: "mouse",
          clientX: initialWidth + 25,
          clientY: 0,
          bubbles: true,
        })
      );
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          button: 0,
          pointerId: 1,
          pointerType: "mouse",
          clientX: initialWidth + 25,
          clientY: 0,
          bubbles: true,
        })
      );
    } else {
      await resizer.trigger("mousedown", {
        button: 0,
        clientX: initialWidth,
        pageX: initialWidth,
        pageY: 0,
      });
      window.dispatchEvent(
        new MouseEvent("mousemove", {
          button: 0,
          clientX: initialWidth + 25,
          bubbles: true,
        })
      );
      window.dispatchEvent(
        new MouseEvent("mouseup", {
          button: 0,
          clientX: initialWidth + 25,
          bubbles: true,
        })
      );
    }

    await nextTick();

    const updatedFirstHeader = wrapper.findAll('[role="columnheader"]')[0]!;
    const nextWidth = parseFloat((updatedFirstHeader.element as HTMLElement).style.width);
    expect(nextWidth).toBeGreaterThan(initialWidth);
    expect(onResize).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalled();
  });

  it("resizes columns through touch pointer interactions", async () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const wrapper = renderTable({
      columns: columnsWithResizableMetadata,
      onResize,
      onResizeEnd,
    });

    const firstHeader = wrapper.findAll('[role="columnheader"]')[0]!;
    const resizer = firstHeader.get(".spectrum-Table-columnResizer");
    const initialWidth = parseFloat((firstHeader.element as HTMLElement).style.width);

    if (typeof PointerEvent === "undefined") {
      return;
    }

    await resizer.trigger("pointerdown", {
      button: 0,
      pointerId: 2,
      pointerType: "touch",
      clientX: initialWidth,
      clientY: 0,
    });
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        pointerId: 2,
        pointerType: "touch",
        clientX: initialWidth + 20,
        clientY: 0,
        bubbles: true,
      })
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        button: 0,
        pointerId: 2,
        pointerType: "touch",
        clientX: initialWidth + 20,
        clientY: 0,
        bubbles: true,
      })
    );
    await nextTick();

    const updatedFirstHeader = wrapper.findAll('[role="columnheader"]')[0]!;
    const nextWidth = parseFloat((updatedFirstHeader.element as HTMLElement).style.width);
    expect(nextWidth).toBeGreaterThan(initialWidth);
    expect(onResize).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalled();
  });

  it("clamps resizing interactions to minWidth and maxWidth", async () => {
    const wrapper = renderTable({
      columns: columnsWithResizableConstraints,
    });

    const header = () => wrapper.findAll('[role="columnheader"]')[0]!;
    const resizer = () => header().get(".spectrum-Table-columnResizer");

    await resizer().trigger("keydown", { key: "Enter" });
    await nextTick();
    await resizer().trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    await resizer().trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    await resizer().trigger("keydown", { key: "Escape" });
    await nextTick();

    let width = parseFloat((header().element as HTMLElement).style.width);
    expect(width).toBeCloseTo(225, 3);

    await resizer().trigger("keydown", { key: "Enter" });
    await nextTick();
    await resizer().trigger("keydown", { key: "ArrowLeft" });
    await nextTick();
    await resizer().trigger("keydown", { key: "ArrowLeft" });
    await nextTick();
    await resizer().trigger("keydown", { key: "Escape" });
    await nextTick();

    width = parseFloat((header().element as HTMLElement).style.width);
    expect(width).toBeCloseTo(210, 3);
  });

  it("redistributes fractional sibling widths when a resizable column changes", async () => {
    const wrapper = renderTable({
      columns: columnsWithResizableFractionalWidths,
    });

    const getHeaders = () => wrapper.findAll('[role="columnheader"]');
    const getResizer = () => getHeaders()[0]!.get(".spectrum-Table-columnResizer");

    const initialHeaders = getHeaders();
    const initialFooWidth = parseFloat((initialHeaders[0]!.element as HTMLElement).style.width);
    const initialBarWidth = parseFloat((initialHeaders[1]!.element as HTMLElement).style.width);
    const initialBazWidth = parseFloat((initialHeaders[2]!.element as HTMLElement).style.width);

    await getResizer().trigger("keydown", { key: "Enter" });
    await nextTick();
    await getResizer().trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    await getResizer().trigger("keydown", { key: "Escape" });
    await nextTick();

    const nextHeaders = getHeaders();
    const nextFooWidth = parseFloat((nextHeaders[0]!.element as HTMLElement).style.width);
    const nextBarWidth = parseFloat((nextHeaders[1]!.element as HTMLElement).style.width);
    const nextBazWidth = parseFloat((nextHeaders[2]!.element as HTMLElement).style.width);

    expect(nextFooWidth).toBeGreaterThan(initialFooWidth);
    expect(nextBarWidth).toBeLessThan(initialBarWidth);
    expect(nextBazWidth).toBeLessThan(initialBazWidth);
  });

  it("keeps controlled column widths stable while emitting resize callbacks", async () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const wrapper = renderTable({
      columns: columnsWithControlledResizableWidth,
      onResize,
      onResizeEnd,
    });

    const getHeader = () => wrapper.findAll('[role="columnheader"]')[0]!;
    const getResizer = () => getHeader().get(".spectrum-Table-columnResizer");
    const initialWidth = parseFloat((getHeader().element as HTMLElement).style.width);

    await getResizer().trigger("keydown", { key: "Enter" });
    await nextTick();
    await getResizer().trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    await getResizer().trigger("keydown", { key: "Escape" });
    await nextTick();

    const nextWidth = parseFloat((getHeader().element as HTMLElement).style.width);
    expect(nextWidth).toBeCloseTo(initialWidth, 3);
    expect(onResize).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalledTimes(1);

    const resizeMap = onResize.mock.calls.at(-1)?.[0] as Map<TableKey, number | string> | undefined;
    expect(resizeMap).toBeInstanceOf(Map);
    expect((resizeMap?.get("foo") as number)).toBeGreaterThan(initialWidth);
  });

  it("ends keyboard resizing on Tab and Shift+Tab", async () => {
    const onResizeEnd = vi.fn();
    const wrapper = renderTable({
      columns: columnsWithResizableMetadata,
      onResizeEnd,
    });

    const getFirstHeader = () => wrapper.findAll('[role="columnheader"]')[0]!;
    const getResizer = () => getFirstHeader().get(".spectrum-Table-columnResizer");

    await getResizer().trigger("keydown", { key: "Enter" });
    await nextTick();
    expect(getFirstHeader().classes()).toContain("is-resizing");

    await getResizer().trigger("keydown", { key: "Tab" });
    await nextTick();
    expect(getFirstHeader().classes()).not.toContain("is-resizing");
    expect(onResizeEnd).toHaveBeenCalledTimes(1);

    await getResizer().trigger("keydown", { key: "Enter" });
    await nextTick();
    expect(getFirstHeader().classes()).toContain("is-resizing");

    await getResizer().trigger("keydown", { key: "Tab", shiftKey: true });
    await nextTick();
    expect(getFirstHeader().classes()).not.toContain("is-resizing");
    expect(onResizeEnd).toHaveBeenCalledTimes(2);
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

  it("does not warn about invoking default slots outside render", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      mount(TableView as any, {
        props: {
          "aria-label": "Slot warning table",
        },
        slots: {
          default: () => [
            h(TableHeader as any, null, {
              default: () => [
                h(Column as any, { id: "foo", isRowHeader: true }, () => "Foo"),
                h(Column as any, { id: "bar" }, () => "Bar"),
              ],
            }),
            h(TableBody as any, null, {
              default: () => [
                h(Row as any, { id: "row-1" }, {
                  default: () => [
                    h(Cell as any, () => "Foo 1"),
                    h(Cell as any, () => "Bar 1"),
                  ],
                }),
              ],
            }),
          ],
        },
        attachTo: document.body,
      });

      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Slot \"default\" invoked outside of the render function")
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("applies column metadata classes in static slot syntax", () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Slot metadata table",
      },
      slots: {
        default: () => [
          h(TableHeader as any, null, {
            default: () => [
              h(Column as any, { id: "foo", isRowHeader: true }, () => "Foo"),
              h(Column as any, { id: "bar", align: "center", hideHeader: true, showDivider: true }, () => "Bar"),
              h(Column as any, { id: "baz", align: "end", showDivider: true }, () => "Baz"),
            ],
          }),
          h(TableBody as any, null, {
            default: () => [
              h(Row as any, { id: "row-1" }, {
                default: () => [
                  h(Cell as any, () => "Alpha"),
                  h(Cell as any, () => "Beta"),
                  h(Cell as any, () => "Gamma"),
                ],
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(3);
    expect(headers[1]!.classes()).toContain("react-spectrum-Table-cell--alignCenter");
    expect(headers[1]!.classes()).toContain("spectrum-Table-cell--hideHeader");
    expect(headers[2]!.classes()).toContain("react-spectrum-Table-cell--alignEnd");

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    const firstRowCells = bodyRows[0]!.findAll('[role="gridcell"]');
    expect(firstRowCells).toHaveLength(2);
    expect(firstRowCells[0]!.classes()).toContain("react-spectrum-Table-cell--alignCenter");
    expect(firstRowCells[0]!.classes()).toContain("spectrum-Table-cell--hideHeader");
    expect(firstRowCells[0]!.classes()).toContain("spectrum-Table-cell--divider");
    expect(firstRowCells[1]!.classes()).toContain("react-spectrum-Table-cell--alignEnd");
    expect(firstRowCells[1]!.classes()).not.toContain("spectrum-Table-cell--divider");
  });

  it("supports kebab-case column metadata props in static slot syntax", () => {
    const TemplateHarness = defineComponent({
      components: {
        TableView,
        TableHeader,
        TableBody,
        Column,
        Row,
        Cell,
      },
      template: `
        <TableView aria-label="Slot kebab metadata table">
          <TableHeader>
            <Column id="foo" is-row-header>Foo</Column>
            <Column id="bar" align="center" hide-header show-divider>Bar</Column>
            <Column id="baz" align="end" show-divider>Baz</Column>
          </TableHeader>
          <TableBody>
            <Row id="row-1">
              <Cell>Alpha</Cell>
              <Cell>Beta</Cell>
              <Cell>Gamma</Cell>
            </Row>
          </TableBody>
        </TableView>
      `,
    });
    const wrapper = mount(TemplateHarness as any, {
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers[1]!.classes()).toContain("spectrum-Table-cell--hideHeader");
    expect(headers[1]!.find(".spectrum-Table-visuallyHidden").exists()).toBe(true);

    const rowHeaderCells = wrapper.findAll('tbody [role="rowheader"]');
    expect(rowHeaderCells).toHaveLength(1);
    expect(rowHeaderCells[0]!.text()).toContain("Alpha");

    const firstRowCells = wrapper.findAll('tbody [role="row"]')[0]!.findAll('[role="gridcell"]');
    expect(firstRowCells[0]!.classes()).toContain("spectrum-Table-cell--hideHeader");
    expect(firstRowCells[0]!.classes()).toContain("spectrum-Table-cell--divider");
  });

  it("supports static slot column sizing metadata", () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Slot sizing table",
      },
      slots: {
        default: () => [
          h(TableHeader as any, null, {
            default: () => [
              h(Column as any, { id: "foo", isRowHeader: true, width: 220 }, () => "Foo"),
              h(Column as any, { id: "bar", minWidth: 180 }, () => "Bar"),
              h(Column as any, { id: "baz", maxWidth: 280 }, () => "Baz"),
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
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect((headers[0]!.element as HTMLElement).style.width).toBe("220px");
    expect((headers[1]!.element as HTMLElement).style.minWidth).toBe("180px");
    expect((headers[2]!.element as HTMLElement).style.maxWidth).toBe("280px");

    const firstRow = wrapper.get('tbody [role="row"]');
    const rowHeader = firstRow.get('[role="rowheader"]');
    const bodyCells = firstRow.findAll('[role="gridcell"]');
    expect((rowHeader.element as HTMLElement).style.width).toBe("220px");
    expect((bodyCells[0]!.element as HTMLElement).style.minWidth).toBe("180px");
    expect((bodyCells[1]!.element as HTMLElement).style.maxWidth).toBe("280px");
  });

  it("supports static slot default-width metadata", () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Slot default-width table",
      },
      slots: {
        default: () => [
          h(TableHeader as any, null, {
            default: () => [
              h(Column as any, { id: "foo", isRowHeader: true, defaultWidth: 220 }, () => "Foo"),
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
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(parseFloat((headers[0]!.element as HTMLElement).style.width)).toBeCloseTo(220, 3);
    expect(parseFloat((headers[1]!.element as HTMLElement).style.width)).toBeCloseTo(390, 3);
    expect(parseFloat((headers[2]!.element as HTMLElement).style.width)).toBeCloseTo(390, 3);
  });

  it("supports static slot fractional default-width metadata", () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Slot fractional default-width table",
      },
      slots: {
        default: () => [
          h(TableHeader as any, null, {
            default: () => [
              h(Column as any, { id: "foo", isRowHeader: true, defaultWidth: "1fr" }, () => "Foo"),
              h(Column as any, { id: "bar", defaultWidth: "2fr" }, () => "Bar"),
              h(Column as any, { id: "baz", defaultWidth: "1fr" }, () => "Baz"),
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
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(parseFloat((headers[0]!.element as HTMLElement).style.width)).toBeCloseTo(250, 3);
    expect(parseFloat((headers[1]!.element as HTMLElement).style.width)).toBeCloseTo(500, 3);
    expect(parseFloat((headers[2]!.element as HTMLElement).style.width)).toBeCloseTo(250, 3);
  });

  it("supports kebab-case static slot default-width metadata", () => {
    const TemplateHarness = defineComponent({
      components: {
        TableView,
        TableHeader,
        TableBody,
        Column,
        Row,
        Cell,
      },
      template: `
        <TableView aria-label="Slot kebab default-width table">
          <TableHeader>
            <Column id="foo" is-row-header default-width="30%">Foo</Column>
            <Column id="bar">Bar</Column>
            <Column id="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row id="row-1">
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </TableView>
      `,
    });
    const wrapper = mount(TemplateHarness as any, {
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(parseFloat((headers[0]!.element as HTMLElement).style.width)).toBeCloseTo(300, 3);
    expect(parseFloat((headers[1]!.element as HTMLElement).style.width)).toBeCloseTo(350, 3);
    expect(parseFloat((headers[2]!.element as HTMLElement).style.width)).toBeCloseTo(350, 3);
  });

  it("supports kebab-case static slot column sizing metadata", () => {
    const TemplateHarness = defineComponent({
      components: {
        TableView,
        TableHeader,
        TableBody,
        Column,
        Row,
        Cell,
      },
      template: `
        <TableView aria-label="Slot kebab sizing table">
          <TableHeader>
            <Column id="foo" is-row-header width="120">Foo</Column>
            <Column id="bar" min-width="10rem">Bar</Column>
            <Column id="baz" max-width="36ch">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row id="row-1">
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </TableView>
      `,
    });
    const wrapper = mount(TemplateHarness as any, {
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect((headers[0]!.element as HTMLElement).style.width).toBe("120px");
    expect((headers[1]!.element as HTMLElement).style.minWidth).toBe("10rem");
    expect((headers[2]!.element as HTMLElement).style.maxWidth).toBe("36ch");
  });

  it("throws when static slot row cells do not match column count", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(() =>
        mount(TableView as any, {
          props: {
            "aria-label": "Invalid slot table",
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
                    ],
                  }),
                ],
              }),
            ],
          },
        })
      ).toThrow(/column count/i);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("supports static slot table cells with colSpan", () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "ColSpan table",
      },
      slots: {
        default: () => [
          h(TableHeader as any, null, {
            default: () => [
              h(Column as any, { id: "col-1", isRowHeader: true }, () => "Col 1"),
              h(Column as any, { id: "col-2" }, () => "Col 2"),
              h(Column as any, { id: "col-3" }, () => "Col 3"),
              h(Column as any, { id: "col-4" }, () => "Col 4"),
            ],
          }),
          h(TableBody as any, null, {
            default: () => [
              h(Row as any, { id: "row-1" }, {
                default: () => [
                  h(Cell as any, () => "Cell"),
                  h(Cell as any, { colSpan: 2 }, () => "Span 2"),
                  h(Cell as any, () => "Cell"),
                ],
              }),
              h(Row as any, { id: "row-2" }, {
                default: () => [
                  h(Cell as any, () => "Cell"),
                  h(Cell as any, () => "Cell"),
                  h(Cell as any, () => "Cell"),
                  h(Cell as any, () => "Cell"),
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

    const firstRowCells = bodyRows[0]!.findAll('[role="rowheader"], [role="gridcell"]');
    expect(firstRowCells).toHaveLength(3);

    const firstRowGridCells = bodyRows[0]!.findAll('[role="gridcell"]');
    expect(firstRowGridCells).toHaveLength(2);
    expect(firstRowGridCells[0]!.attributes("colspan")).toBe("2");
    expect(firstRowGridCells[0]!.attributes("aria-colspan")).toBe("2");
    expect(firstRowGridCells[0]!.attributes("aria-colindex")).toBe("2");
    expect(firstRowGridCells[1]!.attributes("aria-colindex")).toBe("4");
  });

  it("supports kebab-case static slot cell col-span metadata", () => {
    const TemplateHarness = defineComponent({
      components: {
        TableView,
        TableHeader,
        TableBody,
        Column,
        Row,
        Cell,
      },
      template: `
        <TableView aria-label="Slot kebab col-span table">
          <TableHeader>
            <Column id="foo" is-row-header>Foo</Column>
            <Column id="bar">Bar</Column>
            <Column id="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row id="row-1">
              <Cell>Foo 1</Cell>
              <Cell col-span="2">Span 2</Cell>
            </Row>
          </TableBody>
        </TableView>
      `,
    });
    const wrapper = mount(TemplateHarness as any, {
      attachTo: document.body,
    });

    const bodyRow = wrapper.get('tbody [role="row"]');
    const rowHeaders = bodyRow.findAll('[role="rowheader"]');
    const gridCells = bodyRow.findAll('[role="gridcell"]');

    expect(rowHeaders).toHaveLength(1);
    expect(gridCells).toHaveLength(1);
    expect(gridCells[0]!.text()).toContain("Span 2");
    expect(gridCells[0]!.attributes("colspan")).toBe("2");
    expect(gridCells[0]!.attributes("aria-colspan")).toBe("2");
    expect(gridCells[0]!.attributes("aria-colindex")).toBe("2");
  });

  it("supports kebab-case static slot row is-disabled metadata", async () => {
    const onSelectionChange = vi.fn();
    const TemplateHarness = defineComponent({
      components: {
        TableView,
        TableHeader,
        TableBody,
        Column,
        Row,
        Cell,
      },
      setup() {
        return {
          onSelectionChange,
        };
      },
      template: `
        <TableView
          aria-label="Slot kebab disabled-row table"
          selection-mode="single"
          selection-style="highlight"
          :on-selection-change="onSelectionChange"
        >
          <TableHeader>
            <Column id="foo" is-row-header>Foo</Column>
            <Column id="bar">Bar</Column>
          </TableHeader>
          <TableBody>
            <Row id="row-1">
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
            </Row>
            <Row id="row-2" is-disabled>
              <Cell>Foo 2</Cell>
              <Cell>Bar 2</Cell>
            </Row>
          </TableBody>
        </TableView>
      `,
    });
    const wrapper = mount(TemplateHarness as any, {
      attachTo: document.body,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[1]!);

    expect(onSelectionChange).not.toHaveBeenCalled();
    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("false");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("supports kebab-case static slot allows-sorting metadata", async () => {
    const TemplateHarness = defineComponent({
      components: {
        TableView,
        TableHeader,
        TableBody,
        Column,
        Row,
        Cell,
      },
      template: `
        <TableView aria-label="Slot kebab sortable table">
          <TableHeader>
            <Column id="foo" is-row-header allows-sorting>Foo</Column>
            <Column id="bar">Bar</Column>
          </TableHeader>
          <TableBody>
            <Row id="row-2">
              <Cell>Foo 2</Cell>
              <Cell>Bar 2</Cell>
            </Row>
            <Row id="row-1">
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
            </Row>
          </TableBody>
        </TableView>
      `,
    });
    const wrapper = mount(TemplateHarness as any, {
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers[0]!.classes()).toContain("is-sortable");

    await press(headers[0]!);

    const sortedRows = wrapper.findAll('tbody [role="row"]');
    expect(sortedRows[0]!.text()).toContain("Foo 1");
    expect(sortedRows[1]!.text()).toContain("Foo 2");
    expect(wrapper.findAll('[role="columnheader"]')[0]!.attributes("aria-sort")).toBe("ascending");
  });

  it("supports kebab-case static slot allows-resizing metadata", () => {
    const TemplateHarness = defineComponent({
      components: {
        TableView,
        TableHeader,
        TableBody,
        Column,
        Row,
        Cell,
      },
      template: `
        <TableView aria-label="Slot kebab resizable table">
          <TableHeader>
            <Column id="foo" is-row-header allows-resizing default-width="220">Foo</Column>
            <Column id="bar" default-width="390">Bar</Column>
            <Column id="baz" hide-header allows-resizing default-width="390">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row id="row-1">
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </TableView>
      `,
    });
    const wrapper = mount(TemplateHarness as any, {
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers[0]!.classes()).toContain("is-resizable");
    expect(headers[0]!.find(".spectrum-Table-columnResizer").exists()).toBe(true);
    expect(headers[1]!.classes()).not.toContain("is-resizable");
    expect(headers[1]!.find(".spectrum-Table-columnResizer").exists()).toBe(false);
    expect(headers[2]!.classes()).not.toContain("is-resizable");
    expect(headers[2]!.find(".spectrum-Table-columnResizer").exists()).toBe(false);
  });

  it("supports data-driven table cells with colSpan", () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Prop colSpan table",
        columns: columnsWithSpan,
        items: itemsWithPropSpanCells,
      },
      attachTo: document.body,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(1);

    const firstRowCells = bodyRows[0]!.findAll('[role="rowheader"], [role="gridcell"]');
    expect(firstRowCells).toHaveLength(3);

    const firstRowGridCells = bodyRows[0]!.findAll('[role="gridcell"]');
    expect(firstRowGridCells).toHaveLength(2);
    expect(firstRowGridCells[0]!.attributes("colspan")).toBe("2");
    expect(firstRowGridCells[0]!.attributes("aria-colspan")).toBe("2");
    expect(firstRowGridCells[0]!.attributes("aria-colindex")).toBe("2");
    expect(firstRowGridCells[1]!.attributes("aria-colindex")).toBe("4");
  });

  it("supports data-driven table cells with string colSpan values", () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Prop string colSpan table",
        columns: columnsWithSpan,
        items: itemsWithStringPropSpanCells,
      },
      attachTo: document.body,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(1);

    const firstRowGridCells = bodyRows[0]!.findAll('[role="gridcell"]');
    expect(firstRowGridCells).toHaveLength(2);
    expect(firstRowGridCells[0]!.attributes("colspan")).toBe("2");
    expect(firstRowGridCells[0]!.attributes("aria-colspan")).toBe("2");
    expect(firstRowGridCells[0]!.attributes("aria-colindex")).toBe("2");
    expect(firstRowGridCells[1]!.attributes("aria-colindex")).toBe("4");
  });

  it("sorts data-driven colSpan rows by trailing columns", () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Sortable prop colSpan table",
        columns: sortableColumnsWithSpan,
        items: sortableItemsWithPropSpanCells,
        defaultSortDescriptor: {
          column: "col-4",
          direction: "descending",
        },
      },
      attachTo: document.body,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.text()).toContain("Zulu");
    expect(bodyRows[1]!.text()).toContain("Alpha");
  });

  it("updates controlled sortDescriptor for data-driven colSpan rows", async () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Controlled sortable prop colSpan table",
        columns: sortableColumnsWithSpan,
        items: sortableItemsWithPropSpanCells,
        sortDescriptor: {
          column: "col-4",
          direction: "ascending",
        },
      },
      attachTo: document.body,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.text()).toContain("Alpha");
    expect(bodyRows[1]!.text()).toContain("Zulu");

    await wrapper.setProps({
      sortDescriptor: {
        column: "col-4",
        direction: "descending",
      },
    });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.text()).toContain("Zulu");
    expect(bodyRows[1]!.text()).toContain("Alpha");
  });

  it("toggles interactive sorting for data-driven colSpan rows", async () => {
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Interactive sortable prop colSpan table",
        columns: sortableColumnsWithSpan,
        items: unsortedSortableItemsWithPropSpanCells,
      },
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers).toHaveLength(4);

    await press(headers[3]!);
    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.text()).toContain("Alpha");
    expect(bodyRows[1]!.text()).toContain("Zulu");

    await press(headers[3]!);
    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.text()).toContain("Zulu");
    expect(bodyRows[1]!.text()).toContain("Alpha");
  });

  it("emits sort callbacks for interactive sorting on spanned columns", async () => {
    const onSortChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Interactive sortable callback prop colSpan table",
        columns: sortableColumnsWithSpan,
        items: unsortedSortableItemsWithPropSpanCells,
        onSortChange,
      },
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    await press(headers[3]!);
    await press(headers[3]!);

    expect(onSortChange).toHaveBeenNthCalledWith(1, {
      column: "col-4",
      direction: "ascending",
    });
    expect(onSortChange).toHaveBeenNthCalledWith(2, {
      column: "col-4",
      direction: "descending",
    });
  });

  it("emits row selection callbacks for data-driven colSpan rows", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Selectable prop colSpan table",
        columns: sortableColumnsWithSpan,
        items: unsortedSortableItemsWithPropSpanCells,
        selectionMode: "single",
        selectionStyle: "highlight",
        onSelectionChange,
      },
      attachTo: document.body,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[1]!);

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has("row-a")).toBe(true);
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

  it("disables keyboard navigation when configured", async () => {
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      isKeyboardNavigationDisabled: true,
    });

    const grid = wrapper.get('[role="grid"]');
    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    const firstRow = bodyRows[0]!.element as HTMLElement;
    firstRow.focus();
    expect(document.activeElement).toBe(firstRow);

    await bodyRows[0]!.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    expect(document.activeElement).toBe(firstRow);

    await grid.trigger("keydown", { key: "End" });
    await nextTick();
    expect(document.activeElement).toBe(firstRow);
  });

  it("applies highlight selection row class in highlight mode", () => {
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.classes()).toContain("spectrum-Table-row");
    expect(bodyRows[0]!.classes()).toContain("spectrum-Table-row--highlightSelection");
  });

  it("does not apply highlight selection row class in checkbox mode", () => {
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.classes()).toContain("spectrum-Table-row");
    expect(bodyRows[0]!.classes()).not.toContain("spectrum-Table-row--highlightSelection");
  });

  it("applies first and last row classes", () => {
    const wrapper = renderTable();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.classes()).toContain("spectrum-Table-row--firstRow");
    expect(bodyRows[0]!.classes()).not.toContain("spectrum-Table-row--lastRow");
    expect(bodyRows[1]!.classes()).toContain("spectrum-Table-row--lastRow");
    expect(bodyRows[1]!.classes()).not.toContain("spectrum-Table-row--firstRow");
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

  it("supports single highlight selection via Space key on a row", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: " " });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalled();
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-2")).toBe(true);
  });

  it("supports single highlight selection via Enter key on a row", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalled();
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-2")).toBe(true);
  });

  it("clears single highlight selection via Space key on the selected row", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      defaultSelectedKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: " " });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(0);

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("false");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("clears single highlight selection via Enter key on the selected row", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      defaultSelectedKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(0);

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("false");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("preserves single highlight selection via Space key when disallowEmptySelection is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      disallowEmptySelection: true,
      defaultSelectedKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: " " });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("false");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("preserves single highlight selection via Enter key when disallowEmptySelection is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      disallowEmptySelection: true,
      defaultSelectedKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("false");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("preserves single highlight selection via pointer when disallowEmptySelection is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      disallowEmptySelection: true,
      defaultSelectedKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[1]!);

    expect(onSelectionChange).not.toHaveBeenCalled();
    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("false");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("defers row selection until press up when shouldSelectOnPressUp is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      shouldSelectOnPressUp: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    const hasPointerEvent = typeof PointerEvent !== "undefined";
    await bodyRows[1]!.trigger(
      hasPointerEvent ? "pointerdown" : "mousedown",
      hasPointerEvent
        ? {
            button: 0,
            pointerId: 1,
            pointerType: "mouse",
          }
        : { button: 0 }
    );
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    await bodyRows[1]!.trigger(
      hasPointerEvent ? "pointerup" : "mouseup",
      hasPointerEvent
        ? {
            button: 0,
            pointerId: 1,
            pointerType: "mouse",
          }
        : { button: 0 }
    );
    await bodyRows[1]!.trigger("click", { button: 0 });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has("row-2")).toBe(true);
  });

  it("defers checkbox-style row selection until press up when shouldSelectOnPressUp is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      shouldSelectOnPressUp: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    const hasPointerEvent = typeof PointerEvent !== "undefined";
    await bodyRows[1]!.trigger(
      hasPointerEvent ? "pointerdown" : "mousedown",
      hasPointerEvent
        ? {
            button: 0,
            pointerId: 1,
            pointerType: "mouse",
          }
        : { button: 0 }
    );
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    await bodyRows[1]!.trigger(
      hasPointerEvent ? "pointerup" : "mouseup",
      hasPointerEvent
        ? {
            button: 0,
            pointerId: 1,
            pointerType: "mouse",
          }
        : { button: 0 }
    );
    await bodyRows[1]!.trigger("click", { button: 0 });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-2")).toBe(true);
  });

  it("supports shift-click pointer range selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);

    await press(bodyRows[0]!);
    onSelectionChange.mockClear();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[2]!, { shiftKey: true });

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-2", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("supports reverse shift-click pointer range selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);

    await press(bodyRows[2]!);
    onSelectionChange.mockClear();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!, { shiftKey: true });

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-2", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("skips disabled rows when shift-click selecting a pointer range", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRowsMiddleDisabled,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);

    await press(bodyRows[0]!);
    await press(bodyRows[2]!, { shiftKey: true });

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("supports multiple checkbox-style selection callbacks", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[1]!);
    await press(bodyRows[0]!);

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(true);
  });

  it("toggles checkbox-style multiple row selection on repeated presses", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const getRows = () => wrapper.findAll('tbody [role="row"]');
    expect(getRows()).toHaveLength(2);

    await press(getRows()[0]!);
    let lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(getRows()[0]!.attributes("aria-selected")).toBe("true");
    expect(getRows()[1]!.attributes("aria-selected")).toBe("false");

    await press(getRows()[1]!);
    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection?.size).toBe(2);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(true);
    expect(getRows()[0]!.attributes("aria-selected")).toBe("true");
    expect(getRows()[1]!.attributes("aria-selected")).toBe("true");

    await press(getRows()[1]!);
    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(false);
    expect(getRows()[0]!.attributes("aria-selected")).toBe("true");
    expect(getRows()[1]!.attributes("aria-selected")).toBe("false");
  });

  it("prevents clearing the last checkbox-style selection when disallowEmptySelection is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      disallowEmptySelection: true,
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    onSelectionChange.mockClear();
    await press(bodyRows[0]!);

    expect(onSelectionChange).not.toHaveBeenCalled();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("prevents clearing the last checkbox-style selection via keyboard when disallowEmptySelection is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      disallowEmptySelection: true,
      defaultSelectedKeys: new Set(["row-1"]),
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: " " });
    await nextTick();
    await bodyRows[0]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("supports checkbox-style multiple selection via Space key", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: " " });
    await nextTick();

    let lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: " " });
    await nextTick();

    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection?.size).toBe(2);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(true);

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("extends checkbox-style keyboard selection with Shift+ArrowDown", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);

    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: " " });
    await nextTick();

    let lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1"]));

    await bodyRows[0]!.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    await nextTick();

    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-2"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    await bodyRows[1]!.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    await nextTick();

    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-2", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("extends checkbox-style keyboard selection with Shift+ArrowUp", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);

    (bodyRows[2]!.element as HTMLElement).focus();
    await bodyRows[2]!.trigger("keydown", { key: " " });
    await nextTick();

    let lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-3"]));

    await bodyRows[2]!.trigger("keydown", { key: "ArrowUp", shiftKey: true });
    await nextTick();

    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-2", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    await bodyRows[1]!.trigger("keydown", { key: "ArrowUp", shiftKey: true });
    await nextTick();

    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-2", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("extends checkbox-style keyboard selection with Ctrl+Shift+Home", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);

    (bodyRows[2]!.element as HTMLElement).focus();
    await bodyRows[2]!.trigger("keydown", { key: " " });
    await nextTick();

    let lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-3"]));

    await bodyRows[2]!.trigger("keydown", { key: "Home", shiftKey: true, ctrlKey: true });
    await nextTick();

    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-2", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("extends checkbox-style keyboard selection with Ctrl+Shift+End", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(3);

    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: " " });
    await nextTick();

    let lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1"]));

    await bodyRows[0]!.trigger("keydown", { key: "End", shiftKey: true, ctrlKey: true });
    await nextTick();

    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-2", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("extends checkbox-style keyboard selection with Shift+PageDown", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithFourRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(4);

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: " " });
    await nextTick();

    onSelectionChange.mockClear();
    await bodyRows[1]!.trigger("keydown", { key: "PageDown", shiftKey: true });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-2", "row-3", "row-4"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[3]!.attributes("aria-selected")).toBe("true");
  });

  it("extends checkbox-style keyboard selection with Shift+PageUp", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithFourRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(4);

    (bodyRows[2]!.element as HTMLElement).focus();
    await bodyRows[2]!.trigger("keydown", { key: " " });
    await nextTick();

    onSelectionChange.mockClear();
    await bodyRows[2]!.trigger("keydown", { key: "PageUp", shiftKey: true });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-2", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[3]!.attributes("aria-selected")).toBe("false");
  });

  it("supports checkbox-style multiple selection via Enter key", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    let lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection?.size).toBe(2);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(true);

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("keeps checkbox-style single selection constrained to one row", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[0]!);
    let lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);

    await press(bodyRows[1]!);
    lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(false);
    expect(lastSelection?.has("row-2")).toBe(true);

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("supports selecting all rows via Ctrl+A in checkbox-style multiple selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(2);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(true);

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("supports selecting all rows via Ctrl+A with larger collections", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-2", "row-3"]));

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("supports deselecting an item after selecting all rows", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const selectAll = wrapper.get('thead input[role="checkbox"]');
    await selectAll.setValue(true);

    onSelectionChange.mockClear();
    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[1]!);

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-3"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("supports shift-click reset after selecting all rows", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const selectAll = wrapper.get('thead input[role="checkbox"]');
    await selectAll.setValue(true);

    onSelectionChange.mockClear();
    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[1]!, { shiftKey: true });

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-2"]));

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("false");
  });

  it("automatically selects newly added rows when select-all is active", async () => {
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
    });

    const selectAll = wrapper.get('thead input[role="checkbox"]');
    await selectAll.setValue(true);

    await wrapper.setProps({ items: itemsWithFourRows });
    await nextTick();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(4);
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[3]!.attributes("aria-selected")).toBe("true");
  });

  it("does not auto-select newly added rows after manual full selection", async () => {
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);
    await press(bodyRows[1]!);
    await press(bodyRows[2]!);

    await wrapper.setProps({ items: itemsWithFourRows });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(4);
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[3]!.attributes("aria-selected")).toBe("false");
  });

  it("supports clearing all rows via the select-all checkbox", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const selectAll = wrapper.get('thead input[role="checkbox"]');
    await selectAll.setValue(true);

    onSelectionChange.mockClear();
    await selectAll.setValue(false);

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set());

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("false");
  });

  it("marks the select-all checkbox as mixed when some rows are selected", async () => {
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
    });

    let selectAll = wrapper.get('thead input[role="checkbox"]');
    expect(selectAll.attributes("aria-checked")).toBe("false");

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    selectAll = wrapper.get('thead input[role="checkbox"]');
    expect(selectAll.attributes("aria-checked")).toBe("mixed");
  });

  it("does not select all rows via Ctrl+A when disallowSelectAll is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      disallowSelectAll: true,
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("does not select all rows via Ctrl+A when disallowSelectAll is true in larger collections", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      disallowSelectAll: true,
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("false");
  });

  it("does not select disabled rows when using Ctrl+A in checkbox-style multiple selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      disabledKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(false);

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("does not select disabled rows when using Ctrl+A in larger collections", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      disabledKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-3"]));

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("does not select item-level disabled rows when using Ctrl+A in checkbox-style multiple selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      items: itemsWithDisabledFlag,
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(false);

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("does not select item-level disabled rows when using Ctrl+A in larger collections", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRowsMiddleDisabled,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set(["row-1", "row-3"]));

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("does not select all rows via Ctrl+A in checkbox-style single selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("does not select all rows via Ctrl+A in checkbox-style single selection for larger collections", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "single",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("false");
  });

  it("clears checkbox-style multiple selection via Escape", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);
    await press(bodyRows[1]!);

    onSelectionChange.mockClear();

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "Escape" });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(0);

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("clears checkbox-style multiple selection via Escape in larger collections", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);
    await press(bodyRows[1]!);
    await press(bodyRows[2]!);

    onSelectionChange.mockClear();

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "Escape" });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toEqual(new Set());

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("false");
  });

  it("preserves selection on Escape when escapeKeyBehavior is none", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      escapeKeyBehavior: "none",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    onSelectionChange.mockClear();

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("preserves selection on Escape when escapeKeyBehavior is none in larger collections", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithThreeRows,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      escapeKeyBehavior: "none",
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);
    await press(bodyRows[2]!);

    onSelectionChange.mockClear();

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[2]!.attributes("aria-selected")).toBe("true");
  });

  it("does not emit selection changes on Escape when nothing is selected", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("updates aria-selected on uncontrolled pointer selection", async () => {
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.classes()).not.toContain("is-selected");
    expect(bodyRows[1]!.classes()).not.toContain("is-selected");

    await press(bodyRows[1]!);

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[0]!.classes()).not.toContain("is-selected");
    expect(bodyRows[1]!.classes()).toContain("is-selected");
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

  it("supports default selected keys in checkbox-style multiple selection", () => {
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      defaultSelectedKeys: new Set(["row-1", "row-2"]),
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
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

  it("prevents selecting disabled rows via keyboard", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      disabledKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: " " });
    await nextTick();
    await bodyRows[1]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("false");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("prevents selecting disabled rows in checkbox-style multiple selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      disabledKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[1]!);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");

    await press(bodyRows[0]!);
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(false);

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("prevents selecting disabled rows via keyboard in checkbox-style multiple selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      disabledKeys: new Set(["row-2"]),
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    (bodyRows[1]!.element as HTMLElement).focus();
    await bodyRows[1]!.trigger("keydown", { key: " " });
    await nextTick();
    await bodyRows[1]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("false");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("allows disabled-row actions when disabledBehavior is selection", async () => {
    const onAction = vi.fn();
    const wrapper = renderTable({
      items: itemsWithDisabledFlag,
      selectionMode: "none",
      disabledBehavior: "selection",
      onAction,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[1]!.attributes("aria-disabled")).toBeUndefined();

    await press(bodyRows[1]!);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("row-2");
  });

  it("allows disabled-row actions by default when disabledBehavior is omitted", async () => {
    const onAction = vi.fn();
    const wrapper = renderTable({
      items: itemsWithDisabledFlag,
      selectionMode: "single",
      selectionStyle: "highlight",
      onAction,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[1]!);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("row-2");
    expect(bodyRows[1]!.attributes("aria-disabled")).toBeUndefined();
  });

  it("disables disabled-row actions when disabledBehavior is all", async () => {
    const onAction = vi.fn();
    const wrapper = renderTable({
      items: itemsWithDisabledFlag,
      selectionMode: "none",
      disabledBehavior: "all",
      onAction,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[1]!.attributes("aria-disabled")).toBe("true");
    expect(bodyRows[1]!.classes()).toContain("is-disabled");

    await press(bodyRows[1]!);

    expect(onAction).not.toHaveBeenCalled();
  });

  it("allows disabledKeys row actions when disabledBehavior is selection", async () => {
    const onAction = vi.fn();
    const wrapper = renderTable({
      selectionMode: "none",
      disabledBehavior: "selection",
      disabledKeys: new Set(["row-2"]),
      onAction,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[1]!.attributes("aria-disabled")).toBeUndefined();

    await press(bodyRows[1]!);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("row-2");
  });

  it("allows disabledKeys row actions by default when disabledBehavior is omitted", async () => {
    const onAction = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      disabledKeys: new Set(["row-2"]),
      onAction,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[1]!);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("row-2");
    expect(bodyRows[1]!.attributes("aria-disabled")).toBeUndefined();
  });

  it("disables disabledKeys row actions when disabledBehavior is all", async () => {
    const onAction = vi.fn();
    const wrapper = renderTable({
      selectionMode: "none",
      disabledBehavior: "all",
      disabledKeys: new Set(["row-2"]),
      onAction,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[1]!.attributes("aria-disabled")).toBe("true");
    expect(bodyRows[1]!.classes()).toContain("is-disabled");

    await press(bodyRows[1]!);

    expect(onAction).not.toHaveBeenCalled();
  });

  it("updates disabled row selection behavior when disabledKeys changes", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      disabledKeys: new Set(["row-1"]),
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);
    expect(onSelectionChange).not.toHaveBeenCalled();

    await wrapper.setProps({
      disabledKeys: new Set(["row-2"]),
    });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has("row-1")).toBe(true);
  });

  it("updates disabled checkbox-style selection behavior when disabledKeys changes", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      disabledKeys: new Set(["row-1"]),
      onSelectionChange,
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);
    expect(onSelectionChange).not.toHaveBeenCalled();

    await wrapper.setProps({
      disabledKeys: new Set(["row-2"]),
    });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    let lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(false);

    onSelectionChange.mockClear();
    await press(bodyRows[1]!);
    expect(onSelectionChange).not.toHaveBeenCalled();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
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

  it("updates checkbox-style multiple selection when controlled selectedKeys changes", async () => {
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");

    await wrapper.setProps({
      selectedKeys: new Set(["row-1", "row-2"]),
    });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");

    await wrapper.setProps({
      selectedKeys: new Set(["row-2"]),
    });
    await nextTick();

    bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("updates controlled selectedKeys with numeric row keys", async () => {
    const wrapper = renderTable({
      items: itemsWithFalsyRowKey,
      selectionMode: "single",
      selectionStyle: "highlight",
      selectedKeys: new Set([0]),
    });

    let bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");

    await wrapper.setProps({
      selectedKeys: new Set([1]),
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

  it("suppresses unchanged controlled selection callbacks by default", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    expect(onSelectionChange).not.toHaveBeenCalled();

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("suppresses unchanged controlled selection keyboard callbacks by default", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: " " });
    await nextTick();
    await bodyRows[0]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("emits unchanged controlled selection callbacks when allowDuplicateSelectionEvents is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      allowDuplicateSelectionEvents: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("emits unchanged controlled selection keyboard callbacks when allowDuplicateSelectionEvents is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      allowDuplicateSelectionEvents: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: " " });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("emits unchanged controlled selection keyboard enter callbacks when allowDuplicateSelectionEvents is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "single",
      selectionStyle: "highlight",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      allowDuplicateSelectionEvents: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("suppresses unchanged controlled checkbox callbacks by default", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    expect(onSelectionChange).not.toHaveBeenCalled();

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("suppresses unchanged controlled checkbox keyboard callbacks by default", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: " " });
    await nextTick();
    await bodyRows[0]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("emits unchanged controlled checkbox callbacks when allowDuplicateSelectionEvents is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      allowDuplicateSelectionEvents: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("emits unchanged controlled checkbox keyboard callbacks when allowDuplicateSelectionEvents is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      allowDuplicateSelectionEvents: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: " " });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("emits unchanged controlled checkbox keyboard enter callbacks when allowDuplicateSelectionEvents is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      allowDuplicateSelectionEvents: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(1);
    expect(lastSelection?.has("row-1")).toBe(true);

    const nextRows = wrapper.findAll('tbody [role="row"]');
    expect(nextRows[0]!.attributes("aria-selected")).toBe("true");
    expect(nextRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("emits controlled checkbox select-all changes without mutating rendered state", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(2);
    expect(lastSelection?.has("row-1")).toBe(true);
    expect(lastSelection?.has("row-2")).toBe(true);

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("suppresses unchanged controlled checkbox select-all callbacks by default", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1", "row-2"]),
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("true");
  });

  it("emits controlled checkbox escape-clear changes without mutating rendered state", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "Escape" });
    await nextTick();

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.size).toBe(0);

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("does not emit controlled checkbox escape changes when escapeKeyBehavior is none", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      escapeKeyBehavior: "none",
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("does not emit controlled checkbox select-all changes when disallowSelectAll is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      disallowSelectAll: true,
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("true");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
  });

  it("does not emit controlled checkbox deselection when disallowEmptySelection is true", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      selectedKeys: new Set(["row-1"]),
      disallowEmptySelection: true,
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    await press(bodyRows[0]!);

    expect(onSelectionChange).not.toHaveBeenCalled();

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

  it("supports hidden and disabled root class toggles", () => {
    const wrapper = renderTable({
      isDisabled: true,
      isHidden: true,
    });

    const grid = wrapper.get('[role="grid"]');
    expect(grid.classes()).toContain("is-disabled");
    expect(grid.classes()).toContain("is-hidden");
  });

  it("suppresses row selection interactions when table is disabled", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      isDisabled: true,
      selectionMode: "single",
      selectionStyle: "highlight",
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    await press(bodyRows[0]!);

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(bodyRows[0]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[1]!.attributes("aria-selected")).toBe("false");
    expect(bodyRows[0]!.classes()).toContain("is-disabled");
    expect(bodyRows[1]!.classes()).toContain("is-disabled");
  });

  it("suppresses row actions when table is disabled", async () => {
    const onAction = vi.fn();
    const wrapper = renderTable({
      isDisabled: true,
      selectionMode: "none",
      onAction,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    await press(bodyRows[0]!);

    expect(onAction).not.toHaveBeenCalled();
  });

  it("suppresses keyboard row actions when table is disabled", async () => {
    const onAction = vi.fn();
    const wrapper = renderTable({
      isDisabled: true,
      selectionMode: "none",
      onAction,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);
    (bodyRows[0]!.element as HTMLElement).focus();
    await bodyRows[0]!.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onAction).not.toHaveBeenCalled();
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

  it("supports row id fallback when key is omitted", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithIdOnly,
      selectionMode: "single",
      selectionStyle: "highlight",
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[1]!);

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has("id-2")).toBe(true);
  });

  it("preserves empty-string row ids in selection callbacks", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: itemsWithEmptyStringId,
      selectionMode: "single",
      selectionStyle: "highlight",
      onSelectionChange,
    });

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    expect(bodyRows).toHaveLength(2);

    await press(bodyRows[0]!);

    const lastSelection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string> | undefined;
    expect(lastSelection).toBeInstanceOf(Set);
    expect(lastSelection?.has("")).toBe(true);
  });

  it("renders empty state content when no rows are present", () => {
    const wrapper = renderTable({
      items: [],
      renderEmptyState: () => "No rows",
    });

    const emptyCell = wrapper.get("tbody .react-spectrum-Table-empty");
    expect(emptyCell.text()).toContain("No rows");
    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.classes()).toContain("spectrum-Table-row");
    expect(rows[0]!.classes()).toContain("spectrum-Table-row--firstRow");
    expect(rows[0]!.classes()).toContain("spectrum-Table-row--lastRow");
  });

  it("does not emit select-all callbacks for an empty checkbox table", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: [],
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("does not emit empty select-all callbacks when duplicate events are enabled", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      items: [],
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      allowDuplicateSelectionEvents: true,
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("does not emit select-all callbacks when table is disabled", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      isDisabled: true,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("emits disabled select-all callbacks when duplicate events are enabled", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTable({
      isDisabled: true,
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      allowDuplicateSelectionEvents: true,
      onSelectionChange,
    });

    const grid = wrapper.get('[role="grid"]');
    (grid.element as HTMLElement).focus();
    await grid.trigger("keydown", { key: "a", ctrlKey: true });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const keys = onSelectionChange.mock.calls[0]?.[0] as Set<TableKey> | undefined;
    expect(keys).toBeInstanceOf(Set);
    expect(keys?.size).toBe(0);
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

  it("disables sortable header press interactions when table is disabled", async () => {
    const onSortChange = vi.fn();
    const wrapper = renderTable({
      isDisabled: true,
      onSortChange,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    await press(headers[0]!);

    expect(onSortChange).not.toHaveBeenCalled();
    expect(wrapper.findAll('[role="columnheader"]')[0]!.attributes("aria-sort")).toBe("none");
  });

  it("disables sortable header keyboard interactions when table is disabled", async () => {
    const onSortChange = vi.fn();
    const wrapper = renderTable({
      isDisabled: true,
      onSortChange,
    });

    const header = wrapper.findAll('[role="columnheader"]')[0]!;
    await header.trigger("keydown", { key: "Enter" });
    await header.trigger("keyup", { key: "Enter" });
    await nextTick();

    expect(onSortChange).not.toHaveBeenCalled();
    expect(wrapper.findAll('[role="columnheader"]')[0]!.attributes("aria-sort")).toBe("none");
  });

  it("adds sort direction info to aria-describedby on Android", async () => {
    const userAgentDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");
    const hadOwnUserAgent = Object.prototype.hasOwnProperty.call(window.navigator, "userAgent");
    let wrapper: ReturnType<typeof renderTable> | null = null;
    try {
      Object.defineProperty(window.navigator, "userAgent", {
        configurable: true,
        value: "Android",
      });

      wrapper = renderTable();
      let headers = wrapper.findAll('[role="columnheader"]');

      expect(headers[0]!.attributes("aria-sort")).toBeUndefined();
      expect(readDescriptionText(headers[0]!.attributes("aria-describedby"))).toContain("sortable column");
      expect(readDescriptionText(headers[0]!.attributes("aria-describedby"))).not.toContain("ascending");
      expect(readDescriptionText(headers[0]!.attributes("aria-describedby"))).not.toContain("descending");

      await press(headers[0]!);

      headers = wrapper.findAll('[role="columnheader"]');
      expect(headers[0]!.attributes("aria-sort")).toBeUndefined();
      expect(readDescriptionText(headers[0]!.attributes("aria-describedby"))).toContain("ascending");

      await press(headers[0]!);

      headers = wrapper.findAll('[role="columnheader"]');
      expect(headers[0]!.attributes("aria-sort")).toBeUndefined();
      expect(readDescriptionText(headers[0]!.attributes("aria-describedby"))).toContain("descending");
    } finally {
      wrapper?.unmount();
      if (userAgentDescriptor) {
        Object.defineProperty(window.navigator, "userAgent", userAgentDescriptor);
      } else if (!hadOwnUserAgent) {
        delete (window.navigator as { userAgent?: string }).userAgent;
      }
    }
  });

  it("uses kebab-case static slot cell text-value metadata for sorting", async () => {
    const TemplateHarness = defineComponent({
      components: {
        TableView,
        TableHeader,
        TableBody,
        Column,
        Row,
        Cell,
      },
      template: `
        <TableView aria-label="Slot kebab text-value sort table">
          <TableHeader>
            <Column id="foo" is-row-header allows-sorting>Foo</Column>
          </TableHeader>
          <TableBody>
            <Row id="row-1">
              <Cell text-value="a-sort">Zulu</Cell>
            </Row>
            <Row id="row-2">
              <Cell text-value="z-sort">Alpha</Cell>
            </Row>
          </TableBody>
        </TableView>
      `,
    });
    const wrapper = mount(TemplateHarness as any, {
      attachTo: document.body,
    });

    const headers = wrapper.findAll('[role="columnheader"]');
    await press(headers[0]!);

    const sortedRows = wrapper.findAll('tbody [role="row"]');
    expect(sortedRows[0]!.text()).toContain("Zulu");
    expect(sortedRows[1]!.text()).toContain("Alpha");
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

  it("applies sortable and sorted header state classes", async () => {
    const wrapper = renderTable();

    let headers = wrapper.findAll('[role="columnheader"]');
    expect(headers[0]!.classes()).toContain("is-sortable");
    expect(headers[1]!.classes()).toContain("is-sortable");
    expect(headers[2]!.classes()).not.toContain("is-sortable");
    expect(headers[0]!.classes()).not.toContain("is-sorted-asc");
    expect(headers[0]!.classes()).not.toContain("is-sorted-desc");

    await press(headers[0]!);
    headers = wrapper.findAll('[role="columnheader"]');
    expect(headers[0]!.classes()).toContain("is-sorted-asc");
    expect(headers[0]!.classes()).not.toContain("is-sorted-desc");

    await press(headers[0]!);
    headers = wrapper.findAll('[role="columnheader"]');
    expect(headers[0]!.classes()).toContain("is-sorted-desc");
    expect(headers[0]!.classes()).not.toContain("is-sorted-asc");
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
