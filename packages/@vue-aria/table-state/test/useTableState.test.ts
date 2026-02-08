import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useTableState } from "../src";

const columns = [
  { key: "name", textValue: "Name", isRowHeader: true },
  { key: "type", textValue: "Type" },
];

const rows = [
  {
    key: "1",
    cells: [{ textValue: "Bear" }, { textValue: "Mammal" }],
  },
  {
    key: "2",
    cells: [{ textValue: "Snake" }, { textValue: "Reptile" }],
  },
];

describe("useTableState", () => {
  it("builds table collection with row traversal and text values", () => {
    const state = useTableState({
      columns,
      collection: rows,
    });

    expect(state.collection.value.size).toBe(2);
    expect(state.collection.value.getFirstKey()).toBe("1");
    expect(state.collection.value.getLastKey()).toBe("2");
    expect(state.collection.value.getKeyAfter("1")).toBe("2");
    expect(state.collection.value.getTextValue("1")).toBe("Bear");
  });

  it("adds selection checkbox column when enabled", () => {
    const state = useTableState({
      columns,
      collection: rows,
      selectionMode: "multiple",
      showSelectionCheckboxes: true,
    });

    expect(state.showSelectionCheckboxes.value).toBe(true);
    expect(state.collection.value.columns[0]?.isSelectionCell).toBe(true);
    expect(state.collection.value.columns[1]?.key).toBe("name");
    expect(state.collection.value.getTextValue("2")).toBe("Snake");
  });

  it("selection manager respects disabled keys", () => {
    const state = useTableState({
      columns,
      collection: rows,
      selectionMode: "multiple",
      disabledKeys: ["2"],
    });

    state.selectionManager.select("1");
    state.selectionManager.select("2");

    expect(state.selectionManager.selectedKeys.value.has("1")).toBe(true);
    expect(state.selectionManager.selectedKeys.value.has("2")).toBe(false);

    state.selectionManager.select("1", "toggle");
    expect(state.selectionManager.selectedKeys.value.size).toBe(0);
  });

  it("sort toggles direction by default and supports explicit direction", () => {
    const onSortChange = vi.fn();
    const state = useTableState({
      columns,
      collection: rows,
      sortDescriptor: {
        column: "name",
        direction: "ascending",
      },
      onSortChange,
    });

    state.sort("name");
    state.sort("type");
    state.sort("type", "descending");

    expect(onSortChange).toHaveBeenNthCalledWith(1, {
      column: "name",
      direction: "descending",
    });
    expect(onSortChange).toHaveBeenNthCalledWith(2, {
      column: "type",
      direction: "ascending",
    });
    expect(onSortChange).toHaveBeenNthCalledWith(3, {
      column: "type",
      direction: "descending",
    });
  });

  it("tracks keyboard navigation disabled state", () => {
    const emptyState = useTableState({
      columns,
      collection: [],
    });
    expect(emptyState.isKeyboardNavigationDisabled.value).toBe(true);

    const state = useTableState({
      columns,
      collection: rows,
    });
    expect(state.isKeyboardNavigationDisabled.value).toBe(false);
    state.setKeyboardNavigationDisabled(true);
    expect(state.isKeyboardNavigationDisabled.value).toBe(true);
  });

  it("resets focus and prunes selection when rows are removed", async () => {
    const collection = ref(rows);
    const state = useTableState({
      columns,
      collection,
      selectionMode: "multiple",
      defaultSelectedKeys: ["2"],
    });

    state.selectionManager.setFocusedKey("2");
    expect(state.selectionManager.focusedKey.value).toBe("2");
    expect(state.selectionManager.selectedKeys.value.has("2")).toBe(true);

    collection.value = [rows[0]];
    await nextTick();

    expect(state.selectionManager.focusedKey.value).toBeNull();
    expect(state.selectionManager.selectedKeys.value.has("2")).toBe(false);
  });
});
