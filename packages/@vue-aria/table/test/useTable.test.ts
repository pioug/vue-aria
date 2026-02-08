import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTableState, type TableColumn, type TableRow } from "@vue-aria/table-state";
import { useTable } from "../src";

const columns: TableColumn[] = [
  { key: "name", textValue: "Name", isRowHeader: true },
  { key: "type", textValue: "Type", allowsSorting: true },
  { key: "level", textValue: "Level", allowsSorting: true },
];

const rows: TableRow[] = [
  {
    key: 1,
    cells: [
      { textValue: "Charizard" },
      { textValue: "Fire" },
      { textValue: "67" },
    ],
  },
  {
    key: 2,
    cells: [
      { textValue: "Squirtle" },
      { textValue: "Water" },
      { textValue: "12" },
    ],
  },
];

describe("useTable", () => {
  it("returns grid semantics", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTableState({
        columns,
        collection: rows,
        selectionMode: "multiple",
      });

      const table = useTable(
        {
          "aria-label": "Pokemon",
        },
        state,
        ref(null)
      );

      expect(table.gridProps.value.role).toBe("grid");
      expect(table.gridProps.value.id).toBeTypeOf("string");
      expect(table.gridProps.value["aria-colcount"]).toBe(3);
      expect(table.gridProps.value["aria-multiselectable"]).toBe("true");
    });

    scope.stop();
  });

  it("supports row keyboard navigation and selection", () => {
    const scope = effectScope();

    scope.run(() => {
      const onAction = vi.fn();
      const state = useTableState({
        columns,
        collection: rows,
        selectionMode: "multiple",
      });

      const table = useTable(
        {
          "aria-label": "Pokemon",
          onAction,
        },
        state,
        ref(null)
      );

      (table.gridProps.value.onFocus as (event: FocusEvent) => void)({
        type: "focus",
      } as FocusEvent);
      expect(state.selectionManager.focusedKey.value).toBe(1);

      (table.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(state.selectionManager.focusedKey.value).toBe(2);

      (table.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: " ",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(state.selectionManager.selectedKeys.value.has(2)).toBe(true);

      (table.gridProps.value.onKeydown as (event: KeyboardEvent) => void)({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(onAction).toHaveBeenCalledWith(2);
    });

    scope.stop();
  });

  it("supports typeahead focus", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTableState({
        columns,
        collection: rows,
      });

      const table = useTable(
        {
          "aria-label": "Pokemon",
        },
        state,
        ref(null)
      );

      const currentTarget = document.createElement("div");
      const target = document.createElement("div");
      currentTarget.appendChild(target);

      (table.gridProps.value.onKeydownCapture as (event: KeyboardEvent) => void)({
        key: "s",
        ctrlKey: false,
        metaKey: false,
        currentTarget,
        target,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.selectionManager.focusedKey.value).toBe(2);
    });

    scope.stop();
  });

  it("supports virtual focus with aria-activedescendant", () => {
    const scope = effectScope();

    scope.run(() => {
      const state = useTableState({
        columns,
        collection: rows,
      });

      const table = useTable(
        {
          "aria-label": "Pokemon",
          shouldUseVirtualFocus: true,
          isVirtualized: true,
        },
        state,
        ref(null)
      );

      state.selectionManager.setFocused(true);
      state.selectionManager.setFocusedKey(2);

      expect(table.gridProps.value["aria-rowcount"]).toBe(3);
      expect(table.gridProps.value["aria-activedescendant"]).toContain("row-2");
    });

    scope.stop();
  });
});
