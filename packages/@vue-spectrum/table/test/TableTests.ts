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

const items: SpectrumTableRowData[] = [
  { key: "row-1", foo: "Foo 1", bar: "Bar 1", baz: "Baz 1" },
  { key: "row-2", foo: "Foo 2", bar: "Bar 2", baz: "Baz 2" },
];

const itemsWithDisabledFlag: SpectrumTableRowData[] = [
  { key: "row-1", foo: "Foo 1", bar: "Bar 1", baz: "Baz 1" },
  { key: "row-2", foo: "Foo 2", bar: "Bar 2", baz: "Baz 2", isDisabled: true },
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

  it("applies default visual classes", () => {
    const wrapper = renderTable();
    const grid = wrapper.get('[role="grid"]');

    expect(grid.classes()).toContain("spectrum-Table");
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

    const bodyRows = wrapper.findAll('tbody [role="row"]');
    const firstRowCells = bodyRows[0]!.findAll('[role="gridcell"]');
    expect(firstRowCells).toHaveLength(2);
    expect(firstRowCells[0]!.classes()).toContain("spectrum-Table-cell--divider");
    expect(firstRowCells[1]!.classes()).not.toContain("spectrum-Table-cell--divider");
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
    expect(firstRowCells[0]!.classes()).toContain("spectrum-Table-cell--divider");
    expect(firstRowCells[1]!.classes()).toContain("react-spectrum-Table-cell--alignEnd");
    expect(firstRowCells[1]!.classes()).not.toContain("spectrum-Table-cell--divider");
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
