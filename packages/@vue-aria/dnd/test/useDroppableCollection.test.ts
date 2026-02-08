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
});
