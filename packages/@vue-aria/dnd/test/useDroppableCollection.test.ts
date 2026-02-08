import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, toValue } from "vue";
import {
  getRegisteredDropTargets,
} from "../src/DragManager";
import {
  useDroppableCollection,
  type DroppableCollectionState,
} from "../src/useDroppableCollection";
import type {
  Collection,
  CollectionNode,
  DropOperation,
  DropTarget,
  DropTargetDelegate,
  KeyboardDelegate,
} from "../src/types";
import {
  getDroppableCollectionId,
  getDroppableCollectionRef,
  setGlobalDnDState,
} from "../src/utils";
import { DataTransferMock, DragEventMock } from "./mocks";

interface DropHandlers {
  onDragenter: (event: DragEvent) => void;
  onDragover: (event: DragEvent) => void;
  onDragleave: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
}

function createState(
  operation: DropOperation = "copy"
): DroppableCollectionState {
  const state: DroppableCollectionState = {
    target: null,
    setTarget: vi.fn((target: DropTarget | null) => {
      state.target = target;
    }),
    getDropOperation: vi.fn(() => operation),
  };

  return state;
}

function createDropTargetDelegate(target: DropTarget): DropTargetDelegate {
  return {
    getDropTargetFromPoint: vi.fn((_x, _y, isValidDropTarget) =>
      isValidDropTarget(target) ? target : (null as unknown as DropTarget)
    ),
  };
}

function setupCollectionElement(): HTMLElement {
  const element = document.createElement("div");
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      x: 0,
      y: 0,
      width: 120,
      height: 80,
      right: 120,
      bottom: 80,
      toJSON: () => ({}),
    }),
  });
  return element;
}

