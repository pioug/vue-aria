import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useDraggableItem } from "../src/useDraggableItem";
import type { DropOperation } from "../src/types";
import {
  globalDndState,
  setGlobalDnDState,
  setDraggingCollectionRef,
  setDropCollectionRef,
} from "../src/utils";
import { DataTransferMock, DragEventMock } from "./mocks";

interface DragHandlers {
  onDragstart: (event: DragEvent) => void;
  onDrag: (event: DragEvent) => void;
  onDragend: (event: DragEvent) => void;
}

function createState(overrides: Record<string, unknown> = {}) {
  const startDrag = vi.fn();
  const moveDrag = vi.fn();
  const endDrag = vi.fn();

  return {
    isDisabled: false,
    selectionManager: {
      selectionMode: "multiple",
      isDisabled: () => false,
      isSelected: () => false,
    },
    collection: {
      getItem: () => ({ textValue: "Bar" }),
      getTextValue: () => "Bar",
    },
    draggingKeys: new Set(["item-1"]),
    getItems: () => [
      {
        "text/plain": "bar",
      },
    ],
    getAllowedDropOperations: (): DropOperation[] => ["copy"],
    startDrag,
    moveDrag,
    endDrag,
    getKeysForDrag: () => new Set(["item-1"]),
    ...overrides,
  };
}

describe("useDraggableItem", () => {
  afterEach(() => {
    setGlobalDnDState({
      draggingCollectionRef: null,
      draggingKeys: new Set(),
      dropCollectionRef: null,
    });
  });

  it("wires drag lifecycle and clears global state on drag end", () => {
    const sharedCollection = document.createElement("div");
    setDraggingCollectionRef(ref(sharedCollection));
    setDropCollectionRef(ref(sharedCollection));

    const state = createState();
    const { dragProps } = useDraggableItem({ key: "item-1" }, state);
    const handlers = dragProps as unknown as DragHandlers;
    const dataTransfer = new DataTransferMock();

    handlers.onDragstart(
      new DragEventMock("dragstart", {
        dataTransfer,
        clientX: 1,
        clientY: 2,
      }) as unknown as DragEvent
    );

    handlers.onDrag(
      new DragEventMock("drag", {
        dataTransfer,
        clientX: 5,
        clientY: 4,
      }) as unknown as DragEvent
    );

    dataTransfer.dropEffect = "copy";
    handlers.onDragend(
      new DragEventMock("dragend", {
        dataTransfer,
        clientX: 8,
        clientY: 6,
      }) as unknown as DragEvent
    );

    expect(state.startDrag).toHaveBeenCalledTimes(1);
    expect(state.startDrag).toHaveBeenCalledWith("item-1", {
      type: "dragstart",
      x: 1,
      y: 2,
    });
    expect(state.moveDrag).toHaveBeenCalledTimes(1);
    expect(state.moveDrag).toHaveBeenCalledWith({
      type: "dragmove",
      x: 5,
      y: 4,
    });
    expect(state.endDrag).toHaveBeenCalledTimes(1);
    expect(state.endDrag).toHaveBeenCalledWith({
      type: "dragend",
      x: 8,
      y: 6,
      dropOperation: "copy",
      keys: state.draggingKeys,
      isInternal: true,
    });

    expect(globalDndState.draggingCollectionRef).toBeNull();
    expect(globalDndState.dropCollectionRef).toBeNull();
    expect(globalDndState.draggingKeys?.size).toBe(0);
  });

  it("adds virtual drag description without drag button", async () => {
    const state = createState({
      selectionManager: {
        selectionMode: "multiple",
        isDisabled: () => false,
        isSelected: () => false,
      },
    });

    const scope = effectScope();
    let result: ReturnType<typeof useDraggableItem> | undefined;
    scope.run(() => {
      result = useDraggableItem({ key: "item-1" }, state);
    });

    await nextTick();

    const descriptionId = result?.dragProps["aria-describedby"] as string;
    expect(typeof descriptionId).toBe("string");
    expect(descriptionId.length).toBeGreaterThan(0);

    scope.stop();
  });

  it("moves interactions to drag button and sets label when hasDragButton is true", () => {
    const state = createState({
      selectionManager: {
        selectionMode: "multiple",
        isDisabled: () => false,
        isSelected: () => true,
      },
      getKeysForDrag: () => new Set(["item-1", "item-2"]),
    });

    const { dragProps, dragButtonProps } = useDraggableItem(
      { key: "item-1", hasDragButton: true },
      state
    );

    expect(dragProps).toEqual({});
    expect(typeof dragButtonProps.onDragstart).toBe("function");
    expect(dragButtonProps["aria-label"]).toBe("Drag 2 selected items");
  });

  it("returns disabled drag props when item is disabled", () => {
    const state = createState({
      selectionManager: {
        selectionMode: "multiple",
        isDisabled: () => true,
        isSelected: () => false,
      },
    });

    const { dragProps, dragButtonProps } = useDraggableItem(
      { key: "item-1", hasDragButton: true },
      state
    );

    expect(dragProps).toEqual({});
    expect(dragButtonProps.isDisabled).toBe(true);
  });

  it("supports reactive selection mode values", async () => {
    const selectionMode = ref("none");
    const state = createState({
      selectionManager: {
        selectionMode,
        isDisabled: () => false,
        isSelected: () => false,
      },
    });

    const scope = effectScope();
    let result: ReturnType<typeof useDraggableItem> | undefined;
    scope.run(() => {
      result = useDraggableItem({ key: "item-1" }, state);
    });

    await nextTick();
    expect(result?.dragProps["aria-describedby"]).toBeUndefined();
    scope.stop();
  });
});
