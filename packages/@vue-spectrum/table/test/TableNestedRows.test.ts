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
