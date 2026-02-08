import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTableState, type TableColumn, type TableRow } from "@vue-aria/table-state";
import { useGrid, useGridCell } from "../src";

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

describe("useGridCell", () => {
  it("returns cell semantics and triggers cell action", () => {
    const scope = effectScope();

    scope.run(() => {
      const onCellAction = vi.fn();
      const state = useTableState({
        columns,
        collection: rows,
      });

      useGrid(
        {
          "aria-label": "Pokemon",
        },
        state,
        ref(null)
      );

      const row = state.collection.value.rows[0];
      const cell = useGridCell(
        {
          row,
          column: state.collection.value.columns[1],
          columnIndex: 1,
          onCellAction,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(cell.gridCellProps.value.role).toBe("gridcell");
      (cell.gridCellProps.value.onDblclick as () => void)();

      expect(onCellAction).toHaveBeenCalledWith(1, "type");
    });

    scope.stop();
  });
});
