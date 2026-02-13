import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { gridIds } from "../src/utils";
import { createTableState } from "./helpers";

const { useGridRowMock } = vi.hoisted(() => ({
  useGridRowMock: vi.fn(() => ({
    rowProps: { role: "row", tabIndex: 0 },
    isPressed: false,
    isSelected: false,
    isFocused: false,
    isDisabled: false,
    allowsSelection: true,
    hasAction: true,
  })),
}));

vi.mock("@vue-aria/grid", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/grid")>(
    "@vue-aria/grid"
  );
  return {
    ...actual,
    useGridRow: useGridRowMock,
  };
});

import { useTableRow } from "../src/useTableRow";

describe("useTable backward compatibility", () => {
  it("forwards legacy row onAction prop to grid row behavior", () => {
    const scope = effectScope();
    scope.run(() => {
      const state = createTableState({
        selectionMode: "multiple",
        selectionBehavior: "replace",
      });
      gridIds.set(state, "table-id");
      const rowNode = state.collection.getItem("row-1")!;
      const onAction = vi.fn();
      const ref = { current: document.createElement("tr") as HTMLElement | null };

      const result = useTableRow(
        {
          node: rowNode,
          onAction,
        },
        state,
        ref
      );

      expect(useGridRowMock).toHaveBeenCalledWith(
        expect.objectContaining({
          node: rowNode,
          onAction,
        }),
        state,
        ref
      );
      expect(result.rowProps.role).toBe("row");
      expect(result.rowProps["aria-labelledby"]).toBe("table-id-row-1-name");
    });
    scope.stop();
  });
});
