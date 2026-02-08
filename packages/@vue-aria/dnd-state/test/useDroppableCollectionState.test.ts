import { describe, expect, it, vi } from "vitest";
import type {
  Collection,
  CollectionNode,
  IDragTypes,
  DropTarget,
} from "@vue-aria/dnd";
import { DIRECTORY_DRAG_TYPE } from "@vue-aria/dnd";
import { useDroppableCollectionState } from "../src";

function createCollection(): Collection {
  const nodes = new Map<string, CollectionNode>([
    [
      "a",
      {
        type: "item",
        key: "a",
        value: null,
        level: 0,
        hasChildNodes: true,
        childNodes: [],
        rendered: "A",
        textValue: "A",
        index: 0,
        parentKey: null,
        nextKey: "b",
        prevKey: null,
      },
    ],
    [
      "a-child",
      {
        type: "item",
        key: "a-child",
        value: null,
        level: 1,
        hasChildNodes: false,
        childNodes: [],
        rendered: "A Child",
        textValue: "A Child",
        index: 1,
        parentKey: "a",
        nextKey: "b",
        prevKey: "a",
      },
    ],
    [
      "b",
      {
        type: "item",
        key: "b",
        value: null,
        level: 0,
        hasChildNodes: false,
        childNodes: [],
        rendered: "B",
        textValue: "B",
        index: 2,
        parentKey: null,
        nextKey: null,
        prevKey: "a",
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

const selectionManager = {
  selectedKeys: new Set<string>(),
  isSelected: () => false,
  setFocused: () => {},
};

describe("useDroppableCollectionState", () => {
  it("emits drop enter/exit callbacks when target changes", () => {
    const onDropEnter = vi.fn();
    const onDropExit = vi.fn();

    const state = useDroppableCollectionState({
      collection: createCollection(),
      selectionManager,
      onDropEnter,
      onDropExit,
    });

    const first: DropTarget = { type: "item", key: "a", dropPosition: "on" };
    const second: DropTarget = { type: "item", key: "b", dropPosition: "on" };

    state.setTarget(first);
    expect(state.target).toEqual(first);
    expect(onDropEnter).toHaveBeenCalledWith({
      type: "dropenter",
      x: 0,
      y: 0,
      target: first,
    });

    state.setTarget(second);
    expect(onDropExit).toHaveBeenCalledWith({
      type: "dropexit",
      x: 0,
      y: 0,
      target: first,
    });
    expect(onDropEnter).toHaveBeenLastCalledWith({
      type: "dropenter",
      x: 0,
      y: 0,
      target: second,
    });
  });

  it("treats adjacent before/after targets as equivalent", () => {
    const onDropEnter = vi.fn();
    const onDropExit = vi.fn();

    const state = useDroppableCollectionState({
      collection: createCollection(),
      selectionManager,
      onDropEnter,
      onDropExit,
    });

    state.setTarget({ type: "item", key: "b", dropPosition: "before" });
    expect(
      state.isDropTarget({ type: "item", key: "a", dropPosition: "after" })
    ).toBe(true);

    state.setTarget({ type: "item", key: "a", dropPosition: "after" });
    expect(onDropEnter).toHaveBeenCalledTimes(1);
    expect(onDropExit).not.toHaveBeenCalled();
  });

  it("computes drop operations from handlers, accepted types, and target shape", () => {
    const onDrop = vi.fn();
    const state = useDroppableCollectionState({
      collection: createCollection(),
      selectionManager,
      acceptedDragTypes: ["text/plain"],
      onItemDrop: vi.fn(),
      onRootDrop: vi.fn(),
      onDrop,
    });

    expect(
      state.getDropOperation({
        target: { type: "item", key: "a", dropPosition: "on" },
        types: new Set(["text/plain"]),
        allowedOperations: ["copy", "move"],
        isInternal: false,
        draggingKeys: new Set(),
      })
    ).toBe("copy");

    expect(
      state.getDropOperation({
        target: { type: "root" },
        types: new Set(["text/plain"]),
        allowedOperations: ["copy"],
        isInternal: false,
        draggingKeys: new Set(),
      })
    ).toBe("copy");

    expect(
      state.getDropOperation({
        target: { type: "item", key: "a", dropPosition: "on" },
        types: new Set(["text/html"]),
        allowedOperations: ["copy"],
        isInternal: false,
        draggingKeys: new Set(),
      })
    ).toBe("cancel");
  });

  it("respects shouldAcceptItemDrop and internal self-drop prevention", () => {
    const denyState = useDroppableCollectionState({
      collection: createCollection(),
      selectionManager,
      acceptedDragTypes: "all",
      onItemDrop: vi.fn(),
      shouldAcceptItemDrop: () => false,
    });

    expect(
      denyState.getDropOperation({
        target: { type: "item", key: "a", dropPosition: "on" },
        types: new Set(["text/plain"]),
        allowedOperations: ["copy"],
        isInternal: false,
        draggingKeys: new Set(),
      })
    ).toBe("cancel");

    const selfDropState = useDroppableCollectionState({
      collection: createCollection(),
      selectionManager,
      acceptedDragTypes: "all",
      onItemDrop: vi.fn(),
      shouldAcceptItemDrop: () => true,
    });

    expect(
      selfDropState.getDropOperation({
        target: { type: "item", key: "a", dropPosition: "on" },
        types: new Set(["text/plain"]),
        allowedOperations: ["copy"],
        isInternal: true,
        draggingKeys: new Set(["a"]),
      })
    ).toBe("cancel");
  });

  it("supports reorder and move operation validation for internal drags", () => {
    const reorderState = useDroppableCollectionState({
      collection: createCollection(),
      selectionManager,
      acceptedDragTypes: "all",
      onReorder: vi.fn(),
    });

    expect(
      reorderState.getDropOperation({
        target: { type: "item", key: "b", dropPosition: "before" },
        types: new Set(["text/plain"]),
        allowedOperations: ["copy"],
        isInternal: true,
        draggingKeys: new Set(["a"]),
      })
    ).toBe("copy");

    expect(
      reorderState.getDropOperation({
        target: { type: "item", key: "b", dropPosition: "before" },
        types: new Set(["text/plain"]),
        allowedOperations: ["copy"],
        isInternal: true,
        draggingKeys: new Set(["a-child"]),
      })
    ).toBe("cancel");

    const moveState = useDroppableCollectionState({
      collection: createCollection(),
      selectionManager,
      acceptedDragTypes: "all",
      onMove: vi.fn(),
    });

    expect(
      moveState.getDropOperation({
        target: { type: "item", key: "b", dropPosition: "on" },
        types: new Set(["text/plain"]),
        allowedOperations: ["move", "copy"],
        isInternal: true,
        draggingKeys: new Set(["a"]),
      })
    ).toBe("move");
  });

  it("supports custom getDropOperation and directory drag type checks", () => {
    const getDropOperation = vi.fn((): "move" => "move");
    const types: IDragTypes = {
      has(type) {
        return type === DIRECTORY_DRAG_TYPE;
      },
    };

    const state = useDroppableCollectionState({
      collection: createCollection(),
      selectionManager,
      acceptedDragTypes: [DIRECTORY_DRAG_TYPE],
      onRootDrop: vi.fn(),
      getDropOperation,
    });

    expect(
      state.getDropOperation({
        target: { type: "root" },
        types,
        allowedOperations: ["copy", "move"],
        isInternal: false,
        draggingKeys: new Set(),
      })
    ).toBe("move");

    expect(getDropOperation).toHaveBeenCalledWith(
      { type: "root" },
      types,
      ["copy", "move"]
    );
  });
});
