import { describe, expect, it } from "vitest";
import { getItemId, listData } from "../src/utils";
import type { ListState } from "../src/types";

function createState(): ListState<unknown> {
  const collection = {
    getItem: () => null,
    getFirstKey: () => null,
    getLastKey: () => null,
    getKeyBefore: () => null,
    getKeyAfter: () => null,
    getChildren: () => [],
  } as any;

  const selectionManager = {
    selectionMode: "single",
    selectionBehavior: "toggle",
    disallowEmptySelection: false,
    selectedKeys: new Set(),
    isEmpty: true,
    isSelectAll: false,
    firstSelectedKey: null,
    lastSelectedKey: null,
    disabledKeys: new Set(),
    disabledBehavior: "all",
    isFocused: false,
    focusedKey: null,
    collection,
    isSelected: () => false,
    isSelectionEqual: () => false,
    extendSelection: () => {},
    toggleSelection: () => {},
    replaceSelection: () => {},
    setSelectedKeys: () => {},
    selectAll: () => {},
    clearSelection: () => {},
    toggleSelectAll: () => {},
    select: () => {},
    canSelectItem: () => true,
    isDisabled: () => false,
    isLink: () => false,
    getItemProps: () => ({}),
    setFocused: () => {},
    setFocusedKey: () => {},
  } as any;

  return {
    collection,
    disabledKeys: new Set(),
    selectionManager,
  } as ListState<unknown>;
}

describe("listbox utils", () => {
  it("throws for unknown list state", () => {
    const state = createState();
    expect(() => getItemId(state, "a")).toThrowError("Unknown list");
  });

  it("normalizes key spacing in generated id", () => {
    const state = createState();
    listData.set(state as ListState<unknown>, { id: "list-id" });

    expect(getItemId(state, "a b c")).toBe("list-id-option-abc");
  });
});
