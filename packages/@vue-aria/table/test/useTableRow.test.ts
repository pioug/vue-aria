import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTableState, type TableColumn, type TableRow } from "@vue-aria/table-state";
import { useTable, useTableRow } from "../src";

const columns: TableColumn[] = [
  { key: "name", textValue: "Name", isRowHeader: true },
  { key: "type", textValue: "Type" },
];

const rows: TableRow[] = [
  {
    key: 1,
    cells: [{ textValue: "Charizard" }, { textValue: "Fire" }],
  },
  {
    key: 2,
    cells: [{ textValue: "Squirtle" }, { textValue: "Water" }],
  },
];

describe("useTableRow", () => {
  it("returns row semantics and selection behavior", () => {
    const scope = effectScope();

    scope.run(() => {
      const onTableAction = vi.fn();
      const onRowAction = vi.fn();

      const state = useTableState({
        columns,
        collection: rows,
        selectionMode: "multiple",
      });

      useTable(
        {
          "aria-label": "Pokemon",
          onAction: onTableAction,
        },
        state,
        ref(null)
      );

      const row = state.collection.value.rows[0];
      const rowHook = useTableRow(
        {
          row,
          rowIndex: 0,
          onAction: onRowAction,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(rowHook.rowProps.value.role).toBe("row");
      expect(rowHook.rowProps.value.id).toBeTypeOf("string");
      expect(rowHook.rowProps.value["aria-selected"]).toBe(false);

      (rowHook.rowProps.value.onClick as () => void)();
      expect(state.selectionManager.selectedKeys.value.has(1)).toBe(true);

      (rowHook.rowProps.value.onDblclick as () => void)();
      expect(onRowAction).toHaveBeenCalledWith(1);
      expect(onTableAction).toHaveBeenCalledWith(1);
    });

    scope.stop();
  });

  it("sets virtualized aria-rowindex", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTableState({
        columns,
        collection: rows,
      });

      useTable(
        {
          "aria-label": "Pokemon",
          isVirtualized: true,
        },
        state,
        ref(null)
      );

      const row = state.collection.value.rows[1];
      const rowHook = useTableRow(
        {
          row,
          rowIndex: 1,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(rowHook.rowProps.value["aria-rowindex"]).toBe(3);
    });

    scope.stop();
  });
});
