import { describe, expect, it } from "vitest";
import { effectScope, nextTick, reactive } from "vue";
import { GridCollection, type GridNode } from "../src/GridCollection";
import { useGridState } from "../src/useGridState";

function cell(key: string, index: number): GridNode<object> {
  return {
    type: "cell",
    key,
    value: null,
    level: 1,
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
  };
}

function createCollection(rowKeys: string[]) {
  return new GridCollection({
    columnCount: 1,
    items: rowKeys.map((rowKey) => ({
      type: "item",
      key: rowKey,
      childNodes: [cell(`${rowKey}-cell`, 0)],
    })),
  });
}

describe("useGridState", () => {
  it("focuses first/last child cell in cell focus mode", () => {
    const collection = createCollection(["row-1"]);
    const state = useGridState({
      collection,
      focusMode: "cell",
      selectionMode: "single",
    });

    state.selectionManager.setFocusedKey("row-1");
    expect(state.selectionManager.focusedKey).toBe("row-1-cell");

    state.selectionManager.setFocusedKey("row-1", "last");
    expect(state.selectionManager.focusedKey).toBe("row-1-cell");
  });

  it("falls back to nearest available row when focused row is removed", async () => {
    const props = reactive({
      collection: createCollection(["row-1", "row-2"]),
      selectionMode: "single" as const,
      focusMode: "row" as const,
    });

    const scope = effectScope();
    const state = scope.run(() => useGridState(props as any))!;

    state.selectionManager.setFocusedKey("row-2");
    expect(state.selectionManager.focusedKey).toBe("row-2");

    props.collection = createCollection(["row-1"]);
    await nextTick();

    expect(state.selectionManager.focusedKey).toBe("row-1");
    scope.stop();
  });

  it("exposes disabled row keys", () => {
    const collection = createCollection(["row-1", "row-2"]);
    const state = useGridState({
      collection,
      selectionMode: "single",
      disabledKeys: ["row-2"],
    });

    expect(state.disabledKeys.has("row-2")).toBe(true);
  });
});
