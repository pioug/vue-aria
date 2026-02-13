import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { createTableState } from "./helpers";
import { useTableCell } from "../src/useTableCell";
import { useTableColumnHeader } from "../src/useTableColumnHeader";
import { useTableHeaderRow } from "../src/useTableHeaderRow";
import { useTableRow } from "../src/useTableRow";
import {
  useTableSelectAllCheckbox,
  useTableSelectionCheckbox,
} from "../src/useTableSelectionCheckbox";
import { gridIds } from "../src/utils";

describe("table hooks", () => {
  it("returns row and cell props with row-header labelling", () => {
    const scope = effectScope();
    scope.run(() => {
      const state = createTableState();
      gridIds.set(state, "table-id");
      const rowNode = state.collection.getItem("row-1")!;
      const cellNode = state.collection.getItem("row-1-name")!;

      const row = useTableRow(
        { node: rowNode },
        state,
        { current: document.createElement("tr") }
      );
      const cell = useTableCell(
        { node: cellNode as any },
        state,
        { current: document.createElement("td") }
      );

      expect(row.rowProps["aria-labelledby"]).toBe("table-id-row-1-name");
      expect(cell.gridCellProps.role).toBe("rowheader");
      expect(cell.gridCellProps.id).toBe("table-id-row-1-name");
    });
    scope.stop();
  });

  it("returns header row props with virtualized row index", () => {
    const scope = effectScope();
    scope.run(() => {
      const state = createTableState();
      const headerRow = useTableHeaderRow(
        {
          node: state.collection.headerRows[0] as any,
          isVirtualized: true,
        },
        state,
        { current: null }
      );

      expect(headerRow.rowProps.role).toBe("row");
      expect(headerRow.rowProps["aria-rowindex"]).toBe(1);
    });
    scope.stop();
  });

  it("returns sortable column header props", () => {
    const scope = effectScope();
    scope.run(() => {
      const state = createTableState({
        sortDescriptor: { column: "name", direction: "ascending" },
      });
      gridIds.set(state, "table-id");
      const column = state.collection.columns[0];

      const result = useTableColumnHeader(
        {
          node: column,
        },
        state,
        { current: document.createElement("th") }
      );

      expect(result.columnHeaderProps.role).toBe("columnheader");
      expect(result.columnHeaderProps.id).toBe("table-id-name");
      expect(result.columnHeaderProps["aria-sort"]).toBe("ascending");
    });
    scope.stop();
  });

  it("returns row and select-all checkbox props", () => {
    const scope = effectScope();
    scope.run(() => {
      const state = createTableState();
      gridIds.set(state, "table-id");

      const rowCheckbox = useTableSelectionCheckbox({ key: "row-1" }, state);
      const selectAll = useTableSelectAllCheckbox(state);

      expect(
        String(rowCheckbox.checkboxProps["aria-labelledby"]).includes(
          "table-id-row-1-name"
        )
      ).toBe(true);
      expect(selectAll.checkboxProps["aria-label"]).toBe("Select All");
      expect(selectAll.checkboxProps.isDisabled).toBe(false);
    });
    scope.stop();
  });
});
