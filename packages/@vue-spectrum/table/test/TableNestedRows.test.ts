import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { disableTableNestedRows, enableTableNestedRows } from "@vue-aria/flags";
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

afterEach(() => {
  disableTableNestedRows();
});

describe("TableView nested rows", () => {
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
    expect(firstRowExpander.attributes("aria-label")).toBe("Expand row");

    await firstRowExpander.trigger("click");
    await nextTick();

    expect(wrapper.findAll('tbody [role="row"]')).toHaveLength(3);
    const expandedExpander = wrapper
      .findAll('tbody [role="row"]')[0]!
      .get('[data-table-expander="true"]');
    expect(expandedExpander.attributes("aria-label")).toBe("Collapse row");

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
});
