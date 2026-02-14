import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useTableMock } = vi.hoisted(() => ({
  useTableMock: vi.fn(() => ({
    gridProps: {},
  })),
}));

vi.mock("@vue-aria/table", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/table")>("@vue-aria/table");
  return {
    ...actual,
    useTable: useTableMock,
  };
});

import { TableView, type SpectrumTableColumnData, type SpectrumTableRowData } from "../src";

const columns: SpectrumTableColumnData[] = [
  { key: "foo", title: "Foo", isRowHeader: true },
  { key: "bar", title: "Bar" },
];

const items: SpectrumTableRowData[] = [
  { key: "row-1", foo: "Alpha", bar: "One" },
];

describe("TableView", () => {
  beforeEach(() => {
    useTableMock.mockClear();
  });

  it("forwards disallowTypeAhead to useTable", () => {
    mount(TableView as any, {
      props: {
        "aria-label": "Table",
        columns,
        items,
        disallowTypeAhead: true,
      },
      attachTo: document.body,
      global: {
        stubs: {
          SpectrumTableHeaderCell: true,
          SpectrumTableBodyRow: true,
        },
      },
    });

    const call = (useTableMock as any).mock.calls[0]?.[0] as Record<string, unknown> | undefined;
    expect(call?.disallowTypeAhead).toBe(true);
  });
});