function createCollection(): Collection {
  const nodes = new Map<string, CollectionNode>([
    [
      "a",
      {
        type: "item",
        key: "a",
        value: null,
        level: 0,
        hasChildNodes: false,
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
        index: 1,
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

function createKeyboardDelegate(): KeyboardDelegate {
  return {
    getFirstKey: () => "a",
    getLastKey: () => "b",
    getKeyBelow: (key) => (key === "a" ? "b" : null),
    getKeyAbove: (key) => (key === "b" ? "a" : null),
  };
}

function createPagedCollection(size = 6): Collection {
  const nodes = new Map<string, CollectionNode>();
  for (let i = 0; i < size; i += 1) {
    const key = `${i}`;
    nodes.set(key, {
      type: "item",
      key,
      value: null,
      level: 0,
      hasChildNodes: false,
      childNodes: [],
      rendered: key,
      textValue: key,
      index: i,
      parentKey: null,
      nextKey: i + 1 < size ? `${i + 1}` : null,
      prevKey: i > 0 ? `${i - 1}` : null,
    });
  }

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

function createPagedKeyboardDelegate(size = 6): KeyboardDelegate {
  return {
    getFirstKey: () => "0",
    getLastKey: () => `${size - 1}`,
    getKeyBelow: (key) => {
      const value = Number(key);
      return value + 1 < size ? `${value + 1}` : null;
    },
    getKeyAbove: (key) => {
      const value = Number(key);
      return value > 0 ? `${value - 1}` : null;
    },
    getKeyPageBelow: (key) => {
      const value = Number(key);
      return value + 2 < size ? `${value + 2}` : null;
    },
    getKeyPageAbove: (key) => {
      const value = Number(key);
      return value - 2 >= 0 ? `${value - 2}` : null;
    },
  };
}

describe("useDroppableCollection", () => {
  afterEach(() => {
    (getRegisteredDropTargets() as Map<HTMLElement, unknown>).clear();
    setGlobalDnDState({
      draggingCollectionRef: null,
      draggingKeys: new Set(),
      dropCollectionRef: null,
    });
  });

  it("registers collection metadata and drag manager target", async () => {
    const element = setupCollectionElement();
    const rootTarget: DropTarget = { type: "root" };
    const delegate = createDropTargetDelegate(rootTarget);
    const state = createState();

    let result: ReturnType<typeof useDroppableCollection> | undefined;
    const scope = effectScope();
    scope.run(() => {
      result = useDroppableCollection(
        {
          dropTargetDelegate: delegate,
        },
        state,
        ref(element)
      );
    });

    await nextTick();

    const collectionId = result?.collectionProps.value.id as string;
    expect(typeof collectionId).toBe("string");
    expect(collectionId.length).toBeGreaterThan(0);
    expect(getDroppableCollectionId(state)).toBe(collectionId);
    expect(toValue(getDroppableCollectionRef(state))).toBe(element);
    expect(getRegisteredDropTargets().has(element)).toBe(true);

    scope.stop();
    await nextTick();
    expect(getRegisteredDropTargets().has(element)).toBe(false);
  });

  it("routes pointer drop events through delegate target selection", () => {
    const element = setupCollectionElement();
    const rootTarget: DropTarget = { type: "root" };
    const state = createState("copy");
    const onDrop = vi.fn();

    const { collectionProps } = useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate(rootTarget),
        onDrop,
      },
      state,
      ref(element)
    );

    const handlers = collectionProps.value as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();
    dataTransfer.items.add("hello world", "text/plain");

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );

    expect(state.setTarget).toHaveBeenCalledWith(rootTarget);

    handlers.onDrop(
      new DragEventMock("drop", {
        dataTransfer,
        clientX: 2,
        clientY: 3,
      }) as unknown as DragEvent
    );

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith({
      type: "drop",
      x: 2,
      y: 3,
      target: rootTarget,
      dropOperation: "copy",
      items: [
        {
          kind: "text",
          types: new Set(["text/plain"]),
          getText: expect.any(Function),
        },
      ],
    });
  });

  it("delegates drag manager drop-operation checks to state", () => {
    const element = setupCollectionElement();
    const state = createState("copy");

    useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate({ type: "root" }),
      },
      state,
      ref(element)
    );

    const registered = getRegisteredDropTargets().get(element);
    expect(
      registered?.getDropOperation?.(new Set(["text/plain"]), ["copy", "move"])
    ).toBe("copy");
    expect(state.getDropOperation).toHaveBeenCalledWith({
      target: { type: "root" },
      types: new Set(["text/plain"]),
      allowedOperations: ["copy", "move"],
      isInternal: false,
      draggingKeys: new Set(),
    });
  });

  it("supports keyboard navigation for virtual drop targets", () => {
    const element = setupCollectionElement();
    const state = createState("copy");

    useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate({ type: "root" }),
        collection: createCollection(),
        keyboardDelegate: createKeyboardDelegate(),
      },
      state,
      ref(element)
    );

    const registered = getRegisteredDropTargets().get(element);
    expect(registered).toBeDefined();

    const drag = {
      items: [{ "text/plain": "value" }],
      allowedDropOperations: ["copy"] as DropOperation[],
    };

    registered?.onDropEnter?.({ type: "dropenter", x: 0, y: 0 }, drag);
    expect(state.target).toEqual({ type: "root" });

    registered?.onKeyDown?.(new KeyboardEvent("keydown", { key: "ArrowDown" }), drag);
    expect(state.target).toEqual({ type: "item", key: "a", dropPosition: "before" });

    registered?.onKeyDown?.(new KeyboardEvent("keydown", { key: "End" }), drag);
    expect(state.target).toEqual({ type: "item", key: "b", dropPosition: "after" });

    registered?.onKeyDown?.(new KeyboardEvent("keydown", { key: "Home" }), drag);
    expect(state.target).toEqual({ type: "root" });
  });

  it("uses default root drop handler when onDrop is not provided", () => {
    const element = setupCollectionElement();
    const rootTarget: DropTarget = { type: "root" };
    const state = createState("copy");
    const onRootDrop = vi.fn();

    const { collectionProps } = useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate(rootTarget),
        onRootDrop,
      },
      state,
      ref(element)
    );

    const handlers = collectionProps.value as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();
    dataTransfer.items.add("hello world", "text/plain");

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );
    handlers.onDrop(
      new DragEventMock("drop", {
        dataTransfer,
        clientX: 2,
        clientY: 3,
      }) as unknown as DragEvent
    );

    expect(onRootDrop).toHaveBeenCalledTimes(1);
    expect(onRootDrop).toHaveBeenCalledWith({
      items: [
        {
          kind: "text",
          types: new Set(["text/plain"]),
          getText: expect.any(Function),
        },
      ],
      dropOperation: "copy",
    });
  });

  it("filters default handlers with acceptedDragTypes", () => {
    const element = setupCollectionElement();
    const rootTarget: DropTarget = { type: "root" };
    const state = createState("copy");
    const onRootDrop = vi.fn();

    const { collectionProps } = useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate(rootTarget),
        acceptedDragTypes: ["application/json"],
        onRootDrop,
      },
      state,
      ref(element)
    );

    const handlers = collectionProps.value as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();
    dataTransfer.items.add("hello world", "text/plain");

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );
    handlers.onDrop(
      new DragEventMock("drop", {
        dataTransfer,
        clientX: 2,
        clientY: 3,
      }) as unknown as DragEvent
    );

    expect(onRootDrop).not.toHaveBeenCalled();
  });

  it("runs default internal move/reorder handlers for item drop positions", async () => {
    const element = setupCollectionElement();
    const elementRef = ref(element);
    const itemTarget: DropTarget = { type: "item", key: "b", dropPosition: "before" };
    const state = createState("move");
    const onMove = vi.fn();
    const onReorder = vi.fn();
    const onInsert = vi.fn();

    setGlobalDnDState({
      draggingCollectionRef: elementRef,
      draggingKeys: new Set(["a"]),
      dropCollectionRef: null,
    });

    const { collectionProps } = useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate(itemTarget),
        onMove,
        onReorder,
        onInsert,
      },
      state,
      elementRef
    );

    const handlers = collectionProps.value as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();
    dataTransfer.items.add("hello world", "text/plain");

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );
    handlers.onDrop(
      new DragEventMock("drop", {
        dataTransfer,
        clientX: 2,
        clientY: 3,
      }) as unknown as DragEvent
    );

    await Promise.resolve();

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith({
      keys: new Set(["a"]),
      dropOperation: "move",
      target: itemTarget,
    });
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith({
      keys: new Set(["a"]),
      dropOperation: "move",
      target: itemTarget,
    });
    expect(onInsert).not.toHaveBeenCalled();
  });

  it("respects shouldAcceptItemDrop for on-item default drops", () => {
    const element = setupCollectionElement();
    const itemTarget: DropTarget = { type: "item", key: "b", dropPosition: "on" };
    const state = createState("copy");
    const onItemDrop = vi.fn();
    const shouldAcceptItemDrop = vi.fn(() => false);

    const { collectionProps } = useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate(itemTarget),
        onItemDrop,
        shouldAcceptItemDrop,
      },
      state,
      ref(element)
    );

    const handlers = collectionProps.value as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();
    dataTransfer.items.add("hello world", "text/plain");

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );
    handlers.onDrop(
      new DragEventMock("drop", {
        dataTransfer,
        clientX: 2,
        clientY: 3,
      }) as unknown as DragEvent
    );

    expect(shouldAcceptItemDrop).toHaveBeenCalledTimes(1);
    expect(onItemDrop).not.toHaveBeenCalled();
  });

  it("supports PageUp and PageDown keyboard navigation", () => {
    const element = setupCollectionElement();
    const state = createState("copy");

    useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate({ type: "root" }),
        collection: createPagedCollection(),
        keyboardDelegate: createPagedKeyboardDelegate(),
      },
      state,
      ref(element)
    );

    const registered = getRegisteredDropTargets().get(element);
    expect(registered).toBeDefined();

    const drag = {
      items: [{ "text/plain": "value" }],
      allowedDropOperations: ["copy"] as DropOperation[],
    };

    registered?.onDropEnter?.({ type: "dropenter", x: 0, y: 0 }, drag);
    expect(state.target).toEqual({ type: "root" });

    registered?.onKeyDown?.(new KeyboardEvent("keydown", { key: "PageDown" }), drag);
    expect(state.target).toEqual({ type: "item", key: "2", dropPosition: "after" });

    registered?.onKeyDown?.(new KeyboardEvent("keydown", { key: "PageDown" }), drag);
    expect(state.target).toEqual({ type: "item", key: "4", dropPosition: "after" });

    registered?.onKeyDown?.(new KeyboardEvent("keydown", { key: "PageUp" }), drag);
    expect(state.target).toEqual({ type: "item", key: "2", dropPosition: "after" });

    registered?.onKeyDown?.(new KeyboardEvent("keydown", { key: "PageUp" }), drag);
    expect(state.target).toEqual({ type: "item", key: "0", dropPosition: "after" });

    registered?.onKeyDown?.(new KeyboardEvent("keydown", { key: "PageUp" }), drag);
    expect(state.target).toEqual({ type: "root" });
  });

  it("emits pointer drop enter/move/exit callbacks with target context", () => {
    const element = setupCollectionElement();
    const target: DropTarget = { type: "item", key: "a", dropPosition: "before" };
    const state = createState("copy");
    const onDropEnter = vi.fn();
    const onDropMove = vi.fn();
    const onDropExit = vi.fn();

    const { collectionProps } = useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate(target),
        onDropEnter,
        onDropMove,
        onDropExit,
      },
      state,
      ref(element)
    );

    const handlers = collectionProps.value as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();
    dataTransfer.items.add("hello world", "text/plain");

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );
    expect(onDropEnter).toHaveBeenCalledWith({
      type: "dropenter",
      x: 1,
      y: 1,
      target,
    });

    handlers.onDragover(
      new DragEventMock("dragover", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as DragEvent
    );
    expect(onDropMove).toHaveBeenCalledWith({
      type: "dropmove",
      x: 2,
      y: 2,
      target,
    });

    handlers.onDragleave(
      new DragEventMock("dragleave", {
        dataTransfer,
        clientX: 3,
        clientY: 3,
      }) as unknown as DragEvent
    );
    expect(onDropExit).toHaveBeenCalledWith({
      type: "dropexit",
      x: 0,
      y: 0,
      target,
    });
  });

  it("emits virtual drop enter and exit callbacks from drag manager target events", () => {
    const element = setupCollectionElement();
    const state = createState("copy");
    const onDropEnter = vi.fn();
    const onDropExit = vi.fn();

    useDroppableCollection(
      {
        dropTargetDelegate: createDropTargetDelegate({ type: "root" }),
        onDropEnter,
        onDropExit,
      },
      state,
      ref(element)
    );

    const registered = getRegisteredDropTargets().get(element);
    expect(registered).toBeDefined();

    const virtualTarget: DropTarget = { type: "item", key: "a", dropPosition: "on" };
    registered?.onDropTargetEnter?.(virtualTarget);
    expect(onDropEnter).toHaveBeenCalledWith({
      type: "dropenter",
      x: 0,
      y: 0,
      target: virtualTarget,
    });

    registered?.onDropExit?.({ type: "dropexit", x: 0, y: 0 });
    expect(onDropExit).toHaveBeenCalledWith({
      type: "dropexit",
      x: 0,
      y: 0,
      target: virtualTarget,
    });
  });
});
