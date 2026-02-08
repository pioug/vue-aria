import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useListBoxState } from "@vue-aria/listbox";
import { useGridList } from "../src";

describe("useGridList", () => {
  it("returns grid semantics with listbox keyboard behavior", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useListBoxState({
        collection: [
          { key: "a", textValue: "Alpha" },
          { key: "b", textValue: "Beta" },
        ],
        selectionMode: "multiple",
      });

      const gridList = useGridList(
        {
          "aria-label": "Items",
          isVirtualized: true,
        },
        state,
        ref(null)
      );

      expect(gridList.gridProps.value.role).toBe("grid");
      expect(gridList.gridProps.value["aria-colcount"]).toBe(1);
      expect(gridList.gridProps.value["aria-rowcount"]).toBe(2);

      (gridList.gridProps.value.onFocus as (event: FocusEvent) => void)({
        type: "focus",
      } as FocusEvent);

      (gridList.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.focusedKey.value).toBe("b");
    });

    scope.stop();
  });
});
