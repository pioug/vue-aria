import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { disableTableNestedRows, enableTableNestedRows } from "@vue-aria/flags";
import { I18nProvider } from "@vue-aria/i18n";
import {
  TableView,
  type SpectrumTableColumnData,
  type SpectrumTableRowData,
} from "../src";

const columns: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true },
  { key: "bar", title: "Bar" },
  { key: "baz", title: "Baz" },
];

const multiRowHeaderColumns: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true },
  { key: "bar", title: "Bar", isRowHeader: true },
  { key: "baz", title: "Baz" },
];

const userSetRowHeaderColumns: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo" },
  { key: "bar", title: "Bar", isRowHeader: true },
  { key: "baz", title: "Baz", isRowHeader: true },
];

const nestedItems: SpectrumTableRowData[] = [
  {
    key: "row-1",
    foo: "Lvl 1 Foo 1",
    bar: "Lvl 1 Bar 1",
    baz: "Lvl 1 Baz 1",
    childRows: [
      {
        key: "row-1-1",
        foo: "Lvl 2 Foo 1",
        bar: "Lvl 2 Bar 1",
        baz: "Lvl 2 Baz 1",
      },
    ],
  },
  {
    key: "row-2",
    foo: "Lvl 1 Foo 2",
    bar: "Lvl 1 Bar 2",
    baz: "Lvl 1 Baz 2",
  },
];

const deepNestedItems: SpectrumTableRowData[] = [
  {
    key: "row-1",
    foo: "Lvl 1 Foo 1",
    bar: "Lvl 1 Bar 1",
    baz: "Lvl 1 Baz 1",
    childRows: [
      {
        key: "row-1-1",
        foo: "Lvl 2 Foo 1",
        bar: "Lvl 2 Bar 1",
        baz: "Lvl 2 Baz 1",
        childRows: [
          {
            key: "row-1-1-1",
            foo: "Lvl 3 Foo 1",
            bar: "Lvl 3 Bar 1",
            baz: "Lvl 3 Baz 1",
          },
        ],
      },
    ],
  },
];

const manyNestedItems: SpectrumTableRowData[] = [
  {
    key: "row-1-level-1",
    foo: "Row 1, Lvl 1, Foo",
    bar: "Row 1, Lvl 1, Bar",
    baz: "Row 1, Lvl 1, Baz",
    childRows: [
      {
        key: "row-1-level-2",
        foo: "Row 1, Lvl 2, Foo",
        bar: "Row 1, Lvl 2, Bar",
        baz: "Row 1, Lvl 2, Baz",
        childRows: [
          {
            key: "row-1-level-3",
            foo: "Row 1, Lvl 3, Foo",
            bar: "Row 1, Lvl 3, Bar",
            baz: "Row 1, Lvl 3, Baz",
          },
        ],
      },
    ],
  },
  {
    key: "row-2-level-1",
    foo: "Row 2, Lvl 1, Foo",
    bar: "Row 2, Lvl 1, Bar",
    baz: "Row 2, Lvl 1, Baz",
  },
  {
    key: "row-3-level-1",
    foo: "Row 3, Lvl 1, Foo",
    bar: "Row 3, Lvl 1, Bar",
    baz: "Row 3, Lvl 1, Baz",
    childRows: [
      {
        key: "row-3-level-2",
        foo: "Row 3, Lvl 2, Foo",
        bar: "Row 3, Lvl 2, Bar",
        baz: "Row 3, Lvl 2, Baz",
      },
    ],
  },
];

afterEach(() => {
  disableTableNestedRows();
});

