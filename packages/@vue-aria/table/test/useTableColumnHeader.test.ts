import { describe, expect, it } from "vitest";
import { effectScope, ref } from "vue";
import {
  useTableState,
  type SortDescriptor,
  type TableColumn,
  type TableRow,
} from "@vue-aria/table-state";
import { useTable, useTableColumnHeader } from "../src";

const columns: TableColumn[] = [
  { key: "name", textValue: "Name", isRowHeader: true },
  { key: "type", textValue: "Type", allowsSorting: true },
];

const rows: TableRow[] = [
  {
    key: 1,
    cells: [{ textValue: "Charizard" }, { textValue: "Fire" }],
  },
];

describe("useTableColumnHeader", () => {
  it("sorts sortable columns and updates aria-sort", () => {
    const scope = effectScope();

    scope.run(() => {
      const sortDescriptor = ref<SortDescriptor | null>(null);

      const state = useTableState({
        columns,
        collection: rows,
        sortDescriptor,
        onSortChange: (next) => {
          sortDescriptor.value = next;
        },
      });

      useTable(
        {
          "aria-label": "Pokemon",
        },
        state,
        ref(null)
      );

      const column = state.collection.value.columns[1];
      const header = useTableColumnHeader(
        {
          column,
          columnIndex: 1,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(header.columnHeaderProps.value["aria-sort"]).toBe("none");

      (header.columnHeaderProps.value.onClick as () => void)();
      expect(sortDescriptor.value).toEqual({
        column: "type",
        direction: "ascending",
      });
      expect(header.columnHeaderProps.value["aria-sort"]).toBe("ascending");

      (header.columnHeaderProps.value.onClick as () => void)();
      expect(sortDescriptor.value).toEqual({
        column: "type",
        direction: "descending",
      });
      expect(header.columnHeaderProps.value["aria-sort"]).toBe("descending");
    });

    scope.stop();
  });

  it("disables tab stop for empty tables", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTableState({
        columns,
        collection: [],
      });

      useTable(
        {
          "aria-label": "Pokemon",
        },
        state,
        ref(null)
      );

      const header = useTableColumnHeader(
        {
          column: state.collection.value.columns[0],
          columnIndex: 0,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(header.columnHeaderProps.value.tabIndex).toBe(-1);
    });

    scope.stop();
  });
});
