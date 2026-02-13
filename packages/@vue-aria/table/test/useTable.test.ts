import { effectScope } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { enableTableNestedRows, disableTableNestedRows } from "@vue-aria/flags";
import { createTableState } from "./helpers";
import { useTable } from "../src/useTable";
import { gridIds } from "../src/utils";

afterEach(() => {
  disableTableNestedRows();
});

describe("useTable", () => {
  it("returns grid props and sets virtualized row count including header rows", () => {
    const scope = effectScope();
    scope.run(() => {
      const state = createTableState({
        sortDescriptor: {
          column: "name",
          direction: "ascending",
        },
      });
      const ref = { current: document.createElement("table") };
      document.body.appendChild(ref.current);

      const { gridProps } = useTable(
        {
          "aria-label": "Pokemon table",
          isVirtualized: true,
        },
        state,
        ref
      );

      expect(gridProps.role).toBe("grid");
      expect(gridProps["aria-rowcount"]).toBe(
        state.collection.size + state.collection.headerRows.length
      );
      expect(typeof gridProps["aria-describedby"]).toBe("string");
      expect(gridIds.get(state)).toBe(gridProps.id);
    });
    scope.stop();
  });

  it("switches role to treegrid for tree-grid state when flag is enabled", () => {
    enableTableNestedRows();
    const scope = effectScope();
    scope.run(() => {
      const state = createTableState();
      const treeState = {
        ...state,
        expandedKeys: new Set(),
        toggleKey: () => {},
        keyMap: new Map(),
        userColumnCount: 2,
      } as any;
      const ref = { current: document.createElement("table") };
      document.body.appendChild(ref.current);

      const { gridProps } = useTable(
        {
          "aria-label": "Tree grid",
        },
        treeState,
        ref
      );

      expect(gridProps.role).toBe("treegrid");
    });
    scope.stop();
  });
});
