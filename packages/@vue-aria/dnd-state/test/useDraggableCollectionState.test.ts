import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { Collection, CollectionNode, DragItem } from "@vue-aria/dnd";
import { useDraggableCollectionState } from "../src";

interface CollectionValue {
  id: string;
}

function createCollection(): Collection<CollectionValue> {
  const nodes = new Map<string, CollectionNode<CollectionValue>>([
    [
      "folder",
      {
        type: "item",
        key: "folder",
        value: { id: "folder" },
        level: 0,
        hasChildNodes: true,
        childNodes: [],
        rendered: "Folder",
        textValue: "Folder",
        index: 0,
        parentKey: null,
        nextKey: "child",
        prevKey: null,
      },
    ],
    [
      "child",
      {
        type: "item",
        key: "child",
        value: { id: "child" },
        level: 1,
        hasChildNodes: false,
        childNodes: [],
        rendered: "Child",
        textValue: "Child",
        index: 1,
        parentKey: "folder",
        nextKey: "other",
        prevKey: "folder",
      },
    ],
    [
      "other",
      {
        type: "item",
        key: "other",
        value: { id: "other" },
        level: 0,
        hasChildNodes: false,
        childNodes: [],
        rendered: "Other",
        textValue: "Other",
        index: 2,
        parentKey: null,
        nextKey: null,
        prevKey: "child",
      },
    ],
  ]);

  return {
    getItem(key) {
      return nodes.get(String(key)) ?? null;
    },
    getKeyAfter(key) {
      return nodes.get(String(key))?.nextKey ?? null;
    },
    getKeyBefore(key) {
      return nodes.get(String(key))?.prevKey ?? null;
    },
    [Symbol.iterator]() {
      return nodes.values();
    },
  };
}

describe("useDraggableCollectionState", () => {
  it("derives dragged keys from selected top-level items", () => {
    const selectedKeys = new Set(["folder", "child", "other"]);
    const setFocused = vi.fn();

    const state = useDraggableCollectionState({
      collection: createCollection(),
      selectionManager: {
        selectionMode: "multiple",
        selectedKeys,
        isDisabled: () => false,
        setFocused,
        isSelected: (key) => selectedKeys.has(String(key)),
      },
      getItems: (keys) => Array.from(keys).map((key) => ({ "text/plain": String(key) })),
    });

    state.startDrag("folder", {
      type: "dragstart",
      x: 12,
      y: 24,
    });

    expect(state.draggedKey).toBe("folder");
    expect(state.draggingKeys).toEqual(new Set(["folder", "other"]));
    expect(setFocused).toHaveBeenCalledWith(false);
    expect(state.isDragging("folder")).toBe(true);
    expect(state.isDragging("child")).toBe(false);
  });

  it("drags only the clicked key when the item is not selected", () => {
    const selectedKeys = new Set(["folder"]);

    const state = useDraggableCollectionState({
      collection: createCollection(),
      selectionManager: {
        selectionMode: "multiple",
        selectedKeys,
        isDisabled: () => false,
        setFocused: vi.fn(),
        isSelected: (key) => selectedKeys.has(String(key)),
      },
      getItems: () => [],
    });

    expect(state.getKeysForDrag("other")).toEqual(new Set(["other"]));
  });

  it("passes drag keys and item values to getItems", () => {
    const selectedKeys = ref(new Set(["folder", "child", "other"]));
    const getItems = vi.fn((_keys: Set<string | number>, items: CollectionValue[]): DragItem[] =>
      items.map((item) => ({ "text/plain": item.id }))
    );

    const state = useDraggableCollectionState({
      collection: createCollection(),
      selectionManager: {
        selectionMode: "multiple",
        selectedKeys,
        isDisabled: () => false,
        setFocused: vi.fn(),
        isSelected: (key) => selectedKeys.value.has(String(key)),
      },
      getItems,
    });

    const items = state.getItems("folder");

    expect(getItems).toHaveBeenCalledWith(
      new Set(["folder", "other"]),
      [{ id: "folder" }, { id: "other" }]
    );
    expect(items).toEqual([
      { "text/plain": "folder" },
      { "text/plain": "other" },
    ]);
  });

  it("emits move/end callbacks with current dragging keys and resets after drag end", () => {
    const selectedKeys = new Set(["folder", "other"]);
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();

    const state = useDraggableCollectionState({
      collection: createCollection(),
      selectionManager: {
        selectionMode: "multiple",
        selectedKeys,
        isDisabled: () => false,
        setFocused: vi.fn(),
        isSelected: (key) => selectedKeys.has(String(key)),
      },
      getItems: () => [],
      onDragMove,
      onDragEnd,
    });

    state.startDrag("folder", {
      type: "dragstart",
      x: 0,
      y: 0,
    });

    state.moveDrag({
      type: "dragmove",
      x: 10,
      y: 20,
    });

    expect(onDragMove).toHaveBeenCalledWith({
      type: "dragmove",
      x: 10,
      y: 20,
      keys: new Set(["folder", "other"]),
    });

    state.endDrag({
      type: "dragend",
      x: 30,
      y: 40,
      dropOperation: "copy",
      keys: new Set(["ignored"]),
      isInternal: true,
    });

    expect(onDragEnd).toHaveBeenCalledWith({
      type: "dragend",
      x: 30,
      y: 40,
      dropOperation: "copy",
      keys: new Set(["folder", "other"]),
      isInternal: true,
    });
    expect(state.draggedKey).toBeNull();
    expect(state.draggingKeys.size).toBe(0);
  });
});
