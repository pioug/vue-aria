import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { Collection, CollectionNode } from "@vue-aria/dnd";
import { useDragAndDrop } from "../src";

interface CollectionValue {
  id: string;
}

function createCollection(): Collection<CollectionValue> {
  const nodes = new Map<string, CollectionNode<CollectionValue>>([
    [
      "item-1",
      {
        type: "item",
        key: "item-1",
        value: { id: "item-1" },
        level: 0,
        hasChildNodes: false,
        childNodes: [],
        rendered: "Item 1",
        textValue: "Item 1",
        index: 0,
        parentKey: null,
        nextKey: null,
        prevKey: null,
      },
    ],
  ]);

  return {
    getItem(key) {
      return nodes.get(String(key)) ?? null;
    },
    getKeyAfter() {
      return null;
    },
    getKeyBefore() {
      return null;
    },
    [Symbol.iterator]() {
      return nodes.values();
    },
  };
}

describe("useDragAndDrop", () => {
  it("returns draggable hooks when getItems is provided", () => {
    const getItems = vi.fn(() => [{ "text/plain": "item-1" }]);
    const { dragAndDropHooks } = useDragAndDrop<CollectionValue>({
      getItems,
    });

    expect(typeof dragAndDropHooks.useDraggableCollectionState).toBe("function");
    expect(typeof dragAndDropHooks.useDraggableCollection).toBe("function");
    expect(typeof dragAndDropHooks.useDraggableItem).toBe("function");
    expect(typeof dragAndDropHooks.createDragPreviewRenderer).toBe("function");
    expect(dragAndDropHooks.useDroppableCollectionState).toBeUndefined();
    expect(typeof dragAndDropHooks.isVirtualDragging).toBe("function");
  });

  it("returns droppable hooks when drop handlers are provided", () => {
    const { dragAndDropHooks } = useDragAndDrop<CollectionValue>({
      onDrop: vi.fn(),
    });

    expect(typeof dragAndDropHooks.useDroppableCollectionState).toBe("function");
    expect(typeof dragAndDropHooks.useDroppableCollection).toBe("function");
    expect(typeof dragAndDropHooks.useDroppableItem).toBe("function");
    expect(typeof dragAndDropHooks.useDropIndicator).toBe("function");
    expect(dragAndDropHooks.useDraggableCollectionState).toBeUndefined();
    expect(typeof dragAndDropHooks.isVirtualDragging).toBe("function");
  });

  it("forwards draggable options into the state override", () => {
    const getItems = vi.fn((keys: Set<string | number>, items: CollectionValue[]) =>
      items.map((item) => ({ "text/plain": `${item.id}:${keys.size}` }))
    );
    const onDragStart = vi.fn();
    const { dragAndDropHooks } = useDragAndDrop<CollectionValue>({
      getItems,
      onDragStart,
    });

    const state = dragAndDropHooks.useDraggableCollectionState!({
      collection: createCollection(),
      selectionManager: {
        selectionMode: "single",
        selectedKeys: ref(new Set(["item-1"])),
        isDisabled: () => false,
        isSelected: (key) => String(key) === "item-1",
        setFocused: vi.fn(),
      },
    });

    expect(state.getItems("item-1")).toEqual([{ "text/plain": "item-1:1" }]);
    expect(getItems).toHaveBeenCalledWith(
      new Set(["item-1"]),
      [{ id: "item-1" }]
    );

    state.startDrag("item-1", {
      type: "dragstart",
      x: 1,
      y: 2,
    });
    expect(onDragStart).toHaveBeenCalledWith({
      type: "dragstart",
      x: 1,
      y: 2,
      keys: new Set(["item-1"]),
    });
  });

  it("forwards droppable options into the state override", () => {
    const getDropOperation = vi.fn(() => "copy" as const);
    const { dragAndDropHooks } = useDragAndDrop<CollectionValue>({
      onDrop: vi.fn(),
      getDropOperation,
    });

    const state = dragAndDropHooks.useDroppableCollectionState!({
      collection: createCollection(),
      selectionManager: {
        selectedKeys: ref(new Set()),
      },
    });

    const operation = state.getDropOperation({
      target: { type: "item", key: "item-1", dropPosition: "on" },
      types: new Set(["text/plain"]),
      allowedOperations: ["copy", "move"],
      isInternal: false,
      draggingKeys: new Set(),
    });

    expect(operation).toBe("copy");
    expect(getDropOperation).toHaveBeenCalledWith(
      { type: "item", key: "item-1", dropPosition: "on" },
      new Set(["text/plain"]),
      ["copy", "move"]
    );
  });
});
