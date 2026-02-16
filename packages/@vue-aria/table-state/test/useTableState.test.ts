import { describe, expect, it, vi } from "vitest";
import type { GridNode } from "@vue-stately/grid";
import { nextTick, ref } from "vue";
import {
  TableCollection,
  UNSTABLE_useFilteredTableState,
  useTableState,
} from "../src";

function createColumn(
  key: string,
  index: number,
  props: Record<string, unknown> = {}
): GridNode<object> {
  return {
    type: "column",
    key,
    value: null,
    level: 0,
    hasChildNodes: false,
    childNodes: [],
    rendered: key,
    textValue: key,
    index,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    props,
  };
}

function createCell(
  key: string,
  index: number,
  textValue: string
): GridNode<object> {
  return {
    type: "cell",
    key,
    value: null,
    level: 1,
    hasChildNodes: false,
    childNodes: [],
    rendered: textValue,
    textValue,
    index,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    props: {},
  };
}

function createRow(
  key: string,
  index: number,
  cells: GridNode<object>[],
  textValue = ""
): GridNode<object> {
  return {
    type: "item",
    key,
    value: null,
    level: 1,
    hasChildNodes: true,
    childNodes: cells,
    rendered: null,
    textValue,
    index,
    parentKey: "body",
    prevKey: null,
    nextKey: null,
    firstChildKey: cells[0]?.key ?? null,
    lastChildKey: cells[cells.length - 1]?.key ?? null,
    props: {},
  };
}

function createBody(rows: GridNode<object>[]): GridNode<object> {
  return {
    type: "body",
    key: "body",
    value: null,
    level: 0,
    hasChildNodes: true,
    childNodes: rows,
    rendered: null,
    textValue: "",
    index: 0,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: rows[0]?.key ?? null,
    lastChildKey: rows[rows.length - 1]?.key ?? null,
    props: {},
  };
}

function createCollectionWithRows() {
  const nameColumn = createColumn("name", 0, { isRowHeader: true });
  const typeColumn = createColumn("type", 1);
  const row1 = createRow("row-1", 0, [
    createCell("row-1-name", 0, "Pikachu"),
    createCell("row-1-type", 1, "Electric"),
  ]);
  const row2 = createRow("row-2", 1, [
    createCell("row-2-name", 0, "Squirtle"),
    createCell("row-2-type", 1, "Water"),
  ]);

  return new TableCollection([nameColumn, typeColumn, createBody([row1, row2])]);
}

describe("useTableState", () => {
  it("toggles sort direction and forwards explicit direction", () => {
    const onSortChange = vi.fn();
    const state = useTableState({
      collection: createCollectionWithRows(),
      selectionMode: "single",
      sortDescriptor: {
        column: "name",
        direction: "ascending",
      },
      onSortChange,
    });

    state.sort("name");
    expect(onSortChange).toHaveBeenNthCalledWith(1, {
      column: "name",
      direction: "descending",
    });

    state.sort("type");
    expect(onSortChange).toHaveBeenNthCalledWith(2, {
      column: "type",
      direction: "ascending",
    });

    state.sort("type", "descending");
    expect(onSortChange).toHaveBeenNthCalledWith(3, {
      column: "type",
      direction: "descending",
    });
  });

  it("tracks keyboard navigation disabled state", () => {
    const emptyState = useTableState({
      collection: new TableCollection([createColumn("name", 0), createBody([])]),
      selectionMode: "none",
    });
    expect(emptyState.isKeyboardNavigationDisabled).toBe(true);

    const state = useTableState({
      collection: createCollectionWithRows(),
      selectionMode: "single",
    });
    expect(state.isKeyboardNavigationDisabled).toBe(false);
    state.setKeyboardNavigationDisabled(true);
    expect(state.isKeyboardNavigationDisabled).toBe(true);
  });

  it("passes selection flags and disabled keys through grid state", () => {
    const state = useTableState({
      collection: createCollectionWithRows(),
      selectionMode: "multiple",
      showSelectionCheckboxes: true,
      disabledKeys: ["row-2"],
    });

    expect(state.showSelectionCheckboxes).toBe(true);
    expect(state.disabledKeys.has("row-2")).toBe(true);
  });

  it("creates filtered table state with a mapped selection manager", () => {
    const state = useTableState({
      collection: createCollectionWithRows(),
      selectionMode: "single",
    });
    const filtered = UNSTABLE_useFilteredTableState(state, (textValue) =>
      textValue.includes("Pika")
    );

    expect(state.collection.size).toBe(2);
    expect(filtered.collection.size).toBe(1);
    expect([...filtered.collection].map((row) => row.key)).toStrictEqual([
      "row-1",
    ]);
    expect(filtered.selectionManager).not.toBe(state.selectionManager);
  });

  it("reacts to controlled selectedKeys getter updates", async () => {
    const selectedKeys = ref<Set<string> | undefined>(new Set(["row-1"]));
    const state = useTableState({
      collection: createCollectionWithRows(),
      selectionMode: "single",
      get selectedKeys() {
        return selectedKeys.value;
      },
    });

    expect(state.selectionManager.isSelected("row-1")).toBe(true);
    expect(state.selectionManager.isSelected("row-2")).toBe(false);

    selectedKeys.value = new Set(["row-2"]);
    await nextTick();

    expect(state.selectionManager.isSelected("row-1")).toBe(false);
    expect(state.selectionManager.isSelected("row-2")).toBe(true);
  });
});
