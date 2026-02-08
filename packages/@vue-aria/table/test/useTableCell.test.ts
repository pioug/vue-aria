import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTableState, type TableColumn, type TableRow } from "@vue-aria/table-state";
import { useTable, useTableCell } from "../src";

const columns: TableColumn[] = [
  { key: "name", textValue: "Name", isRowHeader: true },
  { key: "type", textValue: "Type" },
];

const rows: TableRow[] = [
  {
    key: 1,
    cells: [{ textValue: "Charizard" }, { textValue: "Fire" }],
  },
];

describe("useTableCell", () => {
  it("returns rowheader semantics for row header columns", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTableState({
        columns,
        collection: rows,
      });

      useTable(
        {
          "aria-label": "Pokemon",
        },
        state,
        ref(null)
      );

      const row = state.collection.value.rows[0];
      const rowHeaderCell = useTableCell(
        {
          row,
          column: state.collection.value.columns[0],
          columnIndex: 0,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(rowHeaderCell.gridCellProps.value.role).toBe("rowheader");
      expect(rowHeaderCell.gridCellProps.value.id).toContain("name");

      const regularCell = useTableCell(
        {
          row,
          column: state.collection.value.columns[1],
          columnIndex: 1,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(regularCell.gridCellProps.value.role).toBe("gridcell");
      expect(regularCell.gridCellProps.value.id).toBeUndefined();
    });

    scope.stop();
  });

  it("supports colspan and cell action", () => {
    const scope = effectScope();

    scope.run(() => {
      const onAction = vi.fn();
      const state = useTableState({
        columns,
        collection: rows,
      });

      useTable(
        {
          "aria-label": "Pokemon",
        },
        state,
        ref(null)
      );

      const row = state.collection.value.rows[0];
      const cell = useTableCell(
        {
          row,
          column: state.collection.value.columns[1],
          columnIndex: 1,
          colSpan: 2,
          onAction,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(cell.gridCellProps.value["aria-colspan"]).toBe(2);

      (cell.gridCellProps.value.onDblclick as () => void)();
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    scope.stop();
  });
});
