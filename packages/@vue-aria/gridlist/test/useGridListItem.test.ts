import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useListBoxState } from "@vue-aria/listbox";
import { useGridList, useGridListItem } from "../src";

describe("useGridListItem", () => {
  it("returns row/gridcell semantics and forwards actions", () => {
    const scope = effectScope();

    scope.run(() => {
      const onAction = vi.fn();
      const state = useListBoxState({
        collection: [
          { key: "a", textValue: "Alpha" },
          { key: "b", textValue: "Beta" },
        ],
        selectionMode: "single",
      });

      useGridList(
        {
          "aria-label": "Items",
          onAction,
          isVirtualized: true,
        },
        state,
        ref(null)
      );

      const node = state.getItem("a");
      if (!node) {
        throw new Error("Expected item a");
      }

      const item = useGridListItem(
        {
          node,
          isVirtualized: true,
          onAction,
        },
        state,
        ref(document.createElement("div"))
      );

      expect(item.rowProps.value.role).toBe("row");
      expect(item.rowProps.value["aria-rowindex"]).toBe(1);
      expect(item.gridCellProps.value.role).toBe("gridcell");

      (item.rowProps.value.onMouseDown as () => void)();
      (item.rowProps.value.onClick as () => void)();

      expect(state.selectedKeys.value.has("a")).toBe(true);
      expect(onAction).toHaveBeenCalledWith("a");
    });

    scope.stop();
  });
});