describe("TableView nested rows", () => {
  function renderWithLocale(locale: string, props: Record<string, unknown>) {
    return mount(
      defineComponent({
        setup() {
          return () =>
            h(
              I18nProvider,
              { locale },
              () => h(TableView as any, props)
            );
        },
      }),
      { attachTo: document.body }
    );
  }

  function getCellByText(wrapper: any, text: string) {
    const match = wrapper
      .findAll('[role="columnheader"], [role="rowheader"], [role="gridcell"]')
      .find((cell: any) => cell.text().includes(text));

    if (!match) {
      throw new Error(`Unable to find table cell containing "${text}"`);
    }

    return match;
  }

  function getRowByText(wrapper: any, text: string) {
    const match = wrapper
      .findAll('tbody [role="row"]')
      .find((row: any) => row.text().includes(text));

    if (!match) {
      throw new Error(`Unable to find table row containing "${text}"`);
    }

    return match;
  }

  async function moveFocus(
    target: { trigger: (event: string, options?: Record<string, unknown>) => Promise<unknown> },
    key: string,
    options: Record<string, unknown> = {}
  ) {
    await target.trigger("keydown", { key, ...options });
    await target.trigger("keyup", { key, ...options });
    await nextTick();
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
    await target.trigger("click", {
      button: 0,
      ...options,
    });
    await nextTick();
  }

  it("renders treegrid semantics when expandable rows are enabled", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows table",
        columns,
        items: nestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_defaultExpandedKeys: ["row-1"],
      },
      attachTo: document.body,
    });

    expect(wrapper.find('[role="treegrid"]').exists()).toBe(true);

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(3);

    expect(rows[0]!.text()).toContain("Lvl 1 Foo 1");
    expect(rows[0]!.attributes("aria-level")).toBe("1");
    expect(rows[0]!.attributes("aria-expanded")).toBe("true");
    expect(rows[0]!.attributes("aria-posinset")).toBe("1");
    expect(rows[0]!.attributes("aria-setsize")).toBe("2");
    expect(rows[0]!.attributes("aria-rowindex")).toBeUndefined();

    expect(rows[1]!.text()).toContain("Lvl 2 Foo 1");
    expect(rows[1]!.attributes("aria-level")).toBe("2");
    expect(rows[1]!.attributes("aria-posinset")).toBe("1");
    expect(rows[1]!.attributes("aria-setsize")).toBe("1");
    expect(rows[1]!.attributes("aria-expanded")).toBeUndefined();
    expect(rows[1]!.attributes("aria-rowindex")).toBeUndefined();

    expect(rows[2]!.text()).toContain("Lvl 1 Foo 2");
    expect(rows[2]!.attributes("aria-level")).toBe("1");
  });

  it("toggles nested rows with keyboard arrows", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows table",
        columns,
        items: nestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_defaultExpandedKeys: ["row-1"],
      },
      attachTo: document.body,
    });

    const rootRow = wrapper.findAll('tbody [role="row"]')[0]!;
    (rootRow.element as HTMLElement).focus();
    await rootRow.trigger("focus");

    await rootRow.trigger("keydown", { key: "ArrowLeft" });
    await nextTick();

    let rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.text()).not.toContain("Lvl 2 Foo 1");

    const collapsedRoot = rows[0]!;
    await collapsedRoot.trigger("keydown", { key: "ArrowRight" });
    await nextTick();

    rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(3);
    expect(rows[1]!.text()).toContain("Lvl 2 Foo 1");
  });

  it("toggles nested rows by pressing the row expander button", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows table",
        columns,
        items: nestedItems,
        UNSTABLE_allowsExpandableRows: true,
      },
      attachTo: document.body,
    });

    expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(2);

    const firstRowExpander = wrapper
      .findAll('tbody [role="row"]')[0]!
      .get('[data-table-expander="true"]');
    expect(firstRowExpander.attributes("aria-label")).toBe("Expand");

    await firstRowExpander.trigger("click");
    await nextTick();

    expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(3);
    const expandedExpander = wrapper
      .findAll('tbody [role="row"]')[0]!
      .get('[data-table-expander="true"]');
    expect(expandedExpander.attributes("aria-label")).toBe("Collapse");

    await expandedExpander.trigger("click");
    await nextTick();

    expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(2);
  });

  it("renders row expanders only for rows that have nested children", () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows table",
        columns,
        items: nestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(3);
    expect(rows[0]!.find('[data-table-expander="true"]').exists()).toBe(true);
    expect(rows[1]!.find('[data-table-expander="true"]').exists()).toBe(false);
    expect(rows[2]!.find('[data-table-expander="true"]').exists()).toBe(false);
  });

  it("preserves row selection behavior when pressing the expander", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows table",
        columns,
        items: nestedItems,
        selectionMode: "single",
        selectionStyle: "highlight",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
      },
      attachTo: document.body,
    });

    const firstRowExpander = wrapper
      .findAll('tbody [role="row"]')[0]!
      .get('[data-table-expander="true"]');
    await firstRowExpander.trigger("click");
    await nextTick();

    expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(3);
    const firstRow = wrapper.findAll('tbody [role="row"]')[0]!;
    expect(firstRow.attributes("aria-selected")).toBe("true");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange.mock.calls[0]?.[0]).toEqual(new Set(["row-1"]));
  });

  it("localizes expander labels with locale provider", async () => {
    enableTableNestedRows();
    const wrapper = renderWithLocale("ar-AE", {
      "aria-label": "Nested rows table",
      columns,
      items: nestedItems,
      UNSTABLE_allowsExpandableRows: true,
    });

    const firstRowExpander = wrapper
      .findAll('tbody [role="row"]')[0]!
      .get('[data-table-expander="true"]');
    expect(firstRowExpander.attributes("aria-label")).toBe("مد");

    await firstRowExpander.trigger("click");
    await nextTick();

    const expandedExpander = wrapper
      .findAll('tbody [role="row"]')[0]!
      .get('[data-table-expander="true"]');
    expect(expandedExpander.attributes("aria-label")).toBe("طي");
  });

  it.each([
    { locale: "en-US", expandKey: "ArrowRight", collapseKey: "ArrowLeft" },
    { locale: "ar-AE", expandKey: "ArrowLeft", collapseKey: "ArrowRight" },
  ])(
    "supports locale-aware keyboard expansion on focused rows ($locale)",
    async ({ locale, expandKey, collapseKey }) => {
      enableTableNestedRows();
      const onExpandedChange = vi.fn();
      const wrapper = renderWithLocale(locale, {
        "aria-label": "Nested rows table",
        columns,
        items: nestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_defaultExpandedKeys: ["row-1"],
        UNSTABLE_onExpandedChange: onExpandedChange,
      });

      const row = wrapper.findAll('tbody [role="row"]')[0]!;
      (row.element as HTMLElement).focus();
      await row.trigger("focus");

      await row.trigger("keydown", { key: collapseKey });
      await nextTick();
      expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(2);
      expect(onExpandedChange).toHaveBeenCalledWith(new Set());

      await row.trigger("keydown", { key: expandKey });
      await nextTick();
      expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(3);
    }
  );

  it.each([
    { locale: "en-US", expandKey: "ArrowRight" },
    { locale: "ar-AE", expandKey: "ArrowLeft" },
  ])(
    "does not expand when arrow key is pressed from a focused row cell ($locale)",
    async ({ locale, expandKey }) => {
      enableTableNestedRows();
      const onExpandedChange = vi.fn();
      const wrapper = renderWithLocale(locale, {
        "aria-label": "Nested rows table",
        columns,
        items: nestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_onExpandedChange: onExpandedChange,
      });

      const firstCell = wrapper.findAll('tbody [role="row"]')[0]!.findAll('[role="rowheader"]')[0]!;
      (firstCell.element as HTMLElement).focus();
      await firstCell.trigger("focus");
      await firstCell.trigger("keydown", { key: expandKey });
      await nextTick();

      expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(2);
      expect(onExpandedChange).not.toHaveBeenCalled();
    }
  );

  it("supports controlled expanded keys callbacks", async () => {
    enableTableNestedRows();
    const onExpandedChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows table",
        columns,
        items: nestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: new Set(["row-1"]),
        UNSTABLE_onExpandedChange: onExpandedChange,
      },
      attachTo: document.body,
    });

    const rootRow = wrapper.findAll('tbody [role="row"]')[0]!;
    (rootRow.element as HTMLElement).focus();
    await rootRow.trigger("focus");
    await rootRow.trigger("keydown", { key: "ArrowLeft" });
    await nextTick();

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange.mock.calls[0]?.[0]).toEqual(new Set());

    await wrapper.setProps({
      UNSTABLE_expandedKeys: new Set(),
    });

    expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(2);
  });

  it("renders treegrid selection-column semantics with nested rows", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: nestedItems,
        selectionMode: "multiple",
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const treegrid = wrapper.get('[role="treegrid"]');
    expect(treegrid.attributes("aria-multiselectable")).toBe("true");
    expect(treegrid.attributes("aria-colcount")).toBe("4");

    const headerCells = wrapper.findAll('thead [role="columnheader"]');
    expect(headerCells).toHaveLength(4);
    expect(headerCells[0]!.attributes("aria-colindex")).toBe("1");
    expect(headerCells[0]!.find('[role="checkbox"]').exists()).toBe(true);
    expect(headerCells[0]!.find('[role="checkbox"]').attributes("aria-label")).toBe("Select All");

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(3);
    expect(rows[0]!.find('[role="rowheader"]').attributes("aria-colindex")).toBe("2");
    expect(rows[1]!.attributes("aria-level")).toBe("2");
  });

  it("supports selecting nested rows through row checkboxes", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const nestedRow = getRowByText(wrapper, "Row 1, Lvl 2, Foo");
    const nestedRowCheckbox = nestedRow.get('[role="checkbox"]');
    await nestedRowCheckbox.setValue(true);
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(new Set(["row-1-level-2"]));
    expect(getRowByText(wrapper, "Row 1, Lvl 2, Foo").attributes("aria-selected")).toBe("true");
  });

  it("select-all selects nested descendants", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const selectAll = wrapper.get('thead [role="checkbox"]');
    await selectAll.setValue(true);
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set([
        "row-1-level-1",
        "row-1-level-2",
        "row-1-level-3",
        "row-2-level-1",
        "row-3-level-1",
        "row-3-level-2",
      ])
    );

    const rows = wrapper.findAll('tbody [role="row"]');
    for (const row of rows) {
      expect(row.attributes("aria-selected")).toBe("true");
    }
  });

  it("select-all excludes disabled nested rows", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        disabledKeys: ["row-1-level-2"],
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const selectAll = wrapper.get('thead [role="checkbox"]');
    await selectAll.setValue(true);
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set([
        "row-1-level-1",
        "row-1-level-3",
        "row-2-level-1",
        "row-3-level-1",
        "row-3-level-2",
      ])
    );

    expect(getRowByText(wrapper, "Row 1, Lvl 2, Foo").attributes("aria-selected")).toBe("false");
  });

  it("supports selecting nested descendants by clicking row cells", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const nestedCell = getCellByText(wrapper, "Row 1, Lvl 3, Foo");
    await press(nestedCell);

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(new Set(["row-1-level-3"]));
    expect(getRowByText(wrapper, "Row 1, Lvl 3, Foo").attributes("aria-selected")).toBe("true");
  });

  it("supports selecting nested rows with Enter when a row is focused", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const nestedRow = getRowByText(wrapper, "Row 1, Lvl 2, Foo");
    (nestedRow.element as HTMLElement).focus();
    await nestedRow.trigger("focus");
    await moveFocus(nestedRow, "Enter");

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(new Set(["row-1-level-2"]));
    expect(getRowByText(wrapper, "Row 1, Lvl 2, Foo").attributes("aria-selected")).toBe("true");
  });

  it("supports selecting nested rows with Space when a row is focused", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const nestedRow = getRowByText(wrapper, "Row 1, Lvl 2, Foo");
    (nestedRow.element as HTMLElement).focus();
    await nestedRow.trigger("focus");
    await moveFocus(nestedRow, " ");

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(new Set(["row-1-level-2"]));
    expect(getRowByText(wrapper, "Row 1, Lvl 2, Foo").attributes("aria-selected")).toBe("true");
  });

  it("does not select disabled nested rows with keyboard selection keys", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        disabledKeys: ["row-1-level-2"],
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const nestedRow = getRowByText(wrapper, "Row 1, Lvl 2, Foo");
    (nestedRow.element as HTMLElement).focus();
    await nestedRow.trigger("focus");
    await moveFocus(nestedRow, "Enter");

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(getRowByText(wrapper, "Row 1, Lvl 2, Foo").attributes("aria-selected")).toBe("false");
  });

  it("supports selecting a range from a top-level row to a nested row with Shift+click", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const startCell = getCellByText(wrapper, "Row 1, Lvl 1, Foo");
    await press(startCell);
    onSelectionChange.mockReset();

    const endCell = getCellByText(wrapper, "Row 2, Lvl 1, Foo");
    await press(endCell, { shiftKey: true });

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-1", "row-1-level-2", "row-1-level-3", "row-2-level-1"])
    );
  });

  it("supports selecting a range from a nested row to its top-level ancestor with Shift+click", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const startCell = getCellByText(wrapper, "Row 1, Lvl 3, Foo");
    await press(startCell);
    onSelectionChange.mockReset();

    const endCell = getCellByText(wrapper, "Row 1, Lvl 1, Foo");
    await press(endCell, { shiftKey: true });

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-1", "row-1-level-2", "row-1-level-3"])
    );
  });

  it("supports selecting a range from a top-level row to a descendant nested row with Shift+click", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const startCell = getCellByText(wrapper, "Row 1, Lvl 1, Foo");
    await press(startCell);
    onSelectionChange.mockReset();

    const endCell = getCellByText(wrapper, "Row 1, Lvl 3, Foo");
    await press(endCell, { shiftKey: true });

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-1", "row-1-level-2", "row-1-level-3"])
    );
  });

  it("supports selecting a range from a descendant nested row to a top-level row with Shift+click", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const startCell = getCellByText(wrapper, "Row 1, Lvl 3, Foo");
    await press(startCell);
    onSelectionChange.mockReset();

    const endCell = getCellByText(wrapper, "Row 2, Lvl 1, Foo");
    await press(endCell, { shiftKey: true });

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-3", "row-2-level-1"])
    );
  });

  it("skips disabled nested rows when selecting pointer ranges with Shift+click", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows selection table",
        columns,
        items: manyNestedItems,
        disabledKeys: ["row-1-level-2"],
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const startCell = getCellByText(wrapper, "Row 1, Lvl 1, Foo");
    await press(startCell);
    onSelectionChange.mockReset();

    const endCell = getCellByText(wrapper, "Row 2, Lvl 1, Foo");
    await press(endCell, { shiftKey: true });

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-1", "row-1-level-3", "row-2-level-1"])
    );
  });

  it("extends nested selection with Shift+ArrowDown through visible descendants", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows keyboard selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const firstRow = getRowByText(wrapper, "Row 1, Lvl 1, Foo");
    (firstRow.element as HTMLElement).focus();
    await firstRow.trigger("focus");
    await moveFocus(firstRow, "Enter");
    onSelectionChange.mockReset();

    await moveFocus(firstRow, "ArrowDown", { shiftKey: true });
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-1", "row-1-level-2"])
    );

    const secondRow = getRowByText(wrapper, "Row 1, Lvl 2, Foo");
    await moveFocus(secondRow, "ArrowDown", { shiftKey: true });
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-1", "row-1-level-2", "row-1-level-3"])
    );
  });

  it("extends nested selection with Shift+ArrowUp through visible ancestors", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows keyboard selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const startRow = getRowByText(wrapper, "Row 2, Lvl 1, Foo");
    (startRow.element as HTMLElement).focus();
    await startRow.trigger("focus");
    await moveFocus(startRow, "Enter");
    onSelectionChange.mockReset();

    await moveFocus(startRow, "ArrowUp", { shiftKey: true });
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-2-level-1", "row-1-level-3"])
    );

    const thirdRow = getRowByText(wrapper, "Row 1, Lvl 3, Foo");
    await moveFocus(thirdRow, "ArrowUp", { shiftKey: true });
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-2-level-1", "row-1-level-3", "row-1-level-2"])
    );
  });

  it("extends nested selection with Ctrl+Shift+Home and Ctrl+Shift+End", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows keyboard selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const startRow = getRowByText(wrapper, "Row 2, Lvl 1, Foo");
    (startRow.element as HTMLElement).focus();
    await startRow.trigger("focus");
    await moveFocus(startRow, "Enter");
    onSelectionChange.mockReset();

    await moveFocus(startRow, "Home", { ctrlKey: true, shiftKey: true });
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-1", "row-1-level-2", "row-1-level-3", "row-2-level-1"])
    );

    const resetAnchorRow = getRowByText(wrapper, "Row 2, Lvl 1, Foo");
    await moveFocus(resetAnchorRow, "Enter");
    onSelectionChange.mockReset();

    await moveFocus(resetAnchorRow, "End", { ctrlKey: true, shiftKey: true });
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-2-level-1", "row-3-level-1", "row-3-level-2"])
    );
  });

  it("extends nested selection with Shift+PageDown", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows keyboard selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const startRow = getRowByText(wrapper, "Row 2, Lvl 1, Foo");
    (startRow.element as HTMLElement).focus();
    await startRow.trigger("focus");
    await moveFocus(startRow, "Enter");
    onSelectionChange.mockReset();

    await moveFocus(startRow, "PageDown", { shiftKey: true });
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-2-level-1", "row-3-level-1", "row-3-level-2"])
    );
  });

  it("extends nested selection with Shift+PageUp", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows keyboard selection table",
        columns,
        items: manyNestedItems,
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const startRow = getRowByText(wrapper, "Row 2, Lvl 1, Foo");
    (startRow.element as HTMLElement).focus();
    await startRow.trigger("focus");
    await moveFocus(startRow, "Enter");
    onSelectionChange.mockReset();

    await moveFocus(startRow, "PageUp", { shiftKey: true });
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-1", "row-1-level-2", "row-1-level-3", "row-2-level-1"])
    );
  });

  it("skips disabled nested rows while extending selection with Shift+ArrowDown", async () => {
    enableTableNestedRows();
    const onSelectionChange = vi.fn();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Nested rows keyboard selection table",
        columns,
        items: manyNestedItems,
        disabledKeys: ["row-1-level-2"],
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        onSelectionChange,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const firstRow = getRowByText(wrapper, "Row 1, Lvl 1, Foo");
    (firstRow.element as HTMLElement).focus();
    await firstRow.trigger("focus");
    await moveFocus(firstRow, "Enter");
    onSelectionChange.mockReset();

    await moveFocus(firstRow, "ArrowDown", { shiftKey: true });
    await moveFocus(getRowByText(wrapper, "Row 1, Lvl 2, Foo"), "ArrowDown", { shiftKey: true });

    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(
      new Set(["row-1-level-1", "row-1-level-3"])
    );
  });

  it("moves row focus down through nested rows with ArrowDown", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Many nested rows table",
        columns,
        items: manyNestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(6);

    (rows[0]!.element as HTMLElement).focus();
    await rows[0]!.trigger("focus");

    await moveFocus(rows[0]!, "ArrowDown");
    let currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[1]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 1, Lvl 2, Foo");

    await moveFocus(currentRows[1]!, "ArrowDown");
    currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[2]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 1, Lvl 3, Foo");

    await moveFocus(currentRows[2]!, "ArrowDown");
    currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[3]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 2, Lvl 1, Foo");
  });

  it("moves row focus up through nested rows with ArrowUp", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Many nested rows table",
        columns,
        items: manyNestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(6);

    (rows[5]!.element as HTMLElement).focus();
    await rows[5]!.trigger("focus");

    await moveFocus(rows[5]!, "ArrowUp");
    let currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[4]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 3, Lvl 1, Foo");

    await moveFocus(currentRows[4]!, "ArrowUp");
    currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[3]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 2, Lvl 1, Foo");

    await moveFocus(currentRows[3]!, "ArrowUp");
    currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[2]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 1, Lvl 3, Foo");
  });

  it("focuses the last nested row with End", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Many nested rows table",
        columns,
        items: manyNestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(6);

    (rows[0]!.element as HTMLElement).focus();
    await rows[0]!.trigger("focus");
    await rows[0]!.trigger("keydown", { key: "End" });
    await nextTick();

    const currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[5]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 3, Lvl 2, Foo");
  });

  it("focuses the first row from a nested row with Home", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Many nested rows table",
        columns,
        items: manyNestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(6);

    (rows[5]!.element as HTMLElement).focus();
    await rows[5]!.trigger("focus");
    await rows[5]!.trigger("keydown", { key: "Home" });
    await nextTick();

    const currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[0]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 1, Lvl 1, Foo");
  });

  it("skips collapsed child rows while navigating with ArrowDown", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Many nested rows table",
        columns,
        items: manyNestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: new Set(["row-1-level-1", "row-3-level-1"]),
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(5);
    expect(rows.some((row) => row.text().includes("Row 1, Lvl 3, Foo"))).toBe(false);

    (rows[0]!.element as HTMLElement).focus();
    await rows[0]!.trigger("focus");

    await moveFocus(rows[0]!, "ArrowDown");
    let currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[1]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 1, Lvl 2, Foo");

    await moveFocus(currentRows[1]!, "ArrowDown");
    currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[2]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 2, Lvl 1, Foo");

    await moveFocus(currentRows[2]!, "ArrowDown");
    currentRows = wrapper.findAll('tbody [role="row"]');
    expect(document.activeElement).toBe(currentRows[3]!.element);
    expect((document.activeElement as HTMLElement).textContent).toContain("Row 3, Lvl 1, Foo");
  });

  it("does not render child rows if parent keys are not expanded", async () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Deep nested table",
        columns,
        items: deepNestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: new Set(["row-1-1"]),
      },
      attachTo: document.body,
    });

    let rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.text()).toContain("Lvl 1 Foo 1");

    await wrapper.setProps({
      UNSTABLE_expandedKeys: new Set(["row-1", "row-1-1"]),
    });

    rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(3);
    expect(rows[1]!.text()).toContain("Lvl 2 Foo 1");
    expect(rows[2]!.text()).toContain("Lvl 3 Foo 1");
  });

  it("places the expander on the first row header when multiple row headers exist", () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Multi-row-header nested table",
        columns: multiRowHeaderColumns,
        items: nestedItems,
        selectionMode: "multiple",
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows.slice(0, 2)) {
      const rowHeaders = row.findAll('[role="rowheader"]');
      expect(rowHeaders).toHaveLength(2);
      expect(rowHeaders[0]!.find('[data-table-expander="true"]').exists()).toBe(true);
      expect(rowHeaders[1]!.find('[data-table-expander="true"]').exists()).toBe(false);
      expect(rowHeaders[0]!.attributes("aria-colindex")).toBe("2");
    }
  });

  it("places the expander on the first user-defined row header column", () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "User row-header nested table",
        columns: userSetRowHeaderColumns,
        items: deepNestedItems,
        UNSTABLE_allowsExpandableRows: true,
        UNSTABLE_expandedKeys: "all",
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows.slice(0, 2)) {
      const rowHeaders = row.findAll('[role="rowheader"]');
      expect(rowHeaders).toHaveLength(2);
      expect(rowHeaders[0]!.find('[data-table-expander="true"]').exists()).toBe(true);
      expect(rowHeaders[1]!.find('[data-table-expander="true"]').exists()).toBe(false);
      expect(rowHeaders[0]!.attributes("aria-colindex")).toBe("2");
    }
  });

  it("renders treegrid empty state with rowheader semantics", () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Empty nested table",
        columns,
        items: [],
        UNSTABLE_allowsExpandableRows: true,
        renderEmptyState: () => h("h3", "No results"),
      },
      attachTo: document.body,
    });

    const rows = wrapper.findAll('tbody [role="row"]');
    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    expect(row.attributes("aria-level")).toBe("1");
    expect(row.attributes("aria-posinset")).toBe("1");
    expect(row.attributes("aria-setsize")).toBe("1");
    expect(row.attributes("aria-expanded")).toBeUndefined();

    const emptyCell = row.get('[role="rowheader"]');
    expect(emptyCell.attributes("aria-colspan")).toBe("3");
    expect(emptyCell.find("h3").exists()).toBe(true);
    expect(emptyCell.text()).toContain("No results");
  });

  it("uses selection-aware colspan for treegrid empty state", () => {
    enableTableNestedRows();
    const wrapper = mount(TableView as any, {
      props: {
        "aria-label": "Empty selectable nested table",
        columns,
        items: [],
        selectionMode: "multiple",
        UNSTABLE_allowsExpandableRows: true,
        renderEmptyState: () => "No rows",
      },
      attachTo: document.body,
    });

    const emptyCell = wrapper.get('tbody [role="row"] [role="rowheader"]');
    expect(emptyCell.attributes("aria-colspan")).toBe("4");
  });
});
