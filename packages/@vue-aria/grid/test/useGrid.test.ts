import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTableState, type TableColumn, type TableRow } from "@vue-aria/table-state";
import { useGrid } from "../src";

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

describe("useGrid", () => {
  it("returns grid semantics and supports row action", () => {
    const scope = effectScope();

    scope.run(() => {
      const onRowAction = vi.fn();
      const state = useTableState({
        columns,
        collection: rows,
        selectionMode: "multiple",
      });

      const grid = useGrid(
        {
          "aria-label": "Pokemon",
          onRowAction,
        },
        state,
        ref(null)
      );

      expect(grid.gridProps.value.role).toBe("grid");
      expect(grid.gridProps.value["aria-colcount"]).toBe(2);

      state.selectionManager.setFocusedKey(2);
      (grid.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(onRowAction).toHaveBeenCalledWith(2);
    });

    scope.stop();
  });
});
